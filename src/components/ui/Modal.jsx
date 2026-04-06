import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

/**
 * Modal component with backdrop, close on ESC/click-outside
 * @param {'sm'|'md'|'lg'} size
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  id,
  showClose = true,
}) {
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      className="modal-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
      id={id}
    >
      <div className={`modal-container modal--${size}`}>
        {(title || showClose) && (
          <div className="modal-header">
            {title && <h2 className="modal-title">{title}</h2>}
            {showClose && (
              <button
                className="modal-close"
                onClick={onClose}
                id={id ? `${id}-close` : undefined}
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
