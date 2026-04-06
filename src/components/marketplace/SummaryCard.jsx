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
      <div className="summary-card-cover" style={{ borderColor: subjectColor }}>
        {item.coverUrl ? (
          <img src={item.coverUrl} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
        ) : (
          <div className="summary-card-cover-inner" style={{ background: `linear-gradient(135deg, ${subjectColor}15, ${subjectColor}30)` }}>
            <span className="summary-card-cover-icon">📄</span>
            <span className="summary-card-pages">{item.totalPages} pages</span>
          </div>
        )}
      </div>

      <div className="summary-card-content">
        {/* Title */}
        <h3 className="summary-card-title line-clamp-2">{item.title}</h3>

        {/* Rating & Subject */}
        <div className="summary-card-meta">
          <div className="summary-card-subject" style={{ color: subjectColor }}>
            {item.subject}
          </div>
          <div className="summary-card-rating">
            <Star size={12} fill="#F59E0B" stroke="#F59E0B" />
            <span>{item.rating}</span>
          </div>
        </div>
      </div>

      {/* Footer: Price + Add to Cart */}
      <div className="summary-card-footer">
        <span className={`summary-card-price ${item.priceSatang === 0 ? 'summary-card-price--free' : ''}`}>
          {priceDisplay}
        </span>
        <button
          className="summary-card-btn-cart"
          onClick={(e) => {
            e.stopPropagation();
            onBuy(item);
          }}
        >
          <ShoppingCart size={16} />
        </button>
      </div>
    </div>
  );
}
