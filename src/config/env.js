/**
 * @file src/config/env.js
 * @description Centralized environment variable access.
 * All env vars must be prefixed with VITE_ to be exposed to the client.
 */

export const ENV = {
  TMDB_API_KEY:    import.meta.env.VITE_TMDB_API_KEY    ?? '',
  TMDB_BASE_URL:   import.meta.env.VITE_TMDB_BASE_URL   ?? 'https://api.themoviedb.org/3',
  TMDB_IMAGE_BASE: import.meta.env.VITE_TMDB_IMAGE_BASE ?? 'https://image.tmdb.org/t/p',
  APP_NAME:        import.meta.env.VITE_APP_NAME        ?? 'BappamMovies',
  APP_ENV:         import.meta.env.MODE,
  IS_DEV:          import.meta.env.DEV,
  IS_PROD:         import.meta.env.PROD,
};

export default ENV;
