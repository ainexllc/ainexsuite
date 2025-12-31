/**
 * Display app presets for quick layout configuration
 */

export interface Preset {
  id: string;
  name: string;
  description: string;
  layoutId: string;
  tiles: string[];
}

export const PRESETS: Preset[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean clock with essential info',
    layoutId: 'classic',
    tiles: ['weather', 'calendar', 'focus'],
  },
  {
    id: 'productivity',
    name: 'Productivity',
    description: 'Focus on tasks and time management',
    layoutId: 'dashboard',
    tiles: ['calendar', 'focus', 'timer', 'spark', 'weather', 'alarm-clock'],
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Full suite of information tiles',
    layoutId: 'dashboard',
    tiles: ['calendar', 'weather', 'focus', 'spark', 'timer', 'market'],
  },
];

export const getPresetById = (id: string): Preset | undefined => {
  return PRESETS.find(preset => preset.id === id);
};
