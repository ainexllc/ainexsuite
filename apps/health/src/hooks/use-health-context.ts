'use client';

import { useMemo } from 'react';
import { useHealthMetrics } from '@/components/providers/health-metrics-provider';
import { usePreferences } from '@/components/providers/preferences-provider';
import type { HealthMetric, HealthGoals, WellnessScore } from '@ainexsuite/types';
import { getWeeklyAverages, getTrendDirection, calculateMoodEnergyCorrelation } from '@/lib/analytics-utils';
import { getGoalsSummary, DEFAULT_HEALTH_GOALS } from '@/lib/goals-service';

// ===== TYPES =====

export interface HealthContext {
  // Recent data
  recentMetrics: HealthMetric[];
  todayMetric: HealthMetric | null;
  weeklyAverages: ReturnType<typeof getWeeklyAverages>;

  // Trends
  trends: {
    weight: 'up' | 'down' | 'stable';
    sleep: 'up' | 'down' | 'stable';
    water: 'up' | 'down' | 'stable';
    exercise: 'up' | 'down' | 'stable';
    energy: 'up' | 'down' | 'stable';
  };

  // Goals
  goals: HealthGoals;
  goalsSummary: ReturnType<typeof getGoalsSummary>;

  // Wellness
  wellnessScore: WellnessScore | null;

  // Correlations
  moodEnergyCorrelation: ReturnType<typeof calculateMoodEnergyCorrelation>;

  // Summary for AI
  summaryText: string;
}

// ===== HOOK =====

/**
 * Hook to aggregate health data for AI context
 * Provides a comprehensive snapshot of the user's health state
 */
export function useHealthContext(): HealthContext {
  const { metrics } = useHealthMetrics();
  const { preferences } = usePreferences();

  const context = useMemo<HealthContext>(() => {
    const today = new Date().toISOString().split('T')[0];

    // Get recent metrics (last 14 days)
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const twoWeeksAgoStr = twoWeeksAgo.toISOString().split('T')[0];

    const recentMetrics = metrics
      .filter((m) => m.date >= twoWeeksAgoStr)
      .sort((a, b) => b.date.localeCompare(a.date));

    const todayMetric = metrics.find((m) => m.date === today) ?? null;

    // Calculate averages
    const weeklyAverages = getWeeklyAverages(recentMetrics);

    // Calculate trends
    const trends = {
      weight: getTrendDirection(recentMetrics, 'weight'),
      sleep: getTrendDirection(recentMetrics, 'sleep'),
      water: getTrendDirection(recentMetrics, 'water'),
      exercise: getTrendDirection(recentMetrics, 'exercise'),
      energy: getTrendDirection(recentMetrics, 'energy'),
    };

    // Build goals
    const goals: HealthGoals = {
      dailyWaterGoal: preferences.dailyWaterGoal ?? DEFAULT_HEALTH_GOALS.dailyWaterGoal,
      targetWeight: preferences.targetWeight ?? DEFAULT_HEALTH_GOALS.targetWeight,
      sleepGoal: preferences.sleepGoal ?? DEFAULT_HEALTH_GOALS.sleepGoal,
      exerciseGoalDaily: preferences.exerciseGoalDaily ?? DEFAULT_HEALTH_GOALS.exerciseGoalDaily,
      exerciseGoalWeekly: preferences.exerciseGoalWeekly ?? DEFAULT_HEALTH_GOALS.exerciseGoalWeekly,
    };

    const goalsSummary = getGoalsSummary(metrics, goals);

    // Calculate wellness score (simplified)
    const wellnessScore = calculateWellnessScore(recentMetrics, goalsSummary);

    // Calculate correlations
    const moodEnergyCorrelation = calculateMoodEnergyCorrelation(recentMetrics);

    // Generate summary text for AI
    const summaryText = generateSummaryText({
      todayMetric,
      weeklyAverages,
      trends,
      goalsSummary,
      wellnessScore,
    });

    return {
      recentMetrics,
      todayMetric,
      weeklyAverages,
      trends,
      goals,
      goalsSummary,
      wellnessScore,
      moodEnergyCorrelation,
      summaryText,
    };
  }, [metrics, preferences]);

  return context;
}

// ===== HELPERS =====

