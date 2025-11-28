# Quick Start Guide - Unified List Components

Get started with the unified List components in under 5 minutes.

## Installation

The components are already available in `@ainexsuite/ui`. No additional installation needed!

```tsx
import { ListSection, ListItem, EmptyState, ListSkeleton } from '@ainexsuite/ui';
```

## Basic Example (Copy & Paste)

Here's a complete, working example you can copy and paste:

```tsx
'use client';

import { useState } from 'react';
import { ListSection, ListItem, EmptyState, ListSkeleton } from '@ainexsuite/ui';
import { Target, Plus } from 'lucide-react';

export function MyFirstList() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([
    { id: 1, title: 'First Item', completed: false },
    { id: 2, title: 'Second Item', completed: false },
    { id: 3, title: 'Third Item', completed: true },
  ]);

  if (loading) {
    return <ListSkeleton count={3} />;
  }

  if (!items.length) {
    return (
      <EmptyState
        title="No items yet"
        description="Add your first item to get started."
        icon={Target}
        action={{
          label: "Add Item",
          onClick: () => console.log('Add item'),
        }}
      />
    );
  }

  const activeItems = items.filter(item => !item.completed);
  const completedItems = items.filter(item => item.completed);

  return (
    <div className="space-y-8">
      <ListSection
        title="Active"
        count={activeItems.length}
        icon={Target}
        action={
          <button className="text-sm text-white/60 hover:text-white/90">
            <Plus className="h-4 w-4" />
          </button>
        }
      >
        {activeItems.map(item => (
          <ListItem
            key={item.id}
            title={item.title}
            onClick={() => console.log('Clicked:', item)}
          />
        ))}
      </ListSection>

      {completedItems.length > 0 && (
        <ListSection
          title="Completed"
          count={completedItems.length}
          collapsible
          defaultExpanded={false}
        >
          {completedItems.map(item => (
            <ListItem
              key={item.id}
              title={item.title}
              variant="compact"
            />
          ))}
        </ListSection>
      )}
    </div>
  );
}
```

## Component Cheat Sheet

### ListSection

```tsx
<ListSection
  title="Section Title"        // Required
  count={5}                     // Optional badge
  icon={Icon}                   // Optional icon
  collapsible                   // Make it collapsible
  defaultExpanded={true}        // Default state
  action={<button>Add</button>} // Optional action
>
  {/* Your list items */}
</ListSection>
```

### ListItem

```tsx
<ListItem
  title="Item Title"           // Required
  subtitle="Optional subtitle" // Optional
  icon={Icon}                  // Optional icon
  variant="default"            // 'default' | 'compact' | 'detailed'
  selected={false}             // Selection state
  disabled={false}             // Disabled state
  href="/path"                 // Make it a link
  onClick={() => {}}           // Click handler
  trailing={<span>Right</span>} // Right-side content
/>
```

### EmptyState

```tsx
<EmptyState
  title="No items"
  description="Optional description"
  icon={Icon}
  variant="default" // 'default' | 'minimal' | 'illustrated'
  action={{
    label: "Action",
    onClick: () => {},  // or href: "/path"
  }}
/>
```

### ListSkeleton

```tsx
<ListSkeleton
  count={5}           // Number of items
  variant="default"   // 'default' | 'compact'
/>
```

## Common Patterns

### Loading State

```tsx
{loading ? (
  <ListSkeleton count={3} />
) : (
  <ListSection title="Items">
    {/* Your items */}
  </ListSection>
)}
```

### Empty State

```tsx
{!items.length ? (
  <EmptyState title="No items" icon={Icon} />
) : (
  <ListSection title="Items" count={items.length}>
    {/* Your items */}
  </ListSection>
)}
```

### Grouped Lists

```tsx
<div className="space-y-8">
  <ListSection title="Group 1" count={group1.length}>
    {/* Items */}
  </ListSection>

  <ListSection title="Group 2" count={group2.length}>
    {/* Items */}
  </ListSection>
</div>
```

### Navigation List

```tsx
<ListSection title="Navigation">
  <ListItem title="Home" href="/" selected={pathname === '/'} />
  <ListItem title="Settings" href="/settings" />
</ListSection>
```

### List with Actions

```tsx
<ListItem
  title="Delete this item"
  trailing={
    <button onClick={(e) => {
      e.stopPropagation(); // Prevent item click
      handleDelete();
    }}>
      Delete
    </button>
  }
/>
```

### Collapsible Sections

```tsx
<ListSection
  title="Advanced Options"
  collapsible
  defaultExpanded={false}
>
  {/* Items only shown when expanded */}
</ListSection>
```

## Styling Tips

