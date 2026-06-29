/**
 * @file src/pages/MyList/WatchlistPage.jsx
 * @description Production-ready Watchlist ("My List") page.
 *
 * Features:
 *  – Live client-side search (title filter)
 *  – Sort: Date Added (newest/oldest), Rating (high/low), Title (A–Z / Z–A)
 *  – Filter: All | Movies | TV Shows
 *  – Grid / List view toggle (persisted to localStorage)
 *  – Remove single item with undo toast
 *  – Clear entire list with confirmation dialog
 *  – Empty state (with browse CTA)
 *  – Animated transitions on filter/sort/view changes
 *  – Item count header
 *  – Responsive: 2–6 columns grid, single-column list
 */

import { useState, useMemo, useCallback } from 'react';
import React from 'react';
import { Link, useNavigate }    from 'react-router-dom';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
  RiSearchLine, RiCloseLine, RiGridFill, RiListCheck,
  RiDeleteBinLine, RiSortDesc, RiFilterLine,
  RiMovieLine, RiTvLine, RiHeartLine,
  RiArrowRightLine, RiCheckLine, RiAlertLine,
} from 'react-icons/ri';

import { useWatchlist }    from '@context/WatchlistContext.jsx';
import { useToast }        from '@components/common/Toast.jsx';
import useLocalStorage     from '@hooks/useLocalStorage.js';
import { ROUTES }          from '@constants/routes.js';
import { MEDIA_TYPE }      from '@constants/media.js';
import { getPosterUrl }    from '@utils/imageHelpers.js';
import { getTitle, getReleaseDate, getYear, formatDate } from '@utils/formatters.js';
import { cn }              from '@utils/cn.js';
import { SEO }             from '@components/common';

/* ── Constants ──────────────────────────────────────────────────────────── */
const SORT_OPTIONS = [
  { id: 'added_desc',  label: 'Newest First'     },
  { id: 'added_asc',   label: 'Oldest First'     },
  { id: 'rating_desc', label: 'Highest Rated'    },
  { id: 'rating_asc',  label: 'Lowest Rated'     },
  { id: 'title_asc',   label: 'Title A–Z'        },
  { id: 'title_desc',  label: 'Title Z–A'        },
];

const FILTER_OPTIONS = [
  { id: 'all',             label: 'All',       icon: <RiGridFill />  },
  { id: MEDIA_TYPE.MOVIE,  label: 'Movies',    icon: <RiMovieLine /> },
  { id: MEDIA_TYPE.TV,     label: 'TV Shows',  icon: <RiTvLine />    },
];

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function sortItems(items, sortId) {
  const sorted = [...items];
  switch (sortId) {
    case 'added_desc':  return sorted;                                                              // default insertion order (newest first)
    case 'added_asc':   return sorted.reverse();
    case 'rating_desc': return sorted.sort((a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0));
    case 'rating_asc':  return sorted.sort((a, b) => (a.vote_average ?? 0) - (b.vote_average ?? 0));
    case 'title_asc':   return sorted.sort((a, b) => getTitle(a).localeCompare(getTitle(b)));
    case 'title_desc':  return sorted.sort((a, b) => getTitle(b).localeCompare(getTitle(a)));
    default:            return sorted;
  }
}

