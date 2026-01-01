/**
 * Wellness Hub - Aggregates data from Health, Fit, and Habits apps
 * Central data layer for the unified wellness dashboard
 */

import type {
  WellnessSnapshot,
  WellnessActivityItem,
  HealthMetricSummary,
  WorkoutSummary,
  HabitProgressSummary,
  WellnessScore,
  WorkoutWeeklyStats,
} from '@ainexsuite/types';

// Import from sibling integration libraries
import { getRecentWorkouts, getWeeklyWorkoutStats } from './fit-integration';
import {
  getTodayHabitProgress,
  getWeeklyHabitStats,
  getRecentHabitCompletions,
  getHabitCategoryIcon,
  getHabitCategoryColor,
} from './habits-integration';

// Import health metrics (from existing provider pattern)
import { db, auth } from '@ainexsuite/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

const HEALTH_METRICS_COLLECTION = 'health_metrics';

function getCurrentUserId(): string | null {
  return auth.currentUser?.uid ?? null;
}

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get today's health metric summary
 */
export async function getTodayHealthSummary(): Promise<HealthMetricSummary | null> {
  const userId = getCurrentUserId();
  const today = getTodayDateString();

  if (!userId) return null;

  try {
    const metricsRef = collection(db, HEALTH_METRICS_COLLECTION);
    const q = query(
      metricsRef,
      where('ownerId', '==', userId),
      where('date', '==', today),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return { date: today, hasData: false };
    }

    const data = snapshot.docs[0].data();
    return {
      date: today,
      hasData: true,
      sleep: data.sleep ?? undefined,
      water: data.water ?? undefined,
      energy: data.energy ?? undefined,
      mood: data.mood ?? undefined,
      weight: data.weight ?? undefined,
      heartRate: data.heartRate ?? undefined,
      exercise: data.exercise ?? undefined,
    };
  } catch (error) {
    console.error('Failed to fetch today health summary:', error);
    return null;
  }
}

/**
 * Get weekly health averages
 */
async function getWeeklyHealthStats(): Promise<{
  avgSleep?: number;
  avgWater?: number;
  avgEnergy?: number;
  daysTracked: number;
}> {
  const userId = getCurrentUserId();
  if (!userId) return { daysTracked: 0 };

  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const startDate = weekAgo.toISOString().split('T')[0];

    const metricsRef = collection(db, HEALTH_METRICS_COLLECTION);
    const q = query(
      metricsRef,
      where('ownerId', '==', userId),
      where('date', '>=', startDate),
      orderBy('date', 'desc')
    );

    const snapshot = await getDocs(q);
    const metrics = snapshot.docs.map((doc) => doc.data());

    if (metrics.length === 0) return { daysTracked: 0 };

    const sleepValues = metrics.filter((m) => m.sleep != null).map((m) => m.sleep);
    const waterValues = metrics.filter((m) => m.water != null).map((m) => m.water);
    const energyValues = metrics.filter((m) => m.energy != null).map((m) => m.energy);

    const avg = (arr: number[]) =>
      arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : undefined;

    return {
      avgSleep: avg(sleepValues),
      avgWater: avg(waterValues),
      avgEnergy: avg(energyValues),
      daysTracked: metrics.length,
    };
  } catch (error) {
    console.error('Failed to fetch weekly health stats:', error);
    return { daysTracked: 0 };
  }
}

/**
 * Build unified activity feed from all sources
 */
export async function buildActivityFeed(limitCount: number = 15): Promise<WellnessActivityItem[]> {
  const userId = getCurrentUserId();
  if (!userId) return [];

  const activities: WellnessActivityItem[] = [];

  try {
    // Get recent workouts
    const workouts = await getRecentWorkouts(5);
    for (const workout of workouts) {
      activities.push({
        id: `fit_${workout.id}`,
        timestamp: workout.date,
        source: 'fit',
        type: 'workout',
        title: workout.title,
        subtitle: `${workout.duration} min • ${workout.exerciseCount} exercises`,
        icon: '🏋️',
        color: '#3b82f6',
        metrics: {
          duration: workout.duration,
          exercises: workout.exerciseCount,
          calories: workout.caloriesBurned || 0,
        },
        appUrl: '/fit/workspace',
        itemId: workout.id,
      });
    }

    // Get recent habit completions
    const completions = await getRecentHabitCompletions(10);
    for (const completion of completions) {
      activities.push({
        id: `habits_${completion.id}`,
        timestamp: completion.completedAt,
        source: 'habits',
        type: 'habit_completion',
        title: `Completed: ${completion.habitTitle}`,
        subtitle: completion.value ? `${completion.value} logged` : 'Marked complete',
        icon: getHabitCategoryIcon(completion.category),
        color: getHabitCategoryColor(completion.category),
        appUrl: '/habits/workspace',
        itemId: completion.habitId,
      });
    }

    // Get recent health check-ins
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const startDate = weekAgo.toISOString().split('T')[0];

    const metricsRef = collection(db, HEALTH_METRICS_COLLECTION);
    const healthQuery = query(
      metricsRef,
      where('ownerId', '==', userId),
      where('date', '>=', startDate),
      orderBy('date', 'desc'),
      limit(5)
    );

    const healthSnapshot = await getDocs(healthQuery);
    for (const doc of healthSnapshot.docs) {
      const data = doc.data();
      const metricsLogged: string[] = [];
      if (data.weight) metricsLogged.push('weight');
      if (data.sleep) metricsLogged.push('sleep');
      if (data.water) metricsLogged.push('water');
      if (data.energy) metricsLogged.push('energy');
      if (data.mood) metricsLogged.push('mood');

      if (metricsLogged.length > 0) {
        activities.push({
          id: `health_${doc.id}`,
          timestamp: data.createdAt?.toDate?.()?.toISOString() || data.date,
          source: 'health',
          type: 'checkin',
          title: 'Health Check-in',
          subtitle: `Logged: ${metricsLogged.join(', ')}`,
          icon: '💚',
          color: '#10b981',
          metrics: {
            weight: data.weight,
            sleep: data.sleep,
            water: data.water,
            energy: data.energy,
          },
          appUrl: '/health/workspace',
          itemId: doc.id,
        });
      }
    }

    // Sort by timestamp descending
    activities.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return dateB - dateA;
    });

    return activities.slice(0, limitCount);
  } catch (error) {
    console.error('Failed to build activity feed:', error);
    return [];
  }
}

