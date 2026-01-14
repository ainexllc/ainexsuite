'use client';

import { clsx } from 'clsx';
import { FileText, CheckSquare, LayoutList, Check } from 'lucide-react';
import type { FilterValue, QuickDatePreset, NoteTypeFilter } from '@ainexsuite/ui';
import { useLabels } from '@/components/providers/labels-provider';
import { NOTE_COLORS } from '@/lib/constants/note-colors';
import type { NoteColor, Label } from '@/lib/types/note';

// Simplified date presets
const DATE_PRESETS: { value: QuickDatePreset | null; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'this-week', label: 'Week' },
  { value: 'this-month', label: 'Month' },
  { value: null, label: 'All Time' },
];

const NOTE_TYPE_OPTIONS: { value: NoteTypeFilter; label: string; icon: typeof FileText }[] = [
  { value: 'all', label: 'All', icon: LayoutList },
  { value: 'text', label: 'Text', icon: FileText },
  { value: 'checklist', label: 'Checklist', icon: CheckSquare },
];

function getDateRangeFromPreset(preset: QuickDatePreset): { start: Date; end: Date } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case 'today':
      return {
        start: today,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
      };
    case 'this-week': {
      const dayOfWeek = today.getDay();
      const startOfWeek = new Date(today.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
      return { start: startOfWeek, end: now };
    }
    case 'this-month': {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: startOfMonth, end: now };
    }
    default:
      return { start: today, end: now };
  }
}

// Sub-components
function NoteTypeSegment({
  value,
  onChange,
}: {
  value: NoteTypeFilter;
  onChange: (v: NoteTypeFilter) => void;
}) {
  return (
    <div className="flex bg-zinc-100/80 dark:bg-zinc-800/80 rounded-lg p-0.5">
      {NOTE_TYPE_OPTIONS.map((option) => {
        const Icon = option.icon;
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={clsx(
              'flex-1 flex items-center justify-center gap-1.5 h-7 text-xs font-medium rounded-md transition-all',
              isSelected
                ? 'bg-[var(--color-primary)] text-white shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
            )}
          >
            <Icon className="w-3 h-3" />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-[10px] font-semibold uppercase text-zinc-400 dark:text-zinc-500 tracking-wider mb-2">
        {title}
      </h4>
      {children}
    </div>
  );
}

function LabelsChips({
  labels,
  selected,
  onToggle,
}: {
  labels: Label[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {labels.map((label) => {
        const isSelected = selected.includes(label.id);
        return (
          <button
            key={label.id}
            onClick={() => onToggle(label.id)}
            className={clsx(
              'px-2.5 py-1 text-xs rounded-full transition-all',
              isSelected
                ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)] ring-1 ring-[var(--color-primary)]/30'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
            )}
          >
            {label.name}
          </button>
        );
      })}
    </div>
  );
}

function ColorGrid({
  selected,
  onToggle,
}: {
  selected: NoteColor[];
  onToggle: (color: NoteColor) => void;
}) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {NOTE_COLORS.map((color) => {
        const isSelected = selected.includes(color.id);
        return (
          <button
            key={color.id}
            onClick={() => onToggle(color.id)}
            title={color.label}
            className={clsx(
              'w-7 h-7 rounded-full transition-all flex items-center justify-center',
              color.swatchClass,
              isSelected
                ? 'ring-2 ring-[var(--color-primary)] ring-offset-1 ring-offset-white dark:ring-offset-zinc-900 scale-110'
                : 'hover:scale-110'
            )}
          >
            {isSelected && (
              <Check
                className={clsx(
                  'w-3.5 h-3.5',
                  color.id === 'note-coal' ? 'text-zinc-400' : 'text-zinc-600 dark:text-zinc-300'
                )}
                strokeWidth={3}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

function DatePresetPills({
  value,
  onSelect,
}: {
  value?: QuickDatePreset | null;
  onSelect: (preset: QuickDatePreset | null) => void;
}) {
  return (
    <div className="flex gap-1.5">
      {DATE_PRESETS.map((preset) => {
        const isSelected = value === preset.value || (!value && preset.value === null);
        return (
          <button
            key={preset.value ?? 'all'}
            onClick={() => onSelect(preset.value)}
            className={clsx(
              'flex-1 px-2 py-1.5 text-xs rounded-lg transition-all',
              isSelected
                ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)] ring-1 ring-[var(--color-primary)]/30'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
            )}
          >
            {preset.label}
          </button>
        );
      })}
    </div>
  );
}

interface NoteFilterContentProps {
  filters: FilterValue;
  onFiltersChange: (filters: FilterValue) => void;
}

export function NoteFilterContent({ filters, onFiltersChange }: NoteFilterContentProps) {
  const { labels } = useLabels();

  const toggleLabel = (labelId: string) => {
    const currentLabels = filters.labels || [];
    const newLabels = currentLabels.includes(labelId)
      ? currentLabels.filter((id) => id !== labelId)
      : [...currentLabels, labelId];
    onFiltersChange({ ...filters, labels: newLabels });
  };

  const toggleColor = (color: NoteColor) => {
    const currentColors = (filters.colors || []) as NoteColor[];
    const newColors = currentColors.includes(color)
      ? currentColors.filter((c) => c !== color)
      : [...currentColors, color];
    onFiltersChange({ ...filters, colors: newColors });
  };

  const selectDatePreset = (preset: QuickDatePreset | null) => {
    if (preset === null) {
      // Clear date filter
      onFiltersChange({
        ...filters,
        datePreset: undefined,
        dateRange: { start: null, end: null },
      });
    } else {
      const { start, end } = getDateRangeFromPreset(preset);
      onFiltersChange({
        ...filters,
        datePreset: preset,
        dateRange: { start, end },
      });
    }
  };

  const setNoteType = (noteType: NoteTypeFilter) => {
    onFiltersChange({ ...filters, noteType });
  };

  return (
    <div className="space-y-4">
      {/* Note Type - Segmented Control */}
      <NoteTypeSegment value={filters.noteType || 'all'} onChange={setNoteType} />

      {/* Labels - Compact Chips (conditional) */}
      {labels.length > 0 && (
        <FilterSection title="Labels">
          <LabelsChips labels={labels} selected={filters.labels || []} onToggle={toggleLabel} />
        </FilterSection>
      )}

      {/* Colors - 6x2 Grid */}
      <FilterSection title="Colors">
        <ColorGrid selected={(filters.colors || []) as NoteColor[]} onToggle={toggleColor} />
      </FilterSection>

      {/* Date Presets */}
      <FilterSection title="Date">
        <DatePresetPills value={filters.datePreset} onSelect={selectDatePreset} />
      </FilterSection>
    </div>
  );
}
