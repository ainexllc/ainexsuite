'use client';

import { useEffect, useState } from 'react';
import { Dumbbell, Clock, Flame, TrendingUp, Loader2 } from 'lucide-react';
import {
  getRecentWorkouts,
  getWeeklyWorkoutStats,
  getFeelingEmoji,
  type FitWorkoutSummary,
  type FitWeeklyStats,
} from '@/lib/fit-integration';
import { usePreferences } from '@/components/providers/preferences-provider';

interface FitIntegrationWidgetProps {
  compact?: boolean;
}

export function FitIntegrationWidget({ compact = false }: FitIntegrationWidgetProps) {
  const { updatePreferences } = usePreferences();
  const [workouts, setWorkouts] = useState<FitWorkoutSummary[]>([]);
  const [stats, setStats] = useState<FitWeeklyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const goToFitnessView = () => {
    updatePreferences({ viewMode: 'fitness' });
  };

  useEffect(() => {
    async function loadFitData() {
      try {
        setLoading(true);
        const [recentWorkouts, weeklyStats] = await Promise.all([
          getRecentWorkouts(compact ? 2 : 3),
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
  }, [compact]);

  if (loading) {
    return (
      <div className={`bg-surface-elevated rounded-2xl border border-outline-subtle ${compact ? 'p-4' : 'p-6'}`}>
        <div className={`flex items-center gap-2 ${compact ? 'mb-3' : 'mb-4'}`}>
          <Dumbbell className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-violet-500`} />
          <h3 className={`font-semibold text-ink-900 ${compact ? 'text-sm' : ''}`}>FIT Activity</h3>
        </div>
        <div className={`flex items-center justify-center ${compact ? 'py-4' : 'py-8'}`}>
          <Loader2 className={`${compact ? 'h-5 w-5' : 'h-6 w-6'} animate-spin text-violet-500`} />
        </div>
      </div>
    );
  }

  if (error || (workouts.length === 0 && stats?.totalWorkouts === 0)) {
    return (
      <div className={`bg-surface-elevated rounded-2xl border border-outline-subtle ${compact ? 'p-4' : 'p-6'}`}>
        <div className={`flex items-center gap-2 ${compact ? 'mb-3' : 'mb-4'}`}>
          <Dumbbell className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-violet-500`} />
          <h3 className={`font-semibold text-ink-900 ${compact ? 'text-sm' : ''}`}>FIT Activity</h3>
        </div>
        <div className={`text-center ${compact ? 'py-4' : 'py-6'}`}>
          <Dumbbell className={`${compact ? 'h-8 w-8' : 'h-10 w-10'} mx-auto mb-3 text-violet-500/30`} />
          <p className={`${compact ? 'text-xs' : 'text-sm'} text-ink-500 mb-3`}>No recent workouts</p>
          <button
            onClick={goToFitnessView}
            className={`inline-flex items-center gap-1 ${compact ? 'text-xs' : 'text-sm'} text-violet-500 hover:text-violet-600`}
          >
            Log a workout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-surface-elevated rounded-2xl border border-outline-subtle ${compact ? 'p-4' : 'p-6'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between ${compact ? 'mb-3' : 'mb-4'}`}>
        <div className="flex items-center gap-2">
          <Dumbbell className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-violet-500`} />
          <h3 className={`font-semibold text-ink-900 ${compact ? 'text-sm' : ''}`}>FIT Activity</h3>
        </div>
        <button
          onClick={goToFitnessView}
          className="text-xs text-violet-500 hover:text-violet-600 flex items-center gap-1"
        >
          View All
        </button>
      </div>

      {/* Weekly Stats */}
      {stats && stats.totalWorkouts > 0 && (
        <div className={`grid grid-cols-2 gap-3 ${compact ? 'mb-3' : 'mb-4'}`}>
          <div className={`bg-violet-500/10 rounded-xl ${compact ? 'p-2' : 'p-3'}`}>
            <div className={`flex items-center gap-2 text-violet-600 ${compact ? 'mb-0.5' : 'mb-1'}`}>
              <TrendingUp className={`${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
              <span className={`${compact ? 'text-[10px]' : 'text-xs'} font-medium`}>This Week</span>
            </div>
            <p className={`${compact ? 'text-xl' : 'text-2xl'} font-bold text-ink-900`}>{stats.totalWorkouts}</p>
            <p className={`${compact ? 'text-[10px]' : 'text-xs'} text-ink-500`}>workouts</p>
          </div>
          <div className={`bg-orange-500/10 rounded-xl ${compact ? 'p-2' : 'p-3'}`}>
            <div className={`flex items-center gap-2 text-orange-600 ${compact ? 'mb-0.5' : 'mb-1'}`}>
              <Flame className={`${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
              <span className={`${compact ? 'text-[10px]' : 'text-xs'} font-medium`}>Calories</span>
            </div>
            <p className={`${compact ? 'text-xl' : 'text-2xl'} font-bold text-ink-900`}>
              {stats.totalCalories > 0 ? stats.totalCalories.toLocaleString() : '--'}
            </p>
            <p className={`${compact ? 'text-[10px]' : 'text-xs'} text-ink-500`}>burned</p>
          </div>
        </div>
      )}

      {/* Recent Workouts */}
      {workouts.length > 0 && (
        <div className={`${compact ? 'space-y-1.5' : 'space-y-2'}`}>
          <p className={`${compact ? 'text-[10px]' : 'text-xs'} font-medium text-ink-500 uppercase tracking-wide`}>Recent</p>
          {workouts.map((workout) => (
            <div
              key={workout.id}
              className={`flex items-center justify-between ${compact ? 'p-2' : 'p-3'} bg-surface-muted rounded-xl`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`font-medium text-ink-900 truncate ${compact ? 'text-sm' : ''}`}>{workout.title}</p>
                  {workout.feeling && (
                    <span className={`${compact ? 'text-xs' : 'text-sm'}`}>{getFeelingEmoji(workout.feeling)}</span>
                  )}
                </div>
                <div className={`flex items-center gap-3 ${compact ? 'text-[10px]' : 'text-xs'} text-ink-500 mt-1`}>
                  <span>
                    {new Date(workout.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className={`${compact ? 'h-2.5 w-2.5' : 'h-3 w-3'}`} />
                    {workout.duration}min
                  </span>
                  {!compact && <span>{workout.exerciseCount} exercises</span>}
                </div>
              </div>
              {workout.caloriesBurned && (
                <div className="text-right">
                  <p className={`${compact ? 'text-xs' : 'text-sm'} font-semibold text-orange-500`}>
                    {workout.caloriesBurned}
                  </p>
                  <p className={`${compact ? 'text-[10px]' : 'text-xs'} text-ink-500`}>cal</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