/**
 * Calculate overall wellness score (0-100)
 */
function calculateWellnessScore(
  health: HealthMetricSummary | null,
  habits: HabitProgressSummary,
  workoutStats: WorkoutWeeklyStats
): WellnessScore {
  let healthScore = 0;
  let fitnessScore = 0;
  let habitsScore = 0;

  // Health score (based on having logged data today)
  if (health?.hasData) {
    let healthPoints = 0;
    if (health.sleep && health.sleep >= 7) healthPoints += 25;
    else if (health.sleep) healthPoints += 15;
    if (health.water && health.water >= 6) healthPoints += 25;
    else if (health.water) healthPoints += 15;
    if (health.energy && health.energy >= 7) healthPoints += 25;
    else if (health.energy) healthPoints += 15;
    if (health.mood && ['happy', 'excited', 'peaceful', 'grateful'].includes(health.mood)) {
      healthPoints += 25;
    } else if (health.mood) {
      healthPoints += 10;
    }
    healthScore = healthPoints;
  }

  // Fitness score (based on weekly workout activity)
  if (workoutStats.totalWorkouts >= 5) fitnessScore = 100;
  else if (workoutStats.totalWorkouts >= 3) fitnessScore = 75;
  else if (workoutStats.totalWorkouts >= 1) fitnessScore = 50;
  else fitnessScore = 0;

  // Habits score (based on completion rate)
  habitsScore = Math.round(habits.completionRate * 100);

  // Calculate overall (weighted average)
  const overall = Math.round(
    healthScore * 0.35 + fitnessScore * 0.3 + habitsScore * 0.35
  );

  return {
    overall,
    breakdown: {
      health: healthScore,
      fitness: fitnessScore,
      habits: habitsScore,
    },
    trend: 'stable', // Would need historical data to determine
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Get complete wellness snapshot for today
 */
export async function getTodayWellnessSnapshot(): Promise<WellnessSnapshot | null> {
  const userId = getCurrentUserId();
  if (!userId) return null;

  const today = getTodayDateString();

  try {
    // Fetch all data in parallel
    const [
      healthSummary,
      workouts,
      habitsProgress,
      weeklyHealthStats,
      weeklyWorkoutStats,
      weeklyHabitStats,
      activityFeed,
    ] = await Promise.all([
      getTodayHealthSummary(),
      getRecentWorkouts(3),
      getTodayHabitProgress(),
      getWeeklyHealthStats(),
      getWeeklyWorkoutStats(),
      getWeeklyHabitStats(),
      buildActivityFeed(15),
    ]);

    // Transform workouts to WorkoutSummary format
    const workoutSummaries: WorkoutSummary[] = workouts.map((w) => ({
      ...w,
      source: 'fit' as const,
    }));

    const snapshot: WellnessSnapshot = {
      date: today,
      userId,
      health: healthSummary,
      workouts: workoutSummaries,
      habits: habitsProgress,
      activityFeed,
      weeklyStats: {
        health: weeklyHealthStats,
        fitness: weeklyWorkoutStats,
        habits: weeklyHabitStats,
      },
      generatedAt: new Date().toISOString(),
    };

    return snapshot;
  } catch (error) {
    console.error('Failed to get wellness snapshot:', error);
    return null;
  }
}

/**
 * Get wellness score
 */
export async function getWellnessScore(): Promise<WellnessScore | null> {
  const userId = getCurrentUserId();
  if (!userId) return null;

  try {
    const [healthSummary, habitsProgress, workoutStats] = await Promise.all([
      getTodayHealthSummary(),
      getTodayHabitProgress(),
      getWeeklyWorkoutStats(),
    ]);

    return calculateWellnessScore(healthSummary, habitsProgress, workoutStats);
  } catch (error) {
    console.error('Failed to calculate wellness score:', error);
    return null;
  }
}

// Re-export integration functions for convenience
export { getRecentWorkouts, getWeeklyWorkoutStats } from './fit-integration';
export {
  getTodayHabitProgress,
  getWeeklyHabitStats,
  getRecentHabitCompletions,
  getHabitCategoryIcon,
  getHabitCategoryColor,
} from './habits-integration';
