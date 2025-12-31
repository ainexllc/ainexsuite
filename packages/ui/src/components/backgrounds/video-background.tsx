'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

export interface VideoBackgroundProps {
  /** Video source URL (Firebase Storage or CDN) */
  src: string;
  /** Fallback image shown while loading or if video fails */
  poster?: string;
  /** Dark overlay opacity (0-1, default 0.4) */
  overlayOpacity?: number;
  /** Overlay color (default 'black') */
  overlayColor?: string;
  /** Fallback component if video fails to load */
  fallbackComponent?: ReactNode;
  /** Additional className for the container */
  className?: string;
  /** Whether to pause on mobile to save battery (default true) */
  pauseOnMobile?: boolean;
}

/**
 * VideoBackground - Full-screen video background for landing pages
 *
 * Features:
 * - Autoplay, muted, looped video
 * - Dark overlay for text readability
 * - Respects prefers-reduced-motion
 * - Pauses when not in viewport (IntersectionObserver)
 * - Falls back to poster image on error or mobile
 * - Accessible (aria-hidden, decorative only)
 *
 * @example
 * ```tsx
 * <VideoBackground
 *   src="https://storage.googleapis.com/videos/hero-loop.mp4"
 *   poster="/images/hero-fallback.jpg"
 *   overlayOpacity={0.5}
 * />
 * ```
 */
export function VideoBackground({
  src,
  poster,
  overlayOpacity = 0.4,
  overlayColor = 'black',
  fallbackComponent,
  className = '',
  pauseOnMobile = true,
}: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Check for mobile device
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Pause/play based on viewport visibility
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {
              // Autoplay may be blocked by browser
              setHasError(true);
            });
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [isLoaded]);

  // Should show video?
  const shouldShowVideo = !hasError && !prefersReducedMotion && !(pauseOnMobile && isMobile);

  // Show fallback if video can't play
  if (!shouldShowVideo && fallbackComponent) {
    return <>{fallbackComponent}</>;
  }

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* Video element */}
      {shouldShowVideo && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={poster}
          onLoadedData={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <source src={src} type="video/mp4" />
        </video>
      )}

      {/* Poster fallback (shown while loading, on error, or reduced motion) */}
      {poster && (!shouldShowVideo || !isLoaded) && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${poster})` }}
        />
      )}

      {/* Dark overlay for text readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: overlayColor,
          opacity: overlayOpacity,
        }}
      />

      {/* Optional gradient overlay for better text contrast at top/bottom */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom,
            ${overlayColor} 0%,
            transparent 30%,
            transparent 70%,
            ${overlayColor} 100%)`,
          opacity: overlayOpacity * 0.5,
        }}
      />
    </div>
  );
}
