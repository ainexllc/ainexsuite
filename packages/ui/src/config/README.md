# Design Tokens System

Unified design tokens, presets, and component variants for the AINexSuite monorepo.

## Overview

This module provides a centralized design system that ensures consistency across all apps. It includes:

- **Design Tokens** - Foundational values (spacing, colors, typography, etc.)
- **Tailwind Presets** - Pre-configured Tailwind class combinations
- **Component Variants** - Type-safe variant definitions using `class-variance-authority`

## Installation

The tokens are already available as part of `@ainexsuite/ui`:

```tsx
import {
  spacing,
  radius,
  shadows,
  typography,
  // ... and more
} from '@ainexsuite/ui';
```

## Design Tokens

### Spacing

Consistent spacing values using rem units (1rem = 16px).

```tsx
import { spacing } from '@ainexsuite/ui';

// In inline styles
<div style={{ padding: spacing.md }} /> // 16px

// For calculations
const dynamicMargin = `calc(${spacing.lg} + 2px)`; // calc(1.5rem + 2px)
```

Available values:
- `xs` - 4px
- `sm` - 8px
- `md` - 16px (default)
- `lg` - 24px
- `xl` - 32px
- `2xl` - 48px
- `3xl` - 64px

### Border Radius

Rounded corner values for consistent component styling.

```tsx
import { radius } from '@ainexsuite/ui';

<div style={{ borderRadius: radius.lg }} /> // 12px (rounded-xl)
```

Available values:
- `sm` - 6px (tags, badges)
- `md` - 8px (buttons, small inputs)
- `lg` - 12px (cards, inputs - `rounded-xl`)
- `xl` - 16px (large cards - `rounded-2xl`)
- `2xl` - 24px (hero cards - `rounded-3xl`)
- `full` - 9999px (pills, avatars - `rounded-full`)

### Shadows

Box shadow presets matching the elevation system.

```tsx
import { shadows } from '@ainexsuite/ui';

<div style={{ boxShadow: shadows.lg }} />
```

Available values:
- `sm` - Subtle elevation (4px blur)
- `md` - Medium elevation (10px blur)
- `lg` - Large elevation (20px blur)
- `xl` - Extra large elevation (30px blur)
- `floating` - Tooltips, menus (12px blur)

### Typography

Font size, line height, and weight presets.

```tsx
import { typography } from '@ainexsuite/ui';

<h1 style={{
  fontSize: typography.h1.size,
  lineHeight: typography.h1.lineHeight,
  fontWeight: typography.h1.weight
}} />
```

Available scales:
- `h1` - 36px, bold
- `h2` - 24px, semibold
- `h3` - 20px, semibold
- `h4` - 18px, semibold
- `body.large` - 16px, regular
- `body.base` - 14px, regular
- `body.small` - 12px, regular

### Glassmorphism Presets

Pre-configured glassmorphism effects (Journey app primary style).

```tsx
import { glass } from '@ainexsuite/ui';

// Use as className string
<div className={glass.medium} />

// Combine with other classes
<div className={`${glass.card} rounded-xl p-6`} />
```

Available presets:
- `light` - Subtle transparency, minimal blur
- `medium` - Balanced (default for Journey)
- `heavy` - Strong blur with dark tint
- `card` - Optimized for card components
- `overlay` - For modal/drawer backdrops

### Z-Index Scale

Layering system for stacking contexts.

```tsx
import { zIndex } from '@ainexsuite/ui';

<div style={{ zIndex: zIndex.modal }} /> // 50
```

Available layers:
- `base` - 0
- `dropdown` - 10
- `sticky` - 20
- `drawer` - 30
- `overlay` - 40
- `modal` - 50
- `popover` - 60
- `toast` - 70
- `tooltip` - 80

### Container Widths

Maximum width values for responsive layouts.

```tsx
import { containers } from '@ainexsuite/ui';

<div style={{ maxWidth: containers.xl }} /> // 1280px
```

