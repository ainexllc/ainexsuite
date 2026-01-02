'use client';

import { Flame, TrendingUp, Droplets, Moon, Activity, Scale } from 'lucide-react';
import type { GoalProgress } from '@ainexsuite/types';
import { getGoalProgressColor, getStreakMessage } from '@/lib/goals-service';

interface GoalCardProps {
  progress: GoalProgress;
  config?: {
    label: string;
    unit: string;
    icon: string;
    description: string;
  };
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  droplets: Droplets,
  moon: Moon,
  activity: Activity,
  scale: Scale,
  calendar: Activity,
};

export function GoalCard({ progress, config }: GoalCardProps) {
  const Icon = config?.icon ? ICON_MAP[config.icon] || TrendingUp : TrendingUp;
  const color = getGoalProgressColor(progress.percentage);
  const streakMessage = getStreakMessage(progress.streak, progress.bestStreak);
  const isGoalMet = progress.percentage >= 100;

  const colorClasses: Record<string, { bg: string; ring: string; text: string }> = {
    emerald: {
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      ring: 'stroke-emerald-500',
      text: 'text-emerald-600 dark:text-emerald-400',
    },
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      ring: 'stroke-blue-500',
      text: 'text-blue-600 dark:text-blue-400',
    },
    amber: {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      ring: 'stroke-amber-500',
      text: 'text-amber-600 dark:text-amber-400',
    },
    red: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      ring: 'stroke-red-500',
      text: 'text-red-600 dark:text-red-400',
    },
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div className="p-4 bg-surface-elevated border border-outline-subtle rounded-xl">
      <div className="flex items-start gap-4">
        {/* Progress Ring */}
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            {/* Background ring */}
            <circle
              cx="18"
              cy="18"
              r="15.9"
              fill="none"
              className="stroke-surface-subtle"
              strokeWidth="3"
            />
            {/* Progress ring */}
            <circle
              cx="18"
              cy="18"
              r="15.9"
              fill="none"
              className={colors.ring}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${Math.min(progress.percentage, 100)} 100`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-sm font-bold ${colors.text}`}>
              {Math.round(progress.percentage)}%
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Icon className={`w-4 h-4 ${colors.text}`} />
            <h4 className="font-semibold text-ink-900">{progress.label}</h4>
          </div>

          <div className="text-sm text-ink-600 mb-2">
            <span className="font-medium text-ink-900">{progress.current}</span>
            <span> / {progress.target} {progress.unit}</span>
          </div>

          {/* Streak */}
          {progress.streak > 0 && (
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${colors.bg}`}>
              <Flame className={`w-3 h-3 ${colors.text}`} />
              <span className={colors.text}>{streakMessage}</span>
            </div>
          )}

          {/* Goal Met Badge */}
          {isGoalMet && (
            <div className="inline-flex items-center gap-1 px-2 py-1 ml-2 rounded-full text-xs bg-emerald-100 dark:bg-emerald-900/30">
              <span className="text-emerald-600 dark:text-emerald-400">Goal met!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
