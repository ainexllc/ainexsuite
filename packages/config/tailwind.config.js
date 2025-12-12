const withOpacityValue = (variable) => `rgb(var(${variable}) / <alpha-value>)`;

const noteTones = [
  'white',
  'lemon',
  'peach',
  'tangerine',
  'mint',
  'fog',
  'lavender',
  'blush',
  'sky',
  'moss',
  'coal',
];

const noteColorSafelist = noteTones.flatMap((tone) => [
  `bg-note-${tone}`,
  `bg-note-${tone}-soft`,
  `hover:bg-note-${tone}`,
  `hover:bg-note-${tone}-soft`,
]);

const notePalette = {
  white: '#FFFFFF',
  'white-soft': '#F9FAFB',
  lemon: '#FEFEA1',
  'lemon-soft': '#FFFED2',
  peach: '#FEC4A3',
  'peach-soft': '#FFE1CE',
  tangerine: '#FFD27F',
  'tangerine-soft': '#FFE7BA',
  mint: '#BBF7D0',
  'mint-soft': '#DCFCE7',
  fog: '#E0ECFF',
  'fog-soft': '#EDF3FF',
  lavender: '#EAD8FF',
  'lavender-soft': '#F3E8FF',
  blush: '#FAD7E5',
  'blush-soft': '#FCE6EF',
  sky: '#CDE3FF',
  'sky-soft': '#E3F0FF',
  moss: '#D5F5C1',
  'moss-soft': '#E8FAD9',
  coal: '#4F5B66',
  'coal-soft': '#A1A8B0',
};

