'use client';

import type { Habit, HabitCompletion } from '@ainexsuite/types';
import { calculateStreak } from '@/lib/utils';
import { Flame, Target, TrendingUp } from 'lucide-react';

interface StatsProps {
  habits: Habit[];
  completions: HabitCompletion[];
}

export function Stats({ habits, completions }: StatsProps) {
  const totalHabits = habits.length;

  const completedToday = habits.filter((habit) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return completions.some(
      (c) =>
        c.habitId === habit.id &&
        c.date >= today.getTime() &&
        c.date < tomorrow.getTime()
    );
  }).length;

  const longestStreak = habits.reduce((max, habit) => {
    const streak = calculateStreak(habit.id, completions);
    return Math.max(max, streak.best);
  }, 0);

  const totalCompletions = completions.length;

  return (
    <div className="surface-card rounded-lg p-6">
      <h3 className="font-semibold mb-4">Statistics</h3>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-500/20 flex items-center justify-center">
            <Target className="h-5 w-5 text-accent-500" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-ink-600">Today</div>
            <div className="text-2xl font-bold">
              {completedToday}/{totalHabits}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-streak-fire/20 flex items-center justify-center">
            <Flame className="h-5 w-5 text-streak-fire" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-ink-600">Longest Streak</div>
            <div className="text-2xl font-bold">{longestStreak}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-streak-cool/20 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-streak-cool" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-ink-600">Total Completions</div>
            <div className="text-2xl font-bold">{totalCompletions}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
