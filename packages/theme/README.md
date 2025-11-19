# @ainexsuite/theme

Unified theme package for AinexSuite with support for orange/blue color schemes and dark/light modes.

## Features

- **Consistent Colors**: Orange (#f97316) and Blue (#3b82f6) across both themes
- **Light/Dark Mode**: Inverted surfaces and text, same theme colors
- **CSS Variables**: Full theming system with CSS custom properties
- **Tailwind Integration**: Preset configuration for seamless integration
- **Theme Toggle**: Ready-to-use toggle component
- **Type-Safe**: Full TypeScript support

## Installation

```bash
pnpm add @ainexsuite/theme
```

## Usage

### 1. Import CSS Variables

In your root layout (`app/layout.tsx`):

```tsx
import '@ainexsuite/theme/src/globals.css';
```

### 2. Add Theme Provider

Wrap your app with the ThemeProvider:

```tsx
import { ThemeProvider } from '@ainexsuite/theme';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 3. Configure Tailwind

In your `tailwind.config.js`:

```javascript
const themePreset = require('@ainexsuite/theme/tailwind.preset');

module.exports = {
  presets: [themePreset],
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    // ... other content paths
  ],
};
```

### 4. Use Theme Toggle

```tsx
import { ThemeToggle } from '@ainexsuite/theme';

export default function Header() {
  return (
    <header>
      <ThemeToggle />
    </header>
  );
}
```

### 5. Use Theme Hook

```tsx
'use client';

import { useTheme } from '@ainexsuite/theme';

export default function MyComponent() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      Current theme: {theme}
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('light')}>Light</button>
    </div>
  );
}
```

## Color Palette

### Primary (Orange)
- `--theme-primary`: #f97316 (Orange-500)
- `--theme-primary-light`: #fb923c (Orange-400)
- `--theme-primary-dark`: #ea580c (Orange-600)

### Secondary (Blue)
- `--theme-secondary`: #3b82f6 (Blue-500)
- `--theme-secondary-light`: #60a5fa (Blue-400)
- `--theme-secondary-dark`: #2563eb (Blue-600)

### Dark Mode Surfaces
- `--surface-base`: rgb(5, 5, 5)
- `--surface-elevated`: rgb(10, 10, 10)
- `--surface-overlay`: rgb(20, 20, 20)

### Light Mode Surfaces
- `--surface-base`: rgb(255, 255, 255)
- `--surface-elevated`: rgb(249, 250, 251)
- `--surface-overlay`: rgb(243, 244, 246)

## Tailwind Classes

The preset adds these utility classes:

```tsx
// Primary colors
<div className="bg-primary text-primary">Orange</div>
<div className="bg-primary-light">Light Orange</div>
<div className="bg-primary-dark">Dark Orange</div>

// Secondary colors
<div className="bg-secondary text-secondary">Blue</div>
<div className="bg-secondary-light">Light Blue</div>
<div className="bg-secondary-dark">Dark Blue</div>

// Surfaces
<div className="bg-surface-base">Base surface</div>
<div className="bg-surface-elevated">Elevated surface</div>
<div className="bg-surface-overlay">Overlay surface</div>

// Text
<div className="text-text-primary">Primary text</div>
<div className="text-text-secondary">Secondary text</div>
<div className="text-text-muted">Muted text</div>

// Borders
<div className="border border-border-primary">Primary border</div>
<div className="border border-border-secondary">Secondary border</div>
```

## Important Notes

- **Homepage**: Should NOT use dynamic theme colors (stays constant)
- **Workspace**: Uses theme colors for dynamic theming
- **Color Consistency**: Orange and Blue remain the same in both light and dark mode
- **Surface/Text Inversion**: Only surfaces and text colors change between modes

## Dependencies

- `next-themes`: ^0.4.4
- `lucide-react`: For icons in ThemeToggle

## License

Private package for AinexSuite
