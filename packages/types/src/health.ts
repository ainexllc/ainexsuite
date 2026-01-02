import type { MoodType, Timestamp } from './common';

export interface HealthMetric {
  id: string;
  ownerId: string;
  spaceId?: string; // Space this metric belongs to
  date: string; // YYYY-MM-DD
  sleep: number | null; // hours
  water: number | null; // glasses
  exercise: number | null; // minutes
  mood: MoodType | null;
  energy: number | null; // 1-10 scale
  weight: number | null; // kg or lbs based on user pref
  heartRate: number | null; // bpm
  bloodPressure: {
    systolic: number;
    diastolic: number;
  } | null;
  customMetrics: Record<string, number>;
  notes: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CreateHealthMetricInput = Omit<HealthMetric, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateHealthMetricInput = Partial<Omit<HealthMetric, 'id' | 'ownerId' | 'date' | 'createdAt'>>;

export interface HealthGoal {
  id: string;
  ownerId: string;
  metric: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  targetDate: Timestamp;
  createdAt: Timestamp;
}

export type CreateHealthGoalInput = Omit<HealthGoal, 'id' | 'currentValue' | 'createdAt'>;

export interface HealthTrend {
  metric: string;
  values: Array<{
    date: string;
    value: number;
  }>;
  average: number;
  trend: 'up' | 'down' | 'stable';
  change: number; // percentage
}

export interface HealthCorrelation {
  metric1: string;
  metric2: string;
  correlation: number; // -1 to 1
  confidence: number; // 0-1
}

// ===== HEALTH GOALS =====

export interface HealthGoals {
  dailyWaterGoal: number; // glasses
  targetWeight: number | null; // kg/lbs based on user pref
  sleepGoal: number; // hours per night
  exerciseGoalDaily: number; // minutes per day
  exerciseGoalWeekly: number; // minutes per week
}

export interface GoalProgress {
  metric: keyof HealthGoals;
  label: string;
  current: number;
  target: number;
  percentage: number;
  streak: number; // days meeting goal
  bestStreak: number;
  lastAchieved: string | null; // date
  unit: string;
}

export interface HealthGoalsSummary {
  goals: HealthGoals;
  progress: GoalProgress[];
  overallCompletionRate: number;
  totalStreak: number; // days meeting all goals
}
