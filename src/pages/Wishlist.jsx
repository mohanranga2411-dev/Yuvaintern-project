import { useDispatch, useSelector } from 'react-redux';
import { api } from '../api.js';
import { useAsync } from '../hooks/useAsync.js';
import { clear, remove, selectWishlist } from '../store/wishlistSlice.js';
import ProductCard from '../components/ProductCard.jsx';
import { BackToShop, EmptyState, ErrorState, Skeletons } from '../components/StatusViews.jsx';

export default function Wishlist() {
  const dispatch = useDispatch();
  const saved = useSelector(selectWishlist);
  const ids = saved.map((i) => i.id).join(',');
  const { status, data, error, reload } = useAsync(
    () => (ids ? api(`/api/products?ids=${ids}&limit=100`) : Promise.resolve({ items: [] })),
    [ids === '' ? '' : 'has-items'],
  );

  const byId = Object.fromEntries((data?.items || []).map((p) => [p.id, p]));
  const shown = saved.map((s) => ({ ...s, product: byId[s.id] })).filter((s) => s.product);

  return (
    <>
      <title>Wishlist | Kasavu Ethnic Wear</title>
      <h1>Your wishlist</h1>
      {saved.length === 0 && (
        <EmptyState title="Your wishlist is empty" action={<BackToShop />}>
          Tap the heart on any product to save it here.
        </EmptyState>
      )}
      {saved.length > 0 && status === 'loading' && <Skeletons count={saved.length} label="Loading wishlist" />}
      {saved.length > 0 && status === 'error' && <ErrorState error={error} onRetry={reload} />}
      {saved.length > 0 && status === 'success' && (
        <>
          <p role="status" className="muted">
            {saved.length} saved {saved.length === 1 ? 'item' : 'items'}
          </p>
          <ul className="grid">
            {shown.map(({ id, size, product }) => (
              <ProductCard key={id} product={product} level={2}>
                <p className="small">Size: {size || 'not chosen'}</p>
                <button type="button" className="btn btn-secondary" onClick={() => dispatch(remove(id))}>
                  Remove<span className="sr-only"> {product.name}</span>
                </button>
              </ProductCard>
            ))}
          </ul>
          <p>
            <button type="button" className="btn btn-secondary" onClick={() => dispatch(clear())}>
              Clear wishlist
            </button>
          </p>
        </>
      )}
    </>
  );
}
