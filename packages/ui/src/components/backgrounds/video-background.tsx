'use client';

import { useEffect, useRef, useState, useMemo, type ReactNode } from 'react';

/**
 * Video source for multi-source video element
 */
export interface VideoSource {
  src: string;
  type: 'video/mp4' | 'video/webm';
}

export interface VideoBackgroundProps {
  /** Single video source URL (legacy support) */
  src?: string;
  /** Multiple video sources for adaptive quality (preferred) */
  sources?: VideoSource[];
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
  /** Enable adaptive quality based on connection (default true) */
  adaptiveQuality?: boolean;
}

type ConnectionQuality = 'slow' | 'medium' | 'fast';

/**
 * VideoBackground - Full-screen video background with adaptive quality
 *
 * Features:
 * - Multiple source formats (WebM, MP4) for optimal browser support
 * - Adaptive quality selection based on viewport and connection
 * - Auto-extracted poster frame for instant visual feedback
 * - Respects prefers-reduced-motion
 * - Pauses when not in viewport (IntersectionObserver)
 * - Progressive loading with poster while video loads
 *
 * @example
 * ```tsx
 * // With multiple sources (recommended)
 * <VideoBackground
 *   sources={[
 *     { src: "/videos/hero-720p.webm", type: "video/webm" },
 *     { src: "/videos/hero-720p.mp4", type: "video/mp4" },
 *     { src: "/videos/hero-1080p.mp4", type: "video/mp4" },
 *   ]}
 *   poster="/images/hero-poster.jpg"
 *   overlayOpacity={0.5}
 * />
 *
 * // Legacy single source
 * <VideoBackground
 *   src="https://storage.googleapis.com/videos/hero-loop.mp4"
 *   poster="/images/hero-fallback.jpg"
 * />
 * ```
 */
export function VideoBackground({
  src,
  sources,
  poster,
  overlayOpacity = 0.4,
  overlayColor = 'black',
  fallbackComponent,
  className = '',
  pauseOnMobile = true,
  adaptiveQuality = true,
}: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality>('medium');

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

  // Estimate connection quality using Navigator.connection API
  useEffect(() => {
    if (typeof navigator === 'undefined' || !adaptiveQuality) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const connection = (navigator as any).connection;
    if (!connection) return;

    const updateQuality = () => {
      const effectiveType = connection.effectiveType;
      const downlink = connection.downlink;

      if (effectiveType === 'slow-2g' || effectiveType === '2g') {
        setConnectionQuality('slow');
      } else if (effectiveType === '3g' || downlink < 1.5) {
        setConnectionQuality('slow');
      } else if (effectiveType === '4g' && downlink >= 5) {
        setConnectionQuality('fast');
      } else {
        setConnectionQuality('medium');
      }
    };

    updateQuality();
    connection.addEventListener('change', updateQuality);
    return () => connection.removeEventListener('change', updateQuality);
  }, [adaptiveQuality]);

  // Build optimized sources list based on connection quality
  const optimizedSources = useMemo(() => {
    if (sources && sources.length > 0) {
      // On slow connections, prioritize WebM (smaller file size)
      if (connectionQuality === 'slow') {
        const webmSources = sources.filter((s) => s.type === 'video/webm');
        const mp4Sources = sources.filter((s) => s.type === 'video/mp4');
        // WebM first for smaller files, then MP4 as fallback
        return [...webmSources, ...mp4Sources];
      }
      return sources;
    }

    // Legacy single-source support
    if (src) {
      return [{ src, type: 'video/mp4' as const }];
    }

    return [];
  }, [sources, src, connectionQuality]);

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
  const shouldShowVideo =
    !hasError && !prefersReducedMotion && !(pauseOnMobile && isMobile) && optimizedSources.length > 0;

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
      {/* Video element with multiple sources */}
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
          className={`transition-opacity duration-1000 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            minWidth: '100%',
            minHeight: '100%',
            width: 'auto',
            height: 'auto',
            objectFit: 'cover',
          }}
        >
          {optimizedSources.map((source, index) => (
            <source key={`${source.type}-${index}`} src={source.src} type={source.type} />
          ))}
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