const sharedTheme = {
  extend: {
    colors: {
      // HSL-based theme system colors
      border: "hsl(var(--border))",
      input: "hsl(var(--input))",
      ring: "hsl(var(--ring))",
      background: "hsl(var(--background))",
      foreground: "hsl(var(--foreground))",
      primary: {
        DEFAULT: "hsl(var(--primary))",
        foreground: "hsl(var(--primary-foreground))",
      },
      secondary: {
        DEFAULT: "hsl(var(--secondary))",
        foreground: "hsl(var(--secondary-foreground))",
      },
      destructive: {
        DEFAULT: "hsl(var(--destructive))",
        foreground: "hsl(var(--destructive-foreground))",
      },
      muted: {
        DEFAULT: "hsl(var(--muted))",
        foreground: "hsl(var(--muted-foreground))",
      },
      accent: {
        DEFAULT: "hsl(var(--accent))",
        foreground: "hsl(var(--accent-foreground))",
      },
      popover: {
        DEFAULT: "hsl(var(--popover))",
        foreground: "hsl(var(--popover-foreground))",
      },
      card: {
        DEFAULT: "hsl(var(--card))",
        foreground: "hsl(var(--card-foreground))",
      },
      "app-primary": {
        DEFAULT: "hsl(var(--app-primary))",
        foreground: "hsl(var(--app-primary-foreground))",
      },
      "app-secondary": {
        DEFAULT: "hsl(var(--app-secondary))",
        foreground: "hsl(var(--app-secondary-foreground))",
      },
      // Legacy RGB-based colors (preserved for backward compatibility)
      surface: {
        DEFAULT: withOpacityValue('--color-surface-base'),
        base: withOpacityValue('--color-surface-base'),
        muted: withOpacityValue('--color-surface-muted'),
        elevated: withOpacityValue('--color-surface-elevated'),
        card: withOpacityValue('--color-surface-card'),
        hover: withOpacityValue('--color-surface-hover'),
        overlay: withOpacityValue('--color-surface-overlay'),
      },
      overlay: withOpacityValue('--color-surface-overlay'),
      outline: {
        subtle: withOpacityValue('--color-outline-subtle'),
        base: withOpacityValue('--color-outline-base'),
        strong: withOpacityValue('--color-outline-strong'),
      },
      ink: {
        50: withOpacityValue('--color-ink-50'),
        100: withOpacityValue('--color-ink-100'),
        200: withOpacityValue('--color-ink-200'),
        300: withOpacityValue('--color-ink-300'),
        400: withOpacityValue('--color-ink-400'),
        500: withOpacityValue('--color-ink-500'),
        600: withOpacityValue('--color-ink-600'),
        700: withOpacityValue('--color-ink-700'),
        800: withOpacityValue('--color-ink-800'),
        900: withOpacityValue('--color-ink-900'),
      },
      success: withOpacityValue('--color-success'),
      warning: withOpacityValue('--color-warning'),
      danger: withOpacityValue('--color-danger'),
      note: notePalette,
    },
    /**
     * Font Family Configuration
     *
     * Primary sans font (--font-primary): User-selectable
     * - Default: Plus Jakarta Sans
     * - Options: Inter, Geist, DM Sans, System (SF Pro)
     * - Changed via Settings > Appearance > Font
     *
     * Logo/Brand fonts: Kanit, Bebas Neue (DO NOT CHANGE)
     */
    fontFamily: {
      sans: ['var(--font-primary)', 'system-ui', 'sans-serif'],
      mono: ['var(--font-geist-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      brand: ['var(--font-kanit)', 'system-ui', 'sans-serif'],
      display: ['var(--font-kanit)', 'system-ui', 'sans-serif'],
      logo: ['var(--font-bebas-neue)', 'var(--font-kanit)', 'system-ui', 'sans-serif'],
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    spacing: {
      nav: '64px',
      'nav-panel': '280px',
      'settings-panel': '480px',
    },
    maxWidth: {
      container: 'var(--container-max-width-lg)',
      'container-xs': 'var(--container-max-width-xs)',
      'container-sm': 'var(--container-max-width-sm)',
      'container-md': 'var(--container-max-width-md)',
      'container-lg': 'var(--container-max-width-lg)',
      'container-xl': 'var(--container-max-width-xl)',
      'container-2xl': 'var(--container-max-width-2xl)',
      'container-3xl': 'var(--container-max-width-3xl)',
      'app-shell-xs': 'var(--app-shell-max-width-xs)',
      'app-shell-sm': 'var(--app-shell-max-width-sm)',
      'app-shell-md': 'var(--app-shell-max-width-md)',
      'app-shell-lg': 'var(--app-shell-max-width-lg)',
      'app-shell-xl': 'var(--app-shell-max-width-xl)',
      'app-shell-wide-sm': 'var(--app-shell-wide-max-width-sm)',
      'app-shell-wide-md': 'var(--app-shell-wide-max-width-md)',
      'app-shell-wide-lg': 'var(--app-shell-wide-max-width-lg)',
      'app-shell-wide-xl': 'var(--app-shell-wide-max-width-xl)',
      'note-board-sm': 'var(--note-board-max-width-sm)',
      'note-board-md': 'var(--note-board-max-width-md)',
      'note-board-lg': 'var(--note-board-max-width-lg)',
      'note-board-xl': 'var(--note-board-max-width-xl)',
    },
    borderRadius: {
      // HSL-based theme system radius
      lg: "var(--radius)",
      md: "calc(var(--radius) - 2px)",
      sm: "calc(var(--radius) - 4px)",
      // Legacy radius values (preserved for backward compatibility)
      'legacy-sm': 'var(--radius-sm)',
      'legacy-md': 'var(--radius-md)',
      'legacy-lg': 'var(--radius-lg)',
      xl: 'var(--radius-xl)',
      '3xl': '1.5rem',
    },
    boxShadow: {
      sm: 'var(--shadow-sm)',
      md: 'var(--shadow-md)',
      lg: 'var(--shadow-lg)',
      floating: '0 14px 30px -18px rgba(15, 23, 42, 0.45)',
      inset: 'inset 0 0 0 1px rgba(148, 163, 184, 0.2)',
    },
    backgroundImage: {
      'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      'grid-pattern':
        'linear-gradient(0deg, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
      'dots-pattern':
        'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
    },
    backgroundSize: {
      'grid-sm': '20px 20px',
      'grid-md': '40px 40px',
      'dots-sm': '15px 15px',
    },
  },
};

/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ["class"],
  content: [],
  safelist: noteColorSafelist,
  theme: sharedTheme,
  plugins: [],
};

module.exports = config;
module.exports.sharedTheme = sharedTheme;
