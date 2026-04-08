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
import { pdfEngine } from '../../editor/systems/PdfEngine';
import './NoteEditor.css';

// Lightweight component to show the PDF page image instantly without the heavy Fabric engine
const PdfPreviewStatic = ({ pdfId, pageNumber, width, scale = 2.5 }) => {
  const [preview, setPreview] = useState(null);
  const objectUrlRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    pdfEngine.requestPageImage(pdfId, pageNumber, scale, 'low').then(res => {
      if (isMounted) {
        if (res.blob) {
          const url = URL.createObjectURL(res.blob);
          objectUrlRef.current = url;
          setPreview({ url, pageWidth: res.pageWidth, pageHeight: res.pageHeight });
        } else if (res.dataUrl) {
          setPreview({ url: res.dataUrl, pageWidth: res.pageWidth, pageHeight: res.pageHeight });
        }
      }
    });

    return () => { 
      isMounted = false; 
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [pdfId, pageNumber]);

  if (!preview) return (
    <div style={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div className="loader-spinner"></div>
    </div>
  );

  const aspectRatio = preview.pageHeight / preview.pageWidth;
  const h = Math.round(width * aspectRatio);

  return (
    <div style={{ width: '100%', height: h, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img 
        src={preview.url} 
        alt="" 
        style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
      />
    </div>
  );
};


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
  const [pages, setPages] = useState(() => {
    if (item?.pageCount) return Array.from({ length: item.pageCount }, (_, i) => i + 1);
    return [1, 2, 3];
  }); 
  const [navMode, setNavMode] = useState('centered'); 
  const [currentScale, setCurrentScale] = useState(1);
  const [penOnlyMode, setPenOnlyMode] = useState(false);
  const [activePage, setActivePage] = useState(1);

  const savePosTimer = useRef(null);
  const didMountRef = useRef(false);

  const savedPos = React.useMemo(() => {
    try {
      if (!item?.id) return null;
      const saved = localStorage.getItem(`note_pos_${item.id}`);
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return null;
  }, [item?.id]);

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
  const isMobile = /iPad|iPhone|iPod|Android/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  
  // Use adaptive settings for iPad/Mobile to prevent crashes
  const highResScale = isMobile ? 2.0 : 2.5; 
  const previewScale = isMobile ? 1.0 : 1.2; // Low res for scrolling
  const nearbyBuffer = isMobile ? 1 : 3;

  useEffect(() => {
    console.log(`[NoteEditor] Performance Mode: ${isMobile ? 'iPad' : 'Desktop'}. Preview: ${previewScale}x, Active: ${highResScale}x`);
  }, []);

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
      if (!didMountRef.current && savedPos) {
        didMountRef.current = true;
        return;
      }
      const timer = setTimeout(recenter, 50); 
      didMountRef.current = true;
      return () => clearTimeout(timer);
    }
    didMountRef.current = true;
  }, [navMode, recenter, savedPos]);

  // --- Intelligent Viewport Mounting ---
  // We keep all DIVs but only mount the heavy Fabric canvases for visible pages.
  const [visiblePages, setVisiblePages] = useState(new Set([1]));
  
  // PDF Document Session Management (Lifecycle)
  useEffect(() => {
    if (item?.type === 'pdf') {
      // Warm up the document session
      pdfEngine.ensureDocument(item.id);

      // Aggressive Cleanup: Close the PDF session when leaving
      return () => {
        pdfEngine.closeDocument();
      };
    }
  }, [item?.id]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setVisiblePages(prev => {
          const next = new Set(prev);
          entries.forEach(entry => {
            const pageNum = parseInt(entry.target.getAttribute('data-page-num'));
            if (entry.isIntersecting) {
              next.add(pageNum);
            } else {
              next.delete(pageNum);
            }
          });
          
          // Also update activePage for sync
          const top = entries.find(e => e.isIntersecting && e.intersectionRatio > 0.5);
          if (top) setActivePage(parseInt(top.target.getAttribute('data-page-num')));
          
          return next;
        });
      },
      { threshold: [0.1, 0.5] }
    );

    const pageElements = document.querySelectorAll('.floating-page-sheet');
    pageElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [pages.length]);

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

  const handleClose = () => {
    // Force save all pages before exiting to prevent losing data during debounce
    Object.values(pageRefs.current).forEach(page => {
      if (page && page.save) page.save();
    });

    // Generate cover thumbnail upon exit
    const p1Canvas = pageRefs.current[1]?.getCanvas();
    if (p1Canvas && item) {
      try {
        const coverDataUrl = p1Canvas.toDataURL({
          format: 'jpeg',
          quality: 0.6,
          multiplier: 0.3
        });
        
        const savedStr = localStorage.getItem('user_library_items');
        if (savedStr) {
          const itemsArray = JSON.parse(savedStr);
          const idx = itemsArray.findIndex(i => i.id === item.id);
          if (idx !== -1) {
            itemsArray[idx].coverUrl = coverDataUrl;
            itemsArray[idx].updatedAt = new Date().toISOString();
            localStorage.setItem('user_library_items', JSON.stringify(itemsArray));
            // Dispatch a global event to let library page refresh instantly if needed
            window.dispatchEvent(new Event('library-updated'));
          }
        }
      } catch (err) {
        console.error("Failed to generate cover:", err);
      }
    }
    
    onClose();
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
          <button className="tb-back-btn" onClick={handleClose}><ChevronLeft size={20}/></button>
          
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
          initialScale={savedPos?.scale ?? 1}
          minScale={0.3}
          maxScale={6}
          limitToBounds={navMode === 'centered'}
          initialPositionX={savedPos?.x ?? (isTablet ? (window.innerWidth - 2840) / 2 : -980)}
          initialPositionY={savedPos?.y ?? -940}
          onTransformed={(ref) => {
            setCurrentScale(ref.state.scale);
            clearTimeout(savePosTimer.current);
            savePosTimer.current = setTimeout(() => {
              if (item?.id) {
                localStorage.setItem(`note_pos_${item.id}`, JSON.stringify({
                  x: ref.state.positionX,
                  y: ref.state.positionY,
                  scale: ref.state.scale
                }));
              }
            }, 300);
          }}
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
            {pages.map((pageNumber) => {
              // Only mount the heavy rendering engine if the page is visible or nearby
              const isVisible = visiblePages.has(pageNumber);
              const isNearby = Math.abs(pageNumber - activePage) <= nearbyBuffer;
              const shouldMountCanvas = isVisible || isNearby;

              return (
                <div 
                  key={pageNumber} 
                  data-page-num={pageNumber}
                  className={`floating-page-sheet ${item?.type === 'pdf' ? 'pdf-page' : `sheet-style-${paperStyle}`}`} 
                  style={{ 
                    width: isTablet ? "840px" : "calc(100vw - 40px)", 
                    minHeight: item?.type === 'pdf' ? "auto" : "1180px", 
                    marginBottom: "40px" 
                  }}
                >
                  {/* The actual Canvas / Drawing Tool */}
                  {shouldMountCanvas ? (
                    <FabricPage 
                      ref={el => pageRefs.current[pageNumber] = el}
                      id={`${item.id}-${pageNumber}`}
                      pdfId={item?.type === 'pdf' ? item.id : null}
                      pageNumber={pageNumber}
                      width={isTablet ? 840 : window.innerWidth - 40}
                      height={1180}
                      activeTool={activeTool}
                      brushColor={brushColor}
                      brushSize={brushSize}
                      eraserType={eraserType}
                      penOnlyMode={penOnlyMode}
                      onPenDetected={handlePenDetected}
                      scale={highResScale}
                    />
                  ) : (
                    /* The "Ghost Image" - Ultra lightweight preview at 1.2x */
                    <PdfPreviewStatic 
                      pdfId={item.id} 
                      pageNumber={pageNumber} 
                      width={isTablet ? 840 : window.innerWidth - 40} 
                      scale={previewScale}
                    />
                  )}

                  <div className="page-number-footer">{pageNumber}</div>
                </div>
              );
            })}
            
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
