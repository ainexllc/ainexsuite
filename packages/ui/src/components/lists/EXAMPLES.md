# List Components - Usage Examples

Complete examples showing how to use the unified List components across different AinexSuite apps.

## Example 1: Reminders List (Notes App)

Replace the existing reminder-list.tsx with unified components:

```tsx
'use client';

import { useMemo } from 'react';
import { AlarmClock, Clock4, X, Check } from 'lucide-react';
import { ListSection, ListItem, EmptyState, ListSkeleton } from '@ainexsuite/ui';

export function ReminderList() {
  const { reminders, loading } = useReminders();

  const { overdue, upcoming } = useMemo(() => {
    const now = Date.now();
    return {
      overdue: reminders.filter(r => r.timestamp <= now),
      upcoming: reminders.filter(r => r.timestamp > now),
    };
  }, [reminders]);

  if (loading) {
    return (
      <div className="space-y-8">
        <ListSkeleton count={3} />
        <ListSkeleton count={2} />
      </div>
    );
  }

  if (!reminders.length) {
    return (
      <EmptyState
        title="No reminders scheduled"
        description="Set a reminder from any note to have it appear here."
        icon={AlarmClock}
        variant="illustrated"
      />
    );
  }

  return (
    <div className="space-y-8">
      <ListSection title="Overdue" count={overdue.length}>
        {overdue.length > 0 ? (
          overdue.map((reminder) => (
            <ListItem
              key={reminder.id}
              title={reminder.title}
              subtitle={formatReminderTimestamp(reminder.timestamp)}
              icon={AlarmClock}
              trailing={
                <div className="flex gap-2">
                  <button className="btn-sm" onClick={() => handleSnooze(reminder.id)}>
                    <Clock4 className="h-3.5 w-3.5" />
                  </button>
                  <button className="btn-sm btn-danger" onClick={() => handleDismiss(reminder.id)}>
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              }
            />
          ))
        ) : (
          <EmptyState
            title="You are all caught up here"
            variant="minimal"
          />
        )}
      </ListSection>

      <ListSection title="Upcoming" count={upcoming.length} collapsible defaultExpanded>
        {upcoming.map((reminder) => (
          <ListItem
            key={reminder.id}
            title={reminder.title}
            subtitle={formatReminderTimestamp(reminder.timestamp)}
            variant="compact"
          />
        ))}
      </ListSection>
    </div>
  );
}
```

## Example 2: Goals List (Grow App)

```tsx
'use client';

import { Target, Plus, CheckCircle2, Circle } from 'lucide-react';
import { ListSection, ListItem, EmptyState, ListSkeleton } from '@ainexsuite/ui';
import type { LearningGoal } from '@ainexsuite/types';

interface GoalsListProps {
  goals: LearningGoal[];
  loading: boolean;
  onEdit: (goal: LearningGoal) => void;
  onToggle: (goal: LearningGoal) => void;
  onCreate: () => void;
}

export function GoalsList({ goals, loading, onEdit, onToggle, onCreate }: GoalsListProps) {
  const activeGoals = goals.filter((g) => g.active);
  const completedGoals = goals.filter((g) => !g.active);

  if (loading) {
    return <ListSkeleton count={5} variant="detailed" />;
  }

  if (!goals.length) {
    return (
      <EmptyState
        title="No goals yet"
        description="Create your first learning goal to start tracking your progress."
        icon={Target}
        variant="illustrated"
        action={{
          label: "Create Goal",
          onClick: onCreate,
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
          <button onClick={onCreate} className="text-sm text-white/60 hover:text-white/90">
            <Plus className="h-4 w-4" />
          </button>
        }
      >
        {activeGoals.map((goal) => (
          <ListItem
            key={goal.id}
            variant="detailed"
            title={
              <div className="flex items-center gap-3">
                <button onClick={() => onToggle(goal)}>
                  <Circle className="h-5 w-5 text-white/60" />
                </button>
                <span>{goal.title}</span>
              </div>
            }
            subtitle={
              <div className="space-y-2 mt-2">
                {goal.description && <p>{goal.description}</p>}
                <div className="flex items-center justify-between text-xs">
                  <span>Progress: {goal.currentLevel}/{goal.targetLevel}</span>
                  <span>{Math.round((goal.currentLevel / goal.targetLevel) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-500"
                    style={{ width: `${(goal.currentLevel / goal.targetLevel) * 100}%` }}
                  />
                </div>
              </div>
            }
            onClick={() => onEdit(goal)}
          />
        ))}
      </ListSection>

      {completedGoals.length > 0 && (
        <ListSection
          title="Completed Goals"
          count={completedGoals.length}
          collapsible
          defaultExpanded={false}
        >
          {completedGoals.map((goal) => (
            <ListItem
              key={goal.id}
              variant="compact"
              title={goal.title}
              icon={CheckCircle2}
              onClick={() => onEdit(goal)}
            />
          ))}
        </ListSection>
      )}
    </div>
  );
}
```

## Example 3: Workouts List (Fit App)

