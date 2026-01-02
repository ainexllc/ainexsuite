'use client';

import { useEffect, useState } from 'react';
import {
  getVideoBackgroundByApp,
  type VideoBackgroundDoc,
} from '@ainexsuite/firebase';
import { VideoBackground, LayeredBackground } from '@ainexsuite/ui/components';

/**
 * Dynamic background that fetches and displays video background if assigned,
 * otherwise falls back to the standard LayeredBackground
 */
export function DynamicBackground() {
  const [videoBackground, setVideoBackground] = useState<VideoBackgroundDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchVideoBackground() {
      try {
        const video = await getVideoBackgroundByApp('journal');
        setVideoBackground(video);
      } catch (err) {
        console.warn('[DynamicBackground] Failed to fetch video background:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchVideoBackground();
  }, []);

  // Show fallback while loading or on error
  if (loading || error || !videoBackground) {
    return <LayeredBackground />;
  }

  // Show video background
  return (
    <VideoBackground
      src={videoBackground.downloadURL}
      poster={videoBackground.posterURL}
      overlayOpacity={videoBackground.recommendedOverlay ?? 0.4}
      fallbackComponent={<LayeredBackground />}
    />
  );
}
