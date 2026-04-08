import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { fabric } from 'fabric';
import { useEditor } from '../../editor/hooks/useEditor';
import { useGestures } from '../../editor/hooks/useGestures';
import { pdfEngine } from '../../editor/systems/PdfEngine';

const FabricPage = forwardRef(({ 
  notebookId,
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
  
  // Track the Object URL so we can revoke it later to free memory
  const objectUrlRef = useRef(null);
  const isMounted = useRef(false);

  // Update canvas element state once ref is attached
  React.useEffect(() => {
    isMounted.current = true;
    if (canvasRef.current) {
      setCanvasEl(canvasRef.current);
    }
    return () => { isMounted.current = false; };
  }, []);

  // --- Instant Preview Loading (Blob URL) ---
  React.useEffect(() => {
    if (pdfId && pageNumber) {
      setLoading(true);
      console.log(`[FabricPage] Requesting Page ${pageNumber} (ID: ${pdfId})`);
      
      pdfEngine.requestPageImage(pdfId, pageNumber, scale, 'high')
        .then(res => {
          if (!isMounted.current) return; // Prevent state update on unmounted component

          if (res.blob) {
            // REVOKE Previous URL before creating new one if it changed
            if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
            
            const url = URL.createObjectURL(res.blob);
            objectUrlRef.current = url;
            setPreviewUrl({ 
              url, 
              pageWidth: res.pageWidth || 595, // Default A4 if missing
              pageHeight: res.pageHeight || 842 
            });
          } else if (res.dataUrl) {
            setPreviewUrl({ 
              url: res.dataUrl, 
              pageWidth: res.pageWidth || 595, 
              pageHeight: res.pageHeight || 842 
            });
          }
          setLoading(false);
        })
        .catch(err => {
          console.error(`[FabricPage] Page ${pageNumber} load failed:`, err);
          if (isMounted.current) setLoading(false);
        });
    }

    // CLEANUP: Revoke the Object URL only when unmounting OR when ID changes
    return () => {
      // NOTE: We delay revocation slightly to allow Fabric to finish any async image loading
      // this prevents the "Error loading blob" crash.
      const urlToRevoke = objectUrlRef.current;
      if (urlToRevoke) {
        setTimeout(() => {
          try { URL.revokeObjectURL(urlToRevoke); } catch(e) {}
        }, 3000); // 3-second grace period for Fabric
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
  } = useEditor(notebookId, pageNumber, canvasEl, width, height);

  // Sync tools when props change
  React.useEffect(() => {
    if (isReady && setTool) {
      setTool(activeTool, { 
        color: brushColor, 
        size: brushSize,
        type: eraserType 
      });
    }
  }, [isReady, activeTool, brushColor, brushSize, eraserType, setTool]);

  // Handle Resize Support
  React.useEffect(() => {
    if (isReady && engine && engine.canvas) {
      engine.setSize(width, height);
    }
  }, [width, height, isReady, engine]);

  // Load PDF Background into Canvas
  React.useEffect(() => {
    if (isReady && engine && engine.canvas && previewUrl && previewUrl.url) {
      // Calculate canvas height based on PDF page aspect ratio (Safety Gate)
      const pw = previewUrl.pageWidth || 1;
      const ph = previewUrl.pageHeight || 1;
      const aspectRatio = ph / pw;
      const canvasHeight = Math.round(width * aspectRatio);
      
      engine.canvas.setWidth(width);
      engine.canvas.setHeight(canvasHeight);

      fabric.Image.fromURL(previewUrl.url, (img) => {
        // Double safety for unmount
        if (!isMounted.current || !engine.canvas) return;
        
        const scaleX = width / img.width;
        const scaleY = canvasHeight / img.height;
        img.set({
          scaleX,
          scaleY,
          originX: 'left',
          originY: 'top'
        });
        engine.canvas.setBackgroundImage(img, () => {
          if (isMounted.current && engine.canvas) {
            engine.canvas.renderAll();
          }
        });
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

  if (!notebookId) return null; // Safety render guard

  // Dynamic Height calculation (Safety Gate)
  const calcHeight = previewUrl && previewUrl.pageWidth > 0 
    ? (width * (previewUrl.pageHeight / previewUrl.pageWidth)) 
    : height;

  return (
    <div 
      className="fabric-page-container" 
      style={{ 
        position: 'relative', 
        touchAction: 'none',
        minHeight: calcHeight || 800,
        backgroundColor: '#fff'
      }}
    >
      {/* Instant Ghost Preview: Shows immediately before canvas is ready */}
      {previewUrl && previewUrl.url && (
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
            transition: 'opacity 0.2s ease',
            pointerEvents: 'none'
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
