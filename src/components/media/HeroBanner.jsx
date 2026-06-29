/**
 * @file src/components/media/HeroBanner.jsx
 * @description Cinematic auto-cycling hero banner for the Home page.
 *
 * Features:
 * - Auto-cycles through featured items every 8 seconds
 * - Parallax backdrop with multi-layer gradients
 * - Animated title, overview, genre badges
 * - Play Trailer + Info CTA buttons
 * - Add / Remove from watchlist
 * - Progress dots indicator
 * - Keyboard controls (← → arrows)
 * - Pause on hover
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiPlayFill, RiInformationLine, RiAddLine, RiCheckLine,
  RiVolumeMuteLine, RiArrowLeftSLine, RiArrowRightSLine,
} from 'react-icons/ri';

import { getBackdropUrl, getPosterUrl } from '@utils/imageHelpers.js';
import { getTitle, getReleaseDate, getYear, truncate } from '@utils/formatters.js';
import { useWatchlist }  from '@context/WatchlistContext.jsx';
import { useToast }      from '@components/common/Toast.jsx';
import { ROUTES }        from '@constants/routes.js';
import { MEDIA_TYPE, MOVIE_GENRES } from '@constants/media.js';
import Badge             from '@components/ui/Badge.jsx';
import Rating            from '@components/ui/Rating.jsx';
import { SkeletonHero }  from '@components/ui/Skeleton.jsx';

/* ── Animation variants ──────────────────────────────────────────────────── */
const slideVariants = {
  enter: (dir) => ({
    opacity: 0,
    x: dir > 0 ? 80 : -80,
  }),
  center: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
  exit: (dir) => ({
    opacity: 0,
    x: dir > 0 ? -60 : 60,
    transition: { duration: 0.3, ease: [0.4, 0, 1, 1] },
  }),
};

const INTERVAL_MS  = 8000;
const MAX_OVERVIEW = 220;

