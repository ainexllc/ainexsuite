'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import {
  Calendar,
  Flag,
  CheckSquare,
  ListTodo,
  Palette,
  Bookmark,
  Trash2,
  Save,
} from 'lucide-react';
import type {
  QuickDatePreset,
  SortConfig,
} from '@ainexsuite/ui';
import { ENTRY_COLOR_SWATCHES } from '@ainexsuite/ui';
import type { Priority, EntryColor } from '@ainexsuite/types';
import type { TaskStatus } from '@/types/models';
import { useTodoStore } from '@/lib/store';

const QUICK_DATE_PRESETS: { value: QuickDatePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'this-week', label: 'This Week' },
  { value: 'last-7-days', label: 'Last 7 Days' },
  { value: 'this-month', label: 'This Month' },
  { value: 'last-30-days', label: 'Last 30 Days' },
];

const PRIORITY_OPTIONS: { value: Priority | 'all'; label: string; color: string }[] = [
  { value: 'all', label: 'All', color: 'text-foreground' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-500' },
  { value: 'high', label: 'High', color: 'text-orange-500' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-500' },
  { value: 'low', label: 'Low', color: 'text-green-500' },
];

const STATUS_OPTIONS: { value: TaskStatus | 'all'; label: string; icon: typeof CheckSquare }[] = [
  { value: 'all', label: 'All', icon: ListTodo },
  { value: 'todo', label: 'To Do', icon: CheckSquare },
  { value: 'in_progress', label: 'In Progress', icon: CheckSquare },
  { value: 'review', label: 'Review', icon: CheckSquare },
  { value: 'done', label: 'Done', icon: CheckSquare },
];

const DATE_FIELD_OPTIONS: { value: 'createdAt' | 'updatedAt'; label: string }[] = [
  { value: 'createdAt', label: 'Created Date' },
  { value: 'updatedAt', label: 'Modified Date' },
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

// Extended filter value for tasks
export interface TaskFilterValue {
  labels?: string[];
  colors?: EntryColor[];
  dateRange?: {
    start: Date | null;
    end: Date | null;
  };
  datePreset?: QuickDatePreset;
  dateField?: 'createdAt' | 'updatedAt';
  priority?: Priority | 'all';
  status?: TaskStatus | 'all';
  lists?: string[];
  tags?: string[];
}

interface TaskFilterContentProps {
  filters: TaskFilterValue;
  onFiltersChange: (filters: TaskFilterValue) => void;
  sort?: SortConfig;
}

export function TaskFilterContent({ filters, onFiltersChange, sort: _sort }: TaskFilterContentProps) {
  const { getCurrentSpace } = useTodoStore();
  const currentSpace = getCurrentSpace();
  const lists = currentSpace?.lists || [];

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [presetName, setPresetName] = useState('');

  // For now, we'll manage presets locally - can be moved to Firestore later
  const [presets, setPresets] = useState<Array<{ id: string; name: string; filters: TaskFilterValue }>>([]);

  const toggleList = (listId: string) => {
    const currentLists = filters.lists || [];
    const newLists = currentLists.includes(listId)
      ? currentLists.filter((id) => id !== listId)
      : [...currentLists, listId];
    onFiltersChange({ ...filters, lists: newLists });
  };

  const toggleColor = (color: EntryColor) => {
    const currentColors = (filters.colors || []) as EntryColor[];
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

  const setPriority = (priority: Priority | 'all') => {
    onFiltersChange({ ...filters, priority });
  };

  const setStatus = (status: TaskStatus | 'all') => {
    onFiltersChange({ ...filters, status });
  };

  const setDateField = (dateField: 'createdAt' | 'updatedAt') => {
    onFiltersChange({ ...filters, dateField });
  };

  const applyPreset = (presetId: string) => {
    const preset = presets.find((p) => p.id === presetId);
    if (preset) {
      onFiltersChange(preset.filters);
    }
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) return;
    const newPreset = {
      id: Date.now().toString(),
      name: presetName.trim(),
      filters,
    };
    setPresets([...presets, newPreset]);
    setPresetName('');
    setShowSaveDialog(false);
  };

  const handleDeletePreset = (presetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPresets(presets.filter((p) => p.id !== presetId));
  };

  const hasActiveFilters =
    (filters.lists && filters.lists.length > 0) ||
    (filters.colors && filters.colors.length > 0) ||
    filters.dateRange?.start ||
    filters.dateRange?.end ||
    (filters.priority && filters.priority !== 'all') ||
    (filters.status && filters.status !== 'all') ||
    (filters.tags && filters.tags.length > 0);

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

      {/* Priority Filter */}
      <div>
        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
          <Flag className="w-3.5 h-3.5" />
          Priority
        </h4>
        <div className="flex flex-wrap gap-2">
          {PRIORITY_OPTIONS.map((option) => {
            const isSelected = (filters.priority || 'all') === option.value;
            return (
              <button
                key={option.value}
                onClick={() => setPriority(option.value)}
                className={clsx(
                  'px-3 py-1.5 text-xs rounded-full transition-all border',
                  isSelected
                    ? 'bg-primary/20 text-primary border-primary/30'
                    : 'bg-background/50 border-border hover:border-primary/30 text-muted-foreground hover:text-primary'
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Status Filter */}
      <div>
        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
          <CheckSquare className="w-3.5 h-3.5" />
          Status
        </h4>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((option) => {
            const isSelected = (filters.status || 'all') === option.value;
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => setStatus(option.value)}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all border',
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

      {/* Lists Section */}
      {lists.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
            <ListTodo className="w-3.5 h-3.5" />
            Lists
          </h4>
          <div className="flex flex-wrap gap-2">
            {lists.map((list) => {
              const isSelected = filters.lists?.includes(list.id);
              return (
                <button
                  key={list.id}
                  onClick={() => toggleList(list.id)}
                  className={clsx(
                    'px-3 py-1.5 text-sm rounded-full transition-all border',
                    isSelected
                      ? 'bg-white/10 text-white border-white/20 shadow-sm backdrop-blur-sm'
                      : 'bg-background/50 border-border hover:border-white/20 text-muted-foreground hover:text-white'
                  )}
                >
                  {list.title}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Colors Section */}
      <div>
        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5" />
          Colors
        </h4>
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
