/**
 * Hints configuration for first-time user guidance
 * Each hint shows once, then is dismissed and synced to Firestore
 */

export type HintPlacement = 'top' | 'bottom' | 'left' | 'right';

export const HINTS = {
  FIRST_HABIT: {
    id: 'first-habit',
    title: 'Create your first habit',
    description: 'Tap here to add a habit you want to track daily. Start small!',
    placement: 'bottom' as HintPlacement,
  },
  FAMILY_SPACE: {
    id: 'family-space',
    title: 'Track habits together',
    description: 'Create a Family or Couple space to build habits with others.',
    placement: 'right' as HintPlacement,
  },
  STREAKS: {
    id: 'streaks',
    title: 'Build your streak',
    description: 'Complete habits daily to build streaks and unlock rewards!',
    placement: 'bottom' as HintPlacement,
  },
  QUESTS: {
    id: 'quests',
    title: 'Weekly quests',
    description: 'Complete quests for bonus XP and special achievements.',
    placement: 'left' as HintPlacement,
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
