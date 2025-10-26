import type { Timestamp } from "firebase/firestore";

export type ReminderChannel = "email" | "sms" | "push";
export type ViewMode = "masonry" | "list";

export type UserPreferenceDoc = {
  reminderChannels: ReminderChannel[];
  smsNumber?: string | null;
  quietHoursStart?: string | null;
  quietHoursEnd?: string | null;
  digestEnabled: boolean;
  smartSuggestions: boolean;
  focusModePinned: boolean;
  viewMode: ViewMode;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type UserPreference = Omit<UserPreferenceDoc, "createdAt" | "updatedAt"> & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  smsNumber: string | null;
};
