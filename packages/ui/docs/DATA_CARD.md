# DataCard Component

A flexible, reusable card component for displaying content items with multiple variants and styling options.

## Location

- **Component**: `packages/ui/src/components/cards/data-card.tsx`
- **Export**: Available from `@ainexsuite/ui`

## Features

- Multiple variants (default, compact, highlighted, interactive)
- Glassmorphism design with backdrop blur
- Support for both button-like clicks and anchor links
- Dynamic accent colors with glow effects
- Optional icon, title, subtitle, badge, and footer
- Fully accessible with keyboard navigation
- TypeScript types included
- Responsive and mobile-friendly

## Installation

```tsx
import { DataCard } from '@ainexsuite/ui';
```

## Variants

### 1. Default
Standard card with balanced spacing and subtle hover effects.

```tsx
<DataCard
  variant="default"
  title="Workout Session"
  subtitle="45 minutes"
>
  Content goes here
</DataCard>
```

### 2. Compact
Minimal card with reduced padding, ideal for list views.

```tsx
<DataCard
  variant="compact"
  title="Quick Note"
  subtitle="2 hours ago"
>
  Brief content
</DataCard>
```

### 3. Highlighted
Card with accent border and glow effect for emphasis.

```tsx
<DataCard
  variant="highlighted"
  title="Important"
  accentColor="#f97316"
>
  This stands out!
</DataCard>
```

### 4. Interactive
Enhanced hover effects with scale animation for clickable cards.

```tsx
<DataCard
  variant="interactive"
  title="Click Me"
  onClick={() => console.log('clicked')}
>
  Interactive content
</DataCard>
```

## Props API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'compact' \| 'highlighted' \| 'interactive'` | `'default'` | Card style variant |
| `title` | `string` | - | Card title |
| `subtitle` | `string` | - | Optional subtitle/metadata |
| `icon` | `React.ReactNode` | - | Optional leading icon |
| `children` | `React.ReactNode` | - | Card content |
| `footer` | `React.ReactNode` | - | Optional footer content |
| `onClick` | `(event: React.MouseEvent) => void` | - | Click handler |
| `href` | `string` | - | Link URL (renders as anchor) |
| `target` | `string` | - | Anchor target attribute |
| `rel` | `string` | - | Anchor rel attribute |
| `accentColor` | `string` | - | Hex or CSS color for accents |
| `badge` | `React.ReactNode` | - | Optional badge/tag |
| `className` | `string` | - | Additional CSS classes |

## Usage Examples

### Basic Card

```tsx
<DataCard
  title="My Card"
  subtitle="Subtitle text"
>
  <p>This is the card content.</p>
</DataCard>
```

### Card with Icon

```tsx
import { Dumbbell } from 'lucide-react';

<DataCard
  title="Workout"
  icon={<Dumbbell className="h-5 w-5" />}
>
  <p>45 minutes of strength training</p>
</DataCard>
```

### Card with Footer

```tsx
<DataCard
  title="Session Details"
  footer={
    <div className="flex items-center gap-2 text-xs text-white/50">
      <span>Nov 27, 2025</span>
      <span>•</span>
      <span>45 min</span>
    </div>
  }
>
  <p>Full body workout</p>
</DataCard>
```

### Interactive Card with Click

```tsx
<DataCard
  variant="interactive"
  title="Start Workout"
  onClick={() => startNewWorkout()}
>
  <p>Click to begin tracking</p>
</DataCard>
```

### Link Card

```tsx
<DataCard
  variant="interactive"
  title="View History"
  href="/workouts/history"
>
  <p>See all past sessions</p>
</DataCard>
```

### Highlighted Card with Accent

```tsx
<DataCard
  variant="highlighted"
  title="Active Goal"
  accentColor="#f97316"
  badge={
    <span className="px-2 py-1 text-xs bg-orange-500/20 text-orange-400 rounded-full">
      ACTIVE
    </span>
  }
>
  <p>30-day streak challenge</p>
</DataCard>
```

### Card with Progress Footer

```tsx
<DataCard
  title="Goal Progress"
  accentColor="#3b82f6"
  footer={
    <div className="w-full">
      <div className="flex justify-between text-xs text-white/60 mb-1">
        <span>Progress</span>
        <span>15 / 30</span>
      </div>
      <div className="h-2 bg-black/40 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all"
          style={{ width: '50%' }}
        />
      </div>
    </div>
  }
>
  <p>Keep going!</p>
</DataCard>
```

### Grid of Cards

```tsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  {items.map((item) => (
    <DataCard
      key={item.id}
      variant="interactive"
      title={item.title}
      subtitle={item.subtitle}
      onClick={() => handleSelect(item)}
    >
      <p>{item.description}</p>
    </DataCard>
  ))}
</div>
```

## Styling

### Base Styles
- Background: `bg-black/60 backdrop-blur-xl`
- Border: `border-white/10`
- Text: White with varying opacity

### Border Radius by Variant
- **default**: `rounded-xl`
- **compact**: `rounded-lg`
- **highlighted**: `rounded-2xl`
- **interactive**: `rounded-xl`

### Hover Effects
- Border: `hover:border-white/20`
- Shadow: `hover:shadow-2xl`
- Scale (interactive only): `hover:scale-[1.01]`

### Accent Color
When provided, accent color is used for:
- Border color (highlighted variant): `${accentColor}30`
- Box shadow (highlighted variant): `0 0 20px ${accentColor}20`
- Footer background: `${accentColor}1a`
- Background glow (highlighted variant)

## Accessibility

- Semantic HTML (`<article>` or `<a>`)
- Proper ARIA roles for interactive cards
- Keyboard navigation support (Enter/Space)
- Tab index for focusable elements
- Descriptive labels when needed

## Integration with Existing Code

### Replacing Note Cards
```tsx
// Before
<div className="note-card">...</div>

// After
<DataCard
  variant="default"
  title={note.title}
  subtitle={formatDate(note.updatedAt)}
>
  {note.content}
</DataCard>
```

### Replacing Workout Cards
```tsx
// Before
<article className="workout-card">...</article>

// After
<DataCard
  variant="interactive"
  title={workout.title}
  subtitle={`${workout.duration} min`}
  icon={<Dumbbell />}
  onClick={() => editWorkout(workout)}
  footer={<WorkoutStats workout={workout} />}
>
  <ExerciseList exercises={workout.exercises} />
</DataCard>
```

### Replacing Wager Cards
```tsx
// Before
<div className="wager-card">...</div>

// After
<DataCard
  variant="highlighted"
  title={wager.description}
  accentColor="#f97316"
  badge={<ActiveBadge />}
  footer={<ProgressBar current={streak} target={wager.target} />}
>
  <WagerDetails wager={wager} />
</DataCard>
```

## Best Practices

1. **Use appropriate variants**:
   - `default` for general content display
   - `compact` for dense list views
   - `highlighted` for important/active items
   - `interactive` for clickable/navigable cards

2. **Accent colors**:
   - Use consistently across the app
   - Match app theme colors
   - Journey: Orange (#f97316)
   - Notes: Blue (#3b82f6)
   - Fit: Purple (#8b5cf6)

3. **Footer content**:
   - Keep metadata/actions in footer
   - Use consistent text sizes (text-xs)
   - Apply accent background via accentColor prop

4. **Icons**:
   - Use Lucide icons for consistency
   - Size: h-5 w-5 for default, h-4 w-4 for compact
   - Color inherits from parent (white/accent)

5. **Performance**:
   - Avoid inline functions for onClick
   - Memoize card content if rendering many cards
   - Use React.memo for list items

## TypeScript

All props are fully typed. Import types as needed:

```tsx
import { DataCard, type DataCardProps, type DataCardVariant } from '@ainexsuite/ui';

const variant: DataCardVariant = 'highlighted';

const props: DataCardProps = {
  variant,
  title: 'My Card',
  accentColor: '#f97316',
};
```

## Related Components

- **Card**: Basic card primitives (CardHeader, CardContent, etc.)
- **StatsCard**: Specialized card for statistics display
- **ListItem**: For simple list items without card styling

## Examples

See `packages/ui/src/components/cards/data-card.examples.tsx` for comprehensive usage examples including:
- Default card with full features
- Compact list cards
- Highlighted accent cards
- Interactive click handlers
- Link navigation
- Custom footers
- Card grids
- Loading states
- Error states

## Migration Guide

When migrating from app-specific card components:

1. Identify card usage patterns
2. Map to appropriate DataCard variant
3. Extract common props (title, subtitle, icon)
4. Move metadata to footer
5. Apply accent colors matching app theme
6. Test click handlers and navigation
7. Verify responsive behavior

## Future Enhancements

Potential additions (not yet implemented):
- Animation variants
- Dark/light mode support
- Loading skeleton states
- Error boundary integration
- Drag and drop support
- Custom border styles
