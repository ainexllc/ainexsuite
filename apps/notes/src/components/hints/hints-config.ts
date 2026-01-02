/**
 * Hints configuration for first-time user guidance in Notes app
 * Each hint shows once, then is dismissed and synced to Firestore
 */

export type HintPlacement = 'top' | 'bottom' | 'left' | 'right';

export const HINTS = {
  FIRST_NOTE: {
    id: 'first-note',
    title: 'Create your first note',
    description: 'Tap here to capture your thoughts, ideas, or reminders.',
    placement: 'bottom' as HintPlacement,
  },
  SHARED_NOTES: {
    id: 'shared-notes',
    title: 'Share notes with others',
    description: 'Create a Family or Team space to share notes with others.',
    placement: 'right' as HintPlacement,
  },
  LABELS: {
    id: 'labels',
    title: 'Organize with labels',
    description: 'Use labels to categorize and find your notes easily.',
    placement: 'bottom' as HintPlacement,
  },
  REMINDERS: {
    id: 'reminders',
    title: 'Set reminders',
    description: 'Never forget important notes - set reminders to get notified.',
    placement: 'bottom' as HintPlacement,
  },
} as const;

export type HintId = typeof HINTS[keyof typeof HINTS]['id'];

export interface HintConfig {
  id: HintId;
  title: string;
  description: string;
  placement: HintPlacement;
}

export const ALL_HINT_IDS: HintId[] = Object.values(HINTS).map(h => h.id);
