/**
 * Analytics Utilities
 * Data preparation functions for health analytics charts
 */

import type { HealthMetric, HealthGoals, GoalProgress, MoodType } from '@ainexsuite/types';

// ===== CHART DATA TYPES =====

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface WeightChartData extends ChartDataPoint {
  targetWeight?: number;
}

export interface SleepChartData extends ChartDataPoint {
  goal?: number;
  goalMet: boolean;
}

export interface WaterChartData extends ChartDataPoint {
  goal: number;
  percentage: number;
  goalMet: boolean;
}

export interface ExerciseChartData extends ChartDataPoint {
  weeklyTotal?: number;
  weeklyGoal?: number;
}

export interface MoodEnergyData {
  date: string;
  mood: number; // 1-5 scale
  energy: number; // 1-10 scale
  moodLabel: string;
}

export interface VitalsChartData {
  date: string;
  heartRate?: number;
  systolic?: number;
  diastolic?: number;
}

export interface CorrelationResult {
  metric1: string;
  metric2: string;
  coefficient: number;
  strength: 'strong' | 'moderate' | 'weak' | 'none';
  direction: 'positive' | 'negative' | 'none';
}

export interface WeeklyAverages {
  weight: number | null;
  sleep: number | null;
  water: number | null;
  exercise: number | null;
  energy: number | null;
  daysLogged: number;
}

// ===== HELPERS =====

function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getDateRange(days: number): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return { start, end };
}

function filterMetricsByDays(metrics: HealthMetric[], days: number): HealthMetric[] {
  const { start } = getDateRange(days);
  const startStr = start.toISOString().split('T')[0];
  return metrics.filter((m) => m.date >= startStr).sort((a, b) => a.date.localeCompare(b.date));
}

const moodToNumber: Record<MoodType, number> = {
  excited: 5,
  happy: 4,
  grateful: 4,
  peaceful: 4,
  neutral: 3,
  tired: 2,
  anxious: 2,
  sad: 1,
  frustrated: 1,
};

// ===== CHART DATA PREPARATION =====

/**
 * Prepare weight trend data for line chart
 */
export function prepareWeightTrendData(
  metrics: HealthMetric[],
  days: number,
  targetWeight?: number | null
): WeightChartData[] {
  const filtered = filterMetricsByDays(metrics, days);

  return filtered
    .filter((m) => m.weight !== null)
    .map((m) => ({
      date: m.date,
      value: m.weight!,
      label: formatDateShort(m.date),
      targetWeight: targetWeight ?? undefined,
    }));
}

/**
 * Prepare sleep pattern data for bar chart
 */
export function prepareSleepPatternData(
  metrics: HealthMetric[],
  days: number,
  sleepGoal: number = 8
): SleepChartData[] {
  const filtered = filterMetricsByDays(metrics, days);

  return filtered
    .filter((m) => m.sleep !== null)
    .map((m) => ({
      date: m.date,
      value: m.sleep!,
      label: formatDateShort(m.date),
      goal: sleepGoal,
      goalMet: m.sleep! >= sleepGoal,
    }));
}

/**
 * Prepare water intake data for bar chart
 */
export function prepareWaterIntakeData(
  metrics: HealthMetric[],
  goal: number,
  days: number
): WaterChartData[] {
  const filtered = filterMetricsByDays(metrics, days);

  return filtered
    .filter((m) => m.water !== null)
    .map((m) => ({
      date: m.date,
      value: m.water!,
      label: formatDateShort(m.date),
      goal,
      percentage: Math.min((m.water! / goal) * 100, 100),
      goalMet: m.water! >= goal,
    }));
}

/**
 * Prepare exercise minutes data
 */
export function prepareExerciseData(
  metrics: HealthMetric[],
  days: number
): ExerciseChartData[] {
  const filtered = filterMetricsByDays(metrics, days);

  return filtered
    .filter((m) => m.exercise !== null)
    .map((m) => ({
      date: m.date,
      value: m.exercise!,
      label: formatDateShort(m.date),
    }));
}

/**
 * Prepare mood/energy correlation data
 */
export function prepareMoodEnergyData(
  metrics: HealthMetric[],
  days: number
): MoodEnergyData[] {
  const filtered = filterMetricsByDays(metrics, days);

  return filtered
    .filter((m) => m.mood !== null && m.energy !== null)
    .map((m) => ({
      date: m.date,
      mood: moodToNumber[m.mood!] || 3,
      energy: m.energy!,
      moodLabel: m.mood!,
    }));
}

/**
 * Prepare vitals (heart rate, blood pressure) data
 */
