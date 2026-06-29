/**
 * @file src/config/api.js
 * @description TMDB API endpoint definitions and image size maps.
 */

import ENV from './env.js';

// ─── Image Sizes ────────────────────────────────────────────────────────────
export const IMAGE_SIZES = {
  poster: {
    xs:     `${ENV.TMDB_IMAGE_BASE}/w92`,
    sm:     `${ENV.TMDB_IMAGE_BASE}/w154`,
    md:     `${ENV.TMDB_IMAGE_BASE}/w185`,
    lg:     `${ENV.TMDB_IMAGE_BASE}/w342`,
    xl:     `${ENV.TMDB_IMAGE_BASE}/w500`,
    xxl:    `${ENV.TMDB_IMAGE_BASE}/w780`,
    original: `${ENV.TMDB_IMAGE_BASE}/original`,
  },
  backdrop: {
    sm:     `${ENV.TMDB_IMAGE_BASE}/w300`,
    md:     `${ENV.TMDB_IMAGE_BASE}/w780`,
    lg:     `${ENV.TMDB_IMAGE_BASE}/w1280`,
    original: `${ENV.TMDB_IMAGE_BASE}/original`,
  },
  profile: {
    sm:     `${ENV.TMDB_IMAGE_BASE}/w45`,
    md:     `${ENV.TMDB_IMAGE_BASE}/w185`,
    lg:     `${ENV.TMDB_IMAGE_BASE}/h632`,
    original: `${ENV.TMDB_IMAGE_BASE}/original`,
  },
  logo: {
    sm:     `${ENV.TMDB_IMAGE_BASE}/w92`,
    md:     `${ENV.TMDB_IMAGE_BASE}/w185`,
    lg:     `${ENV.TMDB_IMAGE_BASE}/w300`,
    original: `${ENV.TMDB_IMAGE_BASE}/original`,
  },
};

// ─── TMDB Endpoints ──────────────────────────────────────────────────────────
export const ENDPOINTS = {
  // Movies
  MOVIE_TRENDING:     '/trending/movie/week',
  MOVIE_POPULAR:      '/movie/popular',
  MOVIE_TOP_RATED:    '/movie/top_rated',
  MOVIE_NOW_PLAYING:  '/movie/now_playing',
  MOVIE_UPCOMING:     '/movie/upcoming',
  MOVIE_DETAILS:      (id) => `/movie/${id}`,
  MOVIE_CREDITS:      (id) => `/movie/${id}/credits`,
  MOVIE_VIDEOS:       (id) => `/movie/${id}/videos`,
  MOVIE_SIMILAR:      (id) => `/movie/${id}/similar`,
  MOVIE_RECOMMENDATIONS: (id) => `/movie/${id}/recommendations`,
  MOVIE_IMAGES:       (id) => `/movie/${id}/images`,
  MOVIE_REVIEWS:      (id) => `/movie/${id}/reviews`,

  // TV Shows
  TV_TRENDING:        '/trending/tv/week',
  TV_POPULAR:         '/tv/popular',
  TV_TOP_RATED:       '/tv/top_rated',
  TV_ON_AIR:          '/tv/on_the_air',
  TV_AIRING_TODAY:    '/tv/airing_today',
  TV_DETAILS:         (id) => `/tv/${id}`,
  TV_CREDITS:         (id) => `/tv/${id}/credits`,
  TV_VIDEOS:          (id) => `/tv/${id}/videos`,
  TV_SIMILAR:         (id) => `/tv/${id}/similar`,
  TV_SEASON:          (id, season) => `/tv/${id}/season/${season}`,
  TV_EPISODE:         (id, season, episode) => `/tv/${id}/season/${season}/episode/${episode}`,

  // People
  PERSON_DETAILS:     (id) => `/person/${id}`,
  PERSON_CREDITS:     (id) => `/person/${id}/combined_credits`,
  PERSON_IMAGES:      (id) => `/person/${id}/images`,

  // Search
  SEARCH_MULTI:       '/search/multi',
  SEARCH_MOVIE:       '/search/movie',
  SEARCH_TV:          '/search/tv',
  SEARCH_PERSON:      '/search/person',

  // Discover
  DISCOVER_MOVIE:     '/discover/movie',
  DISCOVER_TV:        '/discover/tv',

  // Genres
  GENRES_MOVIE:       '/genre/movie/list',
  GENRES_TV:          '/genre/tv/list',

  // Trending
  TRENDING_ALL:       '/trending/all/week',
};

export default ENDPOINTS;
