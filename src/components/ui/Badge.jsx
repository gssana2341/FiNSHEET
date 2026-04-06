/**
 * Badge component — STUB
 * TODO: Implement with variant colors (success, warning, error, info)
 */
export default function Badge({ children, variant = 'default' }) {
  const colors = {
    default: { bg: '#F1F5F9', color: '#64748B' },
    success: { bg: '#DCFCE7', color: '#16A34A' },
    warning: { bg: '#FEF3C7', color: '#F59E0B' },
    error: { bg: '#FEE2E2', color: '#DC2626' },
    primary: { bg: '#FFF7ED', color: '#F97316' },
  };
  const c = colors[variant] || colors.default;
  return (
    <span style={{
      display: 'inline-flex', padding: '3px 10px', borderRadius: 100,
      fontSize: 11, fontWeight: 600, background: c.bg, color: c.color,
    }}>
      {children}
    </span>
  );
}
