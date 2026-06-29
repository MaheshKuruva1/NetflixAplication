/**
 * @file src/components/common/SearchOverlay.jsx
 * @description Full-screen animated search overlay with debounced input,
 * trending/recent searches, and live results via UIContext.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RiSearchLine, RiCloseLine, RiArrowRightLine, RiTimeLine, RiFireLine } from 'react-icons/ri';
import { createPortal } from 'react-dom';
import { useUI } from '@context/UIContext.jsx';
import useDebounce from '@hooks/useDebounce.js';
import { cn } from '@utils/cn.js';
import { ROUTES } from '@constants/routes.js';

/* ── Trending searches placeholder ─────────────────────────────────────────── */
const TRENDING = ['Avengers', 'Spider-Man', 'The Last of Us', 'Inception', 'Breaking Bad', 'Dune'];

/* ── SearchOverlay ──────────────────────────────────────────────────────────── */
export default function SearchOverlay() {
  const { searchOpen, closeSearch } = useUI();
  const navigate  = useNavigate();
  const inputRef  = useRef(null);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 350);

  /* Focus input when opened */
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 120);
    } else {
      setQuery('');
    }
  }, [searchOpen]);

  /* Escape key */
  useEffect(() => {
    const handle = (e) => { if (e.key === 'Escape') closeSearch(); };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [closeSearch]);

  /* Body scroll lock */
  useEffect(() => {
    if (searchOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [searchOpen]);

  const handleSearch = useCallback((q) => {
    const term = (q ?? query).trim();
    if (!term) return;
    closeSearch();
    navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(term)}`);
  }, [query, closeSearch, navigate]);

  return createPortal(
    <AnimatePresence>
      {searchOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="search-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[var(--z-modal)]"
            style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)' }}
            onClick={closeSearch}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            key="search-panel"
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="fixed top-0 left-0 right-0 z-[calc(var(--z-modal)+1)] px-4 pt-16 pb-6"
          >
            {/* Input row */}
            <div
              className="container-narrow mx-auto flex items-center gap-3 h-14 px-5 rounded-2xl"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-active)',
                boxShadow: '0 0 0 4px rgba(229,9,20,0.1), var(--shadow-2xl)',
              }}
            >
              <RiSearchLine
                className="flex-shrink-0 text-xl"
                style={{ color: '#e50914' }}
                aria-hidden="true"
              />

              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                placeholder="Search movies, TV shows, people…"
                className="flex-1 bg-transparent text-base outline-none border-none
                           placeholder:text-[var(--fg-muted)]"
                style={{ color: 'var(--fg-primary)', fontFamily: 'var(--font-sans)' }}
                aria-label="Search"
                aria-autocomplete="list"
                role="combobox"
                aria-expanded={!!debouncedQuery}
              />

              {query && (
                <motion.button
                  type="button"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  onClick={() => setQuery('')}
                  className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-lg
                             text-lg opacity-60 hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--fg-secondary)' }}
                  aria-label="Clear search"
                >
                  <RiCloseLine aria-hidden="true" />
                </motion.button>
              )}

              <button
                type="button"
                onClick={closeSearch}
                className="flex-shrink-0 text-sm font-medium px-3 h-8 rounded-lg
                           transition-colors hover:text-white"
                style={{ color: 'var(--fg-muted)' }}
                aria-label="Close search"
              >
                Cancel
              </button>
            </div>

            {/* Suggestions */}
            <AnimatePresence mode="wait">
              {!debouncedQuery ? (
                /* Trending */
                <motion.div
                  key="trending"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.2, delay: 0.05 }}
                  className="container-narrow mx-auto mt-6"
                >
                  <p
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-3"
                    style={{ color: 'var(--fg-muted)' }}
                  >
                    <RiFireLine className="text-[#e50914]" aria-hidden="true" />
                    Trending Searches
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {TRENDING.map((term, i) => (
                      <motion.button
                        key={term}
                        type="button"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => handleSearch(term)}
                        className="flex items-center gap-2 h-9 px-4 rounded-full text-sm font-medium
                                   transition-all duration-150"
                        style={{
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: 'var(--fg-secondary)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                          e.currentTarget.style.color = '#fff';
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                          e.currentTarget.style.color = 'var(--fg-secondary)';
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                        }}
                      >
                        <RiSearchLine className="text-[0.9rem] opacity-60" aria-hidden="true" />
                        {term}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                /* Searching indicator */
                <motion.div
                  key="searching"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="container-narrow mx-auto mt-6 flex items-center gap-3"
                >
                  <RiSearchLine className="text-xl" style={{ color: 'var(--fg-muted)' }} />
                  <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
                    Search for <strong style={{ color: 'white' }}>"{debouncedQuery}"</strong>
                    {' '}— press Enter
                  </p>
                  <button
                    type="button"
                    onClick={() => handleSearch()}
                    className="ml-auto flex items-center gap-1.5 h-8 px-4 rounded-xl text-sm font-semibold
                               bg-[#e50914] text-white hover:bg-[#ff1a26] transition-colors"
                  >
                    Search <RiArrowRightLine aria-hidden="true" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
