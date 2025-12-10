'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import {
  Calendar,
  FileText,
  CheckSquare,
  Bookmark,
  Trash2,
  Save,
} from 'lucide-react';
import type {
  FilterValue,
  QuickDatePreset,
  NoteTypeFilter,
  DateRangeField,
  SortConfig,
} from '@ainexsuite/ui';
import { useLabels } from '@/components/providers/labels-provider';
import { useFilterPresets } from '@/components/providers/filter-presets-provider';
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

const QUICK_DATE_PRESETS: { value: QuickDatePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'this-week', label: 'This Week' },
  { value: 'last-7-days', label: 'Last 7 Days' },
  { value: 'this-month', label: 'This Month' },
  { value: 'last-30-days', label: 'Last 30 Days' },
];

const NOTE_TYPE_OPTIONS: { value: NoteTypeFilter; label: string; icon: typeof FileText }[] = [
  { value: 'all', label: 'All', icon: FileText },
  { value: 'text', label: 'Text', icon: FileText },
  { value: 'checklist', label: 'Checklist', icon: CheckSquare },
];

const DATE_FIELD_OPTIONS: { value: DateRangeField; label: string }[] = [
  { value: 'createdAt', label: 'Created Date' },
  { value: 'updatedAt', label: 'Modified Date' },
  { value: 'noteDate', label: 'Note Date' },
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
    case 'yesterday': {
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      return {
        start: yesterday,
        end: new Date(today.getTime() - 1),
      };
    }
    case 'this-week': {
      const dayOfWeek = today.getDay();
      const startOfWeek = new Date(today.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
      return {
        start: startOfWeek,
        end: new Date(now.getTime()),
      };
    }
    case 'last-7-days': {
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return {
        start: sevenDaysAgo,
        end: new Date(now.getTime()),
      };
    }
    case 'this-month': {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        start: startOfMonth,
        end: new Date(now.getTime()),
      };
    }
    case 'last-30-days': {
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      return {
        start: thirtyDaysAgo,
        end: new Date(now.getTime()),
      };
    }
    case 'custom':
    default:
      return { start: today, end: now };
  }
}

interface NoteFilterContentProps {
  filters: FilterValue;
  onFiltersChange: (filters: FilterValue) => void;
  sort?: SortConfig;
}

