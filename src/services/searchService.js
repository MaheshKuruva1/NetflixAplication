/**
 * @file src/services/searchService.js
 * @description Search-related TMDB API calls.
 */

import httpClient from './httpClient.js';
import { ENDPOINTS } from '@config/api.js';

const searchService = {
  /**
   * Multi-search across movies, TV, and people.
   * @param {string} query
   * @param {number} [page=1]
   */
  searchMulti: (query, page = 1) =>
    httpClient.get(ENDPOINTS.SEARCH_MULTI, {
      params: { query: encodeURIComponent(query), page, include_adult: false },
    }),

  /**
   * Search movies only.
   * @param {string} query
   * @param {number} [page=1]
   */
  searchMovies: (query, page = 1) =>
    httpClient.get(ENDPOINTS.SEARCH_MOVIE, {
      params: { query: encodeURIComponent(query), page, include_adult: false },
    }),

  /**
   * Search TV shows only.
   * @param {string} query
   * @param {number} [page=1]
   */
  searchTV: (query, page = 1) =>
    httpClient.get(ENDPOINTS.SEARCH_TV, {
      params: { query: encodeURIComponent(query), page, include_adult: false },
    }),

  /**
   * Search people / actors.
   * @param {string} query
   * @param {number} [page=1]
   */
  searchPeople: (query, page = 1) =>
    httpClient.get(ENDPOINTS.SEARCH_PERSON, {
      params: { query: encodeURIComponent(query), page, include_adult: false },
    }),
};

export default searchService;
