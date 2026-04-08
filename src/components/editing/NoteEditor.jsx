import React, { useState, useEffect, useRef } from 'react';
import { 
  X, ChevronLeft, Layout, Sparkles, Plus, 
  Pen, Eraser, MousePointer2, Highlighter, 
  GripVertical, Target, Maximize2, CheckCircle2,
  Type, Square, Circle, Minus, MousePointer, 
  ChevronDown, Trash2, Eraser as EraserIcon,
  RotateCcw, RotateCw, Save, Hand
} from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import FabricPage from './FabricPage';
import './NoteEditor.css';

export default function NoteEditor({ item, onClose }) {
  // --- Tool System State ---
  const [activeTool, setActiveTool] = useState('pen');
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(2);
  const [eraserType, setEraserType] = useState('partial'); // 'partial' | 'object'
  const [activeSubMenu, setActiveSubMenu] = useState(null); 
  const [isPenVerified, setIsPenVerified] = useState(false);
  
  // --- UI & Navigation State ---
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [toast, setToast] = useState(null);
  const [paperStyle, setPaperStyle] = useState('ruled'); 
  const [pages, setPages] = useState([1, 2, 3]); 
  const [navMode, setNavMode] = useState('centered'); 
  const [currentScale, setCurrentScale] = useState(1);
  const [penOnlyMode, setPenOnlyMode] = useState(false);
  const [activePage, setActivePage] = useState(1);

  const handlePenDetected = React.useCallback(() => {
    if (!isPenVerified) {
      setIsPenVerified(true);
      showToast("Apple Pencil Verified", <CheckCircle2 size={16} color="#22C55E" />);
    }
  }, [isPenVerified]);
  
  // Refs
  const transformRef = useRef(null);
  const toolbarRef = useRef(null);
  const pageRefs = useRef({});
  const isTablet = window.innerWidth >= 768;

  const showToast = (message, icon) => {
    setToast({ message, icon });
    setTimeout(() => setToast(null), 2000);
  };

  const addPage = () => {
    const newPage = pages.length + 1;
    setPages([...pages, newPage]);
    showToast(`Added Page ${newPage}`, <Plus size={16}/>);
  };

  const recenter = React.useCallback(() => {
    if (transformRef.current) {
      const { setTransform, instance } = transformRef.current;
      if (!instance || !instance.transformState) return;
      
      const { positionY, scale } = instance.transformState;
      const wrapper = document.querySelector('.react-transform-wrapper');
      const content = document.querySelector('.react-transform-component');
      if (wrapper && content) {
        const targetX = (wrapper.offsetWidth - content.offsetWidth * scale) / 2;
        setTransform(targetX, positionY, scale, 500);
        showToast("Centered", <CheckCircle2 size={16}/>);
      }
    }
  }, []);

  useEffect(() => {
    if (navMode === 'centered') {
      const timer = setTimeout(recenter, 50); 
      return () => clearTimeout(timer);
    }
  }, [navMode, recenter]);

  // --- Click Outside to Close Submenus ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target)) {
        setActiveSubMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // --- Global Actions (Page Specific) ---
  const handleUndo = () => {
    pageRefs.current[activePage]?.undo();
  };

  const handleRedo = () => {
    pageRefs.current[activePage]?.redo();
  };

  const handleManualSave = () => {
    pageRefs.current[activePage]?.save();
    showToast("Progress Saved", <Save size={16} />);
  };

  // --- Toolbar Config ---
  const mainTools = [
    { id: 'lasso', icon: MousePointer, label: 'Lasso', sub: false },
    { id: 'pen', icon: Pen, label: 'Pen', sub: true },
    { id: 'highlighter', icon: Highlighter, label: 'Highlighter', sub: false },
    { id: 'eraser', icon: Eraser, label: 'Eraser', sub: true },
    { id: 'text', icon: Type, label: 'Text', sub: false },
    { id: 'shape', icon: Square, label: 'Shapes', sub: true },
  ];

  const handleToolClick = (toolId, hasSub) => {
    if (activeTool === toolId) {
      if (hasSub) {
        setActiveSubMenu(activeSubMenu === toolId ? null : toolId);
      }
    } else {
      setActiveTool(toolId);
      setActiveSubMenu(null); 
    }
  };

  // --- Interactive Tool Detection ---
  const isInteractiveTool = ['pen', 'highlighter', 'eraser', 'lasso', 'text', 'rectangle', 'circle', 'line', 'shape'].includes(activeTool);

  return (
    <div className={`note-editor zen-mode ${isTablet ? 'tablet-view' : 'mobile-view'}`}>
      {/* 🚀 PROFESSIONAL TOOLBAR */}
      <div className="pro-floating-toolbar animate-slide-down" ref={toolbarRef}>
        <div className="toolbar-inner">
          <button className="tb-back-btn" onClick={onClose}><ChevronLeft size={20}/></button>
          
          <div className="tb-divider" />

          {/* HISTORY GROUP */}
          <div className="tb-actions-group">
            <button className="tb-action-btn" onClick={handleUndo} title="Undo"><RotateCcw size={18} /></button>
            <button className="tb-action-btn" onClick={handleRedo} title="Redo"><RotateCw size={18} /></button>
          </div>

          <div className="tb-divider" />
          
          <div className="tb-tools-group">
            {mainTools.map(tool => (
              <div key={tool.id} className="tb-tool-wrapper">
                <button 
                  className={`tb-tool-btn ${activeTool === tool.id ? 'active' : ''}`} 
                  onClick={() => handleToolClick(tool.id, tool.sub)}
                >
                  <tool.icon size={20} />
                </button>
                
                {/* TOOL SUBMENUS (PEN, ERASER, SHAPE) */}
                {activeSubMenu === tool.id && tool.id === 'pen' && (
                  <div className="tb-sub-menu animate-pop-in">
                    <div className="sub-menu-section">
                      <span className="sub-label">Size</span>
                      <div className="size-presets">
                        {[2, 4, 8, 12].map(s => (
                          <button key={s} className={`size-dot ${brushSize === s ? 'active' : ''}`} onClick={() => setBrushSize(s)}>
                             <div style={{ width: s + 2, height: s + 2 }} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="sub-menu-divider" />
                    <div className="sub-menu-section">
                      <span className="sub-label">Colors</span>
                      <div className="color-grid">
                        {['#000000', '#EF4444', '#3B82F6', '#22C55E', '#A855F7', '#F97316'].map(c => (
                          <button key={c} className={`color-dot-pick ${brushColor === c ? 'active' : ''}`} style={{ backgroundColor: c }} onClick={() => setBrushColor(c)} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeSubMenu === tool.id && tool.id === 'eraser' && (
                  <div className="tb-sub-menu animate-pop-in">
                    <button 
                      className={`sub-tool-item ${eraserType === 'partial' ? 'active' : ''}`} 
                      onClick={() => { setEraserType('partial'); setActiveSubMenu(null); }}
                    >
                      <EraserIcon size={18} /><span>Partial Erase</span>
                    </button>
                    <button 
                      className={`sub-tool-item ${eraserType === 'object' ? 'active' : ''}`} 
                      onClick={() => { setEraserType('object'); setActiveSubMenu(null); }}
                    >
                      <Trash2 size={18} /><span>Object Erase</span>
                    </button>
                    <div className="sub-menu-divider" />
                    <div className="sub-menu-section">
                      <span className="sub-label">Size</span>
                      <div className="size-presets">
                        {[4, 10, 20, 40].map(s => (
                          <button key={s} className={`size-dot ${brushSize * 5 === s ? 'active' : ''}`} onClick={() => setBrushSize(s/5)}>
                             <div style={{ width: (s/4) + 2, height: (s/4) + 2 }} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeSubMenu === tool.id && tool.id === 'shape' && (
                  <div className="tb-sub-menu animate-pop-in">
                    <button className="sub-tool-item" onClick={() => { setActiveTool('rectangle'); setActiveSubMenu(null); }}><Square size={18} /><span>Rectangle</span></button>
                    <button className="sub-tool-item" onClick={() => { setActiveTool('circle'); setActiveSubMenu(null); }}><Circle size={18} /><span>Circle</span></button>
                    <button className="sub-tool-item" onClick={() => { setActiveTool('line'); setActiveSubMenu(null); }}><Minus size={18} /><span>Line</span></button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="tb-divider" />
          
          <div className="tb-actions-group">
            <button className="tb-action-btn" onClick={handleManualSave} title="Save Now"><Save size={18} /></button>
            <button 
              className="tb-action-btn"
              title="Paper Style"
              onClick={() => {
                const styles = ['blank', 'ruled', 'grid', 'dotted'];
                const next = styles[(styles.indexOf(paperStyle) + 1) % styles.length];
                setPaperStyle(next);
              }}
            >
              <Layout size={20} />
            </button>
            <button 
              className={`tb-action-btn ${penOnlyMode ? 'active text-primary' : ''}`}
              title={penOnlyMode ? "Pencil Mode Active" : "Enable Smart Pen Mode"}
              onClick={() => setPenOnlyMode(!penOnlyMode)}
            >
              <Target size={20} className={penOnlyMode && !isPenVerified ? "animate-pulse" : ""} />
            </button>
            <button className="tb-action-btn" onClick={() => setNavMode(navMode === 'free' ? 'centered' : 'free')}>
              {navMode === 'centered' ? <Maximize2 size={20} className="text-primary" /> : <Maximize2 size={20} />}
            </button>
            <button className="tb-action-btn" onClick={() => setShowAiPanel(!showAiPanel)}>
              <Sparkles size={20} color={showAiPanel ? 'var(--color-primary)' : '#64748b'} />
            </button>
          </div>
        </div>
      </div>

      <div style={{ position: 'fixed', top: '20px', right: '24px', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
        <button onClick={() => setPenOnlyMode(!penOnlyMode)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 20px', borderRadius: '50px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', cursor: 'pointer', backgroundColor: penOnlyMode ? '#F97316' : '#FFFFFF', color: penOnlyMode ? '#FFFFFF' : '#334155' }}>
          {penOnlyMode ? (<><Target size={18} className="animate-pulse" /><span style={{ fontWeight: 700, fontSize: '14px' }}>Pen Only Mode</span></>) : (<><Hand size={18} color="#64748b" /><span style={{ fontWeight: 600, fontSize: '14px' }}>Normal Mode</span></>)}
        </button>
      </div>

      <main className="workspace-light">
        <TransformWrapper
          ref={transformRef}
          initialScale={1}
          minScale={0.3}
          maxScale={6}
          limitToBounds={navMode === 'centered'}
          centerOnInit={true}
          onTransformed={(ref) => setCurrentScale(ref.state.scale)}
          onPanningStart={(_, event) => {
            const nativeEvent = event.nativeEvent || event;
            const isPen = event.pointerType === 'pen' || event.pressure > 0 || (nativeEvent.touches && nativeEvent.touches[0]?.touchType === 'stylus');
            const isMultiTouch = (nativeEvent.touches && nativeEvent.touches.length > 1);

            if (isMultiTouch) return true; // Always allow multi-touch zoom/pan

            // SMART PEN MODE
            if (penOnlyMode) {
              return !isPen; // Block pen panning, allow 1-finger panning
            }

            // NORMAL MODE
            // Block 1-finger panning if an interactive tool is selected
            if (isInteractiveTool || isPen) return false;
            return true;
          }}
          panning={{ 
            excluded: ["button"],
            disabled: false, 
            lockAxisX: navMode === 'centered',
          }}
          doubleClick={{ disabled: true }}
        >
          <TransformComponent
            wrapperStyle={{ width: "100%", height: "100%", overflow: "hidden" }}
            contentStyle={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              padding: "1000px",
              // CRITICAL FIX: Block browser-level panning at CSS level when drawing in Normal Mode
              touchAction: (isInteractiveTool && !penOnlyMode) ? 'none' : 'auto'
            }}
          >
            {pages.map((pageNumber) => (
              <div 
                key={pageNumber} 
                onMouseEnter={() => setActivePage(pageNumber)}
                className={`floating-page-sheet sheet-style-${paperStyle} ${activePage === pageNumber ? 'active-page' : ''}`} 
                style={{ width: isTablet ? "840px" : "calc(100vw - 40px)", minHeight: "1180px", marginBottom: "40px", background: 'white' }}
              >
                <FabricPage 
                  ref={el => pageRefs.current[pageNumber] = el}
                  id={`${item.id}-${pageNumber}`}
                  width={isTablet ? 840 : window.innerWidth - 40}
                  height={1180}
                  activeTool={activeTool}
                  brushColor={brushColor}
                  brushSize={brushSize}
                  eraserType={eraserType}
                  penOnlyMode={penOnlyMode}
                  onPenDetected={handlePenDetected}
                />
                <div className="page-number-footer">{pageNumber}</div>
              </div>
            ))}
            
            <button className="add-page-plus-btn" onClick={addPage}>
              <Plus size={24} />
              <span>Add New Page</span>
            </button>
          </TransformComponent>
        </TransformWrapper>

        {showAiPanel && (
          <aside className="ai-sidebar-light animate-slide-left">
            <div className="ai-sb-header"><Sparkles size={18} className="text-primary" /><h3>AI Assistant</h3><button className="sb-close" onClick={() => setShowAiPanel(false)}><X size={16} /></button></div>
            <div className="ai-sb-content"><div className="ai-bubble-msg">System refactored to Modular Architecture. How can I help?</div></div>
          </aside>
        )}

        {toast && <div className="toast-light animate-slide-up shadow-xl">{toast.icon}<span>{toast.message}</span></div>}
      </main>
    </div>
  );
}
