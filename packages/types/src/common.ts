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
  app: 'notes' | 'journal' | 'todo' | 'health' | 'album' | 'habits' | 'display' | 'fit';
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

// Reduced set of analytically meaningful emotions based on psychological models
// Covers valence (positive/negative) and arousal (high/low energy) dimensions
// Enables: sentiment analysis, mood trend tracking, mental health pattern detection
export type MoodType =
  | 'happy'      // Positive, moderate energy - general wellbeing
  | 'excited'    // Positive, high energy - enthusiasm, joy
  | 'grateful'   // Positive, reflective - appreciation, thankfulness
  | 'peaceful'   // Positive, low energy - calm, relaxed, content
  | 'neutral'    // Baseline state
  | 'anxious'    // Negative, high energy - worry, stress (key mental health indicator)
  | 'sad'        // Negative, low energy - melancholy, grief
  | 'frustrated' // Negative, action-blocked - irritation, anger
  | 'tired';     // Low energy - fatigue, burnout indicator

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
  | 'entry-coal'
  | 'entry-leather';

// Background overlay options for background images
export type BackgroundOverlay =
  | 'none'      // No overlay
  | 'auto'      // Adaptive based on brightness
  | 'dim'       // Light dark overlay
  | 'dimmer'    // Medium dark overlay
  | 'dimmest'   // Heavy dark overlay
  | 'glass'     // Light frosted glass
  | 'frost'     // Heavy frosted glass
  | 'gradient'; // Dark gradient from bottom

// Standard fields for entries that can be pinned, archived, and colored
export interface StandardEntryFields {
  pinned?: boolean;
  archived?: boolean;
  color?: EntryColor;
  backgroundImage?: string | null;
  backgroundOverlay?: BackgroundOverlay;
  coverImage?: string | null; // ID of a cover image from Firestore (for card covers)
}
