// apps/grow/src/types/models.ts

export type SpaceType = 'personal' | 'couple' | 'squad';

export interface Member {
  uid: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'member' | 'observer';
  joinedAt: string;
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
