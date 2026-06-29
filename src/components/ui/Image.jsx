/**
 * @file src/components/ui/Image.jsx
 * @description Advanced image wrapper for lazy loading, blur-up transitions, and skeletons.
 */

import { useState, useEffect, useRef } from 'react';
import { cn } from '@utils/cn.js';
import Skeleton from './Skeleton.jsx';

export default function Image({
  src,
  alt,
  className,
  skeletonClassName,
  fallbackSrc,
  lazy = true,
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(!lazy);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!lazy) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy]);

  const currentSrc = hasError ? fallbackSrc : (isVisible ? src : undefined);

  return (
    <div ref={imgRef} className={cn('relative overflow-hidden', className)}>
      {/* Skeleton / Blur placeholder */}
      {(!isLoaded || hasError) && (
        <Skeleton className={cn('absolute inset-0 w-full h-full', skeletonClassName)} />
      )}

      {/* Actual Image */}
      {currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          loading={lazy ? 'lazy' : 'eager'}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-500',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          {...props}
        />
      )}
    </div>
  );
}
