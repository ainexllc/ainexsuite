# Design System Enforcer Skill

## Purpose
Ensure every component, page, and app adheres to the NoteNex design system for complete visual consistency across all AINexSuite apps.

## When to Use
- Before committing new UI components
- When creating new pages or layouts
- After modifying styling
- During code reviews
- Before deployment

## Design System Reference

### Color Palette (Dark Mode Default)

#### Surface Colors
```css
--surface-base: #141416;        /* Main background */
--surface-elevated: #1c1c1f;    /* Cards, modals */
--surface-muted: #25252a;       /* Inputs, disabled */
--surface-card: #1c1c1f;        /* Card backgrounds */
```

#### Text Colors (Ink)
```css
--ink-900: #f5f5f5;    /* Primary text */
--ink-800: #e5e5e5;    /* Secondary text */
--ink-700: #d4d4d4;    /* Tertiary text */
--ink-600: #a1a1aa;    /* Muted text */
--ink-500: #71717a;    /* Placeholder */
```

#### Accent Colors
```css
--accent-500: #F97316;  /* Primary orange */
--accent-600: #ea580c;  /* Darker orange */
--accent-400: #fb923c;  /* Lighter orange */
```

#### Outline Colors
```css
--outline-subtle: rgba(255, 255, 255, 0.1);
--outline-base: rgba(255, 255, 255, 0.2);
```

### Typography

#### Font Families
```css
--font-sans: 'Geist Sans', system-ui, sans-serif;
--font-mono: 'Geist Mono', monospace;
--font-brand: 'Kanit', sans-serif;  /* For logo/branding only */
```

#### Font Sizes
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

### Spacing Scale

Use Tailwind's spacing scale (based on 4px):
```
0   = 0px
1   = 4px
2   = 8px
3   = 12px
4   = 16px
6   = 24px
8   = 32px
12  = 48px
16  = 64px
20  = 80px
```

### Layout Dimensions

```css
--nav-height: 64px;
--nav-panel-width: 280px;
--settings-panel-width: 480px;
--container-max: 1280px;
```

## Component Patterns

### Buttons

#### Primary Button
```tsx
<button className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-600">
  Primary Action
</button>
```

#### Secondary Button
```tsx
<button className="rounded-lg border border-outline-base px-4 py-2 text-sm font-semibold text-ink-900 transition-colors hover:bg-surface-muted">
  Secondary Action
</button>
```

#### Ghost Button
```tsx
<button className="rounded-lg px-4 py-2 text-sm font-semibold text-ink-600 transition-colors hover:bg-surface-muted hover:text-ink-900">
  Ghost Action
</button>
```

#### Icon Button
```tsx
<button className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-600 transition-colors hover:bg-surface-muted hover:text-ink-900">
  <Icon className="h-5 w-5" />
</button>
```

### Cards

#### Surface Card
```tsx
<div className="surface-card rounded-xl p-6">
  <h3 className="text-lg font-semibold text-ink-900">Card Title</h3>
  <p className="mt-2 text-sm text-ink-600">Card content</p>
</div>
```

#### Interactive Card
```tsx
<div className="surface-card group rounded-xl p-6 transition-all hover:scale-105 hover:shadow-xl">
  {/* Content */}
</div>
```

### Inputs

#### Text Input
```tsx
<input
  type="text"
  placeholder="Enter text..."
  className="w-full rounded-lg bg-surface-muted px-4 py-2 text-sm text-ink-900 placeholder-ink-500 focus:outline-none focus:ring-2 focus:ring-accent-500"
/>
```

#### Textarea
```tsx
<textarea
  placeholder="Enter long text..."
  className="w-full rounded-lg bg-surface-muted px-4 py-2 text-sm text-ink-900 placeholder-ink-500 focus:outline-none focus:ring-2 focus:ring-accent-500"
  rows={4}
/>
```

### Modals

```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
  <div className="surface-card w-full max-w-md rounded-xl p-6">
    <h2 className="text-xl font-semibold text-ink-900">Modal Title</h2>
    <p className="mt-2 text-sm text-ink-600">Modal content</p>
    <div className="mt-6 flex justify-end gap-3">
      <button className="rounded-lg px-4 py-2 text-sm font-semibold text-ink-600 hover:bg-surface-muted">
        Cancel
      </button>
      <button className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-600">
        Confirm
      </button>
    </div>
  </div>
</div>
```

