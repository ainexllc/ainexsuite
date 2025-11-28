# SearchInput Migration Guide

Guide for migrating custom search inputs to the unified `SearchInput` component.

## Why Migrate?

- **Consistency**: Unified design across all apps
- **Features**: Built-in debouncing, loading states, keyboard shortcuts
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Performance**: Optimized rendering and debouncing
- **Maintenance**: Single source of truth, easier updates
- **TypeScript**: Full type safety out of the box

## Quick Migration Checklist

- [ ] Import `SearchInput` from `@ainexsuite/ui/components`
- [ ] Replace custom search input with `SearchInput`
- [ ] Map props to SearchInput props (see mapping table below)
- [ ] Use `onDebouncedChange` for API calls
- [ ] Remove custom debouncing logic
- [ ] Choose appropriate `variant` and `size`
- [ ] Test keyboard navigation and accessibility
- [ ] Verify loading states work correctly
- [ ] Clean up unused custom components

## Before & After Examples

### Simple Input

**Before:**
```tsx
<input
  type="search"
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  placeholder="Search notes..."
  className="w-full px-4 py-2 border rounded-lg"
/>
```

**After:**
```tsx
<SearchInput
  value={query}
  onChange={setQuery}
  placeholder="Search notes..."
  variant="filled"
  size="md"
/>
```

### With Debouncing

**Before:**
```tsx
const [query, setQuery] = useState('');
const [debouncedQuery, setDebouncedQuery] = useState('');

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedQuery(query);
  }, 300);
  return () => clearTimeout(timer);
}, [query]);

useEffect(() => {
  if (debouncedQuery) {
    performSearch(debouncedQuery);
  }
}, [debouncedQuery]);

return (
  <input
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    placeholder="Search..."
  />
);
```

**After:**
```tsx
const [query, setQuery] = useState('');

const handleSearch = async (value: string) => {
  if (value.length < 2) return;
  await performSearch(value);
};

return (
  <SearchInput
    value={query}
    onChange={setQuery}
    onDebouncedChange={handleSearch}
    debounceDelay={300}
    placeholder="Search..."
    variant="filled"
  />
);
```

### With Loading State

**Before:**
```tsx
const [query, setQuery] = useState('');
const [loading, setLoading] = useState(false);

return (
  <div className="relative">
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search..."
    />
    {loading && (
      <div className="absolute right-3 top-1/2 -translate-y-1/2">
        <Spinner />
      </div>
    )}
  </div>
);
```

**After:**
```tsx
const [query, setQuery] = useState('');
const [loading, setLoading] = useState(false);

return (
  <SearchInput
    value={query}
    onChange={setQuery}
    placeholder="Search..."
    loading={loading}
    variant="filled"
  />
);
```

### With Clear Button

**Before:**
```tsx
const [query, setQuery] = useState('');

return (
  <div className="relative">
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search..."
    />
    {query && (
      <button
        onClick={() => setQuery('')}
        className="absolute right-3"
      >
        <X />
      </button>
    )}
  </div>
);
```

**After:**
```tsx
const [query, setQuery] = useState('');

return (
  <SearchInput
    value={query}
    onChange={setQuery}
    placeholder="Search..."
    variant="filled"
  />
);
```

## Props Mapping Table

| Old Pattern | New SearchInput Prop | Notes |
|-------------|---------------------|-------|
| `value={state}` | `value={state}` | Same |
| `onChange={e => setState(e.target.value)}` | `onChange={setState}` | Receives value directly |
| Custom debounce hook | `onDebouncedChange={handler}` | Built-in debouncing |
| `setTimeout` for debounce | `debounceDelay={300}` | Configurable delay |
| `onKeyPress` for Enter | `onSearch={handler}` | Handles Enter key |
| Custom loading spinner | `loading={true}` | Built-in spinner |
| Custom clear button | Auto-included | Shows when value exists |
| `className` for styling | `variant` + `size` + `className` | Use variants first |
| `disabled` | `disabled` | Same |
| `placeholder` | `placeholder` | Same |
| `onFocus` | `onFocus` | Same |
| `onBlur` | `onBlur` | Same |
| `autoFocus` | `autoFocus` | Same |

## Variant Selection Guide

Choose the appropriate variant based on your UI context:

### `variant="filled"` (Recommended for most cases)
- Light/dark mode compatible
- Works on any background
- Clear visual hierarchy
- **Use when**: Default choice for app interfaces

### `variant="ghost"`
- Minimal appearance
- Borderless until focused
- Clean and subtle
- **Use when**: Tight spacing or minimal UI

