import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import { fabric } from 'fabric';
// Import eraser brush to extend fabric
import 'fabric-eraser-brush';

/**
 * Helper: Hex to RGBA
 */
const hexToRgba = (hex, alpha) => {
  if (!hex || hex.length < 7) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const FabricPage = forwardRef(({ 
  id, 
  width, 
  height, 
  activeTool, 
  brushColor, 
  brushSize,
  eraserType, // 'object' | 'partial'
  penOnlyMode = true, // iPad Optimization
  initialData, 
  onSave 
}, ref) => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const handleModifiedRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getCanvas: () => fabricCanvasRef.current,
    saveData: () => {
      if (fabricCanvasRef.current) {
        return JSON.stringify(fabricCanvasRef.current.toJSON());
      }
      return null;
    }
  }));

  // --- Initialization ---
  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      renderOnAddRemove: true,
      preserveObjectStacking: true,
      stopContextMenu: true,
      fireRightClick: true,
      skipTargetFind: false,
      perPixelTargetFind: true,
      targetFindTolerance: 6,
      allowTouchScrolling: true, // Allow iPad to scroll if not drawing
    });

    fabricCanvasRef.current = canvas;

    if (initialData && canvas) {
      try {
        const data = JSON.parse(initialData);
        canvas.loadFromJSON(data, () => canvas.renderAll());
      } catch (e) {
        console.error("Failed to load canvas data", e);
      }
    }

    const handleModified = () => {
      if (onSave && canvas) onSave(JSON.stringify(canvas.toJSON()));
    };

    canvas.on('object:added', handleModified);
    canvas.on('object:modified', handleModified);
    canvas.on('object:removed', handleModified);
    handleModifiedRef.current = handleModified;

    // --- iPad Optimization: Pointer Filtering ---
    const handleBeforePointerDown = (opt) => {
      const e = opt.e;
      // If penOnlyMode is on, only stylus (pen) can initiate drawing/selection
      // Fingers (touch) will have their events ignored by fabric, 
      // letting them bubble up to the TransformWrapper.
      if (penOnlyMode && e.pointerType === 'touch') {
        // Skip fabric handling for touch
        canvas.isDrawingMode = false;
        canvas.selection = false;
        // The event will bubble which triggers the TransformWrapper Panning
      } else {
        // Re-enable for pen/mouse
        syncToolSettings();
      }
    };

    canvas.on('mouse:down:before', handleBeforePointerDown);

    return () => {
      canvas.off('object:added', handleModified);
      canvas.off('object:modified', handleModified);
      canvas.off('object:removed', handleModified);
      canvas.off('mouse:down:before', handleBeforePointerDown);
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, [id, width, height, initialData, onSave, penOnlyMode]);

  // Sync tool settings
  const syncToolSettings = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = false;
    canvas.selection = true;
    canvas.defaultCursor = 'default';

    switch (activeTool) {
      case 'pen':
      case 'highlighter':
        canvas.isDrawingMode = true;
        canvas.selection = false;
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.color = activeTool === 'highlighter' ? hexToRgba(brushColor, 0.4) : brushColor;
        canvas.freeDrawingBrush.width = activeTool === 'highlighter' ? brushSize * 3 : brushSize;
        canvas.freeDrawingBrush.strokeLineCap = 'round';
        canvas.freeDrawingBrush.decimate = 1.5;
        break;

      case 'eraser':
        if (eraserType === 'partial') {
          canvas.isDrawingMode = true;
          canvas.selection = false;
          // Use fabric.EraserBrush from the plugin
          if (fabric.EraserBrush) {
            canvas.freeDrawingBrush = new fabric.EraserBrush(canvas);
            canvas.freeDrawingBrush.width = brushSize * 5;
          }
        } else {
          // Object Eraser mode
          canvas.isDrawingMode = false;
          canvas.selection = true;
          canvas.defaultCursor = 'not-allowed';
        }
        break;

      case 'lasso':
        canvas.isDrawingMode = false;
        canvas.selection = true;
        canvas.defaultCursor = 'crosshair';
        break;

      case 'text':
        canvas.isDrawingMode = false;
        canvas.selection = true;
        break;

      default:
        canvas.selection = true;
        break;
    }
  };

  // --- Tool System Integration ---
  useEffect(() => {
    syncToolSettings();

    // Hook for Object Eraser (click to delete)
    const canvas = fabricCanvasRef.current;
    if (activeTool === 'eraser' && eraserType === 'object') {
       const handleEraserClick = (options) => {
         if (options.target) {
            canvas.remove(options.target);
            if (handleModifiedRef.current) handleModifiedRef.current();
         }
       };
       canvas.on('mouse:down', handleEraserClick);
       return () => canvas.off('mouse:down', handleEraserClick);
    }
  }, [activeTool, brushColor, brushSize, eraserType]);

  return (
    <div className="fabric-page-container" style={{ position: 'relative' }}>
      <canvas ref={canvasRef} />
    </div>
  );
});

export default FabricPage;
