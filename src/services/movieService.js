/**
 * @file src/services/movieService.js
 * @description All movie-related TMDB API calls.
 */

import httpClient from './httpClient.js';
import { ENDPOINTS } from '@config/api.js';

const movieService = {
  /**
   * Get trending movies for the week.
   * @param {number} [page=1]
   */
  getTrending: (page = 1) =>
    httpClient.get(ENDPOINTS.MOVIE_TRENDING, { params: { page } }),

  /**
   * Get popular movies.
   * @param {number} [page=1]
   */
  getPopular: (page = 1) =>
    httpClient.get(ENDPOINTS.MOVIE_POPULAR, { params: { page } }),

  /**
   * Get top-rated movies.
   * @param {number} [page=1]
   */
  getTopRated: (page = 1) =>
    httpClient.get(ENDPOINTS.MOVIE_TOP_RATED, { params: { page } }),

  /**
   * Get movies now playing in theatres.
   * @param {number} [page=1]
   */
  getNowPlaying: (page = 1) =>
    httpClient.get(ENDPOINTS.MOVIE_NOW_PLAYING, { params: { page } }),

  /**
   * Get upcoming movie releases.
   * @param {number} [page=1]
   */
  getUpcoming: (page = 1) =>
    httpClient.get(ENDPOINTS.MOVIE_UPCOMING, { params: { page } }),

  /**
   * Get full movie details by ID.
   * @param {number|string} id - TMDB movie ID
   * @param {string} [appendToResponse] - comma-separated list of sub-requests
   */
  getDetails: (id, appendToResponse = 'credits,videos,images,similar,recommendations,reviews') =>
    httpClient.get(ENDPOINTS.MOVIE_DETAILS(id), {
      params: { append_to_response: appendToResponse },
    }),

  /**
   * Get movie credits (cast & crew).
   * @param {number|string} id
   */
  getCredits: (id) => httpClient.get(ENDPOINTS.MOVIE_CREDITS(id)),

  /**
   * Get movie trailers and clips.
   * @param {number|string} id
   */
  getVideos: (id) => httpClient.get(ENDPOINTS.MOVIE_VIDEOS(id)),

  /**
   * Get similar movies.
   * @param {number|string} id
   * @param {number} [page=1]
   */
  getSimilar: (id, page = 1) =>
    httpClient.get(ENDPOINTS.MOVIE_SIMILAR(id), { params: { page } }),

  /**
   * Get movie recommendations.
   * @param {number|string} id
   * @param {number} [page=1]
   */
  getRecommendations: (id, page = 1) =>
    httpClient.get(ENDPOINTS.MOVIE_RECOMMENDATIONS(id), { params: { page } }),

  /**
   * Discover movies with advanced filters.
   * @param {Object} filters
   */
  discover: (filters = {}) =>
    httpClient.get(ENDPOINTS.DISCOVER_MOVIE, { params: filters }),

  /**
   * Get all available movie genres.
   */
  getGenres: () => httpClient.get(ENDPOINTS.GENRES_MOVIE),

  /**
   * Get movies by genre ID.
   * @param {number} genreId
   * @param {number} [page=1]
   */
  getByGenre: (genreId, page = 1) =>
    httpClient.get(ENDPOINTS.DISCOVER_MOVIE, {
      params: { with_genres: genreId, sort_by: 'popularity.desc', page },
    }),
};

export default movieService;