### `variant="glass"`
- Glassmorphism effect
- Requires backdrop blur support
- Premium appearance
- **Use when**: Over images or gradients

### `variant="default"`
- Semi-transparent white
- For dark backgrounds
- **Use when**: Dark mode only interfaces

## Size Selection Guide

### `size="sm"`
- Height: 32px (h-8)
- Compact appearance
- **Use when**: Tight layouts, filter bars, toolbars

### `size="md"` (Default)
- Height: 40px (h-10)
- Standard UI element size
- **Use when**: General use, forms, navigation

### `size="lg"`
- Height: 48px (h-12)
- Prominent appearance
- **Use when**: Hero sections, primary search, modals

## Common Patterns

### App Wrapper Pattern (Recommended)

Create a thin wrapper in your app that pre-configures the shared component:

```tsx
// apps/notes/src/components/layout/search-input.tsx
import { SearchInput as SharedSearchInput } from "@ainexsuite/ui/components";

type SearchInputProps = {
  placeholder?: string;
  onFocus?: () => void;
  value?: string;
  onChange?: (value: string) => void;
};

export function SearchInput({
  placeholder = "Search notes",
  onFocus,
  value = "",
  onChange,
}: SearchInputProps) {
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

Benefits:
- App-specific defaults
- Simpler API for your team
- Easy to extend with app-specific features
- Type safety maintained

## Accessibility Checklist

The SearchInput component handles these automatically:

- ✅ Proper ARIA labels on input and buttons
- ✅ Keyboard navigation (Tab, Enter, Escape via clear)
- ✅ Focus states with visual feedback
- ✅ Screen reader announcements for loading
- ✅ Semantic HTML (`<label>` wrapper)
- ✅ Disabled state handling

## Testing Migration

1. **Visual Testing**
   - Check all size variants render correctly
   - Verify variant colors match design system
   - Test responsive behavior
   - Confirm keyboard shortcut hint displays

2. **Functional Testing**
   - Type in the input
   - Clear the input with button
   - Press Enter to trigger search
   - Verify debouncing works (network tab)
   - Test loading state

3. **Accessibility Testing**
   - Tab navigation works
   - Screen reader announces correctly
   - Keyboard shortcuts work
   - Focus trap (if in modal)

## Breaking Changes

### If you were using SearchBar

SearchBar is a different component with different props. Migrate to SearchInput instead:

```tsx
// Before (SearchBar)
<SearchBar
  value={query}
  onChange={setQuery}
  onClear={() => setQuery('')}
  placeholder="Search..."
  className="mx-4"
/>

// After (SearchInput)
<SearchInput
  value={query}
  onChange={setQuery}
  placeholder="Search..."
  variant="glass"
  size="md"
  className="mx-4"
/>
```

## Performance Considerations

SearchInput is optimized but consider these tips:

1. **Use debouncing for API calls**
   ```tsx
   <SearchInput
     value={query}
     onChange={setQuery}
     onDebouncedChange={performExpensiveSearch}
     debounceDelay={300}
   />
   ```

2. **Memoize search handlers**
   ```tsx
   const handleSearch = useCallback(async (value: string) => {
     await searchAPI(value);
   }, []);
   ```

3. **Avoid re-creating handlers**
   ```tsx
   // Bad
   <SearchInput onChange={(v) => setState(v)} />

   // Good
   <SearchInput onChange={setState} />
   ```

## Support

- **Documentation**: See [README.md](./README.md)
- **Examples**: See [EXAMPLES.md](./EXAMPLES.md)
- **Component Source**: [search-input.tsx](./search-input.tsx)

## Migration Timeline

1. **Immediate**: New features use SearchInput
2. **Short-term**: Wrap SearchInput for app-specific needs
3. **Medium-term**: Migrate existing search inputs
4. **Long-term**: Deprecate custom search components

## Questions?

Common questions and answers:

**Q: Can I customize the styling?**
A: Yes! Use the `className` prop for additional styles, but prefer `variant` and `size` props first.

**Q: What about custom icons?**
A: The search icon is built-in. For custom needs, consider wrapping the component or requesting a feature.

**Q: How do I handle complex search logic?**
A: Use `onDebouncedChange` for the search logic and manage results in your component state.

**Q: Can I use this in modals?**
A: Yes! Use `autoFocus` prop and `variant="ghost"` or `variant="filled"` depending on modal background.

**Q: What about mobile?**
A: The component is fully responsive. Keyboard shortcuts hide on mobile automatically.
