import { useState, useEffect } from 'react';
import { Compass, BookOpen, PenTool, User, ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { t, onLangChange } from '../../i18n';
import './Sidebar.css';

const navItems = [
  { id: 'explore', icon: Compass, labelKey: 'nav.explore' },
  { id: 'library', icon: BookOpen, labelKey: 'nav.library' },
  { id: 'cart', icon: ShoppingCart, labelKey: 'nav.cart', fallbackLabel: 'Cart' },
  { id: 'profile', icon: User, labelKey: 'nav.profile' },
];

export default function Sidebar({ activePage, onNavigate }) {
  const [, setLangTick] = useState(0);
  const { cartItems } = useCart();

  useEffect(() => {
    return onLangChange(() => setLangTick((n) => n + 1));
  }, []);

  return (
    <aside className="sidebar" id="sidebar-nav">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">F</div>
        <span className="sidebar-logo-text">FiNSHEET</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              className={`sidebar-item ${isActive ? 'sidebar-item--active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <div className="nav-icon" style={{ position: 'relative' }}>
                <Icon size={20} />
                {item.id === 'cart' && cartItems.length > 0 && (
                  <span className="sidebar-badge">{cartItems.length}</span>
                )}
              </div>
              <span>{t(item.labelKey) || item.fallbackLabel}</span>
              {isActive && <div className="sidebar-item-indicator" />}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-version">v1.0 MVP</div>
      </div>
    </aside>
  );
}