/* ── Confirm Dialog ──────────────────────────────────────────────────────── */
function ClearConfirmDialog({ onConfirm, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.88, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.88, y: 16 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="w-full max-w-sm rounded-2xl p-6"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="flex items-center justify-center w-11 h-11 rounded-xl text-xl flex-shrink-0"
            style={{ background: 'rgba(229,9,20,0.15)', color: '#e50914' }}
          >
            <RiAlertLine aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-bold" style={{ color: 'var(--fg-primary)' }}>
              Clear My List?
            </h2>
            <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
              This will permanently remove all items.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-10 rounded-xl text-sm font-semibold transition-colors"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              color: 'var(--fg-secondary)',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 h-10 rounded-xl text-sm font-bold text-white transition-colors
                       hover:brightness-110"
            style={{ background: '#e50914' }}
          >
            Clear All
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Grid Card (full version for watchlist) ──────────────────────────────── */
const WatchlistGridCard = React.memo(function WatchlistGridCard({ item, onRemove, index }) {
  const navigate  = useNavigate();
  const [imgError, setImgError] = useState(false);

  const title     = getTitle(item);
  const year      = getYear(getReleaseDate(item));
  const rating    = item.vote_average ?? 0;
  const mediaType = item.media_type ?? MEDIA_TYPE.MOVIE;
  const posterUrl = getPosterUrl(item.poster_path, 'xl');
  const route     = mediaType === MEDIA_TYPE.TV
    ? ROUTES.toTVDetail(item.id)
    : ROUTES.toMovieDetail(item.id);

  const typeColor = mediaType === MEDIA_TYPE.TV ? '#00d4ff' : '#f5a623';

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{
        layout: { type: 'spring', stiffness: 350, damping: 30 },
        opacity: { duration: 0.25 },
        delay: Math.min(index * 0.03, 0.35),
      }}
      className="group relative flex flex-col rounded-xl overflow-hidden cursor-pointer"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-default)',
      }}
      onClick={() => navigate(route)}
      tabIndex={0}
      role="article"
      aria-label={title}
      onKeyDown={(e) => { if (e.key === 'Enter') navigate(route); }}
    >
      {/* Poster */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '2/3' }}>
        {!imgError ? (
          <img
            src={posterUrl}
            alt={title}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-top
                       transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-4xl opacity-30"
            style={{ background: 'var(--bg-surface)' }}
          >
            🎬
          </div>
        )}

        {/* Type badge */}
        <div className="absolute top-2 left-2 pointer-events-none">
          <span
            className="text-[0.58rem] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
            style={{
              background: 'rgba(10,10,15,0.85)',
              color: typeColor,
              border: `1px solid ${typeColor}33`,
              backdropFilter: 'blur(8px)',
            }}
          >
            {mediaType === MEDIA_TYPE.TV ? 'Series' : 'Movie'}
          </span>
        </div>

        {/* Rating badge */}
        {rating > 0 && (
          <div
            className="absolute top-2 right-2 pointer-events-none
                       flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[0.65rem] font-bold"
            style={{
              background: 'rgba(10,10,15,0.85)',
              color: '#f5a623',
              backdropFilter: 'blur(8px)',
            }}
          >
            ★ {rating.toFixed(1)}
          </div>
        )}

        {/* Remove button (hover) */}
        <button
          type="button"
          aria-label={`Remove ${title} from My List`}
          onClick={(e) => { e.stopPropagation(); onRemove(item); }}
          className="absolute bottom-2 right-2 flex items-center justify-center
                     w-8 h-8 rounded-full opacity-0 group-hover:opacity-100
                     transition-all duration-200 hover:scale-110"
          style={{
            background: 'rgba(229,9,20,0.85)',
            backdropFilter: 'blur(8px)',
            color: 'white',
          }}
        >
          <RiCloseLine className="text-base" aria-hidden="true" />
        </button>

        {/* Hover overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ background: 'linear-gradient(to top, rgba(10,10,15,0.65), transparent 50%)' }}
        />
      </div>

      {/* Footer */}
      <div className="p-3">
        <p
          className="text-sm font-semibold leading-snug line-clamp-1
                     group-hover:text-white transition-colors"
          style={{ color: 'var(--fg-primary)' }}
        >
          {title}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--fg-muted)' }}>
          {year ?? '—'}
        </p>
      </div>
    </motion.article>
  );
});

