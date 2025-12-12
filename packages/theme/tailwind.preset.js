module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgb(var(--theme-primary) / <alpha-value>)',
          light: 'rgb(var(--theme-primary-light) / <alpha-value>)',
          dark: 'rgb(var(--theme-primary-dark) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--theme-secondary) / <alpha-value>)',
          light: 'rgb(var(--theme-secondary-light) / <alpha-value>)',
          dark: 'rgb(var(--theme-secondary-dark) / <alpha-value>)',
        },
        surface: {
          base: 'rgb(var(--surface-base) / <alpha-value>)',
          elevated: 'rgb(var(--surface-elevated) / <alpha-value>)',
          overlay: 'rgb(var(--surface-overlay) / <alpha-value>)',
        },
        text: {
          primary: 'rgb(var(--text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--text-secondary))',
          muted: 'rgb(var(--text-muted))',
        },
        border: {
          primary: 'rgb(var(--border-primary))',
          secondary: 'rgb(var(--border-secondary))',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        brand: ['var(--font-kanit)', 'system-ui', 'sans-serif'],
        display: ['var(--font-kanit)', 'system-ui', 'sans-serif'],
        logo: ['var(--font-bebas-neue)', 'var(--font-kanit)', 'system-ui', 'sans-serif'],
      },
    },
  },
};