Available widths:
- `xs` - 100% (mobile)
- `sm` - 720px
- `md` - 960px
- `lg` - 1184px
- `xl` - 1280px (primary max-width)
- `2xl` - 1440px
- `3xl` - 1600px

## Tailwind Presets

Pre-configured Tailwind class combinations for common patterns.

### Card Styles

```tsx
import { cardStyles } from '@ainexsuite/ui';
import { cn } from '@ainexsuite/ui';

// Base card
<div className={cardStyles.base} />

// Elevated card with hover
<div className={cn(cardStyles.elevated, cardStyles.hover)} />

// Interactive card (includes hover)
<div className={cardStyles.interactive} />

// Glass card (Journey style)
<div className={cardStyles.glass} />
```

Available presets:
- `base` - Standard elevation
- `elevated` - Higher elevation
- `muted` - Lower contrast
- `interactive` - Includes hover state
- `glass` - Glassmorphism effect
- `hover` - Add to base cards
- `active` - Selected state

### Button Styles

```tsx
import { buttonStyles } from '@ainexsuite/ui';

<button className={buttonStyles.primary}>Save</button>
<button className={buttonStyles.secondary}>Cancel</button>
<button className={buttonStyles.ghost}>Close</button>
```

Available presets:
- `base` - Common classes
- `primary` - Accent color
- `secondary` - Outlined
- `ghost` - Transparent with hover
- `danger` - Red (destructive)
- `success` - Green (positive)
- `icon` - Circular for icons
- `link` - Looks like a link

### Input Styles

```tsx
import { inputStyles } from '@ainexsuite/ui';

<input className={inputStyles.base} />
<textarea className={inputStyles.textarea} />

// Error state
<input className={cn(inputStyles.base, inputStyles.error)} />
```

Available presets:
- `base` - Standard input
- `textarea` - Multi-line input
- `select` - Dropdown
- `error` - Error validation
- `success` - Success validation
- `disabled` - Disabled state

### Navigation Styles

```tsx
import { navigationStyles } from '@ainexsuite/ui';

<header className={navigationStyles.header}>
  <div className={navigationStyles.headerContainer}>
    {/* Header content */}
  </div>
</header>

<aside className={navigationStyles.sidebar}>
  <a className={navigationStyles.navLink}>Link</a>
  <a className={navigationStyles.navLinkActive}>Active</a>
</aside>
```

Available presets:
- `header` - Top header (sticky, 64px)
- `headerContainer` - Centered container
- `sidebar` - Left slide-in (280px)
- `panel` - Right panel (480px)
- `navLink` - Base link style
- `navLinkActive` - Active link

### Modal Styles

```tsx
import { modalStyles } from '@ainexsuite/ui';

<div className={modalStyles.overlay}>
  <div className={modalStyles.backdrop} />
  <div className={modalStyles.dialog}>
    <div className={modalStyles.dialogHeader}>Title</div>
    <div className={modalStyles.dialogBody}>Content</div>
    <div className={modalStyles.dialogFooter}>
      <button>Close</button>
    </div>
  </div>
</div>
```

Available presets:
- `overlay` - Full-screen overlay
- `backdrop` - Blurred background
- `dialog` - Centered modal
- `dialogHeader` - Modal header
- `dialogBody` - Modal content
- `dialogFooter` - Modal footer

### Badge Styles

```tsx
import { badgeStyles } from '@ainexsuite/ui';

<span className={badgeStyles.primary}>New</span>
<span className={badgeStyles.success}>Active</span>
<span className={badgeStyles.danger}>Error</span>
```

Available presets:
- `base` - Common classes
- `primary` - Accent color
- `success` - Green
- `warning` - Yellow
- `danger` - Red
- `neutral` - Gray

### Layout Styles

```tsx
import { layoutStyles } from '@ainexsuite/ui';

// Masonry grid (Notes board)
<div className={layoutStyles.masonry}>
  <div className={layoutStyles.masonryItem}>Card</div>
</div>

// Standard grid
<div className={layoutStyles.grid}>
  <div>Item</div>
</div>

// List layout
<div className={layoutStyles.list}>
  <div>Item</div>
</div>
```

