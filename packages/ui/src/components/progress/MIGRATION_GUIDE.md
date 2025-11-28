# Progress Components Migration Guide

This guide shows how to migrate from app-specific progress implementations to the unified `@ainexsuite/ui` progress components.

## What We Unified

### From `apps/grow/src/components/progress-dashboard.tsx`

**Before:**
```tsx
<div className="w-full h-2 surface-elevated rounded-full overflow-hidden">
  <div
    className="h-full bg-accent-500 progress-bar"
    style={{ width: `${Math.min(100, progress)}%` }}
  />
</div>
```

**After:**
```tsx
import { ProgressBar } from '@ainexsuite/ui';

<ProgressBar value={progress} />
```

### From `apps/grow/src/components/goal-list.tsx`

**Before:**
```tsx
<div className="flex items-center justify-between text-sm mb-2">
  <span className="text-ink-700">Progress</span>
  <span className="font-medium">
    {goal.currentLevel}/{goal.targetLevel} ({Math.round(progress)}%)
  </span>
</div>
<div className="w-full h-2 surface-elevated rounded-full overflow-hidden">
  <div
    className="h-full bg-accent-500 progress-bar"
    style={{ width: `${Math.min(100, progress)}%` }}
  />
</div>
```

**After:**
```tsx
import { ProgressBar } from '@ainexsuite/ui';

<div className="flex items-center justify-between text-sm mb-2">
  <span className="text-ink-700">Progress</span>
  <span className="font-medium">
    {goal.currentLevel}/{goal.targetLevel}
  </span>
</div>
<ProgressBar value={progress} showLabel labelPosition="outside" />
```

### From `apps/grow/src/components/gamification/QuestBar.tsx`

**Before:**
```tsx
<div className="relative h-4 bg-black/40 rounded-full overflow-hidden">
  <div
    className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-200 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(234,179,8,0.5)]"
    style={{ width: `${progress}%` }}
  >
    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[pulse_2s_linear_infinite]" />
  </div>
</div>
<div className="flex justify-between mt-2 text-xs font-medium">
  <span className="text-white/40">0</span>
  <span className="text-yellow-400">{quest.currentCompletions} / {quest.targetTotalCompletions}</span>
</div>
```

**After:**
```tsx
import { StreakProgress } from '@ainexsuite/ui';
import { Crown } from 'lucide-react';

<StreakProgress
  current={quest.currentCompletions}
  target={quest.targetTotalCompletions}
  label={quest.title}
  icon={Crown}
  color="#eab308"
  variant="striped"
/>
```

## Benefits of Migration

### 1. Consistency
- All progress bars use the same visual style
- Automatic theme integration with `useAppColors()`
- Consistent animations and transitions

### 2. Accessibility
- ARIA attributes included automatically
- Proper semantic HTML
- Screen reader friendly

### 3. Less Code
- No need to calculate percentages manually
- No need to handle edge cases (min/max)
- Built-in label positioning

### 4. Features
- Multiple variants (default, gradient, striped)
- Multiple sizes (sm, md, lg)
- Indeterminate/loading states
- Celebration animations (StreakProgress)
- Custom icons and colors

## Migration Steps

### Step 1: Replace Basic Progress Bars

Search for:
```tsx
className=".*h-2.*bg-accent.*"
style={{ width: `${.*}%` }}
```

Replace with:
```tsx
<ProgressBar value={percentage} />
```

### Step 2: Replace Goal Progress Displays

Look for patterns with current/target values:
```tsx
{current}/{target}
```

Replace with:
```tsx
<StreakProgress
  current={current}
  target={target}
  label="Goal Name"
  icon={YourIcon}
/>
```

### Step 3: Replace Circular Progress

SVG-based circular progress can be replaced with:
```tsx
<ProgressRing
  value={percentage}
  size={120}
  strokeWidth={8}
/>
```

### Step 4: Replace Multi-Step Indicators

