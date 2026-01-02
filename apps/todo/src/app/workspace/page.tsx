'use client';

import { useState, useMemo, useCallback } from 'react';
import { LayoutGrid, Calendar, Sun, Grid2X2, Columns, X, CheckCircle2, Circle, ArrowLeft } from 'lucide-react';
import {
  WorkspacePageLayout,
  WorkspaceToolbar,
  ActivityCalendar,
  ActiveFilterChips,
  ListItem,
  EmptyState,
  SpaceManagementModal,
  type ViewOption,
  type SortOption,
  type SortConfig,
  type FilterChip,
  type FilterChipType,
} from '@ainexsuite/ui';
import { format, isSameDay, parseISO } from 'date-fns';
import type { SpaceType } from '@ainexsuite/types';

// Components
import { TaskEditor } from '@/components/tasks/TaskEditor';
import { TaskComposer } from '@/components/tasks/TaskComposer';
import { TaskBoard } from '@/components/views/TaskBoard';
import { TaskKanban } from '@/components/views/TaskKanban';
import { MyDayView } from '@/components/views/MyDayView';
import { EisenhowerMatrix } from '@/components/views/EisenhowerMatrix';
import { TaskFilterContent, type TaskFilterValue } from '@/components/task-filter-content';
import { KeyboardShortcutsHelp } from '@/components/KeyboardShortcutsHelp';
import { MemberManager } from '@/components/spaces/MemberManager';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useSpaces } from '@/components/providers/spaces-provider';

import { useTodoStore } from '@/lib/store';
import type { TaskStatus } from '@/types/models';
import type { Priority } from '@ainexsuite/types';

type ViewType = 'list' | 'board' | 'my-day' | 'matrix' | 'calendar';

const VIEW_OPTIONS: ViewOption<ViewType>[] = [
  { value: 'list', icon: LayoutGrid, label: 'List view' },
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
  queued: 'In Queue',
  todo: 'To Do',
  blocked: 'Blocked',
  in_progress: 'In Progress',
  done: 'Done',
};


