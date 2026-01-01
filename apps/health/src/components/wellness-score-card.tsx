'use client';

import { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Heart,
  Dumbbell,
  Target,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { getWellnessScore } from '@/lib/wellness-hub';
import type { WellnessScore } from '@ainexsuite/types';

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-500';
  if (score >= 60) return 'text-teal-500';
  if (score >= 40) return 'text-amber-500';
  return 'text-red-500';
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Attention';
}

function getTrendIcon(trend: string) {
  switch (trend) {
    case 'improving':
      return <TrendingUp className="h-4 w-4 text-emerald-500" />;
    case 'declining':
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    default:
      return <Minus className="h-4 w-4 text-ink-400" />;
  }
}

interface WellnessScoreCardProps {
  compact?: boolean;
}

export function WellnessScoreCard({ compact = false }: WellnessScoreCardProps) {
  const [score, setScore] = useState<WellnessScore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadScore() {
      try {
        setLoading(true);
        const wellnessScore = await getWellnessScore();
        setScore(wellnessScore);
      } catch (err) {
        console.error('Failed to load wellness score:', err);
      } finally {
        setLoading(false);
      }
    }

    void loadScore();
  }, []);

  if (loading) {
    return (
      <div className="bg-surface-elevated rounded-2xl border border-outline-subtle p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-ink-900">Wellness Score</h3>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!score) {
    return (
      <div className="bg-surface-elevated rounded-2xl border border-outline-subtle p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-ink-900">Wellness Score</h3>
        </div>
        <div className="text-center py-8">
          <Sparkles className="h-12 w-12 mx-auto mb-3 text-ink-300" />
          <p className="text-ink-500">Start tracking to see your score</p>
          <p className="text-xs text-ink-400 mt-1">
            Log health metrics, workouts, and habits
          </p>
        </div>
      </div>
    );
  }

  const { overall, breakdown, trend } = score;
  const circumference = compact ? 2 * Math.PI * 28 : 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (overall / 100) * circumference;

  // Compact version for mobile
  if (compact) {
    return (
      <div className="bg-surface-elevated rounded-xl border border-outline-subtle p-3">
        <div className="flex items-center gap-4">
          {/* Smaller Circular Score */}
          <div className="relative flex-shrink-0">
            <svg className="h-16 w-16 -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                className="fill-none stroke-ink-100"
                strokeWidth="6"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                className={`fill-none stroke-current ${getScoreColor(overall)}`}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-lg font-bold ${getScoreColor(overall)}`}>
                {overall}
              </span>
            </div>
          </div>

          {/* Breakdown - horizontal on mobile */}
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <Heart className="h-3.5 w-3.5 text-emerald-500" />
              <div className="flex-1 h-1.5 bg-ink-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${breakdown.health}%` }}
                />
              </div>
              <span className="text-xs text-ink-500 w-6 text-right">{breakdown.health}</span>
            </div>
            <div className="flex items-center gap-2">
              <Dumbbell className="h-3.5 w-3.5 text-blue-500" />
              <div className="flex-1 h-1.5 bg-ink-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${breakdown.fitness}%` }}
                />
              </div>
              <span className="text-xs text-ink-500 w-6 text-right">{breakdown.fitness}</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-3.5 w-3.5 text-teal-500" />
              <div className="flex-1 h-1.5 bg-ink-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500 rounded-full"
                  style={{ width: `${breakdown.habits}%` }}
                />
              </div>
              <span className="text-xs text-ink-500 w-6 text-right">{breakdown.habits}</span>
            </div>
          </div>

          {/* Trend */}
          <div className="flex flex-col items-center gap-0.5">
            {getTrendIcon(trend)}
            <span className="text-[10px] text-ink-400 capitalize">{trend}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-elevated rounded-2xl border border-outline-subtle p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-ink-900">Wellness Score</h3>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          {getTrendIcon(trend)}
          <span className="text-ink-500 capitalize">{trend}</span>
        </div>
      </div>

      <div className="flex items-center gap-8">
        {/* Circular Score */}
        <div className="relative">
          <svg className="h-32 w-32 -rotate-90">
            {/* Background circle */}
            <circle
              cx="64"
              cy="64"
              r="54"
              className="fill-none stroke-ink-100"
              strokeWidth="10"
            />
            {/* Progress circle */}
            <circle
              cx="64"
              cy="64"
              r="54"
              className={`fill-none stroke-current ${getScoreColor(overall)}`}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 54}
              strokeDashoffset={2 * Math.PI * 54 - (overall / 100) * 2 * Math.PI * 54}
              style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${getScoreColor(overall)}`}>
              {overall}
            </span>
            <span className="text-xs text-ink-500">{getScoreLabel(overall)}</span>
          </div>
        </div>

        {/* Breakdown */}
        <div className="flex-1 space-y-4">
          {/* Health */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-emerald-500" />
                <span className="text-ink-700">Health</span>
              </div>
              <span className="font-medium text-ink-900">{breakdown.health}</span>
            </div>
            <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${breakdown.health}%` }}
              />
            </div>
          </div>

          {/* Fitness */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-blue-500" />
                <span className="text-ink-700">Fitness</span>
              </div>
              <span className="font-medium text-ink-900">{breakdown.fitness}</span>
            </div>
            <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${breakdown.fitness}%` }}
              />
            </div>
          </div>

          {/* Habits */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-teal-500" />
                <span className="text-ink-700">Habits</span>
              </div>
              <span className="font-medium text-ink-900">{breakdown.habits}</span>
            </div>
            <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${breakdown.habits}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Score explanation */}
      <p className="text-xs text-ink-400 mt-4 text-center">
        Based on today&apos;s health check-in, weekly workouts, and habit completion rate
      </p>
    </div>
  );
}
