'use client';

import { clsx } from 'clsx';
import { Calendar, FileText } from 'lucide-react';
import type { FilterValue, QuickDatePreset, DateRangeField, SortConfig } from '@ainexsuite/ui';
import { ENTRY_COLOR_SWATCHES } from '@ainexsuite/ui';
import type { MoodType } from '@ainexsuite/types';
import { getMoodIcon, getMoodLabel } from '@/lib/utils/mood';

// Extended filter value for Journal entries
export interface JournalFilterValue extends FilterValue {
  moods?: MoodType[];
  tags?: string[];
}

const QUICK_DATE_PRESETS: { value: QuickDatePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'this-week', label: 'This Week' },
  { value: 'last-7-days', label: 'Last 7 Days' },
  { value: 'this-month', label: 'This Month' },
  { value: 'last-30-days', label: 'Last 30 Days' },
];

const DATE_FIELD_OPTIONS: { value: DateRangeField; label: string }[] = [
  { value: 'createdAt', label: 'Created Date' },
  { value: 'updatedAt', label: 'Modified Date' },
];

const MOOD_OPTIONS: MoodType[] = [
  'happy',
  'excited',
  'grateful',
  'peaceful',
  'neutral',
  'anxious',
  'sad',
  'angry',
  'stressed',
  'tired',
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

interface JournalFilterContentProps {
  filters: JournalFilterValue;
  onFiltersChange: (filters: JournalFilterValue) => void;
  sort?: SortConfig;
  availableTags?: string[];
}

export function JournalFilterContent({
  filters,
  onFiltersChange,
  availableTags = [],
}: JournalFilterContentProps) {
  const toggleMood = (mood: MoodType) => {
    const currentMoods = filters.moods || [];
    const newMoods = currentMoods.includes(mood)
      ? currentMoods.filter((m) => m !== mood)
      : [...currentMoods, mood];
    onFiltersChange({ ...filters, moods: newMoods });
  };

  const toggleTag = (tag: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];
    onFiltersChange({ ...filters, tags: newTags });
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

  const setDateField = (dateField: DateRangeField) => {
    onFiltersChange({ ...filters, dateField });
  };

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

      {/* Mood Filter */}
      <div>
        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" />
          Mood
        </h4>
        <div className="flex flex-wrap gap-2">
          {MOOD_OPTIONS.map((mood) => {
            const isSelected = filters.moods?.includes(mood);
            const Icon = getMoodIcon(mood);
            return (
              <button
                key={mood}
                onClick={() => toggleMood(mood)}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full transition-all border',
                  isSelected
                    ? 'bg-primary/20 text-primary border-primary/30'
                    : 'bg-background/50 border-border hover:border-primary/30 text-muted-foreground hover:text-primary'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {getMoodLabel(mood)}
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

      {/* Tags Section */}
      {availableTags.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Tags</h4>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => {
              const isSelected = filters.tags?.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={clsx(
                    'px-3 py-1.5 text-sm rounded-full transition-all border',
                    isSelected
                      ? 'bg-white/10 text-white border-white/20 shadow-sm backdrop-blur-sm'
                      : 'bg-background/50 border-border hover:border-white/20 text-muted-foreground hover:text-white'
                  )}
                >
                  {tag}
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
          {ENTRY_COLOR_SWATCHES.map((color) => {
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
    </div>
  );
}
