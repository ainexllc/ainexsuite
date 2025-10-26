import type { Config } from 'tailwindcss';
import sharedConfig from '@ainexsuite/config/tailwind';

const config: Config = {
  presets: [sharedConfig],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        health: {
          good: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          info: '#3b82f6',
        },
      },
    },
  },
  plugins: [],
};

export default config;
