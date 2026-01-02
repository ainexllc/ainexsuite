'use client';

import { useMemo } from 'react';
import { CheckCircle2 } from 'lucide-react';
import Masonry from 'react-masonry-css';
import { EmptyState, ListSection } from '@ainexsuite/ui';
import { TaskCard } from './TaskCard';
import { ColumnSelector } from './column-selector';
import { usePreferences } from '@/components/providers/preferences-provider';
import { useTodoStore } from '../../lib/store';
import type { Task } from '../../types/models';

interface TaskBoardProps {
  onEditTask: (taskId: string) => void;
  searchQuery?: string;
}

// Skeleton loader for lazy loading (reserved for future use)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function TasksSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-16 rounded-2xl bg-surface-muted/80 shadow-inner animate-pulse"
        />
      ))}
    </div>
  );
}

export function TaskBoard({ onEditTask, searchQuery = '' }: TaskBoardProps) {
  const { getCurrentSpace, tasks } = useTodoStore();
  const currentSpace = getCurrentSpace();
  const { preferences } = usePreferences();

  // Breakpoints for Pinned and All Tasks sections (matches notes app pattern)
  const pinnedBreakpoints = useMemo(() => ({
    default: preferences.pinnedColumns || 2,
    640: 1,
  }), [preferences.pinnedColumns]);

  const allTasksBreakpoints = useMemo(() => ({
    default: preferences.allTasksColumns || 2,
    640: 1,
  }), [preferences.allTasksColumns]);

  // Filter tasks for current space, excluding archived
  const spaceTasks = useMemo(() => {
    if (!currentSpace) return [];
    let filtered = tasks.filter(
      (t: Task) =>
        (currentSpace.id === 'all' || t.spaceId === currentSpace.id) && !t.archived
    );

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.tags?.some((tag) => tag.toLowerCase().includes(query)) ||
          task.subtasks?.some((st) => st.title.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [tasks, currentSpace, searchQuery]);

  // Helper to get time from Date or Firestore Timestamp
  const getTime = (date: Date | { toDate: () => Date } | string | number | undefined) => {
    if (!date) return 0;
    if (typeof date === 'number') return date;
    if (typeof date === 'string') return new Date(date).getTime();
    if (date instanceof Date) return date.getTime();
    if (typeof date.toDate === 'function') return date.toDate().getTime();
    return 0;
  };

  // Separate pinned and unpinned, sorted by latest updated
  const pinnedTasks = useMemo(
    () => spaceTasks
      .filter((t) => t.pinned)
      .sort((a, b) => getTime(b.updatedAt) - getTime(a.updatedAt)),
    [spaceTasks]
  );
  const unpinnedTasks = useMemo(
    () => spaceTasks
      .filter((t) => !t.pinned)
      .sort((a, b) => getTime(b.updatedAt) - getTime(a.updatedAt)),
    [spaceTasks]
  );

  const hasTasks = spaceTasks.length > 0;

  if (!currentSpace) return null;

  const renderMasonry = (items: Task[], breakpoints: Record<string, number>) => (
    <Masonry
      breakpointCols={breakpoints}
      className="flex -ml-4 w-auto"
      columnClassName="pl-4 bg-clip-padding"
    >
      {items.map((task) => (
        <div key={task.id} className="mb-4">
          <TaskCard task={task} onEditTask={onEditTask} />
        </div>
      ))}
    </Masonry>
  );

  return (
    <div className="space-y-1 lg:px-0 cq-board">
      {hasTasks ? (
        <div className="space-y-10">
          {/* Pinned Tasks */}
          {pinnedTasks.length > 0 && (
            <ListSection
              title="Pinned"
              count={pinnedTasks.length}
              action={<ColumnSelector section="pinned" />}
            >
              {renderMasonry(pinnedTasks, pinnedBreakpoints)}
            </ListSection>
          )}

          {/* All Tasks */}
          {unpinnedTasks.length > 0 && pinnedTasks.length > 0 && (
            <ListSection
              title="All Tasks"
              count={unpinnedTasks.length}
              action={<ColumnSelector section="allTasks" />}
            >
              {renderMasonry(unpinnedTasks, allTasksBreakpoints)}
            </ListSection>
          )}

          {/* Tasks without section header when no pinned tasks */}
          {unpinnedTasks.length > 0 && pinnedTasks.length === 0 && (
            <ListSection
              title="All Tasks"
              count={unpinnedTasks.length}
              action={<ColumnSelector section="allTasks" />}
            >
              {renderMasonry(unpinnedTasks, allTasksBreakpoints)}
            </ListSection>
          )}
        </div>
      ) : (
        <EmptyState
          icon={CheckCircle2}
          title="All caught up!"
          description="This space is empty. Add a task to start planning your day or organize your project."
          variant="default"
        />
      )}
    </div>
  );
}
