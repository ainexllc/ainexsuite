'use client';

import { useState, useMemo, useCallback } from 'react';
import { List, Sun, X, Trash2 } from 'lucide-react';
import {
  WorkspacePageLayout,
  WorkspaceToolbar,
  ActiveFilterChips,
  SpaceTabSelector,
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
import { MyDayView } from '@/components/views/MyDayView';
import { TrashModal } from '@/components/tasks/trash-modal';
import { TaskFilterContent, type TaskFilterValue } from '@/components/task-filter-content';
import { KeyboardShortcutsHelp } from '@/components/KeyboardShortcutsHelp';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useSpaces } from '@/components/providers/spaces-provider';

import { useTodoStore } from '@/lib/store';
import type { TaskStatus } from '@/types/models';
import type { Priority } from '@ainexsuite/types';

type ViewType = 'list' | 'my-day';

const VIEW_OPTIONS: ViewOption<ViewType>[] = [
  { value: 'list', icon: List, label: 'All Tasks' },
  { value: 'my-day', icon: Sun, label: 'My Day' },
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
  const { viewPreferences, setViewPreference, tasks, getCurrentSpace } = useTodoStore();
  const { spaces, currentSpaceId, currentSpace: spacesCurrentSpace, setCurrentSpace } = useSpaces();
  const currentSpace = spacesCurrentSpace || getCurrentSpace();

  // Create space items for SpaceTabSelector
  const spaceItems = useMemo(() => {
    return spaces.map((s) => ({
      id: s.id,
      name: s.name,
      type: s.type,
    }));
  }, [spaces]);

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
  const [isTrashModalOpen, setIsTrashModalOpen] = useState(false);

  // Resolve view from preference or default
  const view = (viewPreferences[currentSpaceId] as ViewType) || 'list';

  const handleSetView = useCallback((newView: ViewType) => {
    if (currentSpaceId) {
      setViewPreference(currentSpaceId, newView);
    }
  }, [currentSpaceId, setViewPreference]);

  // Get trashed tasks for showing trash icon
  const trashedTasks = useMemo(() => {
    return tasks.filter((t) => t.deletedAt && t.spaceId === currentSpace?.id);
  }, [tasks, currentSpace]);

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
        const list = (currentSpace as unknown as { lists?: { id: string; title: string }[] })?.lists?.find((l) => l.id === listId);
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
      description: 'All Tasks view',
    },
    {
      key: '2',
      action: () => handleSetView('my-day'),
      description: 'My Day view',
    },
  ], [handleSetView, isSearchOpen]);

  const { showHelp, closeHelp } = useKeyboardShortcuts({
    enabled: !showEditor,
    shortcuts: keyboardShortcuts,
  });

  return (
    <>
      <WorkspacePageLayout
        className="pt-[17px]"
        spaceSelector={
          spaceItems.length > 1 && (
            <SpaceTabSelector
              spaces={spaceItems}
              currentSpaceId={currentSpaceId}
              onSpaceChange={setCurrentSpace}
            />
          )
        }
        composer={<TaskComposer placeholder="Create todo" />}
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
            <div className="flex items-center gap-2">
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
                viewTrailingContent={
                  <button
                    onClick={() => setIsTrashModalOpen(true)}
                    className={`p-1.5 rounded-md hover:bg-foreground/10 transition-colors ${
                      trashedTasks.length > 0
                        ? 'text-foreground/70 hover:text-foreground'
                        : 'text-foreground/30 hover:text-foreground/50'
                    }`}
                    title={trashedTasks.length > 0 ? `Trash (${trashedTasks.length})` : 'Trash is empty'}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                }
              />
            </div>
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
          {view === 'list' && (
            <TaskBoard
              searchQuery={searchQuery}
            />
          )}

          {view === 'my-day' && (
            <MyDayView
              onEditTask={(id) => { setSelectedTaskId(id); setShowEditor(true); }}
              searchQuery={searchQuery}
            />
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

      {/* Trash Modal */}
      <TrashModal
        isOpen={isTrashModalOpen}
        onClose={() => setIsTrashModalOpen(false)}
      />
    </>
  );
}
