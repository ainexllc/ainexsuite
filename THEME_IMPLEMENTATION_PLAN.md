# AinexSuite Theme Implementation Plan
## Modern Light/Dark/System Mode (2025 Standards)

### Executive Summary

This plan implements a modern "Dimensional Minimalism" theme system following 2025 best practices:
- **Light Mode**: Crisp, technical feel with 1px borders and off-white backgrounds
- **Dark Mode**: Cinematic feel with zinc tones (no pure black) and lightness-based depth
- **System Mode**: Seamless auto-switching based on OS preference

---

## 1. Design Philosophy

### 1.1 Color Palette: "Zinc Standard"
Moving from neutral grays to **tinted neutrals** (Zinc - gray with hint of blue):

| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| **Background (Level 0)** | `#F9FAFB` (Zinc-50) | `#09090B` (Zinc-950) |
| **Surface (Level 1)** | `#FFFFFF` | `#18181B` (Zinc-900) |
| **Elevated (Level 2)** | `#FFFFFF` | `#27272A` (Zinc-800) |
| **Muted** | `#F4F4F5` (Zinc-100) | `#3F3F46` (Zinc-700) |
| **Border** | `#E4E4E7` (Zinc-200) | `#27272A` (Zinc-800) |

### 1.2 Text Hierarchy

| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| **Primary** | `#09090B` (Zinc-950) | `#FAFAFA` (Zinc-50) |
| **Secondary** | `#71717A` (Zinc-500) | `#A1A1AA` (Zinc-400) |
| **Muted** | `#A1A1AA` (Zinc-400) | `#71717A` (Zinc-500) |

### 1.3 Accent Colors (Per-App Branding)
Each app keeps its primary/secondary accent colors. In dark mode, they're **desaturated** by one shade level:

| App | Light Primary | Dark Primary | Light Secondary | Dark Secondary |
|-----|---------------|--------------|-----------------|----------------|
| **Main** | `#0EA5E9` (Sky-500) | `#38BDF8` (Sky-400) | `#6366F1` (Indigo-500) | `#818CF8` (Indigo-400) |
| **Journey** | `#F97316` (Orange-500) | `#FB923C` (Orange-400) | `#EC4899` (Pink-500) | `#F472B6` (Pink-400) |
| **Notes** | `#3B82F6` (Blue-500) | `#60A5FA` (Blue-400) | `#6366F1` (Indigo-500) | `#818CF8` (Indigo-400) |
| **Todo** | `#8B5CF6` (Violet-500) | `#A78BFA` (Violet-400) | `#F59E0B` (Amber-500) | `#FBBF24` (Amber-400) |
| **Grow** | `#14B8A6` (Teal-500) | `#2DD4BF` (Teal-400) | `#6366F1` (Indigo-500) | `#818CF8` (Indigo-400) |
| **Fit** | `#3B82F6` (Blue-500) | `#60A5FA` (Blue-400) | `#10B981` (Emerald-500) | `#34D399` (Emerald-400) |
| **Moments** | `#EC4899` (Pink-500) | `#F472B6` (Pink-400) | `#8B5CF6` (Violet-500) | `#A78BFA` (Violet-400) |
| **Pulse** | `#EF4444` (Red-500) | `#F87171` (Red-400) | `#F97316` (Orange-500) | `#FB923C` (Orange-400) |

### 1.4 Depth Philosophy

**Light Mode** (Borders > Shadows):
- Cards: `border: 1px solid var(--border)` + micro shadow
- Elevation via subtle background changes
- Shadow: `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)`