## Responsive Breakpoints

```css
/* Mobile-first approach */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large desktops */
```

### Responsive Container
```tsx
<Container variant="narrow">  {/* max-w-4xl (896px) */}
<Container variant="default"> {/* max-w-6xl (1152px) */}
<Container variant="wide">    {/* max-w-7xl (1280px) */}
```

## Checklist for Reviews

### Color Usage
- [ ] All colors use CSS custom properties or Tailwind classes
- [ ] No hard-coded hex colors (e.g., `#ffffff`)
- [ ] Background colors use `surface-*` tokens
- [ ] Text colors use `ink-*` tokens
- [ ] Interactive elements use `accent-*` for highlights
- [ ] Borders use `outline-*` tokens

### Typography
- [ ] All text uses Geist Sans font
- [ ] Font sizes use Tailwind classes (text-sm, text-base, etc.)
- [ ] Line heights are appropriate (1.5 for body, 1.2 for headings)
- [ ] Font weights: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Spacing
- [ ] Spacing uses Tailwind's spacing scale
- [ ] Consistent padding/margin (p-4, p-6, py-8, etc.)
- [ ] No arbitrary values like `p-[13px]`

### Components
- [ ] Uses shared components from `@ainexsuite/ui`
- [ ] Custom components follow established patterns
- [ ] All interactive elements have hover states
- [ ] Focus states visible (ring-2 ring-accent-500)

### Layout
- [ ] Pages use Container component
- [ ] AppShell wraps all authenticated pages
- [ ] TopNav height is 64px
- [ ] NavigationPanel width is 280px
- [ ] No layout shifts during navigation

### Responsive Design
- [ ] Mobile-first approach used
- [ ] Breakpoints use Tailwind classes (sm:, md:, lg:)
- [ ] Text readable on small screens
- [ ] Touch targets minimum 44x44px
- [ ] No horizontal scroll on mobile

### Dark/Light Mode
- [ ] All colors work in both modes
- [ ] Uses CSS custom properties that update with theme
- [ ] No hard-coded light/dark specific styles
- [ ] Images/icons adapt to theme

### Accessibility
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Interactive elements have aria-labels
- [ ] Keyboard navigation works
- [ ] Focus indicators visible

## Common Issues & Fixes

### Issue: Hard-coded colors
❌ **Wrong:**
```tsx
<div style={{ backgroundColor: '#1c1c1f' }}>
```

✅ **Correct:**
```tsx
<div className="surface-card">
```

### Issue: Inconsistent spacing
❌ **Wrong:**
```tsx
<div className="p-[13px] mb-[7px]">
```

✅ **Correct:**
```tsx
<div className="p-3 mb-2">
```

### Issue: Custom components instead of shared
❌ **Wrong:**
```tsx
// Creating custom button in app
<button className="my-custom-button">
```

✅ **Correct:**
```tsx
import { Button } from "@ainexsuite/ui/components/button";
<Button variant="primary">
```

### Issue: Missing responsive design
❌ **Wrong:**
```tsx
<div className="flex">
```

✅ **Correct:**
```tsx
<div className="flex flex-col sm:flex-row">
```

## Auto-Fix Commands

```bash
# Check for hard-coded colors
grep -r "#[0-9a-fA-F]\{6\}" src/ --include="*.tsx" --include="*.css"

# Check for arbitrary spacing
grep -r "\[\d\+px\]" src/ --include="*.tsx"

# Find components not using shared UI
grep -r "className=\".*button" src/ --include="*.tsx" | grep -v "@ainexsuite/ui"
```

## Integration with Development

Run design system checks before commits:

```json
// package.json
{
  "scripts": {
    "check:design": "monorepo-manager audit:design-system"
  }
}
```

## Resources

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [NoteNex Design System](../../notenex_app/docs/DESIGN_SYSTEM.md)
- [Component Examples](../../packages/ui/src/components/)
- [Color Palette Reference](../../packages/ui/src/styles/globals.css)

---

**Remember**: Consistency is key. When in doubt, check existing components in the shared UI package.
