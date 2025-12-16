'use client';

import { useState, useMemo, useCallback } from 'react';
import { LayoutGrid, List, Calendar, Sun, Grid2X2, Columns, X } from 'lucide-react';
import {
  WorkspacePageLayout,
  WorkspaceToolbar,
  ActivityCalendar,
  ActiveFilterChips,
  type ViewOption,
  type SortOption,
  type SortConfig,
  type FilterChip,
  type FilterChipType,
} from '@ainexsuite/ui';

// Components
import { TaskEditor } from '@/components/tasks/TaskEditor';
import { TaskComposer } from '@/components/tasks/TaskComposer';
import { TaskBoard } from '@/components/views/TaskBoard';
import { TaskKanban } from '@/components/views/TaskKanban';
import { MyDayView } from '@/components/views/MyDayView';
import { EisenhowerMatrix } from '@/components/views/EisenhowerMatrix';
import { SpaceSwitcher } from '@/components/spaces/SpaceSwitcher';
import { TaskFilterContent, type TaskFilterValue } from '@/components/task-filter-content';

import { useTodoStore } from '@/lib/store';
import type { TaskStatus } from '@/types/models';
import type { Priority } from '@ainexsuite/types';

type ViewType = 'list' | 'masonry' | 'board' | 'my-day' | 'matrix' | 'calendar';

const VIEW_OPTIONS: ViewOption<ViewType>[] = [
  { value: 'list', icon: List, label: 'List view' },
  { value: 'masonry', icon: LayoutGrid, label: 'Masonry view' },
  { value: 'board', icon: Columns, label: 'Board view' },
  { value: 'my-day', icon: Sun, label: 'My Day' },
  { value: 'matrix', icon: Grid2X2, label: 'Eisenhower Matrix' },
  { value: 'calendar', icon: Calendar, label: 'Calendar view' },
];

const SORT_OPTIONS: SortOption[] = [
  { field: 'createdAt', label: 'Date created' },
  { field: 'updatedAt', label: 'Date modified' },
  { field: 'dueDate', label: 'Due date' },
  { field: 'title', label: 'Title' },
];

const PRIORITY_LABELS: Record<Priority, string> = {
  urgent: 'Urgent',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  none: 'None',
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
};


