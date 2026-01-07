// Widget size preset system for freeform layout
// 1 unit = 20px (fixed on all screens)
// Tiny=100×80px, Small=160×120px, Medium=240×200px, Large=360×280px

export type WidgetSizePreset = 'tiny' | 'small' | 'medium' | 'large' | 'xl';

export interface SizePresetConfig {
  label: string;
  w: number;    // Width in grid units (1 unit = 20px)
  h: number;    // Height in grid units (1 unit = 20px)
}

// Size presets - same for all widgets (in 20px units)
const STANDARD_PRESETS: Record<WidgetSizePreset, SizePresetConfig> = {
  tiny: { label: 'Tiny (100×80)', w: 5, h: 4 },
  small: { label: 'Small (160×120)', w: 8, h: 6 },
  medium: { label: 'Medium (240×200)', w: 12, h: 10 },
  large: { label: 'Large (360×280)', w: 18, h: 14 },
  xl: { label: 'XL (480×400)', w: 24, h: 20 },
};

// All widgets use the same standard presets
export const WIDGET_SIZE_PRESETS: Record<string, Partial<Record<WidgetSizePreset, SizePresetConfig>>> = {
  weather: STANDARD_PRESETS,
  calendar: STANDARD_PRESETS,
  tasks: STANDARD_PRESETS,
  habits: STANDARD_PRESETS,
  journal: STANDARD_PRESETS,
  health: STANDARD_PRESETS,
  timer: STANDARD_PRESETS,
  market: STANDARD_PRESETS,
  focus: STANDARD_PRESETS,
  spark: STANDARD_PRESETS,
  notes: STANDARD_PRESETS,
  'alarm-clock': STANDARD_PRESETS,
  clock: STANDARD_PRESETS,
};

// Get available size presets for a widget type
export function getWidgetSizePresets(widgetType: string): Array<{ key: WidgetSizePreset; config: SizePresetConfig }> {
  const presets = WIDGET_SIZE_PRESETS[widgetType] || {};
  return Object.entries(presets)
    .filter(([, config]) => config !== undefined)
    .map(([key, config]) => ({ key: key as WidgetSizePreset, config: config as SizePresetConfig }));
}

// Find the closest matching preset for current widget dimensions
export function getCurrentSizePreset(widgetType: string, w: number, h: number): WidgetSizePreset | null {
  const presets = WIDGET_SIZE_PRESETS[widgetType];
  if (!presets) return null;

  const area = w * h;
  let closestPreset: WidgetSizePreset | null = null;
  let closestDiff = Infinity;

  for (const [size, config] of Object.entries(presets)) {
    if (!config) continue;
    const presetArea = config.w * config.h;
    const diff = Math.abs(area - presetArea);
    if (diff < closestDiff) {
      closestDiff = diff;
      closestPreset = size as WidgetSizePreset;
    }
  }

  // Only return if close enough (within 20% difference)
  if (closestPreset && closestDiff / area < 0.2) {
    return closestPreset;
  }

  return null;
}

// Get the display name for a widget type
export const WIDGET_DISPLAY_NAMES: Record<string, string> = {
  weather: 'Weather',
  calendar: 'Calendar',
  tasks: 'Tasks',
  habits: 'Habits',
  journal: 'Journal',
  health: 'Health',
  timer: 'Timer',
  market: 'Market',
  focus: 'Focus',
  spark: 'Spark',
  notes: 'Notes',
  'alarm-clock': 'Alarm Clock',
  clock: 'Clock',
};
