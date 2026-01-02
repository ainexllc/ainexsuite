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
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
    categories: ['productivity', 'health', 'lifestyle'],
  };
}
