# Migrating to Unified StatsCard

This guide helps you migrate from app-specific StatsCard implementations to the unified `@ainexsuite/ui` version.

## Background

Previously, each app (Journey, Grow, Health, Pulse) had its own StatsCard implementation. The unified StatsCard in `@ainexsuite/ui` consolidates these into a single, flexible component.

## Migration Steps

### Step 1: Update Imports

**Before:**
```tsx
// apps/journey/src/components/dashboard/stats-card.tsx
import { StatsCard } from '@/components/dashboard/stats-card';
```

**After:**
```tsx
// Any app
import { StatsCard } from '@ainexsuite/ui';
```

### Step 2: Update Props

The unified StatsCard is backward compatible with most existing implementations, but offers additional features.

#### Journey App Migration

**Before (Journey-specific):**
```tsx
interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  className?: string;
}
```

**After (Unified):**
```tsx
interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;  // More flexible than LucideIcon
  trend?: {
    value: number;
    label?: string;        // Optional in unified version
    isPositive: boolean;
  };
  variant?: 'default' | 'compact' | 'detailed';  // NEW
  accentColor?: string;                          // NEW
  className?: string;
}
```

#### Key Differences

1. **Icon Prop**: Changed from `LucideIcon` to `ReactNode` for flexibility
   ```tsx
   // Both still work
   icon={BookOpen}              // Before (LucideIcon type)
   icon={<BookOpen />}          // After (ReactNode - preferred)
   ```

2. **Trend Label**: Now optional
   ```tsx
   // Before: label required
   trend={{ value: 12.5, label: "vs last week", isPositive: true }}

   // After: label optional
   trend={{ value: 12.5, isPositive: true }}
   trend={{ value: 12.5, label: "vs last week", isPositive: true }}
   ```

3. **New Variants**: Three size options
   ```tsx
   variant="default"   // Standard (same as before)
   variant="compact"   // Smaller, denser
   variant="detailed"  // Larger, with accent bar
   ```

4. **Theme Integration**: Automatic color from `useAppColors()`
   ```tsx
   // No accentColor = uses app theme (orange for Journey, blue for Notes)
   <StatsCard title="Entries" value={42} />

   // Custom color override
   <StatsCard title="Tasks" value={15} accentColor="#8b5cf6" />
   ```

### Step 3: Update Styling

#### Before (Journey App)

```tsx
<StatsCard
  title="Total Entries"
  value={127}
  // Used border-2 border-gray-200 dark:border-gray-800
  // bg-white dark:bg-gray-900
/>
```

#### After (Unified - Glassmorphic)

```tsx
<StatsCard
  title="Total Entries"
  value={127}
  // Automatically uses glassmorphic styling:
  // bg-white/5 backdrop-blur border-white/10
  // Optimized for dark backgrounds
/>
```

**Note:** The unified version is designed for dark/glassmorphic layouts. If you need the solid card style, use the base `Card` component instead.

### Step 4: Remove Old Components

Once migrated, you can safely remove app-specific StatsCard files:

```bash
# Journey app
rm apps/journey/src/components/dashboard/stats-card.tsx

# Other apps (if they had custom implementations)
rm apps/grow/src/components/stats-card.tsx
rm apps/health/src/components/stats-card.tsx
rm apps/pulse/src/components/stats-card.tsx
```

## Common Migration Patterns

### Pattern 1: Dashboard Stats Grid

**Before:**
```tsx
// apps/journey/src/app/dashboard/page.tsx
import { StatsCard } from '@/components/dashboard/stats-card';

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <StatsCard title="Entries" value={127} icon={BookOpen} />
  <StatsCard title="Streak" value="7 days" icon={Flame} />
</div>
```

**After:**
```tsx
import { StatsCard } from '@ainexsuite/ui';
import { BookOpen, Flame } from 'lucide-react';

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <StatsCard
    title="Entries"
    value={127}
    icon={<BookOpen className="h-5 w-5" />}  // Wrap in JSX
  />
  <StatsCard
    title="Streak"
    value="7 days"
    icon={<Flame className="h-5 w-5" />}
  />
</div>
```

### Pattern 2: Compact Sidebar Stats

