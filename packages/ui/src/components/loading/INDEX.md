# Loading Components - Complete Documentation Index

Welcome to the unified loading components documentation for AinexSuite.

## Quick Links

### Main Documentation
- [README.md](./README.md) - Component API documentation and usage examples
- [SUMMARY.md](./SUMMARY.md) - Implementation overview and technical details
- [MIGRATION.md](./MIGRATION.md) - Step-by-step migration guide from old patterns
- [COMPARISON.md](./COMPARISON.md) - Before/after comparisons showing improvements
- [COMPLETE_LOADING_SYSTEM.md](./COMPLETE_LOADING_SYSTEM.md) ✨ NEW - Complete system overview

### Component-Specific Guides
- [SKELETON_GUIDE.md](./SKELETON_GUIDE.md) ✨ NEW - LoadingSkeleton comprehensive guide
- [LOADING_BUTTON_GUIDE.md](../buttons/LOADING_BUTTON_GUIDE.md) ✨ NEW - LoadingButton comprehensive guide

### Examples
- [examples.tsx](./examples.tsx) - Visual examples of all components
- [loading-skeleton.examples.tsx](./loading-skeleton.examples.tsx) ✨ NEW - LoadingSkeleton examples
- [loading-button.examples.tsx](../buttons/loading-button.examples.tsx) ✨ NEW - LoadingButton examples

## Components

### Core Components (5)

1. **Spinner** - Basic animated spinner
   - 4 sizes: sm, md, lg, xl
   - Theme-aware colors
   - Lightweight and flexible

2. **LoadingOverlay** - Full overlay with spinner
   - Glassmorphism backdrop
   - Optional blur effect
   - Parent or fullscreen coverage

3. **LoadingDots** - Animated bouncing dots
   - 3 sizes: sm, md, lg
   - Perfect for inline states
   - Subtle and non-intrusive

4. **PageLoading** - Full-page loading screen
   - Atmospheric background
   - Optional logo display
   - Professional initial load experience

5. **LoadingSkeleton** ✨ NEW - Content placeholders
   - 5 variants: text, circle, rect, avatar, card
   - Animated shimmer effect
   - Composable for complex layouts
   - Multi-line text support

### Related Components

- **LoadingButton** (`buttons/loading-button.tsx`) ✨ NEW - Button with loading state
- **ListSkeleton** (`lists/list-skeleton.tsx`) - List item skeletons

## File Overview

```
loading/
├── index.ts              (4 lines)     - Package exports
├── spinner.tsx           (89 lines)    - Basic spinner component
├── loading-overlay.tsx   (103 lines)   - Overlay component
├── loading-dots.tsx      (110 lines)   - Dots animation
├── page-loading.tsx      (128 lines)   - Full page loading
├── examples.tsx          (215 lines)   - Usage examples
├── README.md             (192 lines)   - API documentation
├── SUMMARY.md            (207 lines)   - Implementation summary
├── MIGRATION.md          (272 lines)   - Migration guide
├── COMPARISON.md         (367 lines)   - Before/after analysis
└── INDEX.md             (this file)    - Documentation index

Total: 1,687 lines of code and documentation
```

## Quick Start

### Installation

Components are available in `@ainexsuite/ui`:

```bash
# Already installed if you're in the monorepo
pnpm install
```

### Import

```tsx
import {
  Spinner,
  LoadingOverlay,
  LoadingDots,
  PageLoading,
  LoadingSkeleton,      // ✨ NEW
  LoadingButton,        // ✨ NEW
  ListSkeleton,
} from '@ainexsuite/ui';
```

### Basic Usage

```tsx
// Simple spinner
<Spinner size="md" color="accent" />

// Overlay
<LoadingOverlay isLoading={true} message="Processing..." />

// Inline dots
<LoadingDots size="sm" />

// Full page
<PageLoading message="Loading workspace..." />

// ✨ NEW: Skeleton placeholders
<LoadingSkeleton variant="text" width="80%" />
<LoadingSkeleton variant="avatar" width={48} height={48} />
<LoadingSkeleton variant="card" height="200px" />

// ✨ NEW: Loading button
<LoadingButton loading={isSubmitting} loadingText="Submitting...">
  Submit
</LoadingButton>
```

## Documentation Guide

### For New Developers
1. Start with [README.md](./README.md) for API documentation
2. Review [examples.tsx](./examples.tsx) for visual reference
3. Check [SUMMARY.md](./SUMMARY.md) for design decisions

### For Migration
1. Read [MIGRATION.md](./MIGRATION.md) for step-by-step guide
2. Reference [COMPARISON.md](./COMPARISON.md) for patterns to replace
3. Use [examples.tsx](./examples.tsx) as a reference

### For Maintenance
1. Review [SUMMARY.md](./SUMMARY.md) for architecture overview
2. Check [COMPARISON.md](./COMPARISON.md) for rationale
3. Update [README.md](./README.md) when adding features

## Common Use Cases

### Button Loading State
```tsx
<button disabled={loading}>
  {loading && <Spinner size="sm" color="white" className="mr-2" />}
  {loading ? 'Processing...' : 'Submit'}
</button>
```

### Conditional Page Loading
```tsx
if (isInitializing) {
  return <PageLoading message="Initializing..." />;
}
return <YourContent />;
```

### Processing Overlay
```tsx
<div className="relative">
  <YourContent />
  <LoadingOverlay
    isLoading={isSaving}
    message="Saving changes..."
  />
</div>
```

### Inline Loading Text
```tsx
<span className="flex items-center gap-2">
  Processing
  <LoadingDots size="sm" />
</span>
```

## Design Principles

1. **Consistency** - Same patterns across all apps
2. **Accessibility** - Built-in ARIA support
3. **Performance** - Optimized animations
4. **Flexibility** - Composable and customizable
5. **Type Safety** - Full TypeScript support
6. **Theme Awareness** - CSS variable integration

## Integration Points

### Works With
- All AinexSuite apps (main, journey, notes, etc.)
- Design system CSS variables
- Tailwind configuration
- TypeScript strict mode
- Next.js client components

### Compatible With
- Screen readers (WCAG compliant)
- All modern browsers
- Mobile and desktop
- Light and dark themes

## Support

### Documentation Files
- API Reference: README.md
- Examples: examples.tsx
- Migration: MIGRATION.md
- Comparisons: COMPARISON.md
- Summary: SUMMARY.md

### Code Examples
All documentation includes working code examples that can be copied directly.

### Types
Full TypeScript types available:
- SpinnerProps, SpinnerSize
- LoadingOverlayProps
- LoadingDotsProps, LoadingDotsSize
- PageLoadingProps
- LoadingSkeletonProps, SkeletonVariant ✨ NEW
- LoadingButtonProps ✨ NEW

## Version History

### v1.0.0 (Current)
- Initial implementation
- 4 core components
- Full documentation
- Migration guide
- TypeScript types
- Accessibility support

## Next Steps

1. **New Features**: Import and use components
2. **Migration**: Follow MIGRATION.md guide
3. **Customization**: Use className prop for app-specific styles
4. **Feedback**: Report issues or suggestions

## Contributing

When updating loading components:
1. Update component files
2. Update README.md if API changes
3. Add examples to examples.tsx
4. Update MIGRATION.md if patterns change
5. Rebuild: `pnpm build --filter @ainexsuite/ui`

## Related Components

- **ListSkeleton** - For list loading with shimmer effect
- **WorkspaceLoadingScreen** - Legacy, consider using PageLoading

---

**Last Updated:** November 28, 2025
**Package:** @ainexsuite/ui v1.0.0
**Maintainer:** AinexSuite Team
