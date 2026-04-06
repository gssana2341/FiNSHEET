import { MoreHorizontal, Edit, Trash2, Eye, Star } from 'lucide-react';
import { useState } from 'react';
import './ItemManager.css';

export default function ItemManager({ items = [], onEdit = () => {}, onDelete = () => {} }) {
  const [openMenuId, setOpenMenuId] = useState(null);

  const statusStyles = {
    published: { bg: 'var(--color-success-light)', color: 'var(--color-success)' },
    pending: { bg: 'var(--color-warning-light)', color: 'var(--color-warning)' },
    hidden: { bg: 'var(--color-error-light)', color: 'var(--color-error)' },
  };

  return (
    <div className="item-manager" id="item-manager">
      {items.map((item) => {
        const style = statusStyles[item.status] || statusStyles.pending;
        return (
          <div key={item.id} className="item-manager-row">
            <div className="item-manager-info">
              <span className="item-manager-title">{item.title}</span>
              <div className="item-manager-meta">
                <span>{item.subject}</span>
                <span>·</span>
                <span>฿{(item.priceSatang / 100).toFixed(0)}</span>
                <span>·</span>
                <span className="item-manager-stat"><Eye size={12} /> {item.totalViews}</span>
                <span className="item-manager-stat"><Star size={12} /> {item.rating || '—'}</span>
              </div>
            </div>

            <div className="item-manager-right">
              <span className="item-manager-sold">{item.totalSold} sold</span>
              <span className="item-manager-status" style={{ background: style.bg, color: style.color }}>
                {item.status}
              </span>
              <div className="item-manager-actions">
                <button
                  className="item-manager-menu-btn"
                  onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                >
                  <MoreHorizontal size={18} />
                </button>
                {openMenuId === item.id && (
                  <div className="item-manager-dropdown">
                    <button onClick={() => { onEdit(item); setOpenMenuId(null); }}>
                      <Edit size={14} /> Edit
                    </button>
                    <button className="item-manager-delete" onClick={() => { onDelete(item); setOpenMenuId(null); }}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
      {items.length === 0 && (
        <div className="item-manager-empty">
          <p>No items yet. Upload your first summary!</p>
        </div>
      )}
    </div>
  );
}
