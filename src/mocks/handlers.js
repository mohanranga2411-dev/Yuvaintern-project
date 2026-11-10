import { http, HttpResponse } from 'msw';
import { handle } from './mockApi.js';

const wrap =
  (method) =>
  async ({ request }) => {
    const body = method === 'GET' ? undefined : await request.json().catch(() => undefined);
    const res = handle(method, request.url, body);
    return HttpResponse.json(res.body, { status: res.status });
  };

export const handlers = [
  http.get('*/api/*', wrap('GET')),
  http.post('*/api/*', wrap('POST')),
  http.patch('*/api/*', wrap('PATCH')),
];
