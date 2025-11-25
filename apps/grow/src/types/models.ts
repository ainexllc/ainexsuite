// apps/grow/src/types/models.ts

export type SpaceType = 'personal' | 'couple' | 'family' | 'squad';

// Member age group for family spaces
export type MemberAgeGroup = 'adult' | 'child';

// Habit creation policy for squad spaces
export type HabitCreationPolicy = 'admin_only' | 'anyone';

export interface Member {
  uid: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'member' | 'observer';
  joinedAt: string;
  ageGroup?: MemberAgeGroup; // Only relevant for family spaces
}

export interface Space {
  id: string;
  name: string;
  type: SpaceType;
  members: Member[];
  memberUids: string[];
  createdAt: string;
  createdBy: string;
  themeColor?: string;
  habitCreationPolicy?: HabitCreationPolicy; // For squad spaces (default: 'admin_only')
  dashboardToken?: string; // For family dashboard access without auth
}

export type FrequencyType = 'daily' | 'weekly' | 'interval' | 'specific_days';

export interface Schedule {
  type: FrequencyType;
  daysOfWeek?: number[];
  intervalDays?: number;
  timesPerWeek?: number;
}

export interface Wager {
  isActive: boolean;
  description: string;
  targetStreak: number;
  startDate: string;
  participants: string[];
  status: 'pending' | 'won' | 'lost';
  winnerId?: string;
}

export interface Habit {
  id: string;
  spaceId: string;
  title: string;
  description?: string;
  schedule: Schedule;
  assigneeIds: string[];
  targetValue?: number;
  currentStreak: number;
  bestStreak: number;
  isFrozen: boolean;
  createdAt: string;
  createdBy?: string; // Track who created the habit
  lastCompletedAt?: string; // ISO date string for interval scheduling
  streakFrozenAt?: string; // When streak was frozen (grace period tracking)
  wager?: Wager;
}

export interface Quest {
  id: string;
  spaceId: string;
  title: string;
  description: string;
  targetTotalCompletions: number;
  currentCompletions: number;
  startDate: string;
  endDate: string;
  reward?: string;
  status: 'active' | 'completed' | 'expired';
}

export interface Completion {
  id: string;
  habitId: string;
  spaceId: string; 
  userId: string;
  date: string;
  value?: number;
  completedAt: string;
}

export type NotificationType = 'nudge' | 'wager_update' | 'wager_won' | 'wager_lost' | 'quest_update' | 'system';

export interface Notification {
  id: string;
  recipientId: string; // User receiving the alert
  senderId?: string;   // User sending (for nudges)
  spaceId?: string;    // Context
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, unknown>; // Flexible payload for deep links
}

// Reminder types
export type ReminderTime = 'morning' | 'afternoon' | 'evening' | 'custom';

export interface ReminderSettings {
  enabled: boolean;
  time: ReminderTime;
  customTime?: string; // HH:mm format for custom time
  daysOfWeek: number[]; // 0-6, Sunday-Saturday
}

export interface HabitReminder {
  id: string;
  habitId: string;
  userId: string;
  settings: ReminderSettings;
  lastNotifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserReminderPreferences {
  userId: string;
  globalEnabled: boolean;
  defaultTime: ReminderTime;
  defaultCustomTime?: string;
  quietHoursStart?: string; // HH:mm
  quietHoursEnd?: string;   // HH:mm
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}
