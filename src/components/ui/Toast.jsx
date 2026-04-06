import { CheckCircle2, Info, AlertTriangle, AlertCircle } from 'lucide-react';

export default function Toast({ message = '', type = 'info', visible = false }) {
  if (!visible) return null;
  
  const icons = {
    success: <CheckCircle2 size={18} color="#16A34A" />,
    error: <AlertCircle size={18} color="#DC2626" />,
    info: <Info size={18} color="#3B82F6" />,
    warning: <AlertTriangle size={18} color="#F59E0B" />
  };

  return (
    <>
      <style>{`
        @keyframes toastFadeSlide {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
      <div style={{
        position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)',
        padding: '12px 24px', borderRadius: 50, background: 'var(--color-surface, #fff)',
        color: 'var(--color-text-primary, #111)', fontWeight: 600, fontSize: 14, 
        boxShadow: '0 10px 30px rgba(0,0,0,0.12)', border: '1px solid var(--color-border)',
        zIndex: 99999, animation: 'toastFadeSlide 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        display: 'flex', alignItems: 'center', gap: '8px', 
      }}>
        {icons[type] || icons.info}
        {message}
      </div>
    </>
  );
}