Available presets:
- `masonry` - Responsive masonry columns
- `masonryItem` - Prevents breaking
- `grid` - Responsive grid
- `list` - Vertical stack
- `container` - Max-width with padding
- `section` - Section spacing

### Typography Styles

```tsx
import { textStyles } from '@ainexsuite/ui';

<h1 className={textStyles.h1}>Title</h1>
<p className={textStyles.body}>Content</p>
<span className={textStyles.caption}>Caption</span>
<a className={textStyles.link}>Link</a>
```

Available presets:
- `h1`, `h2`, `h3`, `h4` - Headings
- `bodyLarge`, `body`, `bodySmall` - Body text
- `caption` - Muted small text
- `muted` - Muted text
- `link` - Link styling

### Utility Styles

```tsx
import { utilityStyles } from '@ainexsuite/ui';

<button className={utilityStyles.focusRing}>Focus me</button>
<div className={utilityStyles.truncate}>Long text...</div>
<div className={utilityStyles.lineClamp3}>Multi-line text...</div>
```

Available utilities:
- `focusRing` - Accessible focus state
- `truncate` - Single-line ellipsis
- `lineClamp2`, `lineClamp3` - Multi-line truncation
- `srOnly` - Screen reader only
- `disabled` - Disabled state
- `smoothScroll` - Smooth scrolling
- `hideScrollbar` - Hide scrollbar

## Component Variants

Type-safe component variants using `class-variance-authority`.

### Card Variants

```tsx
import { cardVariants, type CardVariantProps } from '@ainexsuite/ui';
import { cn } from '@ainexsuite/ui';

// Use with cva
<div className={cardVariants({
  variant: 'elevated',
  padding: 'lg',
  interactive: true
})} />

// Create typed props
interface CardProps extends CardVariantProps {
  children: React.ReactNode;
}

export function Card({ variant, padding, interactive, children }: CardProps) {
  return (
    <div className={cardVariants({ variant, padding, interactive })}>
      {children}
    </div>
  );
}
```

Variants:
- `variant`: `default` | `elevated` | `muted` | `glass` | `outline`
- `padding`: `none` | `sm` | `md` | `lg` | `xl`
- `interactive`: `true` | `false`
- `rounded`: `default` | `lg` | `xl` | `2xl` | `3xl`

### Button Variants

```tsx
import { buttonVariants, type ButtonVariantProps } from '@ainexsuite/ui';

<button className={buttonVariants({
  variant: 'primary',
  size: 'lg',
  fullWidth: true
})}>
  Save
</button>
```

Variants:
- `variant`: `primary` | `secondary` | `ghost` | `outline` | `danger` | `success` | `link`
- `size`: `sm` | `md` | `lg` | `xl` | `icon`
- `fullWidth`: `true` | `false`

### Input Variants

```tsx
import { inputVariants, type InputVariantProps } from '@ainexsuite/ui';

<input className={inputVariants({
  size: 'lg',
  state: 'error'
})} />
```

Variants:
- `size`: `sm` | `md` | `lg`
- `state`: `default` | `error` | `success` | `disabled`

### Badge Variants

```tsx
import { badgeVariants, type BadgeVariantProps } from '@ainexsuite/ui';

<span className={badgeVariants({
  variant: 'success',
  size: 'lg'
})}>
  Active
</span>
```

Variants:
- `variant`: `primary` | `secondary` | `success` | `warning` | `danger` | `outline`
- `size`: `sm` | `md` | `lg`

### Avatar Variants

```tsx
import { avatarVariants, type AvatarVariantProps } from '@ainexsuite/ui';

<div className={avatarVariants({ size: 'lg', border: true })}>
  <img src={avatarUrl} alt="User" />
</div>
```

