/**
 * @file src/components/media/CastCard.jsx
 * @description Actor profile card with photo, name, character, and click-to-person.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getProfileUrl } from '@utils/imageHelpers.js';
import { ROUTES } from '@constants/routes.js';
import { cn } from '@utils/cn.js';

export default function CastCard({ member, index = 0 }) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  if (!member) return null;

  const name      = member.name ?? member.original_name ?? 'Unknown';
  const character = member.character ?? member.job ?? '';
  const photo     = getProfileUrl(member.profile_path, 'md');

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4), ease: [0.16, 1, 0.3, 1] }}
      className="flex-shrink-0 w-[120px] cursor-pointer group"
      onClick={() => navigate(ROUTES.toPersonDetail(member.id))}
      tabIndex={0}
      role="button"
      aria-label={`View ${name}'s profile`}
      onKeyDown={(e) => { if (e.key === 'Enter') navigate(ROUTES.toPersonDetail(member.id)); }}
    >
      {/* Photo */}
      <div
        className="relative w-full aspect-[2/3] rounded-xl overflow-hidden mb-2"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
        }}
      >
        {!imgError ? (
          <img
            src={photo}
            alt={name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-top
                       transition-transform duration-400 group-hover:scale-105"
          />
        ) : (
          /* Fallback initials */
          <div
            className="w-full h-full flex items-center justify-center text-2xl font-black"
            style={{
              background: 'linear-gradient(135deg, var(--bg-elevated), var(--bg-surface))',
              color: 'var(--fg-muted)',
            }}
          >
            {name.charAt(0)}
          </div>
        )}

        {/* Hover overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100
                     transition-opacity duration-200 flex items-end p-2"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}
        >
          <span className="text-[0.65rem] font-semibold" style={{ color: 'rgba(255,255,255,0.8)' }}>
            View Profile →
          </span>
        </div>
      </div>

      {/* Info */}
      <p
        className="text-[0.8125rem] font-semibold leading-snug line-clamp-2 group-hover:text-white transition-colors"
        style={{ color: 'var(--fg-primary)' }}
      >
        {name}
      </p>
      {character && (
        <p className="text-[0.72rem] mt-0.5 line-clamp-2" style={{ color: 'var(--fg-muted)' }}>
          {character}
        </p>
      )}
    </motion.div>
  );
}
