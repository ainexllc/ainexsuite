'use client';

import { useMemo } from 'react';
import { CheckCircle2 } from 'lucide-react';
import Masonry from 'react-masonry-css';
import { EmptyState, ListSection } from '@ainexsuite/ui';
import { TaskCard } from './TaskCard';
import { useTodoStore } from '../../lib/store';
import type { Task } from '../../types/models';

const masonryBreakpoints = {
  default: 3,
  1024: 2,
  640: 1,
};

interface TaskBoardProps {
  viewMode: 'list' | 'masonry';
  onEditTask: (taskId: string) => void;
}

// Skeleton loader for lazy loading (reserved for future use)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function TasksSkeleton({ viewMode }: { viewMode: 'list' | 'masonry' }) {
  if (viewMode === 'list') {
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

  return (
    <Masonry
      breakpointCols={masonryBreakpoints}
      className="flex -ml-4 w-auto"
      columnClassName="pl-4 bg-clip-padding"
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="mb-4 h-40 rounded-2xl bg-surface-muted/80 shadow-inner animate-pulse"
        />
      ))}
    </Masonry>
  );
}

export function TaskBoard({ viewMode, onEditTask }: TaskBoardProps) {
  const { getCurrentSpace, tasks } = useTodoStore();
  const currentSpace = getCurrentSpace();

  // Filter tasks for current space, excluding archived
  const spaceTasks = useMemo(() => {
    if (!currentSpace) return [];
    return tasks.filter(
      (t: Task) =>
        (currentSpace.id === 'all' || t.spaceId === currentSpace.id) && !t.archived
    );
  }, [tasks, currentSpace]);

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

  const renderMasonry = (items: Task[]) => (
    <Masonry
      breakpointCols={masonryBreakpoints}
      className="flex -ml-4 w-auto"
      columnClassName="pl-4 bg-clip-padding"
    >
      {items.map((task) => (
        <div key={task.id} className="mb-4">
          <TaskCard task={task} viewMode={viewMode} onEditTask={onEditTask} />
        </div>
      ))}
    </Masonry>
  );

  const renderList = (items: Task[]) => (
    <div className="space-y-3">
      {items.map((task) => (
        <TaskCard key={task.id} task={task} viewMode={viewMode} onEditTask={onEditTask} />
      ))}
    </div>
  );

  return (
    <div className="space-y-1 lg:px-0 cq-board">
      {hasTasks ? (
        <div className="space-y-10">
          {/* Pinned Tasks */}
          {pinnedTasks.length > 0 && (
            <ListSection title="Pinned" count={pinnedTasks.length}>
              {viewMode === 'list' ? renderList(pinnedTasks) : renderMasonry(pinnedTasks)}
            </ListSection>
          )}

          {/* All Tasks */}
          {unpinnedTasks.length > 0 && pinnedTasks.length > 0 && (
            <ListSection title="All Tasks" count={unpinnedTasks.length}>
              {viewMode === 'list' ? renderList(unpinnedTasks) : renderMasonry(unpinnedTasks)}
            </ListSection>
          )}

          {/* Tasks without section header when no pinned tasks */}
          {unpinnedTasks.length > 0 && pinnedTasks.length === 0 && (
            viewMode === 'list' ? renderList(unpinnedTasks) : renderMasonry(unpinnedTasks)
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
