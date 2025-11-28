# Loading Components

Unified loading components for consistent loading states across all AinexSuite apps.

## Components

### Spinner

Basic animated spinner using Loader2 icon from lucide-react.

```tsx
import { Spinner } from '@ainexsuite/ui';

// Default
<Spinner />

// Large with custom color
<Spinner size="lg" color="accent" />

// Custom color class
<Spinner color="text-orange-500" />
```

**Props:**
- `size`: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
- `color`: 'accent' | 'primary' | 'ink' | 'white' | custom CSS class (default: 'accent')
- Extends HTMLDivElement props

### LoadingOverlay

Full overlay with glassmorphism backdrop and centered spinner.

```tsx
import { LoadingOverlay } from '@ainexsuite/ui';

// Basic overlay
<LoadingOverlay isLoading={isProcessing} />

// With message
<LoadingOverlay
  isLoading={true}
  message="Processing your request..."
/>

// Full screen without blur
<LoadingOverlay
  isLoading={true}
  fullScreen
  blur={false}
/>
```

**Props:**
- `isLoading`: boolean (required) - Whether overlay is visible
- `message`: string - Optional message below spinner
- `blur`: boolean - Enable backdrop blur (default: true)
- `fullScreen`: boolean - Cover full screen vs parent (default: false)
- `spinnerSize`: SpinnerSize - Size of spinner (default: 'lg')
- `spinnerColor`: string - Color of spinner (default: 'accent')

### LoadingDots

Three animated bouncing dots for inline loading states.

```tsx
import { LoadingDots } from '@ainexsuite/ui';

// Default
<LoadingDots />

// Inline with text
<span>Processing<LoadingDots size="sm" /></span>

// Large white dots
<LoadingDots size="lg" color="white" />
```

**Props:**
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `color`: 'accent' | 'primary' | 'ink' | 'white' | custom CSS class (default: 'accent')

### PageLoading

Full-page loading screen for initial app/page loads with optional logo.

```tsx
import { PageLoading } from '@ainexsuite/ui';

// Default
<PageLoading />

// With custom message
<PageLoading message="Initializing workspace..." />

// With custom logo component
<PageLoading logo={<YourLogo />} />

// With logo URL
<PageLoading logo="/logo.svg" />

// Solid background
<PageLoading background="solid" />
```

**Props:**
- `message`: string - Message to display (default: 'Loading...')
- `showLogo`: boolean - Show logo above spinner (default: true)
- `logo`: ReactNode | string - Custom logo component or image URL
- `background`: 'gradient' | 'solid' | 'none' (default: 'gradient')

### LoadingSkeleton

Versatile skeleton loader for content placeholders with shimmer effect.

```tsx
import { LoadingSkeleton } from '@ainexsuite/ui';

// Text placeholder
<LoadingSkeleton variant="text" width="80%" />

// Multiple text lines
<LoadingSkeleton variant="text" lines={3} />

// Avatar
<LoadingSkeleton variant="avatar" />

// Circle
<LoadingSkeleton variant="circle" width={48} height={48} />

// Card
<LoadingSkeleton variant="card" height="200px" />

// Custom rectangle
<LoadingSkeleton variant="rect" width="300px" height="150px" />

// Without animation
<LoadingSkeleton variant="text" animate={false} />

// Composite layout
<div className="flex items-center gap-4">
  <LoadingSkeleton variant="avatar" width={64} height={64} />
  <div className="flex-1 space-y-3">
    <LoadingSkeleton variant="text" width="40%" />
    <LoadingSkeleton variant="text" width="60%" />
  </div>
</div>
```

**Props:**
- `variant`: 'text' | 'circle' | 'rect' | 'avatar' | 'card' (default: 'rect')
- `width`: string | number - CSS width or pixels
- `height`: string | number - CSS height or pixels
- `animate`: boolean - Enable shimmer animation (default: true)
- `lines`: number - Number of text lines (for text variant, default: 1)
- `lineSpacing`: string - Spacing between lines (default: '0.5rem')

## Design System Integration

All components:
- Use CSS variables for colors (accent, primary, ink)
- Support glassmorphism with backdrop-blur
- Include proper ARIA attributes for accessibility
- Follow consistent sizing scales
- Integrate with Tailwind's theme configuration

## Accessibility

All loading components include:
- `role="status"` or appropriate role
- `aria-busy="true"`
- `aria-label` or `aria-live` as appropriate
- Hidden text for screen readers

## Usage Examples

### Replace existing spinners

**Before:**
```tsx
<div className="h-6 w-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
```

**After:**
```tsx
<Spinner size="md" color="accent" />
```

### Full page loading

**Before:**
```tsx
<div className="min-h-screen flex items-center justify-center">
  <Loader2 className="h-8 w-8 animate-spin" />
</div>
```

**After:**
```tsx
<PageLoading message="Loading workspace..." />
```

### Processing overlay

**Before:**
```tsx
{isProcessing && (
  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-white" />
  </div>
)}
```

**After:**
```tsx
<LoadingOverlay isLoading={isProcessing} message="Processing..." />
```

## Migration Guide

1. Import from `@ainexsuite/ui`:
   ```tsx
   import { Spinner, LoadingOverlay, LoadingDots, PageLoading } from '@ainexsuite/ui';
   ```

2. Replace custom spinner implementations with `<Spinner />`

3. Replace full-page loading screens with `<PageLoading />`

4. Replace inline loading states with `<LoadingDots />`

5. Replace overlay loading with `<LoadingOverlay />`

6. Remove custom loading component files

## Button Integration

### LoadingButton

Button with built-in loading state that shows spinner and disables interaction.

```tsx
import { LoadingButton } from '@ainexsuite/ui';

// Basic usage
<LoadingButton loading={isSubmitting}>
  Submit
</LoadingButton>

// With loading text
<LoadingButton
  loading={isSaving}
  loadingText="Saving..."
>
  Save Changes
</LoadingButton>

// Spinner position
<LoadingButton
  loading={isProcessing}
  spinnerPosition="right"
>
  Process
</LoadingButton>

// All button variants supported
<LoadingButton variant="accent" loading={isDeleting}>
  Delete
</LoadingButton>
```

**Props:**
- All `Button` props (variant, size, etc.)
- `loading`: boolean - Whether button is in loading state
- `loadingText`: string - Text to show when loading (overrides children)
- `spinnerPosition`: 'left' | 'right' (default: 'left')
- `spinnerSize`: 'sm' | 'md' | 'lg' | 'xl' - Override spinner size

## Related Components

- `ListSkeleton` - For list loading states with shimmer effect (in lists package)
- `WorkspaceLoadingScreen` - Workspace-specific loading screen
- `LoadingButton` - Button with built-in loading state (in buttons package)
