# Search Components - Overview

Complete overview of search components in the AinexSuite UI package.

## 📦 Package Structure

```
packages/ui/src/components/search/
├── search-input.tsx      # Main SearchInput component (284 lines)
├── index.ts              # Exports
├── README.md             # Component documentation (229 lines)
├── EXAMPLES.md           # Real-world usage examples (402 lines)
├── MIGRATION.md          # Migration guide (405 lines)
└── OVERVIEW.md           # This file
```

**Total**: 1,321 lines of code and documentation

## 🎯 Component Status

| Component | Status | Usage | Notes |
|-----------|--------|-------|-------|
| **SearchInput** | ✅ Active | Notes app | Primary search component with full features |
| **SearchBar** | ⚠️ Legacy | None | Simple component, not actively used |

## ✨ SearchInput Features

### Core Features
- ✅ **Controlled Input**: Full control with `value` and `onChange`
- ✅ **Debouncing**: Built-in with `onDebouncedChange` and `debounceDelay`
- ✅ **Loading States**: Spinner animation with `loading` prop
- ✅ **Clear Button**: Auto-appears when input has value
- ✅ **Keyboard Shortcuts**: Display hints like "⌘K" with `shortcutHint`
- ✅ **Auto Focus**: Support for `autoFocus` on mount
- ✅ **Search Submit**: `onSearch` handler for Enter key

### Styling
- 4 Variants: `default`, `filled`, `ghost`, `glass`
- 3 Sizes: `sm` (32px), `md` (40px), `lg` (48px)
- Custom className support
- Theme-aware colors
- Responsive design

### Accessibility
- Proper ARIA labels
- Keyboard navigation
- Screen reader support
- Focus states
- Semantic HTML

### TypeScript
- Full type safety
- Exported `SearchInputProps` interface
- IntelliSense support

## 📊 Integration Status

### Apps Using SearchInput

| App | Status | Implementation | Notes |
|-----|--------|----------------|-------|
| **notes** | ✅ Integrated | Wrapper component | Uses `variant="filled"`, `shortcutHint="⌘K"` |
| **main** | ⚠️ Custom | UniversalSearch | App-specific cross-app search with AI |
| **journey** | 🔲 Not yet | - | Could benefit from SearchInput |
| **todo** | 🔲 Not yet | - | Could benefit from SearchInput |
| **grow** | 🔲 Not yet | - | Could benefit from SearchInput |
| **fit** | 🔲 Not yet | - | Could benefit from SearchInput |
| **moments** | 🔲 Not yet | - | Could benefit from SearchInput |
| **pulse** | 🔲 Not yet | - | Could benefit from SearchInput |
| **projects** | 🔲 Not yet | - | Could benefit from SearchInput |
| **workflow** | 🔲 Not yet | - | Could benefit from SearchInput |

### Notes App Implementation

The Notes app uses a thin wrapper pattern:

```tsx
// apps/notes/src/components/layout/search-input.tsx
import { SearchInput as SharedSearchInput } from "@ainexsuite/ui/components";

export function SearchInput({ placeholder, onFocus, value, onChange }) {
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

**Benefits of wrapper pattern:**
- App-specific defaults
- Simplified API for internal use
- Easy to extend with app features
- Maintains type safety

## 📚 Documentation

### README.md (229 lines)
- Component features overview
- Basic and advanced usage
- Complete props table
- Variant and size guides
- Integration examples
- Design tokens
- Accessibility notes
- Performance tips
- Migration guide reference

### EXAMPLES.md (402 lines)
- Notes app basic search
- Universal search with debouncing
- Keyboard shortcut modal
- Filter search
- Multi-app search
- Programmatic focus
- Size comparison
- Variant comparison
- Custom styling

### MIGRATION.md (405 lines)
- Migration checklist
- Before/after examples
- Props mapping table
- Variant selection guide
- Size selection guide
- Common patterns
- Accessibility checklist
- Testing migration
- Breaking changes
- Performance considerations

## 🎨 Design System Integration

### Theme Tokens Used

**Surface Colors:**
- `surface-muted` - Filled variant background
- `surface-elevated` - Hover/focus states

**Ink Colors:**
- `ink-700` - Primary text
- `ink-600` - Secondary text
- `ink-400` - Placeholder text

**Outline Colors:**
- `outline-subtle` - Default borders
- `outline-strong` - Focus borders

**White Opacity:**
- `white/5`, `white/10`, `white/15` - Glass effects
- `white/50`, `white/70`, `white/80` - Icon states

### Variant Use Cases

| Variant | Background | Use Case | Example |
|---------|------------|----------|---------|
| `default` | Dark | Dark interfaces | Hero sections, overlays |
| `filled` | Light/Dark | General use | Forms, navigation, toolbars |
| `ghost` | Transparent | Minimal UI | Tight layouts, secondary search |
| `glass` | Image/Gradient | Premium look | Marketing, feature highlights |

## 🚀 Getting Started

### Quick Start

```tsx
import { SearchInput } from '@ainexsuite/ui/components';
import { useState } from 'react';

