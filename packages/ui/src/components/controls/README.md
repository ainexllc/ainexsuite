# Control Components

Unified control components for view toggling and segmented controls across all apps.

## ViewToggle

A versatile component for toggling between different view modes (Grid/List, Card/Table, etc.).

### Features

- **3 Variants**: `default` (glassmorphic), `pills` (card-based), `tabs` (tab-style)
- **3 Sizes**: `sm`, `md`, `lg`
- **Keyboard Navigation**: Arrow keys, Home, End
- **Accessible**: Proper ARIA roles and labels
- **Animated**: Smooth selection indicator transitions
- **Flexible**: Supports icon-only, text-only, or both

### Basic Usage

```tsx
import { ViewToggle } from '@ainexsuite/ui';
import { LayoutGrid, List } from 'lucide-react';

function MyComponent() {
  const [view, setView] = useState<'grid' | 'list'>('grid');

  return (
    <ViewToggle
      value={view}
      onChange={setView}
      options={[
        { value: 'grid', icon: LayoutGrid, label: 'Grid' },
        { value: 'list', icon: List, label: 'List' },
      ]}
    />
  );
}
```

### Icon-Only (Default Variant)

Perfect for compact toolbars and headers:

```tsx
<ViewToggle
  value={viewMode}
  onChange={setViewMode}
  variant="default"
  size="md"
  options={[
    { value: 'masonry', icon: LayoutGrid, ariaLabel: 'Masonry view' },
    { value: 'list', icon: List, ariaLabel: 'List view' },
  ]}
/>
```

**Result**: Glassmorphic pill with icon-only buttons and smooth animated indicator.

### With Labels (Pills Variant)

Better for when you want to show text labels:

```tsx
<ViewToggle
  value={view}
  onChange={setView}
  variant="pills"
  size="md"
  options={[
    { value: 'list', icon: List, label: 'List View' },
    { value: 'board', icon: LayoutGrid, label: 'Board View' },
    { value: 'calendar', icon: Calendar, label: 'Calendar' },
  ]}
/>
```

**Result**: Card-based segmented control with icons and labels.

### Tab Style

For tab-like interfaces:

```tsx
<ViewToggle
  value={activeTab}
  onChange={setActiveTab}
  variant="tabs"
  options={[
    { value: 'overview', label: 'Overview' },
    { value: 'details', label: 'Details' },
    { value: 'history', label: 'History' },
  ]}
/>
```

**Result**: Tab-style toggle with bottom border indicator.

### Size Variants

```tsx
// Small - for compact spaces
<ViewToggle size="sm" {...props} />

// Medium - default
<ViewToggle size="md" {...props} />

// Large - for prominent placement
<ViewToggle size="lg" {...props} />
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `T` | - | Currently selected value |
| `onChange` | `(value: T) => void` | - | Callback when selection changes |
| `options` | `ViewToggleOption<T>[]` | - | Array of options |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| `variant` | `'default' \| 'pills' \| 'tabs'` | `'default'` | Visual style |
| `className` | `string` | - | Additional CSS classes |
| `aria-label` | `string` | `'View toggle'` | Accessible label |

### ViewToggleOption

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `value` | `T` | Yes | Unique value for this option |
| `icon` | `LucideIcon` | No | Icon component |
| `label` | `string` | No | Text label |
| `ariaLabel` | `string` | No | Accessible label (falls back to `label`) |

---

## SegmentedControl

A more generic segmented control component for any mutually exclusive options.

### Features

- **Full-width mode**: Stretches to fill container
- **Disabled options**: Individual options can be disabled
- **Keyboard navigation**: Skips disabled options
- **Icons + Text**: Always shows both when icon is provided
- **Accessible**: ARIA radiogroup with proper keyboard support

### Basic Usage

```tsx
import { SegmentedControl } from '@ainexsuite/ui';
import { Sun, Moon, Monitor } from 'lucide-react';

function ThemeSelector() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  return (
    <SegmentedControl
      value={theme}
      onChange={setTheme}
      options={[
        { value: 'light', label: 'Light', icon: Sun },
        { value: 'dark', label: 'Dark', icon: Moon },
        { value: 'system', label: 'System', icon: Monitor },
      ]}
    />
  );
}
```

### Full Width Mode

```tsx
<SegmentedControl
  fullWidth
  value={status}
  onChange={setStatus}
  options={[
    { value: 'pending', label: 'Pending' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
  ]}
/>
```

**Result**: Each option takes equal width to fill the container.

### With Disabled Options

```tsx
<SegmentedControl
  value={plan}
  onChange={setPlan}
  options={[
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'Pro' },
    { value: 'enterprise', label: 'Enterprise', disabled: true },
  ]}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `T` | - | Currently selected value |
