import BaseTool from './BaseTool';
import { fabric } from 'fabric';

class PenTool extends BaseTool {
  constructor(canvasEngine) {
    super(canvasEngine);
    this.brush = null;
  }

  activate(settings = {}) {
    this.engine.setDrawingMode(true);
    this.engine.setSelection(false);
    
    this.brush = new fabric.PencilBrush(this.canvas);
    this.updateSettings(settings);
    this.engine.setBrush(this.brush);
  }

  updateSettings(settings = {}) {
    if (!this.brush) return;
    this.brush.color = settings.color || '#000000';
    this.brush.width = settings.size || 2;
    this.brush.strokeLineCap = 'round';
    this.brush.strokeLineJoin = 'round';
    this.brush.decimate = 1.5; // Optimized for performance and smoothness
  }

  deactivate() {
    this.engine.setDrawingMode(false);
  }
}

export default PenTool;
