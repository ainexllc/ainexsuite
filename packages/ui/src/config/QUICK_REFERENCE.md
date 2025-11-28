# Design Tokens Quick Reference

One-page cheat sheet for the AINexSuite design tokens system.

## Import Everything

```tsx
import {
  // Tokens
  spacing, radius, shadows, typography, glass, zIndex,
  containers, transitions, breakpoints,

  // Presets
  cardStyles, buttonStyles, inputStyles, navigationStyles,
  modalStyles, badgeStyles, layoutStyles, textStyles,

  // Variants
  cardVariants, buttonVariants, inputVariants,
  badgeVariants, avatarVariants, alertVariants,

  // Utilities
  cn,
} from '@ainexsuite/ui';
```

## Common Patterns

### Card
```tsx
// Preset
<div className={cardStyles.interactive} />

// Variant
<div className={cardVariants({ variant: 'elevated', padding: 'lg' })} />

// Glass (Journey)
<div className={glass.medium} />
```

### Button
```tsx
// Preset
<button className={buttonStyles.primary}>Save</button>

// Variant
<button className={buttonVariants({ variant: 'primary', size: 'lg' })}>Save</button>
```

### Input
```tsx
// Preset
<input className={inputStyles.base} />

// Variant with state
<input className={inputVariants({ size: 'md', state: 'error' })} />
```

### Layout
```tsx
// Masonry grid
<div className={layoutStyles.masonry}>
  <div className={layoutStyles.masonryItem}>...</div>
</div>

// Standard grid
<div className={layoutStyles.grid}>...</div>
```

## Token Values

### Spacing
```tsx
spacing.xs   // 4px
spacing.sm   // 8px
spacing.md   // 16px ⭐ default
spacing.lg   // 24px
spacing.xl   // 32px
spacing['2xl'] // 48px
spacing['3xl'] // 64px
```

### Border Radius
```tsx
radius.sm   // 6px
radius.md   // 8px
radius.lg   // 12px (rounded-xl) ⭐ cards
radius.xl   // 16px (rounded-2xl)
radius['2xl'] // 24px (rounded-3xl)
radius.full // 9999px (rounded-full)
```

### Shadows
```tsx
shadows.sm  // Subtle (4px blur)
shadows.md  // Medium (10px blur)
shadows.lg  // Large (20px blur) ⭐ cards
shadows.xl  // Extra large (30px blur)
shadows.floating // Tooltips (12px blur)
```

### Z-Index
```tsx
zIndex.base     // 0
zIndex.dropdown // 10
zIndex.sticky   // 20
zIndex.drawer   // 30
zIndex.overlay  // 40
zIndex.modal    // 50 ⭐ modals
zIndex.popover  // 60
zIndex.toast    // 70
zIndex.tooltip  // 80
```

### Glass Effects
```tsx
glass.light   // Subtle glass
glass.medium  // Balanced ⭐ Journey default
glass.heavy   // Strong blur
glass.card    // Optimized for cards
glass.overlay // Modal backdrops
```

## Variant Options

### Card Variants
```tsx
variant: 'default' | 'elevated' | 'muted' | 'glass' | 'outline'
padding: 'none' | 'sm' | 'md' | 'lg' | 'xl'
interactive: true | false
rounded: 'default' | 'lg' | 'xl' | '2xl' | '3xl'
```

### Button Variants
```tsx
variant: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'success' | 'link'
size: 'sm' | 'md' | 'lg' | 'xl' | 'icon'
fullWidth: true | false
```

### Input Variants
```tsx
size: 'sm' | 'md' | 'lg'
state: 'default' | 'error' | 'success' | 'disabled'
```

### Badge Variants
```tsx
variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline'
size: 'sm' | 'md' | 'lg'
```

## Complete Presets

### Cards
```tsx
cardStyles.base         // Standard card
cardStyles.elevated     // Higher shadow
cardStyles.muted        // Lower contrast
cardStyles.interactive  // Includes hover ⭐
cardStyles.glass        // Journey style
cardStyles.hover        // Add to base
cardStyles.active       // Selected state
```

### Buttons
```tsx
buttonStyles.primary    // Accent ⭐
buttonStyles.secondary  // Outlined
buttonStyles.ghost      // Transparent
buttonStyles.danger     // Red
buttonStyles.success    // Green
buttonStyles.icon       // Circular
buttonStyles.link       // Link style
```

### Inputs
```tsx
inputStyles.base        // Text input ⭐
inputStyles.textarea    // Multi-line
inputStyles.select      // Dropdown
inputStyles.error       // Error state
inputStyles.success     // Success state
inputStyles.disabled    // Disabled
```