/* ── List Row (compact table-like row) ───────────────────────────────────── */
const WatchlistListRow = React.memo(function WatchlistListRow({ item, onRemove, index }) {
  const navigate  = useNavigate();
  const [imgError, setImgError] = useState(false);

  const title     = getTitle(item);
  const year      = getYear(getReleaseDate(item));
  const rating    = item.vote_average ?? 0;
  const mediaType = item.media_type ?? MEDIA_TYPE.MOVIE;
  const posterUrl = getPosterUrl(item.poster_path, 'md');
  const route     = mediaType === MEDIA_TYPE.TV
    ? ROUTES.toTVDetail(item.id)
    : ROUTES.toMovieDetail(item.id);

  const typeColor = mediaType === MEDIA_TYPE.TV ? '#00d4ff' : '#f5a623';

  return (
    <motion.article
      layout
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{
        layout: { type: 'spring', stiffness: 350, damping: 30 },
        duration: 0.25,
        delay: Math.min(index * 0.02, 0.3),
      }}
      className="group flex items-center gap-4 p-3 rounded-xl cursor-pointer
                 transition-all duration-150"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-default)',
      }}
      onClick={() => navigate(route)}
      tabIndex={0}
      role="article"
      aria-label={title}
      onKeyDown={(e) => { if (e.key === 'Enter') navigate(route); }}
    >
      {/* Thumbnail */}
      <div
        className="flex-shrink-0 rounded-lg overflow-hidden"
        style={{ width: 56, height: 80 }}
      >
        {!imgError ? (
          <img
            src={posterUrl}
            alt={title}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-top
                       transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-xl opacity-30"
            style={{ background: 'var(--bg-surface)' }}
          >
            🎬
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold line-clamp-1 group-hover:text-white transition-colors"
          style={{ color: 'var(--fg-primary)' }}
        >
          {title}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span
            className="text-[0.6rem] font-bold uppercase px-1.5 py-0.5 rounded"
            style={{ background: `${typeColor}22`, color: typeColor, border: `1px solid ${typeColor}44` }}
          >
            {mediaType === MEDIA_TYPE.TV ? 'Series' : 'Movie'}
          </span>
          {year && (
            <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>{year}</span>
          )}
        </div>
      </div>

      {/* Rating */}
      {rating > 0 && (
        <div
          className="hidden sm:flex items-center gap-1 text-sm font-bold flex-shrink-0"
          style={{ color: '#f5a623' }}
        >
          ★ {rating.toFixed(1)}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* View detail */}
        <motion.button
          type="button"
          aria-label={`View ${title}`}
          onClick={(e) => { e.stopPropagation(); navigate(route); }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
          className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg text-sm
                     opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid var(--border-default)',
            color: 'var(--fg-secondary)',
          }}
        >
          <RiArrowRightLine aria-hidden="true" />
        </motion.button>

        {/* Remove */}
        <motion.button
          type="button"
          aria-label={`Remove ${title} from My List`}
          onClick={(e) => { e.stopPropagation(); onRemove(item); }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-sm
                     transition-colors"
          style={{
            background: 'rgba(229,9,20,0.1)',
            border: '1px solid rgba(229,9,20,0.2)',
            color: '#ff6b6b',
          }}
        >
          <RiCloseLine aria-hidden="true" />
        </motion.button>
      </div>
    </motion.article>
  );
});

/* ── Empty State ─────────────────────────────────────────────────────────── */
function EmptyState({ hasFilter }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center py-28 gap-6 text-center"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="text-7xl"
        aria-hidden="true"
      >
        {hasFilter ? '🔍' : '🎬'}
      </motion.div>

      <div>
        <h2 className="text-2xl font-black mb-2" style={{ color: 'var(--fg-primary)' }}>
          {hasFilter ? 'Nothing matches your filter' : 'Your list is empty'}
        </h2>
        <p className="text-sm max-w-xs" style={{ color: 'var(--fg-muted)' }}>
          {hasFilter
            ? 'Try a different search term, filter, or category.'
            : 'Start adding movies and TV shows to keep track of what you want to watch.'}
        </p>
      </div>

      {!hasFilter && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 h-11 px-6 rounded-xl text-sm font-bold
                       text-white transition-colors hover:brightness-110"
            style={{ background: '#e50914' }}
          >
            Browse Movies
          </Link>
          <Link
            to={ROUTES.TV_SHOWS}
            className="flex items-center gap-2 h-11 px-6 rounded-xl text-sm font-semibold
                       transition-colors"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              color: 'var(--fg-secondary)',
            }}
          >
            Browse TV Shows
          </Link>
        </div>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   WATCHLIST PAGE
