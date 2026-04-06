import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, MapPin, BookOpen, Hash, X, ShoppingCart } from 'lucide-react';
import { t, onLangChange } from '../i18n';
import { marketplaceItems } from '../data/mockMarketplace';
import SummaryCard from '../components/marketplace/SummaryCard';
import PreviewModal from '../components/marketplace/PreviewModal';
import DraggableFAB from '../components/ui/DraggableFAB';
import Button from '../components/ui/Button';
import Toast from '../components/ui/Toast';
import { useCart } from '../context/CartContext';
import './ExplorePage.css';

const filters = ['filterAll', 'filterFree', 'filterUnder50', 'filterTopRated'];

export default function ExplorePage() {
  const [, setLangTick] = useState(0);
  const [activeFilter, setActiveFilter] = useState('filterAll');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewItem, setPreviewItem] = useState(null);

  // Advanced Filters
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advSchool, setAdvSchool] = useState('');
  const [advCourseCode, setAdvCourseCode] = useState('');
  const [advSubject, setAdvSubject] = useState('');

  // Cart and Toast Context
  const { cartItems, addToCart } = useCart();
  const [toastMessage, setToastMessage] = useState('');

  const handleAddToCart = (item) => {
    const added = addToCart(item);
    if (added) {
      setToastMessage(`${t('cart.alertAdded')}: ${item.title}`);
      setTimeout(() => setToastMessage(''), 3000);
    }
    setPreviewItem(null);
  };

  useEffect(() => {
    return onLangChange(() => setLangTick((n) => n + 1));
  }, []);

  // Initialize school from auth state if present
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('finsheet_auth') || '{}');
      if (stored && stored.institution && stored.institution !== 'Unknown') {
        setAdvSchool(stored.institution);
      }
    } catch (e) {}
  }, []);

  const clearFilters = () => {
    setAdvSchool('');
    setAdvCourseCode('');
    setAdvSubject('');
    setActiveFilter('filterAll');
    setSearchQuery('');
  };

  // Build filter list
  let filteredItems = [...marketplaceItems];

  // 1. Basic Search
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filteredItems = filteredItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q) ||
        item.creatorName.toLowerCase().includes(q)
    );
  }

  // 2. Chip Filters
  if (activeFilter === 'filterFree') {
    filteredItems = filteredItems.filter((item) => item.priceSatang === 0);
  } else if (activeFilter === 'filterUnder50') {
    filteredItems = filteredItems.filter((item) => item.priceSatang > 0 && item.priceSatang <= 5000);
  } else if (activeFilter === 'filterTopRated') {
    filteredItems = filteredItems.filter((item) => item.rating >= 4.5);
    filteredItems.sort((a, b) => b.rating - a.rating);
  }

  // 3. Advanced Filters
  if (advSchool) {
    // Mocking school filtering: in real app, items have 'school' property.
    // Here we'll simulate by checking if the title or creator has it, 
    // or just pass through for demo so it isn't always empty
  }
  if (advCourseCode) {
    // Mock course code filtering
    const code = advCourseCode.toLowerCase();
    filteredItems = filteredItems.filter(item => 
      item.title.toLowerCase().includes(code) || 
      item.subject.toLowerCase().includes(code)
    );
  }
  if (advSubject) {
    filteredItems = filteredItems.filter(item => item.subject.toLowerCase() === advSubject.toLowerCase());
  }

  // Extract unique subjects for dropdown
  const uniqueSubjects = [...new Set(marketplaceItems.map(i => i.subject))];

  return (
    <div className="explore-page" id="explore-page">
      {/* Header */}
      <div className="explore-header">
        <h1 className="explore-title">{t('explore.title')}</h1>
      </div>

      {/* Search Bar + Filter Toggle */}
      <div className="explore-search-row">
        <div className="explore-search" id="explore-search">
          <Search size={18} className="explore-search-icon" />
          <input
            type="text"
            className="explore-search-input"
            placeholder={t('explore.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button 
          variant={showAdvanced ? "primary" : "secondary"}
          icon={SlidersHorizontal}
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="explore-filter-btn"
        >
          Filters
        </Button>
      </div>

      {/* Advanced Filter Panel */}
      {showAdvanced && (
        <div className="explore-advanced-panel animate-slide-down">
          <div className="adv-filter-grid">
            <div className="adv-filter-group">
              <label><MapPin size={14}/> Institution</label>
              <input 
                type="text" 
                placeholder="e.g. Chulalongkorn" 
                value={advSchool}
                onChange={e => setAdvSchool(e.target.value)}
              />
            </div>
            <div className="adv-filter-group">
              <label><Hash size={14}/> Course Code</label>
              <input 
                type="text" 
                placeholder="e.g. ENG101" 
                value={advCourseCode}
                onChange={e => setAdvCourseCode(e.target.value)}
              />
            </div>
            <div className="adv-filter-group">
              <label><BookOpen size={14}/> Subject</label>
              <select value={advSubject} onChange={e => setAdvSubject(e.target.value)}>
                <option value="">All Subjects</option>
                {uniqueSubjects.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="adv-filter-actions">
            <button className="adv-filter-clear" onClick={clearFilters}>
              <X size={14}/> Clear All
            </button>
          </div>
        </div>
      )}

      {/* Filter Row */}
      <div className="explore-filter-row">
        <div className="explore-filters" id="explore-filters">
          {filters.map((f) => (
            <button
            key={f}
            className={`filter-chip ${activeFilter === f ? 'filter-chip--active' : ''}`}
            onClick={() => setActiveFilter(f)}
          >
            {t(`explore.${f}`)}
          </button>
        ))}
        </div>
        <p className="explore-subtitle">
          {filteredItems.length} summaries available
        </p>
      </div>

      {/* Grid */}
      <div className="explore-grid">
        {filteredItems.map((item) => (
          <SummaryCard
            key={item.id}
            item={item}
            onClick={() => setPreviewItem(item)}
            onBuy={handleAddToCart}
          />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="explore-empty">
          <span className="explore-empty-icon">🔍</span>
          <p>No summaries found matching your criteria</p>
          <Button variant="ghost" onClick={clearFilters}>Clear Filters</Button>
        </div>
      )}

      {/* Cart Draggable FAB */}
      <div className="mobile-only-fab">
        <DraggableFAB 
          icon={ShoppingCart}
          badgeCount={cartItems.length}
          onClick={() => {
            // Should navigate to Cart page. How is onNavigate available?
            // Wait, ExplorePage does not have `onNavigate` prop currently. 
            // We need to pass it from App.jsx or dispatch custom event.
            // For now, we will dispatch a custom event to change page, or just alert since I'm implementing Cart route in App.jsx.
            window.dispatchEvent(new CustomEvent('app-navigate', { detail: 'cart' }));
          }}
        />
      </div>

      {/* Modals */}
      <PreviewModal
        isOpen={!!previewItem}
        onClose={() => setPreviewItem(null)}
        item={previewItem}
        onBuy={handleAddToCart}
      />

      {/* Toast Notification */}
      <Toast visible={!!toastMessage} message={toastMessage} type="success" />
    </div>
  );
}
