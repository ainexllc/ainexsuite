'use client';

import { cn } from '../../lib/utils';
import type { PresetButtonsProps, RangePresetButtonsProps } from './types';

/**
 * Preset buttons for single date selection
 */
export function PresetButtons({ presets, onSelect, className }: PresetButtonsProps) {
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {presets.map((preset) => (
        <button
          key={preset.label}
          type="button"
          onClick={() => onSelect(preset.getValue())}
          className={cn(
            'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
            'bg-foreground/5 text-foreground/80',
            'hover:bg-[var(--color-primary)]/20 hover:text-[var(--color-primary)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50'
          )}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Preset buttons for date range selection
 */
export function RangePresetButtons({ presets, onSelect, className }: RangePresetButtonsProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {presets.map((preset) => (
        <button
          key={preset.label}
          type="button"
          onClick={() => onSelect(preset.getValue())}
          className={cn(
            'px-3 py-2 text-sm font-medium rounded-lg transition-colors text-left',
            'bg-foreground/5 text-foreground/80',
            'hover:bg-[var(--color-primary)]/20 hover:text-[var(--color-primary)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50'
          )}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
