'use client';

import { Clock, Dumbbell, User, Activity } from 'lucide-react';
import { useFitStore } from '../../lib/store';
import { formatDistanceToNow } from 'date-fns';
import { Workout, Member } from '../../types/models';
import { SectionHeader, EmptyState } from '@ainexsuite/ui';

export function SharedWorkoutFeed() {
  const { workouts, getCurrentSpace } = useFitStore();
  const currentSpace = getCurrentSpace();

  if (!currentSpace) return null;

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Recent Activity"
        icon={<Activity className="h-4 w-4" />}
        variant="small"
      />

      {workouts.length === 0 ? (
        <EmptyState
          title="No workouts logged yet"
          description="Be the first to log a workout in your squad!"
          icon={Dumbbell}
          variant="minimal"
        />
      ) : (
        <div className="space-y-3">
          {workouts.map((workout: Workout) => {
            const user = currentSpace.members.find((m: Member) => m.uid === workout.userId);

            return (
              <div key={workout.id} className="bg-background/60 border border-border rounded-xl p-4 hover:border-border/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-foreground/10 flex items-center justify-center text-[10px] text-foreground">
                      {user?.displayName.slice(0, 2).toUpperCase() || <User className="h-3 w-3" />}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {user?.displayName || 'Unknown'} • {formatDistanceToNow(new Date(workout.date), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                <h4 className="text-base font-bold text-foreground mb-1">{workout.title}</h4>

                <div className="flex gap-4 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {workout.duration} min
                  </div>
                  <div className="flex items-center gap-1">
                    <Dumbbell className="h-3 w-3" />
                    {workout.exercises.length} exercises
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {workout.exercises.slice(0, 3).map((ex, i) => (
                    <span key={i} className="px-2 py-1 rounded-md bg-foreground/5 text-[10px] text-muted-foreground">
                      {ex.name}
                    </span>
                  ))}
                  {workout.exercises.length > 3 && (
                    <span className="px-2 py-1 rounded-md bg-foreground/5 text-[10px] text-muted-foreground">
                      +{workout.exercises.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
