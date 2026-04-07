import React, { useRef, useEffect, useState } from 'react';

export default function DrawingCanvas({ 
  width, 
  height, 
  color = '#000000', 
  size = 2, 
  tool = 'pen',
  onSave,
  initialData,
  scale = 1 
}) {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Smoothing: Track last points
  const p1 = useRef({ x: 0, y: 0 });
  const p2 = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Support high DPI screens
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const context = canvas.getContext('2d');
    context.scale(dpr, dpr);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    contextRef.current = context;

    // Load initial data if exists
    if (initialData) {
      const img = new Image();
      img.onload = () => context.drawImage(img, 0, 0, width, height);
      img.src = initialData;
    }
  }, [width, height]);

  const startDrawing = (e) => {
    // Only draw with Pen or Mouse (Support iPad Pencil)
    // If it's a finger touch, DO NOT stop propagation or draw.
    // This allows current 1-finger touch to bubble up to the panning library.
    if (e.pointerType === 'touch') return;

    // If it's a PEN (Stylus) or Mouse, we want to DRAW and STOP PANNING.
    e.stopPropagation();

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    setIsDrawing(true);
    p1.current = { x, y };
    p2.current = { x, y };
    
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    contextRef.current.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    contextRef.current.lineWidth = (tool === 'eraser' ? size * 5 : size) / scale;
  };

  const draw = (e) => {
    if (!isDrawing) return;
    // Safety check: Don't draw with finger
    if (e.pointerType === 'touch') return;
    
    // Stop propagation here too for safety
    e.stopPropagation();

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    // Smoothing Algorithm: Quadratic Bézier
    const midPoint = {
      x: (p1.current.x + x) / 2,
      y: (p1.current.y + y) / 2
    };

    contextRef.current.quadraticCurveTo(p1.current.x, p1.current.y, midPoint.x, midPoint.y);
    contextRef.current.stroke();
    
    p2.current = p1.current;
    p1.current = { x, y };
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    contextRef.current.closePath();
    setIsDrawing(false);
    
    // Auto save to parent
    if (onSave) {
      onSave(canvasRef.current.toDataURL());
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={startDrawing}
      onPointerMove={draw}
      onPointerUp={stopDrawing}
      onPointerLeave={stopDrawing}
      style={{ 
        touchAction: 'none', // Full control to custom NoteEditor gestures
        cursor: 'crosshair',
        display: 'block'
      }}
    />
  );
}
