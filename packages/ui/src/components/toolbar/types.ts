import type { LucideIcon } from 'lucide-react';

// Base view modes - apps can extend with their own
export type BaseViewMode = 'list' | 'masonry' | 'calendar';

// Sort configuration
export type SortField = 'createdAt' | 'updatedAt' | 'title' | 'dueDate' | 'noteDate';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

// Quick date filter presets
export type QuickDatePreset =
  | 'today'
  | 'yesterday'
  | 'this-week'
  | 'last-7-days'
  | 'this-month'
  | 'last-30-days'
  | 'custom';

// Note type filter (text vs checklist)
export type NoteTypeFilter = 'all' | 'text' | 'checklist';

// Which date field to filter on
export type DateRangeField = 'createdAt' | 'updatedAt' | 'noteDate';

// Generic filter value - apps can extend
export interface FilterValue {
  labels?: string[];
  colors?: string[];
  dateRange?: {
    start: Date | null;
    end: Date | null;
  };
  // Enhanced filtering options
  datePreset?: QuickDatePreset;
  dateField?: DateRangeField;
  noteType?: NoteTypeFilter;
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
