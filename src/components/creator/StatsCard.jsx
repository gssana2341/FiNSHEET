/**
 * StatsCard component — STUB
 * TODO: Implement stat card with:
 * - Icon + label + value
 * - Comparison with previous period (up/down arrow)
 * - Animated number counter
 */
export default function StatsCard({ label = '', value = '', icon = null, trend = null }) {
  return (
    <div style={{
      padding: 16, background: 'var(--color-surface)', borderRadius: 16,
      border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 12,
    }}>
      {icon && <span style={{ fontSize: '1.5rem' }}>{icon}</span>}
      <div>
        <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{label}</span>
        <p style={{ fontSize: 20, fontWeight: 700 }}>{value}</p>
      </div>
    </div>
  );
}