export function prepareVitalsData(
  metrics: HealthMetric[],
  days: number
): VitalsChartData[] {
  const filtered = filterMetricsByDays(metrics, days);

  return filtered
    .filter((m) => m.heartRate !== null || m.bloodPressure !== null)
    .map((m) => ({
      date: m.date,
      heartRate: m.heartRate ?? undefined,
      systolic: m.bloodPressure?.systolic,
      diastolic: m.bloodPressure?.diastolic,
    }));
}

// ===== CORRELATION ANALYSIS =====

/**
 * Calculate Pearson correlation coefficient between two arrays
 */
function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length < 3) return 0;

  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
  const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);
  const sumY2 = y.reduce((acc, yi) => acc + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  if (denominator === 0) return 0;
  return numerator / denominator;
}

/**
 * Calculate mood/energy correlation
 */
export function calculateMoodEnergyCorrelation(metrics: HealthMetric[]): CorrelationResult {
  const paired = metrics.filter((m) => m.mood !== null && m.energy !== null);

  const moods = paired.map((m) => moodToNumber[m.mood!] || 3);
  const energies = paired.map((m) => m.energy!);

  const coefficient = calculateCorrelation(moods, energies);
  const absCoeff = Math.abs(coefficient);

  let strength: CorrelationResult['strength'] = 'none';
  if (absCoeff >= 0.7) strength = 'strong';
  else if (absCoeff >= 0.4) strength = 'moderate';
  else if (absCoeff >= 0.2) strength = 'weak';

  let direction: CorrelationResult['direction'] = 'none';
  if (coefficient > 0.1) direction = 'positive';
  else if (coefficient < -0.1) direction = 'negative';

  return {
    metric1: 'mood',
    metric2: 'energy',
    coefficient,
    strength,
    direction,
  };
}

/**
 * Calculate sleep/energy correlation
 */
export function calculateSleepEnergyCorrelation(metrics: HealthMetric[]): CorrelationResult {
  const paired = metrics.filter((m) => m.sleep !== null && m.energy !== null);

  const sleeps = paired.map((m) => m.sleep!);
  const energies = paired.map((m) => m.energy!);

  const coefficient = calculateCorrelation(sleeps, energies);
  const absCoeff = Math.abs(coefficient);

  let strength: CorrelationResult['strength'] = 'none';
  if (absCoeff >= 0.7) strength = 'strong';
  else if (absCoeff >= 0.4) strength = 'moderate';
  else if (absCoeff >= 0.2) strength = 'weak';

  let direction: CorrelationResult['direction'] = 'none';
  if (coefficient > 0.1) direction = 'positive';
  else if (coefficient < -0.1) direction = 'negative';

  return {
    metric1: 'sleep',
    metric2: 'energy',
    coefficient,
    strength,
    direction,
  };
}

// ===== GOAL STREAK CALCULATIONS =====

/**
 * Calculate streak for a specific goal
 */
export function calculateGoalStreak(
  metrics: HealthMetric[],
  goalType: keyof HealthGoals,
  goalValue: number
): { current: number; best: number; lastAchieved: string | null } {
  // Sort by date descending (most recent first)
  const sorted = [...metrics].sort((a, b) => b.date.localeCompare(a.date));

  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;
  let lastAchieved: string | null = null;
  let countingCurrent = true;

  for (const metric of sorted) {
    let achieved = false;

    switch (goalType) {
      case 'dailyWaterGoal':
        achieved = (metric.water ?? 0) >= goalValue;
        break;
      case 'sleepGoal':
        achieved = (metric.sleep ?? 0) >= goalValue;
        break;
      case 'exerciseGoalDaily':
        achieved = (metric.exercise ?? 0) >= goalValue;
        break;
      case 'targetWeight':
        // Weight goal is different - we check if within range
        if (metric.weight !== null && goalValue !== null) {
          achieved = metric.weight <= goalValue;
        }
        break;
      default:
        break;
    }

    if (achieved) {
      tempStreak++;
      if (lastAchieved === null) {
        lastAchieved = metric.date;
      }
      if (countingCurrent) {
        currentStreak = tempStreak;
      }
    } else {
      countingCurrent = false;
      bestStreak = Math.max(bestStreak, tempStreak);
      tempStreak = 0;
    }
  }

  bestStreak = Math.max(bestStreak, tempStreak, currentStreak);

  return { current: currentStreak, best: bestStreak, lastAchieved };
}

/**
 * Calculate progress for all goals
 */