### Navigation
```tsx
navigationStyles.header          // Top header
navigationStyles.headerContainer // Centered
navigationStyles.sidebar         // Left 280px
navigationStyles.panel           // Right 480px
navigationStyles.navLink         // Link ⭐
navigationStyles.navLinkActive   // Active link
```

### Modals
```tsx
modalStyles.overlay       // Full screen
modalStyles.backdrop      // Blurred bg
modalStyles.dialog        // Modal box ⭐
modalStyles.dialogHeader  // Header
modalStyles.dialogBody    // Content
modalStyles.dialogFooter  // Footer
```

### Badges
```tsx
badgeStyles.primary   // Accent
badgeStyles.success   // Green ⭐ status
badgeStyles.warning   // Yellow
badgeStyles.danger    // Red
badgeStyles.neutral   // Gray
```

### Layouts
```tsx
layoutStyles.masonry      // Masonry grid ⭐ Notes
layoutStyles.masonryItem  // Item wrapper
layoutStyles.grid         // Standard grid
layoutStyles.list         // Vertical list
layoutStyles.container    // Max-width
layoutStyles.section      // Section spacing
```

### Typography
```tsx
textStyles.h1         // 36px bold
textStyles.h2         // 24px semibold
textStyles.h3         // 20px semibold
textStyles.h4         // 18px semibold
textStyles.body       // 14px ⭐ default
textStyles.bodyLarge  // 16px
textStyles.bodySmall  // 12px
textStyles.caption    // 12px muted
textStyles.muted      // 14px muted
textStyles.link       // Link style
```

### Utilities
```tsx
utilityStyles.focusRing    // Focus state ⭐
utilityStyles.truncate     // Ellipsis
utilityStyles.lineClamp2   // 2 lines
utilityStyles.lineClamp3   // 3 lines
utilityStyles.disabled     // Disabled
```

## Combining Patterns

### Preset + Custom
```tsx
import { cardStyles } from '@ainexsuite/ui';
import { cn } from '@ainexsuite/ui';

<div className={cn(cardStyles.base, 'p-6', 'custom-class')} />
```

### Variant + Custom
```tsx
import { buttonVariants } from '@ainexsuite/ui';

<button className={cn(
  buttonVariants({ variant: 'primary', size: 'lg' }),
  'w-full'
)}>
  Save
</button>
```

### Token in Style
```tsx
import { spacing, radius, shadows } from '@ainexsuite/ui';

<div style={{
  padding: spacing.lg,
  borderRadius: radius.xl,
  boxShadow: shadows.lg,
}} />
```

## App-Specific

### Journey (Orange + Forest Glass)
```tsx
import { glass, cardVariants } from '@ainexsuite/ui';

<div className={glass.medium}>Glass card</div>
<div className={cardVariants({ variant: 'glass' })}>Glass variant</div>
```

### Notes (Blue Clean)
```tsx
import { layoutStyles, cardStyles } from '@ainexsuite/ui';

<div className={layoutStyles.masonry}>
  <div className={cardStyles.interactive}>Note card</div>
</div>
```

### All Apps
```tsx
import { navigationStyles, buttonStyles } from '@ainexsuite/ui';

<header className={navigationStyles.header}>
  <button className={buttonStyles.primary}>Action</button>
</header>
```

## CSS Variables Reference

Use these in custom styles:

```css
/* Colors */
--color-surface-base
--color-surface-elevated
--color-surface-card
--color-surface-muted
--color-surface-hover
--color-outline-subtle
--color-outline-base
--color-accent-500
--color-accent-600
--color-ink-900
--color-ink-700
--color-ink-600
--color-success
--color-warning
--color-danger

/* Usage */
background-color: rgb(var(--color-surface-card));
color: rgb(var(--color-ink-900));
border-color: rgb(var(--color-outline-subtle));
```

## Quick Migration

Replace this:
```tsx
// ❌ Before
<div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:bg-white/10 transition">
```

With this:
```tsx
// ✓ After
import { cardStyles } from '@ainexsuite/ui';
<div className={`${cardStyles.glass} p-6`}>
```

Or this:
```tsx
// ✓ Better
import { cardVariants } from '@ainexsuite/ui';
<div className={cardVariants({ variant: 'glass', padding: 'lg', interactive: true })}>
```

## Documentation Links

- **Full Guide**: `/packages/ui/src/config/README.md`
- **Examples**: `/packages/ui/src/config/EXAMPLES.md`
- **Design System**: `/docs/ui-ux/DESIGN_SYSTEM_ESSENTIALS.md`

---

⭐ = Most commonly used
