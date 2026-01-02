export type HintId = 'SHARED_PROJECTS';

export type HintPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface HintConfig {
  id: HintId;
  title: string;
  description: string;
  placement: HintPlacement;
}

export const HINTS: Record<HintId, HintConfig> = {
  SHARED_PROJECTS: {
    id: 'SHARED_PROJECTS',
    title: 'Collaborate on Projects',
    description: 'Select a team or family space to collaborate on projects together.',
    placement: 'bottom',
  },
};
