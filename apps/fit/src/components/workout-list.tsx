'use client';

import { useState, useEffect, useRef } from 'react';
import type { Workout } from '@/types/models';
import { format } from 'date-fns';
import { Calendar, Clock, Dumbbell, Trash2 } from 'lucide-react';
import { useFitStore } from '@/lib/store';
import { useAppColors } from '@ainexsuite/theme';

interface WorkoutListProps {
  workouts: Workout[];
  onEdit: (workout: Workout) => void;
  onUpdate: () => void;
}

export function WorkoutList({ workouts, onEdit }: WorkoutListProps) {
  const { deleteWorkout } = useFitStore();
  const { primary } = useAppColors();
  const [workoutToDelete, setWorkoutToDelete] = useState<Workout | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleDelete = async () => {
    if (!workoutToDelete) return;
    await deleteWorkout(workoutToDelete.id);
    setWorkoutToDelete(null);
  };

  // Handle click outside modal
  useEffect(() => {
    if (!workoutToDelete) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!modalRef.current) return;
      if (modalRef.current.contains(event.target as Node)) return;
      setWorkoutToDelete(null);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [workoutToDelete]);

  // Handle escape key
  useEffect(() => {
    if (!workoutToDelete) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setWorkoutToDelete(null);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [workoutToDelete]);

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
              className="group relative cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-black/60 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:shadow-2xl"
              onClick={() => onEdit(workout)}
            >
              <div className="px-6 py-6">
                <h3 className="text-base font-semibold text-white mb-3">{workout.title}</h3>

                {workout.exercises.length > 0 && (
                  <div className="space-y-2">
                    {workout.exercises.slice(0, 4).map((exercise, idx) => (
                      <div key={idx} className="bg-white/5 p-3 rounded-xl border border-white/5">
                        <div className="font-medium text-white/90 mb-1">{exercise.name}</div>
                        <div className="text-sm text-white/50">
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
                      <div className="text-xs text-white/40">
                        +{workout.exercises.length - 4} more exercises
                      </div>
                    )}
                  </div>
                )}

                {totalSets > 0 && (
                  <div className="mt-3 text-sm text-white/50">
                    Total: {totalSets} sets, {totalReps} reps
                  </div>
                )}
              </div>

              {/* Footer with accent background */}
              <footer
                className="flex items-center justify-between px-6 pb-4 pt-3 -mt-2 rounded-b-3xl"
                style={{ backgroundColor: `${primary}1a` }}
              >
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
                    {workout.exercises.length}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setWorkoutToDelete(workout);
                  }}
                  className="h-8 w-8 flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-500/20 rounded-full transition-colors"
                  title="Delete workout"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </footer>
            </article>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {workoutToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div
            ref={modalRef}
            className="w-full max-w-md rounded-2xl shadow-2xl bg-[#121212] border border-white/10 p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-2">Delete Workout</h3>
            <p className="text-white/60 mb-6">
              Are you sure you want to delete &ldquo;{workoutToDelete.title}&rdquo;? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setWorkoutToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
