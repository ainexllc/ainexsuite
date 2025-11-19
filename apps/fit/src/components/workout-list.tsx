'use client';

import type { Workout } from '@/types/models';
import { format } from 'date-fns';
import { Calendar, Clock, Dumbbell, Edit } from 'lucide-react';

interface WorkoutListProps {
  workouts: Workout[];
  onEdit: (workout: Workout) => void;
  onUpdate: () => void;
}

export function WorkoutList({ workouts, onEdit }: WorkoutListProps) {
  return (
    <div className="grid gap-4">
      {workouts.map((workout) => {
        const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
        const totalReps = workout.exercises.reduce(
          (sum, ex) => sum + ex.sets.reduce((s, set) => s + (set.reps || 0), 0),
          0
        );

        return (
          <div key={workout.id} className="surface-card rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{workout.title}</h3>
                <div className="flex items-center gap-4 text-sm text-ink-700">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(workout.date), 'MMM d, yyyy')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {workout.duration} min
                  </div>
                  <div className="flex items-center gap-1">
                    <Dumbbell className="h-4 w-4" />
                    {workout.exercises.length} exercises
                  </div>
                </div>
              </div>

              <button
                onClick={() => onEdit(workout)}
                className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
              >
                <Edit className="h-4 w-4 text-ink-600" />
              </button>
            </div>

            <div className="space-y-2">
              {workout.exercises.map((exercise, idx) => (
                <div key={idx} className="surface-elevated p-3 rounded-lg">
                  <div className="font-medium mb-1">{exercise.name}</div>
                  <div className="text-sm text-ink-700">
                    {exercise.sets.length} sets
                    {exercise.sets.length > 0 && (
                      <span className="ml-2">
                        ({exercise.sets.map((s) => `${s.reps || 0}x${s.weight || 0}kg`).join(', ')})
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-surface-hover flex items-center justify-between text-sm text-ink-600">
              <span>Total: {totalSets} sets, {totalReps} reps</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
