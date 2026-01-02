export type HintId = 'SHARED_TODOS';

export type HintPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface HintConfig {
  id: HintId;
  title: string;
  description: string;
  placement: HintPlacement;
}

export const HINTS: Record<HintId, HintConfig> = {
  SHARED_TODOS: {
    id: 'SHARED_TODOS',
    title: 'Collaborate on Tasks',
    description: 'Select a family or team space to share tasks and track progress together.',
    placement: 'bottom',
  },
};
