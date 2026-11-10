import { useEffect, useRef, useState } from 'react';
import { api } from '../api.js';
import { useAsync } from '../hooks/useAsync.js';
import { ErrorState, Loading } from './StatusViews.jsx';

const distance = (n, [lo, hi]) => (n < lo ? lo - n : n > hi ? n - hi : 0);

/** Returns the size whose range is closest to the measurement; ties go to the larger size for comfort. */
export function recommendSize(value, guide) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  const key = guide.measure.key;
  let best = null;
  guide.rows.forEach((row) => {
    const d = distance(n, row[key]);
    if (!best || d <= best.d) best = { size: row.size, d };
  });
  return best && best.d <= 10 ? best.size : null;
}

function GuideBody({ category }) {
  const { status, data, error, reload } = useAsync(() => api('/api/size-guide'), []);
  const [measure, setMeasure] = useState('');
  if (status === 'loading') return <Loading label="Loading size guide" />;
  if (status === 'error') return <ErrorState error={error} onRetry={reload} />;

  const guide = data.guides[data.categoryMap[category] || 'women'];
  const result = measure ? recommendSize(measure, guide) : null;

  return (
    <>
      <h3>{guide.label}</h3>
      <div className="table-wrap" tabIndex={0} role="region" aria-label="Size chart, scrollable">
        <table>
          <caption className="sr-only">Size chart in centimetres</caption>
          <thead>
            <tr>
              <th scope="col">Size</th>
              {guide.columns.map(([k, label]) => (
                <th scope="col" key={k}>
                  {label} (cm)
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {guide.rows.map((row) => (
              <tr key={row.size} className={result === row.size ? 'row-hit' : undefined}>
                <th scope="row">{row.size}</th>
                {guide.columns.map(([k]) => (
                  <td key={k}>
                    {row[k][0]} to {row[k][1]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="field">
        <label htmlFor="find-size">Find my size: {guide.measure.label}</label>
        <input
          id="find-size"
          type="number"
          inputMode="numeric"
          min="1"
          value={measure}
          onChange={(e) => setMeasure(e.target.value)}
          aria-describedby="find-size-result"
        />
        <p id="find-size-result" role="status" className="hint">
          {measure === ''
            ? 'Measure around the fullest part, keeping the tape snug but not tight.'
            : result
              ? `Recommended size: ${result}`
              : 'That measurement is outside our chart. Please contact the store for made-to-measure.'}
        </p>
      </div>
    </>
  );
}

export default function SizeGuideDialog({ open, onClose, category }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby="size-guide-title"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      <div className="dialog-head">
        <h2 id="size-guide-title">Size guide</h2>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>
      {open && <GuideBody category={category} />}
    </dialog>
  );
}
