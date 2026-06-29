/**
 * @file src/components/ui/Avatar.jsx
 * @description User / cast avatar with image, initials fallback,
 * online indicator, ring, and group stacking.
 */

import { useState } from 'react';
import { cn } from '@utils/cn.js';

/* ── Sizes ─────────────────────────────────────────────────────────────────── */
const SIZES = {
  xs:  { container: 'w-6 h-6',   text: 'text-[0.55rem]', ring: 'ring-1', badge: 'w-1.5 h-1.5' },
  sm:  { container: 'w-8 h-8',   text: 'text-xs',        ring: 'ring-1', badge: 'w-2 h-2' },
  md:  { container: 'w-10 h-10', text: 'text-sm',        ring: 'ring-2', badge: 'w-2.5 h-2.5' },
  lg:  { container: 'w-14 h-14', text: 'text-base',      ring: 'ring-2', badge: 'w-3 h-3' },
  xl:  { container: 'w-20 h-20', text: 'text-xl',        ring: 'ring-2', badge: 'w-3.5 h-3.5' },
  '2xl':{ container: 'w-28 h-28',text: 'text-3xl',       ring: 'ring-4', badge: 'w-4 h-4' },
};

/* ── Color Palette for initials ─────────────────────────────────────────────── */
const INITIALS_COLORS = [
  ['#e50914', '#88070e'],
  ['#00d4ff', '#0074a6'],
  ['#f5a623', '#b36800'],
  ['#8b5cf6', '#5b21b6'],
  ['#00c864', '#007a3c'],
  ['#f43f5e', '#9f1239'],
];

function getInitials(name = '') {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function getColorIndex(name = '') {
  let hash = 0;
  for (const c of name) hash = ((hash << 5) - hash) + c.charCodeAt(0);
  return Math.abs(hash) % INITIALS_COLORS.length;
}

/* ── Avatar ─────────────────────────────────────────────────────────────────── */
export default function Avatar({
  src,
  name        = '',
  size        = 'md',
  shape       = 'circle',   // 'circle' | 'square'
  online,                    // true | false | undefined
  ring        = false,
  ringColor   = '#e50914',
  className,
  onClick,
  ...props
}) {
  const [imgError, setImgError] = useState(false);
  const s = SIZES[size] ?? SIZES.md;
  const initials = getInitials(name);
  const colorIdx = getColorIndex(name);
  const [gradFrom, gradTo] = INITIALS_COLORS[colorIdx];
  const showImage = src && !imgError;
  const radius = shape === 'circle' ? 'rounded-full' : 'rounded-xl';

  return (
    <div
      className={cn(
        'relative inline-flex flex-shrink-0 select-none',
        s.container,
        className,
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={name || 'Avatar'}
      {...props}
    >
      {/* Ring */}
      {ring && (
        <span
          className={cn('absolute inset-0', radius, s.ring, 'ring-offset-2 ring-offset-[var(--bg-base)]')}
          style={{ '--tw-ring-color': ringColor }}
        />
      )}

      {/* Image or Initials */}
      <span
        className={cn(
          'flex w-full h-full items-center justify-center overflow-hidden',
          radius,
          s.text, 'font-bold leading-none',
          'transition-transform duration-200',
          onClick && 'hover:scale-105',
        )}
        style={
          showImage
            ? undefined
            : { background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})`, color: '#ffffff' }
        }
        aria-hidden={!!showImage}
      >
        {showImage ? (
          <img
            src={src}
            alt={name}
            loading="lazy"
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          initials || '?'
        )}
      </span>

      {/* Online Indicator */}
      {online !== undefined && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-[var(--bg-base)]',
            s.badge
          )}
          style={{ background: online ? '#00c864' : 'var(--fg-muted)' }}
          aria-label={online ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
}

/* ── Avatar Group (stacked) ─────────────────────────────────────────────────── */
export function AvatarGroup({ avatars = [], max = 4, size = 'sm', className }) {
  const shown  = avatars.slice(0, max);
  const extra  = avatars.length - max;

  return (
    <div className={cn('flex items-center', className)}>
      {shown.map((av, i) => (
        <div
          key={av.name ?? i}
          className="ring-2 ring-[var(--bg-base)] rounded-full"
          style={{ marginLeft: i === 0 ? 0 : '-0.5rem', zIndex: shown.length - i }}
        >
          <Avatar src={av.src} name={av.name} size={size} />
        </div>
      ))}
      {extra > 0 && (
        <div
          className={cn(
            'flex items-center justify-center rounded-full text-xs font-bold',
            'ring-2 ring-[var(--bg-base)]',
            SIZES[size]?.container ?? SIZES.sm.container
          )}
          style={{
            marginLeft: '-0.5rem',
            background: 'var(--bg-elevated)',
            color: 'var(--fg-secondary)',
            border: '1px solid var(--border-hover)',
          }}
          aria-label={`+${extra} more`}
        >
          +{extra}
        </div>
      )}
    </div>
  );
}
