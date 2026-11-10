// Pure request router shared by MSW (tests) and the in-page adapter (browser, works offline).
import { PRODUCTS, SIZE_GUIDE } from './data.js';
import { validateAll } from '../validation.js';
import { CATEGORIES } from '../constants.js';

let products = structuredClone(PRODUCTS);
let profile = null;

export function resetMock() {
  products = structuredClone(PRODUCTS);
  profile = null;
}

const ok = (body, status = 200) => ({ status, body });
const err = (status, message, fields) => ({ status, body: { message, fields } });

function listProducts(p) {
  const q = (p.get('q') || '').trim().toLowerCase();
  const category = p.get('category');
  const size = p.get('size');
  const maxPrice = Number(p.get('maxPrice')) || Infinity;
  const inStock = p.get('inStock') === '1';
  const ids = p.get('ids') ? p.get('ids').split(',').map(Number) : null;
  const sort = p.get('sort') || 'relevance';
  const limit = Math.min(Math.max(Number(p.get('limit')) || 12, 1), 100);

  const matches = (item, skipCategory) =>
    (!q || `${item.name} ${item.category} ${item.fabric} ${item.colorName}`.toLowerCase().includes(q)) &&
    (skipCategory || !category || item.category === category) &&
    (!size || item.sizes.includes(size)) &&
    item.price <= maxPrice &&
    (!inStock || item.stock > 0) &&
    (!ids || ids.includes(item.id));

  const facets = Object.fromEntries(CATEGORIES.map((c) => [c, 0]));
  products.filter((i) => matches(i, true)).forEach((i) => (facets[i.category] += 1));

  const list = products.filter((i) => matches(i, false));
  const sorters = {
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
    new: (a, b) => a.daysOld - b.daysOld,
    name: (a, b) => a.name.localeCompare(b.name),
    relevance: (a, b) => a.id - b.id,
  };
  list.sort(sorters[sort] || sorters.relevance);

  const pages = Math.max(1, Math.ceil(list.length / limit));
  const page = Math.min(Math.max(Number(p.get('page')) || 1, 1), pages);
  return ok({ items: list.slice((page - 1) * limit, page * limit), total: list.length, page, pages, facets });
}

export function handle(method, href, body) {
  const url = new URL(href, 'http://localhost');
  const path = url.pathname.replace(/\/$/, '');
  const p = url.searchParams;

  if (method === 'GET' && path === '/api/products') return listProducts(p);

  const one = path.match(/^\/api\/products\/(\d+)$/);
  if (one) {
    const item = products.find((i) => i.id === Number(one[1]));
    if (!item) return err(404, 'We could not find that product.');
    if (method === 'GET') return ok(item);
    if (method === 'PATCH') {
      const stock = Number(body?.stock);
      if (!Number.isInteger(stock) || stock < 0 || stock > 9999) return err(422, 'Stock must be a whole number from 0 to 9999.');
      item.stock = stock;
      return ok(item);
    }
  }

  if (method === 'GET' && path === '/api/size-guide') return ok(SIZE_GUIDE);

  if (method === 'GET' && path === '/api/admin/summary') {
    const prices = products.map((i) => i.price);
    return ok({
      total: products.length,
      outOfStock: products.filter((i) => i.stock === 0).length,
      lowStock: products.filter((i) => i.stock > 0 && i.stock <= 5).length,
      missingImages: products.filter((i) => !i.image).length,
      averagePrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
    });
  }

  if (path === '/api/profile') {
    if (method === 'GET') return ok({ profile });
    if (method === 'POST') {
      const fields = validateAll(body || {});
      if (Object.keys(fields).length) return err(422, 'Some details need fixing.', fields);
      profile = { ...body };
      return ok({ profile });
    }
  }

  return err(404, 'Not found');
}
