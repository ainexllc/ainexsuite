# Complete Loading System - AinexSuite

Comprehensive loading component system for consistent loading states across all apps.

## Components Overview

| Component | Purpose | Location | Status |
|-----------|---------|----------|--------|
| `Spinner` | Simple animated spinner | `loading/spinner.tsx` | ✅ Complete |
| `LoadingOverlay` | Full overlay with backdrop | `loading/loading-overlay.tsx` | ✅ Complete |
| `LoadingDots` | Inline bouncing dots | `loading/loading-dots.tsx` | ✅ Complete |
| `PageLoading` | Full-page loading screen | `loading/page-loading.tsx` | ✅ Complete |
| `LoadingSkeleton` | Content placeholders | `loading/loading-skeleton.tsx` | ✅ Complete |
| `LoadingButton` | Button with loading state | `buttons/loading-button.tsx` | ✅ Complete |
| `ListSkeleton` | List item skeletons | `lists/list-skeleton.tsx` | ✅ Complete |

## Quick Reference

### Import Statement

```tsx
import {
  Spinner,
  LoadingOverlay,
  LoadingDots,
  PageLoading,
  LoadingSkeleton,
  LoadingButton,
  ListSkeleton,
} from '@ainexsuite/ui';
```

### When to Use What

| Scenario | Component | Example |
|----------|-----------|---------|
| Inline loading indicator | `Spinner` | Inside a card, next to text |
| Processing overlay | `LoadingOverlay` | Modal save action |
| Full page initial load | `PageLoading` | App initialization |
| Subtle inline loading | `LoadingDots` | "Processing..." text |
| Content placeholder | `LoadingSkeleton` | Profile card loading |
| List of items loading | `ListSkeleton` | Notes list, todo list |
| Button async action | `LoadingButton` | Form submit, delete action |

## Component Details

### 1. Spinner

**Use for**: Generic loading indicators

```tsx
<Spinner size="md" color="accent" />
```

**Sizes**: `sm` | `md` | `lg` | `xl`
**Colors**: `accent` | `primary` | `ink` | `white` | custom class

---

### 2. LoadingOverlay

**Use for**: Modal/form processing, blocking interactions

```tsx
<LoadingOverlay
  isLoading={isProcessing}
  message="Saving changes..."
  blur={true}
  fullScreen={false}
/>
```

**Key Props**:
- `isLoading` - Toggle visibility
- `message` - Optional text below spinner
- `blur` - Backdrop blur effect
- `fullScreen` - Cover viewport vs parent

---

### 3. LoadingDots

**Use for**: Inline text loading, subtle indicators

```tsx
<span>Processing<LoadingDots size="sm" /></span>
```

**Sizes**: `sm` | `md` | `lg`
**Colors**: Same as Spinner

---

### 4. PageLoading

**Use for**: Initial app/page loads, route transitions

```tsx
<PageLoading
  message="Initializing workspace..."
  logo={<YourLogo />}
  background="gradient"
/>
```

**Key Props**:
- `message` - Loading message
- `logo` - Component or image URL
- `showLogo` - Toggle logo display
- `background` - `gradient` | `solid` | `none`

---

### 5. LoadingSkeleton

**Use for**: Content placeholders that match actual content shape

```tsx
{/* Single line */}
<LoadingSkeleton variant="text" width="80%" />

{/* Multiple lines */}
<LoadingSkeleton variant="text" lines={3} />

{/* Avatar */}
<LoadingSkeleton variant="avatar" width={48} height={48} />

{/* Card */}
<LoadingSkeleton variant="card" height="200px" />
```

**Variants**: `text` | `circle` | `rect` | `avatar` | `card`

**Key Props**:
- `variant` - Shape type
- `width`, `height` - Size (px or string)
- `lines` - For text variant
- `animate` - Enable shimmer effect

---

### 6. LoadingButton

**Use for**: Any async button action

```tsx
<LoadingButton
  loading={isSubmitting}
  loadingText="Submitting..."
  variant="accent"
  size="md"
>
  Submit Form
</LoadingButton>
```

**Key Props**:
- `loading` - Toggle loading state
- `loadingText` - Override text when loading
- `spinnerPosition` - `left` | `right`
- All Button props (variant, size, etc.)

---

### 7. ListSkeleton

**Use for**: Loading states for lists of items

```tsx
<ListSkeleton count={5} variant="default" />
```

**Variants**: `default` | `compact`

## Common Patterns

### Form Submission

