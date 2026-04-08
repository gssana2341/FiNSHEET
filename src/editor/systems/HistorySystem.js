/**
 * HistorySystem
 * Manages Undo/Redo stack using canvas snapshots.
 */
class HistorySystem {
  constructor(engine, maxSteps = 50) {
    this.engine = engine;
    this.canvas = engine.canvas;
    this.maxSteps = maxSteps;
    this.undoStack = [];
    this.redoStack = [];
    this.isProcessing = false;

    this.init();
  }

  init() {
    // We listen to the engine's 'modified' event to capture snapshots
    this.engine.on('modified', () => {
      if (!this.isProcessing) {
        this.saveState();
      }
    });
  }

  saveState() {
    const json = this.canvas.toJSON();
    this.undoStack.push(json);
    
    // Limit stack size
    if (this.undoStack.length > this.maxSteps) {
      this.undoStack.shift();
    }
    
    // Clear redo stack on new action
    this.redoStack = [];
  }

  async undo() {
    if (this.undoStack.length <= 1) return; // Keep at least one state

    this.isProcessing = true;
    const currentState = this.undoStack.pop();
    this.redoStack.push(currentState);

    const prevState = this.undoStack[this.undoStack.length - 1];
    await this.engine.loadData(prevState);
    this.isProcessing = false;
  }

  async redo() {
    if (this.redoStack.length === 0) return;

    this.isProcessing = true;
    const nextState = this.redoStack.pop();
    this.undoStack.push(nextState);

    await this.engine.loadData(nextState);
    this.isProcessing = false;
  }

  clear() {
    this.undoStack = [];
    this.redoStack = [];
  }
}

export default HistorySystem;
