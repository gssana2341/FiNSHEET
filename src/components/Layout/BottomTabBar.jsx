import { Home, Compass, BookOpen, PenTool, User, ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './BottomTabBar.css';

const tabs = [
  { id: 'explore', icon: Compass },
  { id: 'library', icon: BookOpen },
  { id: 'cart', icon: ShoppingCart },
  { id: 'profile', icon: User },
];

export default function BottomTabBar({ activePage, onNavigate }) {
  const { cartItems } = useCart();
  
  return (
    <nav className="bottom-tab-bar" id="bottom-tab-bar">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activePage === tab.id;
        return (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            className={`tab-item ${isActive ? 'tab-item--active' : ''}`}
            onClick={() => onNavigate(tab.id)}
          >
            <div className={`tab-icon-wrap ${isActive ? 'tab-icon-wrap--active' : ''}`} style={{ position: 'relative' }}>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              {tab.id === 'cart' && cartItems.length > 0 && (
                <span className="bottombar-badge">{cartItems.length}</span>
              )}
            </div>
            {isActive && <div className="tab-dot" />}
          </button>
        );
      })}
    </nav>
  );
}