export function calculateAllGoalProgress(
  metrics: HealthMetric[],
  goals: HealthGoals
): GoalProgress[] {
  const today = new Date().toISOString().split('T')[0];
  const todayMetric = metrics.find((m) => m.date === today);

  const progress: GoalProgress[] = [];

  // Water goal
  if (goals.dailyWaterGoal > 0) {
    const streak = calculateGoalStreak(metrics, 'dailyWaterGoal', goals.dailyWaterGoal);
    const current = todayMetric?.water ?? 0;
    progress.push({
      metric: 'dailyWaterGoal',
      label: 'Water Intake',
      current,
      target: goals.dailyWaterGoal,
      percentage: Math.min((current / goals.dailyWaterGoal) * 100, 100),
      streak: streak.current,
      bestStreak: streak.best,
      lastAchieved: streak.lastAchieved,
      unit: 'glasses',
    });
  }

  // Sleep goal
  if (goals.sleepGoal > 0) {
    const streak = calculateGoalStreak(metrics, 'sleepGoal', goals.sleepGoal);
    const current = todayMetric?.sleep ?? 0;
    progress.push({
      metric: 'sleepGoal',
      label: 'Sleep',
      current,
      target: goals.sleepGoal,
      percentage: Math.min((current / goals.sleepGoal) * 100, 100),
      streak: streak.current,
      bestStreak: streak.best,
      lastAchieved: streak.lastAchieved,
      unit: 'hours',
    });
  }

  // Exercise goal (daily)
  if (goals.exerciseGoalDaily > 0) {
    const streak = calculateGoalStreak(metrics, 'exerciseGoalDaily', goals.exerciseGoalDaily);
    const current = todayMetric?.exercise ?? 0;
    progress.push({
      metric: 'exerciseGoalDaily',
      label: 'Exercise',
      current,
      target: goals.exerciseGoalDaily,
      percentage: Math.min((current / goals.exerciseGoalDaily) * 100, 100),
      streak: streak.current,
      bestStreak: streak.best,
      lastAchieved: streak.lastAchieved,
      unit: 'min',
    });
  }

  // Weight goal
  if (goals.targetWeight !== null) {
    const recentWeight = metrics.find((m) => m.weight !== null)?.weight ?? null;
    if (recentWeight !== null) {
      // Calculate progress toward weight goal
      const startWeight = metrics[metrics.length - 1]?.weight ?? recentWeight;
      const totalChange = Math.abs(startWeight - goals.targetWeight);
      const currentChange = Math.abs(startWeight - recentWeight);
      const percentage = totalChange > 0 ? Math.min((currentChange / totalChange) * 100, 100) : 100;

      progress.push({
        metric: 'targetWeight',
        label: 'Weight Goal',
        current: recentWeight,
        target: goals.targetWeight,
        percentage,
        streak: 0, // Weight doesn't have daily streaks
        bestStreak: 0,
        lastAchieved: null,
        unit: 'kg',
      });
    }
  }

  return progress;
}

// ===== WEEKLY/MONTHLY AVERAGES =====

/**
 * Calculate weekly averages for all metrics
 */
export function getWeeklyAverages(metrics: HealthMetric[]): WeeklyAverages {
  const filtered = filterMetricsByDays(metrics, 7);

  const weights = filtered.map((m) => m.weight).filter((v): v is number => v !== null);
  const sleeps = filtered.map((m) => m.sleep).filter((v): v is number => v !== null);
  const waters = filtered.map((m) => m.water).filter((v): v is number => v !== null);
  const exercises = filtered.map((m) => m.exercise).filter((v): v is number => v !== null);
  const energies = filtered.map((m) => m.energy).filter((v): v is number => v !== null);

  const avg = (arr: number[]) => (arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null);

  return {
    weight: avg(weights),
    sleep: avg(sleeps),
    water: avg(waters),
    exercise: avg(exercises),
    energy: avg(energies),
    daysLogged: filtered.length,
  };
}

/**
 * Get trend direction from recent data
 */
export function getTrendDirection(
  metrics: HealthMetric[],
  metricKey: 'weight' | 'sleep' | 'water' | 'exercise' | 'energy'
): 'up' | 'down' | 'stable' {
  const recent = filterMetricsByDays(metrics, 14);
  const values = recent.map((m) => m[metricKey]).filter((v): v is number => v !== null);

  if (values.length < 4) return 'stable';

  const midpoint = Math.floor(values.length / 2);
  const recentHalf = values.slice(0, midpoint);
  const olderHalf = values.slice(midpoint);

  const recentAvg = recentHalf.reduce((a, b) => a + b, 0) / recentHalf.length;
  const olderAvg = olderHalf.reduce((a, b) => a + b, 0) / olderHalf.length;

  const change = ((recentAvg - olderAvg) / olderAvg) * 100;

  if (change > 5) return 'up';
  if (change < -5) return 'down';
  return 'stable';
}
