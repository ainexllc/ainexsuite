'use client';

import { AlertTriangle, Flame, X } from 'lucide-react';
import { useState } from 'react';
import { Habit, Completion } from '@/types/models';
import { getHabitsAtRisk } from '@/lib/date-utils';

interface StreakDangerAlertProps {
  habits: Habit[];
  completions: Completion[];
  onHabitClick?: (habitId: string) => void;
}

export function StreakDangerAlert({
  habits,
  completions,
  onHabitClick,
}: StreakDangerAlertProps) {
  const [dismissed, setDismissed] = useState(false);

  const habitsAtRisk = getHabitsAtRisk(habits, completions);

  if (dismissed || habitsAtRisk.length === 0) return null;

  const criticalCount = habitsAtRisk.filter(h => h.dangerLevel === 'critical').length;
  const warningCount = habitsAtRisk.filter(h => h.dangerLevel === 'warning').length;

  return (
    <div
      className={`relative rounded-xl p-4 mb-6 border ${
        criticalCount > 0
          ? 'bg-red-500/10 border-red-500/30'
          : 'bg-amber-500/10 border-amber-500/30'
      }`}
    >
      {/* Dismiss button */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 text-foreground/40 hover:text-foreground transition-colors"
        aria-label="Dismiss alert"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`h-10 w-10 rounded-lg flex items-center justify-center ${
            criticalCount > 0 ? 'bg-red-500/20' : 'bg-amber-500/20'
          }`}
        >
          <AlertTriangle
            className={`h-5 w-5 ${
              criticalCount > 0 ? 'text-red-400' : 'text-amber-400'
            }`}
          />
        </div>
        <div>
          <h3
            className={`font-semibold ${
              criticalCount > 0 ? 'text-red-300' : 'text-amber-300'
            }`}
          >
            {criticalCount > 0 ? 'Streaks at Risk!' : 'Keep Going!'}
          </h3>
          <p className="text-xs text-foreground/60">
            {criticalCount > 0
              ? `${criticalCount} habit${criticalCount > 1 ? 's' : ''} with 7+ day streaks need attention`
              : `${warningCount} habit${warningCount > 1 ? 's' : ''} waiting for you today`}
          </p>
        </div>
      </div>

      {/* Habits list */}
      <div className="flex flex-wrap gap-2">
        {habitsAtRisk.slice(0, 5).map(({ habit, dangerLevel, streak }) => (
          <button
            key={habit.id}
            onClick={() => onHabitClick?.(habit.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all hover:scale-105 ${
              dangerLevel === 'critical'
                ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
            }`}
          >
            <Flame className="h-3.5 w-3.5" />
            <span className="truncate max-w-[120px]">{habit.title}</span>
            <span className="font-bold">{streak}</span>
          </button>
        ))}
        {habitsAtRisk.length > 5 && (
          <span className="text-xs text-foreground/40 self-center">
            +{habitsAtRisk.length - 5} more
          </span>
        )}
      </div>
    </div>
  );
}
