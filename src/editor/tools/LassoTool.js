import BaseTool from './BaseTool';

class LassoTool extends BaseTool {
  constructor(canvasEngine) {
    super(canvasEngine);
  }

  activate(settings = {}) {
    this.engine.setDrawingMode(false);
    this.engine.setSelection(true);
    this.canvas.defaultCursor = 'crosshair';
  }

  updateSettings(settings = {}) {
    // Lasso might handle group actions if needed
  }

  deactivate() {
    this.canvas.defaultCursor = 'default';
  }
}

export default LassoTool;
