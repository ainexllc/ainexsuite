export type HintId = 'SHARED_HEALTH';

export type HintPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface HintConfig {
  id: HintId;
  title: string;
  description: string;
  placement: HintPlacement;
}

export const HINTS: Record<HintId, HintConfig> = {
  SHARED_HEALTH: {
    id: 'SHARED_HEALTH',
    title: 'Track Health Together',
    description: 'Select a family space to share health check-ins with your loved ones.',
    placement: 'bottom',
  },
};
