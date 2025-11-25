'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Dumbbell, Calendar, Clock, Plus, X, Loader2, Trash2, Smile } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '@ainexsuite/auth';
import { useFitStore } from '@/lib/store';
import type { Workout, Exercise, ExerciseSet } from '@/types/models';

interface WorkoutComposerProps {
  onWorkoutCreated?: () => void;
}

const FEELING_OPTIONS: { value: Workout['feeling']; emoji: string; label: string }[] = [
  { value: 'great', emoji: '💪', label: 'Great' },
  { value: 'good', emoji: '😊', label: 'Good' },
  { value: 'tired', emoji: '😓', label: 'Tired' },
  { value: 'exhausted', emoji: '😵', label: 'Exhausted' },
];

export function WorkoutComposer({ onWorkoutCreated }: WorkoutComposerProps) {
  const { user } = useAuth();
  const { getCurrentSpace, addWorkout } = useFitStore();
  const currentSpace = getCurrentSpace();

  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState(60);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [feeling, setFeeling] = useState<Workout['feeling']>(undefined);
  const [showFeelingPicker, setShowFeelingPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const composerRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const resetState = useCallback(() => {
    setExpanded(false);
    setTitle('');
    setDate(new Date().toISOString().split('T')[0]);
    setDuration(60);
    setExercises([]);
    setFeeling(undefined);
    setShowFeelingPicker(false);
  }, []);

  const hasContent = title.trim() || exercises.some(e => e.name.trim());

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

  const handleUpdateSet = (exerciseIndex: number, setIndex: number, updates: Partial<ExerciseSet>) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets[setIndex] = {
      ...updated[exerciseIndex].sets[setIndex],
      ...updates,
    };
    setExercises(updated);
  };

  const handleSubmit = useCallback(async () => {
    if (isSubmitting || !user || !currentSpace) return;

    if (!title.trim()) {
      titleInputRef.current?.focus();
      return;
    }

    try {
      setIsSubmitting(true);

      const newWorkout: Workout = {
        id: `workout_${Date.now()}`,
        spaceId: currentSpace.id,
        userId: user.uid,
        title: title.trim(),
        date: new Date(date).toISOString(),
        duration,
        exercises: exercises.filter(e => e.name.trim()),
        feeling,
      };

      await addWorkout(newWorkout);
      onWorkoutCreated?.();
      resetState();
    } catch (error) {
      console.error('Failed to create workout:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, user, currentSpace, title, date, duration, exercises, feeling, addWorkout, onWorkoutCreated, resetState]);

  // Handle click outside to close if empty
  useEffect(() => {
    if (!expanded) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!composerRef.current) return;
      if (composerRef.current.contains(event.target as Node)) return;

      if (isSubmitting) return;

      if (hasContent) {
        void handleSubmit();
      } else {
        resetState();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [expanded, hasContent, handleSubmit, resetState, isSubmitting]);

  return (
    <section className="w-full mb-8">
      {!expanded ? (
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left text-sm text-white/50 shadow-sm transition hover:bg-white/10 hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 backdrop-blur-sm"
          onClick={() => setExpanded(true)}
        >
          <span>Log a workout...</span>
          <span className="flex items-center gap-3 text-white/30">
            <Dumbbell className="h-5 w-5" />
            <Clock className="h-5 w-5" />
          </span>
        </button>
      ) : (
        <div
          ref={composerRef}
          className="w-full rounded-2xl shadow-xl bg-[#121212] border border-white/10 backdrop-blur-xl transition-all overflow-hidden"
        >
          <div className="flex flex-col gap-4 px-5 py-4">
            {/* Title */}
            <input
              ref={titleInputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Workout name (e.g., Upper Body, Leg Day)"
              className="w-full bg-transparent text-lg font-semibold text-white placeholder:text-white/30 focus:outline-none"
              autoFocus
            />

            {/* Date & Duration Row */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-[150px]">
                <Calendar className="h-4 w-4 text-white/40" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div className="flex items-center gap-2 flex-1 min-w-[150px]">
                <Clock className="h-4 w-4 text-white/40" />
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                  placeholder="Duration"
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500"
                />
                <span className="text-sm text-white/40">min</span>
              </div>
            </div>

            {/* Exercises */}
            {exercises.length > 0 && (
              <div className="space-y-3">
                {exercises.map((exercise, idx) => (
                  <div key={exercise.id} className="bg-white/5 border border-white/5 p-3 rounded-xl space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Exercise name"
                        value={exercise.name}
                        onChange={(e) => handleUpdateExercise(idx, { name: e.target.value })}
                        className="flex-1 px-3 py-2 bg-black/20 rounded-lg border border-white/10 focus:border-orange-500 focus:outline-none text-white placeholder:text-white/30 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExercise(idx)}
                        className="p-2 text-white/30 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {exercise.sets.length > 0 && (
                      <div className="space-y-2">
                        {exercise.sets.map((set, setIdx) => (
                          <div key={set.id} className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <label className="block text-[10px] text-white/40 mb-1 uppercase">Reps</label>
                              <input
                                type="number"
                                value={set.reps || ''}
                                onChange={(e) => handleUpdateSet(idx, setIdx, { reps: parseInt(e.target.value) || 0 })}
                                className="w-full px-2 py-1.5 bg-black/20 rounded border border-white/10 focus:border-orange-500 focus:outline-none text-white text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-white/40 mb-1 uppercase">Weight (kg)</label>
                              <input
                                type="number"
                                step="0.5"
                                value={set.weight || ''}
                                onChange={(e) => handleUpdateSet(idx, setIdx, { weight: parseFloat(e.target.value) || 0 })}
                                className="w-full px-2 py-1.5 bg-black/20 rounded border border-white/10 focus:border-orange-500 focus:outline-none text-white text-sm"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleAddSet(idx)}
                      className="px-3 py-1 text-xs bg-white/5 hover:bg-white/10 rounded text-white/70 hover:text-white transition-colors"
                    >
                      + Add Set
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Feeling Badge */}
            {feeling && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/20 px-3 py-1 text-sm font-medium text-orange-300">
                  {FEELING_OPTIONS.find(f => f.value === feeling)?.emoji}
                  {FEELING_OPTIONS.find(f => f.value === feeling)?.label}
                  <button
                    type="button"
                    onClick={() => setFeeling(undefined)}
                    className="text-orange-300/60 hover:text-orange-300 ml-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/10">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                  onClick={handleAddExercise}
                  title="Add exercise"
                >
                  <Plus className="h-5 w-5" />
                </button>

                <div className="relative">
                  <button
                    type="button"
                    className={clsx(
                      "p-2 rounded-full transition-colors",
                      showFeelingPicker ? "text-orange-500 bg-orange-500/10" : "text-white/50 hover:text-white hover:bg-white/10"
                    )}
                    onClick={() => setShowFeelingPicker(!showFeelingPicker)}
                    title="How do you feel?"
                  >
                    <Smile className="h-5 w-5" />
                  </button>

                  {showFeelingPicker && (
                    <div className="absolute bottom-12 left-0 z-30 flex gap-2 rounded-xl bg-[#1a1a1a] border border-white/10 p-3 shadow-2xl">
                      {FEELING_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setFeeling(option.value);
                            setShowFeelingPicker(false);
                          }}
                          className={clsx(
                            "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
                            feeling === option.value ? "bg-orange-500/20 text-orange-300" : "hover:bg-white/10 text-white/70"
                          )}
                        >
                          <span className="text-xl">{option.emoji}</span>
                          <span className="text-[10px]">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="text-sm font-medium text-white/50 hover:text-white transition-colors"
                  onClick={resetState}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !title.trim()}
                  className="rounded-full bg-orange-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-900/20 transition hover:bg-orange-600 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-orange-500 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Log Workout'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
