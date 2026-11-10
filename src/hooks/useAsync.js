import { useCallback, useEffect, useRef, useState } from 'react';

/** Runs an async function whenever `deps` change; exposes status, data, error, reload. */
export function useAsync(fn, deps) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null });
  const [tick, setTick] = useState(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, status: 'loading', error: null }));
    fnRef
      .current()
      .then((data) => !cancelled && setState({ status: 'success', data, error: null }))
      .catch((error) => !cancelled && setState({ status: 'error', data: null, error }));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  const setData = useCallback(
    (updater) =>
      setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater })),
    [],
  );
  return { ...state, reload, setData };
}
