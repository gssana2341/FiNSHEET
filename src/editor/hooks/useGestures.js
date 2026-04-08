import { useEffect, useCallback, useRef } from "react";

/**
 * useGestures Hook
 * Manages specialized interactions like "Pen-only" mode for iPads.
 */
export function useGestures(engine, options = {}) {
  const { penOnlyMode = true, activeTool, onPenDetected } = options;

  const activePointerRef = useRef(null);
  const touchCountRef = useRef(0);

  useEffect(() => {
    if (!engine || !engine.canvas) return;
    const canvas = engine.canvas;

    const remoteLog = (msg) => {
      // Disabled for production/cleanliness
      // console.log(msg); 
      // if (window.ReactNativeWebView) {
      //   window.ReactNativeWebView.postMessage(
      //     JSON.stringify({ type: "LOG", message: msg }),
      //   );
      // }
    };

    // Initial Connection Check (v41 - Pointer Reset Fix)
    remoteLog("--- Bridge Connected: Pro Gesture Engine Active (v41.0) ---");

    // CRITICAL: Tell Fabric to allow touch events to bubble for panning
    canvas.allowTouchScrolling = true;
    canvas.stopContextMenu = false;

    // TARGET THE UPPER CANVAS
    const el = canvas.upperCanvasEl;
    if (!el) return;

    // Initial state
    el.style.touchAction = penOnlyMode ? "pan-x pan-y" : "none";

    const onNativeInteractionCapture = (e) => {
      // SAFETY GATE: Ensure engine and canvas are still valid
      if (!engine || !engine.canvas || !engine.toolManager) return;

      // 1. TOOL & INPUT ANALYSIS
      const isPointerPen =
        e.pointerType === "pen" ||
        (e.type === "pointerdown" && e.pressure > 0.1);
      const isLegacyPen =
        e.touches && e.touches[0] && e.touches[0].touchType === "stylus";
      const isActuallyPen = isPointerPen || isLegacyPen;
      const isMultiTouch = touchCountRef.current > 1 || (e.touches && e.touches.length > 1);

      const toolId = engine.toolManager.activeToolId;
      const isDrawingTool =
        toolId === "pen" ||
        toolId === "highlighter" ||
        (toolId === "eraser" &&
          engine.toolManager.activeTool?.type === "partial");

      // 2. STYLUS TRACKING (CRITICAL: Always track pen state even in Normal Mode)
      if (isActuallyPen) {
        activePointerRef.current = e.pointerId || "verified-stylus";
        if (onPenDetected) onPenDetected();
      }

      // ---------------------------------------------------------
      // CASE A: NORMAL MODE (v39 - PENCIL BUG FIXED)
      // ---------------------------------------------------------
      if (!penOnlyMode) {
        if (isMultiTouch) {
          canvas.isDrawingMode = false;
          el.style.touchAction = "pan-x pan-y";
          return;
        }

        // Just basic tool-based switching
        canvas.isDrawingMode = isDrawingTool;
        el.style.touchAction = isDrawingTool ? "none" : "pan-x pan-y";

        // Prevent browser jitter if drawing.
        if (isDrawingTool && e.cancelable) e.preventDefault();
        return;
      }

      // ---------------------------------------------------------
      // CASE B: PRO PEN MODE (Strict Palm Rejection)
      // ---------------------------------------------------------
      const isPenAlreadyActive = activePointerRef.current !== null;

      // CASE 1: MULTI-TOUCH (ALWAYS PAN/ZOOM)
      if (isMultiTouch) {
        activePointerRef.current = null;
        canvas.isDrawingMode = false;
        canvas.selection = false;
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        el.style.touchAction = "pan-x pan-y";
        return; 
      }

      // CASE 2: PEN INPUT
      if (isActuallyPen) {
        // Pointer state already updated in Analysis section
        canvas.isDrawingMode = isDrawingTool;
        canvas.selection = toolId === 'lasso';
        el.style.touchAction = "none";
        return;
      }

      // CASE 3: SINGLE FINGER (PALM REJECTION / SMART PAN)
      if (isPenAlreadyActive) {
        // Suppress palm interference while drawing with pen
        e.stopImmediatePropagation();
        e.stopPropagation();
        if (e.cancelable) e.preventDefault();
      } else {
        // Smart pan for finger
        el.style.touchAction = "pan-x pan-y";
        canvas.isDrawingMode = false;
        canvas.selection = false;
        canvas.discardActiveObject();
        canvas.requestRenderAll();
      }
    };

    const onNativeInteractionBubble = (e) => {
      // SAFETY GATE
      if (!engine || !engine.toolManager) return;

      const isPointerPen =
        e.pointerType === "pen" ||
        (e.type === "pointerdown" && e.pressure > 0.1);
      const isLegacyPen =
        e.touches && e.touches[0] && e.touches[0].touchType === "stylus";
      const isActuallyPen = isPointerPen || isLegacyPen;
      const isMultiTouch = touchCountRef.current > 1 || (e.touches && e.touches.length > 1);

      const toolId = engine.toolManager.activeToolId;
      const isInteractiveTool = ['pen', 'highlighter', 'eraser', 'lasso', 'text', 'rectangle', 'circle', 'line', 'shape'].includes(toolId);

      if (e.type === "pointerdown" || e.type === "touchstart") {
        // ALWAYS let multi-touch events bubble so we can pan/zoom
        if (isMultiTouch) return;

        if (penOnlyMode) {
          if (isActuallyPen) {
            remoteLog(`[v40] PEN EVENT STOPPED (${e.type})`);
            e.stopPropagation();
          }
        } else {
          // NORMAL MODE: Stop propagation if using pen OR drawing tool (finger)
          if (isActuallyPen || isInteractiveTool) {
             remoteLog(`[v40] INTERACTIVE EVENT STOPPED (${e.type})`);
             e.stopPropagation();
          }
        }
      }
    };

    const resetPointerState = (e) => {
      // Unconditional reset if no event
      if (!e) {
        activePointerRef.current = null;
        return;
      }

      // If all touches are off the screen, it's completely safe to reset
      if (e.touches && e.touches.length === 0) {
        activePointerRef.current = null;
        return;
      }

      // If the specific pointer that was active is lifted
      if (e.pointerId && activePointerRef.current === e.pointerId) {
        activePointerRef.current = null;
        return;
      }

      // Fallback: If we were tracking a legacy stylus but the event is a general end/cancel, clear it if matches
      if (
        activePointerRef.current === "verified-stylus" && 
        (e.type === "pointerup" || e.type === "touchend" || e.type.includes("cancel")) &&
        (!e.touches || e.touches.length === 0)
      ) {
        activePointerRef.current = null;
      }
    };

    // 3. NUCLEAR FABRIC GUARD (Engine Level)
    const handleFabricBeforeEvent = (opt) => {
      if (!penOnlyMode) return;

      const isPenAllowed = activePointerRef.current !== null;
      if (!isPenAllowed) {
        remoteLog(`[v32] ENGINE GUARD: SUPPRESSING FINGER`);
        canvas.isDrawingMode = false;
        canvas.selection = false;
        if (canvas._currentTransform) canvas._currentTransform = null;
        canvas.discardActiveObject();
        canvas.requestRenderAll();
      }
    };

    // TRACK TOUCH COUNT FOR IPAD (v32)
    const updateTouchCount = (e) => {
      if (e.touches) {
        touchCountRef.current = e.touches.length;
      }
    };

    // Fabric Internal Hook
    canvas.on("mouse:down:before", handleFabricBeforeEvent);
    canvas.on("mouse:move:before", handleFabricBeforeEvent);

    // Use extreme capture phase listeners for BLOCKING
    el.addEventListener("pointerdown", onNativeInteractionCapture, {
      capture: true,
    });
    el.addEventListener("touchstart", onNativeInteractionCapture, {
      capture: true,
      passive: false,
    });
    el.addEventListener("mousedown", onNativeInteractionCapture, {
      capture: true,
    });

    // Use bubble phase listeners for PAN-LOCKING
    el.addEventListener("pointerdown", onNativeInteractionBubble, {
      capture: false,
    });
    el.addEventListener("touchstart", onNativeInteractionBubble, {
      capture: false,
      passive: false,
    });
    el.addEventListener("mousedown", onNativeInteractionBubble, {
      capture: false,
    });

    // iPad Touch Count Registry
    el.addEventListener("touchstart", updateTouchCount, { capture: true, passive: true });
    el.addEventListener("touchend", updateTouchCount, { capture: true, passive: true });
    el.addEventListener("touchcancel", updateTouchCount, { capture: true, passive: true });

    // ROBUST RESET: Up, Cancel, Blur
    window.addEventListener("pointerup", resetPointerState, { capture: true });
    window.addEventListener("pointercancel", resetPointerState, {
      capture: true,
    });
    window.addEventListener("touchend", resetPointerState, { capture: true });
    window.addEventListener("touchcancel", resetPointerState, {
      capture: true,
    });
    window.addEventListener("blur", resetPointerState);

    return () => {
      el.removeEventListener("pointerdown", onNativeInteractionCapture, {
        capture: true,
      });
      el.removeEventListener("touchstart", onNativeInteractionCapture, {
        capture: true,
      });
      el.removeEventListener("mousedown", onNativeInteractionCapture, {
        capture: true,
      });

      el.removeEventListener("pointerdown", onNativeInteractionBubble, {
        capture: false,
      });
      el.removeEventListener("touchstart", onNativeInteractionBubble, {
        capture: false,
      });
      el.removeEventListener("mousedown", onNativeInteractionBubble, {
        capture: false,
      });

      canvas.off("mouse:down:before", handleFabricBeforeEvent);
      canvas.off('mouse:move:before', handleFabricBeforeEvent);

      window.removeEventListener("pointerup", resetPointerState, {
        capture: true,
      });
      window.removeEventListener("pointercancel", resetPointerState, {
        capture: true,
      });
      window.removeEventListener("touchend", resetPointerState, {
        capture: true,
      });
      window.removeEventListener("touchcancel", resetPointerState, {
        capture: true,
      });
      window.removeEventListener("blur", resetPointerState);
    };
  }, [engine, penOnlyMode, onPenDetected]);

  return {};
}
