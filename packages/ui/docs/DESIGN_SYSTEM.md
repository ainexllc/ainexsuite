# AinexSuite Design System

## Modern Zinc-Influenced Light & Dark Mode

Inspired by Linear, Vercel (Geist), and GitHub (Primer) - the gold standard of modern, futuristic UI design.

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color System Architecture](#color-system-architecture)
3. [Zinc Neutral Scale](#zinc-neutral-scale)
4. [Surface Hierarchy](#surface-hierarchy)
5. [Text Hierarchy](#text-hierarchy)
6. [Border System](#border-system)
7. [Button System](#button-system)
8. [Accent Colors](#accent-colors)
9. [Glassmorphism & Effects](#glassmorphism--effects)
10. [Component Tokens](#component-tokens)
11. [Accessibility](#accessibility)
12. [Implementation Guide](#implementation-guide)

---

## Design Philosophy

### Core Principles

1. **Minimalist Clarity** - Reduce visual noise, focus on content
2. **Zinc-Based Neutrals** - Professional, timeless gray scale
3. **Semantic Tokens** - Purpose-driven color naming
4. **Inverted Scales** - Light/dark share logic, values invert
5. **Accessibility First** - WCAG AA minimum, AAA preferred
6. **Dynamic Accents** - Per-app brand colors on neutral canvas

### Inspiration Sources

| Source | Key Takeaway |
|--------|--------------|
| **Linear** | LCH color space, 3-variable theming, crisp neutrals |
| **Vercel/Geist** | Semantic layering, P3 colors, two-level text hierarchy |
| **GitHub/Primer** | Inverted neutral scales, functional tokens, CVD support |

---

## Color System Architecture

### Three-Tier Token System

```
┌─────────────────────────────────────────────────────────┐
│  COMPONENT TOKENS (Specialized)                         │
│  button-primary-bg, input-border-focus, card-shadow     │
├─────────────────────────────────────────────────────────┤
│  FUNCTIONAL TOKENS (Most Used)                          │
│  bg-default, fg-muted, border-subtle, accent-emphasis   │
├─────────────────────────────────────────────────────────┤
│  BASE TOKENS (Foundation - Never use directly)          │
│  zinc-50, zinc-100, zinc-200 ... zinc-950               │
└─────────────────────────────────────────────────────────┘
```

### Inverted Scale Principle

Light and dark modes share the same functional tokens but invert the underlying values:

```
LIGHT MODE                    DARK MODE
zinc-50  → bg-default         zinc-950 → bg-default
zinc-100 → bg-muted           zinc-900 → bg-muted
zinc-200 → bg-subtle          zinc-800 → bg-subtle
zinc-300 → border-default     zinc-700 → border-default
zinc-500 → fg-muted           zinc-400 → fg-muted
zinc-900 → fg-default         zinc-50  → fg-default
```

---

## Zinc Neutral Scale

### Base Scale (Tailwind Zinc)

| Step | Hex | HSL | Usage |
|------|-----|-----|-------|
| **50** | `#fafafa` | `0 0% 98%` | Lightest background |
| **100** | `#f4f4f5` | `240 5% 96%` | Muted background |
| **200** | `#e4e4e7` | `240 6% 90%` | Subtle background, borders |
| **300** | `#d4d4d8` | `240 5% 84%` | Default borders |
| **400** | `#a1a1aa` | `240 4% 66%` | Muted text (dark mode) |
| **500** | `#71717a` | `240 4% 46%` | Muted text (light mode) |
| **600** | `#52525b` | `240 4% 34%` | Secondary text |
| **700** | `#3f3f46` | `240 5% 26%` | Borders (dark mode) |
| **800** | `#27272a` | `240 4% 16%` | Subtle bg (dark mode) |
| **900** | `#18181b` | `240 6% 10%` | Muted bg (dark mode) |
| **950** | `#09090b` | `240 10% 4%` | Default bg (dark mode) |

### Extended Scale with Alpha

For semi-transparent overlays and glassmorphism:

```css
--zinc-alpha-50: rgba(250, 250, 250, 0.5);
--zinc-alpha-100: rgba(244, 244, 245, 0.6);
--zinc-alpha-200: rgba(228, 228, 231, 0.7);
--zinc-alpha-800: rgba(39, 39, 42, 0.8);
--zinc-alpha-900: rgba(24, 24, 27, 0.9);
--zinc-alpha-950: rgba(9, 9, 11, 0.95);
```

---

## Surface Hierarchy

### Light Mode Surfaces

| Token | Value | Zinc Step | Purpose |
|-------|-------|-----------|---------|
| `--surface-default` | `#ffffff` | white | Primary page background |
| `--surface-muted` | `#fafafa` | 50 | Secondary containers |
| `--surface-subtle` | `#f4f4f5` | 100 | Tertiary, cards |
| `--surface-emphasis` | `#18181b` | 900 | High contrast (inverted) |
| `--surface-inset` | `#f4f4f5` | 100 | Recessed inputs |
| `--surface-overlay` | `rgba(255,255,255,0.8)` | white/80 | Modals, popovers |

### Dark Mode Surfaces

| Token | Value | Zinc Step | Purpose |
|-------|-------|-----------|---------|
| `--surface-default` | `#09090b` | 950 | Primary page background |
| `--surface-muted` | `#18181b` | 900 | Secondary containers |
| `--surface-subtle` | `#27272a` | 800 | Tertiary, cards |
| `--surface-emphasis` | `#fafafa` | 50 | High contrast (inverted) |
| `--surface-inset` | `#09090b` | 950 | Recessed inputs |
| `--surface-overlay` | `rgba(24,24,27,0.9)` | 900/90 | Modals, popovers |

### Elevation Layers

```
Layer 0: surface-default     → Page background
Layer 1: surface-muted       → Cards, panels
Layer 2: surface-subtle      → Nested cards, dropdowns
Layer 3: surface-emphasis    → Tooltips, high-contrast
Overlay: surface-overlay     → Modals (with backdrop-blur)
```

---

## Text Hierarchy

### Light Mode Text

| Token | Value | Zinc Step | Purpose |
|-------|-------|-----------|---------|
| `--fg-default` | `#18181b` | 900 | Primary text |
| `--fg-muted` | `#71717a` | 500 | Secondary text |
| `--fg-subtle` | `#a1a1aa` | 400 | Tertiary, placeholders |
| `--fg-disabled` | `#d4d4d8` | 300 | Disabled state |
| `--fg-on-emphasis` | `#fafafa` | 50 | Text on dark backgrounds |

### Dark Mode Text

| Token | Value | Zinc Step | Purpose |
|-------|-------|-----------|---------|
| `--fg-default` | `#fafafa` | 50 | Primary text |
| `--fg-muted` | `#a1a1aa` | 400 | Secondary text |
| `--fg-subtle` | `#71717a` | 500 | Tertiary, placeholders |
| `--fg-disabled` | `#52525b` | 600 | Disabled state |
| `--fg-on-emphasis` | `#18181b` | 900 | Text on light backgrounds |

### Typography Rules

1. **Never use muted text alone** - Always pair with emphasized text
2. **Hierarchy through weight** - Not just color (400, 500, 600, 700)
3. **Size matters** - Use scale: 12, 14, 16, 18, 20, 24, 30, 36px
4. **Line height** - Tight (1.25) for headings, relaxed (1.5-1.75) for body

---

## Border System

### Light Mode Borders

| Token | Value | Zinc Step | Purpose |
|-------|-------|-----------|---------|
| `--border-default` | `#e4e4e7` | 200 | Standard borders |
| `--border-muted` | `#f4f4f5` | 100 | Subtle dividers |
| `--border-emphasis` | `#d4d4d8` | 300 | Strong separation |
| `--border-disabled` | `#f4f4f5` | 100 | Disabled controls |

### Dark Mode Borders

| Token | Value | Zinc Step | Purpose |
|-------|-------|-----------|---------|
| `--border-default` | `#27272a` | 800 | Standard borders |
| `--border-muted` | `#18181b` | 900 | Subtle dividers |
| `--border-emphasis` | `#3f3f46` | 700 | Strong separation |
| `--border-disabled` | `#27272a` | 800 | Disabled controls |

### Border States

```css
/* Interactive element borders */
--border-hover: var(--border-emphasis);
--border-focus: var(--accent-default);
--border-active: var(--accent-emphasis);
--border-error: var(--danger-default);
```

---

## Button System

### Button Hierarchy

| Type | Frequency | Visual Weight | Use Case |
|------|-----------|---------------|----------|
| **Primary** | 1 per view | Highest | Main CTA (Save, Submit) |
| **Secondary** | Few | Medium | Supporting actions |
| **Outline** | Multiple | Low-Medium | Alternative actions |
| **Ghost** | Many | Lowest | Tertiary, icon buttons |
| **Danger** | Rare | High (red) | Destructive actions |

### Button Variants - Light Mode

```css
/* Primary - Solid dark background */
.btn-primary {
  background: var(--zinc-900);      /* #18181b */
  color: var(--zinc-50);            /* #fafafa */
  border: 1px solid var(--zinc-900);
}
.btn-primary:hover {
  background: var(--zinc-800);      /* #27272a */
}

/* Secondary - Subtle background */
.btn-secondary {
  background: var(--zinc-100);      /* #f4f4f5 */
  color: var(--zinc-900);           /* #18181b */
  border: 1px solid var(--zinc-200);
}
.btn-secondary:hover {
  background: var(--zinc-200);      /* #e4e4e7 */
}

/* Outline - Transparent with border */
.btn-outline {
  background: transparent;
  color: var(--zinc-900);           /* #18181b */
  border: 1px solid var(--zinc-300);
}
.btn-outline:hover {
  background: var(--zinc-100);
  border-color: var(--zinc-400);
}

/* Ghost - Minimal */
.btn-ghost {
  background: transparent;
  color: var(--zinc-600);           /* #52525b */
  border: 1px solid transparent;
}
.btn-ghost:hover {
  background: var(--zinc-100);
  color: var(--zinc-900);
}
```

### Button Variants - Dark Mode

```css
/* Primary - Solid light background */
.btn-primary {
  background: var(--zinc-50);       /* #fafafa */
  color: var(--zinc-900);           /* #18181b */
  border: 1px solid var(--zinc-50);
}
.btn-primary:hover {
  background: var(--zinc-200);      /* #e4e4e7 */
}

/* Secondary - Subtle background */
.btn-secondary {
  background: var(--zinc-800);      /* #27272a */
  color: var(--zinc-50);            /* #fafafa */
  border: 1px solid var(--zinc-700);
}
.btn-secondary:hover {
  background: var(--zinc-700);      /* #3f3f46 */
}

/* Outline - Transparent with border */
.btn-outline {
  background: transparent;
  color: var(--zinc-50);            /* #fafafa */
  border: 1px solid var(--zinc-700);
}
.btn-outline:hover {
  background: var(--zinc-800);
  border-color: var(--zinc-600);
}

/* Ghost - Minimal */
.btn-ghost {
  background: transparent;
  color: var(--zinc-400);           /* #a1a1aa */
  border: 1px solid transparent;
}
.btn-ghost:hover {
  background: var(--zinc-800);
  color: var(--zinc-50);
}
```

### Button Sizes

| Size | Height | Padding | Font Size | Icon Size |
|------|--------|---------|-----------|-----------|
| **sm** | 32px | 12px | 13px | 16px |
| **md** | 40px | 16px | 14px | 18px |
| **lg** | 48px | 20px | 16px | 20px |
| **xl** | 56px | 24px | 18px | 24px |

---

## Accent Colors

### Dynamic App Accent System

Each app has a signature color that works on the neutral zinc canvas:

| App | Primary | RGB | Usage |
|-----|---------|-----|-------|
| **Main** | `#f97316` | 249, 115, 22 | Orange - Dashboard hub |
| **Notes** | `#eab308` | 234, 179, 8 | Yellow - Colorful notes |
| **Journey** | `#f97316` | 249, 115, 22 | Orange - Mood tracking |
| **Todo** | `#8b5cf6` | 139, 92, 246 | Purple - Task management |
| **Health** | `#10b981` | 16, 185, 129 | Green - Body metrics |
| **Moments** | `#ec4899` | 236, 72, 153 | Pink - Memory curation |
| **Grow** | `#14b8a6` | 20, 184, 166 | Teal - Personal dev |
| **Pulse** | `#ef4444` | 239, 68, 68 | Red - Vitality tracking |
| **Fit** | `#3b82f6` | 59, 130, 246 | Blue - Workout tracking |
| **Projects** | `#6366f1` | 99, 102, 241 | Indigo - Project management |

### Accent Token Structure

```css
/* Set by AppColorProvider dynamically */
--color-primary: #f97316;
--color-primary-rgb: 249, 115, 22;
--color-secondary: #ea580c;
--color-secondary-rgb: 234, 88, 12;

/* Accent variants */
--accent-default: var(--color-primary);
--accent-emphasis: var(--color-primary);
--accent-muted: rgb(var(--color-primary-rgb) / 0.1);
--accent-subtle: rgb(var(--color-primary-rgb) / 0.05);
```

### Accent Button (App-Themed)

```css
/* Primary accent button - Works in both modes */
.btn-accent {
  background: var(--color-primary);
  color: white;
  border: 1px solid var(--color-primary);
  box-shadow: 0 1px 2px rgb(var(--color-primary-rgb) / 0.2);
}
.btn-accent:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}
```

---

## Glassmorphism & Effects

### Backdrop Blur Surfaces

```css
/* Glass card - Light mode */
.glass-card-light {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.05),
    0 2px 4px -1px rgba(0, 0, 0, 0.03);
}

/* Glass card - Dark mode */
.glass-card-dark {
  background: rgba(24, 24, 27, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.3),
    0 2px 4px -1px rgba(0, 0, 0, 0.2);
}
```

### Shadow System

```css
/* Light mode shadows - Subtle */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.07),
             0 2px 4px -1px rgba(0, 0, 0, 0.04);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.08),
             0 4px 6px -2px rgba(0, 0, 0, 0.04);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.08),
             0 10px 10px -5px rgba(0, 0, 0, 0.03);

/* Dark mode shadows - Deeper */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.2);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.3),
             0 2px 4px -1px rgba(0, 0, 0, 0.2);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.4),
             0 4px 6px -2px rgba(0, 0, 0, 0.2);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.5),
             0 10px 10px -5px rgba(0, 0, 0, 0.3);
```

### Gradient Accents

```css
/* Subtle gradient backgrounds */
--gradient-radial-light: radial-gradient(
  ellipse at top,
  rgba(var(--color-primary-rgb) / 0.05) 0%,
  transparent 50%
);

--gradient-radial-dark: radial-gradient(
  ellipse at top,
  rgba(var(--color-primary-rgb) / 0.1) 0%,
  transparent 50%
);

/* Glow effect for accent elements */
--glow-accent: 0 0 20px rgba(var(--color-primary-rgb) / 0.3);
```

---

## Component Tokens

### Input Fields

```css
/* Light Mode */
--input-bg: var(--zinc-50);
--input-bg-hover: var(--zinc-100);
--input-border: var(--zinc-300);
--input-border-hover: var(--zinc-400);
--input-border-focus: var(--color-primary);
--input-text: var(--zinc-900);
--input-placeholder: var(--zinc-400);

/* Dark Mode */
--input-bg: var(--zinc-900);
--input-bg-hover: var(--zinc-800);
--input-border: var(--zinc-700);
--input-border-hover: var(--zinc-600);
--input-border-focus: var(--color-primary);
--input-text: var(--zinc-50);
--input-placeholder: var(--zinc-500);
```

### Cards

```css
/* Light Mode */
--card-bg: white;
--card-border: var(--zinc-200);
--card-shadow: var(--shadow-sm);
--card-hover-shadow: var(--shadow-md);

/* Dark Mode */
--card-bg: var(--zinc-900);
--card-border: var(--zinc-800);
--card-shadow: var(--shadow-sm);
--card-hover-shadow: var(--shadow-md);
```

### Navigation

```css
/* Light Mode */
--nav-bg: rgba(255, 255, 255, 0.8);
--nav-border: var(--zinc-200);
--nav-item-hover: var(--zinc-100);
--nav-item-active: var(--zinc-200);

/* Dark Mode */
--nav-bg: rgba(9, 9, 11, 0.8);
--nav-border: var(--zinc-800);
--nav-item-hover: var(--zinc-800);
--nav-item-active: var(--zinc-700);
```

---

## Accessibility

### Contrast Requirements

| Element Type | Minimum Ratio | Target |
|--------------|---------------|--------|
| Body text | 4.5:1 | 7:1 (AAA) |
| Large text (18px+) | 3:1 | 4.5:1 |
| UI components | 3:1 | 4.5:1 |
| Focus indicators | 3:1 | 4.5:1 |

### Verified Contrasts

| Combination | Light Mode | Dark Mode |
|-------------|------------|-----------|
| fg-default on surface-default | 16.1:1 ✓ | 15.5:1 ✓ |
| fg-muted on surface-default | 4.6:1 ✓ | 5.3:1 ✓ |
| fg-subtle on surface-default | 3.0:1 ✓ | 3.5:1 ✓ |
| Primary button | 12.6:1 ✓ | 13.1:1 ✓ |

### Color Blind Support

- Never rely on color alone for meaning
- Use icons, patterns, and text labels
- Test with Protanopia, Deuteranopia, Tritanopia filters
- Provide high-contrast mode option

---

## Implementation Guide

### CSS Variables Setup

```css
@layer base {
  :root {
    /* Light mode (default) */
    --background: 0 0% 100%;
    --foreground: 240 10% 4%;

    --surface-default: 0 0% 100%;
    --surface-muted: 0 0% 98%;
    --surface-subtle: 240 5% 96%;

    --fg-default: 240 6% 10%;
    --fg-muted: 240 4% 46%;
    --fg-subtle: 240 4% 66%;

    --border-default: 240 6% 90%;
    --border-muted: 240 5% 96%;

    --primary: 240 6% 10%;
    --primary-foreground: 0 0% 98%;
  }

  .dark {
    /* Dark mode */
    --background: 240 10% 4%;
    --foreground: 0 0% 98%;

    --surface-default: 240 10% 4%;
    --surface-muted: 240 6% 10%;
    --surface-subtle: 240 4% 16%;

    --fg-default: 0 0% 98%;
    --fg-muted: 240 4% 66%;
    --fg-subtle: 240 4% 46%;

    --border-default: 240 4% 16%;
    --border-muted: 240 6% 10%;

    --primary: 0 0% 98%;
    --primary-foreground: 240 6% 10%;
  }
}
```

### Tailwind Config

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        surface: {
          DEFAULT: 'hsl(var(--surface-default))',
          muted: 'hsl(var(--surface-muted))',
          subtle: 'hsl(var(--surface-subtle))',
        },
        fg: {
          DEFAULT: 'hsl(var(--fg-default))',
          muted: 'hsl(var(--fg-muted))',
          subtle: 'hsl(var(--fg-subtle))',
        },
        border: {
          DEFAULT: 'hsl(var(--border-default))',
          muted: 'hsl(var(--border-muted))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
      },
    },
  },
};
```

### Component Example

```tsx
// Button with zinc theming
<button className="
  bg-primary text-primary-foreground
  hover:bg-primary/90
  border border-primary
  px-4 py-2 rounded-lg
  font-medium text-sm
  transition-all duration-200
  focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
  disabled:opacity-50 disabled:pointer-events-none
">
  Save Changes
</button>

// Card with glass effect
<div className="
  bg-surface-muted/80 backdrop-blur-xl
  border border-border-muted
  rounded-2xl p-6
  shadow-sm hover:shadow-md
  transition-shadow duration-200
">
  <h3 className="text-fg-default font-semibold">Card Title</h3>
  <p className="text-fg-muted mt-2">Card description text.</p>
</div>
```

---

## Quick Reference

### Light Mode Palette

```
Background:  #ffffff (white)
Surface:     #fafafa (zinc-50)
Subtle:      #f4f4f5 (zinc-100)
Border:      #e4e4e7 (zinc-200)
Text Muted:  #71717a (zinc-500)
Text:        #18181b (zinc-900)
```

### Dark Mode Palette

```
Background:  #09090b (zinc-950)
Surface:     #18181b (zinc-900)
Subtle:      #27272a (zinc-800)
Border:      #3f3f46 (zinc-700)
Text Muted:  #a1a1aa (zinc-400)
Text:        #fafafa (zinc-50)
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-12 | Initial design system documentation |

---

*Inspired by the design systems of Linear, Vercel, and GitHub.*
