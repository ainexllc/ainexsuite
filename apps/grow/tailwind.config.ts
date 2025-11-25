import type { Config } from 'tailwindcss';
import sharedConfig from '@ainexsuite/config/tailwind';

const config: Config = {
  presets: [sharedConfig],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
    '../../packages/types/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        skill: {
          beginner: '#ef4444',
          intermediate: '#f59e0b',
          advanced: '#10b981',
          expert: '#3b82f6',
          master: '#8b5cf6',
        },
      },
      animation: {
        shimmer: 'shimmer 0.6s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
