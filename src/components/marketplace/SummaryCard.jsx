import { Star, ShoppingCart } from 'lucide-react';
import { t } from '../../i18n';
import { subjectColors } from '../../data/mockMarketplace';
import './SummaryCard.css';

export default function SummaryCard({ item, onClick, onBuy }) {
  const priceDisplay = item.priceSatang === 0
    ? t('explore.free')
    : `฿${(item.priceSatang / 100).toFixed(0)}`;

  const subjectColor = subjectColors[item.subject] || '#F97316';

  return (
    <div className="summary-card" id={`summary-${item.id}`} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      {/* Thumbnail / Cover */}
      <div className="summary-card-cover">
        <div className="summary-card-subject-badge" style={{ backgroundColor: subjectColor }}>
          {item.subject}
        </div>
        {item.coverUrl ? (
          <img src={item.coverUrl} alt="cover" className="summary-card-image" />
        ) : (
          <div className="summary-card-cover-inner" style={{ background: `linear-gradient(135deg, ${subjectColor}15, ${subjectColor}30)` }}>
            <span className="summary-card-cover-icon">📄</span>
            <span className="summary-card-pages">{item.totalPages} {t('explore.pages')}</span>
          </div>
        )}
      </div>

      <div className="summary-card-content">
        {/* Title */}
        <h3 className="summary-card-title line-clamp-2">{item.title}</h3>

        {/* Info Row: Rating & Price */}
        <div className="summary-card-info-row">
          <div className="summary-card-rating">
            <Star size={12} fill="#F59E0B" stroke="#F59E0B" />
            <span>{item.rating}</span>
          </div>
          <div className="summary-card-price-container">
            <span className={`summary-card-price ${item.priceSatang === 0 ? 'summary-card-price--free' : ''}`}>
              {priceDisplay}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          className="summary-card-btn-cart-modern"
          onClick={(e) => {
            e.stopPropagation();
            onBuy(item);
          }}
        >
          <ShoppingCart size={16} />
          <span>{t('explore.addToCart')}</span>
        </button>
      </div>
    </div>
  );
}
