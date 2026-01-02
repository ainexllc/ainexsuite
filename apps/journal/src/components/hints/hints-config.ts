export type HintId = 'SHARED_JOURNAL';

export type HintPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface HintConfig {
  id: HintId;
  title: string;
  description: string;
  placement: HintPlacement;
}

export const HINTS: Record<HintId, HintConfig> = {
  SHARED_JOURNAL: {
    id: 'SHARED_JOURNAL',
    title: 'Share Your Journey',
    description: 'Select a family space to share journal entries with your loved ones.',
    placement: 'bottom',
  },
};
