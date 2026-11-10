import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { CATEGORIES } from '../constants.js';
import { useAsync } from '../hooks/useAsync.js';
import ProductCard from '../components/ProductCard.jsx';
import { ErrorState, Skeletons } from '../components/StatusViews.jsx';

export default function Home() {
  const { status, data, error, reload } = useAsync(() => api('/api/products?sort=rating&limit=4'), []);
  return (
    <>
      <title>Kasavu Ethnic Wear Catalogue</title>
      <section className="hero">
        <h1>Kerala ethnic wear, found in your size</h1>
        <p>Sarees, mundus, kurtas and lehengas from our Thiruvananthapuram stores. Check the size guide, save favourites, shop fast on any phone.</p>
        <Link className="btn" to="/shop">
          Browse the catalogue
        </Link>
      </section>

      <section aria-labelledby="cats">
        <h2 id="cats">Shop by category</h2>
        <ul className="chips">
          {CATEGORIES.filter((c) => c !== 'Dupattas').map((c) => (
            <li key={c}>
              <Link className="chip" to={`/shop?category=${encodeURIComponent(c)}`}>
                {c}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="top">
        <h2 id="top">Top rated this season</h2>
        {status === 'loading' && <Skeletons count={4} label="Loading top rated products" />}
        {status === 'error' && <ErrorState error={error} onRetry={reload} />}
        {status === 'success' && (
          <ul className="grid">
            {data.items.map((p, i) => (
              <ProductCard key={p.id} product={p} eager={i < 2} />
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
