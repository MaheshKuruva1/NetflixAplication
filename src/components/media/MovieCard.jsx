/**
 * @file src/components/media/MovieCard.jsx
 * @description Netflix-quality movie/TV poster card.
 *
 * Features:
 * - Lazy-loaded poster image with IntersectionObserver via <Image>
 * - Shimmer skeleton until image loads
 * - Hover overlay with gradient, play, watchlist, and info actions
 * - Framer Motion scale + overlay animations
 * - Circular rating badge
 * - Media type chip (Movie / TV)
 * - Quality badge (4K / HD)
 * - Maturity rating
 * - Watchlist heart toggle via WatchlistContext
 * - Progress bar for "continue watching" state
 */

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiPlayFill,
  RiAddLine,
  RiCheckLine,
  RiInformationLine,
  RiStarFill,
} from 'react-icons/ri';
import { useWatchlist } from '@context/WatchlistContext.jsx';
import { getPosterUrl } from '@utils/imageHelpers.js';
import { getTitle, getReleaseDate, getYear, formatRuntime } from '@utils/formatters.js';
import { cn } from '@utils/cn.js';
import { ROUTES } from '@constants/routes.js';
import { MEDIA_TYPE } from '@constants/media.js';
import { Image } from '@components/ui';

/* ── Hover animation variants ───────────────────────────────────────────────── */
const cardVariants = {
  rest: {
    scale: 1,
    y: 0,
    boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
    transition: { type: 'spring', stiffness: 350, damping: 28, mass: 0.8 },
  },
  hover: {
    scale: 1.06,
    y: -6,
    boxShadow: '0 20px 48px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.12)',
    transition: { type: 'spring', stiffness: 350, damping: 28, mass: 0.8 },
  },
};

const overlayVariants = {
  rest:  { opacity: 0 },
  hover: { opacity: 1, transition: { duration: 0.2 } },
};

const actionsVariants = {
  rest:  { opacity: 0, y: 12 },
  hover: { opacity: 1, y: 0, transition: { duration: 0.22, delay: 0.05, ease: [0.16,1,0.3,1] } },
};

/* ── Icon Button ────────────────────────────────────────────────────────────── */
function IconBtn({ onClick, label, danger, active, children }) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      whileHover={{ scale: 1.18 }}
      whileTap={{ scale: 0.88 }}
      transition={{ type: 'spring', stiffness: 600, damping: 30 }}
      className={cn(
        'flex items-center justify-center w-9 h-9 rounded-full text-lg',
        'border transition-colors duration-150 backdrop-blur-sm',
        danger
          ? 'bg-[rgba(229,9,20,0.25)] border-[rgba(229,9,20,0.5)] text-[#ff6b6b] hover:bg-[rgba(229,9,20,0.45)]'
          : active
          ? 'bg-[#e50914] border-transparent text-white'
          : 'bg-black/50 border-white/15 text-white hover:bg-white/20 hover:border-white/30'
      )}
    >
      {children}
    </motion.button>
  );
}

