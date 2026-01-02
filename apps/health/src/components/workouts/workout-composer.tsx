'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Calendar, Clock, Plus, X, Loader2, Trash2, Smile } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '@ainexsuite/auth';
import { useAppColors } from '@ainexsuite/theme';
import { useWorkouts } from '@/components/providers/workouts-provider';
import type { Workout, Exercise, ExerciseSet } from '@/lib/types/workout';
import { FEELING_OPTIONS } from '@/lib/types/workout';

interface WorkoutComposerProps {
  onWorkoutCreated?: () => void;
}

export function WorkoutComposer({ onWorkoutCreated }: WorkoutComposerProps) {
  const { user } = useAuth();
  const { primary } = useAppColors();
  const { addWorkout } = useWorkouts();

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
  const isSubmittingRef = useRef(false);

  const resetState = useCallback(() => {
    setExpanded(false);
    setTitle('');
    setDate(new Date().toISOString().split('T')[0]);
    setDuration(60);
    setExercises([]);
    setFeeling(undefined);
    setShowFeelingPicker(false);
    isSubmittingRef.current = false;
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
    if (isSubmittingRef.current || !user) return;

    if (!title.trim()) {
      titleInputRef.current?.focus();
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const newWorkout: Workout = {
        id: `workout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user.uid,
        title: title.trim(),
        date: new Date(date).toISOString(),
        duration,
        exercises: exercises.filter(e => e.name.trim()),
        ...(feeling && { feeling }),
      };

      await addWorkout(newWorkout);
      onWorkoutCreated?.();
      resetState();
    } catch (error) {
      console.error('Failed to create workout:', error);
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [user, title, date, duration, exercises, feeling, addWorkout, onWorkoutCreated, resetState]);

  // Handle click outside to close only if empty
  useEffect(() => {
    if (!expanded) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!composerRef.current) return;
      if (composerRef.current.contains(event.target as Node)) return;

      if (!hasContent) {
        resetState();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [expanded, hasContent, resetState]);

  return (
    <section className="w-full mb-6">
      {!expanded ? (
        <button
          type="button"
          style={{ '--focus-ring-color': primary } as React.CSSProperties}
          className="flex w-full items-center rounded-2xl border border-border bg-foreground/5 px-5 py-4 text-left text-sm text-muted-foreground shadow-sm transition hover:bg-foreground/10 hover:border-border/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)] backdrop-blur-sm"
          onClick={() => setExpanded(true)}
        >
          <span>Log a workout...</span>
        </button>
      ) : (
        <div
          ref={composerRef}
          className="w-full rounded-2xl shadow-xl bg-background/95 border border-border backdrop-blur-xl transition-all overflow-hidden"
        >
          <div className="flex flex-col gap-4 px-5 py-4">
            {/* Title */}
            <input
              ref={titleInputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Workout name (e.g., Upper Body, Leg Day)"
              className="w-full bg-transparent text-lg font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none"
              autoFocus
            />

            {/* Date & Duration Row */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-[150px]">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{ '--focus-color': primary } as React.CSSProperties}
                  className="flex-1 bg-foreground/5 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-[var(--focus-color)]"
                />
              </div>
              <div className="flex items-center gap-2 flex-1 min-w-[150px]">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                  placeholder="Duration"
                  style={{ '--focus-color': primary } as React.CSSProperties}
                  className="flex-1 bg-foreground/5 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[var(--focus-color)]"
                />
                <span className="text-sm text-muted-foreground">min</span>
              </div>
            </div>

            {/* Exercises */}
            {exercises.length > 0 && (
              <div className="space-y-3">
                {exercises.map((exercise, idx) => (
                  <div key={exercise.id} className="bg-foreground/5 border border-border p-3 rounded-xl space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Exercise name"
                        value={exercise.name}
                        onChange={(e) => handleUpdateExercise(idx, { name: e.target.value })}
                        style={{ '--focus-color': primary } as React.CSSProperties}
                        className="flex-1 px-3 py-2 bg-background/20 rounded-lg border border-border focus:border-[var(--focus-color)] focus:outline-none text-foreground placeholder:text-muted-foreground text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExercise(idx)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {exercise.sets.length > 0 && (
                      <div className="space-y-2">
                        {exercise.sets.map((set, setIdx) => (
                          <div key={set.id} className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <label className="block text-[10px] text-muted-foreground mb-1 uppercase">Reps</label>
                              <input
                                type="number"
                                value={set.reps || ''}
                                onChange={(e) => handleUpdateSet(idx, setIdx, { reps: parseInt(e.target.value) || 0 })}
                                style={{ '--focus-color': primary } as React.CSSProperties}
                                className="w-full px-2 py-1.5 bg-background/20 rounded border border-border focus:border-[var(--focus-color)] focus:outline-none text-foreground text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-muted-foreground mb-1 uppercase">Weight (kg)</label>
                              <input
                                type="number"
                                step="0.5"
                                value={set.weight || ''}
                                onChange={(e) => handleUpdateSet(idx, setIdx, { weight: parseFloat(e.target.value) || 0 })}
                                style={{ '--focus-color': primary } as React.CSSProperties}
                                className="w-full px-2 py-1.5 bg-background/20 rounded border border-border focus:border-[var(--focus-color)] focus:outline-none text-foreground text-sm"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleAddSet(idx)}
                      className="px-3 py-1 text-xs bg-foreground/5 hover:bg-foreground/10 rounded text-muted-foreground hover:text-foreground transition-colors"
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
                <span
                  style={{
                    backgroundColor: `${primary}20`,
                    color: `${primary}cc`
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium"
                >
                  {FEELING_OPTIONS.find(f => f.value === feeling)?.emoji}
                  {FEELING_OPTIONS.find(f => f.value === feeling)?.label}
                  <button
                    type="button"
                    onClick={() => setFeeling(undefined)}
                    style={{ color: `${primary}99` }}
                    className="hover:opacity-100 ml-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-border">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-colors"
                  onClick={handleAddExercise}
                  title="Add exercise"
                >
                  <Plus className="h-5 w-5" />
                </button>

                <div className="relative">
                  <button
                    type="button"
                    style={showFeelingPicker ? {
                      color: primary,
                      backgroundColor: `${primary}1a`
                    } : {}}
                    className={clsx(
                      "p-2 rounded-full transition-colors",
                      !showFeelingPicker && "text-muted-foreground hover:text-foreground hover:bg-foreground/10"
                    )}
                    onClick={() => setShowFeelingPicker(!showFeelingPicker)}
                    title="How do you feel?"
                  >
                    <Smile className="h-5 w-5" />
                  </button>

                  {showFeelingPicker && (
                    <div className="absolute bottom-12 left-0 z-30 flex gap-2 rounded-xl bg-background/95 border border-border p-3 shadow-2xl">
                      {FEELING_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setFeeling(option.value);
                            setShowFeelingPicker(false);
                          }}
                          style={feeling === option.value ? {
                            backgroundColor: `${primary}20`,
                            color: `${primary}cc`
                          } : {}}
                          className={clsx(
                            "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
                            feeling !== option.value && "hover:bg-foreground/10 text-muted-foreground"
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
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={resetState}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !title.trim()}
                  style={{
                    backgroundColor: primary,
                    boxShadow: `0 10px 15px -3px ${primary}33`
                  }}
                  className="rounded-full px-6 py-2 text-sm font-semibold text-white shadow-lg transition hover:opacity-90 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center gap-2"
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
