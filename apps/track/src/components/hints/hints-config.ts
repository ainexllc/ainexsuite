/**
 * Hints configuration for first-time user guidance in Track app
 * Each hint shows once, then is dismissed and synced to Firestore
 */

export type HintPlacement = 'top' | 'bottom' | 'left' | 'right';

export const HINTS = {
  FIRST_SUBSCRIPTION: {
    id: 'first-subscription',
    title: 'Track your first subscription',
    description: 'Tap here to add a recurring expense like Netflix or Spotify.',
    placement: 'bottom' as HintPlacement,
  },
  SHARED_NOTES: { // Keep the same ID as in Notes for simplicity if used similarly
    id: 'shared-notes',
    title: 'Share with others',
    description: 'Create a Family or Team space to manage shared subscriptions.',
    placement: 'right' as HintPlacement,
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
