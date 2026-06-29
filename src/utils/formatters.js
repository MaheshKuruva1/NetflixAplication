/**
 * @file src/utils/formatters.js
 * @description Display formatting utilities for dates, numbers, runtime, etc.
 */

// ─── Date Formatters ──────────────────────────────────────────────────────────

/**
 * Format a TMDB date string (YYYY-MM-DD) to a human-readable form.
 * @param {string} dateStr
 * @param {'full'|'year'|'short'|'long'} [format='full']
 * @returns {string}
 */
export function formatDate(dateStr, format = 'full') {
  if (!dateStr) return 'Unknown';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const opts = {
    full:  { year: 'numeric', month: 'long',  day: 'numeric' },
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long:  { year: 'numeric', month: 'long'                  },
    year:  null,
  };

  if (format === 'year') return date.getFullYear().toString();
  return date.toLocaleDateString('en-US', opts[format] ?? opts.full);
}

/**
 * Get just the release year.
 * @param {string} dateStr
 * @returns {string}
 */
export function getYear(dateStr) {
  return formatDate(dateStr, 'year');
}

// ─── Duration Formatters ──────────────────────────────────────────────────────

/**
 * Convert runtime in minutes to "Xh Ym" format.
 * @param {number|null} minutes
 * @returns {string}
 */
export function formatRuntime(minutes) {
  if (!minutes || minutes <= 0) return 'N/A';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// ─── Number Formatters ────────────────────────────────────────────────────────

/**
 * Format a vote average to one decimal place.
 * @param {number} vote
 * @returns {string}
 */
export function formatRating(vote) {
  if (!vote && vote !== 0) return 'N/A';
  return vote.toFixed(1);
}

/**
 * Format a large number with K / M suffix.
 * @param {number} num
 * @returns {string}
 */
export function formatCount(num) {
  if (!num) return '0';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000)     return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

/**
 * Format a revenue/budget number as USD currency.
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  if (!amount || amount === 0) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style:    'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
}

// ─── String Formatters ────────────────────────────────────────────────────────

/**
 * Get display title from a TMDB media item (handles movie and TV objects).
 * @param {{ title?: string, name?: string, original_title?: string, original_name?: string }} item
 * @returns {string}
 */
export function getTitle(item) {
  return item?.title ?? item?.name ?? item?.original_title ?? item?.original_name ?? 'Untitled';
}

/**
 * Get release/air date from a TMDB media item.
 * @param {{ release_date?: string, first_air_date?: string }} item
 * @returns {string}
 */
export function getReleaseDate(item) {
  return item?.release_date ?? item?.first_air_date ?? '';
}

/**
 * Truncate a string to a given length with an ellipsis.
 * @param {string} str
 * @param {number} [maxLen=150]
 * @returns {string}
 */
export function truncate(str, maxLen = 150) {
  if (!str || str.length <= maxLen) return str ?? '';
  return `${str.slice(0, maxLen).trimEnd()}…`;
}

/**
 * Convert a genre ID array + map to a comma-separated string.
 * @param {number[]} ids
 * @param {Record<number, string>} genreMap
 * @param {number} [limit=3]
 * @returns {string}
 */
export function formatGenres(ids = [], genreMap = {}, limit = 3) {
  return ids
    .slice(0, limit)
    .map((id) => genreMap[id] ?? '')
    .filter(Boolean)
    .join(' · ');
}

export default {
  formatDate,
  getYear,
  formatRuntime,
  formatRating,
  formatCount,
  formatCurrency,
  getTitle,
  getReleaseDate,
  truncate,
  formatGenres,
};