/* ── Movie Card ─────────────────────────────────────────────────────────────── */
const MovieCard = React.memo(function MovieCard({
  item,
  mediaType   = MEDIA_TYPE.MOVIE,
  size        = 'md',           // 'sm' | 'md' | 'lg'
  showRating  = true,
  showBadges  = true,
  showProgress = false,
  progress    = 0,              // 0–100 for "continue watching"
  quality,                       // '4K' | 'HD' | undefined
  rank,                          // number to show (1, 2, 3…)
  className,
  onPlay,
  onInfo,
}) {
  const navigate   = useNavigate();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const [hovered, setHovered]       = useState(false);

  const title       = getTitle(item);
  const year        = getYear(getReleaseDate(item));
  const rating      = item?.vote_average ?? 0;
  const posterPath  = item?.poster_path;
  const posterUrl   = getPosterUrl(posterPath, size === 'lg' ? 'xl' : 'lg');
  const inWatchlist = isInWatchlist(item?.id, mediaType);

  const handleCardClick = useCallback(() => {
    const path = mediaType === MEDIA_TYPE.TV
      ? ROUTES.toTVDetail(item.id)
      : ROUTES.toMovieDetail(item.id);
    navigate(path);
  }, [navigate, mediaType, item?.id]);

  const handlePlay = useCallback(() => {
    onPlay?.(item) ?? handleCardClick();
  }, [onPlay, item, handleCardClick]);

  const handleWatchlist = useCallback(() => {
    toggleWatchlist({
      id:          item.id,
      media_type:  mediaType,
      title:       title,
      poster_path: posterPath,
      vote_average: rating,
    });
  }, [toggleWatchlist, item, mediaType, title, posterPath, rating]);

  const handleInfo = useCallback(() => {
    onInfo ? onInfo(item) : handleCardClick();
  }, [onInfo, item, handleCardClick]);

  /* Width by size */
  const widths = {
    sm: 'w-[130px]',
    md: 'w-[clamp(130px,15vw,180px)]',
    lg: 'w-[clamp(160px,18vw,220px)]',
  };

  return (
    <motion.div
      className={cn(
        'relative cursor-pointer select-none rounded-xl overflow-hidden',
        'group h-full flex-shrink-0 hover:z-50 focus-within:z-50',
        widths[size] ?? widths.md,
        className
      )}
      variants={cardVariants}
      initial="rest"
      whileHover="hover"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={handleCardClick}
      tabIndex={0}
      role="article"
      aria-label={`${title}${year ? `, ${year}` : ''}`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick(); }}
    >
      {/* ── Poster ── */}
      <div className="relative aspect-poster bg-[var(--bg-elevated)] rounded-xl overflow-hidden">
        
        {/* Optimized Image Component */}
        <Image 
          src={posterUrl} 
          alt={title}
          skeletonClassName="rounded-xl"
        />

        {/* ── Rank Number ── */}
        {rank !== undefined && (
          <div
            className="absolute bottom-0 left-0 font-black leading-none select-none pointer-events-none"
            style={{
              fontSize: 'clamp(3rem, 8vw, 6rem)',
              lineHeight: 0.85,
              color: 'transparent',
              WebkitTextStroke: '2px rgba(255,255,255,0.25)',
              textShadow: '0 0 30px rgba(0,0,0,0.8)',
              transform: 'translateX(-8%)',
            }}
            aria-hidden="true"
          >
            {rank}
          </div>
        )}

        {/* ── Hover Overlay ── */}
        <motion.div
          variants={overlayVariants}
          className="absolute inset-0 movie-card-overlay rounded-none pointer-events-none"
          aria-hidden="true"
        />

        {/* ── Hover Actions ── */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              variants={actionsVariants}
              initial="rest"
              animate="hover"
              exit="rest"
              className="absolute bottom-0 left-0 right-0 p-3"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Action buttons row */}
              <div className="flex items-center gap-1.5 mb-2">
                {/* Play */}
                <motion.button
                  type="button"
                  aria-label={`Play ${title}`}
                  onClick={(e) => { e.stopPropagation(); handlePlay(); }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex items-center gap-1.5 flex-1 justify-center h-8 rounded-lg
                             bg-white text-black text-xs font-bold transition-colors
                             hover:bg-gray-100"
                >
                  <RiPlayFill className="text-base" aria-hidden="true" />
                  Play
                </motion.button>

                {/* Watchlist */}
                <IconBtn
                  label={inWatchlist ? 'Remove from My List' : 'Add to My List'}
                  active={inWatchlist}
                  onClick={handleWatchlist}
                >
                  {inWatchlist
                    ? <RiCheckLine aria-hidden="true" />
                    : <RiAddLine aria-hidden="true" />}
                </IconBtn>

                {/* Info */}
                <IconBtn label={`More info about ${title}`} onClick={handleInfo}>
                  <RiInformationLine aria-hidden="true" />
                </IconBtn>
              </div>

              {/* Rating + Year */}
              <div className="flex items-center gap-2">
                {showRating && rating > 0 && (
                  <span className="flex items-center gap-1 text-[0.7rem] font-semibold"
                    style={{ color: '#f5a623' }}>
                    <RiStarFill aria-hidden="true" />
                    {rating.toFixed(1)}
                  </span>
                )}
                {year && (
                  <span className="text-[0.7rem]" style={{ color: 'var(--fg-muted)' }}>
                    {year}
                  </span>
                )}
                {/* Runtime if available */}
                {item?.runtime > 0 && (
                  <span className="text-[0.7rem]" style={{ color: 'var(--fg-muted)' }}>
                    {formatRuntime(item.runtime)}
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Top badges ── */}
        {showBadges && (
          <div className="absolute top-2 left-2 right-2 flex items-start justify-between pointer-events-none">
            {/* Media type */}
            <span
              className="px-1.5 py-0.5 rounded text-[0.6rem] font-bold uppercase tracking-wider"
              style={{
                background: 'rgba(10,10,15,0.85)',
                color: mediaType === MEDIA_TYPE.TV ? '#00d4ff' : '#f5a623',
                border: `1px solid ${mediaType === MEDIA_TYPE.TV ? 'rgba(0,212,255,0.3)' : 'rgba(245,166,35,0.3)'}`,
                backdropFilter: 'blur(8px)',
              }}
            >
              {mediaType === MEDIA_TYPE.TV ? 'Series' : 'Movie'}
            </span>

            {/* Quality badge */}
            {quality && (
              <span
                className="px-1.5 py-0.5 rounded text-[0.6rem] font-bold uppercase tracking-wider"
                style={{
                  background: 'rgba(10,10,15,0.85)',
                  color: quality === '4K' ? '#00d4ff' : '#f5a623',
                  border: `1px solid ${quality === '4K' ? 'rgba(0,212,255,0.3)' : 'rgba(245,166,35,0.3)'}`,
                  backdropFilter: 'blur(8px)',
                }}
              >
                {quality}
              </span>
            )}
          </div>
        )}

        {/* ── Continue watching progress bar ── */}
        {showProgress && progress > 0 && (
          <div
            className="absolute bottom-0 left-0 right-0 h-1"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, progress)}%`, background: '#e50914' }}
              aria-label={`${Math.round(progress)}% watched`}
            />
          </div>
        )}
      </div>

      {/* ── Title below poster ── */}
      <div className="pt-2 pb-0.5 px-0.5">
        <p className="text-[0.8125rem] font-semibold leading-snug line-clamp-1"
          style={{ color: 'var(--fg-primary)' }}>
          {title}
        </p>
        <p className="text-[0.72rem] mt-0.5 line-clamp-1"
          style={{ color: 'var(--fg-muted)' }}>
          {[year, item?.original_language?.toUpperCase()].filter(Boolean).join(' · ')}
        </p>
      </div>
    </motion.div>
  );
});

export default MovieCard;

/* ── Wide / Backdrop Card variant ───────────────────────────────────────────── */
export const BackdropCard = React.memo(function BackdropCard({
  item,
  mediaType   = MEDIA_TYPE.MOVIE,
  showRating  = true,
  className,
  onClick,
}) {
  const navigate  = useNavigate();

  const title    = getTitle(item);
  const year     = getYear(getReleaseDate(item));
  const rating   = item?.vote_average ?? 0;
  const backdrop = item?.backdrop_path
    ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}`
    : null;

  const handleClick = onClick ?? (() => {
    const path = mediaType === MEDIA_TYPE.TV
      ? ROUTES.toTVDetail(item.id)
      : ROUTES.toMovieDetail(item.id);
    navigate(path);
  });

  return (
    <motion.div
      className={cn('relative flex-shrink-0 cursor-pointer rounded-xl overflow-hidden group h-full hover:z-50 focus-within:z-50', className)}
      style={{ width: 'clamp(220px, 28vw, 320px)' }}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
      onClick={handleClick}
      tabIndex={0}
      role="article"
      aria-label={title}
      onKeyDown={(e) => { if (e.key === 'Enter') handleClick(); }}
    >
      {/* Backdrop image */}
      <div className="aspect-video bg-[var(--bg-elevated)] overflow-hidden rounded-xl">
        <Image 
          src={backdrop}
          alt={title}
          skeletonClassName="rounded-xl"
          className="w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 gradient-card-overlay pointer-events-none" />
      </div>

      {/* Info */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-sm font-bold line-clamp-1" style={{ color: 'var(--fg-primary)' }}>{title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {showRating && rating > 0 && (
            <span className="flex items-center gap-0.5 text-[0.7rem] font-semibold" style={{ color: '#f5a623' }}>
              <RiStarFill aria-hidden="true" /> {rating.toFixed(1)}
            </span>
          )}
          {year && (
            <span className="text-[0.7rem]" style={{ color: 'var(--fg-muted)' }}>{year}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
});