function calculateWellnessScore(
  metrics: HealthMetric[],
  goalsSummary: ReturnType<typeof getGoalsSummary>
): WellnessScore | null {
  if (metrics.length === 0) return null;

  // Health score based on metric logging consistency
  const daysWithData = metrics.length;
  const healthScore = Math.min(100, daysWithData * 7);

  // Fitness score based on exercise goal progress
  const exerciseProgress = goalsSummary.progress.find((p) => p.metric === 'exerciseGoalDaily');
  const fitnessScore = exerciseProgress ? Math.round(exerciseProgress.percentage) : 0;

  // Habits score based on overall goal completion
  const habitsScore = Math.round(goalsSummary.overallCompletionRate);

  // Overall score is weighted average
  const overall = Math.round(healthScore * 0.3 + fitnessScore * 0.35 + habitsScore * 0.35);

  // Determine trend
  let trend: WellnessScore['trend'] = 'stable';
  if (goalsSummary.totalStreak >= 3) trend = 'improving';
  if (overall < 50 && goalsSummary.totalStreak === 0) trend = 'declining';

  return {
    overall,
    breakdown: {
      health: healthScore,
      fitness: fitnessScore,
      habits: habitsScore,
    },
    trend,
    lastUpdated: new Date().toISOString(),
  };
}

function generateSummaryText(data: {
  todayMetric: HealthMetric | null;
  weeklyAverages: ReturnType<typeof getWeeklyAverages>;
  trends: Record<string, 'up' | 'down' | 'stable'>;
  goalsSummary: ReturnType<typeof getGoalsSummary>;
  wellnessScore: WellnessScore | null;
}): string {
  const parts: string[] = [];

  // Today's status
  if (data.todayMetric) {
    const today = data.todayMetric;
    const todayParts: string[] = [];
    if (today.sleep) todayParts.push(`${today.sleep}h sleep`);
    if (today.water) todayParts.push(`${today.water} glasses water`);
    if (today.exercise) todayParts.push(`${today.exercise}min exercise`);
    if (today.mood) todayParts.push(`feeling ${today.mood}`);
    if (todayParts.length > 0) {
      parts.push(`Today: ${todayParts.join(', ')}.`);
    }
  } else {
    parts.push('No check-in logged today.');
  }

  // Weekly averages
  const avg = data.weeklyAverages;
  if (avg.daysLogged > 0) {
    const avgParts: string[] = [];
    if (avg.sleep) avgParts.push(`sleep ${avg.sleep.toFixed(1)}h`);
    if (avg.water) avgParts.push(`water ${avg.water.toFixed(1)} glasses`);
    if (avg.exercise) avgParts.push(`exercise ${avg.exercise.toFixed(0)}min`);
    if (avgParts.length > 0) {
      parts.push(`Weekly avg (${avg.daysLogged} days): ${avgParts.join(', ')}.`);
    }
  }

  // Trends
  const trendParts: string[] = [];
  for (const [metric, direction] of Object.entries(data.trends)) {
    if (direction !== 'stable') {
      trendParts.push(`${metric} trending ${direction}`);
    }
  }
  if (trendParts.length > 0) {
    parts.push(`Trends: ${trendParts.join(', ')}.`);
  }

  // Goals
  const goalsMetCount = data.goalsSummary.progress.filter((p) => p.percentage >= 100).length;
  const totalGoals = data.goalsSummary.progress.length;
  if (totalGoals > 0) {
    parts.push(`Goals: ${goalsMetCount}/${totalGoals} met today, ${data.goalsSummary.totalStreak} day streak.`);
  }

  // Wellness score
  if (data.wellnessScore) {
    parts.push(`Wellness score: ${data.wellnessScore.overall}/100 (${data.wellnessScore.trend}).`);
  }

  return parts.join(' ');
}

/**
 * Generate a detailed prompt context for AI assistant
 */
export function generateAIPromptContext(context: HealthContext): string {
  return `
User Health Summary:
${context.summaryText}

Recent Metrics (last 7 days):
${context.recentMetrics
  .slice(0, 7)
  .map((m) => {
    const parts = [`Date: ${m.date}`];
    if (m.weight) parts.push(`Weight: ${m.weight}`);
    if (m.sleep) parts.push(`Sleep: ${m.sleep}h`);
    if (m.water) parts.push(`Water: ${m.water} glasses`);
    if (m.exercise) parts.push(`Exercise: ${m.exercise}min`);
    if (m.mood) parts.push(`Mood: ${m.mood}`);
    if (m.energy) parts.push(`Energy: ${m.energy}/10`);
    return `- ${parts.join(', ')}`;
  })
  .join('\n')}

Goals:
- Water: ${context.goals.dailyWaterGoal} glasses/day
- Sleep: ${context.goals.sleepGoal} hours/night
- Exercise: ${context.goals.exerciseGoalDaily} min/day
${context.goals.targetWeight ? `- Target weight: ${context.goals.targetWeight}` : ''}

Current Progress:
${context.goalsSummary.progress
  .map((p) => `- ${p.label}: ${p.current}/${p.target} ${p.unit} (${Math.round(p.percentage)}%)${p.streak > 0 ? ` - ${p.streak} day streak` : ''}`)
  .join('\n')}
`.trim();
}
