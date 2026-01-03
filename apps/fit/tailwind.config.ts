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
        // Fit App Primary Accent - Bold Blue
        accent: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Primary accent
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        fitness: {
          workout: '#3b82f6', // Blue - workouts
          nutrition: '#22c55e', // Green - nutrition/food
          water: '#06b6d4', // Cyan - hydration
          supplements: '#f59e0b', // Amber - supplements
          weight: '#8b5cf6', // Purple - body metrics
          recipes: '#ec4899', // Pink - recipes
        },
      },
    },
  },
  plugins: [],
};

export default config;
