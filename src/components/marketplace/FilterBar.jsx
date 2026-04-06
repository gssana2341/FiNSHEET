/**
 * FilterBar component — STUB
 * TODO: Implement marketplace filter sidebar/drawer with:
 * - Subject filter (multi-select)
 * - University filter
 * - Price range slider
 * - Rating filter
 * - Sort options
 */
export default function FilterBar({ onFilter = () => {} }) {
  return (
    <div style={{
      padding: 16, background: 'var(--color-surface)', borderRadius: 16,
      border: '1px solid var(--color-border)',
    }}>
      <p style={{ color: 'var(--color-text-tertiary)', fontSize: 14, textAlign: 'center' }}>
        🔧 Advanced Filters — Coming Soon
      </p>
    </div>
  );
}
