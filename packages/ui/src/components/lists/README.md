# List Components

Unified, reusable list components with consistent glassmorphism styling and accent color support across all AinexSuite apps.

## Components

### ListSection

A standardized section wrapper for lists with consistent header styling. Supports optional collapsible behavior, count badges, icons, and action buttons.

**Props:**
- `title` (string, required): Section title displayed in the header
- `count` (number, optional): Count to display next to the title
- `icon` (LucideIcon, optional): Icon component to display before the title
- `action` (ReactNode, optional): Action element (button/link) displayed on the right
- `collapsible` (boolean, optional): Whether the section can be collapsed/expanded (default: false)
- `defaultExpanded` (boolean, optional): Default expanded state for collapsible sections (default: true)
- `children` (ReactNode, required): Section content (list items)

**Example:**
```tsx
import { ListSection, ListItem } from '@ainexsuite/ui';
import { Target } from 'lucide-react';

<ListSection
  title="Active Goals"
  count={5}
  icon={Target}
  collapsible
  defaultExpanded
  action={<button>Add Goal</button>}
>
  <ListItem title="Goal 1" />
  <ListItem title="Goal 2" />
</ListSection>
```

### ListItem

A flexible list item component with support for icons, subtitles, trailing content, links, selection states, and multiple visual variants.

**Props:**
- `title` (ReactNode, required): Primary title text
- `subtitle` (ReactNode, optional): Optional subtitle or secondary text
- `icon` (LucideIcon, optional): Icon component to display before the title
- `trailing` (ReactNode, optional): Trailing content (right side) - badges, actions, etc.
- `href` (string, optional): Optional href to make the item a link
- `onClick` (function, optional): Click handler
- `selected` (boolean, optional): Whether the item is currently selected (default: false)
- `disabled` (boolean, optional): Whether the item is disabled (default: false)
- `variant` ('default' | 'compact' | 'detailed', optional): Visual variant (default: 'default')

**Example:**
```tsx
import { ListItem } from '@ainexsuite/ui';
import { CheckCircle } from 'lucide-react';

// Default list item
<ListItem
  title="My Task"
  subtitle="Due tomorrow"
  icon={CheckCircle}
  trailing={<span className="badge">High</span>}
/>

// Compact variant
<ListItem
  title="Quick note"
  variant="compact"
  onClick={() => console.log('clicked')}
/>

// As a link with selection
<ListItem
  title="Navigation Item"
  href="/path"
  selected
/>
```

### EmptyState

Standardized empty state display for lists and collections. Supports multiple variants and optional call-to-action buttons.

**Props:**
- `title` (string, required): Empty state title
- `description` (string, optional): Optional description text
- `icon` (LucideIcon, optional): Icon component to display
- `action` (object, optional): Action button configuration
  - `label` (string): Button label
  - `onClick` (function, optional): Click handler
  - `href` (string, optional): Link href
- `variant` ('default' | 'minimal' | 'illustrated', optional): Visual variant (default: 'default')

**Example:**
```tsx
import { EmptyState } from '@ainexsuite/ui';
import { AlarmClock } from 'lucide-react';

// Default empty state with action
<EmptyState
  title="No reminders scheduled"
  description="Set a reminder from any note to have it appear here."
  icon={AlarmClock}
  action={{
    label: "Create Reminder",
    onClick: () => console.log('create')
  }}
/>

// Minimal variant
<EmptyState
  title="No items found"
  variant="minimal"
/>

// Illustrated variant with link action
<EmptyState
  title="Start Your Journey"
  description="Create your first goal to get started."
  icon={Target}
  variant="illustrated"
  action={{
    label: "Create Goal",
    href: "/goals/new"
  }}
/>
```

### ListSkeleton

Loading skeleton for lists with animated shimmer effect. Provides visual feedback while content is loading.

**Props:**
- `count` (number, optional): Number of skeleton items to display (default: 3)
- `variant` ('default' | 'compact', optional): Visual variant (default: 'default')

**Example:**
```tsx
import { ListSkeleton } from '@ainexsuite/ui';

// Default skeleton
<ListSkeleton count={5} />

// Compact variant
<ListSkeleton count={10} variant="compact" />
```

## Complete Example

Here's a complete example showing how to use all components together:

