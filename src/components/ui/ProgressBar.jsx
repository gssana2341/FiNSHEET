/**
 * ProgressBar component — STUB
 * TODO: Implement animated progress bar with label
 */
export default function ProgressBar({ value = 0, max = 100, label = '' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div>
      {label && <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 4, display: 'block' }}>{label}</span>}
      <div style={{ width: '100%', height: 8, background: 'var(--color-surface-2)', borderRadius: 100, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--gradient-hero)', borderRadius: 100, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}
