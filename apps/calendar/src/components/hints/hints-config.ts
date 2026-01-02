export type HintId = 'SHARED_EVENTS';

export type HintPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface HintConfig {
  id: HintId;
  title: string;
  description: string;
  placement: HintPlacement;
}

export const HINTS: Record<HintId, HintConfig> = {
  SHARED_EVENTS: {
    id: 'SHARED_EVENTS',
    title: 'Share Events',
    description: 'Select a family or shared space to create events that everyone can see.',
    placement: 'bottom',
  },
};
