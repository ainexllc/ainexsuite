# Progress Components

A comprehensive suite of progress indicators for visualizing completion, streaks, goals, and multi-step processes.

## Components

### ProgressBar

Linear progress bar with multiple variants and label positions.

**Props:**
- `value` (number, required): Progress value (0-100)
- `max` (number): Maximum value (defaults to 100)
- `size` ('sm' | 'md' | 'lg'): Size variant
- `variant` ('default' | 'gradient' | 'striped'): Visual style
- `color` (string): Custom color (hex) - overrides accentColor
- `showLabel` (boolean): Show percentage label
- `labelPosition` ('inside' | 'outside' | 'tooltip'): Label placement
- `className` (string): Custom className
- `indeterminate` (boolean): Indeterminate/loading state

**Example:**
```tsx
import { ProgressBar } from '@ainexsuite/ui';

// Basic usage
<ProgressBar value={65} />

// With label
<ProgressBar value={75} showLabel labelPosition="outside" />

// Gradient variant
<ProgressBar value={80} variant="gradient" size="lg" />

// Striped animated variant
<ProgressBar value={45} variant="striped" />

// Custom color
<ProgressBar value={90} color="#10b981" />

// Indeterminate loading state
<ProgressBar indeterminate />
```

---

### ProgressRing

Circular progress indicator with customizable size and stroke.

**Props:**
- `value` (number, required): Progress value (0-100)
- `max` (number): Maximum value (defaults to 100)
- `size` (number): Size in pixels (default: 120)
- `strokeWidth` (number): Stroke width in pixels (default: 8)
- `color` (string): Custom color (hex) - overrides accentColor
- `showValue` (boolean): Show percentage in center
- `children` (ReactNode): Custom center content
- `className` (string): Custom className

**Example:**
```tsx
import { ProgressRing } from '@ainexsuite/ui';
import { Trophy } from 'lucide-react';

// Basic usage
<ProgressRing value={75} />

// Large with custom color
<ProgressRing value={85} size={200} strokeWidth={12} color="#f59e0b" />

// Custom center content
<ProgressRing value={100} showValue={false}>
  <div className="text-center">
    <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-1" />
    <p className="text-sm text-white">Complete!</p>
  </div>
</ProgressRing>

// Small variant
<ProgressRing value={50} size={80} strokeWidth={6} />
```

---

### ProgressSteps

Step indicator for multi-step processes and wizards.

**Props:**
- `steps` (Step[], required): Array of step objects
  - `label` (string): Step label
  - `description` (string, optional): Step description
  - `completed` (boolean): Whether step is completed
  - `active` (boolean): Whether step is currently active
- `orientation` ('horizontal' | 'vertical'): Layout direction
- `size` ('sm' | 'md' | 'lg'): Size variant
- `className` (string): Custom className

**Example:**
```tsx
import { ProgressSteps } from '@ainexsuite/ui';

const steps = [
  { label: 'Account', description: 'Create account', completed: true, active: false },
  { label: 'Profile', description: 'Set up profile', completed: false, active: true },
  { label: 'Preferences', description: 'Choose settings', completed: false, active: false },
  { label: 'Complete', description: 'Finish setup', completed: false, active: false },
];

// Horizontal layout
<ProgressSteps steps={steps} />

// Vertical layout
<ProgressSteps steps={steps} orientation="vertical" />

// Large size
<ProgressSteps steps={steps} size="lg" />
```

---

### StreakProgress

Specialized progress component for streaks, goals, and achievements with motivational styling.

**Props:**
- `current` (number, required): Current value
- `target` (number, required): Target value
- `label` (string, required): Label text
- `icon` (LucideIcon): Icon component (default: Flame)
- `iconElement` (ReactNode): Custom icon element
- `color` (string): Custom color (hex) - overrides accentColor
- `size` ('sm' | 'md' | 'lg'): Size variant
- `celebrateOnComplete` (boolean): Show celebration when complete (default: true)
- `className` (string): Custom className
- `unit` (string): Custom unit text (e.g., "days", "workouts")
- `showPercentage` (boolean): Show progress percentage

