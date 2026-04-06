import { useState } from 'react';
import { ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import Button from '../components/ui/Button';
import PaymentModal from '../components/marketplace/PaymentModal';
import { t } from '../i18n';
import './CartPage.css';

export default function CartPage() {
  const { cartItems, removeFromCart, getTotalSatang, clearCart } = useCart();
  const [showPayment, setShowPayment] = useState(false);

  // Group identically added items or just show list
  const total = getTotalSatang();

  const handleCheckoutSuccess = () => {
    setShowPayment(false);
    clearCart();
    alert(`🎉 ${t('cart.checkoutSuccess')}`);
  };

  return (
    <div className="cart-page animate-fade-in">
      <div className="cart-header">
        <h1>{t('cart.title')}</h1>
        <p>{cartItems.length} {t('cart.itemsInCart')}</p>
      </div>

      {cartItems.length === 0 ? (
        <div className="cart-empty">
          <ShoppingCart size={48} className="cart-empty-icon" />
          <h2>{t('cart.emptyTitle')}</h2>
          <p>{t('cart.emptyDesc')}</p>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items-list">
            {cartItems.map((item, index) => (
              <div key={`${item.id}-${index}`} className="cart-item-card">
                <div className="cart-item-info">
                  <span className="cart-item-subject">{item.subject}</span>
                  <h3 className="cart-item-title">{item.title}</h3>
                  <p className="cart-item-creator">{t('cart.by')} {item.creatorName}</p>
                </div>
                <div className="cart-item-actions">
                  <span className="cart-item-price">
                    {item.priceSatang === 0 ? t('explore.free') : `฿${(item.priceSatang / 100).toFixed(0)}`}
                  </span>
                  <button className="cart-remove-btn" onClick={() => removeFromCart(item.id)}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary-panel">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>{t('cart.subtotal')}</span>
              <span>฿{(total / 100).toFixed(0)}</span>
            </div>
            <div className="summary-row">
              <span>{t('cart.tax')}</span>
              <span>฿0</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-row summary-total">
              <span>{t('cart.total')}</span>
              <span>฿{(total / 100).toFixed(0)}</span>
            </div>
            <Button 
              variant="primary" 
              fullWidth 
              size="lg" 
              className="checkout-btn"
              onClick={() => setShowPayment(true)}
            >
              {t('cart.checkout')} <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      )}

      {showPayment && (
        <PaymentModal 
          amount={total} 
          onClose={() => setShowPayment(false)} 
          onSuccess={handleCheckoutSuccess} 
        />
      )}
    </div>
  );
}
