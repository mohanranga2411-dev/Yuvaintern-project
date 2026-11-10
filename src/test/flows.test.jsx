import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { handle } from '../mocks/mockApi.js';
import { server } from './setup.js';
import { renderApp } from './utils.jsx';

describe('catalogue', () => {
  it('shows a loading state then products and a count', async () => {
    server.use(
      http.get('*/api/products', async ({ request }) => {
        await delay(300);
        return HttpResponse.json(handle('GET', request.url).body);
      }),
    );
    renderApp('/shop');
    expect(await screen.findByRole('status', { name: /loading products/i })).toBeInTheDocument();
    expect(await screen.findByText(/\d+ products found/)).toBeInTheDocument();
    expect(screen.getAllByRole('listitem').length).toBeGreaterThan(5);
  });

  it('searches with debounce and shows the empty state, then clears it', async () => {
    const user = userEvent.setup();
    renderApp('/shop');
    await screen.findByText(/products found/);
    await user.type(screen.getByLabelText('Search'), 'zzzzzz');
    expect(await screen.findByTestId('empty-state')).toHaveTextContent('No products match');
    await user.click(screen.getByRole('button', { name: /clear search and filters/i }));
    expect(await screen.findByText(/products found/)).toBeInTheDocument();
    expect(screen.getByLabelText('Search')).toHaveValue('');
  });

  it('filters by category and sorts by price', async () => {
    const user = userEvent.setup();
    renderApp('/shop?category=Kids%20Ethnic');
    expect(await screen.findByText('6 products found')).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Sort by'), 'price-asc');
    await waitFor(() => {
      const prices = screen.getAllByText(/^₹[\d,]+$/).map((n) => Number(n.textContent.replace(/[₹,]/g, '')));
      expect(prices).toEqual([...prices].sort((a, b) => a - b));
    });
  });

  it('paginates', async () => {
    const user = userEvent.setup();
    renderApp('/shop');
    await screen.findByText(/products found/);
    await user.click(screen.getByRole('button', { name: 'Page 2' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page'));
  });

  it('shows an error with retry', async () => {
    server.use(http.get('*/api/products', () => HttpResponse.json({ message: 'Server down' }, { status: 500 })));
    const user = userEvent.setup();
    renderApp('/shop');
    expect(await screen.findByRole('alert')).toHaveTextContent('Server down');
    server.resetHandlers();
    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(await screen.findByText(/products found/)).toBeInTheDocument();
  });

  it('handles a missing image and a very long name', async () => {
    renderApp('/shop?q=photo%20coming');
    // The card's image link is aria-hidden (the title link is the accessible one), so query hidden nodes.
    expect(await screen.findByRole('img', { name: /no photo available/i, hidden: true })).toBeInTheDocument();
    renderApp('/shop?q=heritage');
    const link = await screen.findByRole('link', { name: /Balaramapuram/ });
    expect(link).toHaveAttribute('title', expect.stringContaining('Limited Festive Edition'));
  });
});

describe('detail, size guide and wishlist', () => {
  it('opens the size guide and recommends a size', async () => {
    const user = userEvent.setup();
    renderApp('/product/3');
    await screen.findByRole('heading', { level: 1 });
    await user.click(screen.getByRole('button', { name: 'Size guide' }));
    const dialog = await screen.findByRole('dialog', { hidden: true });
    expect(await within(dialog).findByRole('table', { hidden: true })).toBeInTheDocument();
    await user.type(within(dialog).getByLabelText(/find my size/i), '91');
    expect(within(dialog).getByRole('status')).toHaveTextContent(/recommended size/i);
  });

  it('saves a product with a size, shows it on the wishlist, and removes it', async () => {
    const user = userEvent.setup();
    const { store } = renderApp('/shop?category=Kurtas');
    await screen.findByText(/products found/);
    const first = screen.getAllByRole('button', { name: /to wishlist/ })[0];
    await user.click(first);
    expect(store.getState().wishlist.items).toHaveLength(1);
    expect(first).toHaveAttribute('aria-pressed', 'true');
    expect(JSON.parse(localStorage.getItem('kasavu.wishlist.v1'))).toHaveLength(1);

    await user.click(screen.getByRole('link', { name: /wishlist/i }));
    expect(await screen.findByText('1 saved item')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^Remove .+(?<!wishlist)$/ }));
    expect(await screen.findByText('Your wishlist is empty')).toBeInTheDocument();
  });

  it('shows the wishlist empty state', async () => {
    renderApp('/wishlist');
    expect(await screen.findByText('Your wishlist is empty')).toBeInTheDocument();
  });

  it('shows not found for an unknown product', async () => {
    renderApp('/product/424242');
    expect(await screen.findByRole('alert')).toHaveTextContent(/could not find/i);
  });
});

describe('profile form', () => {
  const type = (user, label, value) => user.type(screen.getByLabelText(label), value);

  it('blocks Next with accessible errors, then completes and saves', async () => {
    const user = userEvent.setup();
    renderApp('/profile');
    await screen.findByRole('heading', { name: /step 1 of 4/i });

    await user.click(screen.getByRole('button', { name: 'Next' }));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Please fix 3 problems');
    expect(alert).toHaveFocus();
    const email = screen.getByLabelText('Email');
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAccessibleDescription(/valid email/i);

    await type(user, 'Full name', 'Anu Nair');
    await type(user, 'Email', 'anu@example.com');
    await type(user, 'Mobile number', '9847012345');
    await user.click(screen.getByRole('button', { name: 'Next' }));

    await screen.findByRole('heading', { name: /step 2 of 4/i });
    await user.selectOptions(screen.getByLabelText('Usual garment'), 'Kurtas');
    await type(user, /chest or bust/i, '90');
    await type(user, /waist/i, '72');
    await type(user, /height/i, '160');
    await user.click(screen.getByLabelText('Regular'));
    await user.click(screen.getByRole('button', { name: 'Next' }));

    await screen.findByRole('heading', { name: /step 3 of 4/i });
    await type(user, 'Address', 'TC 12/345 Pattom Palace Road');
    await user.clear(screen.getByLabelText('PIN code'));
    await type(user, 'PIN code', '695004');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Next' }));

    await screen.findByRole('heading', { name: /step 4 of 4/i });
    expect(screen.getByText('Anu Nair')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Save profile' }));
    expect(await screen.findByText(/profile saved/i)).toBeInTheDocument();
    expect(screen.getByText(/Saved details/i)).toBeInTheDocument();
  });
});

describe('admin', () => {
  it('lists products and updates stock', async () => {
    const user = userEvent.setup();
    renderApp('/admin');
    expect(await screen.findByRole('table', { hidden: true })).toBeInTheDocument();
    const input = (await screen.findAllByLabelText(/^stock for/i))[0];
    await user.clear(input);
    await user.type(input, '7');
    await user.click(screen.getAllByRole('button', { name: /update/i })[0]);
    expect(await screen.findByText(/updated to 7/i)).toBeInTheDocument();
  });
});
