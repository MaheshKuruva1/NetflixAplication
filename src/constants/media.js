/**
 * @file src/constants/media.js
 * @description Media-related constants: genre maps, sort options, rating labels, etc.
 */

/** TMDB Genre IDs → Names */
export const MOVIE_GENRES = {
  28:    'Action',
  12:    'Adventure',
  16:    'Animation',
  35:    'Comedy',
  80:    'Crime',
  99:    'Documentary',
  18:    'Drama',
  10751: 'Family',
  14:    'Fantasy',
  36:    'History',
  27:    'Horror',
  10402: 'Music',
  9648:  'Mystery',
  10749: 'Romance',
  878:   'Science Fiction',
  10770: 'TV Movie',
  53:    'Thriller',
  10752: 'War',
  37:    'Western',
};

export const TV_GENRES = {
  10759: 'Action & Adventure',
  16:    'Animation',
  35:    'Comedy',
  80:    'Crime',
  99:    'Documentary',
  18:    'Drama',
  10751: 'Family',
  10762: 'Kids',
  9648:  'Mystery',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
  37:    'Western',
};

/** Sort options for discovery/listing pages */
export const SORT_OPTIONS = [
  { value: 'popularity.desc',        label: 'Most Popular' },
  { value: 'popularity.asc',         label: 'Least Popular' },
  { value: 'vote_average.desc',      label: 'Highest Rated' },
  { value: 'vote_average.asc',       label: 'Lowest Rated' },
  { value: 'release_date.desc',      label: 'Newest First' },
  { value: 'release_date.asc',       label: 'Oldest First' },
  { value: 'revenue.desc',           label: 'Highest Revenue' },
  { value: 'original_title.asc',     label: 'A–Z' },
  { value: 'original_title.desc',    label: 'Z–A' },
];

/** Content type identifiers */
export const MEDIA_TYPE = {
  MOVIE:  'movie',
  TV:     'tv',
  PERSON: 'person',
};

/** Video type filters */
export const VIDEO_TYPES = {
  TRAILER:   'Trailer',
  TEASER:    'Teaser',
  CLIP:      'Clip',
  FEATURETTE:'Featurette',
  BTS:       'Behind the Scenes',
};

/** Rating display helpers */
export const getRatingLabel = (rating) => {
  if (rating >= 8)    return { label: 'Excellent', color: 'badge-green' };
  if (rating >= 7)    return { label: 'Good',      color: 'badge-blue' };
  if (rating >= 5)    return { label: 'Average',   color: 'badge-gold' };
  return                     { label: 'Below Avg', color: 'badge-red' };
};

/** Content rating / maturity */
export const MATURITY_RATINGS = ['G', 'PG', 'PG-13', 'R', 'NC-17', 'TV-Y', 'TV-G', 'TV-PG', 'TV-14', 'TV-MA'];

export default { MOVIE_GENRES, TV_GENRES, SORT_OPTIONS, MEDIA_TYPE, VIDEO_TYPES, MATURITY_RATINGS };
