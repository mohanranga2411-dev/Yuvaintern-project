import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { CATEGORIES, SIZES, SORTS } from '../constants.js';
import { fetchProducts } from '../store/catalogueSlice.js';
import Pagination from '../components/Pagination.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { EmptyState, ErrorState, Skeletons } from '../components/StatusViews.jsx';

const FILTER_KEYS = ['q', 'category', 'size', 'maxPrice', 'inStock'];

export default function Catalogue() {
  const [params, setParams] = useSearchParams();
  const dispatch = useDispatch();
  const { items, total, pages, facets, status, error } = useSelector((s) => s.catalogue);
  const query = params.toString();
  const urlQ = params.get('q') || '';
  const [text, setText] = useState(urlQ);
  const headingRef = useRef(null);

  useEffect(() => {
    dispatch(fetchProducts(query));
  }, [dispatch, query]);

  useEffect(() => setText(urlQ), [urlQ]);

  const update = (key, value, replace = false) => {
    const next = new URLSearchParams(params);
    if (value === '' || value == null || value === false) next.delete(key);
    else next.set(key, value);
    if (key !== 'page') next.delete('page');
    setParams(next, { replace });
  };

  // Debounce typing so we do not hit the API on every keystroke.
  useEffect(() => {
    if (text === urlQ) return undefined;
    const t = setTimeout(() => update('q', text.trim(), true), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const activeFilters = FILTER_KEYS.filter((k) => params.get(k));
  const page = Number(params.get('page')) || 1;
  const loading = status === 'loading' || status === 'idle';

  return (
    <>
      <title>Shop | Kasavu Ethnic Wear</title>
      <h1 ref={headingRef} tabIndex={-1} id="results-heading">
        Catalogue
      </h1>

      <form
        className="toolbar"
        role="search"
        aria-label="Search and filter products"
        onSubmit={(e) => {
          e.preventDefault();
          update('q', text.trim(), true);
        }}
      >
        <div className="field grow">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            type="search"
            value={text}
            placeholder="Try kasavu, mundu or silk"
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="sort">Sort by</label>
          <select id="sort" value={params.get('sort') || 'relevance'} onChange={(e) => update('sort', e.target.value)}>
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <details className="filters">
          <summary>Filters{activeFilters.length > 0 ? ` (${activeFilters.length})` : ''}</summary>
          <div className="filter-grid">
            <div className="field">
              <label htmlFor="category">Category</label>
              <select id="category" value={params.get('category') || ''} onChange={(e) => update('category', e.target.value)}>
                <option value="">All categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                    {facets[c] !== undefined ? ` (${facets[c]})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="size">Size</label>
              <select id="size" value={params.get('size') || ''} onChange={(e) => update('size', e.target.value)}>
                <option value="">Any size</option>
                {SIZES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="maxPrice">Maximum price</label>
              <select id="maxPrice" value={params.get('maxPrice') || ''} onChange={(e) => update('maxPrice', e.target.value)}>
                <option value="">Any price</option>
                {[1000, 2500, 5000, 10000, 25000].map((p) => (
                  <option key={p} value={p}>
                    Up to ₹{p.toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
            </div>
            <label className="inline">
              <input type="checkbox" checked={params.get('inStock') === '1'} onChange={(e) => update('inStock', e.target.checked ? '1' : '')} /> In stock only
            </label>
            {activeFilters.length > 0 && (
              <button type="button" className="btn btn-secondary" onClick={() => setParams({})}>
                Clear all filters
              </button>
            )}
          </div>
        </details>
      </form>

      <p role="status" className="muted results-count">
        {loading ? 'Loading products…' : status === 'failed' ? '' : `${total} ${total === 1 ? 'product' : 'products'} found`}
      </p>

      {loading && <Skeletons />}
      {status === 'failed' && <ErrorState error={error} onRetry={() => dispatch(fetchProducts(query))} />}
      {status === 'succeeded' && items.length === 0 && (
        <EmptyState
          title="No products match"
          action={
            <button type="button" className="btn" onClick={() => setParams({})}>
              Clear search and filters
            </button>
          }
        >
          Try a different word or remove a filter.
        </EmptyState>
      )}
      {status === 'succeeded' && items.length > 0 && (
        <ul className="grid">
          {items.map((p, i) => (
            <ProductCard key={p.id} product={p} eager={i < 2} level={2} />
          ))}
        </ul>
      )}

      <Pagination
        page={page}
        pages={pages}
        onChange={(n) => {
          update('page', n === 1 ? '' : n);
          headingRef.current?.focus();
        }}
      />
    </>
  );
}