**Dark Mode** (Lightness = Elevation):
- No visible shadows (they're invisible on dark)
- Higher elements = lighter background color
- Border: subtle `var(--border)` for definition

---

## 2. Technical Architecture

### 2.1 CSS Variable System (HSL Format)

```css
:root {
  /* Semantic naming - values change based on theme */
  --background: 0 0% 98%;      /* Page background */
  --foreground: 240 10% 4%;    /* Primary text */

  --card: 0 0% 100%;           /* Card/panel surface */
  --card-foreground: 240 10% 4%;

  --popover: 0 0% 100%;        /* Dropdown/modal */
  --popover-foreground: 240 10% 4%;

  --primary: 240 6% 10%;       /* Primary actions */
  --primary-foreground: 0 0% 98%;

  --secondary: 240 5% 96%;     /* Secondary elements */
  --secondary-foreground: 240 6% 10%;

  --muted: 240 5% 96%;         /* Muted backgrounds */
  --muted-foreground: 240 4% 46%;

  --accent: 240 5% 96%;        /* Hover states */
  --accent-foreground: 240 6% 10%;

  --destructive: 0 84% 60%;    /* Error/danger */
  --destructive-foreground: 0 0% 98%;

  --border: 240 6% 90%;        /* Borders */
  --input: 240 6% 90%;         /* Input borders */
  --ring: 240 6% 10%;          /* Focus ring */

  --radius: 0.5rem;            /* Border radius base */

  /* App-specific accent (overridden per-app) */
  --app-primary: 24 95% 53%;       /* Orange default */
  --app-primary-foreground: 0 0% 100%;
  --app-secondary: 330 81% 60%;    /* Pink default */
  --app-secondary-foreground: 0 0% 100%;
}

.dark {
  --background: 240 10% 4%;
  --foreground: 0 0% 98%;

  --card: 240 10% 4%;
  --card-foreground: 0 0% 98%;

  --popover: 240 10% 4%;
  --popover-foreground: 0 0% 98%;

  --primary: 0 0% 98%;
  --primary-foreground: 240 6% 10%;

  --secondary: 240 4% 16%;
  --secondary-foreground: 0 0% 98%;

  --muted: 240 4% 16%;
  --muted-foreground: 240 5% 65%;

  --accent: 240 4% 16%;
  --accent-foreground: 0 0% 98%;

  --destructive: 0 63% 31%;
  --destructive-foreground: 0 0% 98%;

  --border: 240 4% 16%;
  --input: 240 4% 16%;
  --ring: 240 5% 84%;

  /* Desaturated accent colors for dark mode */
  --app-primary: 24 94% 64%;       /* Lighter orange */
  --app-primary-foreground: 0 0% 0%;
  --app-secondary: 330 76% 68%;    /* Lighter pink */
  --app-secondary-foreground: 0 0% 0%;
}
```

### 2.2 Tailwind Configuration

```js
// packages/config/tailwind.config.js
module.exports = {
  darkMode: ["class"],  // Critical for theme switching
  theme: {
    extend: {
      colors: {
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
        // App-specific accent colors
        "app-primary": {
          DEFAULT: "hsl(var(--app-primary))",
          foreground: "hsl(var(--app-primary-foreground))",
        },
        "app-secondary": {
          DEFAULT: "hsl(var(--app-secondary))",
          foreground: "hsl(var(--app-secondary-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
}
```

### 2.3 Theme Provider Setup

```tsx
// packages/theme/src/provider.tsx
"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="ainex-theme"
    >
      {children}
    </NextThemesProvider>
  );
}
```

### 2.4 Theme Toggle Component

```tsx
// packages/ui/src/components/theme/theme-switcher.tsx
"use client";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
      <button
        onClick={() => setTheme("light")}
        className={cn(
          "rounded-md p-2 transition-colors",
          theme === "light" ? "bg-background shadow-sm" : "hover:bg-accent"
        )}
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={cn(
          "rounded-md p-2 transition-colors",
          theme === "dark" ? "bg-background shadow-sm" : "hover:bg-accent"
        )}
      >
        <Moon className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={cn(
          "rounded-md p-2 transition-colors",
          theme === "system" ? "bg-background shadow-sm" : "hover:bg-accent"
        )}
      >
        <Monitor className="h-4 w-4" />
      </button>
    </div>
  );
}
```

---

## 3. Implementation Phases

### Phase 1: Foundation (CSS Variables & Tailwind)
**Files to modify:**
- `packages/ui/src/styles/globals.css` - New HSL-based variables
- `packages/config/tailwind.config.js` - Updated color mappings
- `packages/theme/tailwind.preset.js` - Deprecate or update

**Tasks:**
1. Create new CSS variables in HSL format
2. Add complete `.dark` class overrides
3. Update Tailwind config to use new variables
4. Test variable switching works

### Phase 2: Provider & Toggle
**Files to create/modify:**
- `packages/theme/src/provider.tsx` - Update ThemeProvider
- `packages/ui/src/components/theme/theme-switcher.tsx` - New component
- `packages/ui/src/components/theme/index.ts` - Exports

**Tasks:**
1. Update ThemeProvider with `defaultTheme="system"`
2. Create ThemeSwitcher component (Light/Dark/System)
3. Add to shared UI exports
4. Integrate into ProfileDropdown or TopNav

### Phase 3: App Integration
**Files to modify:**
- All `apps/*/src/app/layout.tsx` - Wrap with ThemeProvider
- All `apps/*/src/app/globals.css` - Update to new variable format
- Remove hardcoded `theme-dark` classes

**Tasks:**
1. Update each app's layout.tsx to use ThemeProvider
2. Update each app's globals.css with app-specific accent colors in HSL
3. Remove any hardcoded theme classes
4. Test theme switching in each app

### Phase 4: Component Updates
**Files to modify:**
- All components using hardcoded colors
- Background components (gradients, glows)
- Glass/blur effects

**Tasks:**
1. Update glassmorphism classes for both modes
2. Update background effects (aurora, glow) for light mode
3. Ensure all components use semantic color classes
4. Test visual consistency

### Phase 5: Polish & Persistence
**Tasks:**
1. Add theme preference to user settings (Firestore)
2. Sync theme across apps via shared storage
3. Add image brightness filter for dark mode
4. Test system preference switching
5. Add smooth transition animations (optional)

---

## 4. Migration Checklist

### Global Changes
- [ ] Update `packages/ui/src/styles/globals.css` with new HSL variables
- [ ] Update `packages/config/tailwind.config.js` with semantic colors
- [ ] Create `ThemeSwitcher` component in `packages/ui`
- [ ] Update `ThemeProvider` in `packages/theme`

### Per-App Changes
For each app (main, journey, notes, todo, grow, fit, moments, pulse, health, projects, workflow, calendar, admin):

- [ ] Update `layout.tsx` to wrap with ThemeProvider
- [ ] Update `globals.css` with app-specific accent colors (HSL)
- [ ] Remove hardcoded `theme-dark` or `theme-light` classes
- [ ] Add ThemeSwitcher to navigation (TopNav or ProfileDropdown)
- [ ] Test light/dark/system modes

### Component Updates
- [ ] Update `Card` components for light mode borders
- [ ] Update `Modal` components for both modes
- [ ] Update `Button` variants for both modes
- [ ] Update background effects (WorkspaceBackground, etc.)
- [ ] Update glassmorphism utilities

---

## 5. Breaking Changes & Deprecations

### Deprecated Variables
These will be removed after migration:
- `--color-surface-*` (RGB format) → Use `--background`, `--card`, etc.
- `--color-ink-*` → Use `--foreground`, `--muted-foreground`
- `--color-accent-*` → Use `--app-primary`, `--app-secondary`
- `--theme-primary/secondary` → Use `--app-primary/secondary`

### Class Changes
- `.theme-dark` / `.theme-light` → `.dark` / default (light)
- `bg-surface-*` → `bg-background`, `bg-card`, `bg-muted`
- `text-ink-*` → `text-foreground`, `text-muted-foreground`
- `border-outline-*` → `border-border`

### Backward Compatibility Period
Keep old variables as aliases for 2 weeks, then remove:
```css
/* Temporary aliases */
--color-surface-base: var(--background);
--color-ink-900: var(--foreground);
```

---

## 6. Testing Plan

### Visual Testing
1. Screenshot each app in light mode
2. Screenshot each app in dark mode
3. Compare with design specifications
4. Check contrast ratios (WCAG AA minimum)

### Functional Testing
1. Toggle between light/dark/system
2. Verify system preference is respected
3. Verify preference persists on refresh
4. Test across different browsers
5. Test on mobile devices

### Accessibility Testing
1. Run color contrast checker
2. Test with screen readers
3. Verify focus states in both modes
4. Check reduced motion preferences

---

## 7. Timeline Estimate

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Foundation | 2-3 hours | None |
| Phase 2: Provider & Toggle | 1-2 hours | Phase 1 |
| Phase 3: App Integration | 3-4 hours | Phase 2 |
| Phase 4: Component Updates | 2-3 hours | Phase 3 |
| Phase 5: Polish | 1-2 hours | Phase 4 |

**Total: ~10-14 hours of work**

---

## 8. Success Criteria

1. **Functional**: All 13 apps support light/dark/system modes
2. **Visual**: No pure black (#000) or pure white (#FFF) backgrounds
3. **Consistent**: Same theme across all apps (shared storage)
4. **Accessible**: WCAG AA contrast ratios in both modes
5. **Performant**: No flash on initial load (proper SSR handling)
6. **Persistent**: Theme preference survives refresh and app switches

---

## Approval Required

Please review this plan and confirm:

1. **Color Palette**: Zinc-based with app-specific accents - approved?
2. **HSL Format**: Switching from RGB to HSL for opacity support - approved?
3. **Default Theme**: `system` (follows OS) instead of `dark` - approved?
4. **Deprecation Timeline**: 2 weeks for old variables - approved?
5. **Implementation Order**: Phases 1-5 as outlined - approved?

Once approved, I'll begin implementation starting with Phase 1.
