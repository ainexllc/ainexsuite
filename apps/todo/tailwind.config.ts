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
        priority: {
          urgent: '#ef4444',
          high: '#f97316',
          medium: '#eab308',
          low: '#22c55e',
          none: '#71717a',
        },
      },
    },
  },
  plugins: [],
};

export default config;