### Using Your App's Accent Color

Wrap your component tree with `AppColorProvider`:

```tsx
import { AppColorProvider } from '@ainexsuite/theme';

<AppColorProvider appId="journey" fallbackPrimary="#f97316">
  <MyFirstList />
</AppColorProvider>
```

### Custom Styles

Add custom classes to any component:

```tsx
<ListItem
  title="Custom styled"
  className="border-accent-500/30"
/>
```

### Variants

Try different visual variants:

```tsx
// Compact for mobile or dense lists
<ListItem title="Compact" variant="compact" />

// Default for standard lists
<ListItem title="Default" variant="default" />

// Detailed for rich content
<ListItem title="Detailed" variant="detailed" />
```

## Icon Usage

Import icons from `lucide-react`:

```tsx
import {
  Target,
  Star,
  Settings,
  Plus,
  Trash2,
  Edit,
  Check,
} from 'lucide-react';

<ListItem title="Goal" icon={Target} />
<ListItem title="Favorite" icon={Star} />
<ListItem title="Settings" icon={Settings} />
```

## Complete Example with All Features

```tsx
'use client';

import { useState } from 'react';
import {
  ListSection,
  ListItem,
  EmptyState,
  ListSkeleton,
} from '@ainexsuite/ui';
import { Target, Plus, Trash2, Star } from 'lucide-react';

export function AdvancedList() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([
    { id: 1, title: 'Task 1', starred: false, completed: false },
    { id: 2, title: 'Task 2', starred: true, completed: false },
    { id: 3, title: 'Task 3', starred: false, completed: true },
  ]);

  const handleDelete = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleToggleStar = (id: number) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, starred: !item.starred } : item
    ));
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <ListSkeleton count={3} />
        <ListSkeleton count={2} variant="compact" />
      </div>
    );
  }

  const activeItems = items.filter(item => !item.completed);
  const completedItems = items.filter(item => item.completed);

  if (!items.length) {
    return (
      <EmptyState
        title="No tasks yet"
        description="Create your first task to get started."
        icon={Target}
        variant="illustrated"
        action={{
          label: "Create Task",
          onClick: () => console.log('Create'),
        }}
      />
    );
  }

  return (
    <div className="space-y-8">
      <ListSection
        title="Active Tasks"
        count={activeItems.length}
        icon={Target}
        action={
          <button
            onClick={() => console.log('Add')}
            className="h-6 w-6 flex items-center justify-center text-white/60 hover:text-white/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        }
      >
        {activeItems.map(item => (
          <ListItem
            key={item.id}
            title={item.title}
            subtitle={item.starred ? 'Starred' : undefined}
            icon={item.starred ? Star : Target}
            selected={item.starred}
            trailing={
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleStar(item.id);
                  }}
                  className="h-8 w-8 flex items-center justify-center text-white/40 hover:text-yellow-400 rounded-full transition-colors"
                >
                  <Star className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                  className="h-8 w-8 flex items-center justify-center text-white/40 hover:text-red-400 rounded-full transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            }
            onClick={() => console.log('Edit:', item)}
          />
        ))}
      </ListSection>

      {completedItems.length > 0 && (
        <ListSection
          title="Completed"
          count={completedItems.length}
          collapsible
          defaultExpanded={false}
        >
          {completedItems.map(item => (
            <ListItem
              key={item.id}
              title={item.title}
              variant="compact"
            />
          ))}
        </ListSection>
      )}
    </div>
  );
}
```

## Troubleshooting

### Icons not showing?
Make sure to import from `lucide-react`:
```tsx
import { Target } from 'lucide-react';
```

### Styling not working?
Ensure your app has the theme provider:
```tsx
import { AppColorProvider } from '@ainexsuite/theme';
```

### TypeScript errors?
Import the types:
```tsx
import type { ListItemProps } from '@ainexsuite/ui';
```

### Components not imported?
Check your import path:
```tsx
import { ListItem } from '@ainexsuite/ui'; // ✅ Correct
import { ListItem } from '@ainexsuite/ui/lists'; // ❌ Wrong
```

## Next Steps

1. **Read the full docs**: Check `README.md` for complete API documentation
2. **See examples**: Review `EXAMPLES.md` for real-world usage patterns
3. **Explore variants**: Try different combinations of props
4. **Customize styling**: Add your own classes and styles
5. **Build something awesome**: Start creating with the components!

## Need Help?

- **Full Documentation**: `README.md`
- **Usage Examples**: `EXAMPLES.md`
- **Implementation Details**: `IMPLEMENTATION_SUMMARY.md`
- **Real Implementations**: Check Notes, Grow, and Fit apps

Happy coding! 🚀
