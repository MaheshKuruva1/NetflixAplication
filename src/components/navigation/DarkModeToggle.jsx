/**
 * @file src/components/navigation/DarkModeToggle.jsx
 * @description Animated sun / moon toggle pill for dark/light mode switching.
 * Uses Framer Motion layoutId for a smooth sliding thumb.
 */

import { motion } from 'framer-motion';
import { RiSunLine, RiMoonLine } from 'react-icons/ri';
import { cn } from '@utils/cn.js';

export default function DarkModeToggle({
  isDark,
  onToggle,
  size    = 'md',    // 'sm' | 'md' | 'lg'
  className,
}) {
  const sizes = {
    sm: { pill: 'h-7 w-[52px]', thumb: 'w-5 h-5', icon: 'text-[0.65rem]', offset: '26px' },
    md: { pill: 'h-8 w-[60px]', thumb: 'w-6 h-6', icon: 'text-xs',        offset: '30px' },
    lg: { pill: 'h-9 w-[68px]', thumb: 'w-7 h-7', icon: 'text-sm',        offset: '34px' },
  };
  const s = sizes[size] ?? sizes.md;

  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={!isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={onToggle}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={cn(
        'relative inline-flex items-center flex-shrink-0 rounded-full cursor-pointer',
        'border transition-colors duration-300 focus-visible:outline-none',
        'focus-visible:ring-2 focus-visible:ring-[#e50914] focus-visible:ring-offset-2',
        s.pill,
        className
      )}
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #1a1a2e, #16213e)'
          : 'linear-gradient(135deg, #fff0d0, #ffe08a)',
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
        focusRingOffsetColor: 'var(--bg-base)',
      }}
    >
      {/* Track icons: sun (right) and moon (left) */}
      <span
        className={cn('absolute left-1.5 flex items-center justify-center', s.icon)}
        style={{ color: isDark ? 'rgba(255,255,255,0.3)' : '#aaa' }}
        aria-hidden="true"
      >
        <RiMoonLine />
      </span>
      <span
        className={cn('absolute right-1.5 flex items-center justify-center', s.icon)}
        style={{ color: isDark ? 'rgba(255,255,255,0.3)' : '#f5a623' }}
        aria-hidden="true"
      >
        <RiSunLine />
      </span>

      {/* Sliding thumb */}
      <motion.span
        className={cn(
          'absolute left-1 flex items-center justify-center rounded-full',
          'shadow-md z-10',
          s.thumb, s.icon
        )}
        animate={{
          x: isDark ? 0 : s.offset,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 36, mass: 0.8 }}
        style={{
          background: isDark
            ? 'linear-gradient(135deg, #4a4a72, #2d2d4a)'
            : 'linear-gradient(135deg, #fff8e1, #ffffff)',
          boxShadow: isDark
            ? '0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
            : '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.8)',
        }}
        aria-hidden="true"
      >
        {isDark ? (
          <RiMoonLine style={{ color: '#a0a0d0' }} />
        ) : (
          <RiSunLine style={{ color: '#f5a623' }} />
        )}
      </motion.span>
    </motion.button>
  );
}
