import { useDispatch, useSelector } from 'react-redux';
import { selectIsWished, toggle } from '../store/wishlistSlice.js';

export default function WishlistButton({ product, size = null, labelled = false }) {
  const dispatch = useDispatch();
  const wished = useSelector(selectIsWished(product.id));
  return (
    <button
      type="button"
      className={`wish ${wished ? 'is-on' : ''} ${labelled ? 'wish-labelled' : ''}`}
      aria-pressed={wished}
      aria-label={labelled ? undefined : `${wished ? 'Remove' : 'Add'} ${product.name} ${wished ? 'from' : 'to'} wishlist`}
      onClick={() => dispatch(toggle({ id: product.id, size }))}
    >
      <span aria-hidden="true">{wished ? '♥' : '♡'}</span>
      {labelled && <span>{wished ? 'Saved to wishlist' : 'Save to wishlist'}</span>}
    </button>
  );
}
