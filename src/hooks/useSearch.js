/**
 * @file src/hooks/useSearch.js
 * @description Stateful search hook with debounce, pagination, infinite scroll
 * accumulation, and per-query reset.
 *
 * Usage:
 *   const { query, setQuery, results, isLoading, isFetchingMore,
 *           hasMore, loadMore, totalResults, error } = useSearch();
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import searchService from '@services/searchService.js';
import useDebounce  from './useDebounce.js';

const DEBOUNCE_MS  = 400;
const MIN_CHARS    = 2;

export default function useSearch() {
  const [query,          setQuery]          = useState('');
  const [activeFilter,   setActiveFilter]   = useState('all'); // 'all'|'movie'|'tv'|'person'
  const [results,        setResults]        = useState([]);
  const [page,           setPage]           = useState(1);
  const [totalPages,     setTotalPages]     = useState(0);
  const [totalResults,   setTotalResults]   = useState(0);
  const [isLoading,      setIsLoading]      = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error,          setError]          = useState(null);

  const debouncedQuery = useDebounce(query, DEBOUNCE_MS);
  const abortRef       = useRef(null);

  /* ── resolve fetch fn by filter ─────────────────────────────────────── */
  const getFetchFn = useCallback((q, p, filter) => {
    switch (filter) {
      case 'movie':  return searchService.searchMovies(q, p);
      case 'tv':     return searchService.searchTV(q, p);
      case 'person': return searchService.searchPeople(q, p);
      default:       return searchService.searchMulti(q, p);
    }
  }, []);

  /* ── initial / reset search (query or filter changed) ───────────────── */
  useEffect(() => {
    if (debouncedQuery.trim().length < MIN_CHARS) {
      setResults([]);
      setTotalResults(0);
      setTotalPages(0);
      setPage(1);
      setError(null);
      return;
    }

    // abort in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const run = async () => {
      setIsLoading(true);
      setError(null);
      setPage(1);
      try {
        const data = await getFetchFn(debouncedQuery.trim(), 1, activeFilter);
        if (controller.signal.aborted) return;
        const filtered = (data?.results ?? []).filter((r) => r.poster_path || r.backdrop_path || r.profile_path);
        setResults(filtered);
        setTotalResults(data?.total_results ?? 0);
        setTotalPages(data?.total_pages   ?? 0);
      } catch (err) {
        if (!controller.signal.aborted) setError(err);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };
    run();

    return () => controller.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, activeFilter]);

  /* ── load next page (infinite scroll) ───────────────────────────────── */
  const loadMore = useCallback(async () => {
    if (isFetchingMore || isLoading || page >= totalPages) return;
    const nextPage = page + 1;
    setIsFetchingMore(true);
    try {
      const data = await getFetchFn(debouncedQuery.trim(), nextPage, activeFilter);
      const filtered = (data?.results ?? []).filter((r) => r.poster_path || r.backdrop_path || r.profile_path);
      setResults((prev) => [...prev, ...filtered]);
      setPage(nextPage);
    } catch (err) {
      console.warn('[useSearch] loadMore failed:', err);
    } finally {
      setIsFetchingMore(false);
    }
  }, [isFetchingMore, isLoading, page, totalPages, debouncedQuery, activeFilter, getFetchFn]);

  const hasMore = page < totalPages && results.length > 0;

  return {
    query,
    setQuery,
    activeFilter,
    setActiveFilter,
    results,
    isLoading,
    isFetchingMore,
    hasMore,
    loadMore,
    totalResults,
    error,
    isActive: debouncedQuery.trim().length >= MIN_CHARS,
  };
}