export default function TodoWorkspacePage() {
  const { currentSpaceId, viewPreferences, setViewPreference, tasks, getCurrentSpace } = useTodoStore();
  const { allSpaces, createSpace, updateSpace, deleteSpace } = useSpaces();
  const currentSpace = getCurrentSpace();

  const [showEditor, setShowEditor] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(undefined);
  const [showMemberManager, setShowMemberManager] = useState(false);
  const [showSpaceManagement, setShowSpaceManagement] = useState(false);
  const [sort, setSort] = useState<SortConfig>({ field: 'createdAt', direction: 'desc' });

  // Map spaces for SpaceManagementModal
  const userSpaces = useMemo(() => {
    return allSpaces
      .filter((s) => s.id !== 'personal')
      .map((s) => ({
        id: s.id,
        name: s.name,
        type: s.type,
        isGlobal: (s as { isGlobal?: boolean }).isGlobal || false,
        hiddenInApps: (s as { hiddenInApps?: string[] }).hiddenInApps || [],
        memberCount: s.memberUids?.length || 1,
        isOwner: (s as { ownerId?: string; createdBy?: string }).ownerId === undefined,
      }));
  }, [allSpaces]);

  // Space management handlers
  const handleJoinGlobalSpace = useCallback(async (type: SpaceType, _hiddenInApps: string[]) => {
    await createSpace({ name: type === 'family' ? 'Family' : 'Partner', type });
  }, [createSpace]);

  const handleLeaveGlobalSpace = useCallback(async (spaceId: string) => {
    await deleteSpace(spaceId);
  }, [deleteSpace]);

  const handleCreateCustomSpace = useCallback(async (name: string, _hiddenInApps: string[]) => {
    await createSpace({ name, type: 'project' });
  }, [createSpace]);

  const handleRenameCustomSpace = useCallback(async (spaceId: string, name: string) => {
    await updateSpace(spaceId, { name });
  }, [updateSpace]);

  const handleDeleteCustomSpace = useCallback(async (spaceId: string) => {
    await deleteSpace(spaceId);
  }, [deleteSpace]);

  const handleUpdateSpaceVisibility = useCallback(async (spaceId: string, hiddenInApps: string[]) => {
    await updateSpace(spaceId, { hiddenInApps });
  }, [updateSpace]);
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
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null);

  // Resolve view from preference or default
  const view = (viewPreferences[currentSpaceId] as ViewType) || 'list';

  const handleSetView = useCallback((newView: ViewType) => {
    if (currentSpaceId) {
      setViewPreference(currentSpaceId, newView);
    }
  }, [currentSpaceId, setViewPreference]);

  // Calculate activity data for calendar view (based on due dates)
  const activityData = useMemo(() => {
    const data: Record<string, number> = {};
    const spaceTasks = currentSpace
      ? tasks.filter((t) =>
          (currentSpace.id === 'all' || t.spaceId === currentSpace.id) && !t.archived
        )
      : tasks;

    spaceTasks.forEach((task) => {
      // Use dueDate for calendar view
      if (task.dueDate) {
        const date = task.dueDate.split('T')[0];
        data[date] = (data[date] || 0) + 1;
      }
    });
    return data;
  }, [tasks, currentSpace]);

  // Get tasks for the selected calendar date
  const tasksForSelectedDate = useMemo(() => {
    if (!selectedCalendarDate) return [];
    const spaceTasks = currentSpace
      ? tasks.filter((t) =>
          (currentSpace.id === 'all' || t.spaceId === currentSpace.id) && !t.archived
        )
      : tasks;

    return spaceTasks.filter((task) => {
      if (!task.dueDate) return false;
      const dueDate = parseISO(task.dueDate);
      return isSameDay(dueDate, selectedCalendarDate);
    });
  }, [tasks, currentSpace, selectedCalendarDate]);

  const handleCalendarDateSelect = useCallback((date: Date) => {
    setSelectedCalendarDate((prev) =>
      prev && isSameDay(prev, date) ? null : date
    );
  }, []);

  const handleToggleTaskComplete = useCallback(async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const { updateTask } = useTodoStore.getState();
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    await updateTask(taskId, { status: newStatus });
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

  // Keyboard shortcuts
  const keyboardShortcuts = useMemo(() => [
    {
      key: 'n',
      action: () => {
        // Try to focus the composer input (expanded state)
        const composerInput = document.querySelector('[data-composer-input]') as HTMLInputElement;
        if (composerInput) {
          composerInput.focus();
        } else {
          // Composer is collapsed - click expand button, then focus
          const expandButton = document.querySelector('[data-composer-expand]') as HTMLButtonElement;
          expandButton?.click();
          // Input will auto-focus when composer expands
        }
      },
      description: 'Create new task',
    },
    {
      key: '/',
      action: () => {
        if (!isSearchOpen) {
          setIsSearchOpen(true);
        }
        // Focus will happen automatically due to autoFocus
      },
      description: 'Focus search',
    },
    {
      key: '1',
      action: () => handleSetView('list'),
      description: 'List view',
    },
    {
      key: '2',
      action: () => handleSetView('board'),
      description: 'Board view',
    },
    {
      key: '3',
      action: () => handleSetView('my-day'),
      description: 'My Day view',
    },
    {
      key: '4',
      action: () => handleSetView('matrix'),
      description: 'Matrix view',
    },
    {
      key: '5',
      action: () => handleSetView('calendar'),
      description: 'Calendar view',
    },
  ], [handleSetView, isSearchOpen]);

  const { showHelp, closeHelp } = useKeyboardShortcuts({
    enabled: !showEditor,
    shortcuts: keyboardShortcuts,
  });

  const isCalendarView = view === 'calendar';

  return (
    <>
      <WorkspacePageLayout
        composer={
          <TaskComposer
            onManagePeople={() => setShowMemberManager(true)}
            onManageSpaces={() => setShowSpaceManagement(true)}
          />
        }
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
            <div className="space-y-6">
              <ActivityCalendar
                activityData={activityData}
                size="large"
                selectedDate={selectedCalendarDate ?? undefined}
                onDateSelect={handleCalendarDateSelect}
              />

              {/* Date drill-down: show tasks for selected date */}
              {selectedCalendarDate && (
                <div className="bg-background/40 backdrop-blur-sm rounded-xl border border-border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedCalendarDate(null)}
                        className="p-1.5 hover:bg-foreground/10 rounded-full transition-colors"
                      >
                        <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <h3 className="text-lg font-semibold text-foreground">
                        Tasks for {format(selectedCalendarDate, 'MMMM d, yyyy')}
                      </h3>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {tasksForSelectedDate.length} task{tasksForSelectedDate.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {tasksForSelectedDate.length > 0 ? (
                    <div className="space-y-2">
                      {tasksForSelectedDate.map((task) => (
                        <ListItem
                          key={task.id}
                          variant="default"
                          title={
                            <span className={task.status === 'done' ? 'line-through text-muted-foreground' : ''}>
                              {task.title}
                            </span>
                          }
                          subtitle={task.description || undefined}
                          icon={task.status === 'done' ? CheckCircle2 : Circle}
                          onClick={(e) => {
                            const target = e.target as HTMLElement;
                            const isIconClick = target.closest('svg')?.parentElement?.classList.contains('flex-shrink-0');
                            if (isIconClick) {
                              handleToggleTaskComplete(task.id);
                            } else {
                              setSelectedTaskId(task.id);
                              setShowEditor(true);
                            }
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Calendar}
                      title="No tasks due"
                      description="No tasks are due on this date. Click the + button to add one."
                      variant="default"
                    />
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
              {view === 'list' && (
                <TaskBoard
                  onEditTask={(id) => { setSelectedTaskId(id); setShowEditor(true); }}
                  searchQuery={searchQuery}
                />
              )}

              {view === 'board' && (
                <div className="overflow-x-auto">
                  <TaskKanban
                    onEditTask={(id) => { setSelectedTaskId(id); setShowEditor(true); }}
                    searchQuery={searchQuery}
                  />
                </div>
              )}

              {view === 'my-day' && (
                <MyDayView
                  onEditTask={(id) => { setSelectedTaskId(id); setShowEditor(true); }}
                  searchQuery={searchQuery}
                />
              )}

              {view === 'matrix' && (
                <EisenhowerMatrix
                  onEditTask={(id) => { setSelectedTaskId(id); setShowEditor(true); }}
                  searchQuery={searchQuery}
                />
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

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp isOpen={showHelp} onClose={closeHelp} />

      {/* Member Manager Modal */}
      <MemberManager
        isOpen={showMemberManager}
        onClose={() => setShowMemberManager(false)}
      />

      {/* Space Management Modal */}
      <SpaceManagementModal
        isOpen={showSpaceManagement}
        onClose={() => setShowSpaceManagement(false)}
        userSpaces={userSpaces}
        onJoinGlobalSpace={handleJoinGlobalSpace}
        onLeaveGlobalSpace={handleLeaveGlobalSpace}
        onCreateCustomSpace={handleCreateCustomSpace}
        onRenameCustomSpace={handleRenameCustomSpace}
        onDeleteCustomSpace={handleDeleteCustomSpace}
        onUpdateSpaceVisibility={handleUpdateSpaceVisibility}
      />
    </>
  );
}
