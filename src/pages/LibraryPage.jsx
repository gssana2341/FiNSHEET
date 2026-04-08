import { useState, useEffect } from 'react';
import { BookOpen, Layers, PenTool, Upload, Brain, TrendingUp, Presentation, Plus, Eye, ShoppingCart, LayoutGrid, List as ListIcon, FileText, MoreVertical, X, Search, ChevronDown, Clock, SlidersHorizontal, History } from 'lucide-react';
import { t, onLangChange } from '../i18n';
import { libraryItems } from '../data/mockLibrary';
import { purchaseHistory } from '../data/mockPurchases';
import { sampleQuiz } from '../data/mockQuiz';
import { creatorItems } from '../data/mockCreator';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import FileUploadArea from '../components/ai/FileUploadArea';
import StreamingOutput from '../components/ai/StreamingOutput';
import QuizView from '../components/ai/QuizView';
import FlashcardView from '../components/ai/FlashcardView';
import UploadForm from '../components/creator/UploadForm';
import NoteEditor from '../components/editing/NoteEditor';
import Toast from '../components/ui/Toast';
import { pdfEngine } from '../editor/systems/PdfEngine';
import './StubPage.css';
import './LibraryPage.css';

const MOCK_SUMMARY = `## 📌 ประเด็นหลัก (Main Points)\n\n1. **Linear Algebra** is the study of vectors, matrices, and linear transformations\n2. **Eigenvalues** (λ) are scalars that satisfy Av = λv\n3. **Eigenvectors** are non-zero vectors that only change by a scalar factor\n4. Eigenvalues can be found by solving det(A - λI) = 0\n5. The set of all eigenvectors forms the **eigenspace**`;
const MOCK_FLASHCARDS = [
  { term: 'Eigenvalue', definition: 'A scalar λ such that Av = λv for some non-zero vector v' },
  { term: 'Eigenvector', definition: 'A non-zero vector v that satisfies Av = λv' },
];

