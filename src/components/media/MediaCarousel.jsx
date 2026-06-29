/**
 * @file src/components/media/MediaCarousel.jsx
 * @description Swiper.js-powered horizontal carousel for movie/TV rows.
 *
 * Features:
 * - Swiper with freeMode + snap
 * - Custom styled prev/next arrow buttons
 * - Responsive slidesPerView (auto-calculated by size)
 * - Animated section header
 * - Loading skeleton row
 * - Empty state
 */

import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, FreeMode, A11y } from 'swiper/modules';
import { motion } from 'framer-motion';
import { RiArrowLeftSLine, RiArrowRightSLine } from 'react-icons/ri';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/free-mode';

import MovieCard, { BackdropCard } from './MovieCard.jsx';
import SectionHeader from '@components/common/SectionHeader.jsx';
import { SkeletonMovieRow } from '@components/ui/Skeleton.jsx';
import { MEDIA_TYPE } from '@constants/media.js';
import { cn } from '@utils/cn.js';

/* ── Carousel ───────────────────────────────────────────────────────────────── */
export default function MediaCarousel({
  title,
  subtitle,
  to,              // "See all" link
  items = [],
  mediaType   = MEDIA_TYPE.MOVIE,
  variant     = 'poster',   // 'poster' | 'backdrop'
  isLoading   = false,
  showRating  = true,
  quality,
  cardSize    = 'md',
  className,
}) {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  /* Slides per view based on variant */
  const spaceBetween = 24;
  const breakpoints = variant === 'backdrop'
    ? {
        0:    { slidesPerView: 1.3 },
        480:  { slidesPerView: 2.1 },
        768:  { slidesPerView: 3.1 },
        1024: { slidesPerView: 4.1 },
        1280: { slidesPerView: 5.1 },
      }
    : {
        0:    { slidesPerView: 2.3 },
        480:  { slidesPerView: 3.3 },
        640:  { slidesPerView: 4.3 },
        768:  { slidesPerView: 5.3 },
        1024: { slidesPerView: 6.3 },
        1280: { slidesPerView: 7.3 },
        1536: { slidesPerView: 8.3 },
      };

  return (
    <section className={cn('relative', className)} aria-label={title}>
      {/* Header */}
      <div className="px-[clamp(1rem,4vw,4rem)] mb-4">
        <SectionHeader title={title} subtitle={subtitle} to={to} />
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="px-[clamp(1rem,4vw,4rem)]">
          <SkeletonMovieRow count={variant === 'backdrop' ? 4 : 7} />
        </div>
      )}

      {/* Carousel */}
      {!isLoading && items.length > 0 && (
        <div className="relative group">
          {/* Prev button */}
          <button
            ref={prevRef}
            type="button"
            aria-label="Previous"
            className={cn(
              'carousel-btn carousel-btn-prev',
              'absolute left-2 top-1/2 -translate-y-1/2 z-20',
              'flex items-center justify-center w-10 h-10 rounded-full',
              'opacity-0 group-hover:opacity-100 transition-all duration-200',
              'disabled:opacity-0 disabled:pointer-events-none',
            )}
            style={{
              background: 'rgba(10,10,15,0.88)',
              border: '1px solid rgba(255,255,255,0.16)',
              backdropFilter: 'blur(12px)',
              color: '#ffffff',
              boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e50914';
              e.currentTarget.style.borderColor = '#e50914';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(229,9,20,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(10,10,15,0.88)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.6)';
            }}
          >
            <RiArrowLeftSLine className="text-xl" aria-hidden="true" />
          </button>

          {/* Next button */}
          <button
            ref={nextRef}
            type="button"
            aria-label="Next"
            className={cn(
              'carousel-btn carousel-btn-next',
              'absolute right-2 top-1/2 -translate-y-1/2 z-20',
              'flex items-center justify-center w-10 h-10 rounded-full',
              'opacity-0 group-hover:opacity-100 transition-all duration-200',
              'disabled:opacity-0 disabled:pointer-events-none',
            )}
            style={{
              background: 'rgba(10,10,15,0.88)',
              border: '1px solid rgba(255,255,255,0.16)',
              backdropFilter: 'blur(12px)',
              color: '#ffffff',
              boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e50914';
              e.currentTarget.style.borderColor = '#e50914';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(229,9,20,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(10,10,15,0.88)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.6)';
            }}
          >
            <RiArrowRightSLine className="text-xl" aria-hidden="true" />
          </button>

          <Swiper
            modules={[Navigation, FreeMode, A11y]}
            navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
            onBeforeInit={(swiper) => {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
            }}
            freeMode={{ enabled: true, sticky: false, momentumRatio: 0.4 }}
            spaceBetween={spaceBetween}
            breakpoints={breakpoints}
            slidesOffsetBefore={typeof window !== 'undefined' ? Math.max(16, window.innerWidth * 0.04) : 64}
            slidesOffsetAfter={typeof window !== 'undefined' ? Math.max(16, window.innerWidth * 0.04) : 64}
            a11y={{ enabled: true }}
            grabCursor
            className="!overflow-visible pb-4"
          >
            {items.map((item, idx) => (
              <SwiperSlide key={item.id ?? idx}>
                {variant === 'backdrop' ? (
                  <BackdropCard
                    item={item}
                    mediaType={mediaType}
                    showRating={showRating}
                  />
                ) : (
                  <MovieCard
                    item={item}
                    mediaType={mediaType}
                    size={cardSize}
                    showRating={showRating}
                    quality={quality}
                  />
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && items.length === 0 && (
        <div
          className="mx-[clamp(1rem,4vw,4rem)] flex flex-col items-center justify-center
                     py-16 rounded-2xl border"
          style={{
            background: 'var(--bg-surface)',
            borderColor: 'var(--border-default)',
          }}
        >
          <span className="text-4xl mb-3" aria-hidden="true">🎬</span>
          <p className="text-sm font-medium" style={{ color: 'var(--fg-muted)' }}>
            No content available
          </p>
        </div>
      )}
    </section>
  );
}
