/**
 * Common types used across all AINexSpace apps
 */

export type Timestamp = number;

export interface BaseDocument {
  id: string;
  ownerId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Personal space ID constant - used for content that belongs to the user's personal space.
 * Personal space is virtual (not stored in Firestore) but content uses this ID.
 */
export const PERSONAL_SPACE_ID = 'personal';

/**
 * Standard fields for space-aware content.
 * All content items should include these fields for consistent space filtering.
 *
 * @example
 * ```typescript
 * interface Note extends SpaceAwareDocument {
 *   title: string;
 *   content: string;
 * }
 * ```
 */
export interface SpaceAwareDocument extends BaseDocument {
  /**
   * The space this content belongs to.
   * - 'personal' for personal/private content (virtual space, not in Firestore)
   * - Actual spaceId for shared spaces
   * - Should NEVER be undefined/null in new content
   */
  spaceId: string;

  /**
   * User IDs who can access this content (for shared spaces).
   * Populated from space.memberUids when content is created or spaceId changes.
   * Empty array or undefined for personal content.
   */
  sharedWithUserIds?: string[];
}

/**
 * Check if a spaceId represents personal content.
 * Handles legacy content that may have undefined/null spaceId.
 */
export function isPersonalSpace(spaceId: string | undefined | null): boolean {
  return !spaceId || spaceId === PERSONAL_SPACE_ID || spaceId.endsWith('_personal');
}

/**
 * Get the effective spaceId for creating new content.
 * Ensures we never store undefined/null, always explicit ID.
 */
export function getEffectiveSpaceId(spaceId: string | undefined | null): string {
  return spaceId && spaceId !== PERSONAL_SPACE_ID ? spaceId : PERSONAL_SPACE_ID;
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
  app: 'notes' | 'journal' | 'todo' | 'health' | 'album' | 'habits' | 'hub' | 'fit';
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
// Light: Sunshine, Apricot, Cloud, Rose, Sage, Ivory
// Dark: Graphite, Espresso, Midnight, Plum, Ocean, Stone
export type EntryColor =
  | 'default'
  | 'entry-lemon'      // Sunshine
  | 'entry-tangerine'  // Apricot
  | 'entry-fog'        // Cloud
  | 'entry-blush'      // Rose
  | 'entry-moss'       // Sage
  | 'entry-cream'      // Ivory
  | 'entry-coal'       // Graphite
  | 'entry-leather'    // Espresso
  | 'entry-midnight'   // Midnight
  | 'entry-lavender'   // Plum
  | 'entry-sky'        // Ocean
  | 'entry-slate';     // Stone

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

// ============ Checklist Types ============

/**
 * Priority level for checklist items
 */
export type ChecklistItemPriority = 'high' | 'medium' | 'low' | null;

/**
 * A single item in a checklist/task list
 * Used by Notes (checklists) and Todo (subtasks/items)
 */
export interface ChecklistItem {
  /** Unique identifier for the item */
  id: string;
  /** The text content of the item */
  text: string;
  /** Whether the item is completed */
  completed: boolean;
  /** Indentation level (0-3) for nested items */
  indent?: number;
  /** When true, child items are hidden */
  collapsed?: boolean;
  /** Optional due date (ISO string) */
  dueDate?: string | null;
  /** Optional priority level */
  priority?: ChecklistItemPriority;
  /** Optional notes/description for the item */
  notes?: string | null;
  /** UI state - whether notes section is expanded */
  notesExpanded?: boolean;
  /** Timestamp when completed (for sorting completed items) */
  completedAt?: number | null;
}
