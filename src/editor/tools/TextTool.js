import BaseTool from './BaseTool';
import { fabric } from 'fabric';

/**
 * TextTool
 * Handles adding and simple editing of Text objects (IText).
 */
class TextTool extends BaseTool {
  constructor(canvasEngine) {
    super(canvasEngine);
  }

  activate(settings = {}) {
    this.engine.setDrawingMode(false);
    this.engine.setSelection(true);
    this.canvas.defaultCursor = 'text';

    // Add text on click if we aren't clicking an existing object
    this.canvas.on('mouse:down', this.handleMouseDown);
  }

  handleMouseDown = (opt) => {
    // If we click on an existing target, let Fabric handle it
    if (opt.target) return;

    const pointer = this.canvas.getPointer(opt.e);
    const text = new fabric.IText('Tap to edit', {
      left: pointer.x,
      top: pointer.y,
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: 24,
      fill: this.engine.activeColor || '#000000',
      originX: 'center',
      originY: 'center',
    });

    this.canvas.add(text);
    this.canvas.setActiveObject(text);
    text.enterEditing();
    this.engine.emit('modified');
  };

  updateSettings(settings = {}) {
    const activeObject = this.canvas.getActiveObject();
    if (activeObject && activeObject.type === 'i-text') {
      if (settings.color) activeObject.set('fill', settings.color);
      if (settings.size) activeObject.set('fontSize', settings.size * 5); // Scalling font size
      this.canvas.requestRenderAll();
      this.engine.emit('modified');
    }
  }

  deactivate() {
    this.canvas.off('mouse:down', this.handleMouseDown);
    this.canvas.defaultCursor = 'default';
  }
}

export default TextTool;
