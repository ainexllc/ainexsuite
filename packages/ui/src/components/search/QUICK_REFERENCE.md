# SearchInput - Quick Reference

One-page reference for the SearchInput component.

## Import

```tsx
import { SearchInput } from '@ainexsuite/ui/components';
```

## Basic Usage

```tsx
const [query, setQuery] = useState('');

<SearchInput
  value={query}
  onChange={setQuery}
  placeholder="Search..."
  variant="filled"
  size="md"
/>
```

## Props

| Prop | Type | Default | Required |
|------|------|---------|----------|
| value | string | - | ✅ |
| onChange | (value: string) => void | - | ✅ |
| onDebouncedChange | (value: string) => void | - | |
| debounceDelay | number | 300 | |
| onSearch | (value: string) => void | - | |
| placeholder | string | "Search..." | |
| shortcutHint | string | - | |
| size | "sm" \| "md" \| "lg" | "md" | |
| variant | "default" \| "filled" \| "ghost" \| "glass" | "default" | |
| loading | boolean | false | |
| onClear | () => void | - | |
| onFocus | () => void | - | |
| onBlur | () => void | - | |
| className | string | - | |
| disabled | boolean | false | |
| autoFocus | boolean | false | |

## Variants

```tsx
// Dark backgrounds, semi-transparent
<SearchInput variant="default" />

// General use, theme-aware
<SearchInput variant="filled" />

// Minimal, borderless
<SearchInput variant="ghost" />

// Glassmorphism effect
<SearchInput variant="glass" />
```

## Sizes

```tsx
<SearchInput size="sm" />  // 32px height
<SearchInput size="md" />  // 40px height (default)
<SearchInput size="lg" />  // 48px height
```

## Common Patterns

### With Debouncing

```tsx
const [query, setQuery] = useState('');
const [loading, setLoading] = useState(false);

const handleSearch = async (value: string) => {
  if (value.length < 2) return;
  setLoading(true);
  await searchAPI(value);
  setLoading(false);
};

<SearchInput
  value={query}
  onChange={setQuery}
  onDebouncedChange={handleSearch}
  debounceDelay={300}
  loading={loading}
/>
```

### With Keyboard Shortcut

```tsx
<SearchInput
  value={query}
  onChange={setQuery}
  shortcutHint="⌘K"
  placeholder="Search or press ⌘K..."
/>
```

### With Auto Focus

```tsx
<SearchInput
  value={query}
  onChange={setQuery}
  autoFocus
  placeholder="Start typing..."
/>
```

### In Modal

```tsx
<Modal isOpen={isOpen} onClose={onClose}>
  <SearchInput
    value={query}
    onChange={setQuery}
    variant="ghost"
    autoFocus
  />
</Modal>
```

### App Wrapper (Recommended)

```tsx
// apps/[app]/src/components/layout/search-input.tsx
import { SearchInput as SharedSearchInput } from "@ainexsuite/ui/components";

export function SearchInput({ value, onChange, placeholder }) {
  return (
    <SharedSearchInput
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      variant="filled"
      size="md"
      shortcutHint="⌘K"
      className="max-w-xl"
    />
  );
}
```

## Keyboard Shortcuts

- **Enter**: Triggers `onSearch` if provided
- **Escape**: Can be handled via custom logic
- **Tab**: Standard focus navigation

## Accessibility

- ✅ ARIA labels on all elements
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Focus states
- ✅ Disabled state handling

## Tips

1. **Use debouncing for API calls**: Prevents excessive requests
2. **Show loading state**: Use `loading={true}` during async operations
3. **Add keyboard shortcuts**: Use `shortcutHint` for better UX
4. **Choose right variant**: `filled` for general use, `glass` for marketing
5. **Create app wrappers**: Simplify API and set app-specific defaults

## Examples

See [EXAMPLES.md](./EXAMPLES.md) for 10+ real-world examples.

## Migration

See [MIGRATION.md](./MIGRATION.md) for complete migration guide.

## Documentation

- [README.md](./README.md) - Full documentation
- [EXAMPLES.md](./EXAMPLES.md) - Usage examples
- [MIGRATION.md](./MIGRATION.md) - Migration guide
- [OVERVIEW.md](./OVERVIEW.md) - Architecture overview
