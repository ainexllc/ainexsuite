# Migration Guide: ViewToggle & SegmentedControl

This guide helps you migrate existing view toggle implementations to use the unified components from `@ainexsuite/ui`.

## Benefits of Migration

- **Consistency**: Same look and feel across all apps
- **Accessibility**: Built-in ARIA support and keyboard navigation
- **Less Code**: Replace 20-30 lines with a single component
- **Maintenance**: Updates to design system automatically propagate
- **Features**: Get animations, focus management, and theming for free

---

## Notes App Migration

### Before

File: `/apps/notes/src/components/notes/view-toggle.tsx`

```tsx
"use client";

import { LayoutGrid, List } from "lucide-react";
import { clsx } from "clsx";
import type { ViewMode } from "@/lib/types/settings";

type ViewToggleProps = {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
};

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-black/40 backdrop-blur-sm p-1 shadow-sm border border-white/10">
      <button
        type="button"
        onClick={() => onViewModeChange("masonry")}
        className={clsx(
          "inline-flex h-8 w-8 items-center justify-center rounded-full transition-all",
          viewMode === "masonry"
            ? "bg-[var(--color-primary)] text-white shadow-md"
            : "text-white/60 hover:bg-white/10 hover:text-white"
        )}
        aria-label="Masonry view"
        title="Masonry view"
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onViewModeChange("list")}
        className={clsx(
          "inline-flex h-8 w-8 items-center justify-center rounded-full transition-all",
          viewMode === "list"
            ? "bg-[var(--color-primary)] text-white shadow-md"
            : "text-white/60 hover:bg-white/10 hover:text-white"
        )}
        aria-label="List view"
        title="List view"
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  );
}
```

### After

File: `/apps/notes/src/components/notes/view-toggle.tsx`

```tsx
"use client";

import { ViewToggle } from "@ainexsuite/ui";
import { LayoutGrid, List } from "lucide-react";
import type { ViewMode } from "@/lib/types/settings";

type ViewToggleProps = {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
};

export function NotesViewToggle({
  viewMode,
  onViewModeChange,
}: ViewToggleProps) {
  return (
    <ViewToggle
      value={viewMode}
      onChange={onViewModeChange}
      variant="default"
      options={[
        { value: "masonry", icon: LayoutGrid, ariaLabel: "Masonry view" },
        { value: "list", icon: List, ariaLabel: "List view" },
      ]}
    />
  );
}
```

**Lines saved**: 25 → 11 (56% reduction)

**Improvements**:
- ✅ Automatic animated indicator
- ✅ Keyboard navigation (arrow keys, Home, End)
- ✅ Proper focus management
- ✅ Consistent with design system

---

## Todo App Migration

### Before

File: `/apps/todo/src/app/workspace/page.tsx`

```tsx
{/* View Toggles */}
<div className="flex bg-surface-card border border-surface-hover rounded-lg p-1">
  <button
    onClick={() => setView('list')}
    className={`p-1.5 rounded transition-colors ${
      view === 'list'
        ? 'bg-accent-500/10 text-accent-500'
        : 'text-ink-600 hover:text-ink-800'
    }`}
    title="List View"
  >
    <List className="h-4 w-4" />
  </button>
  <button
    onClick={() => setView('board')}
    className={`p-1.5 rounded transition-colors ${
      view === 'board'
        ? 'bg-accent-500/10 text-accent-500'
        : 'text-ink-600 hover:text-ink-800'
    }`}
    title="Board View"
  >
    <LayoutGrid className="h-4 w-4" />
  </button>
  <button
    onClick={() => setView('my-day')}
    className={`p-1.5 rounded transition-colors ${
      view === 'my-day'
        ? 'bg-accent-500/10 text-accent-500'
        : 'text-ink-600 hover:text-ink-800'
    }`}
    title="My Day"
  >
    <Calendar className="h-4 w-4" />
  </button>
</div>
```

### After

```tsx
import { ViewToggle } from '@ainexsuite/ui';
import { List, LayoutGrid, Calendar } from 'lucide-react';

<ViewToggle
  value={view}
  onChange={setView}
  variant="pills"
  options={[
    { value: 'list', icon: List, ariaLabel: 'List View' },
    { value: 'board', icon: LayoutGrid, ariaLabel: 'Board View' },
    { value: 'my-day', icon: Calendar, ariaLabel: 'My Day' },
  ]}
/>
```

**Lines saved**: 37 → 12 (68% reduction)

**Improvements**:
- ✅ Proper ARIA radiogroup semantics
- ✅ Keyboard navigation with arrow keys
- ✅ Animated selection indicator
- ✅ Consistent sizing and spacing

---

## Projects App Migration

### Before

File: `/apps/projects/src/app/workspace/page.tsx`

```tsx
{viewMode === 'whiteboard' ? (
  <button
    onClick={() => setViewMode('dashboard')}
    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-elevated border border-white/10 hover:bg-surface-hover transition-colors text-sm font-medium text-text-secondary"
  >
    <ArrowLeft className="h-4 w-4" />
    Back to Dashboard
  </button>
) : (
  <button
    onClick={() => setViewMode('whiteboard')}
    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-colors text-sm font-medium"
  >
    <LayoutGrid className="h-4 w-4" />
    Open Whiteboard
  </button>
)}
```

### After

