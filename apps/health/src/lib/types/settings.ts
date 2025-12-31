import type { Timestamp } from 'firebase/firestore';
import type { HealthFilterValue } from '@/components/health-filter-content';

export type ViewMode = 'masonry' | 'list' | 'calendar';
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
  // Check-in preferences
  enableReminders?: boolean;
  reminderTime?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type UserPreference = Omit<UserPreferenceDoc, 'createdAt' | 'updatedAt' | 'savedFilters'> & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  savedFilters?: HealthFilterValue;
};
