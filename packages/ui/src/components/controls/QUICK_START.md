# ViewToggle & SegmentedControl - Quick Start

## Installation

Already included in `@ainexsuite/ui` package. No installation needed.

```tsx
import { ViewToggle, SegmentedControl } from '@ainexsuite/ui';
```

## ViewToggle - Common Patterns

### Icon-Only (Glassmorphic)
```tsx
<ViewToggle
  value={view}
  onChange={setView}
  options={[
    { value: 'grid', icon: LayoutGrid, ariaLabel: 'Grid view' },
    { value: 'list', icon: List, ariaLabel: 'List view' },
  ]}
/>
```

### Icon + Label (Pills)
```tsx
<ViewToggle
  variant="pills"
  value={view}
  onChange={setView}
  options={[
    { value: 'list', icon: List, label: 'List' },
    { value: 'board', icon: LayoutGrid, label: 'Board' },
    { value: 'calendar', icon: Calendar, label: 'Calendar' },
  ]}
/>
```

### Text-Only (Tabs)
```tsx
<ViewToggle
  variant="tabs"
  value={tab}
  onChange={setTab}
  options={[
    { value: 'overview', label: 'Overview' },
    { value: 'details', label: 'Details' },
  ]}
/>
```

## SegmentedControl - Common Patterns

### Basic
```tsx
<SegmentedControl
  value={status}
  onChange={setStatus}
  options={[
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
  ]}
/>
```

### Full-Width
```tsx
<SegmentedControl
  fullWidth
  value={plan}
  onChange={setPlan}
  options={[
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'Pro' },
  ]}
/>
```

### With Icons
```tsx
<SegmentedControl
  value={theme}
  onChange={setTheme}
  options={[
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
  ]}
/>
```

## Props Quick Reference

### ViewToggle
- `value` - Current selection
- `onChange` - Change handler
- `options` - Array of `{ value, icon?, label?, ariaLabel? }`
- `variant` - `'default'` | `'pills'` | `'tabs'`
- `size` - `'sm'` | `'md'` | `'lg'`

### SegmentedControl
- `value` - Current selection
- `onChange` - Change handler
- `options` - Array of `{ value, label, icon?, disabled? }`
- `fullWidth` - Boolean
- `size` - `'sm'` | `'md'` | `'lg'`

## Keyboard Navigation

- **←/→** or **↑/↓** - Navigate options
- **Home** - First option
- **End** - Last option
- **Tab** - Next control

## When to Use Which?

| Use Case | Component | Variant |
|----------|-----------|---------|
| Grid/List toggle | ViewToggle | `default` |
| View modes with icons | ViewToggle | `pills` |
| Tab navigation | ViewToggle | `tabs` |
| Settings toggle | SegmentedControl | - |
| Theme selector | SegmentedControl | - |
| Status filter | SegmentedControl | - |

## More Info

- Full docs: `README.md`
- Examples: `view-toggle.examples.tsx`
- Migration: `MIGRATION_GUIDE.md`
