'use client';

import { useMemo } from 'react';
import { clsx } from 'clsx';
import {
  Calendar,
  Flag,
  Tag,
  Palette,
  FolderKanban,
  CheckCircle2,
  PlayCircle,
  PauseCircle,
  Circle,
  LayoutDashboard,
  X,
  Video,
  Brush,
  Megaphone,
  Search,
  MoreHorizontal,
  AppWindow,
} from 'lucide-react';
import { DatePicker } from '@ainexsuite/ui';
import { usePreferences } from '@/components/providers/preferences-provider';
import { useLabels } from '@/components/providers/labels-provider';
import type {
  ProjectColor,
  ProjectStatus,
  ProjectType,
  QuickDatePreset,
  DateRangeField,
} from '@/lib/types/project';

// ============ Color Swatches ============
const PROJECT_COLORS: { value: ProjectColor; label: string; className: string }[] = [
  { value: 'default', label: 'Default', className: 'bg-background border border-border' },
  { value: 'project-white', label: 'White', className: 'bg-[#ffffff]' },
  { value: 'project-lemon', label: 'Lemon', className: 'bg-[#fff9c4]' },
  { value: 'project-peach', label: 'Peach', className: 'bg-[#ffe0b2]' },
  { value: 'project-tangerine', label: 'Tangerine', className: 'bg-[#ffccbc]' },
  { value: 'project-mint', label: 'Mint', className: 'bg-[#c8e6c9]' },
  { value: 'project-fog', label: 'Fog', className: 'bg-[#cfd8dc]' },
  { value: 'project-lavender', label: 'Lavender', className: 'bg-[#d1c4e9]' },
  { value: 'project-blush', label: 'Blush', className: 'bg-[#f8bbd0]' },
  { value: 'project-sky', label: 'Sky', className: 'bg-[#b3e5fc]' },
  { value: 'project-moss', label: 'Moss', className: 'bg-[#dcedc8]' },
  { value: 'project-coal', label: 'Coal', className: 'bg-[#455a64]' },
];

// ============ Status Options ============
const STATUS_OPTIONS: { value: ProjectStatus; label: string; icon: typeof Circle; color: string }[] = [
  { value: 'planning', label: 'Planning', icon: Circle, color: 'text-slate-400' },
  { value: 'active', label: 'Active', icon: PlayCircle, color: 'text-emerald-500' },
  { value: 'on_hold', label: 'On Hold', icon: PauseCircle, color: 'text-amber-500' },
  { value: 'completed', label: 'Completed', icon: CheckCircle2, color: 'text-blue-500' },
];

// ============ Priority Options ============
const PRIORITY_OPTIONS: { value: 'high' | 'medium' | 'low'; label: string; color: string }[] = [
  { value: 'high', label: 'High', color: 'text-red-500' },
  { value: 'medium', label: 'Medium', color: 'text-amber-500' },
  { value: 'low', label: 'Low', color: 'text-emerald-500' },
];

// ============ Type Options ============
const TYPE_OPTIONS: { value: ProjectType; label: string; icon: typeof AppWindow }[] = [
  { value: 'app', label: 'App', icon: AppWindow },
  { value: 'video', label: 'Video', icon: Video },
  { value: 'design', label: 'Design', icon: Brush },
  { value: 'marketing', label: 'Marketing', icon: Megaphone },
  { value: 'research', label: 'Research', icon: Search },
  { value: 'other', label: 'Other', icon: MoreHorizontal },
];

// ============ Quick Date Presets ============
const QUICK_DATE_PRESETS: { value: QuickDatePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7days', label: 'Last 7 Days' },
  { value: 'last30days', label: 'Last 30 Days' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
];

// ============ Date Field Options ============
const DATE_FIELD_OPTIONS: { value: DateRangeField; label: string }[] = [
  { value: 'createdAt', label: 'Created' },
  { value: 'updatedAt', label: 'Updated' },
  { value: 'dueDate', label: 'Due Date' },
  { value: 'startDate', label: 'Start Date' },
];

// ============ Helper Functions ============
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
    case 'last7days': {
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return {
        start: sevenDaysAgo,
        end: new Date(now.getTime()),
      };
    }
    case 'last30days': {
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      return {
        start: thirtyDaysAgo,
        end: new Date(now.getTime()),
      };
    }
    case 'thisMonth': {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        start: startOfMonth,
        end: new Date(now.getTime()),
      };
    }
    case 'lastMonth': {
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return {
        start: startOfLastMonth,
        end: endOfLastMonth,
      };
    }
    case 'thisYear': {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return {
        start: startOfYear,
        end: new Date(now.getTime()),
      };
    }
    default:
      return { start: today, end: now };
  }
}

