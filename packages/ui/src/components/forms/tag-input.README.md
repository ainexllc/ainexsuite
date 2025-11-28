# Tag Input Components

A comprehensive set of tag/chip input components with autocomplete, keyboard navigation, and customizable styling.

## Components

### 1. TagInput

Main tag input component with autocomplete, suggestions, and keyboard navigation.

**Features:**
- ✅ Type to add tags (Enter, comma, or Tab)
- ✅ Backspace to remove last tag
- ✅ Click X to remove specific tags
- ✅ Autocomplete dropdown with suggestions
- ✅ Keyboard navigation (arrows, Enter, Escape)
- ✅ Debounced async search
- ✅ Max tag limit
- ✅ Custom or suggestion-only modes
- ✅ Multiple size variants
- ✅ Loading states
- ✅ Error states
- ✅ Fully accessible (ARIA)

**Basic Usage:**

```tsx
import { TagInput } from '@ainexsuite/ui';

function MyComponent() {
  const [tags, setTags] = useState<string[]>([]);

  return (
    <TagInput
      value={tags}
      onChange={setTags}
      placeholder="Add tags..."
    />
  );
}
```

**With Suggestions:**

```tsx
<TagInput
  value={tags}
  onChange={setTags}
  suggestions={['React', 'TypeScript', 'Next.js']}
  placeholder="Search technologies..."
/>
```

**Async Search:**

```tsx
const [suggestions, setSuggestions] = useState<string[]>([]);
const [loading, setLoading] = useState(false);

const handleSearch = async (query: string) => {
  setLoading(true);
  const results = await fetchTags(query);
  setSuggestions(results);
  setLoading(false);
};

<TagInput
  value={tags}
  onChange={setTags}
  suggestions={suggestions}
  onSuggestionsSearch={handleSearch}
  loading={loading}
  debounceDelay={300}
/>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string[]` | Required | Current tag values |
| `onChange` | `(tags: string[]) => void` | Required | Callback when tags change |
| `suggestions` | `string[]` | `[]` | Available tag suggestions |
| `onSuggestionsSearch` | `(query: string) => void \| Promise<void>` | - | Async search handler |
| `placeholder` | `string` | `'Add tags...'` | Placeholder text |
| `maxTags` | `number` | - | Maximum number of tags |
| `allowCustom` | `boolean` | `true` | Allow custom tags |
| `variant` | `'default' \| 'inline' \| 'chips'` | `'default'` | Visual variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| `disabled` | `boolean` | `false` | Disabled state |
| `loading` | `boolean` | `false` | Loading state |
| `debounceDelay` | `number` | `300` | Debounce delay (ms) |
| `caseSensitive` | `boolean` | `false` | Case-sensitive matching |
| `showCount` | `boolean` | `false` | Show tag count |
| `autoFocus` | `boolean` | `false` | Auto-focus on mount |
| `error` | `boolean` | `false` | Error state |
| `className` | `string` | - | Additional CSS classes |

---

### 2. Tag

Individual tag/chip component - can be used standalone or within TagInput.

**Basic Usage:**

```tsx
import { Tag } from '@ainexsuite/ui';

<Tag
  label="React"
  onRemove={() => removeTag('React')}
/>
```

**Variants:**

```tsx
<Tag label="Default" variant="default" />
<Tag label="Outline" variant="outline" />
<Tag label="Solid" variant="solid" />
```

**Colored Tags:**

```tsx
<Tag label="Work" color="#3b82f6" />
<Tag label="Urgent" color="#ef4444" variant="solid" />
```

**Sizes:**

```tsx
<Tag label="Small" size="sm" />
<Tag label="Medium" size="md" />
<Tag label="Large" size="lg" />
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | Required | Tag text/label |
| `color` | `string` | - | Custom color (CSS or Tailwind) |
| `onRemove` | `() => void` | - | Remove callback |
| `removable` | `boolean` | `true` | Whether tag can be removed |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| `variant` | `'default' \| 'outline' \| 'solid'` | `'default'` | Visual variant |
| `disabled` | `boolean` | `false` | Disabled state |
| `className` | `string` | - | Additional CSS classes |

---

### 3. TagList

Read-only tag display component with overflow handling.

**Basic Usage:**

```tsx
import { TagList } from '@ainexsuite/ui';

<TagList tags={['React', 'TypeScript', 'Next.js']} />
```

**With Max Display:**

```tsx
<TagList
  tags={manyTags}
  max={3}  // Shows first 3 + "+N more"
/>
```

**Colored Tags:**

```tsx
<TagList
  tags={[
    { label: 'Work', color: '#3b82f6' },
    { label: 'Urgent', color: '#ef4444' },
  ]}
/>
```

**Clickable Tags:**

```tsx
<TagList
  tags={tags}
  onTagClick={(tag) => console.log('Clicked:', tag)}
/>
```

**Empty State:**

```tsx
<TagList
  tags={[]}
  showEmpty
  emptyText="No tags assigned"
