import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { t, getLang, setLang, onLangChange } from '../../i18n';
import { currentUser } from '../../data/mockUsers';
import { useCart } from '../../context/CartContext';
import StreakCounter from '../gamification/StreakCounter';
import StreakPopover from '../gamification/StreakPopover';
import './TopBar.css';

export default function TopBar({ activePage, onNavigate }) {
  const [, setLangTick] = useState(0);
  const [isStreakOpen, setIsStreakOpen] = useState(false);
  const { cartItems } = useCart();

  useEffect(() => {
    return onLangChange(() => setLangTick((n) => n + 1));
  }, []);

  const toggleLang = () => {
    setLang(getLang() === 'en' ? 'th' : 'en');
  };

  const centerTabs = [
    { id: 'explore', labelKey: 'nav.explore' },
    { id: 'library', labelKey: 'nav.library' },
    { id: 'cart', labelKey: 'nav.cart' }
  ];

  return (
    <header className="topbar" id="topbar">
      <div className="topbar-left">
        <div className="topbar-logo-brand" onClick={() => onNavigate && onNavigate('explore')}>
          <img src="/lovesheet_icon_final (1).png" alt="LOVESHEET Logo" className="topbar-logo-img" />
          <span className="topbar-logo-text">LOVESHEET</span>
        </div>
      </div>

      <div className="topbar-center">
        <div className="topbar-pill-nav">
          {centerTabs.map(tab => (
            <button 
              key={tab.id}
              className={`pill-tab ${activePage === tab.id ? 'pill-tab--active' : ''}`}
              onClick={() => onNavigate && onNavigate(tab.id)}
            >
              {t(tab.labelKey)}
              {tab.id === 'cart' && cartItems.length > 0 && (
                <span className="pill-badge">{cartItems.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="topbar-right">
        <div className="topbar-streak-wrapper" onMouseEnter={() => setIsStreakOpen(true)} onMouseLeave={() => setIsStreakOpen(false)}>
          <StreakCounter days={currentUser.streakDays} />
          {isStreakOpen && (
            <StreakPopover 
              days={currentUser.streakDays} 
              studyMinutes={45} 
              goalMinutes={60} 
              onClose={() => setIsStreakOpen(false)}
            />
          )}
        </div>

        <button
          className="topbar-lang-btn"
          onClick={toggleLang}
          id="lang-toggle"
          title="Switch Language"
        >
          <Globe size={18} />
          <span>{getLang().toUpperCase()}</span>
        </button>

        <div className="topbar-avatar" id="user-avatar" onClick={() => onNavigate && onNavigate('profile')}>
          {currentUser.displayName.charAt(0)}
        </div>
      </div>
    </header>
  );
}
