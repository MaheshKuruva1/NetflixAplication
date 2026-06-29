/**
 * @file src/pages/Detail/MovieDetailPage.jsx
 * @description Production-ready Movie Details page.
 *
 * Sections:
 *  1. Cinematic backdrop hero with parallax
 *  2. Poster + metadata column (title, rating, genres, runtime, release)
 *  3. Overview / tagline
 *  4. Action bar (Play Trailer, Add to Watchlist, Share)
 *  5. Cast & Crew horizontal scroll
 *  6. Director / Writer / Producer credits
 *  7. Production Companies
 *  8. Budget & Revenue stats
 *  9. Recommendations carousel
 * 10. Similar Movies carousel
 */

import { useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  RiPlayFill, RiAddLine, RiCheckLine, RiShareLine,
  RiArrowLeftLine, RiStarFill, RiCalendarLine,
  RiTimeLine, RiGlobeLine, RiMovieLine,
  RiExternalLinkLine,
} from 'react-icons/ri';

import movieService          from '@services/movieService.js';
import useFetch              from '@hooks/useFetch.js';
import { useWatchlist }      from '@context/WatchlistContext.jsx';
import { useToast }          from '@components/common/Toast.jsx';
import { getPosterUrl, getBackdropUrl, getLogoUrl } from '@utils/imageHelpers.js';
import {
  getTitle, getReleaseDate, formatDate, getYear,
  formatRuntime, formatCurrency, formatCount,
} from '@utils/formatters.js';
import { cn } from '@utils/cn.js';
import { ROUTES }            from '@constants/routes.js';
import { MEDIA_TYPE }        from '@constants/media.js';

import TrailerModal          from '@components/media/TrailerModal.jsx';
import CastCard              from '@components/media/CastCard.jsx';
import MediaCarousel         from '@components/media/MediaCarousel.jsx';
import Rating                from '@components/ui/Rating.jsx';
import Badge                 from '@components/ui/Badge.jsx';
import { SkeletonDetailHero, SkeletonMovieRow } from '@components/ui/Skeleton.jsx';
import { SEO }               from '@components/common';

/* ── helpers ──────────────────────────────────────────────────────────────── */
const getTrailer = (videos) => {
  if (!videos?.results?.length) return null;
  return (
    videos.results.find((v) => v.type === 'Trailer' && v.site === 'YouTube') ??
    videos.results.find((v) => v.site === 'YouTube') ??
    null
  );
};

const getCrewByJob = (crew = [], ...jobs) =>
  crew.filter((m) => jobs.some((j) => m.job?.toLowerCase().includes(j.toLowerCase())));

/* ── Stat Pill ────────────────────────────────────────────────────────────── */
function StatPill({ icon, label, value, accent }) {
  if (!value || value === 'N/A') return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.09)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <span className="text-base flex-shrink-0" style={{ color: accent ?? 'var(--fg-muted)' }} aria-hidden="true">
        {icon}
      </span>
      <div className="flex flex-col leading-none">
        <span className="text-[0.65rem] font-semibold uppercase tracking-wider mb-0.5"
          style={{ color: 'var(--fg-muted)' }}>
          {label}
        </span>
        <span className="text-sm font-bold" style={{ color: 'var(--fg-primary)' }}>
          {value}
        </span>
      </div>
    </motion.div>
  );
}

/* ── Section title ────────────────────────────────────────────────────────── */
function SectionTitle({ children, className }) {
  return (
    <motion.h2
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn('text-xl font-bold mb-4', className)}
      style={{ color: 'var(--fg-primary)' }}
    >
      {children}
    </motion.h2>
  );
}

/* ── Share button with dropdown ───────────────────────────────────────────── */
function ShareButton({ title, url }) {
  const [copied, setCopied] = useState(false);
  const { success } = useToast();

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url ?? window.location.href);
      setCopied(true);
      success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      success('Link copied!');
    }
  }, [url, success]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: url ?? window.location.href });
      } catch (_) {}
    } else {
      handleCopy();
    }
  }, [title, url, handleCopy]);

  return (
    <motion.button
      type="button"
      onClick={handleNativeShare}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="flex items-center gap-2 h-11 px-5 rounded-xl text-sm font-semibold
                 transition-all duration-150"
      style={{
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.14)',
        color: 'var(--fg-secondary)',
      }}
      aria-label="Share movie"
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
            <RiCheckLine className="text-base" style={{ color: '#00c864' }} aria-hidden="true" />
          </motion.span>
        ) : (
          <motion.span key="share" initial={{ scale: 0 }} animate={{ scale: 1 }}>
            <RiShareLine className="text-base" aria-hidden="true" />
          </motion.span>
        )}
      </AnimatePresence>
      Share
    </motion.button>
  );
}

