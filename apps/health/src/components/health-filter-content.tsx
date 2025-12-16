'use client';

import { clsx } from 'clsx';
import {
  Calendar,
  Smile,
  Meh,
  Frown,
  Activity,
} from 'lucide-react';
import type { MoodType } from '@ainexsuite/types';

// Health-specific filter types
export type HealthFilterValue = {
  dateRange?: {
    start: Date | null;
    end: Date | null;
  };
  datePreset?: QuickDatePreset;
  moods?: MoodType[];
  hasWeight?: boolean;
  hasSleep?: boolean;
  hasWater?: boolean;
  hasEnergy?: boolean;
};

export type QuickDatePreset =
  | 'today'
  | 'yesterday'
  | 'this-week'
  | 'last-7-days'
  | 'this-month'
  | 'last-30-days'
  | 'custom';

const QUICK_DATE_PRESETS: { value: QuickDatePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'this-week', label: 'This Week' },
  { value: 'last-7-days', label: 'Last 7 Days' },
  { value: 'this-month', label: 'This Month' },
  { value: 'last-30-days', label: 'Last 30 Days' },
];

const MOOD_OPTIONS: { value: MoodType; icon: typeof Smile; label: string; color: string }[] = [
  { value: 'energetic', icon: Smile, label: 'Great', color: 'text-green-500' },
  { value: 'happy', icon: Smile, label: 'Good', color: 'text-green-400' },
  { value: 'neutral', icon: Meh, label: 'Okay', color: 'text-yellow-500' },
  { value: 'stressed', icon: Frown, label: 'Low', color: 'text-orange-500' },
  { value: 'tired', icon: Frown, label: 'Bad', color: 'text-red-500' },
];

const METRIC_FILTERS: { key: keyof HealthFilterValue; label: string }[] = [
  { key: 'hasWeight', label: 'Weight' },
  { key: 'hasSleep', label: 'Sleep' },
  { key: 'hasWater', label: 'Water' },
  { key: 'hasEnergy', label: 'Energy' },
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

interface HealthFilterContentProps {
  filters: HealthFilterValue;
  onFiltersChange: (filters: HealthFilterValue) => void;
}

export function HealthFilterContent({ filters, onFiltersChange }: HealthFilterContentProps) {
  const toggleMood = (mood: MoodType) => {
    const currentMoods = filters.moods || [];
    const newMoods = currentMoods.includes(mood)
      ? currentMoods.filter((m) => m !== mood)
      : [...currentMoods, mood];
    onFiltersChange({ ...filters, moods: newMoods });
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

  const toggleMetricFilter = (key: keyof HealthFilterValue) => {
    const current = filters[key] as boolean | undefined;
    onFiltersChange({ ...filters, [key]: current ? undefined : true });
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
          <Smile className="w-3.5 h-3.5" />
          Mood
        </h4>
        <div className="flex gap-2">
          {MOOD_OPTIONS.map((option) => {
            const isSelected = filters.moods?.includes(option.value);
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => toggleMood(option.value)}
                className={clsx(
                  'flex-1 flex flex-col items-center gap-1 px-2 py-2 text-xs rounded-lg transition-all border',
                  isSelected
                    ? 'bg-primary/20 text-primary border-primary/30'
                    : 'bg-background/50 border-border hover:border-primary/30 text-muted-foreground hover:text-primary'
                )}
              >
                <Icon className={clsx('w-4 h-4', option.color)} />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Metric Filters */}
      <div>
        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5" />
          Has Data For
        </h4>
        <div className="flex flex-wrap gap-2">
          {METRIC_FILTERS.map((metric) => {
            const isSelected = filters[metric.key] === true;
            return (
              <button
                key={metric.key}
                onClick={() => toggleMetricFilter(metric.key)}
                className={clsx(
                  'px-3 py-1.5 text-xs rounded-full transition-all border',
                  isSelected
                    ? 'bg-teal-500/20 text-teal-400 border-teal-500/30'
                    : 'bg-background/50 border-border hover:border-teal-500/30 text-muted-foreground hover:text-teal-400'
                )}
              >
                {metric.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Date Range */}
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
