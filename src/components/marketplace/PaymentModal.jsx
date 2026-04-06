import { useState, useEffect } from 'react';
import { QrCode, CreditCard, ChevronRight, CheckCircle, X } from 'lucide-react';
import Button from '../ui/Button';
import './PaymentModal.css';

export default function PaymentModal({ amount, onClose, onSuccess }) {
  const [method, setMethod] = useState('promptpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const displayAmount = (amount / 100).toFixed(2);

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    // Simulate network delay for payment verification
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 2000);
    }, 1500);
  };

  return (
    <div className="payment-overlay">
      <div className="payment-modal animate-slide-up">
        {isSuccess ? (
          <div className="payment-success-view">
            <CheckCircle size={64} color="var(--color-success)" />
            <h2>Payment Successful!</h2>
            <p>Your items are now securely unlocked in My Library.</p>
          </div>
        ) : (
          <>
            <div className="payment-header">
              <h2>Checkout</h2>
              <button className="payment-close-btn" onClick={onClose}><X size={20}/></button>
            </div>

            <div className="payment-amount-box">
              <span className="amount-label">Total to Pay</span>
              <span className="payment-amount">฿{displayAmount}</span>
            </div>

            <div className="payment-methods">
              <h3>Select Payment Method</h3>
              <div 
                className={`payment-option ${method === 'promptpay' ? 'active' : ''}`}
                onClick={() => setMethod('promptpay')}
              >
                <div className="payment-option-icon qr-bg"><QrCode size={20} /></div>
                <div className="payment-option-info">
                  <span className="payment-option-title">Thai QR PromptPay</span>
                  <span className="payment-option-desc">Scan to pay instantly</span>
                </div>
                <div className="payment-option-radio">
                  {method === 'promptpay' && <CheckCircle size={18} fill="var(--color-primary)" color="white"/>}
                </div>
              </div>

              <div 
                className={`payment-option ${method === 'card' ? 'active' : ''}`}
                onClick={() => setMethod('card')}
              >
                <div className="payment-option-icon card-bg"><CreditCard size={20} /></div>
                <div className="payment-option-info">
                  <span className="payment-option-title">Credit / Debit Card</span>
                  <span className="payment-option-desc">Visa, Mastercard, JCB</span>
                </div>
                <div className="payment-option-radio">
                  {method === 'card' && <CheckCircle size={18} fill="var(--color-primary)" color="white"/>}
                </div>
              </div>
            </div>

            {method === 'promptpay' && (
              <div className="payment-qr-simulation">
                <div className="qr-placeholder">
                  [ Mock QR Code Generation ]
                  <br/><br/>
                  <QrCode size={100} opacity={0.2} />
                </div>
                <p>Please open your mobile banking app to scan.</p>
              </div>
            )}

            <div className="payment-footer">
              <Button 
                variant="primary" 
                fullWidth 
                size="lg" 
                onClick={handleSimulatePayment}
                disabled={isProcessing}
              >
                {isProcessing ? 'Verifying payment...' : `Simulate Pay ฿${displayAmount}`}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
