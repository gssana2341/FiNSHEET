/**
 * BaseTool
 * Abstract class for all tools in the editor.
 */
class BaseTool {
  constructor(canvasEngine) {
    this.engine = canvasEngine;
    this.canvas = canvasEngine.canvas;
  }

  activate(settings = {}) {}
  deactivate() {}
  updateSettings(settings = {}) {}
}

export default BaseTool;
