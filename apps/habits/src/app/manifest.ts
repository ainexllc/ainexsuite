import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Grow - Habit Tracker',
    short_name: 'Grow',
    description: 'Build unbreakable habits with streaks, gamification, and accountability partners.',
    start_url: '/workspace',
    display: 'standalone',
    background_color: '#050505',
    theme_color: '#8b5cf6',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    categories: ['productivity', 'health', 'lifestyle'],
  };
}
