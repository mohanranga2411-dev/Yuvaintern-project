import { useState } from 'react';

/** Image with reserved space (no layout shift) and a text fallback for missing or broken images. */
export default function ProductImage({ product, eager = false }) {
  const [broken, setBroken] = useState(false);
  if (!product.image || broken) {
    return (
      <div className="img-fallback" role="img" aria-label={`No photo available for ${product.name}`}>
        <span aria-hidden="true">Photo coming soon</span>
      </div>
    );
  }
  return (
    <img
      src={product.image}
      alt={`${product.name}, ${product.colorName}`}
      width="200"
      height="240"
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setBroken(true)}
    />
  );
}
