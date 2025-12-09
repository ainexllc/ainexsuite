'use client';

import { clsx } from 'clsx';
import type { FilterValue } from '@ainexsuite/ui';
import { useLabels } from '@/components/providers/labels-provider';
import type { NoteColor } from '@/lib/types/note';

const NOTE_COLORS: { value: NoteColor; label: string; className: string }[] = [
  { value: 'default', label: 'Default', className: 'bg-background' },
  { value: 'note-white', label: 'White', className: 'bg-[#ffffff]' },
  { value: 'note-lemon', label: 'Lemon', className: 'bg-[#fff9c4]' },
  { value: 'note-peach', label: 'Peach', className: 'bg-[#ffe0b2]' },
  { value: 'note-tangerine', label: 'Tangerine', className: 'bg-[#ffccbc]' },
  { value: 'note-mint', label: 'Mint', className: 'bg-[#c8e6c9]' },
  { value: 'note-fog', label: 'Fog', className: 'bg-[#cfd8dc]' },
  { value: 'note-lavender', label: 'Lavender', className: 'bg-[#d1c4e9]' },
  { value: 'note-blush', label: 'Blush', className: 'bg-[#f8bbd0]' },
  { value: 'note-sky', label: 'Sky', className: 'bg-[#b3e5fc]' },
  { value: 'note-moss', label: 'Moss', className: 'bg-[#dcedc8]' },
  { value: 'note-coal', label: 'Coal', className: 'bg-[#455a64]' },
];

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

  const toggleColor = (color: string) => {
    const currentColors = filters.colors || [];
    const newColors = currentColors.includes(color)
      ? currentColors.filter((c) => c !== color)
      : [...currentColors, color];
    onFiltersChange({ ...filters, colors: newColors });
  };

  return (
    <div className="space-y-4">
      {/* Labels Section */}
      {labels.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Labels</h4>
          <div className="flex flex-wrap gap-2">
            {labels.map((label) => {
              const isSelected = filters.labels?.includes(label.id);
              return (
                <button
                  key={label.id}
                  onClick={() => toggleLabel(label.id)}
                  className={clsx(
                    'px-3 py-1.5 text-sm rounded-full transition-all border',
                    isSelected
                      ? 'bg-[var(--color-primary)] text-foreground border-[var(--color-primary)]'
                      : 'bg-background/50 border-border hover:border-[var(--color-primary)] text-foreground'
                  )}
                >
                  {label.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Colors Section */}
      <div>
        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Colors</h4>
        <div className="grid grid-cols-6 gap-2">
          {NOTE_COLORS.map((color) => {
            const isSelected = filters.colors?.includes(color.value);
            return (
              <button
                key={color.value}
                onClick={() => toggleColor(color.value)}
                title={color.label}
                className={clsx(
                  'w-8 h-8 rounded-full transition-all border-2',
                  color.className,
                  isSelected
                    ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/30'
                    : 'border-transparent hover:border-foreground/20'
                )}
              >
                {isSelected && (
                  <svg className="w-4 h-4 mx-auto text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Date Range Section */}
      <div>
        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Date Range</h4>
        <div className="flex gap-2">
          <input
            type="date"
            value={filters.dateRange?.start?.toISOString().split('T')[0] || ''}
            onChange={(e) => {
              const start = e.target.value ? new Date(e.target.value) : null;
              onFiltersChange({
                ...filters,
                dateRange: { ...filters.dateRange, start, end: filters.dateRange?.end ?? null },
              });
            }}
            className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-background/50 border border-border focus:border-[var(--color-primary)] focus:outline-none"
            placeholder="Start date"
          />
          <span className="text-muted-foreground self-center">to</span>
          <input
            type="date"
            value={filters.dateRange?.end?.toISOString().split('T')[0] || ''}
            onChange={(e) => {
              const end = e.target.value ? new Date(e.target.value) : null;
              onFiltersChange({
                ...filters,
                dateRange: { ...filters.dateRange, start: filters.dateRange?.start ?? null, end },
              });
            }}
            className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-background/50 border border-border focus:border-[var(--color-primary)] focus:outline-none"
            placeholder="End date"
          />
        </div>
      </div>
    </div>
  );
}
