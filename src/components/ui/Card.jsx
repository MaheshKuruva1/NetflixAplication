/**
 * @file src/components/ui/Card.jsx
 * @description Generic card with 5 visual variants and hover animations.
 */

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@utils/cn.js';

/* ── Variants ──────────────────────────────────────────────────────────────── */
const VARIANTS = {
  default: 'card-base card-hover',
  elevated: cn(
    'bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-2xl overflow-hidden',
    'transition-all duration-250 hover:-translate-y-1.5 hover:shadow-[var(--shadow-xl)] hover:border-[var(--border-hover)]',
  ),
  glass: cn(
    'glass rounded-2xl overflow-hidden',
    'transition-all duration-250 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]',
  ),
  flat: cn(
    'bg-[var(--bg-surface)] rounded-2xl overflow-hidden',
    'border border-transparent hover:border-[var(--border-default)]',
    'transition-all duration-200',
  ),
  bordered: cn(
    'bg-transparent border border-[var(--border-default)] rounded-2xl overflow-hidden',
    'hover:border-[var(--border-active)] hover:bg-[var(--bg-surface)]',
    'transition-all duration-200',
  ),
  glow: cn(
    'card-base card-hover-glow',
  ),
};

/* ── Card ───────────────────────────────────────────────────────────────────── */
const Card = forwardRef(function Card(
  {
    variant   = 'default',
    animate   = true,
    className,
    children,
    onClick,
    ...props
  },
  ref
) {
  const classes = cn(VARIANTS[variant] ?? VARIANTS.default, className);

  if (animate) {
    return (
      <motion.div
        ref={ref}
        className={classes}
        onClick={onClick}
        whileHover={onClick ? { scale: 1.01 } : undefined}
        whileTap={onClick ? { scale: 0.99 } : undefined}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div ref={ref} className={classes} onClick={onClick} {...props}>
      {children}
    </div>
  );
});

/* ── Sub-Components ─────────────────────────────────────────────────────────── */
Card.Header = function CardHeader({ className, children, ...props }) {
  return (
    <div
      className={cn('px-5 pt-5 pb-3 flex items-start justify-between gap-3', className)}
      {...props}
    >
      {children}
    </div>
  );
};

Card.Body = function CardBody({ className, children, padded = true, ...props }) {
  return (
    <div className={cn(padded && 'px-5 py-4', className)} {...props}>
      {children}
    </div>
  );
};

Card.Footer = function CardFooter({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'px-5 py-4 border-t border-[var(--border-default)]',
        'flex items-center justify-between gap-3',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

Card.Image = function CardImage({ src, alt = '', ratio, className, ...props }) {
  return (
    <div
      className={cn('overflow-hidden', ratio && `aspect-[${ratio}]`, !ratio && 'aspect-video', className)}
      {...props}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    </div>
  );
};

export default Card;

/* ── Info Card ──────────────────────────────────────────────────────────────── */
export function InfoCard({ icon, title, value, trend, className }) {
  const isPositive = typeof trend === 'number' ? trend > 0 : null;
  return (
    <Card variant="elevated" className={cn('p-5', className)} animate={false}>
      <div className="flex items-start justify-between gap-4">
        {icon && (
          <span
            className="flex items-center justify-center w-11 h-11 rounded-xl text-xl flex-shrink-0"
            style={{ background: 'rgba(229,9,20,0.12)', color: '#e50914' }}
          >
            {icon}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium" style={{ color: 'var(--fg-muted)' }}>{title}</p>
          <p className="text-2xl font-bold mt-0.5" style={{ color: 'var(--fg-primary)' }}>{value}</p>
          {trend !== undefined && (
            <p className="text-xs font-medium mt-1"
              style={{ color: isPositive ? 'var(--color-success-text)' : 'var(--color-error-text)' }}>
              {isPositive ? '↑' : '↓'} {Math.abs(trend)}%
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