```tsx
import { ViewToggle } from '@ainexsuite/ui';
import { LayoutDashboard, LayoutGrid } from 'lucide-react';

<ViewToggle
  value={viewMode}
  onChange={setViewMode}
  variant="pills"
  options={[
    { value: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { value: 'whiteboard', icon: LayoutGrid, label: 'Whiteboard' },
  ]}
/>
```

**Lines saved**: 17 → 11 (35% reduction)

**Improvements**:
- ✅ Shows both options at once (better UX)
- ✅ Clear visual state of current mode
- ✅ Consistent with other apps
- ✅ Keyboard accessible

---

## Step-by-Step Migration Process

### 1. Identify View Toggle Pattern

Look for code that:
- Toggles between 2-5 view modes
- Uses buttons with conditional styling
- Has icon-only or icon+label buttons
- Manages view state with `useState`

### 2. Install Import

Add to your component imports:

```tsx
import { ViewToggle } from '@ainexsuite/ui';
// or
import { SegmentedControl } from '@ainexsuite/ui';
```

### 3. Choose Variant

- **`default`**: Glassmorphic, icon-only (Notes, compact toolbars)
- **`pills`**: Card-based, icon or icon+label (Todo, Projects)
- **`tabs`**: Tab-style with bottom border (Settings, profiles)

### 4. Map Options

Convert your buttons to options array:

```tsx
// Before: Multiple buttons
<button onClick={() => setView('grid')}>
  <Grid className="h-4 w-4" />
</button>
<button onClick={() => setView('list')}>
  <List className="h-4 w-4" />
</button>

// After: Options array
options={[
  { value: 'grid', icon: Grid },
  { value: 'list', icon: List },
]}
```

### 5. Replace Component

```tsx
// Before
<div className="...custom styles...">
  {/* multiple buttons */}
</div>

// After
<ViewToggle
  value={currentView}
  onChange={setCurrentView}
  variant="pills"
  options={options}
/>
```

### 6. Remove Old Code

- Delete custom view toggle component file (if separate)
- Remove inline button markup
- Clean up unused styles
- Update tests/Storybook

### 7. Test

- [ ] Visual appearance matches design
- [ ] Click interactions work
- [ ] Keyboard navigation works (arrow keys)
- [ ] Focus states are visible
- [ ] Screen reader announces correctly
- [ ] Mobile/touch works properly

---

## Common Patterns

### Icon-Only Toggle

```tsx
<ViewToggle
  variant="default"
  options={[
    { value: 'a', icon: IconA, ariaLabel: 'View A' },
    { value: 'b', icon: IconB, ariaLabel: 'View B' },
  ]}
/>
```

### Icon + Label

```tsx
<ViewToggle
  variant="pills"
  options={[
    { value: 'a', icon: IconA, label: 'View A' },
    { value: 'b', icon: IconB, label: 'View B' },
  ]}
/>
```

### Label Only (Tabs)

```tsx
<ViewToggle
  variant="tabs"
  options={[
    { value: 'a', label: 'Tab A' },
    { value: 'b', label: 'Tab B' },
  ]}
/>
```

### Generic Segmented Control

```tsx
<SegmentedControl
  fullWidth
  options={[
    { value: 'option1', label: 'Option 1', icon: Icon1 },
    { value: 'option2', label: 'Option 2', icon: Icon2, disabled: true },
    { value: 'option3', label: 'Option 3', icon: Icon3 },
  ]}
/>
```

---

## TypeScript Tips

### Explicit Types

```tsx
type ViewMode = 'grid' | 'list' | 'table';

<ViewToggle<ViewMode>
  value={view}
  onChange={setView}
  options={...}
/>
```

### Reusable Options

```tsx
const VIEW_OPTIONS: ViewToggleOption<ViewMode>[] = [
  { value: 'grid', icon: Grid, label: 'Grid' },
  { value: 'list', icon: List, label: 'List' },
];

<ViewToggle
  value={view}
  onChange={setView}
  options={VIEW_OPTIONS}
/>
```

---

## Troubleshooting

### "Type mismatch" error

Make sure your value type matches option values:

```tsx
// ❌ Wrong
const [view, setView] = useState('grid'); // string type
options={[{ value: 'grid' as const }, ...]} // literal type

// ✅ Correct
type View = 'grid' | 'list';
const [view, setView] = useState<View>('grid');
options={[{ value: 'grid' }, ...]}
```

### Indicator not animating

Ensure the component has a stable container width. Avoid changing container size on selection.

### Keyboard navigation not working

Make sure the component receives focus. Tab to it and test arrow keys.

### Custom styling not applying

Use the `className` prop, but note that it applies to the container. For deep customization, consider forking the component.

---

## Migration Checklist

Apps to migrate:

- [ ] **notes** - `/apps/notes/src/components/notes/view-toggle.tsx`
- [ ] **todo** - `/apps/todo/src/app/workspace/page.tsx` (inline buttons)
- [ ] **projects** - `/apps/projects/src/app/workspace/page.tsx` (conditional buttons)
- [ ] **fit** - Check for view toggles
- [ ] **grow** - Check for view toggles
- [ ] **moments** - Check for view toggles
- [ ] **journey** - Check for view toggles
- [ ] **pulse** - Check for view toggles
- [ ] **health** - Check for view toggles
- [ ] **workflow** - Check for view toggles

---

## Questions?

See:
- `packages/ui/src/components/controls/README.md` - Full documentation
- `packages/ui/src/components/controls/view-toggle.examples.tsx` - Code examples
- `packages/ui/src/components/controls/view-toggle.tsx` - Source code
