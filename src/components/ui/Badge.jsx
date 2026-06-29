/**
 * @file src/components/ui/Badge.jsx
 * @description Status, genre, and metadata badge component.
 * 8 color variants, 3 sizes, optional dot, icon, and dismiss support.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { RiCloseLine } from 'react-icons/ri';
import { cn } from '@utils/cn.js';

/* ── Variants ──────────────────────────────────────────────────────────────── */
const VARIANTS = {
  brand:   'bg-[rgba(229,9,20,0.18)] text-[#ff6b6b] border border-[rgba(229,9,20,0.35)]',
  gold:    'bg-[rgba(245,166,35,0.18)] text-[#f5a623] border border-[rgba(245,166,35,0.35)]',
  cyan:    'bg-[rgba(0,212,255,0.12)] text-[#00d4ff] border border-[rgba(0,212,255,0.28)]',
  violet:  'bg-[rgba(139,92,246,0.15)] text-[#a78bfa] border border-[rgba(139,92,246,0.3)]',
  emerald: 'bg-[rgba(0,200,100,0.14)] text-[#00c864] border border-[rgba(0,200,100,0.3)]',
  rose:    'bg-[rgba(244,63,94,0.15)] text-[#fb7185] border border-[rgba(244,63,94,0.3)]',
  ghost:   'bg-white/6 text-[var(--fg-secondary)] border border-white/10',
  dark:    'bg-[rgba(10,10,15,0.75)] text-white border border-white/12 backdrop-blur-sm',
};

const DOT_COLORS = {
  brand: '#e50914', gold: '#f5a623', cyan: '#00d4ff',
  violet: '#8b5cf6', emerald: '#00c864', rose: '#f43f5e',
  ghost: 'currentColor', dark: 'currentColor',
};

/* ── Sizes ─────────────────────────────────────────────────────────────────── */
const SIZES = {
  sm: 'h-5 px-2 text-[0.65rem] gap-1 rounded-md',
  md: 'h-6 px-2.5 text-[0.72rem] gap-1.5 rounded-lg',
  lg: 'h-7 px-3 text-[0.8125rem] gap-2 rounded-xl',
};

/* ── Component ─────────────────────────────────────────────────────────────── */
export default function Badge({
  variant  = 'ghost',
  size     = 'md',
  dot      = false,
  icon,
  children,
  onDismiss,
  pulse    = false,
  className,
  ...props
}) {
  return (
    <AnimatePresence>
      <motion.span
        layout
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.75 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={cn(
          'inline-flex items-center font-semibold tracking-wide uppercase select-none whitespace-nowrap',
          VARIANTS[variant] ?? VARIANTS.ghost,
          SIZES[size] ?? SIZES.md,
          className
        )}
        {...props}
      >
        {/* Dot indicator */}
        {dot && (
          <span className="relative flex-shrink-0">
            <span
              className="block rounded-full"
              style={{
                width: size === 'sm' ? 5 : size === 'lg' ? 7 : 6,
                height: size === 'sm' ? 5 : size === 'lg' ? 7 : 6,
                background: DOT_COLORS[variant] ?? 'currentColor',
              }}
            />
            {pulse && (
              <span
                className="absolute inset-0 rounded-full animate-ping opacity-75"
                style={{ background: DOT_COLORS[variant] ?? 'currentColor' }}
              />
            )}
          </span>
        )}

        {/* Left icon */}
        {icon && <span className="flex-shrink-0 text-[1.1em] leading-none">{icon}</span>}

        {/* Label */}
        <span>{children}</span>

        {/* Dismiss button */}
        {onDismiss && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDismiss(); }}
            className="flex-shrink-0 -mr-0.5 rounded-full opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Remove badge"
          >
            <RiCloseLine className="text-[1.15em]" />
          </button>
        )}
      </motion.span>
    </AnimatePresence>
  );
}

/* ── Pre-built badges ──────────────────────────────────────────────────────── */

/** HD / 4K / SDR quality badge */
export function QualityBadge({ quality = '4K', ...props }) {
  const v = quality === '4K' ? 'cyan' : quality === 'HD' ? 'gold' : 'ghost';
  return <Badge variant={v} size="sm" {...props}>{quality}</Badge>;
}

/** Maturity rating badge */
export function MaturityBadge({ rating = 'PG-13', ...props }) {
  return (
    <Badge variant="ghost" size="sm" {...props}>
      <span className="font-mono">{rating}</span>
    </Badge>
  );
}

/** New / Trending badge */
export function HotBadge({ label = 'NEW', ...props }) {
  return <Badge variant="brand" size="sm" dot pulse {...props}>{label}</Badge>;
}

/** Genre chip (larger, clickable) */
export function GenreBadge({ children, onClick, active = false, ...props }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'inline-flex items-center h-8 px-4 rounded-full text-[0.8125rem] font-medium',
        'border transition-all duration-150 cursor-pointer',
        active
          ? 'bg-[#e50914] text-white border-[#e50914]'
          : 'bg-white/6 text-[var(--fg-secondary)] border-white/10 hover:bg-white/12 hover:text-white hover:border-white/20'
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
