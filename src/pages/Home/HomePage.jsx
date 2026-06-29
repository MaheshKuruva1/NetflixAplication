/**
 * @file src/pages/Home/HomePage.jsx
 * @description BappamMovies Home page.
 *
 * Sections (in order):
 *  1. Hero Banner            — top 5 trending movies, auto-cycling
 *  2. Continue Watching      — localStorage-persisted (mock)
 *  3. Trending Now           — /trending/movie/week
 *  4. Recently Added         — /movie/now_playing
 *  5. Top Rated              — /movie/top_rated
 *  6. Popular Movies         — /movie/popular
 *  7. Action                 — discover genre:28
 *  8. Comedy                 — discover genre:35
 *  9. Horror                 — discover genre:27
 * 10. Animation              — discover genre:16
 * 11. Popular TV Shows       — /tv/popular
 * 12. Trending TV            — /trending/tv/week
 */

import { useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { RiArrowRightLine, RiHistoryLine, RiFireLine } from 'react-icons/ri';

import movieService  from '@services/movieService.js';
import tvService     from '@services/tvService.js';
import useFetch      from '@hooks/useFetch.js';
import { useWatchlist } from '@context/WatchlistContext.jsx';
import { MEDIA_TYPE } from '@constants/media.js';
import { ROUTES }    from '@constants/routes.js';

import HeroBanner    from '@components/media/HeroBanner.jsx';
import MediaCarousel from '@components/media/MediaCarousel.jsx';
import MovieCard     from '@components/media/MovieCard.jsx';
import { SkeletonMovieRow } from '@components/ui/Skeleton.jsx';
import { SEO }       from '@components/common';

/* ── Genre IDs ──────────────────────────────────────────────────────────────── */
const GENRE = {
  ACTION:    28,
  COMEDY:    35,
  HORROR:    27,
  ANIMATION: 16,
};

/* ── "See All" link helper ──────────────────────────────────────────────────── */
function SeeAllLink({ to }) {
  if (!to) return null;
  return (
    <Link
      to={to}
      className="flex items-center gap-1 text-sm font-semibold text-[#e50914]
                 hover:text-[#ff4444] transition-colors group"
      aria-label="See all"
    >
      See All <RiArrowRightLine className="transition-transform group-hover:translate-x-1" />
    </Link>
  );
}

/* ── Animated Section wrapper (fades in when in view) ─────────────────────── */
function AnimatedSection({ children, delay = 0, className }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ── Continue Watching card (uses watchlist data) ─────────────────────────── */
function ContinueWatchingSection() {
  const { watchlist } = useWatchlist();

  if (!watchlist.length) return null;

  return (
    <AnimatedSection delay={0.05}>
      <div className="flex items-center justify-between mb-4 px-[clamp(1rem,4vw,3.5rem)]">
        <div className="flex items-center gap-2">
          <RiHistoryLine className="text-xl" style={{ color: '#e50914' }} aria-hidden="true" />
          <h2 className="text-xl font-bold" style={{ color: 'var(--fg-primary)' }}>
            Continue Watching
          </h2>
        </div>
        <SeeAllLink to={ROUTES.MY_LIST} />
      </div>
      <div className="flex gap-4 sm:gap-6 lg:gap-8 overflow-x-auto pb-3 no-scrollbar px-[clamp(1rem,4vw,3.5rem)]">
        {watchlist.slice(0, 12).map((item) => (
          <div key={`${item.id}-${item.media_type}`} className="flex-shrink-0 w-[160px]">
            <MovieCard
              item={{ ...item, genre_ids: [] }}
              mediaType={item.media_type ?? MEDIA_TYPE.MOVIE}
              size="sm"
            />
          </div>
        ))}
      </div>
    </AnimatedSection>
  );
}

/* ── Error Row ────────────────────────────────────────────────────────────── */
function ErrorRow({ title }) {
  return (
    <div className="px-[clamp(1rem,4vw,3.5rem)]">
      <p className="text-sm mb-3 font-bold" style={{ color: 'var(--fg-primary)' }}>{title}</p>
      <div
        className="flex items-center justify-center h-32 rounded-2xl text-sm"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          color: 'var(--fg-muted)',
        }}
      >
        Failed to load. Check your connection and TMDB API key.
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HOME PAGE
══════════════════════════════════════════════════════════════════════════════ */
export default function HomePage() {

  /* ── Data fetching — all parallel ────────────────────────────────────── */
  const { data: trendingData,   isLoading: l1, error: e1 } =
    useFetch(() => movieService.getTrending(),       []);

  const { data: nowPlayingData, isLoading: l2, error: e2 } =
    useFetch(() => movieService.getNowPlaying(),     []);

  const { data: topRatedData,   isLoading: l3, error: e3 } =
    useFetch(() => movieService.getTopRated(),       []);

  const { data: popularData,    isLoading: l4, error: e4 } =
    useFetch(() => movieService.getPopular(),        []);

  const { data: actionData,     isLoading: l5, error: e5 } =
    useFetch(() => movieService.getByGenre(GENRE.ACTION),    []);

  const { data: comedyData,     isLoading: l6, error: e6 } =
    useFetch(() => movieService.getByGenre(GENRE.COMEDY),    []);

  const { data: horrorData,     isLoading: l7, error: e7 } =
    useFetch(() => movieService.getByGenre(GENRE.HORROR),    []);

  const { data: animationData,  isLoading: l8, error: e8 } =
    useFetch(() => movieService.getByGenre(GENRE.ANIMATION), []);

  const { data: tvPopularData,  isLoading: l9, error: e9 } =
    useFetch(() => tvService.getPopular(),           []);

  const { data: tvTrendingData, isLoading: l10, error: e10 } =
    useFetch(() => tvService.getTrending(),          []);

  /* ── Hero items: top 8 trending movies that have a backdrop ─────────── */
  const heroItems = useMemo(
    () => (trendingData?.results ?? [])
      .filter((m) => m.backdrop_path && m.poster_path)
      .slice(0, 8),
    [trendingData]
  );

  const trending   = trendingData?.results   ?? [];
  const nowPlaying = nowPlayingData?.results ?? [];
  const topRated   = topRatedData?.results   ?? [];
  const popular    = popularData?.results    ?? [];
  const action     = actionData?.results     ?? [];
  const comedy     = comedyData?.results     ?? [];
  const horror     = horrorData?.results     ?? [];
  const animation  = animationData?.results  ?? [];
  const tvPopular  = tvPopularData?.results  ?? [];
  const tvTrending = tvTrendingData?.results ?? [];

  return (
    <div style={{ background: 'var(--bg-base)' }}>
      <SEO title="Home" />

      {/* ════════════════════════════════════════════════════════════
          1. HERO BANNER
      ════════════════════════════════════════════════════════════ */}
      <HeroBanner
        items={heroItems}
        isLoading={l1}
        mediaType={MEDIA_TYPE.MOVIE}
      />

      {/* ════════════════════════════════════════════════════════════
          CONTENT SECTIONS
      ════════════════════════════════════════════════════════════ */}
      <div className="space-y-10 pb-16 pt-8">

        {/* 2. Continue Watching */}
        <ContinueWatchingSection />

        {/* 3. Trending Now */}
        {e1 ? (
          <AnimatedSection><ErrorRow title="Trending Now" /></AnimatedSection>
        ) : (
          <AnimatedSection delay={0.06}>
            <MediaCarousel
              title="Trending Now"
              subtitle="What everyone's watching this week"
              to={ROUTES.MOVIES}
              items={trending}
              mediaType={MEDIA_TYPE.MOVIE}
              variant="poster"
              isLoading={l1}
            />
          </AnimatedSection>
        )}

        {/* 4. Recently Added */}
        {e2 ? (
          <AnimatedSection><ErrorRow title="Recently Added" /></AnimatedSection>
        ) : (
          <AnimatedSection delay={0.08}>
            <MediaCarousel
              title="Recently Added"
              subtitle="Fresh off the projector"
              items={nowPlaying}
              mediaType={MEDIA_TYPE.MOVIE}
              variant="backdrop"
              isLoading={l2}
            />
          </AnimatedSection>
        )}

        {/* 5. Top Rated */}
        {e3 ? (
          <AnimatedSection><ErrorRow title="Top Rated" /></AnimatedSection>
        ) : (
          <AnimatedSection delay={0.1}>
            <MediaCarousel
              title="Top Rated"
              subtitle="The highest-rated movies of all time"
              to={ROUTES.MOVIES}
              items={topRated}
              mediaType={MEDIA_TYPE.MOVIE}
              variant="poster"
              isLoading={l3}
              showRating
            />
          </AnimatedSection>
        )}

        {/* 6. Popular Movies */}
        {e4 ? (
          <AnimatedSection><ErrorRow title="Popular Movies" /></AnimatedSection>
        ) : (
          <AnimatedSection delay={0.12}>
            <MediaCarousel
              title="Popular Movies"
              subtitle="Everyone's talking about these"
              to={ROUTES.MOVIES}
              items={popular}
              mediaType={MEDIA_TYPE.MOVIE}
              variant="poster"
              isLoading={l4}
            />
          </AnimatedSection>
        )}

        {/* 7. Action */}
        {e5 ? (
          <AnimatedSection><ErrorRow title="Action" /></AnimatedSection>
        ) : (
          <AnimatedSection delay={0.14}>
            <MediaCarousel
              title="Action"
              subtitle="Non-stop thrills and adrenaline"
              to={ROUTES.toMovieGenre(GENRE.ACTION)}
              items={action}
              mediaType={MEDIA_TYPE.MOVIE}
              variant="backdrop"
              isLoading={l5}
            />
          </AnimatedSection>
        )}

        {/* 8. Comedy */}
        {e6 ? (
          <AnimatedSection><ErrorRow title="Comedy" /></AnimatedSection>
        ) : (
          <AnimatedSection delay={0.16}>
            <MediaCarousel
              title="Comedy"
              subtitle="When you need a good laugh"
              to={ROUTES.toMovieGenre(GENRE.COMEDY)}
              items={comedy}
              mediaType={MEDIA_TYPE.MOVIE}
              variant="poster"
              isLoading={l6}
            />
          </AnimatedSection>
        )}

        {/* 9. Horror */}
        {e7 ? (
          <AnimatedSection><ErrorRow title="Horror" /></AnimatedSection>
        ) : (
          <AnimatedSection delay={0.18}>
            <MediaCarousel
              title="Horror"
              subtitle="Dare to watch alone?"
              to={ROUTES.toMovieGenre(GENRE.HORROR)}
              items={horror}
              mediaType={MEDIA_TYPE.MOVIE}
              variant="poster"
              isLoading={l7}
            />
          </AnimatedSection>
        )}

        {/* 10. Animation */}
        {e8 ? (
          <AnimatedSection><ErrorRow title="Animation" /></AnimatedSection>
        ) : (
          <AnimatedSection delay={0.2}>
            <MediaCarousel
              title="Animation"
              subtitle="For young minds and the young at heart"
              to={ROUTES.toMovieGenre(GENRE.ANIMATION)}
              items={animation}
              mediaType={MEDIA_TYPE.MOVIE}
              variant="poster"
              isLoading={l8}
            />
          </AnimatedSection>
        )}

        {/* 11. Popular TV Shows */}
        {e9 ? (
          <AnimatedSection><ErrorRow title="Popular TV Shows" /></AnimatedSection>
        ) : (
          <AnimatedSection delay={0.22}>
            <MediaCarousel
              title="Popular TV Shows"
              subtitle="Binge-worthy series everyone loves"
              to={ROUTES.TV_SHOWS}
              items={tvPopular}
              mediaType={MEDIA_TYPE.TV}
              variant="poster"
              isLoading={l9}
            />
          </AnimatedSection>
        )}

        {/* 12. Trending TV */}
        {e10 ? (
          <AnimatedSection><ErrorRow title="Trending TV" /></AnimatedSection>
        ) : (
          <AnimatedSection delay={0.24}>
            <MediaCarousel
              title="Trending TV"
              subtitle="Series setting the internet on fire"
              to={ROUTES.TV_SHOWS}
              items={tvTrending}
              mediaType={MEDIA_TYPE.TV}
              variant="backdrop"
              isLoading={l10}
            />
          </AnimatedSection>
        )}

        {/* ── Browse by Genre CTA ── */}
        <AnimatedSection delay={0.26} className="px-[clamp(1rem,4vw,3.5rem)]">
          <motion.div
            className="relative overflow-hidden rounded-2xl p-8 md:p-12 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(229,9,20,0.15), rgba(139,92,246,0.15))',
              border: '1px solid rgba(229,9,20,0.2)',
            }}
          >
            {/* Decorative gradient orbs */}
            <div
              className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none"
              style={{ background: 'radial-gradient(circle, #e50914, transparent)' }}
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-15 blur-3xl pointer-events-none"
              style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }}
              aria-hidden="true"
            />

            <div className="relative z-10">
              <span className="text-4xl mb-4 block" aria-hidden="true">🎬</span>
              <h2 className="text-2xl font-black mb-2" style={{ color: 'var(--fg-primary)' }}>
                Explore All Genres
              </h2>
              <p className="text-sm mb-6" style={{ color: 'var(--fg-muted)' }}>
                Thousands of movies and shows across every genre.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  to={ROUTES.MOVIES}
                  className="flex items-center gap-2 h-11 px-6 rounded-xl text-sm font-bold
                             text-white transition-colors"
                  style={{ background: '#e50914' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#ff1a26'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#e50914'; }}
                >
                  Browse Movies
                </Link>
                <Link
                  to={ROUTES.TV_SHOWS}
                  className="flex items-center gap-2 h-11 px-6 rounded-xl text-sm font-bold
                             transition-colors"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'var(--fg-secondary)',
                  }}
                >
                  Browse TV Shows
                </Link>
              </div>
            </div>
          </motion.div>
        </AnimatedSection>

      </div>
    </div>
  );
}
