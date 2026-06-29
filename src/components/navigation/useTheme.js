/**
 * @file src/components/navigation/useTheme.js
 * @description Dark/light theme management hook.
 * Persists to localStorage, syncs with OS preference on first visit,
 * and writes data-theme attribute to <html>.
 */

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'bappammovies_theme';
const VALID_THEMES = ['dark', 'light'];

function getInitialTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && VALID_THEMES.includes(stored)) return stored;
  } catch (_) {}

  // Fall back to OS preference
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  return 'dark';
}

function applyTheme(theme) {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  root.style.colorScheme = theme;
  try { localStorage.setItem(STORAGE_KEY, theme); } catch (_) {}
}

export default function useTheme() {
  const [theme, setThemeState] = useState(getInitialTheme);

  /* Apply on mount and whenever theme changes */
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  /* Listen for OS preference changes */
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;
    const handler = (e) => {
      // Only auto-switch if user has never manually set a preference
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) setThemeState(e.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const setTheme = useCallback((next) => {
    if (VALID_THEMES.includes(next)) setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return {
    theme,           // 'dark' | 'light'
    isDark:  theme === 'dark',
    isLight: theme === 'light',
    setTheme,
    toggleTheme,
  };
}