export default function LibraryPage({ onOpenEditor }) {
  const [, setLangTick] = useState(0);
  const [activeTab, setActiveTab] = useState('my'); // 'my' | 'flashcards' | 'creator'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('user_library_items');
    return saved ? JSON.parse(saved) : libraryItems;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('updated'); // 'updated' | 'title' | 'type' | 'opened'
  
  // Sync items to localStorage
  useEffect(() => {
    localStorage.setItem('user_library_items', JSON.stringify(items));
  }, [items]);

  // Listen for background updates (e.g., from NoteEditor closing)
  useEffect(() => {
    const handleUpdate = () => {
      const saved = localStorage.getItem('user_library_items');
      if (saved) setItems(JSON.parse(saved));
    };
    window.addEventListener('library-updated', handleUpdate);
    return () => window.removeEventListener('library-updated', handleUpdate);
  }, []);

  // Modals
  const [showCreateTypeModal, setShowCreateTypeModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showFlashcardModal, setShowFlashcardModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [newBookName, setNewBookName] = useState('');
  const [isTablet, setIsTablet] = useState(window.innerWidth > 768);
  const isNativeHost = typeof window !== 'undefined' && !!window.ReactNativeWebView;
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const handleOutsideClick = () => setOpenMenuId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);
  
  // AI State
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState('');

  useEffect(() => {
    return onLangChange(() => setLangTick((n) => n + 1));
  }, []);

  // Native Message Listener
  useEffect(() => {
    if (!isNativeHost) return;

    const handleNativeMessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'PDF_PICKED') {
          const { id, name, numPages } = data.payload;
          
          const newItem = {
            id,
            title: name.replace('.pdf', ''),
            subject: 'Imported Document',
            type: 'pdf', 
            pageCount: numPages || 1, // Fallback to 1 if not provided yet
            createdAt: new Date().toISOString()
          };
          
          const updatedItems = [newItem, ...items];
          setItems(updatedItems);
          localStorage.setItem('user_library_items', JSON.stringify(updatedItems));
          
          setShowCreateTypeModal(false);
          onOpenEditor(newItem);
        }
      } catch (err) {
        // ignore
      }
    };

    window.addEventListener('message', handleNativeMessage);
    return () => window.removeEventListener('message', handleNativeMessage);
  }, [items, onOpenEditor, isNativeHost]);

  const handleRestoreItem = (itemData) => {
    // Check if item already exists in library
    if (items.find(i => i.id === itemData.id)) {
      setToastMessage(`"${itemData.title}" is already in your library.`);
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }

    // Add back to library (simulated)
    const newItem = {
      ...itemData,
      type: 'purchased',
      isOwned: true,
      purchasedAt: new Date().toISOString().split('T')[0]
    };
    setItems([newItem, ...items]);
    setToastMessage(`Successfully restored "${itemData.title}"!`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleDownloadDevice = (itemData) => {
    setToastMessage(`Downloading "${itemData.title}" to device...`);
    setTimeout(() => {
      setToastMessage(`Download complete! Check your Downloads folder.`);
      setTimeout(() => setToastMessage(''), 3000);
    }, 1500);
  };

  const tabs = [
    { id: 'my', label: t('library.tabMySummaries'), icon: BookOpen },
    { id: 'history', label: t('library.tabPurchaseHistory'), icon: History },
    { id: 'creator', label: t('library.tabCreatorCenter'), icon: PenTool },
  ];

  // Filtering and Sorting logic
  const filtered = items
    .filter((item) => {
      // 1. Tab filter
      if (activeTab === 'my') {
        const isMyType = ['ai_summary', 'purchased', 'flashcard', 'notebook', 'pdf'].includes(item.type);
        if (!isMyType) return false;
      } else {
        return false;
      }
      
      // 2. Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = item.title.toLowerCase().includes(query);
        const subjectMatch = item.subject && item.subject.toLowerCase().includes(query);
        return titleMatch || subjectMatch;
      }
      
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'type') return a.type.localeCompare(b.type);
      if (sortBy === 'updated') {
        const dateA = new Date(a.updatedAt || a.createdAt || 0);
        const dateB = new Date(b.updatedAt || b.createdAt || 0);
        return dateB - dateA;
      }
      if (sortBy === 'opened') {
        const dateA = new Date(a.lastOpened || 0);
        const dateB = new Date(b.lastOpened || 0);
        return dateB - dateA;
      }
      return 0;
    });

  const handleCreateEmptyClick = () => {
    setShowCreateTypeModal(false);
    setNewBookName('My Notebook');
    setShowNameDialog(true);
  };

  const confirmCreateBook = () => {
    const newItem = {
      id: `new-${Date.now()}`,
      title: newBookName || 'Untitled Note',
      subject: 'My Notes',
      type: 'notebook', 
      pageCount: 1,
      createdAt: new Date().toISOString()
    };
    
    const updatedItems = [newItem, ...items];
    setItems(updatedItems);
    localStorage.setItem('user_library_items', JSON.stringify(updatedItems));
    
    setShowNameDialog(false);
    onOpenEditor(newItem);
  };

  const handleDelete = (id) => {
    if (window.confirm('ยืนยันหน้าการลบสรุปนี้?')) {
      setItems(items.filter(item => item.id !== id));
      setOpenMenuId(null);
    }
  };

  const handleFileUpload = () => {
    setIsStreaming(true);
    setStreamedText('');
    let idx = 0;
    const interval = setInterval(() => {
      idx += 3;
      if (idx >= MOCK_SUMMARY.length) {
        setStreamedText(MOCK_SUMMARY);
        setIsStreaming(false);
        clearInterval(interval);
      } else {
        setStreamedText(MOCK_SUMMARY.slice(0, idx));
      }
    }, 20);
  };

  const handlePdfUpload = async (e) => {
    if (isNativeHost) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'PICK_PDF' }));
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setToastMessage('กำลังนำเข้าไฟล์ PDF...');
      const id = `pdf-${Date.now()}`;
      
      const { numPages } = await pdfEngine.importPdf(id, file);

      // --- Super Fast Entry ---
      const prefetchCount = Math.min(numPages, 2);
      for (let i = 1; i <= prefetchCount; i++) {
        try {
          setToastMessage(`กำลังเตรียมความพร้อมหน้าจอ... (${i}/2)`);
          await pdfEngine.getPageDataUrl(id, i); 
        } catch (pageErr) {
          console.warn(`[Library] Pre-render failed for page ${i}:`, pageErr);
        }
      }

      const newItem = {
        id,
        title: file.name.replace('.pdf', ''),
        subject: 'Imported Document',
        type: 'pdf', 
        pageCount: numPages,
        createdAt: new Date().toISOString()
      };
      
      const updatedItems = [newItem, ...items];
      setItems(updatedItems);
      localStorage.setItem('user_library_items', JSON.stringify(updatedItems));
      
      setShowCreateTypeModal(false);
      setToastMessage('');
      onOpenEditor(newItem);

    } catch (err) {
      console.error(err);
      setToastMessage('เกิดข้อผิดพลาดในการโหลด PDF');
      setTimeout(() => setToastMessage(''), 3000);
    }
    // reset input
    e.target.value = null;
  };

  const CreatorDashboard = () => (
    <div className="creator-center-mobile animate-fade-in">
      {/* Mobile-friendly Stats Stack */}
      <div className="creator-stats-stack">
          <div className="stat-pill stat-earn">
          <TrendingUp size={20} />
          <div className="stat-pill-info">
            <span className="stat-label">{t('creator.totalEarnings')}</span>
            <span className="stat-value">฿1,250.00</span>
          </div>
        </div>
        
        <div className="stat-pill-row">
          <div className="stat-pill stat-views">
            <Eye size={18} />
            <div className="stat-pill-info">
              <span className="stat-label">{t('creator.totalViews')}</span>
              <span className="stat-value">3,420</span>
            </div>
          </div>
          <div className="stat-pill stat-sales">
            <ShoppingCart size={18} />
            <div className="stat-pill-info">
              <span className="stat-label">{t('creator.totalSold')}</span>
              <span className="stat-value">45</span>
            </div>
          </div>
        </div>
      </div>

      <Button 
        variant="primary" 
        size="lg" 
        fullWidth 
        icon={Plus} 
        className="creator-upload-btn"
        onClick={() => setShowUploadModal(true)}
      >
        {t('library.uploadNewSheetToSell')}
      </Button>

      <div className="creator-items-section">
        <h3 className="section-title">{t('library.myUploads')}</h3>
        <div className="creator-items-list">
          {creatorItems.map((item) => (
            <Card key={item.id} className="creator-item-card">
              <div className="creator-item-meta">
                <span className="creator-item-title">{item.title}</span>
                <span className="creator-item-stats">
                  ฿{(item.priceSatang / 100).toFixed(0)} • {item.sales} sold
                </span>
              </div>
              <div className={`creator-item-status status-${item.status}`}>
                {item.status}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="stub-page library-page-full" id="library-page">
      <div className="stub-page-header">
        <div className="library-header-title-row">
          <h1 className="stub-page-title">
            {activeTab === 'creator' ? t('creator.title') : t('library.title')}
          </h1>
        </div>
        {activeTab !== 'creator' && viewMode === 'list' && (
          <Button variant="primary" icon={Plus} onClick={() => setShowCreateTypeModal(true)} id="new-summary-btn">
            {t('library.btnNewAiSummary')}
          </Button>
        )}
      </div>

      <div className="stub-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`stub-tab ${activeTab === tab.id ? 'stub-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
        {activeTab !== 'creator' && activeTab !== 'history' && (
          <div className="library-controls">
            <div className="library-search-wrapper">
              <Search size={16} className="search-icon" />
              <input 
                type="text" 
                className="library-search-input" 
                placeholder={t('common.search')} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="library-sort-wrapper">
              <SlidersHorizontal size={14} className="sort-icon-left" />
              <select 
                className="library-sort-select" 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="updated">{t('library.sortUpdated') || 'แก้ไขล่าสุด'}</option>
                <option value="opened">{t('library.sortOpened') || 'เปิดล่าสุด'}</option>
                <option value="title">{t('library.sortTitle') || 'ชื่อ (A-Z)'}</option>
                <option value="type">{t('library.sortType') || 'ประเภท'}</option>
              </select>
              <ChevronDown size={14} className="sort-chevron" />
            </div>

            <div className="view-toggle-group">
              <button 
                className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`} 
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <ListIcon size={18} />
              </button>
              <button 
                className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} 
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <LayoutGrid size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="stub-content-area">
        {activeTab === 'creator' ? (
          <CreatorDashboard />
        ) : activeTab === 'history' ? (
          <div className="purchase-history-view animate-fade-in">
            <div className="history-table-container">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>{t('library.orderId')}</th>
                    <th>{t('library.purchaseDate')}</th>
                    <th>{t('explore.title')}</th>
                    <th>{t('library.totalPrice')}</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseHistory.flatMap(order => 
                    order.items.map(item => ({...item, orderId: order.id, date: order.date}))
                  ).map((item, idx) => (
                    <tr key={`${item.orderId}-${item.id}-${idx}`}>
                      <td className="order-id-cell">{item.orderId}</td>
                      <td className="date-cell">{item.date}</td>
                      <td>
                        <div 
                          className="order-item-row clickable-history-item"
                          onClick={() => setSelectedHistoryItem(item)}
                        >
                          <span className="order-item-title">{item.title}</span>
                        </div>
                      </td>
                      <td className="price-cell">
                        {item.price === 0 ? t('explore.free') : `฿${(item.price / 100).toLocaleString()}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? "library-grid animate-fade-in" : "stub-list animate-fade-in"}>
            {/* Create New Card (Grid Mode Only) */}
            {viewMode === 'grid' && activeTab === 'my' && (
              <div className="library-create-card" onClick={() => setShowCreateTypeModal(true)}>
                <div className="create-card-inner">
                  <div className="create-icon-ring"><Plus size={24} color="var(--color-primary)"/></div>
                  <span>เริ่มสร้าง</span>
                </div>
              </div>
            )}

            {filtered.map((item) => {
              if (viewMode === 'grid') {
                return (
                  <div key={item.id} className="lib-grid-item" onClick={() => onOpenEditor(item)}>
                    <div 
                      className="lib-grid-cover"
                      style={item.coverUrl ? { backgroundImage: `url(${item.coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)' } : {}}
                    >
                      {/* Collection Badge */}
                      {item.type === 'purchased' ? (
                        <div className="lib-badge-icon badge-purchased-icon" title="Purchased"><ShoppingCart size={14}/></div>
                      ) : item.type === 'ai_summary' ? (
                        <div className="lib-badge-icon badge-ai-icon" title="AI Gen"><Brain size={14}/></div>
                      ) : null}
                      
                      {!item.coverUrl && <span className="lib-cover-title">{item.title}</span>}
                    </div>
                    <div className="lib-grid-info">
                      <div className="lib-grid-title-row">
                        <h4 className="lib-grid-title truncate">{item.title}</h4>
                        <div className="lib-card-more-wrapper" onClick={(e) => e.stopPropagation()}>
                          <button 
                            className={`lib-card-more-btn ${openMenuId === item.id ? 'active' : ''}`}
                            onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                          >
                            <MoreVertical size={16} />
                          </button>
                          
                          {openMenuId === item.id && (
                            <div className="lib-card-dropdown animate-fade-in shadow-xl">
                              <button className="dropdown-item" onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); setShowQuizModal(true); }}>
                                <Brain size={18} /> <span>{t('home.takeQuiz')}</span>
                              </button>
                              <button className="dropdown-item" onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); setShowFlashcardModal(true); }}>
                                <Layers size={18} /> <span>{t('library.tabFlashcards')}</span>
                              </button>
                              <div className="dropdown-divider" />
                              <button className="dropdown-item dropdown-item--danger" onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}>
                                <X size={18} /> <span>{t('common.delete')}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="lib-grid-meta truncate">{item.subject} • {item.pageCount || item.cardCount} pages</p>
                    </div>
                  </div>
                );
              }

              // List View Render
              return (
                <Card key={item.id} variant="default" className="stub-list-item library-item" onClick={() => onOpenEditor(item)}>
                  <div className="stub-list-icon">📄</div>
                  <div className="stub-list-info">
                    <div className="library-title-row">
                      <span className="stub-list-title">{item.title}</span>
                      {/* Collection Badge */}
                      {item.type === 'purchased' ? (
                        <span className="badge badge-purchased">{t('library.badgePurchased')}</span>
                      ) : item.type === 'ai_summary' ? (
                        <span className="badge badge-ai">{t('library.badgeAIGen')}</span>
                      ) : null}
                    </div>
                    <span className="stub-list-meta">{item.subject} · {item.pageCount || item.cardCount} {item.type === 'flashcard' ? 'cards' : 'pages'}</span>
                  </div>
                  <div className="library-item-actions">
                    <button className="library-action-btn" onClick={(e) => { e.stopPropagation(); setShowQuizModal(true); }} title="Quiz">
                      <Brain size={16} />
                    </button>
                    <button className="library-action-btn" onClick={(e) => { e.stopPropagation(); setShowFlashcardModal(true); }} title="Flashcards">
                      <Layers size={16} />
                    </button>
                  </div>
                </Card>
              );
            })}
            
            {filtered.length === 0 && viewMode === 'list' && (
              <div className="stub-empty">
                <span>📚</span>
                <p>{t('library.empty')}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal isOpen={showCreateTypeModal} onClose={() => setShowCreateTypeModal(false)} title="สร้างสมุด/สรุปใหม่" size="md">
        <div className="create-type-modal-content">
          <Card variant="default" className="create-type-card" onClick={() => { setShowCreateTypeModal(false); setShowAIModal(true); }}>
            <div className="create-type-icon"><Brain size={32} color="var(--color-primary)"/></div>
            <div className="create-type-info">
              <h3>ใช้ AI อัปโหลดและสรุป</h3>
              <p>นำเข้าไฟล์ PDF, สไลด์ และให้ AI ย่อยเนื้อหาพร้อมสร้าง Quiz ให้อัตโนมัติ</p>
            </div>
          </Card>
          <Card variant="default" className="create-type-card" onClick={handleCreateEmptyClick}>
            <div className="create-type-icon"><FileText size={32} color="var(--color-info)"/></div>
            <div className="create-type-info">
              <h3>สมุดจด/สรุปว่างเปล่า</h3>
              <p>สร้างชีทใหม่ที่ไม่มีเนื้อหา เพื่อพิมพ์และจัดรูปแบบสรุปด้วยตัวเอง</p>
            </div>
          </Card>
          <Card variant="default" className="create-type-card" onClick={() => document.getElementById('pdf-upload').click()}>
            <div className="create-type-icon"><Upload size={32} color="var(--color-success)"/></div>
            <div className="create-type-info">
              <h3>นำเข้าไฟล์ PDF</h3>
              <p>อัปโหลด PDF เพื่อเปิดอ่านและจดโน้ตทับเนื้อหาได้โดยตรง</p>
            </div>
            <input 
              id="pdf-upload" 
              type="file" 
              accept="application/pdf" 
              style={{ display: 'none' }} 
              onChange={handlePdfUpload} 
            />
          </Card>
        </div>
      </Modal>

      <Modal isOpen={showNameDialog} onClose={() => setShowNameDialog(false)} title="ตั้งชื่อสมุดจด" size="sm">
        <div style={{ padding: '20px 0', minWidth: '300px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--color-text)' }}>
            Book Name (ชื่อสมุด)
          </label>
          <input 
            type="text" 
            value={newBookName}
            onChange={(e) => setNewBookName(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '16px', outline: 'none' }}
            autoFocus
          />
          <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={() => setShowNameDialog(false)}>ยกเลิก</Button>
            <Button variant="primary" onClick={confirmCreateBook}>สร้างสมุดจด</Button>
          </div>
        </div>
      </Modal>
      <Modal isOpen={showAIModal} onClose={() => { setShowAIModal(false); setStreamedText(''); setIsStreaming(false); }} title="AI Summary Generator" size="lg">
        <div className="library-ai-modal-content">
          <FileUploadArea onFileSelect={handleFileUpload} onTextSubmit={handleFileUpload} />
          <StreamingOutput
            text={streamedText} isStreaming={isStreaming} showActions={!!streamedText && !isStreaming}
            onGenerateQuiz={() => { setShowAIModal(false); setShowQuizModal(true); }}
            onGenerateFlashcards={() => { setShowAIModal(false); setShowFlashcardModal(true); }}
            onSave={() => console.log('Save summary')}
            onSell={() => { setShowAIModal(false); setActiveTab('creator'); setShowUploadModal(true); }}
          />
        </div>
      </Modal>

      <Modal isOpen={showQuizModal} onClose={() => setShowQuizModal(false)} title="Quiz Time 🧪" size="lg">
        <QuizView quiz={sampleQuiz} />
      </Modal>

      <Modal isOpen={showFlashcardModal} onClose={() => setShowFlashcardModal(false)} title="Flashcards 🃏" size="md">
        <FlashcardView cards={MOCK_FLASHCARDS} />
      </Modal>

      <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Upload Sheet for Sale" size="lg">
        <UploadForm onSubmit={() => setShowUploadModal(false)} onCancel={() => setShowUploadModal(false)} />
      </Modal>
      {/* Slip Modal (Individual Item) */}
      {selectedHistoryItem && (
        <div className="receipt-overlay" onClick={() => setSelectedHistoryItem(null)}>
          <div className="receipt-modal animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="receipt-header">
              <div className="receipt-logo">
                <img src="/lovesheet_icon_final (1).png" alt="LOVESHEET" className="receipt-logo-img" />
                <span>LOVESHEET</span>
              </div>
              <button className="receipt-close" onClick={() => setSelectedHistoryItem(null)}><X size={20}/></button>
            </div>
            
            <div className="receipt-body">
              <div className="receipt-title-section">
                <h2>{t('library.receiptTitle')}</h2>
                <div className="receipt-status-badge">Completed</div>
              </div>

              <div className="receipt-info-grid">
                <div className="receipt-info-item">
                  <label>{t('library.orderId')}</label>
                  <span>{selectedHistoryItem.orderId}</span>
                </div>
                <div className="receipt-info-item">
                  <label>{t('library.purchaseDate')}</label>
                  <span>{selectedHistoryItem.date}</span>
                </div>
                <div className="receipt-info-item">
                  <label>{t('library.paymentMethod')}</label>
                  <span>LOVESHEET Wallet</span>
                </div>
              </div>

              <div className="receipt-items">
                <div className="receipt-item-group">
                  <div className="receipt-item-row">
                    <span className="receipt-item-name">{selectedHistoryItem.title}</span>
                    <span className="receipt-item-price">
                      {selectedHistoryItem.price === 0 ? t('explore.free') : `฿${(selectedHistoryItem.price / 100).toLocaleString()}`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="receipt-footer">
                <div className="receipt-total-row">
                  <span>{t('cart.total')}</span>
                  <span className="receipt-total-amount">
                    {selectedHistoryItem.price === 0 ? t('explore.free') : `฿${(selectedHistoryItem.price / 100).toLocaleString()}`}
                  </span>
                </div>
                <div className="receipt-transaction-id">
                  {t('library.transactionId')}: TXN-{Math.random().toString(36).substr(2, 9).toUpperCase()}
                </div>
              </div>
            </div>
            
            <div className="receipt-actions-footer">
              <div className="receipt-primary-actions">
                <button className="receipt-action-btn" onClick={() => handleRestoreItem(selectedHistoryItem)}>
                  <BookOpen size={16} /> <span>{t('library.restoreToLibrary')}</span>
                </button>
                <button className="receipt-action-btn" onClick={() => handleDownloadDevice(selectedHistoryItem)}>
                  <Upload size={16} style={{ transform: 'rotate(180deg)' }} /> <span>{t('library.downloadToDevice')}</span>
                </button>
              </div>
              <button className="receipt-print-btn" onClick={() => window.print()}>Print Receipt</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <Toast visible={!!toastMessage} message={toastMessage} type="success" />
    </div>
  );
}
