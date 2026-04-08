/**
 * ToolManager
 * Manages tool registration, activation, and state syncing.
 */
class ToolManager {
  constructor(engine) {
    this.engine = engine;
    this.tools = {};
    this.activeTool = null;
    this.activeToolId = null;
  }

  registerTool(id, ToolClass) {
    this.tools[id] = new ToolClass(this.engine);
  }

  setActiveTool(id, settings = {}) {
    if (this.activeTool) {
      this.activeTool.deactivate();
    }

    const tool = this.tools[id];
    if (tool) {
      this.activeTool = tool;
      this.activeToolId = id;
      tool.activate(settings);
    }
  }

  updateSettings(settings) {
    if (this.activeTool) {
      this.activeTool.updateSettings(settings);
    }
  }

  getActiveToolId() {
    return this.activeToolId;
  }
}

export default ToolManager;
