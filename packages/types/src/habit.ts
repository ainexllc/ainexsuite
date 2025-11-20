import type { BaseDocument, HabitFrequency, HabitType, Timestamp } from './common';

export interface Habit extends BaseDocument {
  name: string;
  description: string;
  frequency: HabitFrequency;
  type: HabitType;
  goal: number | null;
  color: string;
  icon: string;
  active: boolean;
}

export type CreateHabitInput = Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateHabitInput = Partial<Omit<Habit, 'id' | 'ownerId' | 'createdAt'>>;

export interface HabitCompletion {
  id: string;
  ownerId: string;
  habitId: string;
  date: number; // Timestamp
  value: boolean | number;
  note: string;
  createdAt: Timestamp;
}

export type CreateHabitCompletionInput = Omit<HabitCompletion, 'id' | 'createdAt'>;

export interface HabitStreak {
  habitId: string;
  current: number;
  longest: number;
  lastCompletionDate: string;
}

export interface HabitStats {
  habitId: string;
  totalCompletions: number;
  completionRate: number; // 0-1
  currentStreak: number;
  longestStreak: number;
  averageValue: number | null;
}
