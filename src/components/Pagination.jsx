export function pageWindow(page, pages) {
  const set = new Set([1, pages, page - 1, page, page + 1]);
  const nums = [...set].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  const out = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) out.push('gap-' + n);
    out.push(n);
  });
  return out;
}

export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  return (
    <nav className="pagination" aria-label="Pagination">
      <button type="button" className="btn btn-secondary" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Previous
      </button>
      <ul>
        {pageWindow(page, pages).map((n) =>
          typeof n === 'string' ? (
            <li key={n} aria-hidden="true">
              …
            </li>
          ) : (
            <li key={n}>
              <button
                type="button"
                className={`btn page ${n === page ? 'is-current' : 'btn-secondary'}`}
                aria-current={n === page ? 'page' : undefined}
                aria-label={`Page ${n}`}
                onClick={() => onChange(n)}
              >
                {n}
              </button>
            </li>
          ),
        )}
      </ul>
      <button type="button" className="btn btn-secondary" disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Next
      </button>
    </nav>
  );
}
