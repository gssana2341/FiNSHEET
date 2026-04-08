import BaseTool from './BaseTool';
import { fabric } from 'fabric';

class EraserTool extends BaseTool {
  constructor(canvasEngine) {
    super(canvasEngine);
    this.type = 'partial'; // Default to partial/pixel erase
  }

  activate(settings = {}) {
    this.type = settings.type || 'partial';
    this.applyEraserMode(settings);
  }

  applyEraserMode(settings = {}) {
    if (this.type === 'partial') {
      this.engine.setDrawingMode(true);
      this.engine.setSelection(false);
      
      const brush = new fabric.EraserBrush(this.canvas);
      brush.width = (settings.size || 5) * 5; // Eraser size multiplier
      this.engine.setBrush(brush);
    } else {
      // Object Erasing mode
      this.engine.setDrawingMode(false);
      this.engine.setSelection(false); // Ensure selection box is disabled
      this.engine.setInteractivity(false, true); // Clickable but not selectable
      this.canvas.defaultCursor = 'crosshair'; // Better cursor for precision
      
      // Listener for object eraser
      this.canvas.on('mouse:down', this.handleObjectClick);
    }
  }

  handleObjectClick = (options) => {
    if (this.type === 'object' && options.target) {
      this.canvas.remove(options.target);
      this.engine.emit('modified');
    }
  }

  updateSettings(settings = {}) {
    if (settings.type && settings.type !== this.type) {
      this.deactivate();
      this.activate(settings);
    } else if (this.type === 'partial' && this.canvas.freeDrawingBrush) {
      this.canvas.freeDrawingBrush.width = (settings.size || 5) * 5;
    }
  }

  deactivate() {
    this.canvas.off('mouse:down', this.handleObjectClick);
    this.canvas.defaultCursor = 'default';
    this.engine.setDrawingMode(false);
    this.engine.setSelection(true); // Restore default selection behavior
  }
}

export default EraserTool;
