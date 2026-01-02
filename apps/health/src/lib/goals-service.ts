/**
 * Goals Service
 * Goal progress tracking and streak calculations
 */

import type { HealthMetric, HealthGoals, GoalProgress, HealthGoalsSummary } from '@ainexsuite/types';
import { calculateAllGoalProgress } from './analytics-utils';

// ===== DEFAULT GOALS =====

export const DEFAULT_HEALTH_GOALS: HealthGoals = {
  dailyWaterGoal: 8, // glasses
  targetWeight: null,
  sleepGoal: 8, // hours
  exerciseGoalDaily: 30, // minutes
  exerciseGoalWeekly: 150, // minutes
};

// ===== GOAL LABELS & UNITS =====

export const GOAL_CONFIG: Record<
  keyof HealthGoals,
  { label: string; unit: string; icon: string; description: string }
> = {
  dailyWaterGoal: {
    label: 'Daily Water',
    unit: 'glasses',
    icon: 'droplets',
    description: 'Glasses of water per day',
  },
  targetWeight: {
    label: 'Target Weight',
    unit: 'kg',
    icon: 'scale',
    description: 'Your goal weight',
  },
  sleepGoal: {
    label: 'Sleep Goal',
    unit: 'hours',
    icon: 'moon',
    description: 'Hours of sleep per night',
  },
  exerciseGoalDaily: {
    label: 'Daily Exercise',
    unit: 'min',
    icon: 'activity',
    description: 'Minutes of exercise per day',
  },
  exerciseGoalWeekly: {
    label: 'Weekly Exercise',
    unit: 'min',
    icon: 'calendar',
    description: 'Total exercise minutes per week',
  },
};

// ===== GOAL PROGRESS =====

/**
 * Get complete goals summary with progress
 */
export function getGoalsSummary(
  metrics: HealthMetric[],
  goals: HealthGoals
): HealthGoalsSummary {
  const progress = calculateAllGoalProgress(metrics, goals);

  // Calculate overall completion rate (goals met / total goals)
  const metGoals = progress.filter((p) => p.percentage >= 100).length;
  const overallCompletionRate = progress.length > 0 ? (metGoals / progress.length) * 100 : 0;

  // Calculate total streak (consecutive days meeting ALL goals)
  const totalStreak = calculateTotalStreak(metrics, goals);

  return {
    goals,
    progress,
    overallCompletionRate,
    totalStreak,
  };
}

/**
 * Calculate streak for meeting ALL goals
 */
function calculateTotalStreak(metrics: HealthMetric[], goals: HealthGoals): number {
  // Sort by date descending
  const sorted = [...metrics].sort((a, b) => b.date.localeCompare(a.date));

  let streak = 0;

  for (const metric of sorted) {
    let allGoalsMet = true;

    if (goals.dailyWaterGoal > 0) {
      if ((metric.water ?? 0) < goals.dailyWaterGoal) allGoalsMet = false;
    }

    if (goals.sleepGoal > 0) {
      if ((metric.sleep ?? 0) < goals.sleepGoal) allGoalsMet = false;
    }

    if (goals.exerciseGoalDaily > 0) {
      if ((metric.exercise ?? 0) < goals.exerciseGoalDaily) allGoalsMet = false;
    }

    if (allGoalsMet) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Check if a specific goal was achieved for a given metric
 */
export function isGoalAchieved(
  metric: HealthMetric,
  goalType: keyof HealthGoals,
  goalValue: number | null
): boolean {
  if (goalValue === null || goalValue === 0) return true;

  switch (goalType) {
    case 'dailyWaterGoal':
      return (metric.water ?? 0) >= goalValue;
    case 'sleepGoal':
      return (metric.sleep ?? 0) >= goalValue;
    case 'exerciseGoalDaily':
      return (metric.exercise ?? 0) >= goalValue;
    case 'targetWeight':
      return metric.weight !== null && metric.weight <= goalValue;
    case 'exerciseGoalWeekly':
      // This needs to be calculated across a week, handled separately
      return true;
    default:
      return false;
  }
}

/**
 * Get weekly exercise total from metrics
 */
export function getWeeklyExerciseTotal(metrics: HealthMetric[]): number {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString().split('T')[0];

  return metrics
    .filter((m) => m.date >= weekAgoStr)
    .reduce((sum, m) => sum + (m.exercise ?? 0), 0);
}

/**
 * Check if weekly exercise goal is met
 */
export function isWeeklyExerciseGoalMet(
  metrics: HealthMetric[],
  weeklyGoal: number
): boolean {
  return getWeeklyExerciseTotal(metrics) >= weeklyGoal;
}

/**
 * Get goal achievement message
 */
export function getGoalAchievementMessage(progress: GoalProgress): string {
  if (progress.percentage >= 100) {
    if (progress.streak > 1) {
      return `Great job! ${progress.streak} day streak!`;
    }
    return 'Goal achieved today!';
  }

  const remaining = progress.target - progress.current;
  return `${remaining} ${progress.unit} to go`;
}

/**
 * Get motivational message based on streak
 */
export function getStreakMessage(streak: number, bestStreak: number): string {
  if (streak === 0) {
    return 'Start your streak today!';
  }

  if (streak >= bestStreak && bestStreak > 0) {
    return `New record! ${streak} days!`;
  }

  if (streak >= 7) {
    return `Amazing! ${streak} day streak!`;
  }

  if (streak >= 3) {
    return `Keep it up! ${streak} days!`;
  }

  return `${streak} day streak`;
}

/**
 * Get color for goal progress
 */
export function getGoalProgressColor(percentage: number): string {
  if (percentage >= 100) return 'emerald';
  if (percentage >= 75) return 'blue';
  if (percentage >= 50) return 'amber';
  return 'red';
}

/**
 * Calculate days until weight goal (estimate)
 */
export function estimateDaysToWeightGoal(
  metrics: HealthMetric[],
  targetWeight: number
): number | null {
  const recentMetrics = metrics
    .filter((m) => m.weight !== null)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 14);

  if (recentMetrics.length < 2) return null;

  const currentWeight = recentMetrics[0].weight!;
  const olderWeight = recentMetrics[recentMetrics.length - 1].weight!;

  // Calculate weight change per day
  const daysBetween =
    (new Date(recentMetrics[0].date).getTime() -
      new Date(recentMetrics[recentMetrics.length - 1].date).getTime()) /
    (1000 * 60 * 60 * 24);

  if (daysBetween === 0) return null;

  const changePerDay = (currentWeight - olderWeight) / daysBetween;

  if (changePerDay === 0) return null;

  // Calculate days remaining
  const remainingChange = targetWeight - currentWeight;
  const daysRemaining = remainingChange / changePerDay;

  // If going in wrong direction, return null
  if (daysRemaining < 0) return null;

  return Math.ceil(daysRemaining);
}
