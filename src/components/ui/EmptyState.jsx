/**
 * EmptyState component — STUB
 * TODO: Implement with illustration, title, description, and CTA button
 */
export default function EmptyState({ icon = '📭', title = 'Nothing here yet', description = '', actionLabel, onAction }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '64px 24px', gap: 12, color: 'var(--color-text-secondary)',
    }}>
      <span style={{ fontSize: '3rem' }}>{icon}</span>
      <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)' }}>{title}</p>
      {description && <p style={{ fontSize: 14 }}>{description}</p>}
      {actionLabel && (
        <button onClick={onAction} style={{
          marginTop: 8, padding: '10px 20px', borderRadius: 10,
          background: 'var(--color-primary)', color: 'white', fontWeight: 600,
          border: 'none', cursor: 'pointer',
        }}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
