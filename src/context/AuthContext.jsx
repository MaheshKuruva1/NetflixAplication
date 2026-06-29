/**
 * @file src/context/AuthContext.jsx
 * @description Authentication context — manages user session state.
 * Currently uses localStorage for a demo implementation.
 * Replace with a real auth provider (Firebase, Auth0, etc.) as needed.
 */

import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';

// ─── Initial State ────────────────────────────────────────────────────────────
const initialState = {
  user:          null,
  isAuthenticated: false,
  isLoading:     true,
  error:         null,
};

// ─── Action Types ─────────────────────────────────────────────────────────────
const AUTH_ACTIONS = {
  LOGIN_START:    'LOGIN_START',
  LOGIN_SUCCESS:  'LOGIN_SUCCESS',
  LOGIN_FAILURE:  'LOGIN_FAILURE',
  LOGOUT:         'LOGOUT',
  SET_LOADING:    'SET_LOADING',
  CLEAR_ERROR:    'CLEAR_ERROR',
  RESTORE_SESSION:'RESTORE_SESSION',
};

// ─── Reducer ──────────────────────────────────────────────────────────────────
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return { ...state, isLoading: true, error: null };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return { ...state, isLoading: false, error: action.payload };

    case AUTH_ACTIONS.LOGOUT:
      return { ...initialState, isLoading: false };

    case AUTH_ACTIONS.RESTORE_SESSION:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('bappammovies_user');
    try {
      const user = stored ? JSON.parse(stored) : null;
      dispatch({ type: AUTH_ACTIONS.RESTORE_SESSION, payload: user });
    } catch {
      dispatch({ type: AUTH_ACTIONS.RESTORE_SESSION, payload: null });
    }
  }, []);

  /**
   * Sign in with email/password.
   * @param {string} email
   * @param {string} password
   */
  const login = useCallback(async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    try {
      // TODO: Replace with real auth call
      await new Promise((r) => setTimeout(r, 800));
      const mockUser = {
        id:     'usr_001',
        email,
        name:   email.split('@')[0],
        avatar: null,
        plan:   'premium',
      };
      localStorage.setItem('bappammovies_user', JSON.stringify(mockUser));
      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: mockUser });
      return { success: true };
    } catch (err) {
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: err.message });
      return { success: false, error: err.message };
    }
  }, []);

  /**
   * Sign up with email/password.
   * @param {string} name
   * @param {string} email
   * @param {string} password
   */
  const signup = useCallback(async (name, email, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    try {
      await new Promise((r) => setTimeout(r, 800));
      const mockUser = {
        id:     `usr_${Date.now()}`,
        email,
        name:   name || email.split('@')[0],
        avatar: null,
        plan:   'premium',
      };
      localStorage.setItem('bappammovies_user', JSON.stringify(mockUser));
      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: mockUser });
      return { success: true };
    } catch (err) {
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: err.message });
      return { success: false, error: err.message };
    }
  }, []);

  /** Sign out and clear session. */
  const logout = useCallback(() => {
    localStorage.removeItem('bappammovies_user');
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  }, []);

  /** Clear any auth error. */
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  const value = {
    ...state,
    login,
    signup,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}

export default AuthContext;