// ============ Component ============
export function ProjectFilterContent() {
  const { preferences, setFilter, resetFilters } = usePreferences();
  const { labels } = useLabels();
  const filters = preferences.filter;

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.labels && filters.labels.length > 0) count++;
    if (filters.colors && filters.colors.length > 0) count++;
    if (filters.status && filters.status.length > 0) count++;
    if (filters.priority && filters.priority.length > 0) count++;
    if (filters.type && filters.type.length > 0) count++;
    if (filters.dateRange?.start || filters.dateRange?.end) count++;
    if (filters.hasWhiteboard !== undefined) count++;
    return count;
  }, [filters]);

  // Toggle handlers
  const toggleLabel = (labelId: string) => {
    const currentLabels = filters.labels || [];
    const newLabels = currentLabels.includes(labelId)
      ? currentLabels.filter((id) => id !== labelId)
      : [...currentLabels, labelId];
    setFilter({ ...filters, labels: newLabels.length > 0 ? newLabels : undefined });
  };

  const toggleColor = (color: ProjectColor) => {
    const currentColors = filters.colors || [];
    const newColors = currentColors.includes(color)
      ? currentColors.filter((c) => c !== color)
      : [...currentColors, color];
    setFilter({ ...filters, colors: newColors.length > 0 ? newColors : undefined });
  };

  const toggleStatus = (status: ProjectStatus) => {
    const currentStatuses = filters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter((s) => s !== status)
      : [...currentStatuses, status];
    setFilter({ ...filters, status: newStatuses.length > 0 ? newStatuses : undefined });
  };

  const togglePriority = (priority: 'high' | 'medium' | 'low') => {
    const currentPriorities = filters.priority || [];
    const newPriorities = currentPriorities.includes(priority)
      ? currentPriorities.filter((p) => p !== priority)
      : [...currentPriorities, priority];
    setFilter({ ...filters, priority: newPriorities.length > 0 ? newPriorities : undefined });
  };

  const toggleType = (type: ProjectType) => {
    const currentTypes = filters.type || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type];
    setFilter({ ...filters, type: newTypes.length > 0 ? newTypes : undefined });
  };

  const selectDatePreset = (preset: QuickDatePreset) => {
    const { start, end } = getDateRangeFromPreset(preset);
    setFilter({
      ...filters,
      datePreset: preset,
      dateRange: { start, end },
    });
  };

  const setDateField = (dateField: DateRangeField) => {
    setFilter({ ...filters, dateField });
  };

  const toggleWhiteboard = () => {
    const newValue = filters.hasWhiteboard === undefined ? true : filters.hasWhiteboard ? false : undefined;
    setFilter({ ...filters, hasWhiteboard: newValue });
  };

  const handleClearFilters = () => {
    resetFilters();
  };

  return (
    <div className="space-y-5 p-1">
      {/* Header with Clear Button */}
      {activeFilterCount > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {activeFilterCount} active filter{activeFilterCount !== 1 ? 's' : ''}
          </span>
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
          >
            <X className="w-3 h-3" />
            Clear All
          </button>
        </div>
      )}

      {/* Labels Section */}
      {labels.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" />
            Labels
          </h4>
          <div className="flex flex-wrap gap-2">
            {labels.map((label) => {
              const isSelected = filters.labels?.includes(label.id);
              return (
                <button
                  key={label.id}
                  onClick={() => toggleLabel(label.id)}
                  className={clsx(
                    'px-3 py-1.5 text-xs rounded-full transition-all border',
                    isSelected
                      ? 'bg-primary/20 text-primary border-primary/30'
                      : 'bg-background/50 border-border hover:border-primary/30 text-muted-foreground hover:text-primary'
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
        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5" />
          Colors
        </h4>
        <div className="grid grid-cols-6 gap-2">
          {PROJECT_COLORS.map((color) => {
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
                    ? 'border-primary ring-2 ring-primary/20 scale-110'
                    : 'border-transparent hover:border-primary/30 hover:scale-105'
                )}
              >
                {isSelected && (
                  <svg className="w-4 h-4 mx-auto text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Status Section */}
      <div>
        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
          <FolderKanban className="w-3.5 h-3.5" />
          Status
        </h4>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((option) => {
            const isSelected = filters.status?.includes(option.value);
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => toggleStatus(option.value)}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all border',
                  isSelected
                    ? 'bg-primary/20 text-primary border-primary/30'
                    : 'bg-background/50 border-border hover:border-primary/30 text-muted-foreground hover:text-primary'
                )}
              >
                <Icon className={clsx('w-3.5 h-3.5', isSelected ? '' : option.color)} />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Priority Section */}
      <div>
        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
          <Flag className="w-3.5 h-3.5" />
          Priority
        </h4>
        <div className="flex flex-wrap gap-2">
          {PRIORITY_OPTIONS.map((option) => {
            const isSelected = filters.priority?.includes(option.value);
            return (
              <button
                key={option.value}
                onClick={() => togglePriority(option.value)}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all border',
                  isSelected
                    ? 'bg-primary/20 text-primary border-primary/30'
                    : 'bg-background/50 border-border hover:border-primary/30 text-muted-foreground hover:text-primary'
                )}
              >
                <Flag className={clsx('w-3.5 h-3.5', isSelected ? '' : option.color)} />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Type Section */}
      <div>
        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
          <FolderKanban className="w-3.5 h-3.5" />
          Type
        </h4>
        <div className="flex flex-wrap gap-2">
          {TYPE_OPTIONS.map((option) => {
            const isSelected = filters.type?.includes(option.value);
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => toggleType(option.value)}
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
                    ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                    : 'bg-background/50 border-border hover:border-indigo-500/30 text-muted-foreground hover:text-indigo-400'
                )}
              >
                {option.label}
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

      {/* Custom Date Range */}
      <div>
        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Custom Date Range</h4>
        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <DatePicker
              value={filters.dateRange?.start ?? null}
              onChange={(start) => {
                setFilter({
                  ...filters,
                  datePreset: undefined,
                  dateRange: { ...filters.dateRange, start, end: filters.dateRange?.end ?? null },
                });
              }}
              placeholder="Start date"
              presets="none"
            />
          </div>
          <span className="text-muted-foreground text-sm">to</span>
          <div className="flex-1">
            <DatePicker
              value={filters.dateRange?.end ?? null}
              onChange={(end) => {
                setFilter({
                  ...filters,
                  datePreset: undefined,
                  dateRange: { ...filters.dateRange, start: filters.dateRange?.start ?? null, end },
                });
              }}
              placeholder="End date"
              presets="none"
            />
          </div>
        </div>
      </div>

      {/* Has Whiteboard Toggle */}
      <div>
        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
          <LayoutDashboard className="w-3.5 h-3.5" />
          Whiteboard
        </h4>
        <div className="flex gap-2">
          <button
            onClick={toggleWhiteboard}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all border',
              filters.hasWhiteboard === true
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-background/50 border-border hover:border-emerald-500/30 text-muted-foreground hover:text-emerald-400'
            )}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Has Whiteboard
          </button>
          <button
            onClick={() => {
              if (filters.hasWhiteboard === false) {
                setFilter({ ...filters, hasWhiteboard: undefined });
              } else {
                setFilter({ ...filters, hasWhiteboard: false });
              }
            }}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all border',
              filters.hasWhiteboard === false
                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                : 'bg-background/50 border-border hover:border-red-500/30 text-muted-foreground hover:text-red-400'
            )}
          >
            <X className="w-3.5 h-3.5" />
            No Whiteboard
          </button>
        </div>
      </div>
    </div>
  );
}
