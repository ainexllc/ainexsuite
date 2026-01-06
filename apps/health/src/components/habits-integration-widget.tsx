'use client';

import { useEffect, useState } from 'react';
import { Target, Flame, CheckCircle2, Circle, ExternalLink, Loader2 } from 'lucide-react';
import {
  getTodayHabitProgress,
  getHabitCategoryIcon,
  getHabitCategoryColor,
} from '@/lib/habits-integration';
import type { HabitProgressSummary, HabitCompletionItem } from '@ainexsuite/types';

const HABITS_APP_URL = process.env.NEXT_PUBLIC_HABITS_APP_URL || 'https://habits.ainexspace.com';

interface HabitsIntegrationWidgetProps {
  compact?: boolean;
}

export function HabitsIntegrationWidget({ compact = false }: HabitsIntegrationWidgetProps) {
  const [progress, setProgress] = useState<HabitProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHabitsData() {
      try {
        setLoading(true);
        const habitProgress = await getTodayHabitProgress();
        setProgress(habitProgress);
        setError(null);
      } catch (err) {
        console.error('Failed to load habits data:', err);
        setError('Unable to load habit data');
      } finally {
        setLoading(false);
      }
    }

    void loadHabitsData();
  }, []);

  if (loading) {
    return (
      <div className={`bg-surface-elevated rounded-2xl border border-outline-subtle ${compact ? 'p-4' : 'p-6'}`}>
        <div className={`flex items-center gap-2 ${compact ? 'mb-3' : 'mb-4'}`}>
          <Target className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-teal-500`} />
          <h3 className={`font-semibold text-ink-900 ${compact ? 'text-sm' : ''}`}>Habits Progress</h3>
        </div>
        <div className={`flex items-center justify-center ${compact ? 'py-4' : 'py-8'}`}>
          <Loader2 className={`${compact ? 'h-5 w-5' : 'h-6 w-6'} animate-spin text-teal-500`} />
        </div>
      </div>
    );
  }

  if (error || !progress || progress.totalHabits === 0) {
    return (
      <div className={`bg-surface-elevated rounded-2xl border border-outline-subtle ${compact ? 'p-4' : 'p-6'}`}>
        <div className={`flex items-center gap-2 ${compact ? 'mb-3' : 'mb-4'}`}>
          <Target className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-teal-500`} />
          <h3 className={`font-semibold text-ink-900 ${compact ? 'text-sm' : ''}`}>Habits Progress</h3>
        </div>
        <div className={`text-center ${compact ? 'py-4' : 'py-6'}`}>
          <Target className={`${compact ? 'h-8 w-8' : 'h-10 w-10'} mx-auto mb-2 text-teal-500/30`} />
          <p className={`${compact ? 'text-xs' : 'text-sm'} text-ink-500 mb-2`}>No habits to track</p>
          <a
            href={`${HABITS_APP_URL}/workspace`}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1 ${compact ? 'text-xs' : 'text-sm'} text-teal-500 hover:text-teal-600`}
          >
            Create habits in Grow
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    );
  }

  const completionPercent = Math.round(progress.completionRate * 100);
  const wellnessHabits = [...progress.healthHabits, ...progress.fitnessHabits];

  // Ring size: compact = 12x12 (48px), normal = 16x16 (64px)
  const ringSize = compact ? 48 : 64;
  const ringCenter = ringSize / 2;
  const ringRadius = compact ? 20 : 28;
  const ringStrokeWidth = compact ? 5 : 6;
  const ringCircumference = 2 * Math.PI * ringRadius;

  return (
    <div className={`bg-surface-elevated rounded-2xl border border-outline-subtle ${compact ? 'p-4' : 'p-6'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between ${compact ? 'mb-3' : 'mb-4'}`}>
        <div className="flex items-center gap-2">
          <Target className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-teal-500`} />
          <h3 className={`font-semibold text-ink-900 ${compact ? 'text-sm' : ''}`}>Habits Progress</h3>
        </div>
        <a
          href={`${HABITS_APP_URL}/workspace`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-teal-500 hover:text-teal-600 flex items-center gap-1"
        >
          Open Habits
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Today's Progress */}
      <div className={`flex items-center ${compact ? 'gap-3 mb-3' : 'gap-4 mb-4'}`}>
        <div className="relative" style={{ height: ringSize, width: ringSize }}>
          {/* Progress ring */}
          <svg
            style={{ height: ringSize, width: ringSize }}
            className="-rotate-90"
          >
            <circle
              cx={ringCenter}
              cy={ringCenter}
              r={ringRadius}
              className="fill-none stroke-teal-500/20"
              strokeWidth={ringStrokeWidth}
            />
            <circle
              cx={ringCenter}
              cy={ringCenter}
              r={ringRadius}
              className="fill-none stroke-teal-500"
              strokeWidth={ringStrokeWidth}
              strokeDasharray={`${(completionPercent / 100) * ringCircumference} ${ringCircumference}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`font-bold text-ink-900 ${compact ? 'text-sm' : 'text-lg'}`}>{completionPercent}%</span>
          </div>
        </div>
        <div className="flex-1">
          <p className={`font-bold text-ink-900 ${compact ? 'text-lg' : 'text-2xl'}`}>
            {progress.completedHabits}/{progress.totalHabits}
          </p>
          <p className={`text-ink-500 ${compact ? 'text-xs' : 'text-sm'}`}>habits completed today</p>
        </div>
      </div>

      {/* Top Streaks - hidden in compact mode */}
      {!compact && progress.topStreaks.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-ink-500 uppercase tracking-wide mb-2">
            Active Streaks
          </p>
          <div className="flex flex-wrap gap-2">
            {progress.topStreaks.slice(0, 3).map((streak) => (
              <div
                key={streak.habitId}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-orange-500/10 rounded-full"
              >
                <Flame className="h-3.5 w-3.5 text-orange-500" />
                <span className="text-xs font-medium text-orange-600">
                  {streak.currentStreak} day{streak.currentStreak !== 1 ? 's' : ''}
                </span>
                <span className="text-xs text-ink-500 truncate max-w-20">
                  {streak.habitTitle}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wellness Habits (Health & Fitness) */}
      {wellnessHabits.length > 0 && (
        <div className={compact ? 'space-y-1.5' : 'space-y-2'}>
          <p className="text-xs font-medium text-ink-500 uppercase tracking-wide">
            Health & Fitness
          </p>
          {wellnessHabits.slice(0, compact ? 2 : 4).map((habit) => (
            <HabitItem key={habit.habitId} habit={habit} compact={compact} />
          ))}
        </div>
      )}
    </div>
  );
}

function HabitItem({ habit, compact = false }: { habit: HabitCompletionItem; compact?: boolean }) {
  const icon = getHabitCategoryIcon(habit.category);
  const color = getHabitCategoryColor(habit.category);

  return (
    <div className={`flex items-center ${compact ? 'gap-2 p-2' : 'gap-3 p-3'} bg-surface-muted rounded-xl`}>
      <div
        className={`${compact ? 'h-6 w-6 text-xs' : 'h-8 w-8 text-sm'} rounded-lg flex items-center justify-center`}
        style={{ backgroundColor: `${color}20` }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-ink-900 truncate ${compact ? 'text-sm' : ''}`}>{habit.habitTitle}</p>
        {!compact && habit.targetValue && (
          <p className="text-xs text-ink-500">
            Target: {habit.targetValue} {habit.targetUnit}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {habit.streak > 0 && (
          <div className="flex items-center gap-1 text-orange-500">
            <Flame className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
            <span className="text-xs font-medium">{habit.streak}</span>
          </div>
        )}
        {habit.completed ? (
          <CheckCircle2 className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-teal-500`} />
        ) : (
          <Circle className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-ink-300`} />
        )}
      </div>
    </div>
  );
}
