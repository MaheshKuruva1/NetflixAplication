/**
 * @file src/pages/Detail/TVDetailPage.jsx
 * @description Production-ready TV Details page with Season/Episode selector.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  RiPlayFill, RiAddLine, RiCheckLine, RiShareLine,
  RiArrowLeftLine, RiStarFill, RiCalendarLine,
  RiTimeLine, RiGlobeLine, RiTvLine,
  RiExternalLinkLine,
} from 'react-icons/ri';

import tvService             from '@services/tvService.js';
import useFetch              from '@hooks/useFetch.js';
import { useWatchlist }      from '@context/WatchlistContext.jsx';
import { useToast }          from '@components/common/Toast.jsx';
import { getPosterUrl, getBackdropUrl, getLogoUrl } from '@utils/imageHelpers.js';
import {
  getTitle, getReleaseDate, formatDate, getYear,
  formatCount,
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

export default function TVDetailPage() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const heroRef      = useRef(null);

  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const toast = useToast();

  const [trailerOpen, setTrailerOpen] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [seasonData, setSeasonData] = useState(null);
  const [loadingSeason, setLoadingSeason] = useState(false);

  const { scrollY } = useScroll();
  const backdropY   = useTransform(scrollY, [0, 600], ['0%', '18%']);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0.3]);

  const {
    data: show,
    isLoading,
    error,
  } = useFetch(() => tvService.getDetails(id), [id]);

  useEffect(() => {
    if (show && show.seasons?.length > 0) {
      const fetchSeason = async () => {
        setLoadingSeason(true);
        try {
          const res = await tvService.getSeason(id, selectedSeason);
          setSeasonData(res);
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingSeason(false);
        }
      };
      fetchSeason();
    }
  }, [id, selectedSeason, show]);

  const title         = getTitle(show);
  const releaseDate   = show?.first_air_date;
  const year          = getYear(releaseDate);
  const posterUrl     = getPosterUrl(show?.poster_path, 'xl');
  const backdropUrl   = getBackdropUrl(show?.backdrop_path, 'original');
  const rating        = show?.vote_average ?? 0;
  const genres        = show?.genres ?? [];
  const overview      = show?.overview ?? '';
  const tagline       = show?.tagline ?? '';
  const cast          = show?.credits?.cast?.slice(0, 20) ?? [];
  const trailer       = getTrailer(show?.videos);
  const recommendations = show?.recommendations?.results?.filter(m => m.poster_path) ?? [];
  const similar       = show?.similar?.results?.filter(m => m.poster_path) ?? [];
  const inWatchlist   = isInWatchlist(show?.id, MEDIA_TYPE.TV);

  const handleWatchlist = useCallback(() => {
    if (!show) return;
    toggleWatchlist({
      id:          show.id,
      media_type:  MEDIA_TYPE.TV,
      title:       title,
      poster_path: show.poster_path,
      vote_average: rating,
    });
    toast[inWatchlist ? 'info' : 'success'](
      inWatchlist ? 'Removed from My List' : 'Added to My List!'
    );
  }, [show, toggleWatchlist, inWatchlist, title, rating, toast]);

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

  if (error || !show) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Error loading TV show.
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      <SEO title={title} description={overview} image={backdropUrl} type="video.tv_show" />

      <TrailerModal
        videoKey={trailer?.key}
        title={`${title} — Trailer`}
        isOpen={trailerOpen}
        onClose={() => setTrailerOpen(false)}
      />

      {/* HERO SECTION */}
      <section
        ref={heroRef}
        className="relative min-h-[85vh] flex items-end overflow-hidden"
      >
        <motion.div
          className="absolute inset-0 -top-10"
          style={{ y: backdropY, opacity: heroOpacity }}
        >
          <img src={backdropUrl} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/50 to-transparent" />
        </motion.div>

        <motion.button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-8 z-20 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-white/70 bg-black/40 backdrop-blur-md hover:bg-black/60"
        >
          <RiArrowLeftLine /> Back
        </motion.button>

        <div className="relative z-10 w-full px-[clamp(1rem,4vw,4rem)] pb-10 pt-32">
          <div className="flex flex-col lg:flex-row items-end lg:items-start gap-8 max-w-7xl">
            {/* Poster */}
            <motion.div className="hidden lg:block flex-shrink-0">
              <div className="relative w-[220px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 aspect-[2/3]">
                <img src={posterUrl} alt="" className="w-full h-full object-cover" />
              </div>
            </motion.div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              {tagline && <p className="text-[#e50914] italic mb-2 font-medium">{tagline}</p>}
              <h1 className="text-4xl md:text-6xl font-black text-white mb-3 drop-shadow-2xl">
                {title} <span className="text-white/50 text-2xl font-semibold align-middle">({year})</span>
              </h1>

              <div className="flex flex-wrap gap-2 mb-4">
                {genres.map((g) => (
                  <Badge key={g.id} variant="outline" size="sm" className="text-white/80 border-white/20">
                    {g.name}
                  </Badge>
                ))}
              </div>

              <div className="flex flex-wrap gap-2.5 mb-5">
                <StatPill icon={<RiCalendarLine />} label="First Air Date" value={formatDate(releaseDate, 'short')} accent="#00d4ff" />
                <StatPill icon={<RiTvLine />} label="Seasons" value={`${show.number_of_seasons}`} accent="#8b5cf6" />
                <StatPill icon={<RiStarFill />} label="Rating" value={`${rating.toFixed(1)}/10`} accent="#f5a623" />
              </div>

              <p className="text-white/80 text-base leading-relaxed max-w-2xl mb-6">
                {overview}
              </p>

              <div className="flex flex-wrap gap-3">
                {trailer && (
                  <button onClick={() => setTrailerOpen(true)} className="flex items-center gap-2 px-6 h-11 bg-[#e50914] text-white font-bold rounded-xl hover:bg-[#ff1a26] transition">
                    <RiPlayFill className="text-xl" /> Play Trailer
                  </button>
                )}
                <button onClick={handleWatchlist} className="flex items-center gap-2 px-5 h-11 bg-white/10 text-white/90 border border-white/20 rounded-xl hover:bg-white/20 transition">
                  {inWatchlist ? <RiCheckLine className="text-lg text-[#ff6b6b]" /> : <RiAddLine className="text-lg" />}
                  {inWatchlist ? 'In My List' : 'Add to List'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTIONS */}
      <div className="px-[clamp(1rem,4vw,4rem)] py-10 space-y-14 max-w-7xl mx-auto">
        
        {/* Seasons & Episodes */}
        {show.seasons?.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <SectionTitle className="mb-0">Episodes</SectionTitle>
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(Number(e.target.value))}
                className="bg-[#1a1a24] text-white border border-white/20 rounded-lg px-4 py-2 outline-none"
              >
                {show.seasons.map(s => s.season_number > 0 && (
                  <option key={s.id} value={s.season_number}>Season {s.season_number}</option>
                ))}
              </select>
            </div>

            <div className="bg-[#14141e] rounded-2xl border border-white/10 p-6">
              {loadingSeason ? (
                <div className="animate-pulse flex gap-4">
                  <div className="w-40 h-24 bg-white/10 rounded-lg"></div>
                  <div className="flex-1 space-y-3 py-2">
                    <div className="w-1/3 h-4 bg-white/10 rounded"></div>
                    <div className="w-full h-3 bg-white/10 rounded"></div>
                    <div className="w-2/3 h-3 bg-white/10 rounded"></div>
                  </div>
                </div>
              ) : seasonData?.episodes?.length > 0 ? (
                <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {seasonData.episodes.map((ep, idx) => (
                    <div key={ep.id} className="flex gap-4 group cursor-pointer hover:bg-white/5 p-2 rounded-xl transition">
                      <div className="relative w-32 md:w-40 flex-shrink-0 aspect-video rounded-lg overflow-hidden bg-black/50">
                        {ep.still_path ? (
                          <img src={getBackdropUrl(ep.still_path, 'sm')} alt="" className="w-full h-full object-cover group-hover:scale-105 transition" />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full text-white/20 text-2xl">🎬</div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition">
                          <RiPlayFill className="text-3xl text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h4 className="text-white font-semibold flex items-center gap-2">
                          <span className="text-white/50">{idx + 1}.</span> {ep.name}
                        </h4>
                        <p className="text-white/60 text-xs md:text-sm mt-1 line-clamp-2 md:line-clamp-3">{ep.overview || 'No description available.'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/50">No episodes found for this season.</p>
              )}
            </div>
          </section>
        )}

        {/* Cast */}
        {cast.length > 0 && (
          <section>
            <SectionTitle>Cast</SectionTitle>
            <div className="flex gap-4 sm:gap-6 lg:gap-8 overflow-x-auto pb-3 no-scrollbar">
              {cast.map((member, i) => <CastCard key={member.id} member={member} index={i} />)}
            </div>
          </section>
        )}

        {/* Similar */}
        {similar.length > 0 && (
          <MediaCarousel title="More Like This" items={similar} mediaType={MEDIA_TYPE.TV} cardSize="lg" />
        )}

      </div>
    </div>
  );
}
