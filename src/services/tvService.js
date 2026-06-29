/**
 * @file src/services/tvService.js
 * @description All TV show-related TMDB API calls.
 */

import httpClient from './httpClient.js';
import { ENDPOINTS } from '@config/api.js';

const tvService = {
  /** Get trending TV shows for the week. */
  getTrending: (page = 1) =>
    httpClient.get(ENDPOINTS.TV_TRENDING, { params: { page } }),

  /** Get popular TV shows. */
  getPopular: (page = 1) =>
    httpClient.get(ENDPOINTS.TV_POPULAR, { params: { page } }),

  /** Get top-rated TV shows. */
  getTopRated: (page = 1) =>
    httpClient.get(ENDPOINTS.TV_TOP_RATED, { params: { page } }),

  /** Get shows currently on air. */
  getOnAir: (page = 1) =>
    httpClient.get(ENDPOINTS.TV_ON_AIR, { params: { page } }),

  /** Get shows airing today. */
  getAiringToday: (page = 1) =>
    httpClient.get(ENDPOINTS.TV_AIRING_TODAY, { params: { page } }),

  /**
   * Get full TV show details.
   * @param {number|string} id
   * @param {string} [appendToResponse]
   */
  getDetails: (id, appendToResponse = 'credits,videos,images,similar,recommendations') =>
    httpClient.get(ENDPOINTS.TV_DETAILS(id), {
      params: { append_to_response: appendToResponse },
    }),

  /** Get TV show credits. */
  getCredits: (id) => httpClient.get(ENDPOINTS.TV_CREDITS(id)),

  /** Get TV show trailers and videos. */
  getVideos: (id) => httpClient.get(ENDPOINTS.TV_VIDEOS(id)),

  /** Get similar TV shows. */
  getSimilar: (id, page = 1) =>
    httpClient.get(ENDPOINTS.TV_SIMILAR(id), { params: { page } }),

  /**
   * Get season details including all episodes.
   * @param {number|string} showId
   * @param {number} seasonNumber
   */
  getSeason: (showId, seasonNumber) =>
    httpClient.get(ENDPOINTS.TV_SEASON(showId, seasonNumber)),

  /**
   * Get individual episode details.
   * @param {number|string} showId
   * @param {number} seasonNumber
   * @param {number} episodeNumber
   */
  getEpisode: (showId, seasonNumber, episodeNumber) =>
    httpClient.get(ENDPOINTS.TV_EPISODE(showId, seasonNumber, episodeNumber)),

  /** Discover TV shows with filters. */
  discover: (filters = {}) =>
    httpClient.get(ENDPOINTS.DISCOVER_TV, { params: filters }),

  /** Get all available TV genres. */
  getGenres: () => httpClient.get(ENDPOINTS.GENRES_TV),

  /** Get TV shows by genre ID. */
  getByGenre: (genreId, page = 1) =>
    httpClient.get(ENDPOINTS.DISCOVER_TV, {
      params: { with_genres: genreId, sort_by: 'popularity.desc', page },
    }),
};

export default tvService;
