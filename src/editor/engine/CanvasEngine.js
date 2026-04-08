import { fabric } from 'fabric';
import 'fabric-eraser-brush';

/**
 * CanvasEngine
 * Pure logic abstraction for Fabric.js. 
 * Decoupled from React to allow for better testing and modularity.
 */
class CanvasEngine {
  constructor(canvasElement, options = {}) {
    this.canvas = new fabric.Canvas(canvasElement, {
      ...options,
      renderOnAddRemove: true,
      preserveObjectStacking: true,
      stopContextMenu: true,
      fireRightClick: true,
      perPixelTargetFind: true,
      targetFindTolerance: 6,
    });

    // --- Premium Selection Styling ---
    fabric.Object.prototype.set({
      transparentCorners: false,
      cornerColor: '#f97316', // Brand Orange
      cornerStrokeColor: '#ffffff',
      cornerStyle: 'circle',
      cornerSize: 10,
      borderColor: '#f97316',
      borderDashArray: [4, 4],
      padding: 8,
      borderScaleFactor: 2,
    });
    
    this.isDisposed = false;
    this.activeColor = '#000000';
    this.toolManager = null;
    this.initEventListeners();
  }

  initEventListeners() {
    // Events that trigger a history snapshot
    const historyEvents = [
      'object:added',
      'object:modified',
      'object:removed',
      'object:skewed',
      'object:scaled',
      'object:rotated',
      'path:created'
    ];

    historyEvents.forEach(eventName => {
      this.canvas.on(eventName, () => this.emit('modified'));
    });
  }

  // --- Core Methods ---
  
  setActiveSettings(settings = {}) {
    if (settings.color) this.activeColor = settings.color;
    if (settings.size) this.activeSize = settings.size;
  }
  setSize(width, height) {
    if (this.isDisposed) return;
    this.canvas.setDimensions({ width, height });
    this.canvas.renderAll();
  }

  loadData(jsonData) {
    if (!jsonData || this.isDisposed) return;
    return new Promise((resolve) => {
      this.canvas.loadFromJSON(jsonData, () => {
        this.canvas.renderAll();
        resolve();
      });
    });
  }

  getData() {
    return JSON.stringify(this.canvas.toJSON());
  }

  clear() {
    this.canvas.clear();
  }

  dispose() {
    this.isDisposed = true;
    this.canvas.dispose();
  }

  // --- Event Emitter (Simple) ---
  listeners = {};
  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  // --- Tool Helpers ---
  setDrawingMode(enabled) {
    this.canvas.isDrawingMode = enabled;
  }

  setBrush(brush) {
    this.canvas.freeDrawingBrush = brush;
  }

  setSelection(enabled) {
    this.canvas.selection = enabled;
    this.setInteractivity(enabled, enabled);
  }

  setInteractivity(selectable, evented) {
    this.canvas.forEachObject(obj => {
      obj.selectable = selectable;
      obj.evented = evented;
    });
    this.canvas.renderAll();
  }

  // --- Tool Integration ---
  registerToolManager(toolManager) {
    this.toolManager = toolManager;
  }

  setTool(toolId, settings) {
    if (this.toolManager) {
      this.setActiveSettings(settings);
      this.toolManager.setActiveTool(toolId, settings);
    }
  }

  updateToolSettings(settings) {
    if (this.toolManager) {
      this.setActiveSettings(settings);
      this.toolManager.updateSettings(settings);
    }
  }
}

export default CanvasEngine;
