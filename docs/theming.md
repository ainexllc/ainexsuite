# Theming

Dark and light mode theming system implementation with automatic preference detection and localStorage persistence.

## Theme System Overview

**Features:**
- Dark mode by default
- Light mode support
- System preference detection
- LocalStorage persistence
- Smooth transitions
- CSS custom properties
- Tailwind dark mode integration

**Storage Key:** `notenex:theme` (customize for your app)

---

## Theme Provider Implementation

**File:** `src/components/providers/theme-provider.tsx`

### Context Structure

```tsx
export type ThemeMode = "dark" | "light";

type ThemeContextValue = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  isReady: boolean;
};
```

### Provider Component

```tsx
"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";

const THEME_STORAGE_KEY = "notenex:theme"; // Customize per app

function getPreferredTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "dark";
  }

  // Check localStorage first
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
  if (stored === "dark" || stored === "light") {
    return stored;
  }

  // Fall back to system preference
  const mediaQuery = typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;

  const prefersDark = mediaQuery?.matches ?? false;
  return prefersDark ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [isReady, setIsReady] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    const next = getPreferredTheme();
    setThemeState(next);
    setIsReady(true);
  }, []);

  // Apply theme to DOM
  useEffect(() => {
    if (!isReady) return;
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    const body = document.body;

    // Data attributes
    root.dataset.theme = theme;
    body.dataset.theme = theme;

    // Classes for Tailwind dark mode
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("theme-dark", theme === "dark");
    root.classList.toggle("theme-light", theme === "light");

    body.classList.toggle("theme-dark", theme === "dark");
    body.classList.toggle("theme-light", theme === "light");

    // Persist to localStorage
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme, isReady]);

  const setTheme = useCallback((nextTheme: ThemeMode) => {
    setThemeState(nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => prev === "dark" ? "light" : "dark");
  }, []);

  const value = useMemo(() => ({
    theme,
    setTheme,
    toggleTheme,
    isReady,
  }), [theme, setTheme, toggleTheme, isReady]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
```

---

## CSS Custom Properties

**File:** `src/app/globals.css`

### Dark Mode (Default)

```css
:root {
  /* Surfaces */
  --color-surface-base: 20 20 22;        /* #141416 */
  --color-surface-muted: 28 28 31;       /* #1C1C1F */
  --color-surface-elevated: 36 36 40;    /* #242428 */
  --color-surface-overlay: 10 10 12;     /* #0A0A0C */

  /* Outlines */
  --color-outline-subtle: 50 50 54;      /* #323236 */
  --color-outline-strong: 249 115 22;    /* #F97316 */

  /* Text (Ink) - Reversed in dark mode */
  --color-ink-50: 12 12 12;              /* Darkest */
  --color-ink-900: 247 247 250;          /* Lightest */
  /* ... other shades */

  /* Accent */
  --color-accent-500: 249 115 22;        /* #F97316 */
  /* ... other accent shades */

  /* Semantic */
  --color-success: 34 197 94;
  --color-warning: 250 204 21;
  --color-danger: 239 68 68;

  color-scheme: dark;
}
```

### Light Mode Override

```css
.theme-light {
  /* Surfaces */
  --color-surface-base: 250 251 252;     /* #FAFBFC */
  --color-surface-muted: 243 244 246;    /* #F3F4F6 */
  --color-surface-elevated: 255 255 255; /* #FFFFFF */
  --color-surface-overlay: 0 0 0;        /* #000000 */

  /* Outlines */
  --color-outline-subtle: 229 231 235;   /* #E5E7EB */
  --color-outline-strong: 249 115 22;    /* #F97316 */

  /* Text (Ink) - Reversed in light mode */
  --color-ink-50: 247 247 250;           /* Lightest */
  --color-ink-900: 12 12 12;             /* Darkest */
  /* ... other shades */

  /* Accent stays same */
  --color-accent-500: 249 115 22;

  /* Semantic - slightly adjusted */
  --color-success: 22 163 74;
  --color-warning: 217 119 6;
  --color-danger: 220 38 38;

  color-scheme: light;
}
```

---

## Tailwind Configuration

**File:** `tailwind.config.ts`

```ts
export default {
  darkMode: "class", // Use .dark class for dark mode
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: withOpacityValue("--color-surface-base"),
          muted: withOpacityValue("--color-surface-muted"),
          elevated: withOpacityValue("--color-surface-elevated"),
        },
        // ... other colors
      },
    },
  },
};
```

**Opacity Helper:**

```ts
const withOpacityValue = (variable: string): string => {
  return `rgb(var(${variable}) / <alpha-value>)`;
};
```

---

## Usage in Components

### Using Theme Hook

```tsx
import { useTheme } from "@/components/providers/theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme}>
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}
```

### Theme-Aware Styles

**Using Tailwind:**

```tsx
<div className="bg-surface-elevated text-ink-900 dark:bg-surface-muted">
  Content adapts to theme automatically
</div>
```

**Using CSS Custom Properties:**

```tsx
<div style={{ backgroundColor: "rgb(var(--color-surface-base))" }}>
  Direct CSS custom property usage
</div>
```

