import { useState, useEffect, useRef } from 'react';
import { 
  X, Pen, Highlighter, Eraser, Type, Sparkles, 
  ChevronLeft, ChevronRight, Save, Share2, 
  Settings, Layers, MousePointer2, Shapes, Image as ImageIcon, 
  LassoSelect, Ruler, Mic, Search, MoreHorizontal, Maximize2, 
  Minimize2, Monitor, Layout, FileText, CheckCircle2, Copy, GripVertical
} from 'lucide-react';
import './NoteEditor.css';

export default function NoteEditor({ item, onClose, isTablet = true }) {
  const [activeTool, setActiveTool] = useState('pen');
  const [penColor, setPenColor] = useState('#EF4444');
  const [penSize, setPenSize] = useState(2);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(5);
  const [toast, setToast] = useState(null);
  
  // Draggable Palette State
  const [palettePos, setPalettePos] = useState({ x: window.innerWidth - 80, y: 150 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });

  // Mock Toast system
  const showToast = (message, icon = <CheckCircle2 size={16} />) => {
    setToast({ message, icon });
    setTimeout(() => setToast(null), 3000);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // --- DRAG HANDLERS ---
  const onDragStart = (e) => {
    setIsDragging(true);
    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
    
    offsetRef.current = {
      x: clientX - palettePos.x,
      y: clientY - palettePos.y
    };
    
    // Prevent text selection while dragging
    document.body.style.userSelect = 'none';
  };

  const onDragMove = (e) => {
    if (!isDragging) return;
    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

    let newX = clientX - offsetRef.current.x;
    let newY = clientY - offsetRef.current.y;

    // Boundaries
    const maxX = window.innerWidth - 60;
    const maxY = window.innerHeight - 250;
    newX = Math.max(10, Math.min(newX, maxX));
    newY = Math.max(60, Math.min(newY, maxY));

    setPalettePos({ x: newX, y: newY });
  };

  const onDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    document.body.style.userSelect = 'auto';

    // Edge Snapping Logic (Left or Right)
    const midX = window.innerWidth / 2;
    if (palettePos.x < midX) {
      setPalettePos(prev => ({ ...prev, x: 20 }));
    } else {
      setPalettePos(prev => ({ ...prev, x: window.innerWidth - 80 }));
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onDragMove);
      window.addEventListener('mouseup', onDragEnd);
      window.addEventListener('touchmove', onDragMove, { passive: false });
      window.addEventListener('touchend', onDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', onDragMove);
      window.removeEventListener('mouseup', onDragEnd);
      window.removeEventListener('touchmove', onDragMove);
      window.removeEventListener('touchend', onDragEnd);
    };
  }, [isDragging, palettePos]);

  const shelfTools = [
    { id: 'select', icon: MousePointer2, label: 'Select' },
    { id: 'pen', icon: Pen, label: 'Pen' },
    { id: 'highlighter', icon: Highlighter, label: 'Highlighter' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
    { id: 'lasso', icon: LassoSelect, label: 'Lasso' },
    { id: 'shapes', icon: Shapes, label: 'Shapes' },
    { id: 'images', icon: ImageIcon, label: 'Images' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'ruler', icon: Ruler, label: 'Ruler' },
  ];

  const colors = ['#000000', '#EF4444', '#22C55E', '#A855F7', '#3B82F6', '#F97316'];
  const sizes = [1, 2, 4, 8];

  return (
    <div className={`note-editor pro-editor-light ${isTablet ? 'tablet-view' : 'mobile-view'}`}>
      {/* --- UNIFIED TOP BAR --- */}
      <header className="light-header-unified">
        <div className="header-left">
          <button className="light-icon-btn" onClick={onClose} title="Back">
            <ChevronLeft size={20} />
          </button>
        </div>
        
        <div className="header-center">
          <div className="tools-pill-light">
            {shelfTools.map(tool => {
              const Icon = tool.icon;
              return (
                <button 
                  key={tool.id}
                  className={`tool-pill-item ${activeTool === tool.id ? 'active' : ''}`}
                  onClick={() => setActiveTool(tool.id)}
                  title={tool.label}
                >
                  <Icon size={18} />
                  {activeTool === tool.id && <div className="active-dot-accent" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="header-right">
          <button className="light-nav-btn" onClick={() => showToast("Searching document...", <Search size={16}/>)}><Search size={18} /></button>
          <button 
            className={`ai-pill-btn ${showAiPanel ? 'active' : ''}`}
            onClick={() => {
               setShowAiPanel(!showAiPanel);
               if(!showAiPanel) showToast("AI Tutor is ready!", <Sparkles size={16} />);
            }}
          >
            <Sparkles size={16} />
          </button>
          <div className="header-v-divider" />
          <button className="light-nav-btn" onClick={() => showToast("Share link copied!", <Copy size={16}/>)}><Share2 size={18} /></button>
          <button className="light-nav-btn" onClick={() => showToast("Saving document...")}><Save size={18} /></button>
          <button className="light-nav-btn"><MoreHorizontal size={18} /></button>
        </div>
      </header>

      {/* --- DRAGGABLE SIDE PALETTE --- */}
      <aside 
        className={`side-palette-light ${isDragging ? 'is-dragging' : ''}`}
        style={{ left: palettePos.x, top: palettePos.y }}
      >
        <div className="drag-handle" onMouseDown={onDragStart} onTouchStart={onDragStart}>
          <GripVertical size={16} color="#94a3b8" />
        </div>
        <div className="palette-group colors">
          {colors.map(color => (
            <button 
              key={color}
              className={`color-pick-dot ${penColor === color ? 'active' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => setPenColor(color)}
            />
          ))}
        </div>
        <div className="palette-divider-h" />
        <div className="palette-group sizes">
          {sizes.map(size => (
            <button 
              key={size}
              className={`size-pick-btn ${penSize === size ? 'active' : ''}`}
              onClick={() => setPenSize(size)}
            >
              <div className="size-marker" style={{ height: size + 2, width: size + 2 }} />
            </button>
          ))}
        </div>
      </aside>

      {/* --- WORKSPACE --- */}
      <main className="workspace-light">
        <div className="workspace-canvas-area">
           <div className="floating-page-sheet animate-fade-in" key={currentPage}>
             <div className="page-padding">
                {item.coverUrl && currentPage === 1 ? (
                  <img src={item.coverUrl} className="content-raw-image" alt="content" />
                ) : (
                  <div className="page-mock-content">
                    <h2 className="mock-h2">Page {currentPage}: {item.title}</h2>
                    <p className="mock-p">{item.subject} • Note {currentPage}</p>
                    <div className="mock-lines-group">
                       {[...Array(12)].map((_, i) => (
                         <div key={i} className="mock-line-item" style={{ width: `${Math.random() * 30 + 70}%` }} />
                       ))}
                    </div>
                  </div>
                )}
                <svg className="drawing-svg-layer">
                  <path 
                    d={currentPage === 1 ? "M120,220 C180,180 280,280 380,220" : "M200,300 Q250,250 400,350"} 
                    stroke={penColor} 
                    strokeWidth={penSize} 
                    fill="none" 
                    opacity="0.8" 
                    strokeLinecap="round" 
                  />
                </svg>
             </div>
           </div>
        </div>

        {/* --- FLOATING PAGE NAV (BOTTOM LEFT) --- */}
        <div className="floating-page-nav shadow-lg">
           <button className="pnav-btn" onClick={handlePrev} disabled={currentPage === 1}>
             <ChevronLeft size={18} />
           </button>
           <div className="pnav-info">
             <span className="pnav-current">{currentPage}</span>
             <span className="pnav-divider">/</span>
             <span className="pnav-total">{totalPages}</span>
           </div>
           <button className="pnav-btn" onClick={handleNext} disabled={currentPage === totalPages}>
             <ChevronRight size={18} />
           </button>
        </div>

        {/* --- AI SIDEBAR --- */}
        {showAiPanel && (
          <aside className="ai-sidebar-light animate-slide-left">
            <div className="ai-sb-header">
              <Sparkles size={18} className="text-primary" />
              <h3>AI Study Buddy</h3>
              <button className="sb-close" onClick={() => setShowAiPanel(false)}><X size={16} /></button>
            </div>
            <div className="ai-sb-content">
              <div className="ai-bubble-msg">
                 Hello Alex! I see you're working on Page {currentPage}. Should I explain the core concepts on this page?
              </div>
              <div className="ai-sb-actions">
                <button className="ai-sb-btn">Summarize Page {currentPage}</button>
                <button className="ai-sb-btn">Create Quiz</button>
              </div>
            </div>
          </aside>
        )}

        {/* --- TOAST --- */}
        {toast && (
          <div className="toast-light animate-slide-up shadow-xl">
             {toast.icon}
             <span>{toast.message}</span>
          </div>
        )}
      </main>
    </div>
  );
}
