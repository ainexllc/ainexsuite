# Loading Components Migration Guide

This guide helps you replace existing loading patterns with the unified loading components from `@ainexsuite/ui`.

## Quick Reference

| Old Pattern | New Component | Import |
|------------|---------------|--------|
| Custom spinner div | `<Spinner />` | `import { Spinner } from '@ainexsuite/ui'` |
| Loader2 icon | `<Spinner />` | `import { Spinner } from '@ainexsuite/ui'` |
| Full page loading | `<PageLoading />` | `import { PageLoading } from '@ainexsuite/ui'` |
| Overlay loading | `<LoadingOverlay />` | `import { LoadingOverlay } from '@ainexsuite/ui'` |
| Inline dots | `<LoadingDots />` | `import { LoadingDots } from '@ainexsuite/ui'` |

## Step-by-Step Migration

### 1. Replace Custom Spinner Divs

**Before (apps/main/src/components/activity-feed.tsx:90):**
```tsx
<div className="h-6 w-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
```

**After:**
```tsx
import { Spinner } from '@ainexsuite/ui';

<Spinner size="md" color="accent" className="mx-auto mb-3" />
```

### 2. Replace Loader2 Icon Usage

**Before (apps/main/src/components/navigation-panel.tsx:161):**
```tsx
<RefreshCw className={clsx('h-3 w-3 text-ink-400', isChecking && 'animate-spin')} />
```

**After:**
```tsx
import { Spinner } from '@ainexsuite/ui';

{isChecking ? (
  <Spinner size="sm" color="ink" />
) : (
  <RefreshCw className="h-3 w-3 text-ink-400" />
)}
```

### 3. Replace WorkspaceLoadingScreen

**Before (packages/ui/src/components/layouts/workspace-loading-screen.tsx):**
```tsx
export function WorkspaceLoadingScreen({ message = 'Loading...' }: WorkspaceLoadingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-base">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary,#8b5cf6)]" />
        {message && <p className="text-sm text-zinc-500">{message}</p>}
      </div>
    </div>
  );
}
```

**After:**
```tsx
import { PageLoading } from '@ainexsuite/ui';

// Simple replacement
<PageLoading message="Loading..." />

// Or with app-specific customization
<PageLoading
  message="Loading workspace..."
  background="gradient"
  logo="/app-logo.svg"
/>
```

### 4. Button Loading States

**Before:**
```tsx
<button disabled={loading} className="...">
  {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
  Submit
</button>
```

**After:**
```tsx
import { Spinner } from '@ainexsuite/ui';

<button disabled={loading} className="...">
  {loading && <Spinner size="sm" color="white" className="mr-2" />}
  {loading ? 'Processing...' : 'Submit'}
</button>
```

### 5. Inline Loading Text

**Before:**
```tsx
<span className="text-xs text-ink-400 animate-pulse">Loading context...</span>
```

**After:**
```tsx
import { LoadingDots } from '@ainexsuite/ui';

<span className="text-xs text-ink-400 flex items-center gap-2">
  Loading context
  <LoadingDots size="sm" color="ink" />
</span>
```

### 6. Processing Overlays

**Before:**
```tsx
{isProcessing && (
  <div className="absolute inset-0 bg-surface-overlay/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-surface-elevated rounded-2xl p-6 shadow-lg">
      <Loader2 className="h-8 w-8 animate-spin text-accent-500" />
      <p className="mt-2 text-sm text-ink-700">Processing...</p>
    </div>
  </div>
)}
```

**After:**
```tsx
import { LoadingOverlay } from '@ainexsuite/ui';

<LoadingOverlay
  isLoading={isProcessing}
  message="Processing..."
/>
```

## Component-by-Component Checklist

### Spinner
- [ ] Replace custom spinner divs
- [ ] Replace direct Loader2 usage
- [ ] Update size props: map custom classes to 'sm' | 'md' | 'lg' | 'xl'
- [ ] Update color props: use 'accent' | 'primary' | 'ink' | 'white'
- [ ] Preserve className for positioning (mx-auto, etc.)

### LoadingOverlay
- [ ] Replace absolute positioned overlays
- [ ] Add isLoading prop (convert from conditional rendering)
- [ ] Add message prop if text was shown
- [ ] Set fullScreen={true} if covering viewport
- [ ] Set blur={false} if no backdrop blur was used

### LoadingDots
- [ ] Replace animate-pulse text
- [ ] Replace custom dot animations
- [ ] Update size to match context
- [ ] Use for inline loading states

### PageLoading
- [ ] Replace full-page loading screens
- [ ] Replace WorkspaceLoadingScreen usage
- [ ] Add custom logo if needed
- [ ] Set background style preference
- [ ] Update message text

## Files to Update

Based on search results, these files have loading patterns:

```
apps/main/src/components/
├── navigation-panel.tsx (line 161: RefreshCw animate-spin)
├── universal-search.tsx (lines 51, 89, 114, 227, 271: loading state)
├── activity-panel.tsx (lines 22, 25, 145, 199, 220, 240: loading states)
├── activity-feed.tsx (lines 66, 77, 80, 87, 90, 91: loading with spinner div)
└── smart-dashboard/smart-grid.tsx (line 46: loading state)

packages/ui/src/components/layouts/
└── workspace-loading-screen.tsx (can be deprecated or rewritten)
```

## Testing Checklist

After migration, verify:

- [ ] Spinners animate smoothly
- [ ] Overlays appear/disappear correctly
- [ ] Colors match app theme (accent, primary, etc.)
- [ ] Sizes are appropriate for context
- [ ] Loading states are accessible (screen readers)
- [ ] No console errors or warnings
- [ ] Build succeeds: `pnpm build`
- [ ] TypeScript types are correct

## Common Issues

### Issue: Colors don't match theme
**Solution:** Use CSS variable-based colors ('accent', 'primary') instead of hardcoded colors.

### Issue: Spinner too large/small
**Solution:** Use appropriate size prop: 'sm' (16px), 'md' (24px), 'lg' (32px), 'xl' (48px)

### Issue: Overlay doesn't cover parent
**Solution:** Ensure parent has `position: relative` or use `fullScreen={true}`

### Issue: Loading state flickers
**Solution:** Add minimum display time or debounce loading state changes

## Best Practices

1. **Consistency**: Use the same loading pattern for similar contexts across all apps
2. **Accessibility**: Loading components include ARIA attributes automatically
3. **Performance**: Use `<LoadingDots />` for inline states, not full `<Spinner />`
4. **UX**: Always provide a message for long-running operations
5. **Theming**: Use color props that respect app theme variables

## Example Conversion

Here's a complete before/after example:

**Before:**
```tsx
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

function MyComponent() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-accent-500" />
          <p className="text-sm text-ink-600">Loading data...</p>
        </div>
      </div>
    );
  }

  return <div>Content</div>;
}
```

**After:**
```tsx
import { PageLoading } from '@ainexsuite/ui';
import { useState } from 'react';

function MyComponent() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <PageLoading message="Loading data..." />;
  }

  return <div>Content</div>;
}
```

## Next Steps

1. Review all files with loading patterns
2. Create a branch: `git checkout -b refactor/unified-loading-components`
3. Update components one app at a time
4. Test thoroughly after each app
5. Remove old loading component files
6. Update tests if needed
7. Create PR with all changes