/>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tags` | `string[] \| Array<{ label: string; color?: string }>` | Required | Tags to display |
| `max` | `number` | - | Max tags before "+N more" |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| `onTagClick` | `(tag: string) => void` | - | Click handler |
| `showEmpty` | `boolean` | `false` | Show empty state |
| `emptyText` | `string` | `'No tags'` | Empty state text |
| `className` | `string` | - | Additional CSS classes |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Add tag from input or selected suggestion |
| `,` (Comma) | Add tag from input |
| `Tab` | Add tag from input (if not empty) |
| `Backspace` | Remove last tag (when input is empty) |
| `↓` Arrow Down | Navigate down in suggestions |
| `↑` Arrow Up | Navigate up in suggestions |
| `Escape` | Close suggestions dropdown |

---

## Accessibility

All tag input components are fully accessible:

- ✅ Proper ARIA labels and roles
- ✅ Keyboard navigation support
- ✅ Screen reader announcements
- ✅ Focus management
- ✅ Semantic HTML

**ARIA Attributes:**
- `aria-label` - Input field label
- `aria-autocomplete` - Autocomplete behavior
- `aria-expanded` - Dropdown state
- `aria-controls` - References suggestions list
- `role="listbox"` - Suggestions container
- `role="option"` - Individual suggestions
- `aria-selected` - Selected suggestion

---

## Use Cases

### 1. Journey App - Tags for Journal Entries

```tsx
import { TagInput } from '@ainexsuite/ui';

function EntryEditor() {
  const [tags, setTags] = useState<string[]>([]);
  const suggestions = ['Mood', 'Gratitude', 'Goals', 'Reflection'];

  return (
    <TagInput
      value={tags}
      onChange={setTags}
      suggestions={suggestions}
      placeholder="Add mood tags..."
      maxTags={5}
      showCount
    />
  );
}
```

### 2. Notes App - Labels/Categories

```tsx
import { TagInput } from '@ainexsuite/ui';

function NoteLabels() {
  const [labels, setLabels] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const searchLabels = async (query: string) => {
    const results = await db.labels.search(query);
    setSuggestions(results);
  };

  return (
    <TagInput
      value={labels}
      onChange={setLabels}
      suggestions={suggestions}
      onSuggestionsSearch={searchLabels}
      allowCustom={true}
      placeholder="Add labels..."
    />
  );
}
```

### 3. Todo App - Task Tags

```tsx
import { TagInput } from '@ainexsuite/ui';

function TaskTags() {
  const [tags, setTags] = useState<string[]>([]);
  const categories = ['Work', 'Personal', 'Urgent', 'Low Priority'];

  return (
    <TagInput
      value={tags}
      onChange={setTags}
      suggestions={categories}
      allowCustom={false}  // Only allow predefined categories
      placeholder="Select categories..."
    />
  );
}
```

### 4. Display Tags (Read-only)

```tsx
import { TagList } from '@ainexsuite/ui';

function NoteCard({ note }) {
  return (
    <div>
      <h3>{note.title}</h3>
      <p>{note.body}</p>
      <TagList
        tags={note.tags}
        max={3}
        size="sm"
      />
    </div>
  );
}
```

---

## Styling & Customization

### Custom Colors

Tags can be customized with any CSS color value:

```tsx
<Tag label="Custom" color="#10b981" />
<Tag label="RGB" color="rgb(239, 68, 68)" />
<Tag label="HSL" color="hsl(262, 83%, 58%)" />
```

### Custom Styling

All components accept `className` for custom styling:

```tsx
<TagInput
  value={tags}
  onChange={setTags}
  className="border-2 border-purple-500 rounded-2xl"
/>

<Tag
  label="Custom"
  className="shadow-lg hover:scale-105 transition-transform"
/>
```

### Glassmorphism Dropdown

The suggestions dropdown uses glassmorphism styling by default:

```css
.suggestions-dropdown {
  backdrop-blur-xl;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

---

## Best Practices

1. **Debounce Async Searches**: Use `debounceDelay` (default 300ms) to avoid excessive API calls
2. **Limit Suggestions**: Show max 5 suggestions at a time for better UX
3. **Max Tags**: Set `maxTags` for finite tag lists (e.g., categories)
4. **Case Sensitivity**: Use `caseSensitive={false}` for better user experience
5. **Loading States**: Show `loading` prop during async operations
6. **Error States**: Validate and show `error` when needed
7. **Empty States**: Use `TagList` with `showEmpty` for empty tag displays
8. **Accessibility**: Always provide meaningful `placeholder` text

---

## Migration from Journey's ModernTagInput

The new `TagInput` component is a drop-in replacement for Journey's `ModernTagInput`:

**Before:**
```tsx
import { ModernTagInput } from '@/components/ui/modern-tag-input';

<ModernTagInput
  tags={tags}
  onTagsChange={setTags}
  suggestions={suggestions}
  placeholder="Add tags..."
/>
```

**After:**
```tsx
import { TagInput } from '@ainexsuite/ui';

<TagInput
  value={tags}  // Changed from 'tags'
  onChange={setTags}  // Changed from 'onTagsChange'
  suggestions={suggestions}
  placeholder="Add tags..."
/>
```

---

## Examples

See `tag-input.examples.tsx` for comprehensive usage examples including:
- Basic tag input
- Suggestions and async search
- Max tags with count
- Size variants
- Individual tag components
- Colored tags
- Tag lists (read-only)
- Error and disabled states
- Case-sensitive tags

---

## TypeScript Support

All components are fully typed with TypeScript:

```tsx
import type { TagInputProps, TagProps, TagListProps } from '@ainexsuite/ui';

const tagInputProps: TagInputProps = {
  value: ['React'],
  onChange: (tags: string[]) => console.log(tags),
  suggestions: ['React', 'TypeScript'],
  maxTags: 5,
  size: 'md',
};
```

---

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## License

Part of the AinexSuite UI component library.
