'use client';

import { useState } from 'react';
import type { Workout, Exercise } from '@/types/models';
import { X, Trash2, Plus } from 'lucide-react';

interface WorkoutEditorProps {
  workout: Workout | null;
  onClose: () => void;
  onSave: (workout: Partial<Workout>) => void;
}

export function WorkoutEditor({ workout, onClose, onSave }: WorkoutEditorProps) {
  const [title, setTitle] = useState(workout?.title || '');
  const [date, setDate] = useState(
    workout?.date ? new Date(workout.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [duration, setDuration] = useState(workout?.duration || 60);
  const [exercises, setExercises] = useState<Exercise[]>(workout?.exercises || []);
  const [saving, setSaving] = useState(false);

  const handleAddExercise = () => {
    setExercises([
      ...exercises,
      {
        id: Date.now().toString(),
        name: '',
        sets: [],
        notes: '',
      },
    ]);
  };

  const handleUpdateExercise = (index: number, updates: Partial<Exercise>) => {
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
      id: Date.now().toString(),
      reps: 10,
      weight: 0,
      completed: false,
    });
    setExercises(updated);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a workout name');
      return;
    }

    setSaving(true);
    try {
      const data: Partial<Workout> = {
        id: workout?.id, // Preserve ID if editing
        title,
        date: new Date(date).toISOString(),
        duration,
        exercises: exercises.filter((e) => e.name.trim()),
      };

      onSave(data);
    } catch (error) {
      console.error('Failed to save workout:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-3xl bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-[#1a1a1a] z-10">
          <h2 className="text-xl font-bold text-white">
            {workout ? 'Edit Workout' : 'New Workout'}
          </h2>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-white/70 mb-2 uppercase tracking-wider">Workout Name *</label>
              <input
                type="text"
                placeholder="e.g., Upper Body Strength"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 rounded-lg border border-white/10 focus:border-orange-500 focus:outline-none text-white"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-2 uppercase tracking-wider">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 rounded-lg border border-white/10 focus:border-orange-500 focus:outline-none text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-2 uppercase tracking-wider">Duration (min)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white/5 rounded-lg border border-white/10 focus:border-orange-500 focus:outline-none text-white"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-white">Exercises</label>
              <button
                onClick={handleAddExercise}
                className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-white flex items-center gap-1 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Exercise
              </button>
            </div>

            {exercises.length > 0 && (
              <div className="space-y-4">
                {exercises.map((exercise, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/5 p-4 rounded-lg space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Exercise name"
                        value={exercise.name}
                        onChange={(e) =>
                          handleUpdateExercise(idx, { name: e.target.value })
                        }
                        className="flex-1 px-3 py-2 bg-black/20 rounded-lg border border-white/10 focus:border-orange-500 focus:outline-none text-white placeholder:text-white/30"
                      />
                      <button
                        onClick={() => handleRemoveExercise(idx)}
                        className="p-2 text-white/30 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleAddSet(idx)}
                      className="px-3 py-1 text-xs bg-white/5 hover:bg-white/10 rounded text-white/70 hover:text-white transition-colors"
                    >
                      + Add Set
                    </button>

                    {exercise.sets.map((set, setIdx) => (
                      <div key={setIdx} className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <label className="block text-[10px] text-white/40 mb-1 uppercase">Reps</label>
                          <input
                            type="number"
                            value={set.reps}
                            onChange={(e) => {
                              const updated = [...exercises];
                              updated[idx].sets[setIdx].reps = parseInt(e.target.value) || 0;
                              setExercises(updated);
                            }}
                            className="w-full px-2 py-1 bg-black/20 rounded border border-white/10 focus:border-orange-500 focus:outline-none text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-white/40 mb-1 uppercase">Weight (kg)</label>
                          <input
                            type="number"
                            step="0.5"
                            value={set.weight}
                            onChange={(e) => {
                              const updated = [...exercises];
                              updated[idx].sets[setIdx].weight = parseFloat(e.target.value) || 0;
                              setExercises(updated);
                            }}
                            className="w-full px-2 py-1 bg-black/20 rounded border border-white/10 focus:border-orange-500 focus:outline-none text-white"
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
