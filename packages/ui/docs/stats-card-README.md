# StatsCard Component Documentation

A unified, flexible statistics display card for the AinexSuite monorepo.

## Quick Start

```tsx
import { StatsCard } from '@ainexsuite/ui';
import { BookOpen } from 'lucide-react';

<StatsCard
  title="Total Entries"
  value={127}
  icon={<BookOpen className="h-5 w-5" />}
  trend={{ value: 12.5, isPositive: true, label: "vs last week" }}
/>
```

## Features

- **Three Variants**: Default, Compact, and Detailed
- **Glassmorphic Design**: Beautiful backdrop blur effects
- **Theme Integration**: Automatically uses app colors from `useAppColors()`
- **Trend Indicators**: Visual feedback for positive/negative changes
- **Fully Responsive**: Optimized for mobile, tablet, and desktop
- **TypeScript Support**: Comprehensive type definitions
- **Flexible Icons**: Accepts any ReactNode, not just specific icon types
- **Custom Accents**: Override theme colors per card when needed

## Component Location

```
packages/ui/src/components/cards/stats-card.tsx
```

## Exports

```tsx
// From @ainexsuite/ui
export { StatsCard, type StatsCardProps, type StatsTrend } from '@ainexsuite/ui';
```

## Props API

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `title` | `string` | Yes | - | Label for the statistic |
| `value` | `string \| number` | Yes | - | Main value to display |
| `icon` | `ReactNode` | No | - | Icon component (e.g., Lucide icons) |
| `trend` | `StatsTrend` | No | - | Trend data with value and direction |
| `subtitle` | `string` | No | - | Additional description |
| `accentColor` | `string` | No | App theme | Hex color override (e.g., "#f97316") |
| `variant` | `'default' \| 'compact' \| 'detailed'` | No | `'default'` | Visual variant |
| `className` | `string` | No | - | Additional CSS classes |

### StatsTrend Interface

```typescript
interface StatsTrend {
  value: number;        // Percentage or numeric value
  isPositive: boolean;  // Direction of trend
  label?: string;       // Optional context (e.g., "vs last week")
}
```

## Variants

### Default
Standard size, perfect for dashboard grids.
- Padding: `p-6`
- Value size: `text-3xl`
- Icon size: `h-5 w-5`

### Compact
Smaller, denser layout for sidebars or tight spaces.
- Padding: `p-4`
- Value size: `text-2xl`
- Icon size: `h-4 w-4`

### Detailed
Larger with enhanced visual emphasis and gradient accent bar.
- Padding: `p-6`
- Value size: `text-4xl`
- Icon size: `h-6 w-6`
- Additional: Gradient accent bar at bottom

## Common Use Cases

### Dashboard Grid

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
<aside className="space-y-3">
  <StatsCard variant="compact" title="Today" value={5} />
  <StatsCard variant="compact" title="This Week" value={12} />
</aside>
```

### Featured Metrics

```tsx
<section className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <StatsCard
    variant="detailed"
    title="Wellness Score"
    value={8.5}
    trend={{ value: 5.2, isPositive: true }}
  />
</section>
```

## Theme Integration

The StatsCard automatically adapts to each app's theme:

- **Journey**: Orange (#f97316)
- **Notes**: Blue (#3b82f6)
- **Custom**: Override with `accentColor` prop

```tsx
// Uses app theme color
<StatsCard title="Entries" value={42} />

// Custom color
<StatsCard title="Tasks" value={15} accentColor="#8b5cf6" />
```

## Documentation Files

1. **[stats-card-examples.md](./stats-card-examples.md)**
   - Comprehensive usage examples
   - App-specific patterns
   - Best practices
   - Grid layouts

2. **[stats-card-structure.txt](./stats-card-structure.txt)**
   - Visual component structure
   - Variant comparisons
   - Accessibility notes
   - Responsive behavior

3. **[stats-card-migration.md](./stats-card-migration.md)**
   - Migration guide from app-specific implementations
   - Breaking changes
   - Rollback plan
   - Testing checklist

## Design System

### Colors

- **Text**: White with opacity for glass effect
  - Title: `text-white/70`
  - Value: `text-white`
  - Subtitle: `text-white/60`
  - Trend label: `text-white/50`

- **Background**: Glassmorphic layers
  - Base: `bg-white/5`
  - Border: `border-white/10`
  - Hover: `bg-white/10 border-white/20`

- **Accent**: Dynamic theme color
  - Icon background: `bg-[accent]/20`
  - Icon text: `text-[accent]`
  - Gradient bar: `from-transparent via-[accent]/50 to-transparent`

### Typography

- Title: `text-sm font-medium`
- Value: `text-3xl/4xl font-bold`
- Subtitle: `text-sm`
- Trend: `text-sm font-semibold`

### Spacing

- Default padding: `p-6`
- Compact padding: `p-4`
- Header margin: `mb-4` (default/detailed), `mb-2` (compact)
- Content spacing: `space-y-2`

### Borders

- Radius: `rounded-xl`
- Border width: `border` (1px)
- Border color: `border-white/10`

## Accessibility

- ✅ Semantic HTML (`<h3>` for titles)
- ✅ Color-blind friendly (trends include +/- symbols)
- ✅ Clear contrast ratios
- ✅ Hover states for interactivity
- ✅ Responsive touch targets

## Browser Support

- Modern browsers with backdrop-filter support
- Graceful fallback without blur on older browsers
- Responsive design for all screen sizes

## Performance

- Lightweight component (< 5KB)
- No external dependencies beyond theme package
- Efficient re-renders with React.forwardRef
- CSS variables for dynamic theming

## Examples in Apps

### Journey App
```tsx
// apps/journey/src/app/dashboard/page.tsx
import { StatsCard } from '@ainexsuite/ui';

<StatsCard
  title="Journal Entries"
  value={127}
  trend={{ value: 12.5, isPositive: true }}
/>
```

### Health App
```tsx
// apps/health/src/components/wellness-stats.tsx
<StatsCard
  variant="detailed"
  title="Heart Rate"
  value="72 bpm"
  accentColor="#ef4444"
/>
```

### Pulse App
```tsx
// apps/pulse/src/app/analytics/page.tsx
<div className="grid grid-cols-4 gap-3">
  <StatsCard variant="compact" title="Revenue" value="$12.5k" />
  <StatsCard variant="compact" title="Users" value="1,234" />
  <StatsCard variant="compact" title="Sessions" value="8,456" />
  <StatsCard variant="compact" title="Conversion" value="3.2%" />
</div>
```

## Contributing

When adding features to StatsCard:

1. Update the component in `/packages/ui/src/components/cards/stats-card.tsx`
2. Add examples to `stats-card-examples.md`
3. Update this README with new features
4. Test across all apps (Journey, Notes, Health, Pulse, etc.)
5. Ensure TypeScript types are comprehensive
6. Verify accessibility standards are met

## Version History

- **v1.0.0** (November 2025)
  - Initial unified implementation
  - Three variants (default, compact, detailed)
  - Theme integration with useAppColors()
  - Comprehensive TypeScript support
  - Full documentation suite

## License

Part of the AinexSuite monorepo. See root LICENSE file.
