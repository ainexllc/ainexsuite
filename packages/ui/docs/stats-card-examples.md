# StatsCard Component Examples

The `StatsCard` component is a flexible, glassmorphic statistics display card with multiple variants.

## Import

```tsx
import { StatsCard } from '@ainexsuite/ui';
```

## Basic Usage

### Default Variant

```tsx
import { BookOpen } from 'lucide-react';

<StatsCard
  title="Total Entries"
  value={127}
  icon={<BookOpen className="h-5 w-5" />}
  subtitle="Journal entries this month"
/>
```

### With Trend Indicator

```tsx
import { TrendingUp } from 'lucide-react';

<StatsCard
  title="Active Users"
  value="1,234"
  icon={<TrendingUp className="h-5 w-5" />}
  trend={{
    value: 12.5,
    isPositive: true,
    label: "vs last week"
  }}
/>
```

## Variants

### Compact Variant

Smaller, condensed version ideal for dashboard grids:

```tsx
import { Flame } from 'lucide-react';

<StatsCard
  variant="compact"
  title="Streak"
  value="7 days"
  icon={<Flame className="h-4 w-4" />}
/>
```

### Detailed Variant

Enhanced version with additional visual emphasis:

```tsx
import { Heart } from 'lucide-react';

<StatsCard
  variant="detailed"
  title="Wellness Score"
  value={8.5}
  icon={<Heart className="h-5 w-5" />}
  trend={{
    value: 5.2,
    isPositive: true,
    label: "from last month"
  }}
  subtitle="Above your average"
/>
```

## Custom Accent Colors

Override the app theme color with a custom accent:

```tsx
<StatsCard
  title="Steps Today"
  value="12,450"
  accentColor="#22c55e" // Green
  trend={{
    value: 8.3,
    isPositive: true
  }}
/>
```

## Negative Trends

Display decreasing metrics:

```tsx
import { DollarSign } from 'lucide-react';

<StatsCard
  title="Outstanding Balance"
  value="$1,240"
  icon={<DollarSign className="h-5 w-5" />}
  trend={{
    value: -15.2,
    isPositive: false,
    label: "vs last month"
  }}
  subtitle="Down from $1,464"
/>
```

## Grid Layout Example

Using multiple StatsCards in a responsive grid:

```tsx
import { BookOpen, Flame, Heart, TrendingUp } from 'lucide-react';

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <StatsCard
    title="Total Entries"
    value={127}
    icon={<BookOpen className="h-5 w-5" />}
    trend={{ value: 12.5, isPositive: true }}
  />

  <StatsCard
    title="Current Streak"
    value="7 days"
    icon={<Flame className="h-5 w-5" />}
    accentColor="#f97316"
  />

  <StatsCard
    title="Wellness Score"
    value={8.5}
    icon={<Heart className="h-5 w-5" />}
    trend={{ value: 5.2, isPositive: true }}
  />

  <StatsCard
    title="Weekly Growth"
    value="+23%"
    icon={<TrendingUp className="h-5 w-5" />}
    accentColor="#22c55e"
  />
</div>
```

## Compact Grid

Using compact variant for denser layouts:

```tsx
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
  {stats.map(stat => (
    <StatsCard
      key={stat.id}
      variant="compact"
      title={stat.title}
      value={stat.value}
      icon={stat.icon}
    />
  ))}
</div>
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | Required | Label for the statistic |
| `value` | `string \| number` | Required | The main value to display |
| `icon` | `ReactNode` | Optional | Icon component to display |
| `trend` | `StatsTrend` | Optional | Trend indicator data |
| `subtitle` | `string` | Optional | Description or additional info |
| `accentColor` | `string` | App theme | Custom hex color (e.g., "#f97316") |
| `variant` | `'default' \| 'compact' \| 'detailed'` | `'default'` | Visual variant |
| `className` | `string` | Optional | Additional CSS classes |

### StatsTrend Interface

```typescript
interface StatsTrend {
  value: number;        // Percentage or numeric value (e.g., 12.5)
  isPositive: boolean;  // Whether trend is positive (true) or negative (false)
  label?: string;       // Optional label (e.g., "vs last week")
}
```

## Theme Integration

The StatsCard automatically uses the app's theme colors from `useAppColors()`:

```tsx
// Journey app (Orange theme)
<StatsCard title="Entries" value={42} />  // Uses orange accent