export default function TodoWorkspacePage() {
  const { currentSpaceId, viewPreferences, setViewPreference, tasks, getCurrentSpace } = useTodoStore();
  const currentSpace = getCurrentSpace();

  const [showEditor, setShowEditor] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(undefined);
  const [sort, setSort] = useState<SortConfig>({ field: 'createdAt', direction: 'desc' });
  const [filters, setFilters] = useState<TaskFilterValue>({
    priority: 'all',
    status: 'all',
    lists: [],
    colors: [],
    tags: [],
    dateRange: { start: null, end: null },
    dateField: 'createdAt',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Resolve view from preference or default
  const view = (viewPreferences[currentSpaceId] as ViewType) || 'list';

  const handleSetView = (newView: ViewType) => {
    if (currentSpaceId) {
      setViewPreference(currentSpaceId, newView);
    }
  };

  // Calculate activity data for calendar view
  const activityData = useMemo(() => {
    const data: Record<string, number> = {};
    tasks.forEach((task) => {
      if (task.createdAt) {
        const date = new Date(task.createdAt).toISOString().split('T')[0];
        data[date] = (data[date] || 0) + 1;
      }
    });
    return data;
  }, [tasks]);

  // Generate filter chips for active filters
  const filterChips = useMemo(() => {
    const chips: FilterChip[] = [];

    // Priority chip
    if (filters.priority && filters.priority !== 'all') {
      chips.push({
        id: filters.priority,
        label: PRIORITY_LABELS[filters.priority],
        type: 'priority',
      });
    }

    // Status chip
    if (filters.status && filters.status !== 'all') {
      chips.push({
        id: filters.status,
        label: STATUS_LABELS[filters.status],
        type: 'status',
      });
    }

    // List chips
    if (filters.lists && filters.lists.length > 0) {
      filters.lists.forEach((listId) => {
        const list = currentSpace?.lists.find((l) => l.id === listId);
        if (list) {
          chips.push({
            id: listId,
            label: list.title,
            type: 'list',
          });
        }
      });
    }

    // Color chips
    if (filters.colors && filters.colors.length > 0) {
      filters.colors.forEach((color) => {
        chips.push({
          id: color,
          label: color.replace('entry-', '').charAt(0).toUpperCase() + color.replace('entry-', '').slice(1),
          type: 'color',
          colorValue: color,
        });
      });
    }

    // Date range chip
    if (filters.dateRange?.start || filters.dateRange?.end) {
      const dateLabel = filters.datePreset && filters.datePreset !== 'custom'
        ? filters.datePreset.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        : 'Custom Date';
      chips.push({
        id: 'dateRange',
        label: dateLabel,
        type: 'date',
      });
    }

    return chips;
  }, [filters, currentSpace]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.priority && filters.priority !== 'all') count++;
    if (filters.status && filters.status !== 'all') count++;
    if (filters.lists && filters.lists.length > 0) count++;
    if (filters.colors && filters.colors.length > 0) count++;
    if (filters.dateRange?.start || filters.dateRange?.end) count++;
    if (filters.tags && filters.tags.length > 0) count++;
    return count;
  }, [filters]);

  const handleFilterReset = useCallback(() => {
    setFilters({
      priority: 'all',
      status: 'all',
      lists: [],
      colors: [],
      tags: [],
      dateRange: { start: null, end: null },
      datePreset: undefined,
      dateField: 'createdAt',
    });
  }, []);

  const handleRemoveChip = useCallback((chipId: string, chipType: FilterChipType) => {
    switch (chipType) {
      case 'priority':
        setFilters({
          ...filters,
          priority: 'all',
        });
        break;
      case 'status':
        setFilters({
          ...filters,
          status: 'all',
        });
        break;
      case 'list':
        setFilters({
          ...filters,
          lists: filters.lists?.filter((id) => id !== chipId) || [],
        });
        break;
      case 'color':
        setFilters({
          ...filters,
          colors: filters.colors?.filter((c) => c !== chipId) || [],
        });
        break;
      case 'date':
        setFilters({
          ...filters,
          dateRange: { start: null, end: null },
          datePreset: undefined,
        });
        break;
    }
  }, [filters]);

  const handleSearchToggle = useCallback(() => {
    setIsSearchOpen((prev) => {
      if (prev) {
        // Clear search when closing
        setSearchQuery('');
      }
      return !prev;
    });
  }, []);

  const isCalendarView = view === 'calendar';

  return (
    <>
      <WorkspacePageLayout
        composer={<TaskComposer />}
        composerActions={<SpaceSwitcher />}
        toolbar={
          <div className="space-y-2">
            {isSearchOpen && (
              <div className="flex items-center gap-2 justify-center">
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tasks..."
                    autoFocus
                    className="w-full h-9 px-4 pr-10 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-white/20 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
            <WorkspaceToolbar
              viewMode={view}
              onViewModeChange={handleSetView}
              viewOptions={VIEW_OPTIONS}
              onSearchClick={handleSearchToggle}
              isSearchActive={isSearchOpen || !!searchQuery}
              filterContent={<TaskFilterContent filters={filters} onFiltersChange={setFilters} sort={sort} />}
              activeFilterCount={activeFilterCount}
              onFilterReset={handleFilterReset}
              sort={sort}
              onSortChange={setSort}
              sortOptions={SORT_OPTIONS}
              viewPosition="right"
            />
            {filterChips.length > 0 && (
              <ActiveFilterChips
                chips={filterChips}
                onRemove={handleRemoveChip}
                onClearAll={handleFilterReset}
                className="px-1"
              />
            )}
          </div>
        }
        maxWidth="default"
      >
        {/* Content Area */}
        <div className="min-h-[60vh]">
          {isCalendarView ? (
            <ActivityCalendar
              activityData={activityData}
              size="large"
            />
          ) : (
            <>
              {(view === 'list' || view === 'masonry') && (
                <TaskBoard
                  viewMode={view}
                  onEditTask={(id) => { setSelectedTaskId(id); setShowEditor(true); }}
                />
              )}

              {view === 'board' && (
                <div className="overflow-x-auto">
                  <TaskKanban onEditTask={(id) => { setSelectedTaskId(id); setShowEditor(true); }} />
                </div>
              )}

              {view === 'my-day' && (
                <MyDayView onEditTask={(id) => { setSelectedTaskId(id); setShowEditor(true); }} />
              )}

              {view === 'matrix' && (
                <EisenhowerMatrix onEditTask={(id) => { setSelectedTaskId(id); setShowEditor(true); }} />
              )}
            </>
          )}
        </div>
      </WorkspacePageLayout>

      {/* Editor Modal */}
      <TaskEditor
        isOpen={showEditor}
        onClose={() => setShowEditor(false)}
        editTaskId={selectedTaskId}
      />
    </>
  );
}
