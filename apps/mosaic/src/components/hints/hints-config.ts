export type HintId = 'SHARED_DISPLAY';

export type HintPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface HintConfig {
  id: HintId;
  title: string;
  description: string;
  placement: HintPlacement;
}

export const HINTS: Record<HintId, HintConfig> = {
  SHARED_DISPLAY: {
    id: 'SHARED_DISPLAY',
    title: 'Family Dashboard',
    description: 'Select a family space to share your display with others.',
    placement: 'bottom',
  },
};