Variants:
- `size`: `xs` | `sm` | `md` | `lg` | `xl` | `2xl`
- `border`: `true` | `false`

### Alert Variants

```tsx
import { alertVariants, type AlertVariantProps } from '@ainexsuite/ui';

<div className={alertVariants({ variant: 'error' })}>
  Error message here
</div>
```

Variants:
- `variant`: `info` | `success` | `warning` | `error` | `neutral`

### Other Variants

Additional variant functions available:
- `skeletonVariants` - Loading placeholders
- `dividerVariants` - Horizontal/vertical dividers
- `tooltipVariants` - Hover tooltips
- `spinnerVariants` - Loading spinners

## Type Safety

All tokens and variants are fully typed for TypeScript:

```tsx
import type {
  Spacing,
  Radius,
  Shadow,
  ZIndex,
  Container,
  Breakpoint,
  IconSize,
  AvatarSize,
} from '@ainexsuite/ui';

// Type-safe token access
const mySpacing: Spacing = 'lg'; // ✓
const invalid: Spacing = 'huge'; // ✗ TypeScript error
```

## Best Practices

### Use Tokens Over Hard-Coded Values

❌ Don't:
```tsx
<div style={{ padding: '24px', borderRadius: '12px' }} />
```

✓ Do:
```tsx
import { spacing, radius } from '@ainexsuite/ui';
<div style={{ padding: spacing.lg, borderRadius: radius.lg }} />
```

### Use Tailwind Presets for Common Patterns

❌ Don't:
```tsx
<div className="rounded-xl bg-[rgb(var(--color-surface-card))] border border-[rgb(var(--color-outline-subtle))] shadow-sm hover:bg-[rgb(var(--color-surface-hover))] transition-all" />
```

✓ Do:
```tsx
import { cardStyles } from '@ainexsuite/ui';
<div className={cardStyles.interactive} />
```

### Use Component Variants for Type Safety

❌ Don't:
```tsx
<button className={`px-4 py-2 ${isPrimary ? 'bg-accent-500' : 'border'}`} />
```

✓ Do:
```tsx
import { buttonVariants } from '@ainexsuite/ui';
<button className={buttonVariants({ variant: isPrimary ? 'primary' : 'secondary' })} />
```

### Combine Variants with Custom Classes

```tsx
import { cardVariants } from '@ainexsuite/ui';
import { cn } from '@ainexsuite/ui';

<div className={cn(
  cardVariants({ variant: 'elevated', padding: 'lg' }),
  'custom-animation',
  isActive && 'border-accent-500'
)} />
```

## Migration Guide

If you have existing components using hard-coded values:

1. **Identify the pattern** - Is it a card, button, input, etc.?
2. **Check for a preset** - Look in `tailwind-presets.ts`
3. **Check for a variant** - Look in `component-variants.ts`
4. **Use tokens for custom styles** - Use values from `tokens.ts`

Example migration:

```tsx
// Before
<div className="rounded-xl bg-white/8 backdrop-blur-lg border border-white/15 shadow-lg p-6">
  Content
</div>

// After
import { cardStyles } from '@ainexsuite/ui';
<div className={`${cardStyles.glass} p-6`}>
  Content
</div>

// Or with variants
import { cardVariants } from '@ainexsuite/ui';
<div className={cardVariants({ variant: 'glass', padding: 'lg' })}>
  Content
</div>
```

## Contributing

When adding new patterns:

1. Add tokens to `tokens.ts` if they're foundational values
2. Add presets to `tailwind-presets.ts` for common class combinations
3. Add variants to `component-variants.ts` for type-safe component APIs
4. Document usage with examples
5. Test across apps to ensure consistency

## Resources

- **Design System Docs**: `/docs/ui-ux/DESIGN_SYSTEM_ESSENTIALS.md`
- **CSS Variables**: `/packages/ui/src/styles/globals.css`
- **Tailwind Config**: See app-specific `tailwind.config.ts`
- **Component Examples**: See `/packages/ui/src/components/`
