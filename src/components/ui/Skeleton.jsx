/**
 * @file src/components/ui/Skeleton.jsx
 * @description Shimmer loading skeleton with shape variants and pre-built composites.
 */

import { cn } from '@utils/cn.js';

/* ── Base ───────────────────────────────────────────────────────────────────── */
export default function Skeleton({ className, style, ...props }) {
  return (
    <div
      className={cn('skeleton', className)}
      style={style}
      aria-hidden="true"
      {...props}
    />
  );
}

/* ── Text Lines ─────────────────────────────────────────────────────────────── */
export function SkeletonText({ lines = 3, className }) {
  const widths = ['100%', '88%', '75%', '92%', '65%', '80%'];
  return (
    <div className={cn('flex flex-col gap-2', className)} aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className="skeleton-text h-[1em] rounded-md"
          style={{ width: widths[i % widths.length] }}
        />
      ))}
    </div>
  );
}

/* ── Avatar ─────────────────────────────────────────────────────────────────── */
export function SkeletonAvatar({ size = 40, className }) {
  return (
    <Skeleton
      className="skeleton-circle flex-shrink-0"
      style={{ width: size, height: size, borderRadius: '50%' }}
    />
  );
}

/* ── Movie Poster Card ───────────────────────────────────────────────────────── */
export function SkeletonMovieCard({ className }) {
  return (
    <div
      className={cn('flex flex-col gap-3 rounded-xl overflow-hidden', className)}
      aria-hidden="true"
    >
      {/* Poster */}
      <Skeleton className="skeleton-poster w-full rounded-xl" />
      {/* Title */}
      <div className="px-1 flex flex-col gap-2">
        <Skeleton className="skeleton-text h-4 rounded-md" style={{ width: '80%' }} />
        <Skeleton className="skeleton-text h-3 rounded-md" style={{ width: '55%' }} />
      </div>
    </div>
  );
}

/* ── Backdrop / Wide Card ────────────────────────────────────────────────────── */
export function SkeletonBackdropCard({ className }) {
  return (
    <div className={cn('flex flex-col gap-3', className)} aria-hidden="true">
      <Skeleton className="skeleton-backdrop w-full rounded-xl" />
      <div className="flex flex-col gap-2 px-1">
        <Skeleton className="skeleton-text h-4 rounded-md" style={{ width: '70%' }} />
        <Skeleton className="skeleton-text h-3 rounded-md" style={{ width: '45%' }} />
      </div>
    </div>
  );
}

/* ── Hero Banner ─────────────────────────────────────────────────────────────── */
export function SkeletonHero({ className }) {
  return (
    <div
      className={cn('relative w-full rounded-none overflow-hidden', className)}
      style={{ minHeight: '65vh' }}
      aria-hidden="true"
    >
      <Skeleton className="absolute inset-0 rounded-none" style={{ height: '100%' }} />
      {/* Content overlay skeleton */}
      <div className="absolute bottom-16 left-[clamp(1rem,5vw,5rem)] flex flex-col gap-4 w-full max-w-xl">
        <Skeleton className="h-5 rounded-lg" style={{ width: '25%' }} />
        <Skeleton className="h-12 rounded-xl" style={{ width: '75%' }} />
        <SkeletonText lines={2} />
        <div className="flex gap-3 mt-2">
          <Skeleton className="h-11 w-32 rounded-xl" />
          <Skeleton className="h-11 w-36 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/* ── Row of Movie Cards ──────────────────────────────────────────────────────── */
export function SkeletonMovieRow({ count = 6, className }) {
  return (
    <div className={cn('flex gap-4 overflow-hidden', className)} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex-shrink-0" style={{ width: 'clamp(130px, 15vw, 200px)' }}>
          <SkeletonMovieCard />
        </div>
      ))}
    </div>
  );
}

/* ── Detail Page Hero ────────────────────────────────────────────────────────── */
export function SkeletonDetailHero({ className }) {
  return (
    <div
      className={cn('w-full', className)}
      style={{ minHeight: '55vh', position: 'relative' }}
      aria-hidden="true"
    >
      <Skeleton className="w-full h-full absolute inset-0" />
      <div className="absolute inset-0 flex items-end">
        <div className="w-full p-[clamp(1.5rem,5vw,5rem)] flex gap-8 items-end">
          <Skeleton className="hidden md:block flex-shrink-0 rounded-xl"
            style={{ width: 200, height: 300 }} />
          <div className="flex flex-col gap-4 flex-1 max-w-2xl pb-4">
            <Skeleton className="h-4 rounded" style={{ width: '20%' }} />
            <Skeleton className="h-10 rounded-xl" style={{ width: '65%' }} />
            <Skeleton className="h-4 rounded" style={{ width: '40%' }} />
            <SkeletonText lines={3} />
            <div className="flex gap-3 mt-1">
              <Skeleton className="h-12 w-36 rounded-xl" />
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Cast Row ────────────────────────────────────────────────────────────────── */
export function SkeletonCastRow({ count = 8, className }) {
  return (
    <div className={cn('flex gap-4 overflow-hidden', className)} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2" style={{ width: 88 }}>
          <SkeletonAvatar size={80} />
          <Skeleton className="h-3 rounded w-16" />
          <Skeleton className="h-3 rounded w-12" />
        </div>
      ))}
    </div>
  );
}