// Notes app (Blue theme)
<StatsCard title="Notes" value={128} />   // Uses blue accent

// Custom override
<StatsCard title="Tasks" value={15} accentColor="#8b5cf6" />  // Uses purple
```

## Styling Notes

- **Glassmorphism**: All variants use `bg-white/5 backdrop-blur` for glass effect
- **Borders**: Uses `border-white/10` with hover state `border-white/20`
- **Hover Effects**: Smooth transitions on hover with elevated shadow
- **Responsive**: Works seamlessly across all screen sizes
- **Dark Mode**: Built for dark backgrounds, uses white text with opacity
- **Accessibility**: Proper semantic HTML with clear hierarchy

## App-Specific Examples

### Journey App (Orange + Forest Green)

```tsx
import { BookOpen, Calendar, Flame } from 'lucide-react';

// Journal entries with orange accent
<StatsCard
  title="Journal Entries"
  value={127}
  icon={<BookOpen className="h-5 w-5" />}
  trend={{ value: 12.5, isPositive: true }}
/>

// Streak with custom orange
<StatsCard
  title="Current Streak"
  value="30 days"
  icon={<Flame className="h-5 w-5" />}
  accentColor="#f97316"
/>
```

### Health App (Wellness Focus)

```tsx
import { Heart, Activity, Moon } from 'lucide-react';

<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <StatsCard
    variant="detailed"
    title="Heart Rate"
    value="72 bpm"
    icon={<Heart className="h-6 w-6" />}
    subtitle="Resting rate"
    accentColor="#ef4444"
  />

  <StatsCard
    variant="detailed"
    title="Activity Score"
    value={850}
    icon={<Activity className="h-6 w-6" />}
    trend={{ value: 8.2, isPositive: true }}
    accentColor="#22c55e"
  />

  <StatsCard
    variant="detailed"
    title="Sleep Quality"
    value="8.5/10"
    icon={<Moon className="h-6 w-6" />}
    subtitle="Last night"
    accentColor="#3b82f6"
  />
</div>
```

### Pulse App (Metrics Dashboard)

```tsx
// Compact metrics in a dense grid
<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
  <StatsCard
    variant="compact"
    title="Revenue"
    value="$12.5k"
    trend={{ value: 18.2, isPositive: true }}
  />

  <StatsCard
    variant="compact"
    title="Users"
    value="1,234"
    trend={{ value: 5.1, isPositive: true }}
  />

  <StatsCard
    variant="compact"
    title="Sessions"
    value="8,456"
    trend={{ value: -2.3, isPositive: false }}
  />

  <StatsCard
    variant="compact"
    title="Conversion"
    value="3.2%"
    trend={{ value: 0.8, isPositive: true }}
  />
</div>
```

## Best Practices

1. **Variant Selection**:
   - Use `default` for primary metrics on dashboards
   - Use `compact` for dense grids or sidebars
   - Use `detailed` for featured metrics or hero sections

2. **Trend Indicators**:
   - Always include `label` for context (e.g., "vs last week")
   - Use positive/negative appropriately (lower costs = positive)
   - Keep percentage values concise (12.5 not 12.5234)

3. **Icons**:
   - Use lucide-react icons for consistency
   - Match icon semantics to the metric
   - Keep icon sizes consistent within the same layout

4. **Accent Colors**:
   - Let theme colors work automatically when possible
   - Override only for semantic emphasis (red for errors, green for success)
   - Ensure sufficient contrast with glassmorphic backgrounds

5. **Grid Layouts**:
   - Use responsive grid classes: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
   - Maintain consistent gaps: `gap-4` for default, `gap-3` for compact
   - Consider mobile-first layouts

6. **Accessibility**:
   - Ensure trend colors (green/red) aren't the only indicator
   - Provide subtitle context when needed
   - Use semantic value formatting (e.g., "$1,234" not "1234")
