export type HintId = 'SHARED_WORKFLOWS';

export type HintPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface HintConfig {
  id: HintId;
  title: string;
  description: string;
  placement: HintPlacement;
}

export const HINTS: Record<HintId, HintConfig> = {
  SHARED_WORKFLOWS: {
    id: 'SHARED_WORKFLOWS',
    title: 'Team Automations',
    description: 'Select a team space to share workflows with others.',
    placement: 'bottom',
  },
};
