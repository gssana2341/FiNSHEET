import { useEffect, useRef, useState, useCallback } from 'react';
import CanvasEngine from '../engine/CanvasEngine';
import ToolManager from '../tools/ToolManager';
import PenTool from '../tools/PenTool';
import HighlighterTool from '../tools/HighlighterTool';
import EraserTool from '../tools/EraserTool';
import LassoTool from '../tools/LassoTool';
import TextTool from '../tools/TextTool';
import ShapeTool from '../tools/ShapeTool';
import HistorySystem from '../systems/HistorySystem';
import StorageSystem from '../systems/StorageSystem';

/**
 * useEditor Hook
 * Orchestrates all systems and provides a clean interface to UI components.
 */
export function useEditor(notebookId, pageNumber, canvasElement, width, height) {
  const engineRef = useRef(null);
  const toolManagerRef = useRef(null);
  const historyRef = useRef(null);
  const storageRef = useRef(new StorageSystem());
  
  const [isReady, setIsReady] = useState(false);
  const [activeTool, setActiveTool] = useState('pen');

  useEffect(() => {
    if (!canvasElement || !width || !height) return;

    // 1. Init Engine
    const engine = new CanvasEngine(canvasElement);
    engine.setSize(width, height);
    engineRef.current = engine;

    // 2. Init Tools
    const toolManager = new ToolManager(engine);
    toolManager.registerTool('pen', PenTool);
    toolManager.registerTool('highlighter', HighlighterTool);
    toolManager.registerTool('eraser', EraserTool);
    toolManager.registerTool('lasso', LassoTool);
    toolManager.registerTool('text', TextTool);
    toolManager.registerTool('rectangle', ShapeTool);
    toolManager.registerTool('circle', ShapeTool);
    toolManager.registerTool('line', ShapeTool);
    toolManagerRef.current = toolManager;

    // Link ToolManager to Engine for stability
    engine.registerToolManager(toolManager);
    
    // Attach toolManager to engine for easier access in hooks
    engine.toolManager = toolManager;

    // 3. Init Systems
    const history = new HistorySystem(engine);
    historyRef.current = history;

    // 4. Load initial data
    storageRef.current.loadPage(notebookId, pageNumber).then(savedData => {
      if (savedData && !engine.isDisposed) {
        engine.loadData(savedData);
      }
    });

    // 5. Initial tool setup
    toolManager.setActiveTool('pen', { color: '#000000', size: 2 });
    engine.setActiveSettings({ color: '#000000', size: 2 });

    setIsReady(true);

    return () => {
      engine.dispose();
    };
  }, [canvasElement, notebookId, width, height]);

  const setTool = useCallback((toolId, settings) => {
    if (engineRef.current) {
      engineRef.current.setTool(toolId, settings);
      setActiveTool(toolId);
    }
  }, []);

  const updateToolSettings = useCallback((settings) => {
    if (engineRef.current) {
      engineRef.current.updateToolSettings(settings);
    }
  }, []);

  const undo = useCallback(() => historyRef.current?.undo(), []);
  const redo = useCallback(() => historyRef.current?.redo(), []);

  const save = useCallback(() => {
    if (engineRef.current) {
      const data = engineRef.current.getData();
      storageRef.current.savePage(notebookId, pageNumber, data);
    }
  }, [notebookId, pageNumber]);

  // --- Auto-Save System ---
  useEffect(() => {
    if (!isReady || !engineRef.current || !notebookId) return;
    const engine = engineRef.current;
    
    const handleModified = () => {
      save(); // Save instantly since 'modified' only fires on stroke completion/object dropped
    };

    engine.on('modified', handleModified);
    return () => {
      engine.off('modified', handleModified);
    };
  }, [isReady, save, notebookId]);

  return {
    isReady,
    activeTool,
    setTool,
    updateToolSettings,
    undo,
    redo,
    save,
    engine: engineRef.current
  };
}
