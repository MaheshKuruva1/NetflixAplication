/**
 * @file src/pages/Search/SearchPage.jsx
 * @description Production-level search page.
 *
 * Sections:
 *  – Giant search input (auto-focused, clear button)
 *  – Filter tabs: All · Movies · TV Shows · People
 *  – Live result grid with poster cards (debounced 400ms)
 *  – Search suggestions (history + popular searches)
 *  – Trending searches chips
 *  – Popular Movies fallback (when idle)
 *  – Infinite scroll sentinel (loads next page)
 *  – Per-card skeleton grid while loading
 *  – No-results state
 *  – Error state
 *  – Animated transitions throughout
 */

import {
  useEffect, useRef, useCallback, useState,
} from 'react';
import React from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiSearchLine, RiCloseLine, RiFireLine, RiHistoryLine,
  RiDeleteBinLine, RiArrowRightLine, RiErrorWarningLine,
  RiMovieLine, RiTvLine, RiUserLine, RiGridFill,
} from 'react-icons/ri';

import useSearch            from '@hooks/useSearch.js';
import useFetch             from '@hooks/useFetch.js';
import useLocalStorage      from '@hooks/useLocalStorage.js';
import useIntersectionObserver from '@hooks/useIntersectionObserver.js';
import movieService         from '@services/movieService.js';
import { MEDIA_TYPE }       from '@constants/media.js';
import { ROUTES }           from '@constants/routes.js';
import { getPosterUrl, getBackdropUrl, getProfileUrl } from '@utils/imageHelpers.js';
import { getTitle, getReleaseDate, getYear, formatRating } from '@utils/formatters.js';
import { cn }               from '@utils/cn.js';
import Badge                from '@components/ui/Badge.jsx';
import Rating               from '@components/ui/Rating.jsx';
import Skeleton             from '@components/ui/Skeleton.jsx';
import { SEO }              from '@components/common';

/* ─────────────────────────────────────────────────────────────────────────── */
/* Constants                                                                    */
/* ─────────────────────────────────────────────────────────────────────────── */
const MAX_HISTORY   = 8;
const HISTORY_KEY   = 'bappm_search_history';

const TRENDING_CHIPS = [
  'Dune', 'Spider-Man', 'Barbie', 'Oppenheimer', 'Avatar',
  'John Wick', 'Top Gun', 'The Batman', 'Avengers', 'Interstellar',
];

const FILTER_TABS = [
  { id: 'all',    label: 'All',      icon: <RiGridFill />  },
  { id: 'movie',  label: 'Movies',   icon: <RiMovieLine /> },
  { id: 'tv',     label: 'TV Shows', icon: <RiTvLine />    },
  { id: 'person', label: 'People',   icon: <RiUserLine />  },
];

