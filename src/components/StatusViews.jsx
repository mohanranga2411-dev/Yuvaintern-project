import { Link } from 'react-router-dom';

export function Skeletons({ count = 8, label = 'Loading products' }) {
  return (
    <ul className="grid" aria-busy="true" aria-label={label} role="status">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="card skeleton" aria-hidden="true">
          <div className="skeleton-img" />
          <div className="skeleton-line" />
          <div className="skeleton-line short" />
        </li>
      ))}
      <li className="sr-only">{label}…</li>
    </ul>
  );
}

export function Loading({ label = 'Loading' }) {
  return (
    <p role="status" className="state">
      {label}…
    </p>
  );
}

export function EmptyState({ title, children, action }) {
  return (
    <div className="state" data-testid="empty-state">
      <h2>{title}</h2>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="state error-state" role="alert">
      <h2>Something went wrong</h2>
      <p>{typeof error === 'string' ? error : error?.message || 'Please try again.'}</p>
      {onRetry && (
        <button type="button" className="btn" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function BackToShop() {
  return (
    <Link className="btn btn-secondary" to="/shop">
      Browse the catalogue
    </Link>
  );
}
