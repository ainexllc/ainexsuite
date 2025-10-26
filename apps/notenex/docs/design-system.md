# Design System

Complete design token reference for building identical AiNex applications. Every color, spacing, typography, and shadow value used throughout the NoteNex application.

## Table of Contents

- [Color Palette](#color-palette)
- [Typography](#typography)
- [Spacing & Sizing](#spacing--sizing)
- [Border Radius](#border-radius)
- [Shadows](#shadows)
- [Breakpoints](#breakpoints)
- [Container Widths](#container-widths)
- [Z-Index Scale](#z-index-scale)
- [CSS Custom Properties](#css-custom-properties)

---

## Color Palette

### Accent Color (Primary Orange)

Used for primary interactions, CTAs, active states, and highlights.

| Shade | RGB | Hex | CSS Variable | Usage |
|-------|-----|-----|--------------|-------|
| 50 | `255 247 237` | `#FFF7ED` | `--color-accent-50` | Lightest backgrounds |
| 100 | `255 237 213` | `#FFEDD5` | `--color-accent-100` | Hover backgrounds |
| 200 | `254 215 170` | `#FED7AA` | `--color-accent-200` | Soft highlights |
| 300 | `253 186 116` | `#FDBA74` | `--color-accent-300` | Subtle accents |
| 400 | `251 146 60` | `#FB923C` | `--color-accent-400` | Hover states |
| 500 | `249 115 22` | `#F97316` | `--color-accent-500` | **Primary accent** |
| 600 | `234 88 12` | `#EA580C` | `--color-accent-600` | Pressed states |
| 700 | `194 65 12` | `#C2410C` | `--color-accent-700` | Dark accent |
| 800 | `154 52 18` | `#9A3412` | `--color-accent-800` | Deeper accent |
| 900 | `124 45 18` | `#7C2D12` | `--color-accent-900` | Darkest accent |

**Tailwind Classes:**
- `text-accent` / `bg-accent` - Default 500
- `text-accent-400` / `bg-accent-400` - Hover states
- `border-accent-500` - Borders and outlines

**Usage Examples:**
```tsx
// Primary button
<button className="bg-accent-500 hover:bg-accent-400 text-white">

// Active navigation item
<div className="border-l-2 border-accent-500 bg-accent-50">

// Icon highlight
<Icon className="text-accent-500" />
```

---

### Surface Colors

Background and surface colors for dark and light modes.

#### Dark Mode (Default)

| Token | RGB | Hex | CSS Variable | Usage |
|-------|-----|-----|--------------|-------|
| Base | `20 20 22` | `#141416` | `--color-surface-base` | Main background |
| Muted | `28 28 31` | `#1C1C1F` | `--color-surface-muted` | Secondary surfaces |
| Elevated | `36 36 40` | `#242428` | `--color-surface-elevated` | Cards, modals, panels |
| Overlay | `10 10 12` | `#0A0A0C` | `--color-surface-overlay` | Modal backdrops |

#### Light Mode

| Token | RGB | Hex | CSS Variable | Usage |
|-------|-----|-----|--------------|-------|
| Base | `250 251 252` | `#FAFBFC` | `--color-surface-base` | Main background |
| Muted | `243 244 246` | `#F3F4F6` | `--color-surface-muted` | Secondary surfaces |
| Elevated | `255 255 255` | `#FFFFFF` | `--color-surface-elevated` | Cards, modals, panels |
| Overlay | `0 0 0` | `#000000` | `--color-surface-overlay` | Modal backdrops |

**Tailwind Classes:**
- `bg-surface` - Base background
- `bg-surface-muted` - Secondary background
- `bg-surface-elevated` - Elevated surfaces

**Usage Examples:**
```tsx
// Page background
<body className="bg-surface">

// Card
<div className="bg-surface-elevated border border-outline-subtle">

// Modal backdrop
<div className="bg-overlay/60 backdrop-blur-sm">
```

---

### Ink Colors (Text)

Text colors with automatic theme reversal. In dark mode, 900 is lightest; in light mode, 900 is darkest.

#### Dark Mode

| Shade | RGB | Hex | Usage |
|-------|-----|-----|-------|
| 50 | `12 12 12` | `#0C0C0C` | Barely visible |
| 100 | `24 24 24` | `#181818` | Very subtle |
| 200 | `45 45 45` | `#2D2D2D` | Subtle |
| 300 | `72 72 78` | `#48484E` | Muted |
| 400 | `110 110 120` | `#6E6E78` | Disabled |
| 500 | `158 158 170` | `#9E9EAA` | Placeholder |
| 600 | `196 196 208` | `#C4C4D0` | Secondary text |
| 700 | `222 222 230` | `#DEDEE6` | Body text |
| 800 | `240 240 245` | `#F0F0F5` | Important text |
| 900 | `247 247 250` | `#F7F7FA` | **Primary text** |

#### Light Mode

| Shade | RGB | Hex | Usage |
|-------|-----|-----|-------|
| 50 | `247 247 250` | `#F7F7FA` | Barely visible |
| 100 | `240 240 245` | `#F0F0F5` | Very subtle |
| 200 | `222 222 230` | `#DEDEE6` | Subtle |
| 300 | `196 196 208` | `#C4C4D0` | Muted |
| 400 | `158 158 170` | `#9E9EAA` | Disabled |
| 500 | `110 110 120` | `#6E6E78` | Placeholder |
| 600 | `72 72 78` | `#48484E` | Secondary text |
| 700 | `45 45 45` | `#2D2D2D` | Body text |
| 800 | `24 24 24` | `#181818` | Important text |
| 900 | `12 12 12` | `#0C0C0C` | **Primary text** |

**Tailwind Classes:**
- `text-ink-900` - Primary text (auto-adapts)
- `text-ink-600` - Secondary text
- `text-ink-500` - Muted/placeholder text
- `text-ink-400` - Disabled text

**Usage Examples:**
```tsx
// Primary heading
<h1 className="text-ink-900 font-semibold">

// Body text
<p className="text-ink-700">

// Secondary/muted text
<span className="text-ink-600">

// Placeholder
<input placeholder="..." className="placeholder:text-ink-500">
```

---

### Outline Colors

Border and divider colors.

| Token | RGB (Dark) | RGB (Light) | CSS Variable | Usage |
|-------|------------|-------------|--------------|-------|
| Subtle | `50 50 54` | `229 231 235` | `--color-outline-subtle` | Borders, dividers |
| Strong | `249 115 22` | `249 115 22` | `--color-outline-strong` | Active borders, focus |

**Tailwind Classes:**
- `border-outline-subtle` - Default borders
- `border-outline-strong` - Active/focused borders

**Usage Examples:**
```tsx
// Card border
<div className="border border-outline-subtle">

// Active border
<div className="border-l-2 border-outline-strong">
```

---

### Semantic Colors

Status and feedback colors (same in dark/light modes).

| Color | RGB | Hex | CSS Variable | Usage |
|-------|-----|-----|--------------|-------|
| Success | `34 197 94` | `#22C55E` | `--color-success` | Positive feedback, completed |
| Warning | `250 204 21` | `#FACC15` | `--color-warning` | Caution, alerts |
| Danger | `239 68 68` | `#EF4444` | `--color-danger` | Errors, destructive actions |

**Light Mode Adjustments:**
- Success: `22 163 74` (`#16A34A`)
- Warning: `217 119 6` (`#D97706`)
- Danger: `220 38 38` (`#DC2626`)

**Tailwind Classes:**
- `text-success` / `bg-success`
- `text-warning` / `bg-warning`
- `text-danger` / `bg-danger`

**Usage Examples:**
```tsx
// Success message
<div className="text-success bg-success/10 border border-success/20">

// Error state
<input className="border-danger focus:ring-danger">
```

---

### Note Colors

12 themed colors for notes/items with soft and dark variants.

| Color | Base Hex | Soft Hex | Dark Hex | Usage |
|-------|----------|----------|----------|-------|
| White | `#FFFFFF` | `#F9FAFB` | `#2B2B2B` | Default/clean |
| Lemon | `#FEFEA1` | `#FFFED2` | `#5D5C3D` | Yellow/bright |
| Peach | `#FEC4A3` | `#FFE1CE` | `#5E4838` | Warm orange |
| Tangerine | `#FFD27F` | `#FFE7BA` | `#5F4E35` | Orange |
| Mint | `#BBF7D0` | `#DCFCE7` | `#345940` | Green/fresh |
| Fog | `#E0ECFF` | `#EDF3FF` | `#384A5E` | Light blue |
| Lavender | `#EAD8FF` | `#F3E8FF` | `#4E3D5E` | Purple |
| Blush | `#FAD7E5` | `#FCE6EF` | `#5E3848` | Pink |
| Sky | `#CDE3FF` | `#E3F0FF` | `#38495E` | Blue |
| Moss | `#D5F5C1` | `#E8FAD9` | `#3F5338` | Green |
| Coal | `#4F5B66` | `#A1A8B0` | `#1E2428` | Gray/dark |

**Tailwind Classes:**
- `bg-note-{color}` - Base color (light mode)
- `bg-note-{color}-soft` - Softer variant
- `dark:bg-note-{color}-dark` - Dark mode variant

**Usage Examples:**
```tsx
// Note card with color
<div className="bg-note-lemon dark:bg-note-lemon-dark">

// Soft background
<div className="bg-note-mint-soft">
```

---

## Typography

### Font Families

| Family | CSS Variable | Font | Usage |
|--------|--------------|------|-------|
| Sans-serif | `--font-geist-sans` | Geist Sans | Body text, UI |
| Monospace | `--font-geist-mono` | Geist Mono | Code, data |
| Branding | `--font-kanit` | Kanit | Logo, headings |

**Tailwind Classes:**
- `font-sans` - Default UI font (Geist Sans)
- `font-mono` - Code/monospace (Geist Mono)

**Font Loading:**
```tsx
// app/layout.tsx
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Kanit } from "next/font/google";

const kanit = Kanit({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-kanit",
});
```

---

### Font Sizes

| Class | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `text-xs` | 12px (0.75rem) | 16px (1rem) | Tiny labels, badges |
| `text-sm` | 14px (0.875rem) | 20px (1.25rem) | Secondary text, captions |
| `text-base` | 16px (1rem) | 24px (1.5rem) | Body text |
| `text-lg` | 18px (1.125rem) | 28px (1.75rem) | Large body |
| `text-xl` | 20px (1.25rem) | 28px (1.75rem) | H4 headings |
| `text-2xl` | 24px (1.5rem) | 32px (2rem) | H3 headings |
| `text-3xl` | 30px (1.875rem) | 36px (2.25rem) | H2 headings |
| `text-4xl` | 36px (2.25rem) | 40px (2.5rem) | H1 headings |

**Usage Examples:**
```tsx
// Page title
<h1 className="text-3xl font-semibold text-ink-900">

// Section heading
<h2 className="text-xl font-medium text-ink-800">

// Body text
<p className="text-base text-ink-700">

// Small label
<span className="text-xs uppercase tracking-wide text-ink-500">
```

---

### Font Weights

| Class | Weight | Usage |
|-------|--------|-------|
| `font-normal` | 400 | Body text |
| `font-medium` | 500 | Emphasis, labels |
| `font-semibold` | 600 | Headings, buttons |
| `font-bold` | 700 | Strong headings, branding |

---

### Logo Typography

```tsx
// Logo wordmark (Kanit font)
<div className="font-kanit font-bold text-2xl">
  <span className="text-accent-500">Note</span>
  <span className="text-ink-900">Nex</span>
</div>
```

---

## Spacing & Sizing

Tailwind's default spacing scale (4px base unit):

| Class | Value | Usage |
|-------|-------|-------|
| `p-1`, `m-1` | 4px | Minimal spacing |
| `p-2`, `m-2` | 8px | Tight spacing |
| `p-3`, `m-3` | 12px | Compact spacing |
| `p-4`, `m-4` | 16px | **Default spacing** |
| `p-5`, `m-5` | 20px | Medium spacing |
| `p-6`, `m-6` | 24px | Large spacing |
| `p-8`, `m-8` | 32px | XL spacing |
| `p-12`, `m-12` | 48px | 2XL spacing |
| `p-16`, `m-16` | 64px | 3XL spacing |

**Common Patterns:**
- Component padding: `p-4` to `p-6`
- Section padding: `px-4 sm:px-6 lg:px-8`
- Panel padding: `p-5` to `p-6`
- Button padding: `px-4 py-2`

---

## Border Radius

| Class | Value | Usage |
|-------|-------|-------|
| `rounded` | 4px | Small elements |
| `rounded-md` | 6px | Inputs, small buttons |
| `rounded-lg` | 8px | Buttons, badges |
| `rounded-xl` | 12px | Cards, modals |
| `rounded-2xl` | 16px | Large cards |
| `rounded-3xl` | 24px | **Panels, large surfaces** |
| `rounded-full` | 9999px | Circles, pills |

**Common Patterns:**
```tsx
// Panel borders
<div className="rounded-l-3xl"> // Right panel
<div className="rounded-r-3xl"> // Left panel

// Cards
<div className="rounded-xl">

// Buttons
<button className="rounded-lg">

// Icon buttons
<button className="rounded-full">
```

---

## Shadows

### Shadow Utilities

| Class | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Subtle elevation |
| `shadow` | Default | Standard cards |
| `shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1)` | Elevated cards |
| `shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1)` | Modals, dropdowns |
| `shadow-xl` | `0 20px 25px -5px rgb(0 0 0 / 0.1)` | Overlays |
| `shadow-2xl` | `0 25px 50px -12px rgb(0 0 0 / 0.25)` | Maximum elevation |

### Custom Shadows

| Class | Value | Usage |
|-------|-------|-------|
| `shadow-floating` | `0 14px 30px -18px rgba(15, 23, 42, 0.45)` | Floating panels |
| `shadow-inset` | `inset 0 0 0 1px rgba(148, 163, 184, 0.2)` | Inset borders |

**Usage Examples:**
```tsx
// Card
<div className="shadow-sm">

// Modal
<div className="shadow-2xl">

// Floating panel
<div className="shadow-floating">
```

---

## Breakpoints

Mobile-first responsive design.

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| `sm:` | 640px | Tablets portrait |
| `md:` | 768px | Tablets landscape |
| `lg:` | 1024px | Laptops, small desktops |
| `xl:` | 1280px | Desktops |
| `2xl:` | 1536px | Large screens |

**Responsive Patterns:**
```tsx
// Mobile-first padding
<div className="px-4 sm:px-6 lg:px-8">

// Responsive grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">

// Hide on mobile
<div className="hidden sm:block">

// Show on mobile only
<div className="block sm:hidden">
```

---

## Container Widths

CSS custom properties for responsive max-widths:

### Default Container

| Breakpoint | Max Width |
|------------|-----------|
| xs | 100% |
| sm | 560px |
| md | 720px |
| lg | 820px |
| xl | 880px |

**CSS Variables:**
```css
--app-shell-max-width-xs: 100%;
--app-shell-max-width-sm: 560px;
--app-shell-max-width-md: 720px;
--app-shell-max-width-lg: 820px;
--app-shell-max-width-xl: 880px;
```

### Wide Container

| Breakpoint | Max Width |
|------------|-----------|
| sm | 700px |
| md | 1120px |
| lg | 1280px |
| xl | 1440px |

**CSS Variables:**
```css
--app-shell-wide-max-width-sm: 700px;
--app-shell-wide-max-width-md: 1120px;
--app-shell-wide-max-width-lg: 1280px;
--app-shell-wide-max-width-xl: 1440px;
```

### Narrow Container (Note Board)

| Breakpoint | Max Width |
|------------|-----------|
| sm | 520px |
| md | 720px |
| lg | 1024px |
| xl | 1200px |

**CSS Variables:**
```css
--note-board-max-width-sm: 520px;
--note-board-max-width-md: 720px;
--note-board-max-width-lg: 1024px;
--note-board-max-width-xl: 1200px;
```

### Centered Shell

Maximum 1280px with auto margins:

```css
.centered-shell {
  width: 100%;
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
  padding: 0;
}

@media (min-width: 1024px) {
  .centered-shell {
    padding: 2rem 1.5rem;
  }
}
```

---

## Z-Index Scale

Layering strategy (recommended):

| Layer | Z-Index | Usage |
|-------|---------|-------|
| Base | 0 | Default content |
| Dropdown | 10 | Dropdowns, tooltips |
| Sticky | 20 | Sticky headers |
| Fixed | 30 | Fixed navigation |
| Overlay | 40 | Slide-out panels |
| Modal Backdrop | 50 | Modal backgrounds |
| Modal Content | 60 | Modal dialogs |
| Toast | 100 | Toast notifications |

**Usage Examples:**
```tsx
// Fixed top nav
<nav className="fixed inset-x-0 top-0 z-30">

// Modal backdrop
<div className="fixed inset-0 z-50">

// Modal content
<div className="relative z-[60]">
```

---

## CSS Custom Properties

### Layout Variables

```css
/* Grid and spacing */
--app-shell-grid-gap: 1.5rem;
--app-shell-utility-width: 320px;
--app-shell-inspector-width: clamp(260px, 24vw, 340px);
```

### Container Query Names

```css
.cq-shell { container-name: shell; }
.cq-nav { container-name: nav; }
.cq-sidebar { container-name: sidebar; }
.cq-board { container-name: board; }
.cq-inspector { container-name: inspector; }
.cq-utility { container-name: utility; }
.cq-ribbon { container-name: ribbon; }
.cq-canvas { container-name: canvas; }
.cq-footer { container-name: footer; }
```

---

## Utility Classes

### Component Classes

```css
/* Card surface */
.surface-card {
  @apply rounded-xl border border-outline-subtle bg-surface-elevated shadow-sm;
}

/* Icon button */
.icon-button {
  @apply grid place-items-center rounded-full p-2
         text-ink-500 transition-all duration-150
         hover:bg-surface-muted hover:text-ink-700
         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500;
}

/* Keyboard chip */
.kbd-chip {
  @apply inline-flex items-center gap-1
         rounded-md border border-outline-subtle
         bg-surface-muted px-2 py-1
         text-xs font-medium text-ink-500;
}
```

### Text Utilities

```css
.text-muted {
  @apply text-ink-500;
}
```

---

## Implementation Checklist

When setting up a new project:

- [ ] Install fonts: Geist Sans, Geist Mono, Kanit
- [ ] Copy `tailwind.config.ts` with all color tokens
- [ ] Copy `globals.css` with CSS custom properties
- [ ] Set up dark/light mode class on `<html>` element
- [ ] Configure container query utilities
- [ ] Add custom shadow definitions
- [ ] Set up note color safelist for dynamic classes
- [ ] Import pattern SVGs for backgrounds

---

**Next Steps:**
- [Components →](./components.md) - Learn how to use these tokens in components
- [UI Patterns →](./ui-patterns.md) - Common UI patterns with design tokens
- [Theming →](./theming.md) - Dark/light mode implementation
