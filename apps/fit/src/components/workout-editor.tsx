'use client';

import { useState } from 'react';
import type { Workout, WorkoutExercise } from '@ainexsuite/types';
import { createWorkout, updateWorkout, deleteWorkout } from '@/lib/fitness';
import { X, Trash2, Plus } from 'lucide-react';

interface WorkoutEditorProps {
  workout: Workout | null;
  onClose: () => void;
  onSave: () => void;
}

export function WorkoutEditor({ workout, onClose, onSave }: WorkoutEditorProps) {
  const [name, setName] = useState(workout?.name || '');
  const [date, setDate] = useState(
    workout?.date ? new Date(workout.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [duration, setDuration] = useState(workout?.duration || 60);
  const [exercises, setExercises] = useState<WorkoutExercise[]>(workout?.exercises || []);
  const [saving, setSaving] = useState(false);

  const handleAddExercise = () => {
    setExercises([
      ...exercises,
      {
        exerciseId: Date.now().toString(),
        exerciseName: '',
        sets: [],
        notes: '',
      },
    ]);
  };

  const handleUpdateExercise = (index: number, updates: Partial<WorkoutExercise>) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], ...updates };
    setExercises(updated);
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleAddSet = (exerciseIndex: number) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets.push({
      setNumber: updated[exerciseIndex].sets.length + 1,
      reps: 10,
      weight: 0,
      restTime: 60,
      completed: false,
    });
    setExercises(updated);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter a workout name');
      return;
    }

    setSaving(true);
    try {
      const data = {
        name,
        date: new Date(date).getTime(),
        duration,
        exercises: exercises.filter((e) => e.exerciseName.trim()),
        notes: '',
        ownerId: '',
      };

      if (workout) {
        await updateWorkout(workout.id, data);
      } else {
        await createWorkout(data);
      }

      onSave();
    } catch (error) {
      console.error('Failed to save workout:', error);
      alert('Failed to save workout');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!workout) return;
    if (!confirm('Are you sure you want to delete this workout?')) return;

    try {
      await deleteWorkout(workout.id);
      onSave();
    } catch (error) {
      console.error('Failed to delete workout:', error);
      alert('Failed to delete workout');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-3xl surface-card rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-surface-hover sticky top-0 surface-card">
          <h2 className="text-xl font-semibold">
            {workout ? 'Edit Workout' : 'New Workout'}
          </h2>

          <div className="flex items-center gap-2">
            {workout && (
              <button
                onClick={handleDelete}
                className="p-2 hover:bg-surface-hover rounded-lg text-red-400"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-accent-500 hover:bg-accent-600 rounded-lg font-medium disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={onClose} className="p-2 hover:bg-surface-hover rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Workout Name *</label>
              <input
                type="text"
                placeholder="e.g., Upper Body Strength"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 surface-elevated rounded-lg border border-surface-hover focus:border-accent-500 focus:outline-none"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 surface-elevated rounded-lg border border-surface-hover focus:border-accent-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Duration (min)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 surface-elevated rounded-lg border border-surface-hover focus:border-accent-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium">Exercises</label>
              <button
                onClick={handleAddExercise}
                className="px-3 py-1 bg-accent-500 hover:bg-accent-600 rounded-lg text-sm font-medium flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Exercise
              </button>
            </div>

            {exercises.length > 0 && (
              <div className="space-y-4">
                {exercises.map((exercise, idx) => (
                  <div key={idx} className="surface-elevated p-4 rounded-lg space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Exercise name"
                        value={exercise.exerciseName}
                        onChange={(e) =>
                          handleUpdateExercise(idx, { exerciseName: e.target.value })
                        }
                        className="flex-1 px-3 py-2 surface-card rounded-lg border border-surface-hover focus:border-accent-500 focus:outline-none"
                      />
                      <button
                        onClick={() => handleRemoveExercise(idx)}
                        className="p-2 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleAddSet(idx)}
                      className="px-3 py-1 surface-card hover:bg-surface-hover rounded text-sm"
                    >
                      + Add Set
                    </button>

                    {exercise.sets.map((set, setIdx) => (
                      <div key={setIdx} className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <label className="block text-xs text-ink-600 mb-1">Reps</label>
                          <input
                            type="number"
                            value={set.reps}
                            onChange={(e) => {
                              const updated = [...exercises];
                              updated[idx].sets[setIdx].reps = parseInt(e.target.value) || 0;
                              setExercises(updated);
                            }}
                            className="w-full px-2 py-1 surface-card rounded border border-surface-hover focus:border-accent-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-ink-600 mb-1">Weight (kg)</label>
                          <input
                            type="number"
                            step="0.5"
                            value={set.weight}
                            onChange={(e) => {
                              const updated = [...exercises];
                              updated[idx].sets[setIdx].weight = parseFloat(e.target.value) || 0;
                              setExercises(updated);
                            }}
                            className="w-full px-2 py-1 surface-card rounded border border-surface-hover focus:border-accent-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-ink-600 mb-1">Rest (sec)</label>
                          <input
                            type="number"
                            value={set.restTime}
                            onChange={(e) => {
                              const updated = [...exercises];
                              updated[idx].sets[setIdx].restTime = parseInt(e.target.value) || 0;
                              setExercises(updated);
                            }}
                            className="w-full px-2 py-1 surface-card rounded border border-surface-hover focus:border-accent-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
