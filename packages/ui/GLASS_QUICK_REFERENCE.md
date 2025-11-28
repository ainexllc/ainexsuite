# Glassmorphism Quick Reference

## TL;DR

Use the `glass` tokens from `@ainexsuite/ui/config/tokens` for consistent theme-aware glassmorphism.

```tsx
import { glass } from '@ainexsuite/ui/config/tokens';

<div className={glass.heavy}>Content</div>
```

## Available Glass Tokens

```typescript
glass.light   // Minimal transparency, subtle blur
glass.medium  // Balanced glass effect
glass.heavy   // Strong blur, prominent effect (most common)
glass.card    // Optimized for card components
glass.overlay // For modal/drawer backdrops
```

## Common Patterns

### Card/Container
```tsx
// OLD (dark only)
className="bg-black/60 backdrop-blur-xl border border-white/10"

// NEW (theme-aware)
className={glass.heavy}
// or
className="bg-white/80 dark:bg-card/60 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 shadow-lg dark:shadow-none"
```

### Modal Backdrop
```tsx
// OLD
className="fixed inset-0 bg-black/60 backdrop-blur-md"

// NEW
className={glass.overlay}
// or
className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md"
```

### Sidebar
```tsx
// Use glass.heavy or glass.card
className={`${glass.heavy} fixed left-0 top-0 h-full w-64`}
```

## Text Colors

```tsx
// Headings/primary text
text-text-primary

// Body text
text-text-secondary

// Muted/helper text
text-text-muted

// OLD → NEW
text-white      → text-text-primary
text-white/80   → text-text-primary
text-white/60   → text-text-secondary
text-white/40   → text-text-muted
```

## Borders

```tsx
// Semantic border
border-border

// Custom opacity (when needed)
border-gray-200/50 dark:border-white/10

// OLD → NEW
border-white/10 → border-border
border-white/20 → border-gray-200/50 dark:border-white/20
```

## Shadows

Always add conditional shadows for light mode depth:

```tsx
shadow-lg dark:shadow-none
```

## Button Hover States

```tsx
hover:bg-black/5 dark:hover:bg-white/10
```

## Background Opacity

For decorative backgrounds, reduce opacity in light mode:

```tsx
className="... dark:opacity-100 opacity-50"
```

## Complete Example

```tsx
import { glass } from '@ainexsuite/ui/config/tokens';

export function MyCard() {
  return (
    <div className={cn(glass.heavy, "rounded-xl p-6")}>
      <h3 className="text-xl font-semibold text-text-primary">
        Title
      </h3>
      <p className="text-text-secondary mt-2">
        Body content
      </p>
      <button className="mt-4 px-4 py-2 rounded-lg bg-primary text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
        Action
      </button>
    </div>
  );
}
```

## Workspace Backgrounds

```tsx
import { WorkspaceBackground } from '@ainexsuite/ui/components/backgrounds';

// In your page/layout
<WorkspaceBackground variant="aurora" intensity={0.25} />
```

**Variants:**
- `glow` - Default radial gradient
- `aurora` - Northern lights effect
- `minimal` - Very subtle
- `grid` - Grid pattern
- `dots` - Dot matrix
- `mesh` - Animated mesh gradient

## When to Use What

| Component Type | Token | Why |
|---------------|-------|-----|
| Modal content | `glass.heavy` | Strong separation |
| Card | `glass.card` | Optimized for cards |
| Sidebar | `glass.heavy` | Prominent UI |
| Dropdown | `glass.medium` | Balanced effect |
| Toast | `glass.medium` | Readable overlay |
| Backdrop | `glass.overlay` | Screen dimming |
| Subtle effect | `glass.light` | Minimal UI |

## Testing

1. Toggle theme in your app
2. Check both modes look good
3. Verify text contrast
4. Ensure borders are visible
5. Confirm shadows only in light mode

## See Also

- `packages/ui/GLASSMORPHISM_THEME_AWARE.md` - Full migration guide
- `packages/ui/src/config/tokens.ts` - Source implementation
- `/GLASSMORPHISM_UPDATE_SUMMARY.md` - Update status

---

**Updated:** 2025-11-28
