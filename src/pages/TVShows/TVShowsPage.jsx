/**
 * @file src/pages/TVShows/TVShowsPage.jsx
 * @description Browsing page for TV Shows with infinite scroll and genre filtering.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiFilter3Line } from 'react-icons/ri';

import tvService from '@services/tvService.js';
import MovieCard from '@components/media/MovieCard.jsx';
import { SkeletonMovieRow } from '@components/ui/Skeleton.jsx';
import { SEO } from '@components/common';
import useIntersectionObserver from '@hooks/useIntersectionObserver.js';
import useFetch from '@hooks/useFetch.js';
import { MEDIA_TYPE } from '@constants/media.js';

export default function TVShowsPage() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [selectedGenre, setSelectedGenre] = useState('');

  // Fetch Genres
  const { data: genresData } = useFetch(() => tvService.getGenres());
  const genres = genresData?.genres || [];

  // Infinite Scroll Observer
  const { ref: loadMoreRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '200px',
  });

  const fetchShows = useCallback(async (pageNum, genreId, isNewSearch = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = genreId 
        ? await tvService.getByGenre(genreId, pageNum)
        : await tvService.getPopular(pageNum);
      
      const newItems = response?.results || [];
      const totalPages = response?.total_pages || 1;

      setItems(prev => isNewSearch ? newItems : [...prev, ...newItems]);
      setHasMore(pageNum < totalPages);
    } catch (err) {
      setError(err.message || 'Failed to load TV shows.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load & Genre change
  useEffect(() => {
    setPage(1);
    fetchShows(1, selectedGenre, true);
  }, [selectedGenre, fetchShows]);

  // Load more trigger
  useEffect(() => {
    if (isIntersecting && hasMore && !isLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchShows(nextPage, selectedGenre, false);
    }
  }, [isIntersecting, hasMore, isLoading, page, selectedGenre, fetchShows]);

  return (
    <div className="min-h-screen px-[clamp(1rem,5vw,4rem)] pt-6 pb-20" style={{ background: 'var(--bg-base)' }}>
      <SEO title="TV Shows" />

      {/* Header & Filter */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <h1 className="text-3xl font-black text-white">TV Shows</h1>

        {/* Genre Dropdown */}
        <div className="relative flex items-center min-w-[200px] max-w-xs rounded-xl"
             style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
          <RiFilter3Line className="absolute left-3 text-base pointer-events-none text-gray-400" />
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="w-full h-10 pl-9 pr-8 bg-transparent text-sm outline-none text-white appearance-none cursor-pointer"
            aria-label="Filter by genre"
          >
            <option value="" className="bg-[#141414]">All Genres</option>
            {genres.map(g => (
              <option key={g.id} value={g.id} className="bg-[#141414]">{g.name}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Grid */}
      <div 
        className="grid gap-4 sm:gap-6 lg:gap-8"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}
      >
        <AnimatePresence mode="popLayout">
          {items.map((item, idx) => (
            <motion.div
              key={`${item.id}-${idx}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: (idx % 20) * 0.03 }}
            >
              <MovieCard item={item} mediaType={MEDIA_TYPE.TV} size="lg" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Loading & Empty States */}
      {isLoading && (
        <div className="mt-8 flex flex-col gap-4">
          <SkeletonMovieRow count={6} />
        </div>
      )}

      {!isLoading && items.length === 0 && !error && (
        <div className="py-20 text-center text-gray-400">
          <p className="text-xl font-semibold">No TV shows found.</p>
        </div>
      )}

      {error && (
        <div className="py-20 text-center text-red-500">
          <p className="text-lg">{error}</p>
          <button 
            onClick={() => fetchShows(page, selectedGenre, page === 1)}
            className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Invisible observer target */}
      <div ref={loadMoreRef} className="h-20 w-full" />
    </div>
  );
}
