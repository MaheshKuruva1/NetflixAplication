/**
 * @file src/context/WatchlistContext.jsx
 * @description Global watchlist (My List) state persisted to localStorage.
 * Supports add, remove, toggle, and check-if-present operations.
 */

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from 'react';

const STORAGE_KEY = 'bappammovies_watchlist';

// ─── Action Types ─────────────────────────────────────────────────────────────
const WATCHLIST_ACTIONS = {
  ADD:    'ADD',
  REMOVE: 'REMOVE',
  CLEAR:  'CLEAR',
  HYDRATE:'HYDRATE',
};

// ─── Reducer ──────────────────────────────────────────────────────────────────
function watchlistReducer(state, action) {
  switch (action.type) {
    case WATCHLIST_ACTIONS.HYDRATE:
      return { items: action.payload };

    case WATCHLIST_ACTIONS.ADD: {
      const exists = state.items.some(
        (i) => i.id === action.payload.id && i.media_type === action.payload.media_type
      );
      if (exists) return state;
      return { items: [action.payload, ...state.items] };
    }

    case WATCHLIST_ACTIONS.REMOVE:
      return {
        items: state.items.filter(
          (i) => !(i.id === action.payload.id && i.media_type === action.payload.media_type)
        ),
      };

    case WATCHLIST_ACTIONS.CLEAR:
      return { items: [] };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
const WatchlistContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function WatchlistProvider({ children }) {
  const [state, dispatch] = useReducer(watchlistReducer, { items: [] });

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const items = raw ? JSON.parse(raw) : [];
      dispatch({ type: WATCHLIST_ACTIONS.HYDRATE, payload: items });
    } catch {
      dispatch({ type: WATCHLIST_ACTIONS.HYDRATE, payload: [] });
    }
  }, []);

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  /**
   * Add a media item to the watchlist.
   * @param {{ id: number, media_type: string, title?: string, name?: string, poster_path?: string, vote_average?: number }} item
   */
  const addToWatchlist = useCallback((item) => {
    dispatch({ type: WATCHLIST_ACTIONS.ADD, payload: item });
  }, []);

  /**
   * Remove a media item from the watchlist.
   * @param {number} id
   * @param {'movie'|'tv'} mediaType
   */
  const removeFromWatchlist = useCallback((id, mediaType) => {
    dispatch({ type: WATCHLIST_ACTIONS.REMOVE, payload: { id, media_type: mediaType } });
  }, []);

  /**
   * Toggle watchlist membership.
   * @param {{ id: number, media_type: string }} item
   */
  const toggleWatchlist = useCallback((item) => {
    const exists = state.items.some(
      (i) => i.id === item.id && i.media_type === item.media_type
    );
    if (exists) {
      dispatch({ type: WATCHLIST_ACTIONS.REMOVE, payload: item });
    } else {
      dispatch({ type: WATCHLIST_ACTIONS.ADD, payload: item });
    }
  }, [state.items]);

  /**
   * Check if an item is in the watchlist.
   * @param {number} id
   * @param {'movie'|'tv'} mediaType
   * @returns {boolean}
   */
  const isInWatchlist = useCallback((id, mediaType) => {
    return state.items.some((i) => i.id === id && i.media_type === mediaType);
  }, [state.items]);

  /** Clear the entire watchlist. */
  const clearWatchlist = useCallback(() => {
    dispatch({ type: WATCHLIST_ACTIONS.CLEAR });
  }, []);

  const value = {
    watchlist: state.items,
    count: state.items.length,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
    isInWatchlist,
    clearWatchlist,
  };

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useWatchlist() {
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error('useWatchlist must be used within <WatchlistProvider>');
  return ctx;
}

export default WatchlistContext;
