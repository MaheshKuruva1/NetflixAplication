/**
 * @file src/components/ui/Button.jsx
 * @description Premium button component with 6 variants, 5 sizes,
 * loading state, icon support, and Framer Motion micro-animations.
 */

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@utils/cn.js';

/* ── Variant Styles ────────────────────────────────────────────────────────── */
const VARIANTS = {
  primary: [
    'bg-[#e50914] text-white border border-transparent',
    'hover:bg-[#ff1a26] hover:shadow-[0_0_24px_rgba(229,9,20,0.5)]',
    'active:bg-[#cc0710] active:scale-[0.98]',
    'disabled:bg-[#a5060d] disabled:opacity-50',
  ],
  secondary: [
    'bg-white/10 text-white border border-white/15',
    'hover:bg-white/18 hover:border-white/25',
    'active:bg-white/12 active:scale-[0.98]',
    'disabled:opacity-40',
  ],
  ghost: [
    'bg-transparent text-[var(--fg-secondary)] border border-transparent',
    'hover:bg-white/7 hover:text-white hover:border-white/10',
    'active:bg-white/10 active:scale-[0.98]',
    'disabled:opacity-40',
  ],
  outline: [
    'bg-transparent text-white border border-white/25',
    'hover:bg-white/6 hover:border-white/40',
    'active:scale-[0.98]',
    'disabled:opacity-40',
  ],
  danger: [
    'bg-[rgba(229,9,20,0.15)] text-[#ff6b6b] border border-[rgba(229,9,20,0.3)]',
    'hover:bg-[rgba(229,9,20,0.25)] hover:border-[rgba(229,9,20,0.5)]',
    'active:scale-[0.98]',
    'disabled:opacity-40',
  ],
  success: [
    'bg-[rgba(0,200,100,0.15)] text-[#00c864] border border-[rgba(0,200,100,0.3)]',
    'hover:bg-[rgba(0,200,100,0.25)] hover:border-[rgba(0,200,100,0.5)]',
    'active:scale-[0.98]',
    'disabled:opacity-40',
  ],
};

/* ── Size Styles ───────────────────────────────────────────────────────────── */
const SIZES = {
  xs: 'h-7 px-3 text-[0.75rem] gap-1.5 rounded-md',
  sm: 'h-8 px-4 text-[0.8125rem] gap-2 rounded-lg',
  md: 'h-10 px-5 text-[0.9375rem] gap-2.5 rounded-xl',
  lg: 'h-12 px-7 text-base gap-3 rounded-xl',
  xl: 'h-14 px-9 text-lg gap-3.5 rounded-2xl',
};

/* ── Icon Size Styles ──────────────────────────────────────────────────────── */
const ICON_SIZES = {
  xs: 'h-7 w-7 rounded-md',
  sm: 'h-8 w-8 rounded-lg',
  md: 'h-10 w-10 rounded-xl',
  lg: 'h-12 w-12 rounded-xl',
  xl: 'h-14 w-14 rounded-2xl',
};

/* ── Spinner ───────────────────────────────────────────────────────────────── */
function ButtonSpinner({ size = 'md' }) {
  const dim = { xs: 12, sm: 14, md: 16, lg: 18, xl: 20 }[size] ?? 16;
  return (
    <svg
      width={dim} height={dim}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      className="animate-spin"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}

/* ── Component ─────────────────────────────────────────────────────────────── */
const Button = forwardRef(function Button(
  {
    variant  = 'primary',
    size     = 'md',
    isLoading = false,
    isIcon   = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    className,
    children,
    disabled,
    as: Tag  = 'button',
    ...props
  },
  ref
) {
  const isDisabled = disabled || isLoading;

  const baseClasses = cn(
    // Base
    'relative inline-flex items-center justify-center font-semibold',
    'select-none whitespace-nowrap leading-none',
    'cursor-pointer transition-all duration-[150ms] ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]',
    // Disabled
    isDisabled && 'pointer-events-none',
    // Full width
    fullWidth && 'w-full',
    // Variant
    ...VARIANTS[variant] ?? VARIANTS.primary,
    // Size
    isIcon ? ICON_SIZES[size] : SIZES[size],
    // Custom
    className,
  );

  return (
    <motion.button
      ref={ref}
      as={Tag}
      className={baseClasses}
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.02 } : undefined}
      whileTap={!isDisabled ? { scale: 0.97 } : undefined}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      {...props}
    >
      {/* Loading overlay */}
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <ButtonSpinner size={size} />
        </span>
      )}

      {/* Content */}
      <span className={cn('flex items-center gap-[inherit]', isLoading && 'invisible')}>
        {leftIcon && <span className="flex-shrink-0 text-[1.1em]">{leftIcon}</span>}
        {!isIcon && children}
        {rightIcon && <span className="flex-shrink-0 text-[1.1em]">{rightIcon}</span>}
        {isIcon && children}
      </span>
    </motion.button>
  );
});

export default Button;
