/**
 * @file src/hooks/useFetch.js
 * @description Generic async data-fetching hook with loading, error, and abort support.
 *
 * @example
 * const { data, isLoading, error, refetch } = useFetch(
 *   () => movieService.getTrending(),
 *   [page]
 * );
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * @param {() => Promise<any>} fetchFn  - Async function returning data
 * @param {any[]}              deps     - Dependency array (re-fetches when changed)
 * @param {{ immediate?: boolean, skipCache?: boolean }} [options]
 */
function useFetch(fetchFn, deps = [], options = {}) {
  const { immediate = true, skipCache = false } = options;

  const [data,      setData]      = useState(null);
  const [isLoading, setIsLoading] = useState(immediate);
  const [error,     setError]     = useState(null);

  // Track latest fn reference without triggering re-renders
  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;

  const execute = useCallback(async (signal) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchFnRef.current();
      if (!signal?.aborted) {
        setData(result);
      }
    } catch (err) {
      if (!signal?.aborted) {
        setError(err);
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (!immediate) return;
    const controller = new AbortController();
    execute(controller.signal);
    return () => controller.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute]);

  /** Manually trigger a re-fetch. */
  const refetch = useCallback(() => execute(), [execute]);

  return { data, isLoading, error, refetch };
}

export default useFetch;
