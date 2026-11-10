import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { inr } from '../constants.js';
import { useAsync } from '../hooks/useAsync.js';
import Pagination from '../components/Pagination.jsx';
import { EmptyState, ErrorState, Loading } from '../components/StatusViews.jsx';

const PER_PAGE = 10;

function StockRow({ product, onSaved, announce }) {
  const [value, setValue] = useState(String(product.stock));
  const [saving, setSaving] = useState(false);
  const [problem, setProblem] = useState('');

  const save = async () => {
    setSaving(true);
    setProblem('');
    try {
      const updated = await api(`/api/products/${product.id}`, { method: 'PATCH', body: JSON.stringify({ stock: Number(value) }) });
      onSaved(updated);
      announce(`Stock for ${product.name} updated to ${updated.stock}.`);
    } catch (e) {
      setProblem(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <tr>
      <th scope="row">
        <Link to={`/product/${product.id}`}>{product.name}</Link>
        {!product.image && <span className="badge"> No photo</span>}
      </th>
      <td>{product.category}</td>
      <td>{inr.format(product.price)}</td>
      <td>
        <label className="sr-only" htmlFor={`stock-${product.id}`}>
          Stock for {product.name}
        </label>
        <input
          id={`stock-${product.id}`}
          className="stock-input"
          type="number"
          min="0"
          value={value}
          aria-invalid={problem ? 'true' : undefined}
          aria-describedby={problem ? `stock-${product.id}-err` : undefined}
          onChange={(e) => setValue(e.target.value)}
        />
        {problem && (
          <p id={`stock-${product.id}-err`} className="field-error">
            {problem}
          </p>
        )}
      </td>
      <td>
        <button type="button" className="btn btn-secondary" onClick={save} disabled={saving || value === String(product.stock)}>
          {saving ? 'Saving…' : 'Update'}
          <span className="sr-only"> stock for {product.name}</span>
        </button>
      </td>
    </tr>
  );
}

export default function Admin() {
  const [page, setPage] = useState(1);
  const [lowOnly, setLowOnly] = useState(false);
  const [message, setMessage] = useState('');
  const summary = useAsync(() => api('/api/admin/summary'), []);
  const list = useAsync(() => api('/api/products?limit=100&sort=name'), []);

  const all = list.data?.items || [];
  const rows = lowOnly ? all.filter((p) => p.stock <= 5) : all;
  const pages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  const current = Math.min(page, pages);
  const visible = rows.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const onSaved = (updated) => {
    list.setData((d) => ({ ...d, items: d.items.map((p) => (p.id === updated.id ? updated : p)) }));
    summary.reload();
  };

  return (
    <>
      <title>Admin | Kasavu Ethnic Wear</title>
      <h1>Merchandiser view</h1>
      <p className="muted">Demo only: no sign-in is required in this mock app.</p>

      {summary.status === 'loading' && <Loading label="Loading summary" />}
      {summary.status === 'error' && <ErrorState error={summary.error} onRetry={summary.reload} />}
      {summary.status === 'success' && (
        <ul className="stats" aria-label="Catalogue summary">
          <li><strong>{summary.data.total}</strong> products</li>
          <li><strong>{summary.data.outOfStock}</strong> sold out</li>
          <li><strong>{summary.data.lowStock}</strong> low stock</li>
          <li><strong>{summary.data.missingImages}</strong> missing photos</li>
          <li><strong>{inr.format(summary.data.averagePrice)}</strong> average price</li>
        </ul>
      )}

      <label className="inline">
        <input type="checkbox" checked={lowOnly} onChange={(e) => { setLowOnly(e.target.checked); setPage(1); }} /> Show low or sold-out stock only
      </label>
      <p role="status" className="sr-only">{message}</p>

      {list.status === 'loading' && <Loading label="Loading products" />}
      {list.status === 'error' && <ErrorState error={list.error} onRetry={list.reload} />}
      {list.status === 'success' && rows.length === 0 && <EmptyState title="Nothing to show">No products match this view.</EmptyState>}
      {list.status === 'success' && rows.length > 0 && (
        <div className="table-wrap" tabIndex={0} role="region" aria-label="Products table, scrollable">
          <table>
            <caption className="sr-only">Products and stock levels</caption>
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col">Category</th>
                <th scope="col">Price</th>
                <th scope="col">Stock</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => (
                <StockRow key={`${p.id}-${p.stock}`} product={p} onSaved={onSaved} announce={setMessage} />
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={current} pages={pages} onChange={setPage} />
    </>
  );
}