| `onChange` | `(value: T) => void` | - | Callback when selection changes |
| `options` | `SegmentedControlOption<T>[]` | - | Array of options |
| `fullWidth` | `boolean` | `false` | Stretch to fill container |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| `className` | `string` | - | Additional CSS classes |
| `aria-label` | `string` | `'Segmented control'` | Accessible label |

### SegmentedControlOption

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `value` | `T` | Yes | Unique value for this option |
| `label` | `string` | Yes | Display text |
| `icon` | `LucideIcon` | No | Optional icon |
| `disabled` | `boolean` | No | Whether option is disabled |

---

## Real-World Examples

### Notes App View Toggle

Replace the existing view toggle:

```tsx
import { ViewToggle } from '@ainexsuite/ui';
import { LayoutGrid, List } from 'lucide-react';

<ViewToggle
  value={viewMode}
  onChange={onViewModeChange}
  variant="default"
  options={[
    { value: 'masonry', icon: LayoutGrid, ariaLabel: 'Masonry view' },
    { value: 'list', icon: List, ariaLabel: 'List view' },
  ]}
/>
```

### Todo App View Toggle

Replace inline buttons:

```tsx
import { ViewToggle } from '@ainexsuite/ui';
import { List, LayoutGrid, Calendar } from 'lucide-react';

<ViewToggle
  value={view}
  onChange={setView}
  variant="pills"
  size="md"
  options={[
    { value: 'list', icon: List, ariaLabel: 'List View' },
    { value: 'board', icon: LayoutGrid, ariaLabel: 'Board View' },
    { value: 'my-day', icon: Calendar, ariaLabel: 'My Day' },
  ]}
/>
```

### Projects App Mode Toggle

Simplified button replacement:

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

---

## Keyboard Navigation

Both components support full keyboard navigation:

- **Arrow Left/Up**: Move to previous option
- **Arrow Right/Down**: Move to next option
- **Home**: Jump to first option
- **End**: Jump to last option
- **Tab**: Move focus to next control (standard behavior)

The `SegmentedControl` automatically skips disabled options during keyboard navigation.

---

## Accessibility

Both components implement proper ARIA patterns:

- `role="radiogroup"` on the container
- `role="radio"` on each option
- `aria-checked` to indicate selected state
- `aria-label` for screen readers
- Keyboard focus management
- Focus visible states

---

## Styling

Both components use CSS variables from the theme system:

- `--color-primary`: Selection indicator color (default variant)
- `--color-accent-500`: Selection highlight (pills/tabs variants)
- `--color-surface-card`: Background colors
- `--color-surface-hover`: Hover states
- `--color-ink-600/800`: Text colors

Override with custom CSS:

```tsx
<ViewToggle
  className="custom-toggle"
  {...props}
/>
```

```css
.custom-toggle {
  /* Custom styles */
}
```

---

## Migration Guide

### From Notes App

**Before:**
```tsx
<div className="inline-flex items-center gap-1 rounded-full bg-black/40 backdrop-blur-sm p-1 shadow-sm border border-white/10">
  <button onClick={() => onViewModeChange("masonry")}>...</button>
  <button onClick={() => onViewModeChange("list")}>...</button>
</div>
```

**After:**
```tsx
<ViewToggle
  value={viewMode}
  onChange={onViewModeChange}
  options={[
    { value: 'masonry', icon: LayoutGrid, ariaLabel: 'Masonry view' },
    { value: 'list', icon: List, ariaLabel: 'List view' },
  ]}
/>
```

### From Todo App

**Before:**
```tsx
<div className="flex bg-surface-card border border-surface-hover rounded-lg p-1">
  <button onClick={() => setView('list')}>...</button>
  <button onClick={() => setView('board')}>...</button>
  <button onClick={() => setView('my-day')}>...</button>
</div>
```

**After:**
```tsx
<ViewToggle
  variant="pills"
  value={view}
  onChange={setView}
  options={[
    { value: 'list', icon: List },
    { value: 'board', icon: LayoutGrid },
    { value: 'my-day', icon: Calendar },
  ]}
/>
```

---

## TypeScript

Both components are fully typed with generics:

```tsx
type MyViewMode = 'grid' | 'list' | 'table';

<ViewToggle<MyViewMode>
  value={view}
  onChange={setView}
  options={...}
/>
```

Type inference works automatically in most cases, but you can be explicit when needed.