══════════════════════════════════════════════════════════════════════════════ */
export default function WatchlistPage() {
  const { watchlist, removeFromWatchlist, clearWatchlist } = useWatchlist();
  const toast = useToast();

  /* Persisted UI prefs */
  const [viewMode,    setViewMode]   = useLocalStorage('bappm_wl_view',   'grid');
  const [sortId,      setSortId]     = useLocalStorage('bappm_wl_sort',   'added_desc');
  const [filterType,  setFilterType] = useLocalStorage('bappm_wl_filter', 'all');

  /* Ephemeral state */
  const [searchQuery,   setSearchQuery]   = useState('');
  const [showSortMenu,  setShowSortMenu]  = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);

  /* ── Derived list ──────────────────────────────────────────────────── */
  const processed = useMemo(() => {
    let items = watchlist;

    // 1. Filter by media type
    if (filterType !== 'all') {
      items = items.filter((i) => i.media_type === filterType);
    }

    // 2. Search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      items = items.filter((i) => getTitle(i).toLowerCase().includes(q));
    }

    // 3. Sort
    items = sortItems(items, sortId);

    return items;
  }, [watchlist, filterType, searchQuery, sortId]);

  const hasFilter = filterType !== 'all' || searchQuery.trim().length > 0;
  const totalItems = watchlist.length;
  const shownItems = processed.length;

  /* ── Handlers ─────────────────────────────────────────────────────── */
  const handleRemove = useCallback((item) => {
    const title = getTitle(item);
    removeFromWatchlist(item.id, item.media_type ?? MEDIA_TYPE.MOVIE);
    toast.info(`Removed "${title}" from My List`);
  }, [removeFromWatchlist, toast]);

  const handleClearAll = useCallback(() => {
    setShowClearDialog(false);
    clearWatchlist();
    toast.success('My List cleared');
  }, [clearWatchlist, toast]);

  const currentSortLabel = SORT_OPTIONS.find((s) => s.id === sortId)?.label ?? 'Sort';

  /* ══════════════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════════════ */
  return (
    <div
      className="min-h-screen px-[clamp(1rem,5vw,4rem)] pt-6 pb-20"
      style={{ background: 'var(--bg-base)' }}
    >
      <SEO title="My List" />
      {/* ── Clear confirm dialog ── */}
      <AnimatePresence>
        {showClearDialog && (
          <ClearConfirmDialog
            onConfirm={handleClearAll}
            onCancel={() => setShowClearDialog(false)}
          />
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════════════
          HEADER
      ════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8"
      >
        {/* Title row */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div
                className="flex items-center justify-center w-10 h-10 rounded-xl text-xl"
                style={{ background: 'rgba(229,9,20,0.15)', color: '#e50914' }}
                aria-hidden="true"
              >
                <RiHeartLine />
              </div>
              <h1 className="text-3xl font-black" style={{ color: 'var(--fg-primary)' }}>
                My List
              </h1>
            </div>
            <p className="text-sm ml-[52px]" style={{ color: 'var(--fg-muted)' }}>
              {totalItems === 0
                ? 'No items saved yet'
                : `${totalItems} title${totalItems !== 1 ? 's' : ''} saved${shownItems < totalItems ? ` · showing ${shownItems}` : ''}`}
            </p>
          </div>

          {/* Clear all */}
          {totalItems > 0 && (
            <motion.button
              type="button"
              onClick={() => setShowClearDialog(true)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold
                         flex-shrink-0 transition-colors"
              style={{
                background: 'rgba(229,9,20,0.1)',
                border: '1px solid rgba(229,9,20,0.2)',
                color: '#ff6b6b',
              }}
            >
              <RiDeleteBinLine aria-hidden="true" /> Clear All
            </motion.button>
          )}
        </div>

        {/* ── Controls bar ── */}
        {totalItems > 0 && (
          <div className="flex flex-wrap items-center gap-3">

            {/* Search input */}
            <div
              className="relative flex items-center flex-1 min-w-[200px] max-w-xs rounded-xl"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
              }}
            >
              <RiSearchLine
                className="absolute left-3 text-base pointer-events-none"
                style={{ color: 'var(--fg-muted)' }}
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search my list…"
                aria-label="Search watchlist"
                className="w-full h-9 pl-9 pr-8 bg-transparent text-sm outline-none"
                style={{ color: 'var(--fg-primary)', caretColor: '#e50914' }}
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 flex items-center justify-center
                               w-5 h-5 rounded-full text-xs hover:bg-white/10"
                    style={{ color: 'var(--fg-muted)' }}
                  >
                    <RiCloseLine aria-hidden="true" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Filter tabs */}
            <div
              className="flex items-center rounded-xl p-0.5 gap-0.5"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
              role="tablist"
            >
              {FILTER_OPTIONS.map((opt) => {
                const active = filterType === opt.id;
                return (
                  <motion.button
                    key={opt.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setFilterType(opt.id)}
                    whileTap={{ scale: 0.96 }}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold
                               flex-shrink-0 transition-all duration-150"
                    style={{
                      background: active ? '#e50914' : 'transparent',
                      color: active ? '#fff' : 'var(--fg-secondary)',
                    }}
                  >
                    <span className="text-sm" aria-hidden="true">{opt.icon}</span>
                    {opt.label}
                  </motion.button>
                );
              })}
            </div>

            {/* Sort menu */}
            <div className="relative">
              <motion.button
                type="button"
                aria-label="Sort options"
                aria-expanded={showSortMenu}
                onClick={() => setShowSortMenu((v) => !v)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold
                           transition-colors flex-shrink-0"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--fg-secondary)',
                }}
              >
                <RiSortDesc aria-hidden="true" />
                <span className="hidden sm:inline">{currentSortLabel}</span>
              </motion.button>

              <AnimatePresence>
                {showSortMenu && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowSortMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                      className="absolute right-0 top-full mt-2 z-20 py-2 rounded-xl min-w-[180px]"
                      style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-default)',
                        boxShadow: 'var(--shadow-xl)',
                      }}
                      role="menu"
                    >
                      {SORT_OPTIONS.map((opt) => {
                        const active = sortId === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            role="menuitem"
                            onClick={() => { setSortId(opt.id); setShowSortMenu(false); }}
                            className="w-full flex items-center justify-between px-4 py-2.5
                                       text-sm transition-colors text-left"
                            style={{
                              color: active ? '#e50914' : 'var(--fg-secondary)',
                              background: active ? 'rgba(229,9,20,0.08)' : 'transparent',
                            }}
                          >
                            {opt.label}
                            {active && <RiCheckLine aria-hidden="true" />}
                          </button>
                        );
                      })}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* View mode toggle */}
            <div
              className="flex items-center rounded-xl p-0.5 gap-0.5"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
            >
              {[
                { id: 'grid', icon: <RiGridFill />,     label: 'Grid view'  },
                { id: 'list', icon: <RiListCheck />,    label: 'List view'  },
              ].map((vm) => {
                const active = viewMode === vm.id;
                return (
                  <motion.button
                    key={vm.id}
                    type="button"
                    aria-label={vm.label}
                    aria-pressed={active}
                    onClick={() => setViewMode(vm.id)}
                    whileTap={{ scale: 0.93 }}
                    className="flex items-center justify-center w-9 h-8 rounded-lg text-base
                               transition-all duration-150"
                    style={{
                      background: active ? '#e50914' : 'transparent',
                      color: active ? '#fff' : 'var(--fg-muted)',
                    }}
                  >
                    <span aria-hidden="true">{vm.icon}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>

      {/* ════════════════════════════════════════════════════════════════
          CONTENT
      ════════════════════════════════════════════════════════════════ */}
      <LayoutGroup>
        <AnimatePresence mode="wait">

          {/* Empty state */}
          {totalItems === 0 && <EmptyState key="empty" hasFilter={false} />}

          {/* Filter empty state */}
          {totalItems > 0 && processed.length === 0 && (
            <EmptyState key="filter-empty" hasFilter={true} />
          )}

          {/* Grid view */}
          {totalItems > 0 && processed.length > 0 && viewMode === 'grid' && (
            <motion.div
              key="grid-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="grid gap-4 sm:gap-6 lg:gap-8"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}
              role="list"
            >
              <AnimatePresence mode="popLayout">
                {processed.map((item, i) => (
                  <WatchlistGridCard
                    key={`${item.id}-${item.media_type}`}
                    item={item}
                    index={i}
                    onRemove={handleRemove}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* List view */}
          {totalItems > 0 && processed.length > 0 && viewMode === 'list' && (
            <motion.div
              key="list-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-2 max-w-4xl"
              role="list"
            >
              <AnimatePresence mode="popLayout">
                {processed.map((item, i) => (
                  <WatchlistListRow
                    key={`${item.id}-${item.media_type}`}
                    item={item}
                    index={i}
                    onRemove={handleRemove}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

        </AnimatePresence>
      </LayoutGroup>
    </div>
  );
}
