import type { LucideIcon } from 'lucide-react';

// Base view modes - apps can extend with their own
export type BaseViewMode = 'list' | 'masonry' | 'calendar';

// Sort configuration
export type SortField = 'createdAt' | 'updatedAt' | 'title' | 'dueDate';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

// Generic filter value - apps can extend
export interface FilterValue {
  labels?: string[];
  colors?: string[];
  dateRange?: {
    start: Date | null;
    end: Date | null;
  };
}

// Activity data for calendar view: ISO date string -> count of items
export interface ActivityData {
  [date: string]: number;
}

// View toggle option
export interface ViewOption<T extends string = BaseViewMode> {
  value: T;
  icon: LucideIcon;
  label: string;
}

// Sort option for dropdown
export interface SortOption {
  field: SortField;
  label: string;
}
