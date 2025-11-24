# Design System Essentials - Quick Reference

**Version**: 2.1.0
**For full documentation**: See `DESIGN_SYSTEM.md`

## Core Design Principles

### Layout Pattern
- **Centered container**: Max-width 1280px
- **Navigation**: Slide-in overlay (280px left)
- **Right panels**: Settings, Activity (480px right)
- **Responsive**: Full-width on mobile, centered on desktop

### Color Philosophy
- **Dark mode default**: Deep blacks with subtle elevation
- **Light mode**: Clean whites with soft shadows
- **Accent**: Blue (#3b82f6) - customizable per app
- **Note colors**: Lemon, mint, coral, lavender (pastel palette)

---

## Quick Reference

### Container Widths
```css
Mobile:    100% (px-4)
Tablet:    720px (px-6)
Desktop:   1280px (px-12)
HD:        1440px (px-20)
```

### Key Colors (Dark Mode)
```css
Background:   #141416 (surface-base)
Cards:        #242428 (surface-elevated)
Text:         #fafafa (ink-900)
Accent:       #3b82f6 (accent-500)
Border:       rgba(255,255,255,0.1)
```

### Key Colors (Light Mode)
```css
Background:   #fafafa
Cards:        #ffffff
Text:         #141416
Accent:       #3b82f6
Border:       rgba(0,0,0,0.1)
```

### Note Colors
```css
Lemon:    #fef7cd
Mint:     #d4f4dd
Coral:    #fde2dd
Lavender: #e8dff5
Sky:      #d3ecf8
```

---

## Component Patterns

### Top Navigation (64px height)
```tsx
<header className="sticky top-0 z-30 h-16 backdrop-blur-2xl
  bg-[#050507]/95 border-b border-white/10">
  <div className="mx-auto max-w-[1280px] px-6 flex items-center justify-between">
    {/* Hamburger + Logo + Search + Notifications + Profile */}
  </div>
</header>
```

### Card Component
```tsx
<div className="rounded-3xl bg-surface-elevated border border-outline-subtle
  px-5 py-4 shadow-lg hover:shadow-2xl transition">
  {/* Content */}
</div>
```

### Button (Primary)
```tsx
<button className="rounded-xl bg-accent-500 px-4 py-2 text-sm
  font-semibold text-white shadow-sm hover:bg-accent-600 transition">
  Action
</button>
```

### Button (Secondary)
```tsx
<button className="rounded-xl border border-outline-subtle
  bg-surface-elevated px-4 py-2 text-sm font-semibold text-ink-900
  hover:bg-surface-muted transition">
  Cancel
</button>
```

### Input Field
```tsx
<input className="w-full rounded-xl border border-outline-subtle
  bg-surface-muted/50 px-4 py-2.5 text-sm text-ink-900
  placeholder:text-ink-400 focus:border-accent-500
  focus:outline-none focus:ring-2 focus:ring-accent-500/20 transition" />
```

---

## Navigation & Panels

### Left Navigation Overlay (280px)
```tsx
<aside className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-[280px]
  bg-surface-base/95 backdrop-blur-xl border-r border-white/10
  transform transition-transform duration-300">
  {/* Nav items */}
</aside>
```

### Right Panel (Settings/Activity) (480px)
```tsx
<div className="fixed right-0 top-0 z-50 h-screen w-[480px]
  bg-surface-base/95 backdrop-blur-xl border-l border-white/10
  shadow-[-20px_0_40px_-10px_rgba(0,0,0,0.3)]">
  {/* Panel content */}
</div>
```

---

## Typography

### Headings
```css
h1: text-4xl font-bold (36px)
h2: text-2xl font-semibold (24px)
h3: text-xl font-semibold (20px)
h4: text-lg font-semibold (18px)
```

### Body Text
```css
Large:  text-base (16px)
Normal: text-sm (14px)
Small:  text-xs (12px)
```

### Font Weights
```css
Regular:  font-normal (400)
Medium:   font-medium (500)
Semibold: font-semibold (600)
Bold:     font-bold (700)
```

---

## Spacing & Sizing

### Common Spacing
```css
Gap-2:  0.5rem (8px)
Gap-4:  1rem (16px)
Gap-6:  1.5rem (24px)
Gap-8:  2rem (32px)
```

### Border Radius
```css
Small:  rounded-xl (12px)
Medium: rounded-2xl (16px)
Large:  rounded-3xl (24px)
Full:   rounded-full (9999px)
```

### Shadows
```css
sm:    shadow-sm (subtle)
lg:    shadow-lg (cards default)
2xl:   shadow-2xl (cards hover)
floating: shadow-floating (modals/dropdowns)
```

---

## Common Patterns

### Masonry Grid (Notes Board)
```tsx
<div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
  {/* Note cards with break-inside-avoid */}
</div>
```

### List View
```tsx
<div className="flex flex-col gap-3">
  {/* Note cards in vertical list */}
</div>
```

### Modal Overlay
```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
  <div className="absolute inset-0 bg-overlay/60 backdrop-blur-sm" />
  <div className="relative rounded-3xl bg-surface-elevated shadow-floating
    border border-outline-subtle max-w-lg w-full">
    {/* Modal content */}
  </div>
</div>
```

---

## Theme Switching

### Toggle Between Dark/Light
```tsx
const [theme, setTheme] = useState<'dark' | 'light'>('dark');

const toggleTheme = () => {
  const newTheme = theme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
  document.documentElement.classList.toggle('theme-light', newTheme === 'light');
};
```

### CSS Variables
All colors use CSS custom properties that automatically adjust:
```css
/* Defined in globals.css */
:root { /* dark mode values */ }
.theme-light { /* light mode values */ }
```

---

## App-Specific Themes

### Journey (Orange/Forest)
```css
Primary:   #f97316 (orange)
Secondary: #22c55e (forest green)
Style:     Glassmorphism with backdrop-blur
```

### Notes (Blue)
```css
Primary:   #3b82f6 (blue)
Style:     Clean, professional
```

### Main (Unified)
```css
Theme switcher for all app themes
Detects active app and applies corresponding colors
```

---

## Accessibility

### Focus States
```css
focus:outline-none focus:ring-2 focus:ring-accent-500
```

### Touch Targets
- Minimum 44px height on mobile
- 36px minimum on desktop

### Color Contrast
- Text on dark: #fafafa (18:1 ratio)
- Text on light: #141416 (18:1 ratio)
- Accent: Meets WCAG AA standards

---

## Resources

- **Full Design System**: `DESIGN_SYSTEM.md` (1,013 lines)
- **CSS Tokens**: `CSS_TOKENS.css`
- **Tailwind Config**: `TAILWIND_CONFIG.ts`
- **Component Examples**: See full design system doc

---

*Last updated: November 2025*
