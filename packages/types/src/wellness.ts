/**
 * Wellness Hub Types
 * Cross-app aggregation types for Health, Fit, and Habits integration
 */

import type { MoodType } from './common';

// ===== HEALTH METRIC SUMMARY =====

export interface HealthMetricSummary {
  date: string;
  hasData: boolean;
  sleep?: number;
  water?: number;
  energy?: number;
  mood?: MoodType;
  weight?: number;
  heartRate?: number;
  exercise?: number;
}

// ===== WORKOUT SUMMARY (from Fit app) =====

export type WorkoutFeeling = 'great' | 'good' | 'tired' | 'exhausted';

export interface WorkoutSummary {
  id: string;
  date: string;
  title: string;
  duration: number; // minutes
  caloriesBurned?: number;
  feeling?: WorkoutFeeling;
  exerciseCount: number;
  source: 'fit';
}

export interface WorkoutWeeklyStats {
  totalWorkouts: number;
  totalDuration: number; // minutes
  totalCalories: number;
  averageDuration: number;
}

// ===== HABIT PROGRESS SUMMARY (from Habits app) =====

export interface HabitCompletionItem {
  habitId: string;
  habitTitle: string;
  completed: boolean;
  category: string;
  streak: number;
  targetValue?: number;
  targetUnit?: string;
  completedValue?: number;
}

export interface HabitStreakItem {
  habitId: string;
  habitTitle: string;
  currentStreak: number;
  bestStreak: number;
  category: string;
}

export interface HabitProgressSummary {
  date: string;
  totalHabits: number;
  completedHabits: number;
  completionRate: number; // 0-1
  healthHabits: HabitCompletionItem[];
  fitnessHabits: HabitCompletionItem[];
  topStreaks: HabitStreakItem[];
}

export interface HabitWeeklyStats {
  totalCompletions: number;
  averageCompletionRate: number;
  longestActiveStreak: number;
  healthHabitCompletions: number;
  fitnessHabitCompletions: number;
}

// ===== WELLNESS ACTIVITY FEED =====

export type WellnessActivitySource = 'health' | 'fit' | 'habits';
export type WellnessActivityType = 'checkin' | 'workout' | 'habit_completion' | 'streak_milestone';

export interface WellnessActivityItem {
  id: string;
  timestamp: string;
  source: WellnessActivitySource;
  type: WellnessActivityType;
  title: string;
  subtitle?: string;
  icon?: string;
  color?: string;
  metrics?: Record<string, string | number>;
  // Deep linking
  appUrl?: string;
  itemId?: string;
}

// ===== CORRELATION INSIGHTS =====

export interface WellnessCorrelation {
  id: string;
  metric1: {
    source: WellnessActivitySource;
    name: string;
    displayName: string;
  };
  metric2: {
    source: WellnessActivitySource;
    name: string;
    displayName: string;
  };
  correlation: number; // -1 to 1
  confidence: number; // 0 to 1
  insight: string; // Human-readable insight
  dataPoints: number; // How many days of data
  trend: 'positive' | 'negative' | 'neutral';
}

// ===== WELLNESS TRENDS =====

export interface WellnessTrendPoint {
  date: string;
  value: number;
}

export interface WellnessTrend {
  metric: string;
  displayName: string;
  source: WellnessActivitySource;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  weekData: WellnessTrendPoint[];
  currentValue?: number;
  previousValue?: number;
}

// ===== FULL WELLNESS SNAPSHOT =====

export interface WellnessSnapshot {
  date: string;
  userId: string;

  // Individual summaries
  health: HealthMetricSummary | null;
  workouts: WorkoutSummary[];
  habits: HabitProgressSummary;

  // Unified activity feed
  activityFeed: WellnessActivityItem[];

  // Weekly aggregates
  weeklyStats: {
    health: {
      avgSleep?: number;
      avgWater?: number;
      avgEnergy?: number;
      daysTracked: number;
    };
    fitness: WorkoutWeeklyStats;
    habits: HabitWeeklyStats;
  };

  // Generated at
  generatedAt: string;
}

// ===== AI WELLNESS INSIGHTS =====

export interface WellnessAIInsight {
  weeklyFocus: string;
  trendSummary: string;
  correlations: string[];
  recommendations: string[];
  focusArea: 'health' | 'fitness' | 'habits' | 'balance';
  motivationalQuote?: string;
}

// ===== WELLNESS SCORE =====

export interface WellnessScore {
  overall: number; // 0-100
  breakdown: {
    health: number;
    fitness: number;
    habits: number;
  };
  trend: 'improving' | 'declining' | 'stable';
  lastUpdated: string;
}
