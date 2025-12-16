import type { Timestamp } from 'firebase/firestore';
import type { HealthFilterValue } from '@/components/health-filter-content';

export type ViewMode = 'masonry' | 'list' | 'calendar';

// Sort configuration for health metrics
export type SortField = 'date' | 'weight' | 'sleep' | 'water' | 'energy';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

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
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type UserPreference = Omit<UserPreferenceDoc, 'createdAt' | 'updatedAt' | 'savedFilters'> & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  savedFilters?: HealthFilterValue;
};
