/**
 * Skeleton loading component — STUB
 * TODO: Implement shimmer animation variants (text, card, circle)
 */
export default function Skeleton({ width = '100%', height = 16, borderRadius = 8 }) {
  return (
    <div style={{
      width, height, borderRadius,
      background: 'linear-gradient(90deg, var(--color-surface-2) 25%, var(--color-border-subtle) 50%, var(--color-surface-2) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
    }} />
  );
}
