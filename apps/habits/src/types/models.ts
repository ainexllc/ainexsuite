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

// Habit categories for organization
export type HabitCategory =
  | 'health'
  | 'fitness'
  | 'productivity'
  | 'mindfulness'
  | 'learning'
  | 'relationships'
  | 'finance'
  | 'creativity'
  | 'self-care'
  | 'other';

export const HABIT_CATEGORIES: { value: HabitCategory; label: string; icon: string; color: string }[] = [
  { value: 'health', label: 'Health', icon: '💚', color: '#10b981' },
  { value: 'fitness', label: 'Fitness', icon: '💪', color: '#3b82f6' },
  { value: 'productivity', label: 'Productivity', icon: '⚡', color: '#f59e0b' },
  { value: 'mindfulness', label: 'Mindfulness', icon: '🧘', color: '#8b5cf6' },
  { value: 'learning', label: 'Learning', icon: '📚', color: '#06b6d4' },
  { value: 'relationships', label: 'Relationships', icon: '❤️', color: '#ec4899' },
  { value: 'finance', label: 'Finance', icon: '💰', color: '#22c55e' },
  { value: 'creativity', label: 'Creativity', icon: '🎨', color: '#f97316' },
  { value: 'self-care', label: 'Self-Care', icon: '✨', color: '#a855f7' },
  { value: 'other', label: 'Other', icon: '📌', color: '#6b7280' },
];

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
  targetUnit?: string; // Unit for targetValue (e.g., 'mins', 'pages', 'reps')
  currentStreak: number;
  bestStreak: number;
  isFrozen: boolean;
  createdAt: string;
  createdBy?: string; // Track who created the habit
  lastCompletedAt?: string; // ISO date string for interval scheduling
  streakFrozenAt?: string; // When streak was frozen (grace period tracking)
  wager?: Wager;
  // Organization
  category?: HabitCategory;
  tags?: string[];
  // Habit chaining
  chainedTo?: string; // ID of habit that follows this one
  chainedFrom?: string; // ID of habit that triggers this one
  chainOrder?: number; // Position in chain (0 = start)
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

// Reaction emojis for completions
export type ReactionEmoji = '🔥' | '💪' | '👏' | '⭐' | '❤️' | '🎉';

export const REACTION_EMOJIS: { emoji: ReactionEmoji; label: string }[] = [
  { emoji: '🔥', label: 'Fire' },
  { emoji: '💪', label: 'Strong' },
  { emoji: '👏', label: 'Clap' },
  { emoji: '⭐', label: 'Star' },
  { emoji: '❤️', label: 'Love' },
  { emoji: '🎉', label: 'Celebrate' },
];

export interface Reaction {
  emoji: ReactionEmoji;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface Completion {
  id: string;
  habitId: string;
  spaceId: string;
  userId: string;
  date: string;
  value?: number;
  completedAt: string;
  reactions?: Reaction[]; // Emoji reactions from other users
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

// Achievement system
export type AchievementType = 'streak' | 'total_completions' | 'consistency' | 'habit_count';

export interface AchievementMilestone {
  id: string;
  type: AchievementType;
  threshold: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
}

export const ACHIEVEMENT_MILESTONES: AchievementMilestone[] = [
  // Streak achievements
  { id: 'streak_7', type: 'streak', threshold: 7, title: '7-Day Warrior', description: 'Maintain a 7-day streak', icon: '🔥', color: '#f59e0b', tier: 'bronze' },
  { id: 'streak_14', type: 'streak', threshold: 14, title: 'Two Week Champion', description: 'Maintain a 14-day streak', icon: '⚡', color: '#f97316', tier: 'silver' },
  { id: 'streak_30', type: 'streak', threshold: 30, title: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '🏆', color: '#eab308', tier: 'gold' },
  { id: 'streak_60', type: 'streak', threshold: 60, title: 'Habit Hero', description: 'Maintain a 60-day streak', icon: '💎', color: '#8b5cf6', tier: 'platinum' },
  { id: 'streak_100', type: 'streak', threshold: 100, title: 'Century Legend', description: 'Maintain a 100-day streak', icon: '👑', color: '#06b6d4', tier: 'diamond' },

  // Total completions
  { id: 'total_10', type: 'total_completions', threshold: 10, title: 'Getting Started', description: 'Complete 10 habits', icon: '🌱', color: '#22c55e', tier: 'bronze' },
  { id: 'total_50', type: 'total_completions', threshold: 50, title: 'Building Momentum', description: 'Complete 50 habits', icon: '🚀', color: '#3b82f6', tier: 'silver' },
  { id: 'total_100', type: 'total_completions', threshold: 100, title: 'Century Club', description: 'Complete 100 habits', icon: '💯', color: '#eab308', tier: 'gold' },
  { id: 'total_500', type: 'total_completions', threshold: 500, title: 'Habit Machine', description: 'Complete 500 habits', icon: '⭐', color: '#8b5cf6', tier: 'platinum' },
  { id: 'total_1000', type: 'total_completions', threshold: 1000, title: 'Legendary', description: 'Complete 1000 habits', icon: '🌟', color: '#06b6d4', tier: 'diamond' },

  // Active habits
  { id: 'habits_3', type: 'habit_count', threshold: 3, title: 'Triple Threat', description: 'Track 3 active habits', icon: '🎯', color: '#10b981', tier: 'bronze' },
  { id: 'habits_5', type: 'habit_count', threshold: 5, title: 'High Five', description: 'Track 5 active habits', icon: '🖐️', color: '#f59e0b', tier: 'silver' },
  { id: 'habits_10', type: 'habit_count', threshold: 10, title: 'Perfect Ten', description: 'Track 10 active habits', icon: '🔟', color: '#eab308', tier: 'gold' },
];

export interface UserAchievement {
  id: string;
  odudId: string;
  achievementId: string;
  unlockedAt: string;
  habitId?: string; // For streak achievements, which habit triggered it
}

// Computed achievement status (not stored, calculated on the fly)
export interface ComputedAchievement {
  milestone: AchievementMilestone;
  progress: number; // Current value
  unlocked: boolean;
  unlockedAt?: string;
}
