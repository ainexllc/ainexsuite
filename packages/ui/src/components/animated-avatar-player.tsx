"use client";

import * as React from "react";

export interface AnimatedAvatarPlayerProps {
  /** Video source URL */
  src: string;
  /** CSS class name */
  className?: string;
  /** Alt text for accessibility */
  alt?: string;
  /** Maximum number of times to play the animation (default: 4) */
  maxPlays?: number;
  /** Pause duration between plays in ms (default: 10000 = 10 seconds) */
  pauseDuration?: number;
}

/**
 * AnimatedAvatarPlayer - Plays animated avatar with controlled looping
 *
 * Behavior:
 * 1. Play video once
 * 2. Pause on first frame for pauseDuration
 * 3. Play again
 * 4. Repeat up to maxPlays times
 * 5. Stay paused on first frame after maxPlays
 */
export function AnimatedAvatarPlayer({
  src,
  className = "",
  alt = "Animated avatar",
  maxPlays = 4,
  pauseDuration = 10000,
}: AnimatedAvatarPlayerProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const playCountRef = React.useRef(0);
  const pauseTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const isVisibleRef = React.useRef(true);

  // Reset play count when src changes
  React.useEffect(() => {
    playCountRef.current = 0;
  }, [src]);

  // Handle video ended - pause then replay
  const handleEnded = React.useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    playCountRef.current += 1;

    // Check if we've reached max plays
    if (playCountRef.current >= maxPlays) {
      // Stay paused on first frame
      video.currentTime = 0;
      video.pause();
      return;
    }

    // Reset to first frame
    video.currentTime = 0;
    video.pause();

    // Clear any existing timeout
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }

    // Wait pauseDuration then play again (only if still visible)
    pauseTimeoutRef.current = setTimeout(() => {
      if (video && isVisibleRef.current && playCountRef.current < maxPlays) {
        video.play().catch(() => {
          // Ignore autoplay errors
        });
      }
    }, pauseDuration);
  }, [maxPlays, pauseDuration]);

  // Use Intersection Observer to track visibility
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting;

          if (entry.isIntersecting) {
            // Visible - start playing if we haven't exceeded max plays
            if (playCountRef.current < maxPlays) {
              video.play().catch(() => {});
            }
          } else {
            // Not visible - pause and clear timeout
            video.pause();
            if (pauseTimeoutRef.current) {
              clearTimeout(pauseTimeoutRef.current);
              pauseTimeoutRef.current = null;
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, [maxPlays]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, []);

  return (
    <video
      ref={videoRef}
      src={src}
      muted
      playsInline
      onEnded={handleEnded}
      className={className}
      aria-label={alt}
    />
  );
}