**New capability:**
```tsx
// Sidebar with compact stats
<aside className="w-64 space-y-3">
  <StatsCard
    variant="compact"
    title="This Week"
    value={12}
    icon={<Calendar className="h-4 w-4" />}
  />
  <StatsCard
    variant="compact"
    title="This Month"
    value={47}
    icon={<TrendingUp className="h-4 w-4" />}
  />
</aside>
```

### Pattern 3: Featured Metrics

**New capability:**
```tsx
// Hero section with detailed variant
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <StatsCard
    variant="detailed"
    title="Wellness Score"
    value={8.5}
    icon={<Heart className="h-6 w-6" />}
    trend={{ value: 5.2, isPositive: true }}
    subtitle="Above your average"
  />
</div>
```

## Theme Compatibility

### Journey App (Orange + Forest Green)

```tsx
// Automatically uses orange (#f97316) from app theme
<StatsCard title="Entries" value={127} />

// Or override with forest green for specific cards
<StatsCard
  title="Completed Goals"
  value={8}
  accentColor="#22c55e"  // Forest green
/>
```

### Notes App (Blue)

```tsx
// Automatically uses blue (#3b82f6) from app theme
<StatsCard title="Notes" value={128} />
```

### Health App

```tsx
// Custom accent colors for different health metrics
<StatsCard
  title="Heart Rate"
  value="72 bpm"
  accentColor="#ef4444"  // Red
/>
<StatsCard
  title="Sleep Quality"
  value={8.5}
  accentColor="#3b82f6"  // Blue
/>
```

## Breaking Changes

### Icon Type Change

If you were using TypeScript with strict typing:

**Before:**
```tsx
import type { LucideIcon } from 'lucide-react';

const stats: Array<{ icon: LucideIcon }> = [
  { icon: BookOpen },  // Type: LucideIcon
];
```

**After:**
```tsx
import type { ReactNode } from 'react';

const stats: Array<{ icon: ReactNode }> = [
  { icon: <BookOpen className="h-5 w-5" /> },  // Type: ReactNode
];
```

### Styling Approach

The unified StatsCard uses glassmorphism and is optimized for dark backgrounds. If you need a solid background:

```tsx
// For light backgrounds, use base Card component
import { Card, CardContent, CardHeader } from '@ainexsuite/ui';

<Card>
  <CardHeader>
    <h3>Total Entries</h3>
  </CardHeader>
  <CardContent>
    <p className="text-3xl font-bold">127</p>
  </CardContent>
</Card>
```

## Testing Checklist

After migration, verify:

- [ ] Stats cards display correctly in each app
- [ ] Theme colors are applied properly (orange for Journey, blue for Notes, etc.)
- [ ] Hover effects work smoothly
- [ ] Responsive layouts function on mobile/tablet/desktop
- [ ] Trend indicators show correct colors (green for positive, red for negative)
- [ ] Icons render at appropriate sizes for each variant
- [ ] TypeScript compilation succeeds without errors
- [ ] No visual regressions compared to previous implementation

## Rollback Plan

If issues arise, you can temporarily revert by:

1. Keep old component files but rename them
2. Update imports back to local components
3. Report issues to the team
4. Fix unified component
5. Re-migrate when ready

```bash
# Temporary rollback
git checkout HEAD -- apps/journey/src/components/dashboard/stats-card.tsx

# Update imports back to local
# import { StatsCard } from '@/components/dashboard/stats-card';
```

## Benefits of Migration

1. **Consistency**: Same look and feel across all apps
2. **Maintainability**: One component to update instead of 4+
3. **Features**: New variants and customization options
4. **Theme Integration**: Automatic app color detection
5. **Type Safety**: Comprehensive TypeScript definitions
6. **Documentation**: Centralized examples and guidelines
7. **Future Proof**: Easier to add new features globally

## Support

For questions or issues during migration:

1. Check the examples: `/packages/ui/docs/stats-card-examples.md`
2. View structure: `/packages/ui/docs/stats-card-structure.txt`
3. Review source: `/packages/ui/src/components/cards/stats-card.tsx`
4. Create an issue with specific migration challenges
