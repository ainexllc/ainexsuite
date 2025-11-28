# Tag Input - Quick Reference

## Import

```tsx
import { TagInput, Tag, TagList } from '@ainexsuite/ui';
import type { TagInputProps, TagProps, TagListProps } from '@ainexsuite/ui';
```

## Basic Usage

```tsx
// Simple tag input
const [tags, setTags] = useState<string[]>([]);
<TagInput value={tags} onChange={setTags} />

// With suggestions
<TagInput
  value={tags}
  onChange={setTags}
  suggestions={['React', 'TypeScript', 'Next.js']}
/>

// Individual tag
<Tag label="React" onRemove={() => handleRemove('React')} />

// Tag list (read-only)
<TagList tags={['React', 'TypeScript']} max={3} />
```

## Props Cheat Sheet

### TagInput

| Prop | Type | Required | Default |
|------|------|----------|---------|
| `value` | `string[]` | ✅ | - |
| `onChange` | `(tags: string[]) => void` | ✅ | - |
| `suggestions` | `string[]` | ❌ | `[]` |
| `onSuggestionsSearch` | `(query: string) => void \| Promise<void>` | ❌ | - |
| `placeholder` | `string` | ❌ | `'Add tags...'` |
| `maxTags` | `number` | ❌ | - |
| `allowCustom` | `boolean` | ❌ | `true` |
| `size` | `'sm' \| 'md' \| 'lg'` | ❌ | `'md'` |
| `disabled` | `boolean` | ❌ | `false` |
| `loading` | `boolean` | ❌ | `false` |
| `error` | `boolean` | ❌ | `false` |
| `showCount` | `boolean` | ❌ | `false` |
| `debounceDelay` | `number` | ❌ | `300` |

### Tag

| Prop | Type | Required | Default |
|------|------|----------|---------|
| `label` | `string` | ✅ | - |
| `onRemove` | `() => void` | ❌ | - |
| `removable` | `boolean` | ❌ | `true` |
| `color` | `string` | ❌ | - |
| `variant` | `'default' \| 'outline' \| 'solid'` | ❌ | `'default'` |
| `size` | `'sm' \| 'md' \| 'lg'` | ❌ | `'md'` |
| `onClick` | `() => void` | ❌ | - |
| `disabled` | `boolean` | ❌ | `false` |

### TagList

| Prop | Type | Required | Default |
|------|------|----------|---------|
| `tags` | `string[]` or `Array<{label: string; color?: string}>` | ✅ | - |
| `max` | `number` | ❌ | - |
| `size` | `'sm' \| 'md' \| 'lg'` | ❌ | `'md'` |
| `onTagClick` | `(tag: string) => void` | ❌ | - |
| `showEmpty` | `boolean` | ❌ | `false` |
| `emptyText` | `string` | ❌ | `'No tags'` |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Add tag |
| `,` | Add tag |
| `Tab` | Add tag (if input has text) |
| `Backspace` | Remove last tag (when input empty) |
| `↓` | Navigate down in suggestions |
| `↑` | Navigate up in suggestions |
| `Escape` | Close suggestions |

## Common Patterns

### Async Search

```tsx
const [suggestions, setSuggestions] = useState<string[]>([]);
const [loading, setLoading] = useState(false);

const handleSearch = async (query: string) => {
  setLoading(true);
  const results = await api.searchTags(query);
  setSuggestions(results);
  setLoading(false);
};

<TagInput
  value={tags}
  onChange={setTags}
  suggestions={suggestions}
  onSuggestionsSearch={handleSearch}
  loading={loading}
/>
```

### Max Tags with Count

```tsx
<TagInput
  value={tags}
  onChange={setTags}
  maxTags={5}
  showCount
/>
```

### Suggestions Only (No Custom)

```tsx
<TagInput
  value={tags}
  onChange={setTags}
  suggestions={categories}
  allowCustom={false}
/>
```

### Colored Tags

```tsx
<Tag label="Work" color="#3b82f6" />
<Tag label="Urgent" color="#ef4444" variant="solid" />

<TagList
  tags={[
    { label: 'Work', color: '#3b82f6' },
    { label: 'Personal', color: '#22c55e' },
  ]}
/>
```

### Error State

```tsx
<TagInput
  value={tags}
  onChange={setTags}
  error={tags.length === 0}
/>
```

### Sizes

```tsx
<TagInput size="sm" value={tags} onChange={setTags} />
<TagInput size="md" value={tags} onChange={setTags} />
<TagInput size="lg" value={tags} onChange={setTags} />

<Tag label="Small" size="sm" />
<Tag label="Medium" size="md" />
<Tag label="Large" size="lg" />

<TagList tags={tags} size="sm" />
<TagList tags={tags} size="md" />
<TagList tags={tags} size="lg" />
```

## Migration from ModernTagInput

```tsx
// Before
import { ModernTagInput } from '@/components/ui/modern-tag-input';
<ModernTagInput tags={tags} onTagsChange={setTags} suggestions={sugg} />

// After
import { TagInput } from '@ainexsuite/ui';
<TagInput value={tags} onChange={setTags} suggestions={sugg} />
```

**Changes:**
- `tags` → `value`
- `onTagsChange` → `onChange`

## Files

- **Component**: `packages/ui/src/components/forms/tag-input.tsx`
- **Examples**: `packages/ui/src/components/forms/tag-input.examples.tsx`
- **Docs**: `packages/ui/src/components/forms/tag-input.README.md`
- **Export**: `packages/ui/src/components/forms/index.ts`
- **Main Export**: `packages/ui/src/components/index.ts`
