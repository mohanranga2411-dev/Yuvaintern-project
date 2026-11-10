// In the browser the mock REST API runs inside the page by wrapping fetch for /api/*.
// Unlike a second service worker this cannot clash with the PWA worker, so the
// catalogue keeps working offline. Add ?mockError=1 to the URL to see error states.
import { handle } from './mockApi.js';

export function installMockApi({ latency = 250 } = {}) {
  const realFetch = window.fetch.bind(window);
  const forceError = new URLSearchParams(window.location.search).has('mockError');

  window.fetch = async (input, init = {}) => {
    const url = new URL(typeof input === 'string' ? input : input.url, window.location.origin);
    if (!url.pathname.startsWith('/api/')) return realFetch(input, init);

    await new Promise((r) => setTimeout(r, latency));
    const json = (status, body) =>
      new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

    if (forceError && url.pathname === '/api/products') {
      return json(500, { message: 'The catalogue service is not responding.' });
    }
    const method = (init.method || 'GET').toUpperCase();
    const body = init.body ? JSON.parse(init.body) : undefined;
    const res = handle(method, url.href, body);
    return json(res.status, res.body);
  };
}
