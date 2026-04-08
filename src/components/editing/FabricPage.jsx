import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { fabric } from 'fabric';
import { useEditor } from '../../editor/hooks/useEditor';
import { useGestures } from '../../editor/hooks/useGestures';
import { pdfEngine } from '../../editor/systems/PdfEngine';

const FabricPage = forwardRef(({ 
  id, 
  pdfId,
  pageNumber,
  width, 
  height, 
  activeTool, 
  brushColor, 
  brushSize,
  eraserType,
  penOnlyMode = true,
  onPenDetected,
  onSave,
  scale = 2.5
}, ref) => {
  const canvasRef = useRef(null);
  const [canvasEl, setCanvasEl] = React.useState(null);
  const [previewUrl, setPreviewUrl] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  
  // Track the Object URL so we can revoke it later to free memory (GoodNotes style)
  const objectUrlRef = useRef(null);

  // Update canvas element state once ref is attached
  React.useEffect(() => {
    if (canvasRef.current) {
      setCanvasEl(canvasRef.current);
    }
  }, []);

  // --- Instant Preview Loading (Blob URL) ---
  React.useEffect(() => {
    if (pdfId) {
      console.log(`[FabricPage] Requesting Page ${pageNumber} (Priority: high)`);
      pdfEngine.requestPageImage(pdfId, pageNumber, scale, 'high')
        .then(res => {
          if (res.blob) {
            const url = URL.createObjectURL(res.blob);
            objectUrlRef.current = url;
            setPreviewUrl({ url, pageWidth: res.pageWidth, pageHeight: res.pageHeight });
          } else if (res.dataUrl) {
            setPreviewUrl({ url: res.dataUrl, pageWidth: res.pageWidth, pageHeight: res.pageHeight });
          }
          setLoading(false);
        })
        .catch(err => {
          console.error(`[FabricPage] Page ${pageNumber} load failed:`, err);
          setLoading(false);
        });
    }

    // CLEANUP: Revoke the Object URL to free memory immediately! 
    return () => {
      if (objectUrlRef.current) {
        console.log(`[FabricPage] Unmounting Page ${pageNumber} - Revoking memory...`);
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };

  }, [pdfId, pageNumber]);


  // Use our modular editor logic
  const { 
    isReady, 
    setTool, 
    updateToolSettings, 
    undo, 
    redo, 
    save,
    engine 
  } = useEditor(id, canvasEl, width, height);

  // Sync tools when props change
  React.useEffect(() => {
    if (isReady) {
      setTool(activeTool, { 
        color: brushColor, 
        size: brushSize,
        type: eraserType 
      });
    }
  }, [isReady, activeTool, brushColor, brushSize, eraserType, setTool]);

  // Handle Resize Support
  React.useEffect(() => {
    if (isReady && engine) {
      engine.setSize(width, height);
    }
  }, [width, height, isReady, engine]);

  // Load PDF Background into Canvas
  React.useEffect(() => {
    if (isReady && engine && engine.canvas && previewUrl) {
      // Calculate canvas height based on PDF page aspect ratio
      const aspectRatio = previewUrl.pageHeight / previewUrl.pageWidth;
      const canvasHeight = Math.round(width * aspectRatio);
      
      engine.canvas.setWidth(width);
      engine.canvas.setHeight(canvasHeight);

      fabric.Image.fromURL(previewUrl.url, (img) => {
        if (!engine.canvas) return; // Safety check
        const scaleX = width / img.width;
        const scaleY = canvasHeight / img.height;
        img.set({
          scaleX,
          scaleY,
          originX: 'left',
          originY: 'top'
        });
        engine.canvas.setBackgroundImage(img, engine.canvas.renderAll.bind(engine.canvas));
      });
    }
  }, [isReady, engine, previewUrl, width]);


  // Sync iPad gestures
  useGestures(engine, { penOnlyMode, activeTool, onPenDetected });

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    getCanvas: () => engine?.canvas,
    saveData: () => engine?.getData(),
    undo,
    redo,
    save
  }));

  return (
    <div 
      className="fabric-page-container" 
      style={{ 
        position: 'relative', 
        touchAction: 'none',
        minHeight: previewUrl ? (width * (previewUrl.pageHeight / previewUrl.pageWidth)) : height,
        backgroundColor: '#fff'
      }}
    >
      {/* Instant Ghost Preview: Shows immediately before canvas is ready */}
      {previewUrl && (
        <img 
          src={previewUrl.url} 
          alt=""
          style={{ 
            position: 'absolute', 
            inset: 0, 
            width: '100%', 
            height: '100%', 
            objectFit: 'contain',
            zIndex: isReady ? 0 : 2,
            opacity: isReady ? 0 : 1, // Hide preview once canvas is live
            transition: 'opacity 0.2s ease'
          }}
        />
      )}

      <div className="canvas-shadow-wrapper" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <canvas ref={canvasRef} />
      </div>
      
      {loading && !previewUrl && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', zIndex: 3 }}>
          <div className="loader-spinner"></div>
        </div>
      )}
    </div>
  );
});


export default FabricPage;
