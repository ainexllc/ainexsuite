'use client';

import { useEffect, useState } from 'react';
import { Dumbbell, Clock, Flame, TrendingUp, ExternalLink, Loader2 } from 'lucide-react';
import {
  getRecentWorkouts,
  getWeeklyWorkoutStats,
  getFeelingEmoji,
  type FitWorkoutSummary,
  type FitWeeklyStats,
} from '@/lib/fit-integration';

const FIT_APP_URL = process.env.NEXT_PUBLIC_FIT_APP_URL || 'https://fit.ainexsuite.com';

export function FitIntegrationWidget() {
  const [workouts, setWorkouts] = useState<FitWorkoutSummary[]>([]);
  const [stats, setStats] = useState<FitWeeklyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFitData() {
      try {
        setLoading(true);
        const [recentWorkouts, weeklyStats] = await Promise.all([
          getRecentWorkouts(3),
          getWeeklyWorkoutStats(),
        ]);
        setWorkouts(recentWorkouts);
        setStats(weeklyStats);
        setError(null);
      } catch (err) {
        console.error('Failed to load FIT data:', err);
        setError('Unable to load workout data');
      } finally {
        setLoading(false);
      }
    }

    void loadFitData();
  }, []);

  if (loading) {
    return (
      <div className="bg-surface-elevated rounded-2xl border border-outline-subtle p-6">
        <div className="flex items-center gap-2 mb-4">
          <Dumbbell className="h-5 w-5 text-violet-500" />
          <h3 className="font-semibold text-ink-900">FIT Activity</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
        </div>
      </div>
    );
  }

  if (error || (workouts.length === 0 && stats?.totalWorkouts === 0)) {
    return (
      <div className="bg-surface-elevated rounded-2xl border border-outline-subtle p-6">
        <div className="flex items-center gap-2 mb-4">
          <Dumbbell className="h-5 w-5 text-violet-500" />
          <h3 className="font-semibold text-ink-900">FIT Activity</h3>
        </div>
        <div className="text-center py-6">
          <Dumbbell className="h-10 w-10 mx-auto mb-3 text-violet-500/30" />
          <p className="text-sm text-ink-500 mb-3">No recent workouts</p>
          <a
            href={`${FIT_APP_URL}/workspace`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-violet-500 hover:text-violet-600"
          >
            Log a workout in FIT
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-elevated rounded-2xl border border-outline-subtle p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-violet-500" />
          <h3 className="font-semibold text-ink-900">FIT Activity</h3>
        </div>
        <a
          href={`${FIT_APP_URL}/workspace`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-violet-500 hover:text-violet-600 flex items-center gap-1"
        >
          Open FIT
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Weekly Stats */}
      {stats && stats.totalWorkouts > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-violet-500/10 rounded-xl p-3">
            <div className="flex items-center gap-2 text-violet-600 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium">This Week</span>
            </div>
            <p className="text-2xl font-bold text-ink-900">{stats.totalWorkouts}</p>
            <p className="text-xs text-ink-500">workouts</p>
          </div>
          <div className="bg-orange-500/10 rounded-xl p-3">
            <div className="flex items-center gap-2 text-orange-600 mb-1">
              <Flame className="h-4 w-4" />
              <span className="text-xs font-medium">Calories</span>
            </div>
            <p className="text-2xl font-bold text-ink-900">
              {stats.totalCalories > 0 ? stats.totalCalories.toLocaleString() : '--'}
            </p>
            <p className="text-xs text-ink-500">burned</p>
          </div>
        </div>
      )}

      {/* Recent Workouts */}
      {workouts.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-ink-500 uppercase tracking-wide">Recent</p>
          {workouts.map((workout) => (
            <div
              key={workout.id}
              className="flex items-center justify-between p-3 bg-surface-muted rounded-xl"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-ink-900 truncate">{workout.title}</p>
                  {workout.feeling && (
                    <span className="text-sm">{getFeelingEmoji(workout.feeling)}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-ink-500 mt-1">
                  <span>
                    {new Date(workout.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {workout.duration}min
                  </span>
                  <span>{workout.exerciseCount} exercises</span>
                </div>
              </div>
              {workout.caloriesBurned && (
                <div className="text-right">
                  <p className="text-sm font-semibold text-orange-500">
                    {workout.caloriesBurned}
                  </p>
                  <p className="text-xs text-ink-500">cal</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