export function NoteFilterContent({ filters, onFiltersChange, sort }: NoteFilterContentProps) {
  const { labels } = useLabels();
  const { presets, createPreset, deletePreset } = useFilterPresets();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [presetName, setPresetName] = useState('');

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

  const selectDatePreset = (preset: QuickDatePreset) => {
    if (preset === 'custom') {
      onFiltersChange({
        ...filters,
        datePreset: 'custom',
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

  const setDateField = (dateField: DateRangeField) => {
    onFiltersChange({ ...filters, dateField });
  };

  const applyPreset = (presetId: string) => {
    const preset = presets.find((p) => p.id === presetId);
    if (preset) {
      onFiltersChange(preset.filters);
    }
  };

  const handleSavePreset = async () => {
    if (!presetName.trim()) return;
    await createPreset(presetName.trim(), filters, sort);
    setPresetName('');
    setShowSaveDialog(false);
  };

  const handleDeletePreset = async (presetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deletePreset(presetId);
  };

  const hasActiveFilters =
    (filters.labels && filters.labels.length > 0) ||
    (filters.colors && filters.colors.length > 0) ||
    filters.dateRange?.start ||
    filters.dateRange?.end ||
    (filters.noteType && filters.noteType !== 'all');

  return (
    <div className="space-y-5">
      {/* Quick Date Presets */}
      <div>
        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          Quick Date Filters
        </h4>
        <div className="flex flex-wrap gap-2">
          {QUICK_DATE_PRESETS.map((preset) => {
            const isSelected = filters.datePreset === preset.value;
            return (
              <button
                key={preset.value}
                onClick={() => selectDatePreset(preset.value)}
                className={clsx(
                  'px-3 py-1.5 text-xs rounded-full transition-all border',
                  isSelected
                    ? 'bg-primary/20 text-primary border-primary/30'
                    : 'bg-background/50 border-border hover:border-primary/30 text-muted-foreground hover:text-primary'
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Note Type Filter */}
      <div>
        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" />
          Note Type
        </h4>
        <div className="flex gap-2">
          {NOTE_TYPE_OPTIONS.map((option) => {
            const isSelected = (filters.noteType || 'all') === option.value;
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => setNoteType(option.value)}
                className={clsx(
                  'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-lg transition-all border',
                  isSelected
                    ? 'bg-primary/20 text-primary border-primary/30'
                    : 'bg-background/50 border-border hover:border-primary/30 text-muted-foreground hover:text-primary'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Date Field Selector */}
      <div>
        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Filter By Date</h4>
        <div className="flex gap-2 flex-wrap">
          {DATE_FIELD_OPTIONS.map((option) => {
            const isSelected = (filters.dateField || 'createdAt') === option.value;
            return (
              <button
                key={option.value}
                onClick={() => setDateField(option.value)}
                className={clsx(
                  'px-3 py-1.5 text-xs rounded-full transition-all border',
                  isSelected
                    ? 'bg-teal-500/20 text-teal-400 border-teal-500/30'
                    : 'bg-background/50 border-border hover:border-teal-500/30 text-muted-foreground hover:text-teal-400'
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

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
                      ? 'bg-white/10 text-white border-white/20 shadow-sm backdrop-blur-sm'
                      : 'bg-background/50 border-border hover:border-white/20 text-muted-foreground hover:text-white'
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
                    ? 'border-white ring-2 ring-white/20'
                    : 'border-transparent hover:border-white/20'
                )}
              >
                {isSelected && (
                  <svg className="w-4 h-4 mx-auto text-black/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Date Range Section */}
      <div>
        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Custom Date Range</h4>
        <div className="flex gap-2">
          <input
            type="date"
            value={filters.dateRange?.start?.toISOString().split('T')[0] || ''}
            onChange={(e) => {
              const start = e.target.value ? new Date(e.target.value) : null;
              onFiltersChange({
                ...filters,
                datePreset: 'custom',
                dateRange: { ...filters.dateRange, start, end: filters.dateRange?.end ?? null },
              });
            }}
            className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-white/5 border border-white/10 focus:border-white/20 focus:outline-none text-foreground placeholder:text-muted-foreground transition-colors"
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
                datePreset: 'custom',
                dateRange: { ...filters.dateRange, start: filters.dateRange?.start ?? null, end },
              });
            }}
            className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-white/5 border border-white/10 focus:border-white/20 focus:outline-none text-foreground placeholder:text-muted-foreground transition-colors"
            placeholder="End date"
          />
        </div>
      </div>

      {/* Saved Presets Section */}
      {(presets.length > 0 || hasActiveFilters) && (
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5" />
              Saved Presets
            </h4>
            {hasActiveFilters && !showSaveDialog && (
              <button
                onClick={() => setShowSaveDialog(true)}
                className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
              >
                <Save className="w-3 h-3" />
                Save Current
              </button>
            )}
          </div>

          {showSaveDialog && (
            <div className="mb-3 p-3 rounded-lg bg-surface-elevated border border-border">
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Preset name..."
                className="w-full px-3 py-1.5 text-sm rounded bg-background border border-border focus:border-primary focus:outline-none mb-2"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSavePreset}
                  disabled={!presetName.trim()}
                  className="flex-1 px-3 py-1.5 text-xs rounded bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowSaveDialog(false);
                    setPresetName('');
                  }}
                  className="px-3 py-1.5 text-xs rounded bg-surface-hover text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {presets.length > 0 && (
            <div className="space-y-1">
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-surface-elevated/50 hover:bg-surface-elevated transition-colors group"
                >
                  <button
                    onClick={() => applyPreset(preset.id)}
                    className="flex-1 text-left text-sm text-foreground hover:text-primary transition-colors"
                  >
                    {preset.name}
                  </button>
                  <button
                    onClick={(e) => handleDeletePreset(preset.id, e)}
                    className="p-1 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all"
                    title="Delete preset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {presets.length === 0 && !showSaveDialog && (
            <p className="text-xs text-muted-foreground italic">
              No saved presets yet. Apply filters and save them for quick access.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
