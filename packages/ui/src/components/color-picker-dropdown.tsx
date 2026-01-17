'use client';

import { cn } from '../lib/utils';
import {
  LIGHT_ENTRY_COLORS,
  DARK_ENTRY_COLORS,
  DEFAULT_ENTRY_COLOR,
} from '../constants/entry-colors';
import type { EntryColor } from '@ainexsuite/types';

export interface ColorPickerDropdownProps {
  selectedColor: EntryColor;
  onColorChange: (color: EntryColor) => void;
  onClose?: () => void;
}

// Dot colors for the picker (matches notes app tailwind.config.ts colors)
const colorDots: Record<string, string> = {
  // Light colors - pastel shades matching notes app
  'entry-lemon': 'bg-yellow-200',      // Sunshine: #FFFED2
  'entry-tangerine': 'bg-amber-200',   // Apricot: #FFE7BA
  'entry-fog': 'bg-blue-100',          // Cloud: #E3F0FF (light blue, not gray!)
  'entry-blush': 'bg-pink-200',        // Rose: #FCE6EF
  'entry-moss': 'bg-emerald-200',      // Sage: #E8FAD9
  'entry-cream': 'bg-amber-50',        // Ivory: #FFFDF7 (cream/off-white)
  // Dark colors - rich shades matching notes app
  'entry-coal': 'bg-zinc-700',         // Graphite: #2B2B2B
  'entry-leather': 'bg-amber-900',     // Espresso: #4A3728
  'entry-midnight': 'bg-neutral-900',  // Midnight: #171717
  'entry-lavender': 'bg-purple-700',   // Plum: #6B4A8C
  'entry-sky': 'bg-blue-700',          // Ocean: #2A5A8C
  'entry-slate': 'bg-pink-700',         // Blush: dark pink
};

function getColorDot(colorId: string): string {
  return colorDots[colorId] || 'bg-zinc-400';
}

export function ColorPickerDropdown({
  selectedColor,
  onColorChange,
  onClose,
}: ColorPickerDropdownProps) {
  const handleColorSelect = (color: EntryColor) => {
    onColorChange(color);
    onClose?.();
  };

  return (
    <div className="flex flex-col rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-2 shadow-2xl min-w-[280px]">
      {/* Default - full width at top */}
      <button
        type="button"
        onClick={() => handleColorSelect('default')}
        className={cn(
          'flex items-center gap-2 px-2 py-1.5 rounded-xl text-xs font-medium transition w-full mb-2',
          selectedColor === 'default' || !selectedColor
            ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white'
            : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
        )}
      >
        <span className={cn('h-4 w-4 rounded-full flex-shrink-0', DEFAULT_ENTRY_COLOR.swatchClass)} />
        {DEFAULT_ENTRY_COLOR.label}
      </button>

      {/* Light and Dark columns */}
      <div className="flex gap-2">
        {/* Light Colors Column */}
        <div className="flex-1">
          <p className="text-[9px] uppercase font-bold text-zinc-400 dark:text-zinc-500 mb-1 px-1">
            Light
          </p>
          <div className="space-y-0.5">
            {LIGHT_ENTRY_COLORS.filter((c) => c.id !== 'default').map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleColorSelect(c.id as EntryColor)}
                className={cn(
                  'flex items-center gap-2 px-2 py-1 rounded-xl text-xs font-medium transition w-full',
                  selectedColor === c.id
                    ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white'
                    : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                )}
              >
                <span className={cn('h-3.5 w-3.5 rounded-full flex-shrink-0', getColorDot(c.id))} />
                {c.label}
              </button>
            ))}
          </div>
        </div>
        {/* Dark Colors Column */}
        <div className="flex-1">
          <p className="text-[9px] uppercase font-bold text-zinc-400 dark:text-zinc-500 mb-1 px-1">
            Dark
          </p>
          <div className="space-y-0.5">
            {DARK_ENTRY_COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleColorSelect(c.id as EntryColor)}
                className={cn(
                  'flex items-center gap-2 px-2 py-1 rounded-xl text-xs font-medium transition w-full',
                  selectedColor === c.id
                    ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white'
                    : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                )}
              >
                <span className={cn('h-3.5 w-3.5 rounded-full flex-shrink-0', getColorDot(c.id))} />
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
