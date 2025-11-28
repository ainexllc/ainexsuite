# Search Components

Unified search input components for the AinexSuite monorepo.

## Components

### SearchInput

A flexible, feature-rich search input component with keyboard shortcuts, debouncing, loading states, and multiple styling variants.

#### Features

- **Multiple Variants**: `default`, `filled`, `ghost`, `glass` (glassmorphism)
- **Multiple Sizes**: `sm`, `md`, `lg`
- **Debouncing**: Built-in debouncing for expensive operations
- **Loading States**: Visual loading indicator with spinner
- **Clear Button**: Auto-appears when there's input
- **Keyboard Shortcuts**: Display hints like "⌘K"
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Auto Focus**: Support for auto-focusing on mount
- **TypeScript**: Full type safety

#### Basic Usage

```tsx
import { SearchInput } from '@ainexsuite/ui/components';

function NotesSearch() {
  const [query, setQuery] = useState('');

  return (
    <SearchInput
      value={query}
      onChange={setQuery}
      placeholder="Search notes..."
      shortcutHint="⌘K"
      variant="filled"
      size="md"
    />
  );
}
```

#### Advanced Usage with Debouncing

```tsx
import { SearchInput } from '@ainexsuite/ui/components';

function UniversalSearch() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDebouncedSearch = async (value: string) => {
    if (value.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const results = await searchAPI(value);
      setResults(results);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SearchInput
      value={query}
      onChange={setQuery}
      onDebouncedChange={handleDebouncedSearch}
      debounceDelay={300}
      placeholder="Search across all apps..."
      shortcutHint="⌘K"
      loading={loading}
      variant="glass"
      size="lg"
      autoFocus
    />
  );
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | Required | Controlled input value |
| `onChange` | `(value: string) => void` | Required | Immediate change handler |
| `onDebouncedChange` | `(value: string) => void` | - | Debounced change handler (fires after delay) |
| `debounceDelay` | `number` | `300` | Debounce delay in milliseconds |
| `onSearch` | `(value: string) => void` | - | Called when Enter is pressed |
| `placeholder` | `string` | `"Search..."` | Input placeholder text |
| `shortcutHint` | `string` | - | Keyboard shortcut hint (e.g., "⌘K") |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Size variant |
| `variant` | `"default" \| "filled" \| "ghost" \| "glass"` | `"default"` | Visual variant |
| `loading` | `boolean` | `false` | Show loading spinner |
| `onClear` | `() => void` | - | Called when clear button is clicked |
| `onFocus` | `() => void` | - | Focus handler |
| `onBlur` | `() => void` | - | Blur handler |
| `className` | `string` | - | Additional CSS classes |
| `disabled` | `boolean` | `false` | Disable the input |
| `autoFocus` | `boolean` | `false` | Auto focus on mount |

#### Variants

**Default** - Semi-transparent with white text (for dark backgrounds)
```tsx
<SearchInput variant="default" />
```

**Filled** - Solid background using theme colors
```tsx
<SearchInput variant="filled" />
```

**Ghost** - Transparent with border
```tsx
<SearchInput variant="ghost" />
```

**Glass** - Glassmorphism with backdrop blur
```tsx
<SearchInput variant="glass" />
```

#### Sizes

**Small** - Compact 32px height
```tsx
<SearchInput size="sm" />
```

**Medium** - Default 40px height
```tsx
<SearchInput size="md" />
```

**Large** - Spacious 48px height
```tsx
<SearchInput size="lg" />
```

## Integration Examples

### Notes App

```tsx
// apps/notes/src/components/layout/search-input.tsx
import { SearchInput as SharedSearchInput } from "@ainexsuite/ui/components";

export function SearchInput({ placeholder = "Search notes", onFocus, value = "", onChange }) {
  return (
    <SharedSearchInput
      value={value}
      onChange={(newValue) => onChange?.(newValue)}
      onFocus={onFocus}
      placeholder={placeholder}
      shortcutHint="⌘K"
      variant="filled"
      size="md"
      className="max-w-xl"
    />
  );
}
```

### Main App Universal Search

The main app has its own complex `UniversalSearch` component that includes:
- Cross-app search functionality
- AI command mode
- Results modal with keyboard navigation
- App-specific routing

This is intentionally separate from the shared SearchInput as it's app-specific functionality.

## Design Tokens

The component uses theme tokens from `@ainexsuite/theme`:

- Surface colors: `surface-muted`, `surface-elevated`
- Ink colors: `ink-700`, `ink-600`, `ink-400`
- Outline colors: `outline-subtle`, `outline-strong`
- White opacity variants for glass effects

## Accessibility

- Proper ARIA labels on all interactive elements
- Keyboard navigation (Enter to submit, clear button)
- Focus states with visual feedback
- Screen reader friendly loading states
- Semantic HTML with `<label>` wrapper

## Performance

- Debouncing prevents excessive API calls
- Memoized size/variant styles
- Minimal re-renders with controlled input pattern
- Cleanup of debounce timers on unmount

## Migration Guide

If your app has a custom search input, migrate to the shared component:

1. Import SearchInput from `@ainexsuite/ui/components`
2. Map your existing props to SearchInput props
3. Use `onDebouncedChange` for search operations
4. Remove custom debouncing logic
5. Choose appropriate variant and size

```tsx
// Before
<input
  type="search"
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  placeholder="Search..."
/>

// After
<SearchInput
  value={query}
  onChange={setQuery}
  placeholder="Search..."
  variant="filled"
/>
```
