/**
 * @file src/components/ui/Spinner.jsx
 * @description Loading spinner with 3 variants and 5 sizes.
 */

import { cn } from '@utils/cn.js';

const SIZES = {
  xs:  { svg: 16, stroke: 2.5 },
  sm:  { svg: 20, stroke: 2.5 },
  md:  { svg: 28, stroke: 2.5 },
  lg:  { svg: 40, stroke: 2 },
  xl:  { svg: 56, stroke: 2 },
};

const COLORS = {
  brand:  '#e50914',
  white:  '#ffffff',
  cyan:   '#00d4ff',
  muted:  'var(--fg-muted)',
};

/* ── Circle Spinner ─────────────────────────────────────────────────────────── */
function CircleSpinner({ size, color, className }) {
  const { svg, stroke } = SIZES[size] ?? SIZES.md;
  const c = COLORS[color] ?? COLORS.brand;
  return (
    <svg
      width={svg} height={svg}
      viewBox="0 0 50 50"
      fill="none"
      className={cn('animate-spin', className)}
      aria-hidden="true"
    >
      <circle cx="25" cy="25" r="20" stroke="currentColor" strokeWidth={stroke} strokeOpacity="0.15" />
      <path
        d="M25 5 a20 20 0 0 1 20 20"
        stroke={c}
        strokeWidth={stroke}
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ── Dots Spinner ───────────────────────────────────────────────────────────── */
function DotsSpinner({ size, color, className }) {
  const dotSize = { xs: 4, sm: 5, md: 7, lg: 10, xl: 13 }[size] ?? 7;
  const c = COLORS[color] ?? COLORS.brand;
  return (
    <span className={cn('inline-flex items-center gap-1', className)} aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="rounded-full animate-pulse"
          style={{
            width: dotSize, height: dotSize,
            background: c,
            animationDelay: `${i * 180}ms`,
            animationDuration: '1s',
          }}
        />
      ))}
    </span>
  );
}

/* ── Bars Spinner ───────────────────────────────────────────────────────────── */
function BarsSpinner({ size, color, className }) {
  const h = { xs: 14, sm: 18, md: 24, lg: 32, xl: 44 }[size] ?? 24;
  const c = COLORS[color] ?? COLORS.brand;
  return (
    <span
      className={cn('inline-flex items-end gap-0.5', className)}
      aria-hidden="true"
      style={{ height: h }}
    >
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="rounded-sm animate-pulse"
          style={{
            width: Math.max(3, h * 0.17),
            background: c,
            height: `${[60, 100, 80, 45][i]}%`,
            animationDelay: `${i * 120}ms`,
            animationDuration: '0.9s',
          }}
        />
      ))}
    </span>
  );
}

/* ── Main Spinner ───────────────────────────────────────────────────────────── */
export default function Spinner({
  variant = 'circle',
  size    = 'md',
  color   = 'brand',
  label   = 'Loading…',
  className,
}) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn('inline-flex items-center justify-center', className)}
    >
      {variant === 'dots' ? (
        <DotsSpinner size={size} color={color} />
      ) : variant === 'bars' ? (
        <BarsSpinner size={size} color={color} />
      ) : (
        <CircleSpinner size={size} color={color} />
      )}
      <span className="sr-only">{label}</span>
    </span>
  );
}

/* ── Full-screen Page Loader ───────────────────────────────────────────────── */
export function PageLoader({ message = 'Loading…' }) {
  return (
    <div
      className="fixed inset-0 z-[var(--z-modal)] flex flex-col items-center justify-center gap-5"
      style={{ background: 'var(--bg-base)' }}
      role="status"
      aria-label={message}
    >
      {/* Logo mark */}
      <span
        className="text-[2rem] font-black font-display tracking-tighter"
        style={{ color: '#e50914' }}
        aria-hidden="true"
      >
        Bappam
        <span style={{ color: 'var(--fg-secondary)' }}>Movies</span>
      </span>

      <Spinner variant="circle" size="lg" color="brand" />

      {message && (
        <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
          {message}
        </p>
      )}
    </div>
  );
}

/* ── Inline Content Loader ─────────────────────────────────────────────────── */
export function ContentLoader({ size = 'md', className }) {
  return (
    <div
      className={cn('flex items-center justify-center py-16', className)}
      role="status"
      aria-label="Loading content"
    >
      <Spinner size={size} />
    </div>
  );
}
