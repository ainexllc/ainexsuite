# StatsCard Quick Reference

## Import
```tsx
import { StatsCard } from '@ainexsuite/ui';
```

## Basic Usage
```tsx
<StatsCard title="Total" value={127} />
```

## Three Variants

```tsx
// Default (standard)
<StatsCard
  title="Entries"
  value={127}
/>

// Compact (small)
<StatsCard
  variant="compact"
  title="Streak"
  value="7 days"
/>

// Detailed (large + accent bar)
<StatsCard
  variant="detailed"
  title="Score"
  value={8.5}
/>
```

## With Icon
```tsx
import { BookOpen } from 'lucide-react';

<StatsCard
  title="Entries"
  value={127}
  icon={<BookOpen className="h-5 w-5" />}
/>
```

## With Trend
```tsx
// Positive trend
<StatsCard
  title="Users"
  value={1234}
  trend={{ value: 12.5, isPositive: true }}
/>

// Negative trend
<StatsCard
  title="Errors"
  value={45}
  trend={{ value: -8.2, isPositive: false }}
/>

// With label
<StatsCard
  title="Revenue"
  value="$12.5k"
  trend={{
    value: 18.2,
    isPositive: true,
    label: "vs last month"
  }}
/>
```

## With Subtitle
```tsx
<StatsCard
  title="Wellness Score"
  value={8.5}
  subtitle="Above your average"
/>
```

## Custom Color
```tsx
<StatsCard
  title="Steps"
  value="12,450"
  accentColor="#22c55e"  // Green
/>
```

## Common Layouts

### Dashboard Grid (4 columns)
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <StatsCard title="Entries" value={127} />
  <StatsCard title="Streak" value="7 days" />
  <StatsCard title="Score" value={8.5} />
  <StatsCard title="Growth" value="+23%" />
</div>
```

### Compact Sidebar
```tsx
<div className="grid grid-cols-1 gap-3">
  <StatsCard variant="compact" title="Today" value={5} />
  <StatsCard variant="compact" title="Week" value={12} />
  <StatsCard variant="compact" title="Month" value={47} />
</div>
```

### Hero Section (3 featured metrics)
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <StatsCard
    variant="detailed"
    title="Total Revenue"
    value="$48.2k"
    trend={{ value: 12.5, isPositive: true }}
  />
  <StatsCard
    variant="detailed"
    title="Active Users"
    value="1,234"
    trend={{ value: 8.1, isPositive: true }}
  />
  <StatsCard
    variant="detailed"
    title="Conversion Rate"
    value="3.2%"
    trend={{ value: 0.8, isPositive: true }}
  />
</div>
```

### Dense Analytics (6 columns)
```tsx
<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
  <StatsCard variant="compact" title="Revenue" value="$12k" />
  <StatsCard variant="compact" title="Users" value="1.2k" />
  <StatsCard variant="compact" title="Sessions" value="8.5k" />
  <StatsCard variant="compact" title="Bounce" value="45%" />
  <StatsCard variant="compact" title="Duration" value="2:34" />
  <StatsCard variant="compact" title="Pages" value="3.2" />
</div>
```

## Props Reference

| Prop | Type | Default | Required |
|------|------|---------|----------|
| `title` | `string` | - | ✅ |
| `value` | `string \| number` | - | ✅ |
| `icon` | `ReactNode` | - | ❌ |
| `trend` | `StatsTrend` | - | ❌ |
| `subtitle` | `string` | - | ❌ |
| `accentColor` | `string` | App theme | ❌ |
| `variant` | `'default' \| 'compact' \| 'detailed'` | `'default'` | ❌ |
| `className` | `string` | - | ❌ |

## StatsTrend Type
```tsx
interface StatsTrend {
  value: number;
  isPositive: boolean;
  label?: string;
}
```

## Variant Sizes

| Variant | Padding | Value | Icon |
|---------|---------|-------|------|
| `default` | `p-6` | `text-3xl` | `h-5 w-5` |
| `compact` | `p-4` | `text-2xl` | `h-4 w-4` |
| `detailed` | `p-6` | `text-4xl` | `h-6 w-6` |

## Color Palette

### Semantic Colors
```tsx
// Success / Positive
accentColor="#22c55e"  // Green

// Error / Alert
accentColor="#ef4444"  // Red

// Info
accentColor="#3b82f6"  // Blue

// Warning
accentColor="#f59e0b"  // Amber

// Journey theme
accentColor="#f97316"  // Orange

// Premium
accentColor="#8b5cf6"  // Purple
```

## Complete Example
```tsx
import { StatsCard } from '@ainexsuite/ui';
import { Heart } from 'lucide-react';

<StatsCard
  variant="detailed"
  title="Wellness Score"
  value={8.5}
  icon={<Heart className="h-6 w-6" />}
  trend={{
    value: 5.2,
    isPositive: true,
    label: "vs last month"
  }}
  subtitle="Above your average"
  accentColor="#22c55e"
  className="hover:scale-105"
/>
```

## Icons (Lucide React)

Common icons for stats:

```tsx
import {
  TrendingUp,     // Growth, increase
  TrendingDown,   // Decline, decrease
  Users,          // User count
  DollarSign,     // Revenue, money
  Heart,          // Health, wellness
  Activity,       // Activity, engagement
  Calendar,       // Time-based stats
  Clock,          // Duration
  Target,         // Goals, completion
  Award,          // Achievement
  Star,           // Rating
  Flame,          // Streak
  BookOpen,       // Entries, content
  MessageSquare,  // Comments, messages
  Eye,            // Views, impressions
  MousePointer,   // Clicks
  BarChart,       // Analytics
  PieChart,       // Distribution
} from 'lucide-react';
```

## App Theme Colors

When `accentColor` is not provided, uses app theme:

- **Journey**: `#f97316` (Orange)
- **Notes**: `#3b82f6` (Blue)
- **Health**: Dynamic based on app config
- **Pulse**: Dynamic based on app config

## Responsive Breakpoints

```tsx
// Mobile-first approach
grid-cols-1           // Mobile (all)
md:grid-cols-2        // Tablet (768px+)
lg:grid-cols-4        // Desktop (1024px+)
xl:grid-cols-6        // Large (1280px+)
2xl:grid-cols-8       // X-Large (1536px+)
```

## Tips

1. Use `variant="compact"` for sidebars and tight spaces
2. Use `variant="detailed"` for featured/hero metrics
3. Keep trend values concise (12.5 not 12.5234)
4. Include trend labels for context
5. Match icon semantics to metric meaning
6. Use consistent gaps in grids (`gap-4` for default, `gap-3` for compact)
7. Let theme colors work automatically when possible
8. Group related stats together
9. Use subtitle for additional context
10. Test on mobile - stats should stack nicely

## Testing Snippet

Quick test in your app:

```tsx
import { StatsCard } from '@ainexsuite/ui';
import { BookOpen, Flame, Heart, TrendingUp } from 'lucide-react';

export default function StatsTest() {
  return (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-bold">StatsCard Variants</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Default Variant"
          value={127}
          icon={<BookOpen className="h-5 w-5" />}
          trend={{ value: 12.5, isPositive: true }}
        />

        <StatsCard
          variant="compact"
          title="Compact Variant"
          value="7 days"
          icon={<Flame className="h-4 w-4" />}
        />

        <StatsCard
          variant="detailed"
          title="Detailed Variant"
          value={8.5}
          icon={<Heart className="h-6 w-6" />}
          trend={{ value: 5.2, isPositive: true }}
          subtitle="Above average"
        />
      </div>
    </div>
  );
}
```
