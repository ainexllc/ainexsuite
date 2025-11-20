'use client';

import type { Habit, HabitCompletion } from '@ainexsuite/types';
import { createCompletion, deleteCompletion, getCompletionForDate } from '@/lib/habits';
import { Circle, CheckCircle2, MoreVertical, Flame } from 'lucide-react';
import { calculateStreak } from '@/lib/utils';
import { useState } from 'react';

interface HabitListProps {
  habits: Habit[];
  completions: HabitCompletion[];
  onHabitClick: (habit: Habit) => void;
  onHabitEdit: (habit: Habit) => void;
  onUpdate: () => void;
}

export function HabitList({ habits, completions, onHabitClick, onHabitEdit, onUpdate }: HabitListProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleToggle = async (habit: Habit, e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(habit.id);

    try {
      const today = new Date();
      const existing = await getCompletionForDate(habit.id, today);

      if (existing) {
        await deleteCompletion(existing.id);
      } else {
        await createCompletion(habit.id, today.getTime());
      }

      onUpdate();
    } catch (error) {
      // Ignore toggle error
    } finally {
      setLoading(null);
    }
  };

  const isCompletedToday = (habitId: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return completions.some(
      (c) =>
        c.habitId === habitId &&
        c.date >= today.getTime() &&
        c.date < tomorrow.getTime()
    );
  };

  return (
    <div className="space-y-3">
      {habits.map((habit) => {
        const completed = isCompletedToday(habit.id);
        const streak = calculateStreak(habit.id, completions);

        return (
          <div
            key={habit.id}
            onClick={() => onHabitClick(habit)}
            className="surface-card rounded-lg p-4 cursor-pointer hover:surface-hover transition-all group"
          >
            <div className="flex items-start gap-3">
              <button
                onClick={(e) => handleToggle(habit, e)}
                disabled={loading === habit.id}
                className="mt-0.5 flex-shrink-0"
              >
                {completed ? (
                  <CheckCircle2 className="h-6 w-6 text-accent-500" />
                ) : (
                  <Circle className="h-6 w-6 text-ink-600 group-hover:text-ink-800 transition-colors" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-1">
                  <h3 className="font-semibold flex-1">{habit.name}</h3>

                  {streak.current > 0 && (
                    <div className="flex items-center gap-1 text-streak-fire">
                      <Flame className="h-4 w-4" />
                      <span className="text-sm font-bold">{streak.current}</span>
                    </div>
                  )}
                </div>

                {habit.description && (
                  <p className="text-sm text-ink-600 mb-2">{habit.description}</p>
                )}

                <div className="flex items-center gap-4 text-xs text-ink-600">
                  <span className="capitalize">{habit.frequency}</span>
                  {streak.best > 0 && (
                    <span>Best: {streak.best} days</span>
                  )}
                  <span style={{ color: habit.color }}>●</span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onHabitEdit(habit);
                }}
                className="p-2 opacity-0 group-hover:opacity-100 hover:bg-surface-hover rounded-lg transition-all"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