### Conditional Theme Logic

```tsx
const { theme } = useTheme();

const navBackgroundClass = theme === "dark"
  ? "bg-[#050507]/95"
  : "bg-white/92 border-b border-outline-subtle/60";

<header className={navBackgroundClass}>
```

---

## App Setup

### Provider Hierarchy

**File:** `src/app/layout.tsx`

```tsx
import { ThemeProvider } from "@/components/providers/theme-provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {/* Other providers */}
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Important:** Use `suppressHydrationWarning` on `<html>` to prevent hydration mismatch warnings from theme class changes.

---

## System Preference Detection

### Listening to System Changes

```tsx
useEffect(() => {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  const handleChange = (e: MediaQueryListEvent) => {
    if (!window.localStorage.getItem(THEME_STORAGE_KEY)) {
      // Only auto-switch if user hasn't set a preference
      setTheme(e.matches ? "dark" : "light");
    }
  };

  mediaQuery.addEventListener("change", handleChange);
  return () => mediaQuery.removeEventListener("change", handleChange);
}, [setTheme]);
```

---

## Theme Toggle UI Patterns

### Dropdown Menu Item

```tsx
<button
  onClick={toggleTheme}
  className="flex w-full items-center gap-2 px-3 py-2 hover:bg-surface-muted"
>
  {theme === "dark" ? (
    <Sun className="h-4 w-4" />
  ) : (
    <Moon className="h-4 w-4" />
  )}
  <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
</button>
```

### Icon Button

```tsx
<button
  onClick={toggleTheme}
  className="icon-button"
  aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
>
  {theme === "dark" ? (
    <Sun className="h-4 w-4" />
  ) : (
    <Moon className="h-4 w-4" />
  )}
</button>
```

### Settings Toggle

```tsx
<div className="flex items-center justify-between">
  <span>Dark mode</span>
  <button
    onClick={toggleTheme}
    className={clsx(
      "relative h-6 w-11 rounded-full transition",
      theme === "dark" ? "bg-accent-500" : "bg-ink-300"
    )}
  >
    <span
      className={clsx(
        "absolute top-0.5 h-5 w-5 rounded-full bg-white transition",
        theme === "dark" ? "left-5" : "left-0.5"
      )}
    />
  </button>
</div>
```

---

## Preventing Flash of Wrong Theme

### Script Injection

Add to `app/layout.tsx` before React renders:

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('notenex:theme') ||
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.classList.toggle('dark', theme === 'dark');
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

**Note:** This script runs before React hydration to prevent theme flash.

---

## Testing Theme

### Manual Testing

1. **Toggle theme** - Verify smooth transition
2. **Reload page** - Theme persists via localStorage
3. **Clear localStorage** - Falls back to system preference
4. **Change system preference** - Auto-detects (if no saved preference)
5. **Check all pages** - Theme applies consistently

### Test Cases

```tsx
describe("ThemeProvider", () => {
  it("defaults to dark mode", () => {
    render(<ThemeProvider><TestComponent /></ThemeProvider>);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("toggles theme", () => {
    const { getByRole } = render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    fireEvent.click(getByRole("button"));
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("persists theme to localStorage", () => {
    const { getByRole } = render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    fireEvent.click(getByRole("button"));
    expect(localStorage.getItem("notenex:theme")).toBe("light");
  });
});
```

---

## Customization for New Apps

### Change Storage Key

```tsx
// TaskNex
const THEME_STORAGE_KEY = "tasknex:theme";

// HabitNex
const THEME_STORAGE_KEY = "habitnex:theme";
```

### Default Theme

```tsx
// Default to light mode instead
function getPreferredTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "light"; // Changed from "dark"
  }
  // ... rest of function
}
```

### Additional Themes

Extend for multi-theme support:

```tsx
export type ThemeMode = "dark" | "light" | "auto" | "dim";

// Auto mode follows system
// Dim mode is a darker variant
```

---

## Accessibility

### Respect Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 0.01ms !important;
  }
}
```

### ARIA Labels

```tsx
<button
  onClick={toggleTheme}
  aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
  aria-pressed={theme === "dark"}
>
```

### Keyboard Navigation

Ensure theme toggle is keyboard accessible:

```tsx
<button
  onClick={toggleTheme}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleTheme();
    }
  }}
>
```

---

## Implementation Checklist

When setting up theming in a new app:

- [ ] Create ThemeProvider component with context
- [ ] Add theme CSS custom properties in globals.css
- [ ] Configure Tailwind `darkMode: "class"`
- [ ] Wrap app in ThemeProvider (in layout.tsx)
- [ ] Add `suppressHydrationWarning` to `<html>`
- [ ] Implement theme toggle UI
- [ ] Add theme flash prevention script
- [ ] Test localStorage persistence
- [ ] Test system preference detection
- [ ] Verify all colors adapt properly
- [ ] Test on all pages and components

---

**Next Steps:**
- [Design System →](./design-system.md) - Color tokens that adapt to theme
- [Components →](./components.md) - Theme-aware components
- [UI Patterns →](./ui-patterns.md) - Styling with theme support