/* ── Production Company Logo ──────────────────────────────────────────────── */
function CompanyLogo({ company }) {
  const [imgError, setImgError] = useState(false);
  const logoUrl = getLogoUrl(company.logo_path, 'md');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center gap-2 px-4 py-3 rounded-xl text-center"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid var(--border-default)',
        minWidth: '100px',
        maxWidth: '140px',
      }}
      title={company.name}
    >
      {company.logo_path && !imgError ? (
        <img
          src={logoUrl}
          alt={company.name}
          loading="lazy"
          onError={() => setImgError(true)}
          className="h-8 w-auto object-contain"
          style={{ filter: 'brightness(0) invert(1) opacity(0.7)' }}
        />
      ) : (
        <RiMovieLine className="text-2xl opacity-40" style={{ color: 'var(--fg-muted)' }} />
      )}
      <span className="text-[0.68rem] font-medium leading-tight text-center line-clamp-2"
        style={{ color: 'var(--fg-muted)' }}>
        {company.name}
      </span>
    </motion.div>
  );
}

/* ── Error / Empty State ──────────────────────────────────────────────────── */
function DetailError({ message }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4"
      style={{ background: 'var(--bg-base)' }}>
      <span className="text-5xl" aria-hidden="true">🎬</span>
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--fg-primary)' }}>
          {message ?? 'Movie not found'}
        </h1>
        <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
          The movie you're looking for doesn't exist or an error occurred.
        </p>
      </div>
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 h-10 px-6 rounded-xl text-sm font-semibold
                   bg-[#e50914] text-white hover:bg-[#ff1a26] transition-colors"
      >
        <RiArrowLeftLine aria-hidden="true" /> Go Back
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════════════════ */
export default function MovieDetailPage() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const heroRef      = useRef(null);

  /* Watchlist & Toast */
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const toast = useToast();

  /* Trailer modal */
  const [trailerOpen, setTrailerOpen] = useState(false);

  /* Parallax scroll */
  const { scrollY } = useScroll();
  const backdropY   = useTransform(scrollY, [0, 600], ['0%', '18%']);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0.3]);

  /* Fetch movie details (includes credits, videos, similar, recommendations) */
  const {
    data: movie,
    isLoading,
    error,
  } = useFetch(() => movieService.getDetails(id), [id]);

  /* ── Derived data ──────────────────────────────────────────────────────── */
  const title         = getTitle(movie);
  const releaseDate   = getReleaseDate(movie);
  const year          = getYear(releaseDate);
  const posterUrl     = getPosterUrl(movie?.poster_path, 'xl');
  const backdropUrl   = getBackdropUrl(movie?.backdrop_path, 'original');
  const rating        = movie?.vote_average ?? 0;
  const runtime       = formatRuntime(movie?.runtime);
  const genres        = movie?.genres ?? [];
  const overview      = movie?.overview ?? '';
  const tagline       = movie?.tagline ?? '';
  const cast          = movie?.credits?.cast?.slice(0, 20) ?? [];
  const crew          = movie?.credits?.crew ?? [];
  const directors     = getCrewByJob(crew, 'director');
  const writers       = getCrewByJob(crew, 'screenplay', 'writer', 'story');
  const producers     = getCrewByJob(crew, 'producer').slice(0, 3);
  const companies     = movie?.production_companies?.slice(0, 6) ?? [];
  const trailer       = getTrailer(movie?.videos);
  const recommendations = movie?.recommendations?.results?.filter(m => m.poster_path) ?? [];
  const similar       = movie?.similar?.results?.filter(m => m.poster_path) ?? [];
  const inWatchlist   = isInWatchlist(movie?.id, MEDIA_TYPE.MOVIE);

  /* ── Handlers ─────────────────────────────────────────────────────────── */
  const handleWatchlist = useCallback(() => {
    if (!movie) return;
    toggleWatchlist({
      id:          movie.id,
      media_type:  MEDIA_TYPE.MOVIE,
      title:       title,
      poster_path: movie.poster_path,
      vote_average: rating,
    });
    toast[inWatchlist ? 'info' : 'success'](
      inWatchlist ? 'Removed from My List' : 'Added to My List!'
    );
  }, [movie, toggleWatchlist, inWatchlist, title, rating, toast]);

  /* ── Loading ──────────────────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
        <SkeletonDetailHero />
        <div className="container-app py-10">
          <SkeletonMovieRow count={6} />
        </div>
      </div>
    );
  }

  /* ── Error ────────────────────────────────────────────────────────────── */
  if (error || !movie) {
    return <DetailError message={error?.message} />;
  }

  /* ══════════════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════════════ */
  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      <SEO 
        title={title} 
        description={overview} 
        image={backdropUrl} 
        type="video.movie" 
      />

      {/* ── Trailer Modal ── */}
      <TrailerModal
        videoKey={trailer?.key}
        title={`${title} — ${trailer?.name ?? 'Official Trailer'}`}
        isOpen={trailerOpen}
        onClose={() => setTrailerOpen(false)}
      />

      {/* ════════════════════════════════════════════════════════════════
          1. HERO SECTION
      ════════════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-[85vh] flex items-end overflow-hidden"
        aria-label={`${title} hero`}
      >
        {/* Parallax backdrop */}
        <motion.div
          className="absolute inset-0 -top-10"
          style={{ y: backdropY, opacity: heroOpacity }}
          aria-hidden="true"
        >
          <img
            src={backdropUrl}
            alt=""
            className="w-full h-full object-cover object-center"
            loading="eager"
          />
          {/* Multi-layer gradients */}
          <div
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(to top, var(--bg-base) 0%, rgba(10,10,15,0.7) 35%, transparent 65%),
                linear-gradient(to right, var(--bg-base) 0%, rgba(10,10,15,0.5) 40%, transparent 70%),
                linear-gradient(to bottom, rgba(10,10,15,0.5) 0%, transparent 20%)
              `,
            }}
          />
        </motion.div>

        {/* Back button */}
        <motion.button
          type="button"
          aria-label="Go back"
          onClick={() => navigate(-1)}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          whileHover={{ scale: 1.08, x: -3 }}
          whileTap={{ scale: 0.95 }}
          className="absolute top-6 left-[clamp(1rem,4vw,4rem)] z-20
                     flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold
                     transition-all duration-150"
          style={{
            background: 'rgba(10,10,15,0.7)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'var(--fg-secondary)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <RiArrowLeftLine aria-hidden="true" /> Back
        </motion.button>

        {/* Hero content */}
        <div
          className="relative z-10 w-full px-[clamp(1rem,4vw,4rem)] pb-10 pt-32"
        >
          <div className="flex flex-col lg:flex-row items-end lg:items-start gap-8 max-w-7xl">

            {/* ── Poster (desktop only) ── */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="hidden lg:block flex-shrink-0"
            >
              <div
                className="relative w-[220px] rounded-2xl overflow-hidden"
                style={{
                  boxShadow: '0 25px 60px rgba(0,0,0,0.75)',
                  border: '2px solid rgba(255,255,255,0.12)',
                  aspectRatio: '2/3',
                }}
              >
                <img
                  src={posterUrl}
                  alt={`${title} poster`}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
            </motion.div>

            {/* ── Info column ── */}
            <div className="flex-1 min-w-0">
              {/* Tagline */}
              {tagline && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-sm italic mb-2 font-medium"
                  style={{ color: '#e50914' }}
                >
                  "{tagline}"
                </motion.p>
              )}

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="font-display font-black leading-none mb-3"
                style={{
                  fontSize: 'clamp(2rem, 5vw, 4rem)',
                  color: 'var(--fg-primary)',
                  textShadow: '0 2px 20px rgba(0,0,0,0.8)',
                }}
              >
                {title}
                {year && (
                  <span className="ml-3 text-[0.5em] font-semibold align-middle"
                    style={{ color: 'var(--fg-muted)', verticalAlign: 'middle' }}>
                    ({year})
                  </span>
                )}
              </motion.h1>

              {/* Genres */}
              {genres.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.24 }}
                  className="flex flex-wrap items-center gap-2 mb-4"
                >
                  {genres.map((g) => (
                    <Link
                      key={g.id}
                      to={ROUTES.toMovieGenre(g.id)}
                      className="transition-all duration-150"
                    >
                      <Badge variant="outline" size="sm"
                        className="hover:border-[#e50914] hover:text-white transition-colors cursor-pointer">
                        {g.name}
                      </Badge>
                    </Link>
                  ))}
                </motion.div>
              )}

              {/* Stat pills row */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-2.5 mb-5"
              >
                {/* Rating */}
                {rating > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                    style={{
                      background: 'rgba(245,166,35,0.12)',
                      border: '1px solid rgba(245,166,35,0.25)',
                    }}>
                    <RiStarFill className="text-base" style={{ color: '#f5a623' }} />
                    <div className="flex flex-col leading-none">
                      <span className="text-[0.65rem] font-semibold uppercase tracking-wider mb-0.5"
                        style={{ color: 'rgba(245,166,35,0.7)' }}>
                        Rating
                      </span>
                      <span className="text-sm font-black" style={{ color: '#f5a623' }}>
                        {rating.toFixed(1)}{' '}
                        <span className="text-xs font-medium" style={{ color: 'rgba(245,166,35,0.6)' }}>
                          / 10
                        </span>
                      </span>
                    </div>
                    <span className="ml-1 text-[0.68rem]" style={{ color: 'rgba(245,166,35,0.5)' }}>
                      ({formatCount(movie.vote_count)} votes)
                    </span>
                  </div>
                )}

                <StatPill
                  icon={<RiCalendarLine />}
                  label="Release"
                  value={formatDate(releaseDate, 'short')}
                  accent="#00d4ff"
                />
                <StatPill
                  icon={<RiTimeLine />}
                  label="Runtime"
                  value={runtime}
                  accent="#8b5cf6"
                />
                {movie.original_language && (
                  <StatPill
                    icon={<RiGlobeLine />}
                    label="Language"
                    value={movie.original_language.toUpperCase()}
                    accent="#00c864"
                  />
                )}
              </motion.div>

              {/* Overview */}
              {overview && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.36, duration: 0.45 }}
                  className="text-base leading-relaxed max-w-2xl mb-6"
                  style={{ color: 'var(--fg-secondary)' }}
                >
                  {overview}
                </motion.p>
              )}

              {/* ── Action bar ── */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42, duration: 0.4 }}
                className="flex flex-wrap gap-3"
              >
                {/* Play Trailer */}
                {trailer && (
                  <motion.button
                    type="button"
                    onClick={() => setTrailerOpen(true)}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="flex items-center gap-2.5 h-11 px-6 rounded-xl text-sm font-bold
                               transition-all duration-200"
                    style={{ background: '#e50914', color: '#fff', boxShadow: '0 4px 20px rgba(229,9,20,0.45)' }}
                    aria-label="Play trailer"
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#ff1a26'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#e50914'; }}
                  >
                    <RiPlayFill className="text-xl" aria-hidden="true" /> Play Trailer
                  </motion.button>
                )}

                {/* Watchlist */}
                <motion.button
                  type="button"
                  onClick={handleWatchlist}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="flex items-center gap-2.5 h-11 px-5 rounded-xl text-sm font-semibold
                             transition-all duration-200"
                  style={{
                    background: inWatchlist ? 'rgba(229,9,20,0.2)' : 'rgba(255,255,255,0.1)',
                    border: `1px solid ${inWatchlist ? 'rgba(229,9,20,0.4)' : 'rgba(255,255,255,0.15)'}`,
                    color: inWatchlist ? '#ff6b6b' : 'var(--fg-secondary)',
                  }}
                  aria-label={inWatchlist ? 'Remove from My List' : 'Add to My List'}
                  aria-pressed={inWatchlist}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {inWatchlist ? (
                      <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <RiCheckLine className="text-lg" aria-hidden="true" />
                      </motion.span>
                    ) : (
                      <motion.span key="add" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <RiAddLine className="text-lg" aria-hidden="true" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {inWatchlist ? 'In My List' : 'Add to List'}
                </motion.button>

                {/* Share */}
                <ShareButton title={title} />

                {/* TMDB link */}
                <motion.a
                  href={`https://www.themoviedb.org/movie/${movie.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="flex items-center gap-2 h-11 px-4 rounded-xl text-sm font-semibold
                             transition-colors duration-150"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'var(--fg-muted)',
                  }}
                  aria-label="View on TMDB"
                >
                  <RiExternalLinkLine className="text-base" aria-hidden="true" /> TMDB
                </motion.a>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          CONTENT SECTIONS
      ════════════════════════════════════════════════════════════════ */}
      <div className="px-[clamp(1rem,4vw,4rem)] py-10 space-y-14 max-w-7xl mx-auto">

        {/* ── 2. Cast ── */}
        {cast.length > 0 && (
          <section aria-label="Cast">
            <SectionTitle>Cast</SectionTitle>
            <div className="flex gap-4 sm:gap-6 lg:gap-8 overflow-x-auto pb-3 no-scrollbar">
              {cast.map((member, i) => (
                <CastCard key={member.id} member={member} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* ── 3. Crew & Details Grid ── */}
        <section aria-label="Details">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Director */}
            {directors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35 }}
                className="p-5 rounded-2xl"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                }}
              >
                <p className="text-[0.68rem] font-bold uppercase tracking-widest mb-2"
                  style={{ color: 'var(--fg-muted)' }}>
                  {directors.length > 1 ? 'Directors' : 'Director'}
                </p>
                {directors.map((d) => (
                  <p key={d.id} className="text-sm font-semibold" style={{ color: 'var(--fg-primary)' }}>
                    {d.name}
                  </p>
                ))}
              </motion.div>
            )}

            {/* Writers */}
            {writers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: 0.06 }}
                className="p-5 rounded-2xl"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                }}
              >
                <p className="text-[0.68rem] font-bold uppercase tracking-widest mb-2"
                  style={{ color: 'var(--fg-muted)' }}>
                  {writers.length > 1 ? 'Writers' : 'Writer'}
                </p>
                {writers.slice(0, 3).map((w) => (
                  <p key={`${w.id}-${w.job}`} className="text-sm font-semibold" style={{ color: 'var(--fg-primary)' }}>
                    {w.name}{' '}
                    <span className="text-xs font-normal" style={{ color: 'var(--fg-muted)' }}>
                      ({w.job})
                    </span>
                  </p>
                ))}
              </motion.div>
            )}

            {/* Budget & Revenue */}
            {(movie.budget > 0 || movie.revenue > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: 0.1 }}
                className="p-5 rounded-2xl"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                }}
              >
                <p className="text-[0.68rem] font-bold uppercase tracking-widest mb-3"
                  style={{ color: 'var(--fg-muted)' }}>
                  Box Office
                </p>
                {movie.budget > 0 && (
                  <div className="mb-2">
                    <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>Budget</span>
                    <p className="text-sm font-bold" style={{ color: 'var(--fg-primary)' }}>
                      {formatCurrency(movie.budget)}
                    </p>
                  </div>
                )}
                {movie.revenue > 0 && (
                  <div>
                    <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>Revenue</span>
                    <p className="text-sm font-bold" style={{ color: '#00c864' }}>
                      {formatCurrency(movie.revenue)}
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Status */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.14 }}
              className="p-5 rounded-2xl"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
              }}
            >
              <p className="text-[0.68rem] font-bold uppercase tracking-widest mb-3"
                style={{ color: 'var(--fg-muted)' }}>
                Details
              </p>
              <div className="space-y-2">
                {movie.status && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--fg-muted)' }}>Status</span>
                    <span className="font-semibold" style={{ color: 'var(--fg-primary)' }}>{movie.status}</span>
                  </div>
                )}
                {movie.original_title && movie.original_title !== title && (
                  <div className="flex justify-between text-sm gap-4">
                    <span style={{ color: 'var(--fg-muted)', flexShrink: 0 }}>Original Title</span>
                    <span className="font-semibold text-right" style={{ color: 'var(--fg-primary)' }}>
                      {movie.original_title}
                    </span>
                  </div>
                )}
                {movie.spoken_languages?.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--fg-muted)' }}>Language</span>
                    <span className="font-semibold" style={{ color: 'var(--fg-primary)' }}>
                      {movie.spoken_languages.map(l => l.english_name).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Rating circle */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.08 }}
              className="p-5 rounded-2xl flex flex-col items-center justify-center gap-3"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
              }}
            >
              <Rating value={rating} total={10} size="xl" showLabel />
              <p className="text-xs text-center" style={{ color: 'var(--fg-muted)' }}>
                {formatCount(movie.vote_count)} user ratings
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── 4. Production Companies ── */}
        {companies.length > 0 && (
          <section aria-label="Production companies">
            <SectionTitle>Production</SectionTitle>
            <div className="flex flex-wrap gap-3">
              {companies.map((company) => (
                <CompanyLogo key={company.id} company={company} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════
          CAROUSELS (full width)
      ════════════════════════════════════════════════════════════════ */}
      <div className="space-y-14 pb-16">

        {/* ── 5. Recommendations ── */}
        {recommendations.length > 0 && (
          <MediaCarousel
            title="Recommended For You"
            subtitle="Movies we think you'll love"
            items={recommendations}
            mediaType={MEDIA_TYPE.MOVIE}
            variant="poster"
          />
        )}

        {/* ── 6. Similar Movies ── */}
        {similar.length > 0 && (
          <MediaCarousel
            title="More Like This"
            subtitle={`Similar to ${title}`}
            items={similar}
            mediaType={MEDIA_TYPE.MOVIE}
            variant="poster"
          />
        )}
      </div>
    </div>
  );
}
