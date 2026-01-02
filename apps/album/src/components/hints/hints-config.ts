export type HintId = 'SHARED_MOMENTS';

export type HintPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface HintConfig {
  id: HintId;
  title: string;
  description: string;
  placement: HintPlacement;
}

export const HINTS: Record<HintId, HintConfig> = {
  SHARED_MOMENTS: {
    id: 'SHARED_MOMENTS',
    title: 'Share Memories',
    description: 'Select a family space to share your photos and moments with loved ones.',
    placement: 'bottom',
  },
};
