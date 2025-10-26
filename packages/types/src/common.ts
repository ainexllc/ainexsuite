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

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
}

export interface ActivityItem {
  id: string;
  userId: string;
  app: 'notes' | 'journey' | 'todo' | 'track' | 'moments' | 'grow' | 'pulse' | 'fit';
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

export type MoodType = 'happy' | 'sad' | 'calm' | 'energetic' | 'stressed';

export type Priority = 'high' | 'medium' | 'low';

export type HabitFrequency = 'daily' | 'weekly' | 'custom';

export type HabitType = 'boolean' | 'numeric' | 'scale';

export type ExerciseCategory = 'strength' | 'cardio' | 'flexibility';
