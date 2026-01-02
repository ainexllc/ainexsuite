import type { Timestamp } from 'firebase/firestore';
import type { HealthFilterValue } from '@/components/health-filter-content';

export type ViewMode = 'masonry' | 'list' | 'calendar' | 'wellness' | 'medications' | 'analytics' | 'nutrition' | 'medical' | 'fitness';
export type MasonryColumns = 1 | 2 | 3 | 4;

// Sort configuration for health metrics
export type SortField = 'date' | 'weight' | 'sleep' | 'water' | 'energy';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

// Unit preferences for health metrics
export type WeightUnit = 'kg' | 'lbs';
export type WaterUnit = 'glasses' | 'ml' | 'oz';

// Stored version of FilterValue with Timestamps for dates
export type StoredHealthFilterValue = Omit<HealthFilterValue, 'dateRange'> & {
  dateRange?: {
    start: Timestamp | null;
    end: Timestamp | null;
  };
};

// Reminder types
export type ReminderType = 'checkin' | 'water' | 'medication' | 'goal';

export interface ReminderPreferences {
  globalEnabled: boolean;
  quietHoursStart?: string; // HH:mm
  quietHoursEnd?: string; // HH:mm
  checkinReminder: {
    enabled: boolean;
    time: string; // HH:mm
  };
  waterReminders: {
    enabled: boolean;
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    intervalMinutes: number;
  };
  goalNotifications: boolean;
}

export type UserPreferenceDoc = {
  viewMode: ViewMode;
  calendarView?: 'month' | 'week';
  savedFilters?: StoredHealthFilterValue;
  savedSort?: SortConfig;
  // Masonry column preferences
  todayColumns?: MasonryColumns;
  historyColumns?: MasonryColumns;
  // Unit preferences
  weightUnit?: WeightUnit;
  waterUnit?: WaterUnit;
  // Display preferences
  showGoals?: boolean;
  dailyWaterGoal?: number;
  targetWeight?: number | null;
  // Extended goal preferences
  sleepGoal?: number; // hours per night (default: 8)
  exerciseGoalDaily?: number; // minutes per day (default: 30)
  exerciseGoalWeekly?: number; // minutes per week (default: 150)
  enableGoalTracking?: boolean;
  // Nutrition goal preferences
  calorieGoal?: number;
  proteinGoal?: number;
  carbsGoal?: number;
  fatGoal?: number;
  // Check-in preferences
  enableReminders?: boolean;
  reminderTime?: string;
  // Extended reminder preferences
  reminders?: ReminderPreferences;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type UserPreference = Omit<UserPreferenceDoc, 'createdAt' | 'updatedAt' | 'savedFilters'> & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  savedFilters?: HealthFilterValue;
};
