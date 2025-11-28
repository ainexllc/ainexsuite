# Card Components

This directory contains reusable card components for the AinexSuite UI library.

## Components

### 1. Card (Basic Primitives)
**File**: `card.tsx`

Basic card building blocks based on standard patterns:
- `Card` - Container with rounded corners and shadow
- `CardHeader` - Header section with padding
- `CardTitle` - Title text with proper sizing
- `CardDescription` - Subtitle/description text
- `CardContent` - Main content area
- `CardFooter` - Footer section for actions

**Usage**:
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@ainexsuite/ui';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
</Card>
```

### 2. StatsCard
**File**: `stats-card.tsx`

Specialized card for displaying statistics with trends and comparisons.

**Usage**:
```tsx
import { StatsCard } from '@ainexsuite/ui';

<StatsCard
  title="Total Users"
  value={1234}
  trend="up"
  change={12.5}
/>
```

### 3. DataCard (New)
**File**: `data-card.tsx`

Flexible, all-in-one card for displaying content items with multiple variants.

**Variants**:
- `default` - Standard card
- `compact` - Minimal for lists
- `highlighted` - With accent glow
- `interactive` - Enhanced hover

**Usage**:
```tsx
import { DataCard } from '@ainexsuite/ui';

<DataCard
  variant="interactive"
  title="Workout Session"
  subtitle="45 minutes"
  icon={<Icon />}
  onClick={() => {}}
  footer={<div>Footer content</div>}
>
  Card content
</DataCard>
```

## When to Use Which Card

### Use `Card` primitives when:
- Building custom card layouts
- Need fine-grained control over structure
- Composing complex card designs
- Following specific design patterns

### Use `StatsCard` when:
- Displaying numeric statistics
- Showing trends (up/down)
- Dashboard metrics
- KPI displays

### Use `DataCard` when:
- Displaying content items (notes, workouts, etc.)
- Need variants (compact, highlighted, interactive)
- Want consistent styling across apps
- Building lists of similar items
- Need click handlers or navigation

## Design Principles

All cards follow these principles:

1. **Glassmorphism**: Black/dark background with backdrop blur
2. **Border**: Subtle white borders (white/10)
3. **Hover**: Enhanced on interaction (border, shadow)
4. **Responsive**: Mobile-first design
5. **Accessible**: Semantic HTML and ARIA
6. **Consistent**: Shared spacing and typography

## Styling Guidelines

### Border Radius
- Small cards: `rounded-lg`
- Default cards: `rounded-xl`
- Large/highlighted: `rounded-2xl`

### Padding
- Compact: `px-4 py-3`
- Default: `px-6 py-6`
- Footer: `px-6 pb-4 pt-3`

### Colors
- Background: `bg-black/60 backdrop-blur-xl`
- Border: `border-white/10`
- Text: White with opacity variations
- Accent: App-specific (Journey orange, Notes blue, etc.)

### Transitions
- Duration: `300ms`
- Easing: Default ease
- Properties: border, shadow, transform

## App-Specific Patterns

### Journey (Orange Theme)
```tsx
<DataCard
  variant="highlighted"
  accentColor="#f97316"
  // ... other props
/>
```

### Notes (Blue Theme)
```tsx
<DataCard
  variant="default"
  accentColor="#3b82f6"
  // ... other props
/>
```

### Fit (Purple Theme)
```tsx
<DataCard
  variant="interactive"
  accentColor="#8b5cf6"
  // ... other props
/>
```

## Examples

See `data-card.examples.tsx` for comprehensive examples including:
- All variants
- Click handlers
- Navigation links
- Custom footers
- Progress bars
- Badges
- Grid layouts
- Loading states
- Error states

## Documentation

Full documentation available at:
- **DataCard**: `packages/ui/docs/DATA_CARD.md`
- **Examples**: `data-card.examples.tsx`

## Migration

When migrating app-specific cards to shared components:

1. Identify card patterns in your app
2. Choose appropriate component (Card, StatsCard, or DataCard)
3. Map props to new component
4. Apply app-specific accent color
5. Test responsive behavior
6. Verify accessibility

## Future Enhancements

Planned additions:
- Animation variants
- Loading skeletons
- Error boundaries
- Drag and drop support
- More specialized card types (MediaCard, ProfileCard, etc.)
