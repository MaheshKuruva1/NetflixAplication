/**
 * @file src/services/index.js
 * @description Centralized export for all API services.
 * 
 * Usage:
 * import { movieService, tvService, searchService } from '@services';
 */

export { default as httpClient } from './httpClient.js';
export { default as movieService } from './movieService.js';
export { default as tvService } from './tvService.js';
export { default as searchService } from './searchService.js';
export { default as personService } from './personService.js';