function MyComponent() {
  const [query, setQuery] = useState('');

  return (
    <SearchInput
      value={query}
      onChange={setQuery}
      placeholder="Search..."
      variant="filled"
      size="md"
    />
  );
}
```

### With Debouncing

```tsx
const [query, setQuery] = useState('');
const [loading, setLoading] = useState(false);

const handleSearch = async (value: string) => {
  if (value.length < 2) return;

  setLoading(true);
  const results = await searchAPI(value);
  setLoading(false);
};

return (
  <SearchInput
    value={query}
    onChange={setQuery}
    onDebouncedChange={handleSearch}
    debounceDelay={300}
    loading={loading}
    variant="filled"
  />
);
```

## 🔄 Migration Path

For apps still using custom search inputs:

1. **Phase 1**: Identify search inputs in your app
2. **Phase 2**: Import SearchInput from `@ainexsuite/ui/components`
3. **Phase 3**: Create app-specific wrapper (optional but recommended)
4. **Phase 4**: Replace custom inputs with SearchInput
5. **Phase 5**: Remove custom debouncing logic
6. **Phase 6**: Test thoroughly
7. **Phase 7**: Delete unused custom components

See [MIGRATION.md](./MIGRATION.md) for detailed guide.

## 📈 Performance

### Optimizations
- Memoized style variants
- Debouncing prevents excessive renders
- Minimal re-renders with controlled pattern
- Cleanup of timers on unmount
- Conditional rendering of elements

### Bundle Size
- Small footprint (~8KB minified)
- Tree-shakeable
- No external dependencies beyond lucide-react

## 🧪 Testing Recommendations

### Unit Tests
- [ ] Value updates correctly
- [ ] onChange fires immediately
- [ ] onDebouncedChange fires after delay
- [ ] onSearch fires on Enter key
- [ ] Clear button clears value
- [ ] Loading state shows spinner
- [ ] All variants render correctly
- [ ] All sizes render correctly
- [ ] Disabled state works
- [ ] Auto focus works

### Integration Tests
- [ ] Works in different theme contexts
- [ ] Responsive behavior correct
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] Focus trap in modals

### Visual Regression Tests
- [ ] All variant screenshots
- [ ] All size screenshots
- [ ] With/without keyboard shortcut
- [ ] Loading state
- [ ] With clear button

## 🔮 Future Enhancements

### Potential Features
- [ ] Custom icons (beyond search icon)
- [ ] Prefix/suffix slots
- [ ] Multi-line search input
- [ ] Search history dropdown
- [ ] Voice search integration
- [ ] Recent searches
- [ ] Search suggestions
- [ ] Advanced filters toggle
- [ ] Ref forwarding for programmatic control

### Community Requests
Submit feature requests by creating an issue in the monorepo.

## 📞 Support

- **Documentation**: [README.md](./README.md)
- **Examples**: [EXAMPLES.md](./EXAMPLES.md)
- **Migration Help**: [MIGRATION.md](./MIGRATION.md)
- **Component Source**: [search-input.tsx](./search-input.tsx)

## 📝 Changelog

### v1.1.0 (2025-11-28)
- ✨ Added debouncing support
- ✨ Added `onDebouncedChange` prop
- ✨ Added `debounceDelay` prop
- 📚 Created comprehensive documentation
- 📚 Added EXAMPLES.md
- 📚 Added MIGRATION.md
- 📚 Added OVERVIEW.md

### v1.0.0 (Initial)
- ✨ Initial SearchInput component
- ✨ 4 variants (default, filled, ghost, glass)
- ✨ 3 sizes (sm, md, lg)
- ✨ Loading states
- ✨ Clear button
- ✨ Keyboard shortcuts
- ✨ Accessibility features

## 🤝 Contributing

When enhancing SearchInput:

1. Maintain backward compatibility
2. Update all documentation
3. Add examples for new features
4. Update TypeScript types
5. Test across all apps
6. Update CHANGELOG

## 📄 License

Part of AinexSuite monorepo. Internal use only.

---

**Last Updated**: 2025-11-28
**Maintainer**: AinexSuite Team
**Version**: 1.1.0
