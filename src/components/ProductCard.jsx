import { memo } from 'react';
import { Link } from 'react-router-dom';
import { inr } from '../constants.js';
import ProductImage from './ProductImage.jsx';
import WishlistButton from './WishlistButton.jsx';

function ProductCard({ product, eager = false, level = 3, children }) {
  const Heading = `h${level}`;
  const soldOut = product.stock === 0;
  const discount = product.mrp > product.price ? Math.round((1 - product.price / product.mrp) * 100) : 0;
  return (
    <li className="card">
      <div className="card-media">
        <Link to={`/product/${product.id}`} tabIndex={-1} aria-hidden="true">
          <ProductImage product={product} eager={eager} />
        </Link>
        {soldOut && <span className="badge badge-out">Sold out</span>}
        <WishlistButton product={product} />
      </div>
      <div className="card-body">
        <Heading className="card-title">
          <Link to={`/product/${product.id}`} title={product.name}>
            {product.name}
          </Link>
        </Heading>
        <p className="muted">{product.category}</p>
        <p className="price">
          <span>{inr.format(product.price)}</span>
          {discount > 0 && (
            <>
              {' '}
              <s className="muted" aria-label={`Original price ${inr.format(product.mrp)}`}>
                {inr.format(product.mrp)}
              </s>{' '}
              <span className="badge">{discount}% off</span>
            </>
          )}
        </p>
        <p className="muted small">
          {product.reviews > 0 ? `★ ${product.rating} (${product.reviews} reviews)` : 'No reviews yet'}
        </p>
        {children}
      </div>
    </li>
  );
}

export default memo(ProductCard);
