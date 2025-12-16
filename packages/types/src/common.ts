/**
 * Common types used across all AINexSuite apps
 */

export type Timestamp = number;

export interface BaseDocument {
  id: string;
  ownerId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type FontFamily = 'plus-jakarta-sans' | 'inter' | 'geist' | 'dm-sans' | 'system';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  accentColor?: string;
  fontFamily?: FontFamily;
  fontSize?: 'sm' | 'md' | 'lg';
  density?: 'compact' | 'comfortable' | 'spacious';
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
    digest?: 'none' | 'daily' | 'weekly';
    quietHoursStart?: string;
    quietHoursEnd?: string;
  };
}

export interface ActivityItem {
  id: string;
  userId: string;
  app: 'notes' | 'journey' | 'todo' | 'health' | 'moments' | 'grow' | 'pulse' | 'fit';
  action: 'created' | 'updated' | 'deleted' | 'completed';
  itemId: string;
  itemTitle: string;
  timestamp: Timestamp;
}

export interface AppInfo {
  name: string;
  displayName: string;
  description: string;
  icon: string;
  url: string;
  color: string;
}

export type NoteColor =
  | 'default'
  | 'note-white'
  | 'note-lemon'
  | 'note-mint'
  | 'note-sky'
  | 'note-lavender'
  | 'note-pink'
  | 'note-coral';

export type NotePattern = 'none' | 'dots' | 'lines' | 'grid';

export type MoodType =
  | 'happy'
  | 'sad'
  | 'neutral'
  | 'excited'
  | 'anxious'
  | 'grateful'
  | 'angry'
  | 'peaceful'
  | 'stressed'
  | 'hopeful'
  | 'tired'
  | 'energetic'
  | 'confused'
  | 'confident'
  | 'lonely'
  | 'loved'
  | 'frustrated'
  | 'inspired'
  | 'bored'
  | 'content';

export type Priority = 'urgent' | 'high' | 'medium' | 'low' | 'none';

export type HabitFrequency = 'daily' | 'weekly' | 'custom';

export type HabitType = 'boolean' | 'numeric' | 'scale';

export type ExerciseCategory = 'strength' | 'cardio' | 'flexibility';

// Shared entry color system for consistent styling across apps
export type EntryColor =
  | 'default'
  | 'entry-white'
  | 'entry-lemon'
  | 'entry-peach'
  | 'entry-tangerine'
  | 'entry-mint'
  | 'entry-fog'
  | 'entry-lavender'
  | 'entry-blush'
  | 'entry-sky'
  | 'entry-moss'
  | 'entry-coal';

// Standard fields for entries that can be pinned, archived, and colored
export interface StandardEntryFields {
  pinned?: boolean;
  archived?: boolean;
  color?: EntryColor;
}
