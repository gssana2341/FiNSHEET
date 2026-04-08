import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { useEditor } from '../../editor/hooks/useEditor';
import { useGestures } from '../../editor/hooks/useGestures';

const FabricPage = forwardRef(({ 
  id, 
  width, 
  height, 
  activeTool, 
  brushColor, 
  brushSize,
  eraserType,
  penOnlyMode = true,
  onPenDetected,
  onSave 
}, ref) => {
  const canvasRef = useRef(null);
  const [canvasEl, setCanvasEl] = React.useState(null);
  
  // Update canvas element state once ref is attached
  React.useEffect(() => {
    if (canvasRef.current) {
      setCanvasEl(canvasRef.current);
    }
  }, []);

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
    <div className="fabric-page-container" style={{ position: 'relative', touchAction: 'none' }}>
      <canvas ref={canvasRef} />
      {!isReady && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
          Loading Canvas...
        </div>
      )}
    </div>
  );
});

export default FabricPage;
