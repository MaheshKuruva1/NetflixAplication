/**
 * @file src/context/UIContext.jsx
 * @description Global UI state — modal, sidebar, search overlay, toast notifications.
 */

import { createContext, useContext, useReducer, useCallback } from 'react';

// ─── Action Types ─────────────────────────────────────────────────────────────
const UI_ACTIONS = {
  OPEN_MODAL:       'OPEN_MODAL',
  CLOSE_MODAL:      'CLOSE_MODAL',
  TOGGLE_SIDEBAR:   'TOGGLE_SIDEBAR',
  TOGGLE_SEARCH:    'TOGGLE_SEARCH',
  CLOSE_SEARCH:     'CLOSE_SEARCH',
  ADD_TOAST:        'ADD_TOAST',
  REMOVE_TOAST:     'REMOVE_TOAST',
  SET_SCROLL_TOP:   'SET_SCROLL_TOP',
};

// ─── Initial State ────────────────────────────────────────────────────────────
const initialState = {
  modal:       { isOpen: false, type: null, data: null },
  isSidebarOpen: false,
  isSearchOpen:  false,
  toasts:      [],
  isScrollTop:   true,
};

let toastId = 0;

// ─── Reducer ──────────────────────────────────────────────────────────────────
function uiReducer(state, action) {
  switch (action.type) {
    case UI_ACTIONS.OPEN_MODAL:
      return { ...state, modal: { isOpen: true, ...action.payload } };

    case UI_ACTIONS.CLOSE_MODAL:
      return { ...state, modal: { isOpen: false, type: null, data: null } };

    case UI_ACTIONS.TOGGLE_SIDEBAR:
      return { ...state, isSidebarOpen: !state.isSidebarOpen };

    case UI_ACTIONS.TOGGLE_SEARCH:
      return { ...state, isSearchOpen: !state.isSearchOpen };

    case UI_ACTIONS.CLOSE_SEARCH:
      return { ...state, isSearchOpen: false };

    case UI_ACTIONS.ADD_TOAST:
      return { ...state, toasts: [...state.toasts, action.payload] };

    case UI_ACTIONS.REMOVE_TOAST:
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.payload) };

    case UI_ACTIONS.SET_SCROLL_TOP:
      return { ...state, isScrollTop: action.payload };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
const UIContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function UIProvider({ children }) {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  const openModal = useCallback((type, data = null) => {
    dispatch({ type: UI_ACTIONS.OPEN_MODAL, payload: { type, data } });
  }, []);

  const closeModal = useCallback(() => {
    dispatch({ type: UI_ACTIONS.CLOSE_MODAL });
  }, []);

  const toggleSidebar = useCallback(() => {
    dispatch({ type: UI_ACTIONS.TOGGLE_SIDEBAR });
  }, []);

  const toggleSearch = useCallback(() => {
    dispatch({ type: UI_ACTIONS.TOGGLE_SEARCH });
  }, []);

  const closeSearch = useCallback(() => {
    dispatch({ type: UI_ACTIONS.CLOSE_SEARCH });
  }, []);

  /**
   * Show a toast notification.
   * @param {string} message
   * @param {'success'|'error'|'info'|'warning'} [variant='info']
   * @param {number} [duration=4000] ms before auto-dismiss
   */
  const showToast = useCallback((message, variant = 'info', duration = 4000) => {
    const id = ++toastId;
    dispatch({
      type: UI_ACTIONS.ADD_TOAST,
      payload: { id, message, variant, duration },
    });
    setTimeout(() => {
      dispatch({ type: UI_ACTIONS.REMOVE_TOAST, payload: id });
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    dispatch({ type: UI_ACTIONS.REMOVE_TOAST, payload: id });
  }, []);

  const setScrollTop = useCallback((value) => {
    dispatch({ type: UI_ACTIONS.SET_SCROLL_TOP, payload: value });
  }, []);

  const openSearch = toggleSearch;

  const value = {
    ...state,
    searchOpen: state.isSearchOpen,   // alias for components
    openModal,
    closeModal,
    toggleSidebar,
    toggleSearch,
    openSearch,
    closeSearch,
    showToast,
    removeToast,
    setScrollTop,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within <UIProvider>');
  return ctx;
}

export default UIContext;
