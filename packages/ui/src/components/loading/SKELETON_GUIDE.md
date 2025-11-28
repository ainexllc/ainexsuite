# LoadingSkeleton Component Guide

Complete guide for using the LoadingSkeleton component across AinexSuite.

## Overview

`LoadingSkeleton` is a versatile content placeholder component that displays animated shimmer effects while content is loading. It supports multiple variants and can be composed to create complex loading layouts.

## Basic Usage

### Text Skeletons

```tsx
import { LoadingSkeleton } from '@ainexsuite/ui';

// Single line
<LoadingSkeleton variant="text" width="80%" />

// Multiple lines (paragraph)
<LoadingSkeleton variant="text" lines={3} />

// Custom line spacing
<LoadingSkeleton variant="text" lines={5} lineSpacing="1rem" />
```

### Shape Skeletons

```tsx
// Circle (e.g., for icons)
<LoadingSkeleton variant="circle" width={40} height={40} />

// Avatar
<LoadingSkeleton variant="avatar" /> // Default 48x48px

// Large avatar
<LoadingSkeleton variant="avatar" width={80} height={80} />

// Rectangle
<LoadingSkeleton variant="rect" width="300px" height="150px" />

// Card
<LoadingSkeleton variant="card" height="200px" />
```

## Variant Reference

| Variant | Default Size | Shape | Use Case |
|---------|-------------|-------|----------|
| `text` | width: auto, height: 1rem | Rounded pill | Single or multiple text lines |
| `circle` | 2.5rem × 2.5rem | Full circle | Icons, badges |
| `avatar` | 3rem × 3rem | Full circle | User avatars |
| `rect` | 100% × 5rem | Rounded corners | Images, banners |
| `card` | 100% × 12rem | Rounded 2xl | Card placeholders |

## Common Patterns

### Profile Card Loading

```tsx
function ProfileCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center gap-4">
        <LoadingSkeleton variant="avatar" width={64} height={64} />
        <div className="flex-1 space-y-3">
          <LoadingSkeleton variant="text" width="40%" />
          <LoadingSkeleton variant="text" width="60%" />
        </div>
      </div>
    </div>
  );
}
```

### Blog Post Loading

```tsx
function BlogPostSkeleton() {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
      {/* Featured Image */}
      <LoadingSkeleton variant="card" height="300px" className="mb-6" />

      {/* Title */}
      <LoadingSkeleton variant="text" width="80%" className="mb-4" />

      {/* Meta info */}
      <div className="mb-6 flex items-center gap-4">
        <LoadingSkeleton variant="circle" width={32} height={32} />
        <LoadingSkeleton variant="text" width="150px" />
        <LoadingSkeleton variant="text" width="100px" />
      </div>

      {/* Content */}
      <LoadingSkeleton variant="text" lines={8} />
    </article>
  );
}
```

### Dashboard Cards Loading

```tsx
function DashboardCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="mb-4 flex items-center justify-between">
            <LoadingSkeleton variant="text" width="100px" />
            <LoadingSkeleton variant="circle" width={40} height={40} />
          </div>
          <LoadingSkeleton variant="text" width="60%" className="mb-2" />
          <LoadingSkeleton variant="text" width="80%" />
        </div>
      ))}
    </div>
  );
}
```

### Table Rows Loading

```tsx
function TableRowsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-lg bg-white/5 p-4">
          <LoadingSkeleton variant="circle" width={40} height={40} />
          <LoadingSkeleton variant="text" width="30%" />
          <LoadingSkeleton variant="text" width="20%" />
          <LoadingSkeleton variant="text" width="15%" />
          <div className="flex-1" />
          <LoadingSkeleton variant="rect" width="80px" height="32px" />
        </div>
      ))}
    </div>
  );
}
```

### Comment List Loading

```tsx
function CommentListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex gap-3">
            <LoadingSkeleton variant="avatar" width={40} height={40} />
            <div className="flex-1 space-y-2">
              <LoadingSkeleton variant="text" width="30%" />
              <LoadingSkeleton variant="text" lines={2} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Advanced Usage

### Disabling Animation

```tsx
// Useful for reduced motion preferences
<LoadingSkeleton variant="text" animate={false} />
```

### Custom Styling

```tsx
// Custom background color
<LoadingSkeleton
  variant="rect"
  height="100px"
  className="bg-accent-500/20"
/>

// Custom border
<LoadingSkeleton
  variant="circle"
  width={100}
  height={100}
  className="border-4 border-accent-500/30"
/>
```

### Conditional Loading

```tsx
function DataDisplay({ data, isLoading }) {
  if (isLoading) {
    return <LoadingSkeleton variant="text" lines={3} />;
  }

  return <div>{data}</div>;
}
```

## Best Practices

### 1. Match Content Shape

Skeleton should closely match the shape and layout of actual content:

```tsx
// ❌ Don't use generic skeleton
<LoadingSkeleton variant="rect" />

// ✅ Match actual content layout
<div className="flex items-center gap-4">
  <LoadingSkeleton variant="avatar" />
  <div className="flex-1">
    <LoadingSkeleton variant="text" width="40%" />
    <LoadingSkeleton variant="text" width="60%" />
  </div>