```tsx
'use client';

import { Dumbbell, Calendar, Clock, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ListSection, ListItem, EmptyState, ListSkeleton } from '@ainexsuite/ui';
import type { Workout } from '@/types/models';

interface WorkoutsListProps {
  workouts: Workout[];
  loading: boolean;
  onEdit: (workout: Workout) => void;
  onDelete: (workout: Workout) => void;
  onCreate: () => void;
}

export function WorkoutsList({ workouts, loading, onEdit, onDelete, onCreate }: WorkoutsListProps) {
  if (loading) {
    return <ListSkeleton count={4} />;
  }

  if (!workouts.length) {
    return (
      <EmptyState
        title="No workouts logged"
        description="Start tracking your fitness journey by logging your first workout."
        icon={Dumbbell}
        variant="illustrated"
        action={{
          label: "Log Workout",
          onClick: onCreate,
        }}
      />
    );
  }

  return (
    <ListSection title="Workouts" count={workouts.length} icon={Dumbbell}>
      {workouts.map((workout) => {
        const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
        const totalReps = workout.exercises.reduce(
          (sum, ex) => sum + ex.sets.reduce((s, set) => s + (set.reps || 0), 0),
          0
        );

        return (
          <ListItem
            key={workout.id}
            variant="detailed"
            title={workout.title}
            subtitle={
              <div className="space-y-2 mt-2">
                <div className="flex items-center gap-4 text-xs text-white/50">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(workout.date), 'MMM d, yyyy')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {workout.duration} min
                  </div>
                  <div className="flex items-center gap-1">
                    <Dumbbell className="h-3.5 w-3.5" />
                    {workout.exercises.length} exercises
                  </div>
                </div>

                {totalSets > 0 && (
                  <div className="text-xs text-white/40">
                    Total: {totalSets} sets, {totalReps} reps
                  </div>
                )}
              </div>
            }
            trailing={
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(workout);
                }}
                className="h-8 w-8 flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-500/20 rounded-full transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            }
            onClick={() => onEdit(workout)}
          />
        );
      })}
    </ListSection>
  );
}
```

## Example 4: Navigation List (Journey App)

```tsx
'use client';

import { usePathname } from 'next/navigation';
import { Home, BookOpen, Star, Settings } from 'lucide-react';
import { ListSection, ListItem } from '@ainexsuite/ui';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'Entries', href: '/entries', icon: BookOpen },
  { label: 'Favorites', href: '/favorites', icon: Star },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function NavigationList() {
  const pathname = usePathname();

  return (
    <ListSection title="Navigation">
      {navItems.map((item) => (
        <ListItem
          key={item.href}
          title={item.label}
          icon={item.icon}
          href={item.href}
          selected={pathname === item.href}
          variant="compact"
        />
      ))}
    </ListSection>
  );
}
```

## Example 5: Settings List with Actions

```tsx
'use client';

import { Bell, Lock, Palette, Database } from 'lucide-react';
import { ListSection, ListItem } from '@ainexsuite/ui';

export function SettingsList() {
  return (
    <div className="space-y-8">
      <ListSection title="Preferences" icon={Palette}>
        <ListItem
          title="Notifications"
          subtitle="Manage your notification preferences"
          icon={Bell}
          href="/settings/notifications"
          trailing={
            <span className="text-xs text-white/40">3 active</span>
          }
        />
        <ListItem
          title="Privacy & Security"
          subtitle="Control your privacy settings"
          icon={Lock}
          href="/settings/privacy"
        />
        <ListItem
          title="Appearance"
          subtitle="Customize colors and themes"
          icon={Palette}
          href="/settings/appearance"
        />
      </ListSection>

      <ListSection title="Data" icon={Database}>
        <ListItem
          title="Export Data"
          subtitle="Download all your data"
          onClick={() => handleExport()}
        />
        <ListItem
          title="Clear Cache"
          subtitle="Free up storage space"
          onClick={() => handleClearCache()}
        />
      </ListSection>
    </div>
  );
}
```

## Example 6: Search Results List

```tsx
'use client';

import { Search } from 'lucide-react';
import { ListSection, ListItem, EmptyState, ListSkeleton } from '@ainexsuite/ui';

interface SearchResultsProps {
  query: string;
  results: SearchResult[];
  loading: boolean;
  onSelect: (result: SearchResult) => void;
}

export function SearchResults({ query, results, loading, onSelect }: SearchResultsProps) {
  if (loading) {
    return <ListSkeleton count={5} variant="compact" />;
  }

  if (!query) {
    return (
      <EmptyState
        title="Start searching"
        description="Enter a query to find notes, entries, and more."
        icon={Search}
        variant="minimal"
      />
    );
  }

  if (!results.length) {
    return (
      <EmptyState
        title="No results found"
        description={`No results for "${query}". Try a different search term.`}
        icon={Search}
      />
    );
  }

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) acc[result.type] = [];
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedResults).map(([type, items]) => (
        <ListSection
          key={type}
          title={type}
          count={items.length}
          collapsible
          defaultExpanded
        >
          {items.map((result) => (
            <ListItem
              key={result.id}
              title={result.title}
              subtitle={result.excerpt}
              variant="compact"
              onClick={() => onSelect(result)}
            />
          ))}
        </ListSection>
      ))}
    </div>
  );
}
```

## Styling Tips

### Using Accent Colors

The components automatically use the app's accent color when available:

```tsx
import { AppColorProvider } from '@ainexsuite/theme';

function App() {
  return (
    <AppColorProvider appId="journey" fallbackPrimary="#f97316">
      <GoalsList />
    </AppColorProvider>
  );
}
```

### Custom Styling

All components accept a `className` prop for custom styling:

```tsx
<ListItem
  title="Custom styled item"
  className="border-accent-500/30 bg-gradient-to-r from-accent-500/10 to-transparent"
/>
```

### Responsive Design

Components are mobile-friendly by default with responsive padding and text sizes:

```tsx
<ListItem
  variant="compact" // Best for mobile
  title="Mobile friendly item"
/>
```

## Performance Tips

1. **Use ListSkeleton during loading** - Provides better UX than blank screens
2. **Memoize filtered lists** - Use `useMemo` to avoid unnecessary re-renders
3. **Virtualize long lists** - Consider using `react-window` for lists with 100+ items
4. **Lazy load sections** - Use collapsible sections to reduce initial render cost

```tsx
const filteredGoals = useMemo(() => {
  return goals.filter(g => g.active);
}, [goals]);
```