Replace custom step indicators with:
```tsx
<ProgressSteps
  steps={[
    { label: 'Step 1', completed: true, active: false },
    { label: 'Step 2', completed: false, active: true },
    // ...
  ]}
/>
```

## Example Migrations

### Grow App - Goal List

**Before** (`apps/grow/src/components/goal-list.tsx:107-120`):
```tsx
<div>
  <div className="flex items-center justify-between text-sm mb-2">
    <span className="text-ink-700">Progress</span>
    <span className="font-medium">
      {goal.currentLevel}/{goal.targetLevel} ({Math.round(progress)}%)
    </span>
  </div>
  <div className="w-full h-2 surface-elevated rounded-full overflow-hidden">
    <div
      className="h-full bg-accent-500 progress-bar"
      style={{ width: `${Math.min(100, progress)}%` }}
    />
  </div>
</div>
```

**After**:
```tsx
import { ProgressBar } from '@ainexsuite/ui';

<div>
  <div className="flex items-center justify-between text-sm mb-2">
    <span className="text-ink-700">Progress</span>
    <span className="font-medium">
      {goal.currentLevel}/{goal.targetLevel}
    </span>
  </div>
  <ProgressBar value={progress} showLabel labelPosition="outside" />
</div>
```

### Grow App - Quest Bar

**Before** (`apps/grow/src/components/gamification/QuestBar.tsx:14-50`):
```tsx
<div className="relative overflow-hidden rounded-2xl bg-[#1a1a1a] border border-white/10 p-1 shadow-lg">
  <div className="relative z-10 bg-white/5 rounded-xl p-4">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-yellow-500/20 flex items-center justify-center text-yellow-400 shadow-inner shadow-yellow-500/10">
          <Crown className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">{quest.title}</h3>
          <p className="text-xs text-white/50">{quest.description}</p>
        </div>
      </div>
      {/* ... reward badge ... */}
    </div>

    <div className="relative h-4 bg-black/40 rounded-full overflow-hidden">
      <div
        className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-200 transition-all duration-1000 ease-out"
        style={{ width: `${progress}%` }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(...)] animate-[pulse_2s_linear_infinite]" />
      </div>
    </div>

    <div className="flex justify-between mt-2 text-xs font-medium">
      <span className="text-white/40">0</span>
      <span className="text-yellow-400">{quest.currentCompletions} / {quest.targetTotalCompletions}</span>
    </div>
  </div>
</div>
```

**After**:
```tsx
import { StreakProgress } from '@ainexsuite/ui';
import { Crown } from 'lucide-react';

<StreakProgress
  current={quest.currentCompletions}
  target={quest.targetTotalCompletions}
  label={quest.title}
  icon={Crown}
  color="#eab308"
  size="lg"
/>
// Add quest.description and reward badge separately if needed
```

### Grow App - Streak Stats

**Before** (`apps/grow/src/components/analytics/StreakStats.tsx`):
Custom stat cards with progress displays.

**After**:
```tsx
import { StreakProgress } from '@ainexsuite/ui';
import { Flame } from 'lucide-react';

<StreakProgress
  current={stats.currentStreak}
  target={30}
  label="Current Streak"
  icon={Flame}
  color="#f97316"
  unit="days"
  celebrateOnComplete
/>
```

## Testing After Migration

1. **Visual Review**: Verify all progress bars look consistent
2. **Theme Testing**: Check progress bars in light/dark mode
3. **Responsive**: Test on mobile and desktop
4. **Accessibility**: Use screen reader to verify ARIA attributes
5. **Animation**: Verify smooth transitions and celebrations

## Rollback Plan

If issues arise, the old implementations remain in app code. You can:
1. Comment out the new import
2. Uncomment the old code
3. Report issues for fixes

## Support

For issues or questions about progress components:
- See: `packages/ui/src/components/progress/README.md`
- Examples: `packages/ui/src/components/progress/progress.examples.tsx`
- Quick ref: `packages/ui/src/components/progress/QUICK_REFERENCE.md`
