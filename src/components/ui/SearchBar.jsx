import { Search } from 'lucide-react';

/**
 * SearchBar component — STUB
 * TODO: Implement debounced search with suggestions dropdown
 */
export default function SearchBar({ placeholder = 'Search...', value = '', onChange = () => {}, id }) {
  return (
    <div className="search-bar-stub" id={id} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <Search size={18} style={{ position: 'absolute', left: 12, color: '#A8A29E', pointerEvents: 'none' }} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%', height: 44, padding: '0 16px 0 40px',
          border: '1.5px solid var(--color-border)', borderRadius: 12,
          background: 'var(--color-surface)', fontSize: 16,
          outline: 'none',
        }}
      />
    </div>
  );
}
