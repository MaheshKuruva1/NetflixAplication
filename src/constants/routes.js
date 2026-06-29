/**
 * @file src/constants/routes.js
 * @description Application route path constants. Single source of truth for all routes.
 */

export const ROUTES = {
  HOME:           '/',
  BROWSE:         '/browse',
  MOVIES:         '/movies',
  MOVIES_GENRE:   '/movies/genre/:genreId',
  TV_SHOWS:       '/tv',
  TV_SHOWS_GENRE: '/tv/genre/:genreId',
  NEW_POPULAR:    '/new-popular',
  MY_LIST:        '/my-list',
  ORIGINALS:      '/originals',

  // Detail pages
  MOVIE_DETAIL:   '/movie/:id',
  TV_DETAIL:      '/tv/:id',
  PERSON_DETAIL:  '/person/:id',

  // Search
  SEARCH:         '/search',

  // Auth
  LOGIN:          '/login',
  SIGNUP:         '/signup',
  PROFILE:        '/profile',

  // Utility helpers
  toMovieDetail:  (id) => `/movie/${id}`,
  toTVDetail:     (id) => `/tv/${id}`,
  toPersonDetail: (id) => `/person/${id}`,
  toMovieGenre:   (id) => `/movies/genre/${id}`,
  toTVGenre:      (id) => `/tv/genre/${id}`,
};

export default ROUTES;
