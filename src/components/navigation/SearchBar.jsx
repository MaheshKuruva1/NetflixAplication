/**
 * @file src/components/navigation/SearchBar.jsx
 * @description Netflix-style expanding inline search bar.
 *
 * Desktop: click magnifier → input expands inline in navbar, press Enter to search.
 * Mobile: tap → opens full-screen SearchOverlay.
 * Features: debounced query, typeahead placeholder cycle, clear button.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RiSearchLine, RiCloseLine } from 'react-icons/ri';
import { useUI } from '@context/UIContext.jsx';
import useDebounce from '@hooks/useDebounce.js';
import useClickOutside from '@hooks/useClickOutside.js';
import { cn } from '@utils/cn.js';
import { ROUTES } from '@constants/routes.js';

/* ── Cycling placeholder strings ─────────────────────────────────────────────── */
const PLACEHOLDERS = [
  'Search movies…',
  'Search TV shows…',
  'Try "Inception"',
  'Try "Breaking Bad"',
  'Discover something new…',
];

export default function SearchBar({ className }) {
  const navigate       = useNavigate();
  const { openSearch } = useUI();          // mobile full-overlay
  const [expanded, setExpanded] = useState(false);
  const [query,    setQuery]    = useState('');
  const [phIndex,  setPhIndex]  = useState(0);
  const inputRef     = useRef(null);
  const containerRef = useClickOutside(() => {
    if (!query) setExpanded(false);
  });

  /* Cycle placeholder when not typing */
  useEffect(() => {
    if (expanded) return;
    const id = setInterval(() => {
      setPhIndex((i) => (i + 1) % PLACEHOLDERS.length);
    }, 2800);
    return () => clearInterval(id);
  }, [expanded]);

  /* Focus input when expanded */
  useEffect(() => {
    if (expanded) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [expanded]);

  const handleExpand = useCallback(() => {
    // On mobile (< lg), use full overlay
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      openSearch();
    } else {
      setExpanded(true);
    }
  }, [openSearch]);

  const handleSearch = useCallback(() => {
    const term = query.trim();
    if (!term) return;
    setExpanded(false);
    setQuery('');
    navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(term)}`);
  }, [query, navigate]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') { setExpanded(false); setQuery(''); }
  }, [handleSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
    inputRef.current?.focus();
  }, []);

  return (
    <div ref={containerRef} className={cn('flex items-center', className)}>
      <motion.div
        animate={{ width: expanded ? 220 : 36 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        className="relative flex items-center overflow-hidden"
      >
        {/* Search icon button */}
        <motion.button
          type="button"
          aria-label={expanded ? 'Submit search' : 'Open search'}
          onClick={expanded ? handleSearch : handleExpand}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute left-0 z-10 flex items-center justify-center w-9 h-9 rounded-xl text-lg flex-shrink-0"
          style={{ color: expanded ? '#e50914' : 'var(--fg-muted)' }}
        >
          <RiSearchLine aria-hidden="true" />
        </motion.button>

        {/* Expanding input */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              key="search-input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center w-full h-9 pl-9 pr-8"
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-focus)',
                borderRadius: '0.75rem',
                boxShadow: '0 0 0 3px rgba(229,9,20,0.12)',
              }}
            >
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={PLACEHOLDERS[phIndex]}
                className="w-full bg-transparent text-sm outline-none border-none"
                style={{
                  color: 'var(--fg-primary)',
                  fontFamily: 'var(--font-sans)',
                }}
                aria-label="Search movies and shows"
              />

              {/* Clear button */}
              <AnimatePresence>
                {query && (
                  <motion.button
                    type="button"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    onClick={handleClear}
                    className="absolute right-2 flex items-center justify-center w-5 h-5
                               rounded-full text-sm opacity-60 hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--fg-secondary)' }}
                    aria-label="Clear search"
                  >
                    <RiCloseLine aria-hidden="true" />
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed: just the icon is visible */}
        {!expanded && (
          <div className="w-9 h-9" aria-hidden="true" />
        )}
      </motion.div>
    </div>
  );
}