</div>
```

### 2. Use Appropriate Variants

```tsx
// ❌ Using rect for circular content
<LoadingSkeleton variant="rect" width={40} height={40} />

// ✅ Use circle/avatar for circular content
<LoadingSkeleton variant="avatar" width={40} height={40} />
```

### 3. Maintain Visual Hierarchy

```tsx
// ✅ Different widths suggest content hierarchy
<LoadingSkeleton variant="text" width="80%" />  {/* Title */}
<LoadingSkeleton variant="text" width="60%" />  {/* Subtitle */}
<LoadingSkeleton variant="text" lines={3} />     {/* Body */}
```

### 4. Create Reusable Skeletons

```tsx
// Create skeleton components that match your actual components
function NoteCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <LoadingSkeleton variant="text" width="70%" className="mb-3" />
      <LoadingSkeleton variant="text" lines={4} />
      <div className="mt-4 flex gap-2">
        <LoadingSkeleton variant="rect" width="60px" height="24px" />
        <LoadingSkeleton variant="rect" width="60px" height="24px" />
      </div>
    </div>
  );
}
```

### 5. Respect Accessibility

The component automatically includes ARIA attributes, but ensure your loading states are announced:

```tsx
// Component handles this internally
<LoadingSkeleton
  variant="text"
  // Automatically includes:
  // role="status"
  // aria-busy="true"
  // aria-label="Loading"
/>
```

## Integration with Other Components

### With ListSkeleton

```tsx
import { ListSkeleton } from '@ainexsuite/ui';

// ListSkeleton for generic lists
<ListSkeleton count={5} variant="compact" />

// LoadingSkeleton for custom layouts
<div className="space-y-4">
  {[1, 2, 3].map((i) => (
    <div key={i} className="custom-layout">
      <LoadingSkeleton variant="avatar" />
      <LoadingSkeleton variant="text" lines={2} />
    </div>
  ))}
</div>
```

### With LoadingOverlay

```tsx
// Skeleton for content area
{isLoadingContent ? (
  <LoadingSkeleton variant="card" height="400px" />
) : (
  <Content />
)}

// Overlay for actions
<div className="relative">
  <Content />
  <LoadingOverlay isLoading={isProcessing} message="Saving..." />
</div>
```

## Animation Details

- **Duration**: 2s infinite
- **Effect**: Shimmer from left to right
- **Timing**: Linear
- **Base animation**: `animate-pulse` (Tailwind)
- **Shimmer**: Custom gradient overlay

## Performance Considerations

1. **Reuse skeletons**: Create skeleton components instead of inline definitions
2. **Limit complexity**: For many items, use simpler skeletons
3. **Conditional rendering**: Only render skeletons when needed

```tsx
// ✅ Good: Reusable skeleton
const NoteSkeleton = () => <LoadingSkeleton variant="card" />;

{isLoading && Array.from({ length: 10 }).map((_, i) => (
  <NoteSkeleton key={i} />
))}

// ❌ Avoid: Complex inline skeletons for many items
{isLoading && Array.from({ length: 100 }).map((_, i) => (
  <div key={i} className="complex-layout">
    {/* Many nested LoadingSkeleton components */}
  </div>
))}
```

## Migration from Custom Skeletons

### Before
```tsx
<div className="h-4 w-3/4 bg-gray-300 animate-pulse rounded" />
```

### After
```tsx
<LoadingSkeleton variant="text" width="75%" />
```

### Before
```tsx
<div className="flex items-center gap-3">
  <div className="h-10 w-10 bg-gray-300 rounded-full animate-pulse" />
  <div className="flex-1 space-y-2">
    <div className="h-4 w-1/2 bg-gray-300 rounded animate-pulse" />
    <div className="h-3 w-3/4 bg-gray-300 rounded animate-pulse" />
  </div>
</div>
```

### After
```tsx
<div className="flex items-center gap-3">
  <LoadingSkeleton variant="avatar" width={40} height={40} />
  <div className="flex-1 space-y-2">
    <LoadingSkeleton variant="text" width="50%" />
    <LoadingSkeleton variant="text" width="75%" />
  </div>
</div>
```

## TypeScript Support

```tsx
import { LoadingSkeleton, type SkeletonVariant, type LoadingSkeletonProps } from '@ainexsuite/ui';

// Type-safe variant
const variant: SkeletonVariant = 'text';

// Extend props
interface CustomSkeletonProps extends LoadingSkeletonProps {
  customProp?: string;
}
```

## Troubleshooting

### Skeleton doesn't match content width

```tsx
// ❌ Missing width constraint
<LoadingSkeleton variant="text" />

// ✅ Set explicit width or parent container
<div className="max-w-md">
  <LoadingSkeleton variant="text" width="100%" />
</div>
```

### Animation not showing

Check that the shimmer styles are injected (happens automatically) or add to global CSS:

```css
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

### Multiple lines not rendering correctly

```tsx
// ✅ Ensure variant is "text" for multiple lines
<LoadingSkeleton variant="text" lines={3} />

// ❌ Other variants don't support lines prop
<LoadingSkeleton variant="rect" lines={3} /> {/* lines ignored */}
```
