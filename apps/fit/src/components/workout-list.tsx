'use client';

import { useState } from 'react';
import type { Workout } from '@/types/models';
import { format } from 'date-fns';
import { Calendar, Clock, Dumbbell, Trash2 } from 'lucide-react';
import { useFitStore } from '@/lib/store';
import { useAppColors } from '@ainexsuite/theme';
import { ConfirmationDialog } from '@ainexsuite/ui';

interface WorkoutListProps {
  workouts: Workout[];
  onEdit: (workout: Workout) => void;
  onUpdate: () => void;
}

export function WorkoutList({ workouts, onEdit }: WorkoutListProps) {
  const { deleteWorkout } = useFitStore();
  const { primary } = useAppColors();
  const [workoutToDelete, setWorkoutToDelete] = useState<Workout | null>(null);

  const handleDelete = async () => {
    if (!workoutToDelete) return;
    await deleteWorkout(workoutToDelete.id);
    setWorkoutToDelete(null);
  };

  return (
    <>
      <div className="grid gap-4">
        {workouts.map((workout) => {
          const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
          const totalReps = workout.exercises.reduce(
            (sum, ex) => sum + ex.sets.reduce((s, set) => s + (set.reps || 0), 0),
            0
          );

          return (
            <article
              key={workout.id}
              className="group relative cursor-pointer overflow-hidden rounded-3xl border border-border bg-background/60 backdrop-blur-xl transition-all duration-300 hover:border-border/50 hover:shadow-2xl"
              onClick={() => onEdit(workout)}
            >
              <div className="px-6 py-6">
                <h3 className="text-base font-semibold text-foreground mb-3">{workout.title}</h3>

                {workout.exercises.length > 0 && (
                  <div className="space-y-2">
                    {workout.exercises.slice(0, 4).map((exercise, idx) => (
                      <div key={idx} className="bg-foreground/5 p-3 rounded-xl border border-border">
                        <div className="font-medium text-foreground/90 mb-1">{exercise.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {exercise.sets.length} sets
                          {exercise.sets.length > 0 && (
                            <span className="ml-2">
                              ({exercise.sets.map((s) => `${s.reps || 0}x${s.weight || 0}kg`).join(', ')})
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {workout.exercises.length > 4 && (
                      <div className="text-xs text-muted-foreground">
                        +{workout.exercises.length - 4} more exercises
                      </div>
                    )}
                  </div>
                )}

                {totalSets > 0 && (
                  <div className="mt-3 text-sm text-muted-foreground">
                    Total: {totalSets} sets, {totalReps} reps
                  </div>
                )}
              </div>

              {/* Footer with accent background */}
              <footer
                className="flex items-center justify-between px-6 pb-4 pt-3 -mt-2 rounded-b-3xl"
                style={{ backgroundColor: `${primary}1a` }}
              >
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
                    {workout.exercises.length}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setWorkoutToDelete(workout);
                  }}
                  className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-500/20 rounded-full transition-colors"
                  title="Delete workout"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </footer>
            </article>
          );
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!workoutToDelete}
        onClose={() => setWorkoutToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Workout"
        description={`Are you sure you want to delete "${workoutToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
}
