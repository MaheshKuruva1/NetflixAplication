/**
 * @file src/utils/imageHelpers.js
 * @description TMDB image URL builders and fallback handling.
 */

import { IMAGE_SIZES } from '@config/api.js';

/** Generic placeholder dimensions */
const PLACEHOLDER = {
  poster:   'https://placehold.co/500x750/111118/666680?text=No+Image',
  backdrop: 'https://placehold.co/1280x720/111118/666680?text=No+Image',
  profile:  'https://placehold.co/300x450/111118/666680?text=No+Photo',
  logo:     'https://placehold.co/300x100/111118/666680?text=No+Logo',
};

/**
 * Build a full TMDB poster URL.
 * @param {string|null} path
 * @param {'xs'|'sm'|'md'|'lg'|'xl'|'xxl'|'original'} [size='xl']
 * @returns {string}
 */
export function getPosterUrl(path, size = 'xl') {
  if (!path) return PLACEHOLDER.poster;
  return `${IMAGE_SIZES.poster[size] ?? IMAGE_SIZES.poster.xl}${path}`;
}

/**
 * Build a full TMDB backdrop URL.
 * @param {string|null} path
 * @param {'sm'|'md'|'lg'|'original'} [size='lg']
 * @returns {string}
 */
export function getBackdropUrl(path, size = 'lg') {
  if (!path) return PLACEHOLDER.backdrop;
  return `${IMAGE_SIZES.backdrop[size] ?? IMAGE_SIZES.backdrop.lg}${path}`;
}

/**
 * Build a full TMDB profile (person) image URL.
 * @param {string|null} path
 * @param {'sm'|'md'|'lg'|'original'} [size='md']
 * @returns {string}
 */
export function getProfileUrl(path, size = 'md') {
  if (!path) return PLACEHOLDER.profile;
  return `${IMAGE_SIZES.profile[size] ?? IMAGE_SIZES.profile.md}${path}`;
}

/**
 * Build a full TMDB logo image URL.
 * @param {string|null} path
 * @param {'sm'|'md'|'lg'|'original'} [size='md']
 * @returns {string}
 */
export function getLogoUrl(path, size = 'md') {
  if (!path) return PLACEHOLDER.logo;
  return `${IMAGE_SIZES.logo[size] ?? IMAGE_SIZES.logo.md}${path}`;
}

/** All image helpers as a single namespace. */
export const imageHelpers = { getPosterUrl, getBackdropUrl, getProfileUrl, getLogoUrl };
export default imageHelpers;
