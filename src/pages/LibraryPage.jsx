import { useState, useEffect } from 'react';
import { BookOpen, Layers, PenTool, Upload, Brain, TrendingUp, Presentation, Plus, Eye, ShoppingCart, LayoutGrid, List as ListIcon, FileText, MoreVertical } from 'lucide-react';
import { t, onLangChange } from '../i18n';
import { libraryItems } from '../data/mockLibrary';
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
  
  // Modals
  const [showCreateTypeModal, setShowCreateTypeModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showFlashcardModal, setShowFlashcardModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isTablet, setIsTablet] = useState(window.innerWidth > 768);
  const [openMenuId, setOpenMenuId] = useState(null);

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

  const tabs = [
    { id: 'my', label: t('library.tabMySummaries'), icon: BookOpen },
    { id: 'flashcards', label: t('library.tabFlashcards'), icon: Layers },
    { id: 'creator', label: t('library.tabCreatorCenter'), icon: PenTool },
  ];

  // Filtering for Library (Combining AI and Purchased)
  const filtered = libraryItems.filter((item) => {
    if (activeTab === 'my') return item.type === 'ai_summary' || item.type === 'purchased';
    if (activeTab === 'flashcards') return item.type === 'flashcard';
    return false;
  });

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
        {activeTab !== 'creator' && (
          <div className="view-toggle-group" style={{ marginLeft: 'auto', marginBottom: '8px' }}>
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
        )}
      </div>

      <div className="stub-content-area">
        {activeTab === 'creator' ? (
          <CreatorDashboard />
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
                      
                      <div className="lib-card-more-wrapper" onClick={(e) => e.stopPropagation()}>
                        <button 
                          className={`lib-card-more-btn ${openMenuId === item.id ? 'active' : ''}`}
                          onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                        >
                          <MoreVertical size={18} />
                        </button>
                        
                        {openMenuId === item.id && (
                          <div className="lib-card-dropdown animate-fade-in shadow-xl">
                            <button className="dropdown-item" onClick={() => { setOpenMenuId(null); setShowQuizModal(true); }}>
                              <Brain size={14} /> <span>{t('home.takeQuiz')}</span>
                            </button>
                            <button className="dropdown-item" onClick={() => { setOpenMenuId(null); setShowFlashcardModal(true); }}>
                              <Layers size={14} /> <span>{t('library.tabFlashcards')}</span>
                            </button>
                            <div className="dropdown-divider" />
                            <button className="dropdown-item dropdown-item--danger" onClick={() => setOpenMenuId(null)}>
                              <X size={14} /> {t('common.delete')}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="lib-grid-info">
                      <h4 className="lib-grid-title truncate">{item.title}</h4>
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
          <Card variant="default" className="create-type-card" onClick={() => { setShowCreateTypeModal(false); alert('สร้างสมุดจดเปล่าสำเร็จ!'); }}>
            <div className="create-type-icon"><FileText size={32} color="var(--color-info)"/></div>
            <div className="create-type-info">
              <h3>สมุดจด/สรุปว่างเปล่า</h3>
              <p>สร้างชีทใหม่ที่ไม่มีเนื้อหา เพื่อพิมพ์และจัดรูปแบบสรุปด้วยตัวเอง</p>
            </div>
          </Card>
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
    </div>
  );
}
