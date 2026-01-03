// apps/grow/src/types/models.ts

import type { SpaceType } from '@ainexsuite/types';

export type { SpaceType };

// Member age group for family spaces
export type MemberAgeGroup = 'adult' | 'child';

// Habit creation policy for squad spaces
export type HabitCreationPolicy = 'admin_only' | 'anyone';

export interface Member {
  uid: string;
  displayName: string;
  photoURL?: string;
  photoStoragePath?: string; // Firebase Storage path for cleanup
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

// Invite system
export type InviteStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface SpaceInvite {
  id: string;
  spaceId: string;
  spaceName: string;
  spaceType: SpaceType;
  invitedBy: string; // User ID of inviter
  inviterName: string;
  inviteeEmail: string;
  inviteeUserId?: string; // Filled if invitee is existing user
  role: 'member' | 'observer';
  ageGroup?: MemberAgeGroup; // For family spaces
  status: InviteStatus;
  token: string; // Unique token for invite link
  createdAt: string;
  expiresAt: string;
  respondedAt?: string;
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
  | 'medicine'
  | 'other';

export const HABIT_CATEGORIES: { value: HabitCategory; label: string; icon: string; color: string }[] = [
  { value: 'health', label: 'Health', icon: '💚', color: '#10b981' },
  { value: 'fitness', label: 'Fitness', icon: '💪', color: '#3b82f6' },
  { value: 'medicine', label: 'Medicine', icon: '💊', color: '#ef4444' },
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
  icon?: string;
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

// Source of completion - for cross-app integration
export type CompletionSource = 'manual' | 'medication_auto' | 'workout_auto';

export interface Completion {
  id: string;
  habitId: string;
  spaceId: string;
  userId: string;
  date: string;
  value?: number;
  completedAt: string;
  reactions?: Reaction[]; // Emoji reactions from other users

  // Cross-app integration
  source?: CompletionSource; // How this completion was created
  sourceMedicationId?: string; // Link to medication if auto-completed
  sourceWorkoutId?: string; // Link to workout if auto-completed
}

export type NotificationType =
  | 'nudge'
  | 'wager_update'
  | 'wager_won'
  | 'wager_lost'
  | 'quest_update'
  | 'system'
  // Family-specific notifications
  | 'child_completed'
  | 'child_all_done'
  | 'daily_summary'
  | 'streak_danger_family'
  | 'challenge_progress'
  | 'challenge_complete'
  | 'sticker_earned';

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

// Family notification settings
export interface FamilyNotificationSettings {
  userId: string;
  spaceId: string;
  // Parent notification preferences
  childCompletionAlerts: boolean;
  childAllDoneAlerts: boolean;
  dailySummary: boolean;
  dailySummaryTime: string; // HH:mm format
  streakDangerAlerts: boolean;
  challengeAlerts: boolean;
  // Preferences
  quietHoursEnabled: boolean;
  quietHoursStart: string; // HH:mm
  quietHoursEnd: string;   // HH:mm
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
  // Flattened reminder settings for simpler Firestore storage
  enabled: boolean;
  time: ReminderTime;
  customTime?: string;
  daysOfWeek: number[];
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

// ===== FAMILY-SPECIFIC TYPES =====

// Family rewards for child-friendly gamification
export type FamilyRewardType = 'sticker' | 'badge' | 'celebration';

export interface FamilyReward {
  id: string;
  type: FamilyRewardType;
  name: string;
  icon: string;
  description?: string;
  unlockedAt?: string;
  memberId: string;
  spaceId: string;
}

// Child-specific achievements (simpler, more encouraging)
export interface ChildAchievement {
  threshold: number;
  name: string;
  icon: string;
  description: string;
  celebrationEmoji: string;
}

export const CHILD_ACHIEVEMENTS: ChildAchievement[] = [
  { threshold: 1, name: 'First Step!', icon: '⭐', description: 'You did your first habit!', celebrationEmoji: '🎉' },
  { threshold: 3, name: 'Hat Trick!', icon: '🎩', description: '3 habits complete!', celebrationEmoji: '✨' },
  { threshold: 5, name: 'High Five!', icon: '🖐️', description: '5 habits complete!', celebrationEmoji: '🌟' },
  { threshold: 7, name: 'Week Warrior', icon: '🌟', description: 'A whole week of habits!', celebrationEmoji: '🏆' },
  { threshold: 14, name: 'Super Star', icon: '💫', description: '2 weeks strong!', celebrationEmoji: '🎊' },
  { threshold: 21, name: 'Habit Hero', icon: '🦸', description: '3 weeks of awesomeness!', celebrationEmoji: '🥳' },
  { threshold: 30, name: 'Monthly Master', icon: '🏆', description: 'A whole month!', celebrationEmoji: '👑' },
  { threshold: 50, name: 'Golden Streak', icon: '👑', description: '50 habits complete!', celebrationEmoji: '🌈' },
  { threshold: 100, name: 'Legend!', icon: '🌈', description: '100 habits! Amazing!', celebrationEmoji: '🎆' },
];

// Sticker collection for kids
export interface StickerType {
  id: string;
  emoji: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'animals' | 'nature' | 'space' | 'food' | 'sports' | 'magic';
}

export const STICKER_COLLECTION: StickerType[] = [
  // Animals (common)
  { id: 'sticker_dog', emoji: '🐕', name: 'Good Pup', rarity: 'common', category: 'animals' },
  { id: 'sticker_cat', emoji: '🐱', name: 'Cool Cat', rarity: 'common', category: 'animals' },
  { id: 'sticker_bunny', emoji: '🐰', name: 'Hoppy Friend', rarity: 'common', category: 'animals' },
  { id: 'sticker_bear', emoji: '🐻', name: 'Bear Hug', rarity: 'common', category: 'animals' },

  // Nature (common/rare)
  { id: 'sticker_flower', emoji: '🌸', name: 'Bloom', rarity: 'common', category: 'nature' },
  { id: 'sticker_tree', emoji: '🌳', name: 'Tree Friend', rarity: 'common', category: 'nature' },
  { id: 'sticker_rainbow', emoji: '🌈', name: 'Rainbow', rarity: 'rare', category: 'nature' },
  { id: 'sticker_butterfly', emoji: '🦋', name: 'Flutter', rarity: 'rare', category: 'nature' },

  // Space (rare/epic)
  { id: 'sticker_star', emoji: '⭐', name: 'Shiny Star', rarity: 'rare', category: 'space' },
  { id: 'sticker_moon', emoji: '🌙', name: 'Sleepy Moon', rarity: 'rare', category: 'space' },
  { id: 'sticker_rocket', emoji: '🚀', name: 'Rocket', rarity: 'epic', category: 'space' },
  { id: 'sticker_ufo', emoji: '🛸', name: 'Alien Friend', rarity: 'epic', category: 'space' },

  // Food (common/rare)
  { id: 'sticker_pizza', emoji: '🍕', name: 'Pizza Party', rarity: 'common', category: 'food' },
  { id: 'sticker_icecream', emoji: '🍦', name: 'Sweet Treat', rarity: 'common', category: 'food' },
  { id: 'sticker_cake', emoji: '🎂', name: 'Celebration Cake', rarity: 'rare', category: 'food' },

  // Sports (rare/epic)
  { id: 'sticker_trophy', emoji: '🏆', name: 'Champion', rarity: 'rare', category: 'sports' },
  { id: 'sticker_medal', emoji: '🥇', name: 'Gold Medal', rarity: 'epic', category: 'sports' },
  { id: 'sticker_soccer', emoji: '⚽', name: 'Goal!', rarity: 'common', category: 'sports' },

  // Magic (epic/legendary)
  { id: 'sticker_sparkles', emoji: '✨', name: 'Magic Sparkles', rarity: 'epic', category: 'magic' },
  { id: 'sticker_crystal', emoji: '💎', name: 'Crystal Power', rarity: 'epic', category: 'magic' },
  { id: 'sticker_unicorn', emoji: '🦄', name: 'Unicorn', rarity: 'legendary', category: 'magic' },
  { id: 'sticker_dragon', emoji: '🐉', name: 'Dragon', rarity: 'legendary', category: 'magic' },
];

// Member sticker collection (stored in Firestore)
export interface MemberStickerCollection {
  memberId: string;
  spaceId: string;
  stickers: {
    stickerId: string;
    count: number;
    firstEarnedAt: string;
    lastEarnedAt: string;
  }[];
  totalStickers: number;
  updatedAt: string;
}

// Family Challenge types
export type FamilyChallengeType = 'streak' | 'completion' | 'participation';
export type FamilyChallengeStatus = 'active' | 'completed' | 'failed' | 'expired';

export interface FamilyChallenge {
  id: string;
  spaceId: string;
  title: string;
  description: string;
  emoji: string;
  challengeType: FamilyChallengeType;
  targetCompletions: number;
  currentProgress: number;
  participantProgress: Record<string, number>; // memberId -> completions
  reward?: string;
  rewardStickerId?: string; // Optional sticker reward for completing
  startDate: string;
  endDate?: string;
  status: FamilyChallengeStatus;
  createdBy: string;
  createdAt: string;
  completedAt?: string;
}

// Pre-made family challenge templates
export interface FamilyChallengeTemplate {
  id: string;
  title: string;
  description: string;
  emoji: string;
  challengeType: FamilyChallengeType;
  defaultTarget: number;
  defaultDuration: number; // in days
  suggestedReward?: string;
}

export const FAMILY_CHALLENGE_TEMPLATES: FamilyChallengeTemplate[] = [
  {
    id: 'challenge_week_streak',
    title: 'Week Warriors',
    description: 'Everyone maintains their streak for a full week',
    emoji: '🔥',
    challengeType: 'streak',
    defaultTarget: 7,
    defaultDuration: 7,
    suggestedReward: 'Family movie night!',
  },
  {
    id: 'challenge_100_club',
    title: '100 Club',
    description: 'Complete 100 habits as a family',
    emoji: '💯',
    challengeType: 'completion',
    defaultTarget: 100,
    defaultDuration: 14,
    suggestedReward: 'Pizza party!',
  },
  {
    id: 'challenge_all_together',
    title: 'All Together Now',
    description: 'Every family member completes their habits today',
    emoji: '👨‍👩‍👧‍👦',
    challengeType: 'participation',
    defaultTarget: 1,
    defaultDuration: 1,
    suggestedReward: 'Ice cream treats!',
  },
  {
    id: 'challenge_morning_masters',
    title: 'Morning Masters',
    description: 'Complete all morning habits for 5 days',
    emoji: '🌅',
    challengeType: 'streak',
    defaultTarget: 5,
    defaultDuration: 5,
    suggestedReward: 'Sleep in on Saturday!',
  },
  {
    id: 'challenge_perfect_week',
    title: 'Perfect Week',
    description: 'Complete every assigned habit this week',
    emoji: '🌟',
    challengeType: 'completion',
    defaultTarget: 50,
    defaultDuration: 7,
    suggestedReward: 'Game night!',
  },
];
