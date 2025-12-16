'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, X, Calendar, Flag, Palette } from 'lucide-react';
import type { Priority, EntryColor } from '@ainexsuite/types';
import { ENTRY_COLOR_SWATCHES } from '@ainexsuite/ui';
import { cn } from '@/lib/utils';

export type ViewFilter = 'all' | 'inbox' | 'today' | 'upcoming' | 'someday' | 'completed';

export interface TaskFilterOptions {
  viewFilter: ViewFilter;
  searchQuery: string;
  priorityFilter: Priority | 'all';
  dateRange: 'all' | 'overdue' | 'today' | 'week' | 'month';
  showCompleted: boolean;
  colors: EntryColor[];
}

interface TaskFiltersProps {
  filters: TaskFilterOptions;
  onFiltersChange: (filters: TaskFilterOptions) => void;
  taskCounts: {
    all: number;
    inbox: number;
    today: number;
    upcoming: number;
    completed: number;
  };
}

const VIEW_OPTIONS: { value: ViewFilter; label: string; icon?: string }[] = [
  { value: 'inbox', label: 'Inbox', icon: '📥' },
  { value: 'today', label: 'Today', icon: '📅' },
  { value: 'upcoming', label: 'Upcoming', icon: '🗓️' },
  { value: 'all', label: 'All Tasks', icon: '📋' },
  { value: 'completed', label: 'Completed', icon: '✅' },
];

const PRIORITY_OPTIONS: { value: Priority | 'all'; label: string; color: string }[] = [
  { value: 'all', label: 'All Priorities', color: 'text-foreground' },
  { value: 'urgent', label: 'Urgent', color: 'text-priority-urgent' },
  { value: 'high', label: 'High', color: 'text-priority-high' },
  { value: 'medium', label: 'Medium', color: 'text-priority-medium' },
  { value: 'low', label: 'Low', color: 'text-priority-low' },
  { value: 'none', label: 'No Priority', color: 'text-priority-none' },
];

const DATE_RANGE_OPTIONS: { value: TaskFilterOptions['dateRange']; label: string }[] = [
  { value: 'all', label: 'All Dates' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'today', label: 'Due Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
];

export function TaskFilters({ filters, onFiltersChange, taskCounts }: TaskFiltersProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const updateFilter = <K extends keyof TaskFilterOptions>(
    key: K,
    value: TaskFilterOptions[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      viewFilter: 'inbox',
      searchQuery: '',
      priorityFilter: 'all',
      dateRange: 'all',
      showCompleted: false,
      colors: [],
    });
    setShowAdvancedFilters(false);
  };

  const toggleColor = (color: EntryColor) => {
    const currentColors = filters.colors || [];
    const newColors = currentColors.includes(color)
      ? currentColors.filter((c) => c !== color)
      : [...currentColors, color];
    onFiltersChange({ ...filters, colors: newColors });
  };

  const hasActiveFilters =
    filters.searchQuery ||
    filters.priorityFilter !== 'all' ||
    filters.dateRange !== 'all' ||
    filters.showCompleted ||
    (filters.colors && filters.colors.length > 0);

  return (
    <div className="space-y-4">
      {/* Search Bar and View Filters */}
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={filters.searchQuery}
            onChange={(e) => updateFilter('searchQuery', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 surface-card rounded-lg border border-surface-hover focus:border-accent-500 focus:outline-none transition-colors"
          />
          {filters.searchQuery && (
            <button
              onClick={() => updateFilter('searchQuery', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-surface-hover rounded"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all border',
            showAdvancedFilters || hasActiveFilters
              ? 'bg-accent-500/10 border-accent-500 text-accent-500'
              : 'surface-card border-surface-hover hover:border-accent-500'
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="px-1.5 py-0.5 bg-accent-500 text-foreground text-xs rounded-full">
              {[
                filters.searchQuery,
                filters.priorityFilter !== 'all',
                filters.dateRange !== 'all',
                filters.showCompleted,
                filters.colors && filters.colors.length > 0,
              ].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* View Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {VIEW_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => updateFilter('viewFilter', option.value)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
              filters.viewFilter === option.value
                ? 'bg-accent-500 text-foreground shadow-sm'
                : 'surface-card hover:surface-hover'
            )}
          >
            {option.icon && <span>{option.icon}</span>}
            <span>{option.label}</span>
            <span className="text-xs opacity-75">
              ({taskCounts[option.value as keyof typeof taskCounts] || 0})
            </span>
          </button>
        ))}
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="surface-card rounded-lg p-4 border border-surface-hover space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Advanced Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-accent-500 hover:text-accent-600 font-medium"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Flag className="h-4 w-4" />
                Priority
              </label>
              <select
                value={filters.priorityFilter}
                onChange={(e) => updateFilter('priorityFilter', e.target.value as Priority | 'all')}
                className="w-full px-3 py-2 surface-elevated rounded-lg border border-surface-hover focus:border-accent-500 focus:outline-none"
              >
                {PRIORITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Due Date
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) =>
                  updateFilter('dateRange', e.target.value as TaskFilterOptions['dateRange'])
                }
                className="w-full px-3 py-2 surface-elevated rounded-lg border border-surface-hover focus:border-accent-500 focus:outline-none"
              >
                {DATE_RANGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Color Filter */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Colors
            </label>
            <div className="flex flex-wrap gap-2">
              {ENTRY_COLOR_SWATCHES.map((color) => {
                const isSelected = filters.colors?.includes(color.value);
                return (
                  <button
                    key={color.value}
                    onClick={() => toggleColor(color.value)}
                    title={color.label}
                    className={cn(
                      'w-8 h-8 rounded-full transition-all border-2',
                      color.className,
                      isSelected
                        ? 'border-accent-500 ring-2 ring-accent-500/30'
                        : 'border-transparent hover:border-accent-500/50'
                    )}
                  >
                    {isSelected && (
                      <svg className="w-4 h-4 mx-auto text-foreground/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Show Completed Toggle */}
          <div className="flex items-center gap-3 pt-2 md:col-span-2">
            <input
              type="checkbox"
              id="show-completed"
              checked={filters.showCompleted}
              onChange={(e) => updateFilter('showCompleted', e.target.checked)}
              className="h-4 w-4 rounded border-surface-hover text-accent-500 focus:ring-accent-500"
            />
            <label htmlFor="show-completed" className="text-sm font-medium cursor-pointer">
              Show completed tasks
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
