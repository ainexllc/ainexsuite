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
        // Child-friendly celebration animations
        'bounce-once': 'bounce-once 0.5s ease-out',
        'bounce-slow': 'bounce 2s infinite',
        'spin-once': 'spin 0.5s ease-out',
        'confetti-particle': 'confetti-particle 1s ease-out forwards',
        'confetti-fall': 'confetti-fall 3s ease-out forwards',
        'sticker-pop': 'sticker-pop 0.5s ease-out',
        'star-burst': 'star-burst 1s ease-out',
        'star-shoot': 'star-shoot 1.5s ease-out infinite',
        'float-bubble': 'float-bubble 4s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        wiggle: 'wiggle 1s ease-in-out infinite',
        celebrate: 'celebrate 0.6s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'bounce-once': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
        'confetti-particle': {
          '0%': {
            opacity: '1',
            transform: 'translateY(0) rotate(0deg) scale(1)',
          },
          '100%': {
            opacity: '0',
            transform: 'translateY(-100px) rotate(360deg) scale(0.5)',
          },
        },
        'confetti-fall': {
          '0%': {
            opacity: '1',
            transform: 'translateY(0) rotate(0deg)',
          },
          '100%': {
            opacity: '0',
            transform: 'translateY(100vh) rotate(720deg)',
          },
        },
        'sticker-pop': {
          '0%': { transform: 'scale(0) rotate(-180deg)', opacity: '0' },
          '50%': { transform: 'scale(1.2) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        'star-burst': {
          '0%': { transform: 'scale(0) rotate(0deg)', opacity: '0' },
          '50%': { transform: 'scale(1.3) rotate(180deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(360deg)', opacity: '1' },
        },
        'star-shoot': {
          '0%': { transform: 'translateX(0) scale(0)', opacity: '0' },
          '50%': { transform: 'translateX(100px) scale(1)', opacity: '1' },
          '100%': { transform: 'translateX(200px) scale(0)', opacity: '0' },
        },
        'float-bubble': {
          '0%': { transform: 'translateY(100vh) scale(0.5)', opacity: '0' },
          '50%': { opacity: '0.3' },
          '100%': { transform: 'translateY(-100px) scale(1)', opacity: '0' },
        },
        'pulse-glow': {
          '0%, 100%': { textShadow: '0 0 20px rgba(255,255,255,0.5)' },
          '50%': { textShadow: '0 0 40px rgba(255,255,255,0.8), 0 0 60px rgba(255,255,255,0.4)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        celebrate: {
          '0%': { transform: 'scale(1)' },
          '25%': { transform: 'scale(1.05) rotate(-2deg)' },
          '50%': { transform: 'scale(1.08)' },
          '75%': { transform: 'scale(1.05) rotate(2deg)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
