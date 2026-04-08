import BaseTool from './BaseTool';
import { fabric } from 'fabric';

/**
 * ShapeTool
 * Handles creation of basic geometric shapes.
 */
class ShapeTool extends BaseTool {
  constructor(canvasEngine) {
    super(canvasEngine);
    this.currentShape = null;
    this.startPoint = null;
  }

  activate(settings = {}) {
    this.engine.setDrawingMode(false);
    this.engine.setSelection(false);
    this.canvas.defaultCursor = 'crosshair';
    this.shapeType = settings.id || 'rectangle'; // Use the tool id as type

    this.canvas.on('mouse:down', this.handleMouseDown);
    this.canvas.on('mouse:move', this.handleMouseMove);
    this.canvas.on('mouse:up', this.handleMouseUp);
  }

  handleMouseDown = (opt) => {
    const pointer = this.canvas.getPointer(opt.e);
    this.startPoint = pointer;

    const config = {
      left: pointer.x,
      top: pointer.y,
      fill: 'transparent',
      stroke: this.engine.activeColor || '#000000',
      strokeWidth: this.engine.activeSize || 2,
      selectable: true,
    };

    switch (this.shapeType) {
      case 'rectangle':
        this.currentShape = new fabric.Rect({ ...config, width: 0, height: 0 });
        break;
      case 'circle':
        this.currentShape = new fabric.Circle({ ...config, radius: 0 });
        break;
      case 'line':
        this.currentShape = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], config);
        break;
    }

    if (this.currentShape) {
      this.canvas.add(this.currentShape);
    }
  };

  handleMouseMove = (opt) => {
    if (!this.currentShape) return;
    const pointer = this.canvas.getPointer(opt.e);

    switch (this.shapeType) {
      case 'rectangle':
        this.currentShape.set({
          width: Math.abs(pointer.x - this.startPoint.x),
          height: Math.abs(pointer.y - this.startPoint.y),
          left: Math.min(pointer.x, this.startPoint.x),
          top: Math.min(pointer.y, this.startPoint.y),
        });
        break;
      case 'circle':
        const radius = Math.sqrt(
          Math.pow(pointer.x - this.startPoint.x, 2) + 
          Math.pow(pointer.y - this.startPoint.y, 2)
        ) / 2;
        this.currentShape.set({
          radius: radius,
          left: Math.min(pointer.x, this.startPoint.x),
          top: Math.min(pointer.y, this.startPoint.y),
        });
        break;
      case 'line':
        this.currentShape.set({ x2: pointer.x, y2: pointer.y });
        break;
    }

    this.canvas.requestRenderAll();
  };

  handleMouseUp = () => {
    if (this.currentShape) {
      this.currentShape.setCoords();
      this.engine.emit('modified');
    }
    this.currentShape = null;
  };

  updateSettings(settings = {}) {
    if (settings.id) this.shapeType = settings.id;
  }

  deactivate() {
    this.canvas.off('mouse:down', this.handleMouseDown);
    this.canvas.off('mouse:move', this.handleMouseMove);
    this.canvas.off('mouse:up', this.handleMouseUp);
    this.canvas.defaultCursor = 'default';
  }
}

export default ShapeTool;
