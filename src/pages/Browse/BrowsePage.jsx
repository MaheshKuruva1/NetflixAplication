/**
 * @file src/pages/Browse/BrowsePage.jsx
 * @description Browse page demonstrating an alternative layout (combining movies/tv).
 */

import React from 'react';
import { motion } from 'framer-motion';

import movieService from '@services/movieService.js';
import tvService from '@services/tvService.js';
import MediaCarousel from '@components/media/MediaCarousel.jsx';
import { SEO } from '@components/common';
import useFetch from '@hooks/useFetch.js';
import { MEDIA_TYPE } from '@constants/media.js';
import { ROUTES } from '@constants/routes.js';

export default function BrowsePage() {
  const { data: popularMovies, isLoading: loadM1 } = useFetch(() => movieService.getPopular());
  const { data: topMovies,     isLoading: loadM2 } = useFetch(() => movieService.getTopRated());
  const { data: popularTv,     isLoading: loadT1 } = useFetch(() => tvService.getPopular());
  const { data: topTv,         isLoading: loadT2 } = useFetch(() => tvService.getTopRated());

  return (
    <div className="min-h-screen pb-20 pt-8" style={{ background: 'var(--bg-base)' }}>
      <SEO title="Browse" />
      
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="px-[clamp(1rem,5vw,4rem)] mb-8"
      >
        <h1 className="text-3xl font-black text-white">Browse All</h1>
        <p className="text-gray-400 mt-2">Discover popular movies and TV shows hand-picked for you.</p>
      </motion.div>

      <div className="flex flex-col gap-10">
        <MediaCarousel
          title="Popular Movies"
          to={ROUTES.MOVIES}
          items={popularMovies?.results}
          isLoading={loadM1}
          mediaType={MEDIA_TYPE.MOVIE}
          cardSize="md"
        />

        <MediaCarousel
          title="Trending TV Shows"
          to={ROUTES.TV_SHOWS}
          items={popularTv?.results}
          isLoading={loadT1}
          mediaType={MEDIA_TYPE.TV}
          variant="backdrop"
        />

        <MediaCarousel
          title="Top Rated Movies"
          items={topMovies?.results}
          isLoading={loadM2}
          mediaType={MEDIA_TYPE.MOVIE}
          cardSize="md"
        />

        <MediaCarousel
          title="Critically Acclaimed TV"
          items={topTv?.results}
          isLoading={loadT2}
          mediaType={MEDIA_TYPE.TV}
          cardSize="md"
        />
      </div>
    </div>
  );
}