```tsx
'use client';

import { useState } from 'react';
import {
  ListSection,
  ListItem,
  EmptyState,
  ListSkeleton,
} from '@ainexsuite/ui';
import { Target, Plus } from 'lucide-react';

export function GoalsList() {
  const [loading, setLoading] = useState(true);
  const [activeGoals, setActiveGoals] = useState([]);
  const [completedGoals, setCompletedGoals] = useState([]);

  if (loading) {
    return (
      <div className="space-y-8">
        <ListSkeleton count={3} />
        <ListSkeleton count={2} />
      </div>
    );
  }

  if (!activeGoals.length && !completedGoals.length) {
    return (
      <EmptyState
        title="No goals yet"
        description="Create your first goal to start tracking your progress."
        icon={Target}
        variant="illustrated"
        action={{
          label: "Create Goal",
          onClick: () => console.log('create goal')
        }}
      />
    );
  }

  return (
    <div className="space-y-8">
      <ListSection
        title="Active Goals"
        count={activeGoals.length}
        icon={Target}
        action={
          <button className="text-sm text-white/60 hover:text-white/90">
            <Plus className="h-4 w-4" />
          </button>
        }
      >
        {activeGoals.map((goal) => (
          <ListItem
            key={goal.id}
            title={goal.title}
            subtitle={`${goal.progress}% complete`}
            icon={Target}
            trailing={
              <span className="text-xs text-white/50">
                {goal.daysLeft} days left
              </span>
            }
            onClick={() => console.log('edit goal', goal.id)}
          />
        ))}
      </ListSection>

      <ListSection
        title="Completed Goals"
        count={completedGoals.length}
        collapsible
        defaultExpanded={false}
      >
        {completedGoals.map((goal) => (
          <ListItem
            key={goal.id}
            title={goal.title}
            subtitle={`Completed on ${goal.completedAt}`}
            variant="compact"
          />
        ))}
      </ListSection>
    </div>
  );
}
```

## Design System

All components follow the AinexSuite design system:

### Glassmorphism Styling
- Background: `bg-white/5` with `backdrop-blur-sm`
- Borders: `border-white/10` (default), `border-white/20` (hover)
- Selected: `border-white/30` with `bg-white/10`

### Typography
- Titles: `text-white/90` with `font-semibold`
- Subtitles: `text-white/50`
- Labels: `text-white/60`

### Spacing
- Section gaps: `space-y-3` or `space-y-8` for major sections
- Padding: `p-4` (default), `p-3` (compact), `p-5` (detailed)
- Rounded corners: `rounded-2xl` or `rounded-3xl`

### Interactions
- Transitions: `transition-all duration-200`
- Hover effects: `hover:bg-white/10 hover:border-white/20`
- Active states: `active:scale-[0.98]`

## Accent Color Support

Components use the theme system's accent colors automatically when wrapped in `AppColorProvider`:

```tsx
import { AppColorProvider } from '@ainexsuite/theme';

<AppColorProvider appId="journey" fallbackPrimary="#f97316">
  <GoalsList />
</AppColorProvider>
```

The accent color is available via CSS variables:
- `--color-primary`
- `--color-secondary`
- `--color-primary-rgb`
- `--color-secondary-rgb`

## Accessibility

All components follow accessibility best practices:

- Semantic HTML elements (`<section>`, `<article>`, etc.)
- ARIA attributes (`aria-expanded`, `aria-selected`, `aria-disabled`)
- Keyboard navigation support
- Focus states for interactive elements
- Screen reader friendly

## Migration Guide

If you have existing list implementations, here's how to migrate:

### From reminder-list.tsx (Notes app)

**Before:**
```tsx
<section className="space-y-3">
  <header className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-ink-400">
    <span>Overdue</span>
    {items.length > 0 && <span>{items.length}</span>}
  </header>
  {/* items */}
</section>
```

**After:**
```tsx
<ListSection title="Overdue" count={items.length}>
  {/* items */}
</ListSection>
```

### From goal-list.tsx (Grow app)

**Before:**
```tsx
<div className="surface-card rounded-lg p-6">
  <div className="flex items-start justify-between mb-4">
    <h3 className="text-lg font-semibold">{goal.title}</h3>
  </div>
  <p className="text-sm text-ink-700">{goal.description}</p>
</div>
```

**After:**
```tsx
<ListItem
  title={goal.title}
  subtitle={goal.description}
  variant="detailed"
/>
```

### From workout-list.tsx (Fit app)

**Before:**
```tsx
{workouts.map((workout) => (
  <article className="group relative cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-black/60 backdrop-blur-xl">
    <h3>{workout.title}</h3>
    {/* content */}
  </article>
))}
```

**After:**
```tsx
{workouts.map((workout) => (
  <ListItem
    title={workout.title}
    subtitle={`${workout.exercises.length} exercises`}
    variant="detailed"
    onClick={() => onEdit(workout)}
  />
))}
```

## Testing

The components are fully tested and type-safe:

```tsx
import { render, screen } from '@testing-library/react';
import { ListSection, ListItem } from '@ainexsuite/ui';

test('renders list section with items', () => {
  render(
    <ListSection title="Test Section" count={2}>
      <ListItem title="Item 1" />
      <ListItem title="Item 2" />
    </ListSection>
  );

  expect(screen.getByText('Test Section')).toBeInTheDocument();
  expect(screen.getByText('2')).toBeInTheDocument();
});
```

## Contributing

When adding new list-related components:

1. Follow the existing glassmorphism styling patterns
2. Support all three variants when applicable (default, compact, detailed)
3. Include full TypeScript types and JSDoc comments
4. Add comprehensive examples to this README
5. Ensure accessibility compliance
6. Test across all apps (journey, notes, fit, grow, etc.)
