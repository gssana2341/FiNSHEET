import { useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { t } from '../../i18n';
import { currentUser } from '../../data/mockUsers';
import './PurchaseModal.css';

export default function PurchaseModal({ isOpen, onClose, item }) {
  const [status, setStatus] = useState('confirm'); // confirm | success | error

  if (!item) return null;

  const priceThb = item.priceSatang / 100;
  const balanceThb = currentUser.creditBalance / 100;
  const hasEnough = currentUser.creditBalance >= item.priceSatang;
  const afterPurchase = balanceThb - priceThb;

  const handlePurchase = () => {
    if (!hasEnough) return;
    // TODO: Actual purchase logic
    setStatus('success');
    setTimeout(() => {
      setStatus('confirm');
      onClose();
    }, 2000);
  };

  const handleClose = () => {
    setStatus('confirm');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('modal.purchaseTitle')} size="sm" id="purchase-modal">
      <div className="purchase-modal-content">
        {status === 'confirm' && (
          <>
            <p className="purchase-desc">{t('modal.purchaseDesc')}</p>
            <div className="purchase-item-name">{item.title}</div>

            <div className="purchase-breakdown">
              <div className="purchase-row">
                <span>{t('modal.price')}</span>
                <span className="purchase-amount">฿{priceThb}</span>
              </div>
              <div className="purchase-divider" />
              <div className="purchase-row">
                <span>{t('modal.currentBalance')}</span>
                <span className="purchase-balance">฿{balanceThb}</span>
              </div>
              <div className="purchase-row">
                <span>{t('modal.afterPurchase')}</span>
                <span className={`purchase-after ${!hasEnough ? 'purchase-after--negative' : ''}`}>
                  ฿{afterPurchase.toFixed(0)}
                </span>
              </div>
            </div>

            {!hasEnough && (
              <div className="purchase-error">
                <AlertCircle size={16} />
                <span>{t('modal.insufficientCredits')}</span>
              </div>
            )}

            <div className="purchase-actions">
              <Button variant="ghost" onClick={handleClose}>
                {t('modal.cancel')}
              </Button>
              <Button
                variant="primary"
                onClick={handlePurchase}
                disabled={!hasEnough}
                id="confirm-purchase-btn"
              >
                {t('modal.confirm')} — ฿{priceThb}
              </Button>
            </div>
          </>
        )}

        {status === 'success' && (
          <div className="purchase-success">
            <CheckCircle size={48} />
            <p>{t('modal.purchaseSuccess')}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
