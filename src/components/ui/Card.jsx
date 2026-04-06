import './Card.css';

/**
 * Card container component
 * @param {'default'|'elevated'|'outlined'|'warm'} variant
 */
export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  onClick,
  className = '',
  id,
  ...props
}) {
  return (
    <div
      id={id}
      className={`card card--${variant} card--pad-${padding} ${onClick ? 'card--clickable' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}
