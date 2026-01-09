'use client';

import { clsx } from 'clsx';
import { Calendar, Tag, Palette } from 'lucide-react';
import { DatePicker } from '@ainexsuite/ui';
import type { EventType } from '@/types/event';

export interface CalendarFilters {
  eventTypes: EventType[];
  colors: string[];
  datePreset?: QuickDatePreset;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

export type QuickDatePreset =
  | 'today'
  | 'this-week'
  | 'this-month'
  | 'next-7-days'
  | 'next-30-days'
  | 'custom';

const EVENT_TYPES: { value: EventType; label: string; color: string }[] = [
  { value: 'event', label: 'Events', color: 'bg-accent-500' },
  { value: 'task', label: 'Tasks', color: 'bg-green-500' },
  { value: 'reminder', label: 'Reminders', color: 'bg-yellow-500' },
  { value: 'holiday', label: 'Holidays', color: 'bg-red-500' },
];

const EVENT_COLORS: { value: string; label: string }[] = [
  { value: '#3b82f6', label: 'Blue' },
  { value: '#ef4444', label: 'Red' },
  { value: '#22c55e', label: 'Green' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#f97316', label: 'Orange' },
];

const QUICK_DATE_PRESETS: { value: QuickDatePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'this-week', label: 'This Week' },
  { value: 'this-month', label: 'This Month' },
  { value: 'next-7-days', label: 'Next 7 Days' },
  { value: 'next-30-days', label: 'Next 30 Days' },
];

export function getDateRangeFromPreset(preset: QuickDatePreset): { start: Date; end: Date } {
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
      const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
      return { start: startOfWeek, end: endOfWeek };
    }
    case 'this-month': {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      return { start: startOfMonth, end: endOfMonth };
    }
    case 'next-7-days': {
      const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return { start: today, end: sevenDaysLater };
    }
    case 'next-30-days': {
      const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      return { start: today, end: thirtyDaysLater };
    }
    case 'custom':
    default:
      return { start: today, end: now };
  }
}

interface CalendarFilterContentProps {
  filters: CalendarFilters;
  onFiltersChange: (filters: CalendarFilters) => void;
}

export function CalendarFilterContent({ filters, onFiltersChange }: CalendarFilterContentProps) {
  const toggleEventType = (eventType: EventType) => {
    const currentTypes = filters.eventTypes || [];
    const newTypes = currentTypes.includes(eventType)
      ? currentTypes.filter((t) => t !== eventType)
      : [...currentTypes, eventType];
    onFiltersChange({ ...filters, eventTypes: newTypes });
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

  const clearDateRange = () => {
    onFiltersChange({
      ...filters,
      datePreset: undefined,
      dateRange: { start: null, end: null },
    });
  };

  return (
    <div className="space-y-5">
      {/* Event Types */}
      <div>
        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5" />
          Event Type
        </h4>
        <div className="flex flex-wrap gap-2">
          {EVENT_TYPES.map((type) => {
            const isSelected = filters.eventTypes?.includes(type.value);
            return (
              <button
                key={type.value}
                onClick={() => toggleEventType(type.value)}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full transition-all border',
                  isSelected
                    ? 'bg-primary/20 text-primary border-primary/30'
                    : 'bg-background/50 border-border hover:border-primary/30 text-muted-foreground hover:text-primary'
                )}
              >
                <span className={clsx('w-2 h-2 rounded-full', type.color)} />
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Colors */}
      <div>
        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5" />
          Event Color
        </h4>
        <div className="flex flex-wrap gap-2">
          {EVENT_COLORS.map((color) => {
            const isSelected = filters.colors?.includes(color.value);
            return (
              <button
                key={color.value}
                onClick={() => toggleColor(color.value)}
                title={color.label}
                className={clsx(
                  'w-7 h-7 rounded-full transition-all border-2',
                  isSelected
                    ? 'border-white ring-2 ring-white/20 scale-110'
                    : 'border-transparent hover:border-white/20 hover:scale-105'
                )}
                style={{ backgroundColor: color.value }}
              >
                {isSelected && (
                  <svg className="w-3.5 h-3.5 mx-auto text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>

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
                onClick={() => isSelected ? clearDateRange() : selectDatePreset(preset.value)}
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

      {/* Custom Date Range */}
      <div>
        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Custom Date Range</h4>
        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <DatePicker
              value={filters.dateRange?.start ?? null}
              onChange={(start) => {
                onFiltersChange({
                  ...filters,
                  datePreset: 'custom',
                  dateRange: { ...filters.dateRange, start, end: filters.dateRange?.end ?? null },
                });
              }}
              placeholder="Start date"
              presets="none"
            />
          </div>
          <span className="text-muted-foreground">to</span>
          <div className="flex-1">
            <DatePicker
              value={filters.dateRange?.end ?? null}
              onChange={(end) => {
                onFiltersChange({
                  ...filters,
                  datePreset: 'custom',
                  dateRange: { ...filters.dateRange, start: filters.dateRange?.start ?? null, end },
                });
              }}
              placeholder="End date"
              presets="none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
