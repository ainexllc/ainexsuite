/**
 * DataCard Component - Usage Examples
 *
 * This file demonstrates various ways to use the DataCard component
 * across different use cases and variants.
 */

import { Calendar, Clock, Dumbbell, Flame, CheckCircle, Star } from 'lucide-react';
import { DataCard } from './data-card';

// ============================================================================
// Example 1: Default Card with Full Features
// ============================================================================
export function DefaultCardExample() {
  return (
    <DataCard
      variant="default"
      title="Workout Session"
      subtitle="November 27, 2025 • 45 min"
      icon={<Dumbbell className="h-5 w-5" />}
      badge={
        <span className="px-2 py-1 text-xs font-semibold bg-green-500/20 text-green-400 rounded-full">
          Completed
        </span>
      }
      footer={
        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>Nov 27, 2025</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>45 min</span>
            </div>
          </div>
        </div>
      }
    >
      <div className="space-y-2 mt-3">
        <p className="text-sm text-muted-foreground">
          Full body strength training with focus on compound movements.
        </p>
        <div className="text-sm text-muted-foreground">
          3 exercises • 12 total sets • 180 reps
        </div>
      </div>
    </DataCard>
  );
}

// ============================================================================
// Example 2: Compact Card for List Views
// ============================================================================
export function CompactCardExample() {
  return (
    <DataCard
      variant="compact"
      title="Quick Note"
      subtitle="2 hours ago"
      icon={<CheckCircle className="h-4 w-4" />}
    >
      <p className="text-sm">Remember to review pull requests</p>
    </DataCard>
  );
}

// ============================================================================
// Example 3: Highlighted Card with Accent Color
// ============================================================================
export function HighlightedCardExample() {
  return (
    <DataCard
      variant="highlighted"
      title="Active Wager"
      subtitle="Target: 30 days"
      icon={<Flame className="h-5 w-5 animate-pulse" />}
      accentColor="#f97316" // Orange
      badge={
        <span className="px-2 py-1 text-xs font-semibold bg-orange-500/20 text-orange-400 rounded-full">
          ACTIVE
        </span>
      }
      footer={
        <div className="w-full">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span>15 / 30</span>
          </div>
          <div className="h-2 w-full bg-background/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
              style={{ width: '50%' }}
            />
          </div>
        </div>
      }
    >
      <p className="text-foreground/80 italic">
        &quot;I will exercise for 30 consecutive days&quot;
      </p>
    </DataCard>
  );
}

// ============================================================================
// Example 4: Interactive Card with Click Handler
// ============================================================================
export function InteractiveCardExample() {
  return (
    <DataCard
      variant="interactive"
      title="Start New Workout"
      subtitle="Click to begin tracking"
      icon={<Dumbbell className="h-5 w-5" />}
      onClick={() => console.log('Starting new workout...')}
    >
      <p className="text-sm text-muted-foreground">
        Track your exercises, sets, and reps in real-time
      </p>
    </DataCard>
  );
}

// ============================================================================
// Example 5: Link Card (Navigation)
// ============================================================================
export function LinkCardExample() {
  return (
    <DataCard
      variant="interactive"
      title="View Full Workout History"
      subtitle="See all past sessions"
      icon={<Calendar className="h-5 w-5" />}
      href="/workouts/history"
      accentColor="#3b82f6" // Blue
    >
      <p className="text-sm text-muted-foreground">
        Browse through all your completed workouts
      </p>
    </DataCard>
  );
}

// ============================================================================
// Example 6: Card with Custom Footer
// ============================================================================
export function CustomFooterExample() {
  return (
    <DataCard
      variant="default"
      title="Premium Feature"
      subtitle="Unlock advanced analytics"
      icon={<Star className="h-5 w-5" />}
      accentColor="#8b5cf6" // Purple
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-muted-foreground">
            Available on Pro plan
          </span>
          <button className="px-3 py-1 text-xs font-semibold bg-purple-500 hover:bg-purple-600 text-foreground rounded-lg transition-colors">
            Upgrade
          </button>
        </div>
      }
    >
      <ul className="space-y-1 text-sm text-muted-foreground">
        <li>• Advanced workout analytics</li>
        <li>• Progress predictions</li>
        <li>• Custom goals tracking</li>
      </ul>
    </DataCard>
  );
}

// ============================================================================
// Example 7: Minimal Card (No Footer)
// ============================================================================
export function MinimalCardExample() {
  return (
    <DataCard
      variant="default"
      title="Simple Note"
    >
      <p className="text-sm text-muted-foreground">
        This is a minimal card with just a title and content.
      </p>
    </DataCard>
  );
}

// ============================================================================
// Example 8: Card Grid Layout
// ============================================================================
export function CardGridExample() {
  const workouts = [
    { id: 1, title: 'Upper Body', duration: 45 },
    { id: 2, title: 'Lower Body', duration: 60 },
    { id: 3, title: 'Cardio', duration: 30 },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {workouts.map((workout) => (
        <DataCard
          key={workout.id}
          variant="interactive"
          title={workout.title}
          subtitle={`${workout.duration} minutes`}
          icon={<Dumbbell className="h-5 w-5" />}
          onClick={() => console.log(`Selected: ${workout.title}`)}
        >
          <p className="text-sm text-muted-foreground">
            Click to view details
          </p>
        </DataCard>
      ))}
    </div>
  );
}

// ============================================================================
// Example 9: Loading State
// ============================================================================
export function LoadingCardExample() {
  return (
    <DataCard
      variant="default"
      title="Loading Workout..."
    >
      <div className="space-y-2">
        <div className="h-4 bg-foreground/10 rounded animate-pulse" />
        <div className="h-4 bg-foreground/10 rounded animate-pulse w-3/4" />
      </div>
    </DataCard>
  );
}

// ============================================================================
// Example 10: Error State
// ============================================================================
export function ErrorCardExample() {
  return (
    <DataCard
      variant="highlighted"
      title="Failed to Load"
      subtitle="An error occurred"
      accentColor="#ef4444" // Red
      badge={
        <span className="px-2 py-1 text-xs font-semibold bg-red-500/20 text-red-400 rounded-full">
          ERROR
        </span>
      }
      footer={
        <button className="px-3 py-1 text-xs font-semibold bg-red-500 hover:bg-red-600 text-foreground rounded-lg transition-colors">
          Retry
        </button>
      }
    >
      <p className="text-sm text-muted-foreground">
        Unable to fetch workout data. Please try again.
      </p>
    </DataCard>
  );
}