/* ─────────────────────────────────────────────────────────────────────────── */
/* Result Card                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */
const ResultCard = React.memo(function ResultCard({ item, index }) {
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();

  const mediaType = item.media_type ?? MEDIA_TYPE.MOVIE;
  const title     = getTitle(item);
  const year      = getYear(getReleaseDate(item));
  const rating    = item.vote_average;

  const imageUrl = mediaType === MEDIA_TYPE.PERSON
    ? getProfileUrl(item.profile_path, 'md')
    : getPosterUrl(item.poster_path,   'xl');

  const route = mediaType === MEDIA_TYPE.TV
    ? ROUTES.toTVDetail(item.id)
    : mediaType === MEDIA_TYPE.PERSON
      ? ROUTES.toPersonDetail(item.id)
      : ROUTES.toMovieDetail(item.id);

  const typeLabel = { movie: 'Movie', tv: 'TV', person: 'Person' }[mediaType] ?? 'Movie';
  const typeColor = { movie: '#e50914', tv: '#8b5cf6', person: '#00c864' }[mediaType] ?? '#e50914';

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: Math.min(index % 20 * 0.03, 0.45),
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group relative cursor-pointer rounded-xl overflow-hidden flex flex-col"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-default)',
      }}
      onClick={() => navigate(route)}
      tabIndex={0}
      role="article"
      aria-label={`${title} (${typeLabel})`}
      onKeyDown={(e) => { if (e.key === 'Enter') navigate(route); }}
    >
      {/* Image */}
      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: mediaType === 'person' ? '2/3' : '2/3' }}
      >
        {!imgError ? (
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-top
                       transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-3xl font-black"
            style={{ background: 'var(--bg-surface)', color: 'var(--fg-muted)' }}
          >
            {mediaType === 'person' ? <RiUserLine /> : <RiMovieLine />}
          </div>
        )}

        {/* Type badge */}
        <div className="absolute top-2 left-2">
          <span
            className="text-[0.6rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
            style={{ background: typeColor, color: '#fff' }}
          >
            {typeLabel}
          </span>
        </div>

        {/* Rating */}
        {rating > 0 && (
          <div
            className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold"
            style={{ background: 'rgba(0,0,0,0.85)', color: '#f5a623' }}
          >
            ★ {formatRating(rating)}
          </div>
        )}

        {/* Hover overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0
                     group-hover:opacity-100 transition-opacity duration-200"
          style={{ background: 'rgba(10,10,15,0.6)', backdropFilter: 'blur(2px)' }}
        >
          <motion.span
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white"
            style={{ background: '#e50914' }}
          >
            View Details <RiArrowRightLine />
          </motion.span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p
          className="text-sm font-semibold leading-snug line-clamp-2
                     group-hover:text-white transition-colors"
          style={{ color: 'var(--fg-primary)' }}
        >
          {title}
        </p>
        <div className="flex items-center gap-2 mt-auto pt-1">
          {year && (
            <span className="text-[0.68rem]" style={{ color: 'var(--fg-muted)' }}>
              {year}
            </span>
          )}
          {item.character && (
            <span className="text-[0.68rem] italic truncate" style={{ color: 'var(--fg-muted)' }}>
              {item.character}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
});

/* ─────────────────────────────────────────────────────────────────────────── */
/* Skeleton grid                                                                */
/* ─────────────────────────────────────────────────────────────────────────── */
function ResultsSkeleton({ count = 20 }) {
  return (
    <div
      className="grid gap-4 sm:gap-6 lg:gap-8"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="rounded-xl" style={{ aspectRatio: '2/3' }} />
          <Skeleton className="h-3 rounded" style={{ width: '80%' }} />
          <Skeleton className="h-3 rounded" style={{ width: '50%' }} />
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Popular movies grid (idle state)                                             */
/* ─────────────────────────────────────────────────────────────────────────── */
function PopularMoviesGrid({ onQuerySelect }) {
  const { data, isLoading } = useFetch(() => movieService.getPopular(), []);
  const items = (data?.results ?? []).slice(0, 20);

  return (
    <section aria-label="Popular movies">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold" style={{ color: 'var(--fg-primary)' }}>
          Popular Right Now
        </h2>
        <Link
          to={ROUTES.MOVIES}
          className="text-sm font-semibold flex items-center gap-1"
          style={{ color: '#e50914' }}
        >
          See All <RiArrowRightLine />
        </Link>
      </div>

      {isLoading ? (
        <ResultsSkeleton count={20} />
      ) : (
        <motion.div
          className="grid gap-4 sm:gap-6 lg:gap-8"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {items.map((item, i) => (
            <ResultCard
              key={item.id}
              item={{ ...item, media_type: MEDIA_TYPE.MOVIE }}
              index={i}
            />
          ))}
        </motion.div>
      )}
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* No results                                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */
function NoResults({ query }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 gap-6 text-center"
    >
      <motion.span
        className="text-6xl"
        animate={{ rotate: [0, -10, 10, -10, 0] }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        🎬
      </motion.span>
      <div>
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--fg-primary)' }}>
          No results for "{query}"
        </h2>
        <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
          Try different keywords, or check for typos.
        </p>
      </div>
      <div className="flex flex-col gap-1 text-sm" style={{ color: 'var(--fg-muted)' }}>
        <p>💡 Try searching for:</p>
        {TRENDING_CHIPS.slice(0, 4).map((s) => (
          <span key={s} className="font-semibold" style={{ color: 'var(--fg-secondary)' }}>
            "{s}"
          </span>
        ))}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Error state                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */
function SearchError({ onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20 gap-4"
    >
      <RiErrorWarningLine className="text-5xl" style={{ color: '#e50914' }} aria-hidden="true" />
      <div className="text-center">
        <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--fg-primary)' }}>
          Something went wrong
        </h2>
        <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
          Failed to load search results. Check your connection.
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="h-10 px-6 rounded-xl text-sm font-bold text-white"
        style={{ background: '#e50914' }}
      >
        Try Again
      </button>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Infinite scroll sentinel                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */
function LoadMoreSentinel({ hasMore, isFetchingMore, onLoadMore }) {
  const { ref, isIntersecting } = useIntersectionObserver({
    rootMargin: '200px',
    threshold: 0,
  });

  useEffect(() => {
    if (isIntersecting && hasMore && !isFetchingMore) {
      onLoadMore();
    }
  }, [isIntersecting, hasMore, isFetchingMore, onLoadMore]);

  if (!hasMore && !isFetchingMore) return null;

  return (
    <div ref={ref} className="flex justify-center py-8" aria-hidden="true">
      {isFetchingMore && (
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div
            className="w-6 h-6 rounded-full border-2 border-t-transparent"
            style={{
              borderColor: 'var(--border-default)',
              borderTopColor: '#e50914',
              animation: 'spin 0.7s linear infinite',
            }}
          />
          <span className="text-sm" style={{ color: 'var(--fg-muted)' }}>
            Loading more…
          </span>
        </motion.div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* History row                                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */
function SearchHistory({ history, onSelect, onRemove, onClearAll }) {
  if (!history.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold flex items-center gap-2"
          style={{ color: 'var(--fg-secondary)' }}>
          <RiHistoryLine aria-hidden="true" /> Recent Searches
        </h3>
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs hover:text-[#e50914] transition-colors flex items-center gap-1"
          style={{ color: 'var(--fg-muted)' }}
        >
          <RiDeleteBinLine aria-hidden="true" /> Clear all
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {history.map((term) => (
          <div
            key={term}
            className="flex items-center gap-1.5 group"
          >
            <button
              type="button"
              onClick={() => onSelect(term)}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-sm
                         transition-colors hover:text-white"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                color: 'var(--fg-secondary)',
              }}
            >
              <RiHistoryLine className="text-xs opacity-60" aria-hidden="true" />
              {term}
            </button>
            <button
              type="button"
              aria-label={`Remove "${term}" from history`}
              onClick={() => onRemove(term)}
              className="opacity-0 group-hover:opacity-100 transition-opacity
                         flex items-center justify-center w-5 h-5 rounded-full text-xs"
              style={{ background: 'var(--bg-elevated)', color: 'var(--fg-muted)' }}
            >
              <RiCloseLine aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SEARCH PAGE
══════════════════════════════════════════════════════════════════════════════ */
export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';

  const {
    query, setQuery,
    activeFilter, setActiveFilter,
    results, isLoading, isFetchingMore,
    hasMore, loadMore,
    totalResults, error, isActive,
  } = useSearch();

  /* History stored in localStorage */
  const [history, setHistory, clearHistory] = useLocalStorage(HISTORY_KEY, []);

  const inputRef = useRef(null);

  /* Sync URL → state on mount */
  useEffect(() => {
    if (initialQuery) setQuery(initialQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Sync state → URL query param */
  useEffect(() => {
    if (query.trim()) {
      setSearchParams({ q: query }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [query, setSearchParams]);

  /* Auto-focus input on mount */
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /* Save to history on Enter or click */
  const commitToHistory = useCallback((term) => {
    const t = term.trim();
    if (!t) return;
    setHistory((prev) => {
      const filtered = prev.filter((x) => x !== t);
      return [t, ...filtered].slice(0, MAX_HISTORY);
    });
  }, [setHistory]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') commitToHistory(query);
    if (e.key === 'Escape') { setQuery(''); inputRef.current?.blur(); }
  }, [query, commitToHistory, setQuery]);

  const handleChipClick = useCallback((chip) => {
    setQuery(chip);
    commitToHistory(chip);
    inputRef.current?.focus();
  }, [setQuery, commitToHistory]);

  const handleHistorySelect = useCallback((term) => {
    setQuery(term);
    inputRef.current?.focus();
  }, [setQuery]);

  const handleHistoryRemove = useCallback((term) => {
    setHistory((prev) => prev.filter((x) => x !== term));
  }, [setHistory]);

  /* Retry on error */
  const [retryKey, setRetryKey] = useState(0);
  const handleRetry = () => { setRetryKey((k) => k + 1); };

  /* ── render ──────────────────────────────────────────────────────────── */
  return (
    <div
      className="min-h-screen px-[clamp(1rem,5vw,4rem)] pt-6 pb-20"
      style={{ background: 'var(--bg-base)' }}
    >
      <SEO title="Search" />

      {/* ══ 1. SEARCH INPUT ══════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-3xl mx-auto mb-8"
      >
        <div
          className="relative flex items-center rounded-2xl overflow-hidden"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            boxShadow: isActive ? '0 0 0 2px rgba(229,9,20,0.35), 0 8px 32px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.3)',
            transition: 'box-shadow 0.2s',
          }}
        >
          {/* Search icon */}
          <div className="flex items-center justify-center w-14 h-14 flex-shrink-0">
            {isLoading ? (
              <div
                className="w-5 h-5 rounded-full border-2 border-t-transparent"
                style={{
                  borderColor: 'var(--border-default)',
                  borderTopColor: '#e50914',
                  animation: 'spin 0.7s linear infinite',
                }}
                aria-label="Searching…"
              />
            ) : (
              <RiSearchLine
                className="text-2xl"
                style={{ color: isActive ? '#e50914' : 'var(--fg-muted)' }}
                aria-hidden="true"
              />
            )}
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="search"
            role="searchbox"
            id="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search movies, TV shows, actors…"
            autoComplete="off"
            spellCheck={false}
            aria-label="Search BappamMovies"
            className="flex-1 h-14 bg-transparent text-base outline-none pr-2"
            style={{ color: 'var(--fg-primary)', caretColor: '#e50914' }}
          />

          {/* Clear button */}
          <AnimatePresence>
            {query && (
              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.15 }}
                onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                aria-label="Clear search"
                className="flex items-center justify-center w-9 h-9 mr-2 rounded-full text-lg flex-shrink-0
                           hover:bg-white/10 transition-colors"
                style={{ color: 'var(--fg-muted)' }}
              >
                <RiCloseLine aria-hidden="true" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* ── Filter Tabs ── */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 no-scrollbar" role="tablist">
          {FILTER_TABS.map((tab) => {
            const active = activeFilter === tab.id;
            return (
              <motion.button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveFilter(tab.id)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold
                           flex-shrink-0 transition-all duration-150"
                style={{
                  background: active ? '#e50914' : 'var(--bg-elevated)',
                  border: `1px solid ${active ? '#e50914' : 'var(--border-default)'}`,
                  color: active ? '#fff' : 'var(--fg-secondary)',
                  boxShadow: active ? '0 4px 16px rgba(229,9,20,0.35)' : 'none',
                }}
              >
                <span className="text-base" aria-hidden="true">{tab.icon}</span>
                {tab.label}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* ══ 2. IDLE STATE (no search active) ════════════════════════════ */}
      <AnimatePresence mode="wait">
        {!isActive && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto space-y-10"
          >
            {/* Trending chips */}
            <section aria-label="Trending searches">
              <h2 className="text-base font-bold flex items-center gap-2 mb-4"
                style={{ color: 'var(--fg-primary)' }}>
                <RiFireLine style={{ color: '#e50914' }} aria-hidden="true" />
                Trending Searches
              </h2>
              <div className="flex flex-wrap gap-2">
                {TRENDING_CHIPS.map((chip, i) => (
                  <motion.button
                    key={chip}
                    type="button"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleChipClick(chip)}
                    className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-medium
                               transition-colors hover:text-white"
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--fg-secondary)',
                    }}
                  >
                    <RiFireLine className="text-xs" style={{ color: '#e50914' }} aria-hidden="true" />
                    {chip}
                  </motion.button>
                ))}
              </div>
            </section>

            {/* Recent search history */}
            <AnimatePresence>
              {history.length > 0 && (
                <SearchHistory
                  history={history}
                  onSelect={handleHistorySelect}
                  onRemove={handleHistoryRemove}
                  onClearAll={() => clearHistory()}
                />
              )}
            </AnimatePresence>

            {/* Popular movies */}
            <PopularMoviesGrid onQuerySelect={handleChipClick} />
          </motion.div>
        )}

        {/* ══ 3. ACTIVE SEARCH STATE ══════════════════════════════════════ */}
        {isActive && (
          <motion.div
            key="search-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto"
          >
            {/* Result meta */}
            <AnimatePresence>
              {!isLoading && !error && results.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between mb-5 flex-wrap gap-3"
                >
                  <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
                    <span className="font-bold" style={{ color: 'var(--fg-primary)' }}>
                      {totalResults.toLocaleString()}
                    </span>{' '}
                    results for{' '}
                    <span className="font-bold" style={{ color: '#e50914' }}>
                      "{query}"
                    </span>
                  </p>

                  {/* Save to history chip */}
                  <button
                    type="button"
                    onClick={() => commitToHistory(query)}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium
                               transition-colors hover:text-white"
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--fg-muted)',
                    }}
                  >
                    <RiHistoryLine aria-hidden="true" /> Save search
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Loading skeleton */}
            {isLoading && <ResultsSkeleton count={20} />}

            {/* Error */}
            {error && !isLoading && <SearchError onRetry={handleRetry} />}

            {/* No results */}
            {!isLoading && !error && results.length === 0 && (
              <NoResults query={query} />
            )}

            {/* Results grid */}
            {!isLoading && !error && results.length > 0 && (
              <>
                <motion.div
                  className="grid gap-4 sm:gap-6 lg:gap-8"
                  style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}
                  layout
                >
                  <AnimatePresence mode="popLayout">
                    {results.map((item, i) => (
                      <ResultCard key={`${item.id}-${item.media_type ?? 'movie'}`} item={item} index={i} />
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* Infinite scroll sentinel */}
                <LoadMoreSentinel
                  hasMore={hasMore}
                  isFetchingMore={isFetchingMore}
                  onLoadMore={loadMore}
                />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spin keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
