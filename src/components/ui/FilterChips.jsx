/**
 * FilterChips component — STUB
 * TODO: Implement scrollable filter chip bar with active state
 */
export default function FilterChips({ filters = [], active = '', onSelect = () => {} }) {
  return (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
      {filters.map((f) => (
        <button
          key={f.id}
          onClick={() => onSelect(f.id)}
          style={{
            padding: '8px 16px', borderRadius: 100, border: '1px solid var(--color-border)',
            background: active === f.id ? 'var(--color-primary)' : 'var(--color-surface)',
            color: active === f.id ? 'white' : 'var(--color-text-secondary)',
            fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', cursor: 'pointer',
          }}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
