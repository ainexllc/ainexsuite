'use client';

import { clsx } from 'clsx';
import {
  ArrowUpAZ,
  ArrowDownAZ,
  ArrowUp01,
  ArrowDown01,
  Calendar,
  Clock,
  CalendarClock,
  CalendarCheck,
  Flag,
  CheckCircle2,
  Type,
} from 'lucide-react';
import { usePreferences } from '@/components/providers/preferences-provider';
import type { SortField, SortDirection } from '@/lib/types/project';

// ============ Sort Field Options ============
const SORT_FIELD_OPTIONS: {
  value: SortField;
  label: string;
  icon: typeof Type;
  description: string;
}[] = [
  { value: 'title', label: 'Title', icon: Type, description: 'Sort alphabetically by title' },
  { value: 'createdAt', label: 'Created', icon: Calendar, description: 'Sort by creation date' },
  { value: 'updatedAt', label: 'Updated', icon: Clock, description: 'Sort by last modified date' },
  { value: 'dueDate', label: 'Due Date', icon: CalendarCheck, description: 'Sort by due date' },
  { value: 'startDate', label: 'Start Date', icon: CalendarClock, description: 'Sort by start date' },
  { value: 'priority', label: 'Priority', icon: Flag, description: 'Sort by priority level' },
  { value: 'status', label: 'Status', icon: CheckCircle2, description: 'Sort by project status' },
];

// ============ Helper Functions ============
function getSortDirectionIcon(field: SortField, direction: SortDirection) {
  const isTextSort = field === 'title' || field === 'status';
  if (isTextSort) {
    return direction === 'asc' ? ArrowUpAZ : ArrowDownAZ;
  }
  return direction === 'asc' ? ArrowUp01 : ArrowDown01;
}

function getSortDirectionLabel(field: SortField, direction: SortDirection) {
  switch (field) {
    case 'title':
      return direction === 'asc' ? 'A to Z' : 'Z to A';
    case 'priority':
      return direction === 'asc' ? 'Low to High' : 'High to Low';
    case 'status':
      return direction === 'asc' ? 'Planning to Completed' : 'Completed to Planning';
    default:
      return direction === 'asc' ? 'Oldest First' : 'Newest First';
  }
}

// ============ Component ============
export function ProjectSortOptions() {
  const { preferences, setSortConfig } = usePreferences();
  const { field: currentField, direction: currentDirection } = preferences.sortConfig;

  const handleFieldChange = (field: SortField) => {
    if (field === currentField) {
      // Toggle direction if clicking the same field
      setSortConfig({
        field,
        direction: currentDirection === 'asc' ? 'desc' : 'asc',
      });
    } else {
      // Default to descending for dates, ascending for text
      const defaultDirection: SortDirection =
        field === 'title' || field === 'priority' || field === 'status' ? 'asc' : 'desc';
      setSortConfig({ field, direction: defaultDirection });
    }
  };

  const handleDirectionToggle = () => {
    setSortConfig({
      field: currentField,
      direction: currentDirection === 'asc' ? 'desc' : 'asc',
    });
  };

  const DirectionIcon = getSortDirectionIcon(currentField, currentDirection);

  return (
    <div className="space-y-4 p-1">
      {/* Current Sort Indicator */}
      <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Sorting by:</span>
          <span className="text-sm font-medium text-primary">
            {SORT_FIELD_OPTIONS.find((o) => o.value === currentField)?.label}
          </span>
        </div>
        <button
          onClick={handleDirectionToggle}
          className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
          title={`Currently: ${getSortDirectionLabel(currentField, currentDirection)}`}
        >
          <DirectionIcon className="w-3.5 h-3.5" />
          <span>{getSortDirectionLabel(currentField, currentDirection)}</span>
        </button>
      </div>

      {/* Sort Field Options */}
      <div className="space-y-1">
        {SORT_FIELD_OPTIONS.map((option) => {
          const isSelected = currentField === option.value;
          const Icon = option.icon;
          const CurrentDirectionIcon = isSelected
            ? getSortDirectionIcon(option.value, currentDirection)
            : null;

          return (
            <button
              key={option.value}
              onClick={() => handleFieldChange(option.value)}
              className={clsx(
                'w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all',
                isSelected
                  ? 'bg-primary/15 border border-primary/30'
                  : 'bg-background/50 border border-transparent hover:bg-surface-hover hover:border-border'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={clsx(
                    'w-8 h-8 rounded-md flex items-center justify-center',
                    isSelected ? 'bg-primary/20' : 'bg-muted/50'
                  )}
                >
                  <Icon
                    className={clsx('w-4 h-4', isSelected ? 'text-primary' : 'text-muted-foreground')}
                  />
                </div>
                <div className="text-left">
                  <div
                    className={clsx(
                      'text-sm font-medium',
                      isSelected ? 'text-primary' : 'text-foreground'
                    )}
                  >
                    {option.label}
                  </div>
                  <div className="text-xs text-muted-foreground">{option.description}</div>
                </div>
              </div>
              {isSelected && CurrentDirectionIcon && (
                <div className="flex items-center gap-1 text-primary">
                  <CurrentDirectionIcon className="w-4 h-4" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Quick Direction Toggle Buttons */}
      <div className="pt-3 border-t border-border">
        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Sort Direction</h4>
        <div className="flex gap-2">
          <button
            onClick={() => setSortConfig({ field: currentField, direction: 'asc' })}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg transition-all border',
              currentDirection === 'asc'
                ? 'bg-primary/20 text-primary border-primary/30'
                : 'bg-background/50 border-border hover:border-primary/30 text-muted-foreground hover:text-primary'
            )}
          >
            {currentField === 'title' || currentField === 'status' ? (
              <ArrowUpAZ className="w-4 h-4" />
            ) : (
              <ArrowUp01 className="w-4 h-4" />
            )}
            Ascending
          </button>
          <button
            onClick={() => setSortConfig({ field: currentField, direction: 'desc' })}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg transition-all border',
              currentDirection === 'desc'
                ? 'bg-primary/20 text-primary border-primary/30'
                : 'bg-background/50 border-border hover:border-primary/30 text-muted-foreground hover:text-primary'
            )}
          >
            {currentField === 'title' || currentField === 'status' ? (
              <ArrowDownAZ className="w-4 h-4" />
            ) : (
              <ArrowDown01 className="w-4 h-4" />
            )}
            Descending
          </button>
        </div>
      </div>
    </div>
  );
}
