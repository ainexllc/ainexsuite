'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { usePreferences } from '@/components/providers/preferences-provider';
import { useHealthMetrics } from '@/components/providers/health-metrics-provider';
import type { HealthGoals, GoalProgress, HealthGoalsSummary } from '@ainexsuite/types';
import {
  DEFAULT_HEALTH_GOALS,
  getGoalsSummary,
  isGoalAchieved,
  getWeeklyExerciseTotal,
  isWeeklyExerciseGoalMet,
} from '@/lib/goals-service';
import { showGoalAchievementNotification } from '@/lib/reminder-preferences';

// ===== TYPES =====

interface GoalsContextValue {
  goals: HealthGoals;
  progress: GoalProgress[];
  summary: HealthGoalsSummary;
  loading: boolean;
  // Actions
  updateGoals: (goals: Partial<HealthGoals>) => Promise<void>;
  checkTodayGoalAchieved: (goalType: keyof HealthGoals) => boolean;
  getWeeklyExercise: () => number;
  isWeeklyExerciseMet: () => boolean;
}

const GoalsContext = createContext<GoalsContextValue | null>(null);

// ===== PROVIDER =====

interface GoalsProviderProps {
  children: React.ReactNode;
}

export function GoalsProvider({ children }: GoalsProviderProps) {
  const { preferences, updatePreferences, loading: prefsLoading } = usePreferences();
  const { metrics, loading: metricsLoading } = useHealthMetrics();
  const [previousProgress, setPreviousProgress] = useState<Map<string, number>>(new Map());

  // Build goals from preferences
  const goals: HealthGoals = useMemo(
    () => ({
      dailyWaterGoal: preferences.dailyWaterGoal ?? DEFAULT_HEALTH_GOALS.dailyWaterGoal,
      targetWeight: preferences.targetWeight ?? DEFAULT_HEALTH_GOALS.targetWeight,
      sleepGoal: preferences.sleepGoal ?? DEFAULT_HEALTH_GOALS.sleepGoal,
      exerciseGoalDaily: preferences.exerciseGoalDaily ?? DEFAULT_HEALTH_GOALS.exerciseGoalDaily,
      exerciseGoalWeekly: preferences.exerciseGoalWeekly ?? DEFAULT_HEALTH_GOALS.exerciseGoalWeekly,
    }),
    [preferences]
  );

  // Calculate summary
  const summary = useMemo(
    () => getGoalsSummary(metrics, goals),
    [metrics, goals]
  );

  // Check for goal achievements and show notifications
  useEffect(() => {
    if (metricsLoading || !preferences.reminders?.goalNotifications) return;

    for (const progress of summary.progress) {
      const prevPercentage = previousProgress.get(progress.metric) ?? 0;

      // If goal just achieved (crossed 100%)
      if (prevPercentage < 100 && progress.percentage >= 100) {
        showGoalAchievementNotification(progress.label, progress.streak);
      }
    }

    // Update previous progress
    const newPrevProgress = new Map<string, number>();
    for (const progress of summary.progress) {
      newPrevProgress.set(progress.metric, progress.percentage);
    }
    setPreviousProgress(newPrevProgress);
  }, [summary.progress, metricsLoading, preferences.reminders?.goalNotifications, previousProgress]);

  // Update goals
  const updateGoals = useCallback(
    async (newGoals: Partial<HealthGoals>) => {
      await updatePreferences({
        dailyWaterGoal: newGoals.dailyWaterGoal,
        targetWeight: newGoals.targetWeight,
        sleepGoal: newGoals.sleepGoal,
        exerciseGoalDaily: newGoals.exerciseGoalDaily,
        exerciseGoalWeekly: newGoals.exerciseGoalWeekly,
      });
    },
    [updatePreferences]
  );

  // Check if today's goal is achieved
  const checkTodayGoalAchieved = useCallback(
    (goalType: keyof HealthGoals) => {
      const today = new Date().toISOString().split('T')[0];
      const todayMetric = metrics.find((m) => m.date === today);
      if (!todayMetric) return false;

      return isGoalAchieved(todayMetric, goalType, goals[goalType]);
    },
    [metrics, goals]
  );

  // Get weekly exercise total
  const getWeeklyExercise = useCallback(
    () => getWeeklyExerciseTotal(metrics),
    [metrics]
  );

  // Check if weekly exercise goal is met
  const isWeeklyExerciseMet = useCallback(
    () => isWeeklyExerciseGoalMet(metrics, goals.exerciseGoalWeekly),
    [metrics, goals.exerciseGoalWeekly]
  );

  const value = useMemo<GoalsContextValue>(
    () => ({
      goals,
      progress: summary.progress,
      summary,
      loading: prefsLoading || metricsLoading,
      updateGoals,
      checkTodayGoalAchieved,
      getWeeklyExercise,
      isWeeklyExerciseMet,
    }),
    [
      goals,
      summary,
      prefsLoading,
      metricsLoading,
      updateGoals,
      checkTodayGoalAchieved,
      getWeeklyExercise,
      isWeeklyExerciseMet,
    ]
  );

  return <GoalsContext.Provider value={value}>{children}</GoalsContext.Provider>;
}

// ===== HOOK =====

export function useGoals() {
  const context = useContext(GoalsContext);

  if (!context) {
    throw new Error('useGoals must be used within a GoalsProvider.');
  }

  return context;
}
