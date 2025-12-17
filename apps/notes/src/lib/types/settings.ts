import type { Timestamp } from "firebase/firestore";
import type { FilterValue, SortConfig } from "@ainexsuite/ui";

export type ReminderChannel = "email" | "sms" | "push";
export type ViewMode = "masonry" | "list" | "calendar";

// Stored version of FilterValue with Timestamps for dates
export type StoredFilterValue = Omit<FilterValue, 'dateRange'> & {
  dateRange?: {
    start: Timestamp | null;
    end: Timestamp | null;
  };
};

export type UserPreferenceDoc = {
  reminderChannels: ReminderChannel[];
  smsNumber?: string | null;
  quietHoursStart?: string | null;
  quietHoursEnd?: string | null;
  digestEnabled: boolean;
  smartSuggestions: boolean;
  focusModePinned: boolean;
  viewMode: ViewMode;
  calendarView?: "month" | "week";
  // Filter persistence
  savedFilters?: StoredFilterValue;
  savedSort?: SortConfig;
  // Workspace background
  workspaceBackground?: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type UserPreference = Omit<UserPreferenceDoc, "createdAt" | "updatedAt" | "savedFilters"> & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  smsNumber: string | null;
  // Runtime version with Date objects
  savedFilters?: FilterValue;
  // Workspace background (can be null for no background)
  workspaceBackground: string | null;
};
