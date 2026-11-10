import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import reducer, { remove, setSize, toggle } from '../store/wishlistSlice.js';
import { validateAll, validateStep } from '../validation.js';
import Pagination, { pageWindow } from '../components/Pagination.jsx';
import { recommendSize } from '../components/SizeGuideDialog.jsx';
import { handle } from '../mocks/mockApi.js';

describe('wishlist reducer', () => {
  it('adds, sizes and removes items', () => {
    let s = reducer(undefined, toggle({ id: 1 }));
    expect(s.items).toEqual([{ id: 1, size: null }]);
    s = reducer(s, setSize({ id: 1, size: 'M' }));
    expect(s.items[0].size).toBe('M');
    s = reducer(s, toggle({ id: 1 }));
    expect(s.items).toEqual([]);
    s = reducer(reducer(s, toggle({ id: 2 })), remove(2));
    expect(s.items).toEqual([]);
  });
});

describe('validation', () => {
  it('flags bad personal details', () => {
    const e = validateStep('personal', { fullName: 'A', email: 'nope', phone: '12345' });
    expect(Object.keys(e)).toEqual(['fullName', 'email', 'phone']);
  });
  it('accepts a complete profile', () => {
    const ok = {
      fullName: 'Anu Nair', email: 'anu@example.com', phone: '9847012345', category: 'Kurtas', chest: '90',
      waist: '72', height: '160', fit: 'Regular', address: 'TC 12/345, Pattom', city: 'Thiruvananthapuram',
      pincode: '695004', consent: true,
    };
    expect(validateAll(ok)).toEqual({});
  });
  it('rejects out-of-range measurements', () => {
    expect(validateStep('measurements', { category: 'Kurtas', chest: '10', waist: '', height: '300', fit: 'Regular' })).toHaveProperty('chest');
  });
});

describe('size recommendation', () => {
  const guide = { measure: { key: 'chest' }, rows: [{ size: 'S', chest: [85, 89] }, { size: 'M', chest: [90, 94] }] };
  it('matches the right row', () => expect(recommendSize(91, guide)).toBe('M'));
  it('rounds up on a gap tie', () => expect(recommendSize('90', { ...guide, rows: [{ size: 'S', chest: [85, 89] }, { size: 'M', chest: [91, 94] }] })).toBe('M'));
  it('returns null when far outside the chart', () => expect(recommendSize(150, guide)).toBeNull());
});

describe('Pagination', () => {
  it('builds a windowed list with gaps', () => {
    expect(pageWindow(5, 10)).toEqual([1, 'gap-4', 4, 5, 6, 'gap-10', 10]);
  });
  it('calls onChange and marks current page', async () => {
    const onChange = vi.fn();
    render(<Pagination page={2} pages={4} onChange={onChange} />);
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(onChange).toHaveBeenCalledWith(3);
  });
  it('renders nothing for a single page', () => {
    const { container } = render(<Pagination page={1} pages={1} onChange={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('mock API', () => {
  it('seeds edge cases and filters', () => {
    expect(handle('GET', '/api/products/1002').body.image).toBeNull();
    expect(handle('GET', '/api/products/1001').body.name.length).toBeGreaterThan(150);
    expect(handle('GET', '/api/products?category=Dupattas').body.items).toEqual([]);
    expect(handle('GET', '/api/products?q=zzzz').body.total).toBe(0);
    expect(handle('GET', '/api/products/99999').status).toBe(404);
    const sorted = handle('GET', '/api/products?sort=price-asc&limit=100').body.items.map((p) => p.price);
    expect(sorted).toEqual([...sorted].sort((a, b) => a - b));
  });
});
