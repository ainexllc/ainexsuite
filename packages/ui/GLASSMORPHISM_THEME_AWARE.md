# Glassmorphism Theme-Aware Updates

## Overview
All glassmorphism components and background effects have been updated to work seamlessly in both light and dark modes.

## Key Changes

### 1. Glass Utility Tokens (`packages/ui/src/config/tokens.ts`)
Updated all glass presets to be theme-aware:

```typescript
export const glass = {
  // Light mode: white/translucent with subtle borders
  // Dark mode: dark/translucent with white borders
  light: 'bg-white/5 dark:bg-white/5 backdrop-blur-sm border border-gray-200/30 dark:border-white/10',
  medium: 'bg-white/80 dark:bg-white/10 backdrop-blur-md border border-gray-200/50 dark:border-white/20 shadow-lg dark:shadow-none',
  heavy: 'bg-white/80 dark:bg-card/60 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 shadow-lg dark:shadow-none',
  card: 'bg-card/80 dark:bg-card/60 backdrop-blur-lg border border-border shadow-lg dark:shadow-none',
  overlay: 'bg-black/40 dark:bg-black/60 backdrop-blur-md',
}
```

**Usage:**
```tsx
import { glass } from '@ainexsuite/ui/config/tokens';

<div className={glass.heavy}>
  Glassmorphic content
</div>
```

### 2. WorkspaceBackground Component
All background variants now support both themes with opacity controls:

- **Glow variant**: 50% opacity in light mode, 100% in dark mode
- **Aurora variant**: 40% base opacity in light, subtle shimmer at 20%/30%
- **Grid variant**: 30% grid opacity in light, vignette disabled in light mode
- **Dots variant**: 40% dots in light, 50% highlight in light
- **Mesh variant**: 50% mesh in light mode

**Usage:**
```tsx
import { WorkspaceBackground } from '@ainexsuite/ui/components/backgrounds';

<WorkspaceBackground variant="aurora" intensity={0.25} />
```

### 3. AI Insights Components

#### AIInsightsCard
- Backgrounds: `bg-white/80 dark:bg-card/80`
- Borders: Use `accentColor` with reduced opacity
- Text: Uses semantic color tokens (`text-text-primary`, `text-text-muted`)
- Buttons: `hover:bg-black/5 dark:hover:bg-white/10`
- Shadows: `shadow-lg dark:shadow-none`

#### AIInsightsBanner
- Container: `bg-card/80 dark:bg-surface-elevated/50`
- Borders: `border-border`
- Error states: `text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/10`

#### InsightCard
- Background: `bg-gray-50 dark:bg-white/5`
- Borders: `border-gray-200 dark:border-white/5`
- Hover: `hover:bg-gray-100 dark:hover:bg-white/10`

### 4. DataCard Component
Already using semantic colors:
- Background: `bg-card/60`
- Border: `border-border`
- Text: `text-card-foreground`

### 5. GlassModal Component
- Backdrop: `bg-black/40 dark:bg-black/60`
- Modal variants automatically theme-aware via variant classes

## Migration Pattern

### Old (Dark Only)
```tsx
className="bg-black/60 backdrop-blur-xl border border-white/10"
```

### New (Theme-Aware)
```tsx
className="bg-white/80 dark:bg-card/60 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 shadow-lg dark:shadow-none"
```

Or use the glass tokens:
```tsx
import { glass } from '@ainexsuite/ui/config/tokens';
className={glass.heavy}
```

## Text Color Migration

### Old
```tsx
text-white/80
text-white/40
text-yellow-400
```

### New
```tsx
text-text-primary
text-text-muted
text-yellow-500 dark:text-yellow-400
```

## Component Checklist

### Shared UI Package ✅
- [x] `config/tokens.ts` - Glass utilities
- [x] `backgrounds/workspace-background.tsx` - All variants
- [x] `ai/ai-insights-card.tsx` - Complete component
- [x] `insights/ai-insights-banner.tsx` - Banner + InsightCard
- [x] `cards/data-card.tsx` - Already using semantic colors
- [x] `glass-modal.tsx` - Backdrop update

### Apps to Update
Each app should audit these patterns:
- [ ] Modal overlays (`bg-black/60` → `bg-black/40 dark:bg-black/60`)
- [ ] Card backgrounds (`bg-black/60` → glass tokens or theme-aware classes)
- [ ] Text colors (hardcoded white → semantic tokens)
- [ ] Border colors (`border-white/10` → `border-border` or dual-theme)

## Best Practices

1. **Use Glass Tokens**: Prefer `glass.heavy`, `glass.card`, etc. over custom classes
2. **Semantic Colors**: Use `text-text-primary`, `text-text-muted` instead of hardcoded
3. **Conditional Shadows**: Add `shadow-lg dark:shadow-none` for depth in light mode
4. **Opacity Control**: Use `dark:opacity-100 opacity-50` for background effects
5. **Test Both Modes**: Always verify components look good in light AND dark mode

## Testing

To test glassmorphism in both modes:
1. Toggle theme using ThemeToggle component
2. Check background visibility (should be subtle in light, pronounced in dark)
3. Verify text contrast in both modes
4. Ensure borders are visible but not harsh
5. Confirm shadows appear only in light mode

## Files Modified

### Core Package Files
- `/Users/dino/ainex/ainexsuite/packages/ui/src/config/tokens.ts`
- `/Users/dino/ainex/ainexsuite/packages/ui/src/components/backgrounds/workspace-background.tsx`
- `/Users/dino/ainex/ainexsuite/packages/ui/src/components/ai/ai-insights-card.tsx`
- `/Users/dino/ainex/ainexsuite/packages/ui/src/components/insights/ai-insights-banner.tsx`
- `/Users/dino/ainex/ainexsuite/packages/ui/src/components/glass-modal.tsx`

### Apps with Glassmorphism
See git status for modified files in:
- `apps/journey/`
- `apps/notes/`
- `apps/grow/`
- `apps/fit/`
- `apps/moments/`
- `apps/pulse/`
- And others...

## Next Steps

1. **Audit app-specific components** for hardcoded dark-only glassmorphism
2. **Replace inline styles** with glass tokens where appropriate
3. **Update custom modals** to use theme-aware backdrops
4. **Test extensively** in both light and dark modes
5. **Document app-specific patterns** if they deviate from standard

---

**Updated:** 2025-11-28
**Affects:** All apps using glassmorphism, WorkspaceBackground, AI Insights
