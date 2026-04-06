import { Lock } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { t } from '../../i18n';
import { subjectColors } from '../../data/mockMarketplace';
import './PreviewModal.css';

export default function PreviewModal({ isOpen, onClose, item, onBuy }) {
  if (!item) return null;

  const subjectColor = subjectColors[item.subject] || '#F97316';
  const priceDisplay = item.priceSatang === 0
    ? t('explore.free')
    : `฿${(item.priceSatang / 100).toFixed(0)}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('modal.previewTitle')} size="lg" id="preview-modal">
      <div className="preview-modal-content">
        {/* Top Hero Section (2-Column on Desktop) */}
        <div className="preview-hero-section">
          {/* Left: Hero Cover */}
          <div 
            className="preview-hero-cover" 
            style={item.coverUrl ? { backgroundImage: `url(${item.coverUrl})` } : { background: `linear-gradient(135deg, ${subjectColor}15, ${subjectColor}30)`, borderColor: subjectColor }}
          >
            <div className="preview-hero-badge" style={{ background: subjectColor }}>{item.subject}</div>
            {!item.coverUrl && <span className="preview-hero-placeholder">📄 {item.totalPages} Pages</span>}
          </div>

          {/* Right: Essential Purchase Meta */}
          <div className="preview-hero-meta">
            <h2 className="preview-hero-title">{item.title}</h2>
            
            <div className="preview-rating-row">
              <span className="preview-rating-badge">★ {item.rating}</span>
              <span className="preview-review-count">({item.reviewCount} รีวิว)</span>
              <span className="preview-sold-badge">ขายแล้ว {item.totalSold} ครั้ง</span>
            </div>

            <div className="preview-creator-row">
              <span className="preview-creator-name">✍️ {item.creatorName}</span>
              <span className="preview-creator-university">• {item.university}</span>
            </div>
            
            <div className="preview-action-box">
              <div className="preview-price">{priceDisplay}</div>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => { onClose(); onBuy(item); }}
                id="preview-buy-btn"
              >
                {item.priceSatang === 0 ? t('explore.free') : t('explore.addToCart')}
              </Button>
            </div>
          </div>
        </div>

        {/* Middle Details Grid */}
        <div className="preview-details-grid">
          <div className="preview-desc-section">
            <h4>รายละเอียดเนื้อหา</h4>
            <div className="preview-desc-text">{item.description}</div>
            {item.tags && item.tags.length > 0 && (
              <div className="preview-tags">
                {item.tags.map(tag => (
                  <span key={tag} className="preview-tag-chip">#{tag}</span>
                ))}
              </div>
            )}
          </div>
          <div className="preview-info-box">
            <h4>ข้อมูลสรุป</h4>
            <div className="preview-info-row">
              <span className="preview-info-label">วิชา</span>
              <span className="preview-info-value">{item.subject}</span>
            </div>
            <div className="preview-info-row">
              <span className="preview-info-label">สถาบัน</span>
              <span className="preview-info-value">{item.university}</span>
            </div>
            <div className="preview-info-row">
              <span className="preview-info-label">จำนวนหน้า</span>
              <span className="preview-info-value">{item.totalPages} หน้า</span>
            </div>
            <div className="preview-info-row">
              <span className="preview-info-label">ตัวอย่างฟรี</span>
              <span className="preview-info-value">{item.previewPages} หน้า</span>
            </div>
          </div>
        </div>

        {/* Bottom Preview Gallery */}
        <div className="preview-gallery-section">
          <h4>ดูตัวอย่างเนื้อหา</h4>
          <div className="preview-pages">
            {/* Page 1 - visible */}
            <div className="preview-page preview-page--visible" style={{ borderTopColor: subjectColor }}>
              <div className="preview-page-header">
                <h3>{item.title}</h3>
                <span className="preview-page-num">1 / {item.totalPages}</span>
              </div>
              <div className="preview-page-body" style={item.coverUrl ? { backgroundImage: `url(${item.coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', padding: 0 } : {}}>
                {!item.coverUrl && (
                  <div className="preview-mock-content">
                    <h4 className="mock-title">🔹 สรุป: {item.subject}</h4>
                    <p>หัวข้อนี้รวบรวมเนื้อหาสำคัญที่สรุปจากสไลด์อาจารย์และหนังสือเรียน พร้อมเทคนิคการจำ...</p>
                    <ul className="mock-list">
                      <li>จุดประสงค์การเรียนรู้และขอบเขตเนื้อหา</li>
                      <li>Keyword สำคัญที่มักจะนำไปใช้ต่อยอด</li>
                    </ul>
                    <div className="mock-highlight">
                      📌 <strong>Note:</strong> ระวังจุดหลอกที่พบบ่อยในการทำข้อสอบ
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Page 2 - visible */}
            <div className="preview-page preview-page--visible">
              <div className="preview-page-header">
                <span className="preview-page-num">2 / {item.totalPages}</span>
              </div>
              <div className="preview-page-body preview-mock-content">
                <h4 className="mock-subtitle">สูตรและแนวคิดหลัก</h4>
                <p>เพื่อให้เข้าใจเนื้อหาในระดับประยุกต์ เราจำเป็นต้องแยกองค์ประกอบของทฤษฎีออกเป็นส่วนๆ ดังนี้:</p>
                <div className="mock-equation">
                  A = B + (C × D) / <span className="mock-math-var">n</span>
                </div>
                <p>เมื่อแทนค่าคงที่ลงไปในสมการ จะสามารถทำนายผลลัพธ์ของระบบได้อย่างแม่นยำ (อ้างอิงจากบทที่ 2)</p>
                <ul className="mock-list">
                  <li>กรณี <strong>A {'>'} 0</strong>: ระบบเสถียร</li>
                  <li>กรณี <strong>A {'<'} 0</strong>: ระบบไม่เสถียร ต้องปรับค่าสัมประสิทธิ์</li>
                </ul>
              </div>
            </div>

            {/* Page 3 - locked */}
            <div className="preview-page preview-page--locked">
              <div className="preview-page-blur preview-mock-content">
                <h4 className="mock-subtitle">ตัวอย่างข้อสอบ (Past Papers)</h4>
                <p>จากสถิติพบว่าใน 3 ปีล่าสุด อาจารย์มักจะออกโจทย์ลักษณะนี้...</p>
                <p><strong>ตัวอย่าง 1:</strong> จงอธิบายความสัมพันธ์ระหว่างตัวแปร X และ Y หากมีการเปลี่ยนเงื่อนไขสภาวะแวดล้อม...</p>
                <div className="mock-highlight">
                  🔑 <strong>เฉลย:</strong> กุญแจสำคัญคือการอ้างอิงถึงกฎข้อที่ 3 เพราะ...
                </div>
              </div>
              <div className="preview-page-lock-overlay">
                <Lock size={32} />
                <p>{t('modal.lockedContent')}</p>
                <span className="preview-remaining">+{item.totalPages - 2} {t('explore.pages')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
