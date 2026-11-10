import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { api } from '../api.js';
import { inr } from '../constants.js';
import { useAsync } from '../hooks/useAsync.js';
import { selectWishlist, setSize } from '../store/wishlistSlice.js';
import ProductImage from '../components/ProductImage.jsx';
import SizeGuideDialog from '../components/SizeGuideDialog.jsx';
import WishlistButton from '../components/WishlistButton.jsx';
import { ErrorState, Loading } from '../components/StatusViews.jsx';

export default function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const wished = useSelector(selectWishlist).find((i) => i.id === Number(id));
  const [chosen, setChosen] = useState(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const { status, data: product, error, reload } = useAsync(() => api(`/api/products/${id}`), [id]);

  if (status === 'loading') return <Loading label="Loading product" />;
  if (status === 'error') {
    return (
      <>
        <ErrorState error={error} onRetry={error.status === 404 ? undefined : reload} />
        <p>
          <Link to="/shop">Back to the catalogue</Link>
        </p>
      </>
    );
  }

  const size = wished?.size ?? chosen;
  const pick = (s) => {
    setChosen(s);
    if (wished) dispatch(setSize({ id: product.id, size: s }));
  };
  const soldOut = product.stock === 0;

  return (
    <article className="detail">
      <title>{`${product.name} | Kasavu`}</title>
      <p>
        <Link to="/shop">← Back to the catalogue</Link>
      </p>
      <div className="detail-grid">
        <div className="detail-media">
          <ProductImage product={product} eager />
        </div>
        <div>
          <h1 className="detail-title">{product.name}</h1>
          <p className="muted">
            {product.category} · {product.fabric} · {product.colorName}
          </p>
          <p className="price big">
            {inr.format(product.price)}{' '}
            {product.mrp > product.price && (
              <s className="muted" aria-label={`Original price ${inr.format(product.mrp)}`}>
                {inr.format(product.mrp)}
              </s>
            )}
          </p>
          <p className={soldOut ? 'stock out' : product.stock <= 5 ? 'stock low' : 'stock'}>
            {soldOut ? 'Sold out' : product.stock <= 5 ? `Only ${product.stock} left` : 'In stock'}
          </p>
          <p>{product.description || 'No description has been added for this product yet.'}</p>

          {product.sizes.length > 0 ? (
            <fieldset className="sizes">
              <legend>Size</legend>
              <div className="size-options">
                {product.sizes.map((s) => (
                  <label key={s} className={`size ${size === s ? 'is-on' : ''}`}>
                    <input type="radio" name="size" value={s} checked={size === s} onChange={() => pick(s)} />
                    <span>{s}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ) : (
            <p className="muted">Size information is not available yet. Please ask in store.</p>
          )}

          <div className="actions">
            <button type="button" className="btn btn-secondary" onClick={() => setGuideOpen(true)}>
              Size guide
            </button>
            <WishlistButton product={product} size={size} labelled />
          </div>
          {wished && !wished.size && product.sizes.length > 0 && (
            <p className="hint">Pick a size to save it with your wishlist item.</p>
          )}
        </div>
      </div>
      <SizeGuideDialog open={guideOpen} onClose={() => setGuideOpen(false)} category={product.category} />
    </article>
  );
}
