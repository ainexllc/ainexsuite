/**
 * Display app presets for quick layout configuration
 */

export interface Preset {
  id: string;
  name: string;
  description: string;
  icon: string;
  tiles: string[];
  layoutId: string;
}

export const PRESETS: Record<string, Preset> = {
  morning: {
    id: 'morning',
    name: 'Morning Briefing',
    description: 'Weather, calendar, tasks, and habits to start your day',
    icon: '🌅',
    tiles: ['weather', 'calendar', 'tasks', 'habits'],
    layoutId: 'dashboard',
  },
  productivity: {
    id: 'productivity',
    name: 'Productivity Mode',
    description: 'Tasks, habits, and timer for focused work',
    icon: '💼',
    tiles: ['tasks', 'habits', 'timer', 'calendar'],
    layoutId: 'dashboard',
  },
  focus: {
    id: 'focus',
    name: 'Focus Mode',
    description: 'Minimal distractions with timer and tasks only',
    icon: '🎯',
    tiles: ['timer', 'tasks'],
    layoutId: 'classic',
  },
  health: {
    id: 'health',
    name: 'Health Dashboard',
    description: 'Track your wellness with health, habits, and journal',
    icon: '💚',
    tiles: ['health', 'habits', 'journal'],
    layoutId: 'classic',
  },
  wall: {
    id: 'wall',
    name: 'Wall Display',
    description: 'Perfect for always-on wall or tablet display',
    icon: '🖼️',
    tiles: ['weather', 'calendar'],
    layoutId: 'studio-right',
  },
  command: {
    id: 'command',
    name: 'Command Center',
    description: 'Full dashboard with all key tiles',
    icon: '🚀',
    tiles: ['weather', 'calendar', 'tasks', 'habits', 'health', 'journal'],
    layoutId: 'desktop',
  },
};

export const PRESET_LIST = Object.values(PRESETS);

export const getPresetById = (id: string): Preset | undefined => {
  return PRESETS[id];
};