/* ═══════════════════════════════════════════════════════════════════════════
   HERO BANNER
══════════════════════════════════════════════════════════════════════════════ */
export default function HeroBanner({ items = [], isLoading = false, mediaType = MEDIA_TYPE.MOVIE }) {
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const toast = useToast();

  const [current, setCurrent] = useState(0);
  const [dir, setDir]         = useState(1);           // 1 = forward, -1 = backward
  const [paused, setPaused]   = useState(false);
  const intervalRef           = useRef(null);

  const total = items.length;

  /* Auto-advance */
  const advance = useCallback((next) => {
    setDir(1);
    setCurrent((c) => (next !== undefined ? next : (c + 1) % total));
  }, [total]);

  const retreat = useCallback(() => {
    setDir(-1);
    setCurrent((c) => (c - 1 + total) % total);
  }, [total]);

  const goTo = useCallback((i) => {
    setDir(i > current ? 1 : -1);
    setCurrent(i);
  }, [current]);

  useEffect(() => {
    if (paused || total <= 1) return;
    intervalRef.current = setInterval(() => advance(), INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, [paused, total, advance]);

  /* Keyboard navigation */
  useEffect(() => {
    const handle = (e) => {
      if (e.key === 'ArrowRight') advance();
      if (e.key === 'ArrowLeft')  retreat();
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [advance, retreat]);

  /* Loading skeleton */
  if (isLoading) return <SkeletonHero className="min-h-[85vh]" />;
  if (!total)    return null;

  const item         = items[current];
  const title        = getTitle(item);
  const year         = getYear(getReleaseDate(item));
  const overview     = truncate(item?.overview ?? '', MAX_OVERVIEW);
  const backdropUrl  = getBackdropUrl(item?.backdrop_path, 'original');
  const genres       = (item?.genre_ids ?? []).slice(0, 3)
    .map((id) => MOVIE_GENRES[id]).filter(Boolean);
  const rating       = item?.vote_average ?? 0;
  const inWatchlist  = isInWatchlist(item?.id, mediaType);
  const detailRoute  = mediaType === MEDIA_TYPE.TV
    ? ROUTES.toTVDetail(item?.id)
    : ROUTES.toMovieDetail(item?.id);

  const handleWatchlist = () => {
    toggleWatchlist({
      id:          item.id,
      media_type:  mediaType,
      title,
      poster_path: item.poster_path,
      vote_average: rating,
    });
    toast[inWatchlist ? 'info' : 'success'](
      inWatchlist ? 'Removed from My List' : 'Added to My List!'
    );
  };

  return (
    <section
      className="relative overflow-hidden"
      style={{ minHeight: 'min(85vh, 700px)' }}
      aria-label={`Featured: ${title}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Backdrop ── */}
      <AnimatePresence custom={dir} initial={false}>
        <motion.div
          key={`bg-${current}`}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          aria-hidden="true"
        >
          <img
            src={backdropUrl}
            alt=""
            className="w-full h-full object-cover object-center"
            loading="eager"
          />
          {/* Gradient layers */}
          <div
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(to top,    var(--bg-base) 0%, rgba(10,10,15,0.65) 40%, transparent 65%),
                linear-gradient(to right,  var(--bg-base) 0%, rgba(10,10,15,0.5) 35%, transparent 60%),
                linear-gradient(to bottom, rgba(10,10,15,0.4) 0%, transparent 20%)
              `,
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* ── Content ── */}
      <div className="relative z-10 flex items-end h-full min-h-[inherit]">
        <div className="w-full px-[clamp(1.25rem,6vw,5rem)] pb-16 pt-32 max-w-4xl">
          <AnimatePresence custom={dir} mode="wait">
            <motion.div
              key={`content-${current}`}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="flex flex-col gap-4"
            >
              {/* Rating + Year badges */}
              <div className="flex items-center gap-2 flex-wrap">
                {rating > 0 && <Rating value={rating} total={10} size="sm" showLabel />}
                {year && (
                  <Badge variant="outline" size="sm">{year}</Badge>
                )}
                {genres.map((g) => (
                  <Badge key={g} variant="ghost" size="sm">{g}</Badge>
                ))}
              </div>

              {/* Title */}
              <h1
                className="font-display font-black leading-none"
                style={{
                  fontSize: 'clamp(2.25rem, 6vw, 5rem)',
                  color: 'var(--fg-primary)',
                  textShadow: '0 4px 24px rgba(0,0,0,0.7)',
                  letterSpacing: '-0.02em',
                }}
              >
                {title}
              </h1>

              {/* Overview */}
              {overview && (
                <p
                  className="text-base leading-relaxed max-w-xl hidden sm:block"
                  style={{ color: 'rgba(255,255,255,0.8)', textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}
                >
                  {overview}
                </p>
              )}

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-3 mt-2">
                {/* Play / Watch Now */}
                <motion.button
                  type="button"
                  onClick={() => navigate(detailRoute)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="flex items-center gap-2.5 h-12 px-8 rounded-xl text-sm font-bold
                             text-white transition-all"
                  style={{
                    background: '#e50914',
                    boxShadow: '0 6px 24px rgba(229,9,20,0.45)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#ff1a26'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#e50914'; }}
                  aria-label={`Play ${title}`}
                >
                  <RiPlayFill className="text-xl" aria-hidden="true" /> Watch Now
                </motion.button>

                {/* More Info */}
                <motion.button
                  type="button"
                  onClick={() => navigate(detailRoute)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="flex items-center gap-2.5 h-12 px-6 rounded-xl text-sm font-semibold"
                  style={{
                    background: 'rgba(255,255,255,0.18)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    color: 'white',
                    backdropFilter: 'blur(10px)',
                  }}
                  aria-label={`More info about ${title}`}
                >
                  <RiInformationLine className="text-xl" aria-hidden="true" /> More Info
                </motion.button>

                {/* Watchlist */}
                <motion.button
                  type="button"
                  onClick={handleWatchlist}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="flex items-center justify-center w-12 h-12 rounded-full text-xl"
                  style={{
                    background: inWatchlist ? 'rgba(229,9,20,0.25)' : 'rgba(255,255,255,0.15)',
                    border: `1px solid ${inWatchlist ? 'rgba(229,9,20,0.5)' : 'rgba(255,255,255,0.25)'}`,
                    color: inWatchlist ? '#ff6b6b' : 'white',
                    backdropFilter: 'blur(10px)',
                  }}
                  aria-label={inWatchlist ? 'Remove from My List' : 'Add to My List'}
                  aria-pressed={inWatchlist}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {inWatchlist ? (
                      <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <RiCheckLine aria-hidden="true" />
                      </motion.span>
                    ) : (
                      <motion.span key="add" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <RiAddLine aria-hidden="true" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Progress dots ── */}
      {total > 1 && (
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20
                     flex items-center gap-2"
          role="tablist"
          aria-label="Hero banner slides"
        >
          {items.map((_, i) => (
            <motion.button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === current}
              aria-label={`Slide ${i + 1}`}
              onClick={() => goTo(i)}
              className="rounded-full transition-all cursor-pointer"
              animate={{
                width:   i === current ? 28 : 8,
                height:  8,
                background: i === current ? '#e50914' : 'rgba(255,255,255,0.4)',
              }}
              whileHover={{ scale: 1.2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          ))}
        </div>
      )}

      {/* ── Arrow controls ── */}
      {total > 1 && (
        <>
          <motion.button
            type="button"
            aria-label="Previous slide"
            onClick={retreat}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.9 }}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20
                       flex items-center justify-center w-10 h-10 rounded-full text-xl
                       transition-opacity opacity-0 hover:opacity-100"
            style={{
              background: 'rgba(10,10,15,0.7)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'white',
            }}
          >
            <RiArrowLeftSLine aria-hidden="true" />
          </motion.button>
          <motion.button
            type="button"
            aria-label="Next slide"
            onClick={() => advance()}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.9 }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20
                       flex items-center justify-center w-10 h-10 rounded-full text-xl
                       transition-opacity opacity-0 hover:opacity-100"
            style={{
              background: 'rgba(10,10,15,0.7)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'white',
            }}
          >
            <RiArrowRightSLine aria-hidden="true" />
          </motion.button>
        </>
      )}

      {/* ── Auto-play progress bar (bottom) ── */}
      {total > 1 && !paused && (
        <motion.div
          key={`bar-${current}`}
          className="absolute bottom-0 left-0 h-[3px] z-20"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: INTERVAL_MS / 1000, ease: 'linear' }}
          style={{ background: 'rgba(229,9,20,0.7)' }}
          aria-hidden="true"
        />
      )}
    </section>
  );
}
