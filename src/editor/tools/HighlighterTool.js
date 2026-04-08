import BaseTool from './BaseTool';
import { fabric } from 'fabric';

/**
 * Helper: Hex to RGBA
 */
const hexToRgba = (hex, alpha) => {
  if (!hex || hex.length < 7) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

class HighlighterTool extends BaseTool {
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
    const color = settings.color || '#FACC15'; // Default yellow
    const size = settings.size || 8;
    
    this.brush.color = hexToRgba(color, 0.4); // 40% opacity
    this.brush.width = size * 3; // Highlighter is usually thicker
    this.brush.strokeLineCap = 'square'; // Highlighter vibe
    this.brush.decimate = 2.0;
  }

  deactivate() {
    this.engine.setDrawingMode(false);
  }
}

export default HighlighterTool;
