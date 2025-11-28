# Progress Components - Quick Reference

## Import

```tsx
import {
  ProgressBar,
  ProgressRing,
  ProgressSteps,
  StreakProgress,
} from '@ainexsuite/ui';
```

## ProgressBar

```tsx
// Basic
<ProgressBar value={65} />

// With label
<ProgressBar value={75} showLabel />

// Variants
<ProgressBar value={60} variant="gradient" />
<ProgressBar value={45} variant="striped" />

// Sizes
<ProgressBar value={60} size="sm" />
<ProgressBar value={75} size="md" />
<ProgressBar value={90} size="lg" />

// Custom color
<ProgressBar value={85} color="#10b981" />

// Loading state
<ProgressBar indeterminate />
```

## ProgressRing

```tsx
// Basic
<ProgressRing value={75} />

// Custom size
<ProgressRing value={85} size={200} strokeWidth={12} />

// Custom content
<ProgressRing value={100} showValue={false}>
  <Trophy className="h-8 w-8 text-yellow-400" />
</ProgressRing>

// Custom color
<ProgressRing value={75} color="#10b981" />
```

## ProgressSteps

```tsx
const steps = [
  { label: 'Account', completed: true, active: false },
  { label: 'Profile', completed: false, active: true },
  { label: 'Done', completed: false, active: false },
];

// Horizontal
<ProgressSteps steps={steps} />

// Vertical
<ProgressSteps steps={steps} orientation="vertical" />

// With descriptions
const stepsWithDesc = [
  {
    label: 'Account',
    description: 'Create account',
    completed: true,
    active: false,
  },
  // ...
];
<ProgressSteps steps={stepsWithDesc} />
```

## StreakProgress

```tsx
// Basic streak
<StreakProgress
  current={7}
  target={30}
  label="Daily Meditation"
  unit="days"
/>

// With custom icon
<StreakProgress
  current={15}
  target={20}
  label="Workout Goal"
  icon={Target}
  color="#3b82f6"
/>

// Show percentage
<StreakProgress
  current={25}
  target={50}
  label="Progress"
  showPercentage
/>

// Celebration on complete
<StreakProgress
  current={100}
  target={100}
  label="Challenge Complete"
  icon={Trophy}
  celebrateOnComplete
/>
```

## Common Props

All components support:
- `className` - Custom CSS classes
- `color` - Custom color (overrides accent color)

Size variants available for most components:
- `'sm'` - Small
- `'md'` - Medium (default)
- `'lg'` - Large

## Theme Integration

All components automatically use the app's accent color:

```tsx
// Uses app accent color from useAppColors()
<ProgressBar value={75} />

// Override with custom color
<ProgressBar value={75} color="#10b981" />
```

## Accessibility

All components include:
- ARIA attributes (`role`, `aria-valuenow`, etc.)
- Semantic HTML
- Keyboard navigation (where applicable)

## Animation

- Smooth transitions (500ms)
- CSS-based animations for performance
- Optional celebration effects (StreakProgress)

## Best Practices

1. Use appropriate component for use case:
   - Linear progress → `ProgressBar`
   - Circular display → `ProgressRing`
   - Multi-step process → `ProgressSteps`
   - Goals/achievements → `StreakProgress`

2. Provide context with labels and units

3. Use consistent colors across app

4. Enable celebrations for achievements

5. Show percentages for clarity when needed
