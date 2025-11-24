import type { Config } from 'tailwindcss';
import sharedConfig from '@ainexsuite/config/tailwind';

const config: Config = {
  presets: [sharedConfig],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
    '../../packages/types/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        cursive: ['"Comic Sans MS"', '"Bradley Hand"', '"Brush Script MT"', 'cursive'],
      },
    },
  },
  plugins: [],
};

export default config;