**Example:**
```tsx
import { StreakProgress } from '@ainexsuite/ui';
import { Flame, Target, Trophy, Calendar } from 'lucide-react';

// Basic streak
<StreakProgress
  current={7}
  target={30}
  label="Daily Meditation"
  unit="days"
/>

// Workout progress
<StreakProgress
  current={15}
  target={20}
  label="Workout Goal"
  icon={Target}
  color="#3b82f6"
  unit="sessions"
  showPercentage
/>

// Achievement tracker
<StreakProgress
  current={100}
  target={100}
  label="Challenge Complete"
  icon={Trophy}
  color="#eab308"
  celebrateOnComplete
/>

// Custom icon element
<StreakProgress
  current={5}
  target={7}
  label="Weekly Goals"
  iconElement={<Calendar className="h-5 w-5" />}
  size="lg"
/>
```

---

## Theme Integration

All progress components automatically use the app's accent color from `useAppColors()`:

```tsx
import { useAppColors } from '@ainexsuite/theme';

function MyComponent() {
  const { primary } = useAppColors();

  // Automatically uses app accent color
  return <ProgressBar value={75} />;
}
```

Override with custom color:

```tsx
<ProgressBar value={75} color="#10b981" />
```

---

## Accessibility

All components include proper ARIA attributes:

- `role="progressbar"`
- `aria-valuenow`
- `aria-valuemin`
- `aria-valuemax`
- `aria-label`

---

## Animation

- **ProgressBar**: Smooth width transitions, optional striped animation
- **ProgressRing**: Animated stroke-dashoffset with glow effect
- **ProgressSteps**: Smooth color transitions on state changes
- **StreakProgress**: Gradient fill, shimmer effect, celebration animation when complete

---

## Styling

All components support glassmorphism styling out of the box:

```tsx
<ProgressBar
  value={75}
  className="backdrop-blur-lg bg-white/10 border border-white/20"
/>
```

---

## Common Patterns

### Goal Tracking
```tsx
<StreakProgress
  current={currentLevel}
  target={targetLevel}
  label="Learning Goal"
  icon={Target}
  unit="hours"
  showPercentage
/>
```

### Multi-Step Form
```tsx
const [currentStep, setCurrentStep] = useState(0);

const formSteps = [
  { label: 'Details', completed: currentStep > 0, active: currentStep === 0 },
  { label: 'Review', completed: currentStep > 1, active: currentStep === 1 },
  { label: 'Confirm', completed: currentStep > 2, active: currentStep === 2 },
];

<ProgressSteps steps={formSteps} />
```

### Loading State
```tsx
<ProgressBar indeterminate />
```

### Achievement Display
```tsx
<div className="grid gap-4">
  <ProgressRing value={completionPercent} size={150}>
    <div className="text-center">
      <div className="text-3xl font-bold">{completionPercent}%</div>
      <div className="text-xs text-white/50">Complete</div>
    </div>
  </ProgressRing>
</div>
```

---

## Best Practices

1. **Use appropriate components:**
   - `ProgressBar` for simple linear progress
   - `ProgressRing` for circular/dashboard displays
   - `ProgressSteps` for multi-step processes
   - `StreakProgress` for goals and achievements

2. **Provide context:**
   - Always include labels for clarity
   - Use appropriate icons
   - Show current/target values

3. **Celebrate success:**
   - Enable celebration animations for achievements
   - Use appropriate colors for completion states

4. **Accessibility:**
   - Components include ARIA attributes by default
   - Ensure sufficient color contrast
   - Provide text alternatives for icons

5. **Performance:**
   - Animations use CSS transitions for smoothness
   - Components are optimized for re-renders