```tsx
function MyForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await submitForm();
      // Success
    } catch (error) {
      // Error handling
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <LoadingButton
        type="submit"
        loading={isSubmitting}
        loadingText="Submitting..."
      >
        Submit
      </LoadingButton>
    </form>
  );
}
```

### Content Loading

```tsx
function ContentArea() {
  const { data, isLoading } = useData();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton variant="text" width="60%" />
        <LoadingSkeleton variant="text" lines={3} />
        <LoadingSkeleton variant="card" height="200px" />
      </div>
    );
  }

  return <Content data={data} />;
}
```

### List Loading

```tsx
function NotesList() {
  const { notes, isLoading } = useNotes();

  if (isLoading) {
    return <ListSkeleton count={5} variant="default" />;
  }

  return notes.map(note => <NoteCard key={note.id} note={note} />);
}
```

### Processing Overlay

```tsx
function EditModal() {
  const [isSaving, setIsSaving] = React.useState(false);

  return (
    <Modal>
      <div className="relative">
        {/* Modal content */}

        <LoadingOverlay
          isLoading={isSaving}
          message="Saving changes..."
        />
      </div>
    </Modal>
  );
}
```

### Composite Skeleton

```tsx
function ProfileCardSkeleton() {
  return (
    <div className="flex items-center gap-4 p-6">
      <LoadingSkeleton variant="avatar" width={64} height={64} />
      <div className="flex-1 space-y-3">
        <LoadingSkeleton variant="text" width="40%" />
        <LoadingSkeleton variant="text" width="60%" />
        <LoadingSkeleton variant="text" width="50%" />
      </div>
    </div>
  );
}
```

## Design System Integration

### Colors

All components support accent colors via props or `useAppColors()`:

```tsx
import { useAppColors } from '@ainexsuite/theme';

function MyComponent() {
  const { primary } = useAppColors();

  return (
    <Spinner color={primary} />
  );
}
```

### Glassmorphism

Components use consistent glassmorphism styling:

```tsx
// Shared styles across components
className="bg-surface-elevated/80 backdrop-blur-md border border-white/10"
```

### Animations

- **Spinner**: `animate-spin` (Tailwind)
- **Dots**: `animate-bounce` with staggered delays
- **Skeleton**: `animate-pulse` + shimmer gradient
- **Duration**: 2s infinite for all animations

### Accessibility

All components include:
- ✅ Proper ARIA attributes
- ✅ Screen reader support
- ✅ Keyboard navigation (where applicable)
- ✅ Focus management

## Migration Guide

### Replace Custom Spinners

**Before:**
```tsx
<Loader2 className="h-6 w-6 animate-spin text-accent-500" />
```

**After:**
```tsx
<Spinner size="md" color="accent" />
```

### Replace Button Loading Logic

**Before:**
```tsx
<Button disabled={loading}>
  {loading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Loading...
    </>
  ) : (
    'Submit'
  )}
</Button>
```

**After:**
```tsx
<LoadingButton loading={loading} loadingText="Loading...">
  Submit
</LoadingButton>
```

### Replace Custom Skeletons

**Before:**
```tsx
<div className="h-4 w-3/4 bg-gray-300 animate-pulse rounded" />
```

**After:**
```tsx
<LoadingSkeleton variant="text" width="75%" />
```

## Performance Tips

1. **Reuse skeleton components** - Create named components for common layouts
2. **Conditional rendering** - Only render loading states when needed
3. **Avoid nested overlays** - Use one overlay per interaction context
4. **Skeleton complexity** - Simpler skeletons for many items

## Documentation Files

- `README.md` - Quick reference and examples
- `SKELETON_GUIDE.md` - Comprehensive LoadingSkeleton guide
- `LOADING_BUTTON_GUIDE.md` - Comprehensive LoadingButton guide
- `SUMMARY.md` - Component comparison and usage
- `MIGRATION.md` - Migration from old patterns
- `COMPARISON.md` - Component feature comparison
- `examples.tsx` - Live component examples

## Testing

All components are built and type-checked:

```bash
# Build ui package
pnpm --filter @ainexsuite/ui build

# Type check
pnpm --filter @ainexsuite/ui type-check
```

## Support

For issues or questions:
1. Check the component-specific guides
2. Review the examples in `*.examples.tsx` files
3. Refer to TypeScript types for prop details

## Status: ✅ Production Ready

All components are:
- ✅ Fully typed with TypeScript
- ✅ Documented with examples
- ✅ Accessible (ARIA compliant)
- ✅ Responsive and themeable
- ✅ Build verified
- ✅ Exported from `@ainexsuite/ui`
