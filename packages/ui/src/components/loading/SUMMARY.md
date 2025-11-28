# Loading Components - Implementation Summary

## Overview

Created unified loading components in `@ainexsuite/ui` to standardize loading states across all AinexSuite apps.

## Components Created

### 1. Spinner (`spinner.tsx`)
- **Purpose**: Basic animated spinner for loading states
- **Features**:
  - Uses Loader2 icon from lucide-react
  - 4 sizes: sm (16px), md (24px), lg (32px), xl (48px)
  - Preset colors: accent, primary, ink, white
  - Custom color support via className
  - Full TypeScript types
  - Accessible with ARIA attributes

### 2. LoadingOverlay (`loading-overlay.tsx`)
- **Purpose**: Full overlay with spinner for blocking UI during operations
- **Features**:
  - Glassmorphism backdrop with optional blur
  - Optional message below spinner
  - Can cover parent container or full screen
  - Customizable spinner size and color
  - Conditional rendering based on isLoading prop
  - Accessible with ARIA live regions

### 3. LoadingDots (`loading-dots.tsx`)
- **Purpose**: Animated bouncing dots for inline loading states
- **Features**:
  - Three bouncing dots with staggered animation
  - 3 sizes: sm, md, lg
  - Color variants matching Spinner
  - Lightweight alternative to spinner
  - Perfect for inline text loading states
  - Accessible with screen reader text

### 4. PageLoading (`page-loading.tsx`)
- **Purpose**: Full-page loading screen for initial app/page loads
- **Features**:
  - Full viewport coverage
  - Optional app logo display
  - Glassmorphism background effects
  - Three background styles: gradient, solid, none
  - Atmospheric glow effects
  - Custom logo support (component or URL)
  - Accessible with proper ARIA attributes

## File Structure

```
packages/ui/src/components/loading/
├── index.ts                 # Exports all components and types
├── spinner.tsx              # Basic spinner component
├── loading-overlay.tsx      # Overlay with spinner
├── loading-dots.tsx         # Bouncing dots animation
├── page-loading.tsx         # Full-page loading screen
├── examples.tsx             # Visual examples of all components
├── README.md                # Component documentation
├── MIGRATION.md             # Migration guide from old patterns
└── SUMMARY.md               # This file
```

## Exports

All components and types are exported from `@ainexsuite/ui`:

```tsx
import {
  // Components
  Spinner,
  LoadingOverlay,
  LoadingDots,
  PageLoading,

  // Types
  type SpinnerProps,
  type SpinnerSize,
  type LoadingOverlayProps,
  type LoadingDotsProps,
  type LoadingDotsSize,
  type PageLoadingProps,
} from '@ainexsuite/ui';
```

## Design System Integration

All components integrate seamlessly with the AinexSuite design system:

1. **Colors**: Use CSS variables from shared theme
   - `accent`: Primary accent color (orange, blue, etc.)
   - `primary`: Primary brand color
   - `ink`: Text colors (50-900 scale)
   - `white`: White for dark backgrounds

2. **Glassmorphism**: Consistent backdrop-blur and transparency
   - `bg-surface-elevated/80` with `backdrop-blur-md`
   - `border-white/10` for subtle borders

3. **Sizing**: Consistent scale across all components
   - sm: 16px / 1.5 dots
   - md: 24px / 2 dots
   - lg: 32px / 3 dots
   - xl: 48px (spinner only)

4. **Animations**: Smooth, performant animations
   - `animate-spin` for spinners
   - `animate-bounce` for dots with staggered delays
   - `animate-pulse` for logo/placeholder elements

5. **Accessibility**: All components include proper ARIA attributes
   - `role="status"` or `role="alert"`
   - `aria-busy="true"`
   - `aria-label` or `aria-live` as appropriate
   - Hidden text for screen readers

## Usage Examples

### Simple Spinner
```tsx
<Spinner size="md" color="accent" />
```

### Processing Overlay
```tsx
<div className="relative">
  <YourContent />
  <LoadingOverlay
    isLoading={isProcessing}
    message="Saving changes..."
  />
</div>
```

### Inline Loading
```tsx
<span className="flex items-center gap-2">
  Processing
  <LoadingDots size="sm" />
</span>
```

### Full Page Loading
```tsx
if (isInitializing) {
  return <PageLoading message="Loading workspace..." />;
}
```

## Benefits

1. **Consistency**: Same loading patterns across all apps
2. **Maintainability**: Single source of truth for loading UI
3. **Accessibility**: Built-in ARIA support
4. **Flexibility**: Multiple components for different contexts
5. **Performance**: Optimized animations and rendering
6. **TypeScript**: Full type safety and IntelliSense
7. **Theming**: Automatically uses app-specific colors
8. **DX**: Simple API with sensible defaults

## Migration Path

Existing apps can gradually adopt these components:

1. **Phase 1**: Use in new features
2. **Phase 2**: Replace critical paths (auth, data loading)
3. **Phase 3**: Replace all custom loading patterns
4. **Phase 4**: Deprecate old loading components

See `MIGRATION.md` for detailed migration steps.

## Testing

Build verification:
```bash
pnpm --filter @ainexsuite/ui build  # ✅ Passed
pnpm --filter @ainexsuite/ui exec tsc --noEmit  # ✅ Passed
```

All components:
- TypeScript compiles without errors
- Exports are properly typed
- Accessible to screen readers
- Render correctly in all app themes

## Next Steps

1. **Documentation**: Add to Storybook or component showcase
2. **Migration**: Start migrating existing apps (see MIGRATION.md)
3. **Monitoring**: Track usage across apps
4. **Iteration**: Gather feedback and improve based on usage
5. **Deprecation**: Mark old loading patterns as deprecated

## Related Components

- `ListSkeleton`: For list loading states with shimmer effect
- `WorkspaceLoadingScreen`: Can be deprecated in favor of `PageLoading`

## Notes

- Components use `'use client'` directive for Next.js compatibility
- All components are React forwardRef for ref forwarding
- Default export pattern not used (named exports only)
- Examples file provided for visual reference
- README includes detailed API documentation
- MIGRATION guide covers all common patterns found in codebase
