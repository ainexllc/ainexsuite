'use client';

import { useState } from 'react';
import type { Workout } from '@/types/models';
import { format } from 'date-fns';
import { Calendar, Clock, Dumbbell, Edit, Trash2, Archive, MoreVertical } from 'lucide-react';
import { useFitStore } from '@/lib/store';

interface WorkoutListProps {
  workouts: Workout[];
  onEdit: (workout: Workout) => void;
  onUpdate: () => void;
}

export function WorkoutList({ workouts, onEdit }: WorkoutListProps) {
  const { deleteWorkout, archiveWorkout } = useFitStore();
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleDelete = async (workoutId: string) => {
    await deleteWorkout(workoutId);
    setConfirmDelete(null);
    setMenuOpen(null);
  };

  const handleArchive = async (workoutId: string) => {
    await archiveWorkout(workoutId);
    setMenuOpen(null);
  };
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

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEdit(workout)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Edit className="h-4 w-4 text-white/60" />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(menuOpen === workout.id ? null : workout.id)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <MoreVertical className="h-4 w-4 text-white/60" />
                  </button>
                  {menuOpen === workout.id && (
                    <div className="absolute right-0 top-full mt-1 z-20 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl py-1 min-w-[140px]">
                      <button
                        onClick={() => handleArchive(workout.id)}
                        className="w-full px-4 py-2 text-left text-sm text-white/70 hover:bg-white/10 flex items-center gap-2"
                      >
                        <Archive className="h-4 w-4" />
                        Archive
                      </button>
                      <button
                        onClick={() => setConfirmDelete(workout.id)}
                        className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-white/10 flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  )}
                  {confirmDelete === workout.id && (
                    <div className="absolute right-0 top-full mt-1 z-30 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl p-4 min-w-[200px]">
                      <p className="text-sm text-white mb-3">Delete this workout permanently?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="flex-1 px-3 py-1.5 text-sm text-white/70 hover:bg-white/10 rounded-lg border border-white/10"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDelete(workout.id)}
                          className="flex-1 px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
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
