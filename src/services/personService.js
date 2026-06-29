/**
 * @file src/services/personService.js
 * @description People / cast member TMDB API calls.
 */

import httpClient from './httpClient.js';
import { ENDPOINTS } from '@config/api.js';

const personService = {
  /**
   * Get person details by ID.
   * @param {number|string} id
   */
  getDetails: (id) =>
    httpClient.get(ENDPOINTS.PERSON_DETAILS(id), {
      params: { append_to_response: 'combined_credits,images,external_ids' },
    }),

  /**
   * Get combined movie + TV credits for a person.
   * @param {number|string} id
   */
  getCredits: (id) => httpClient.get(ENDPOINTS.PERSON_CREDITS(id)),

  /**
   * Get profile images for a person.
   * @param {number|string} id
   */
  getImages: (id) => httpClient.get(ENDPOINTS.PERSON_IMAGES(id)),
};

export default personService;
