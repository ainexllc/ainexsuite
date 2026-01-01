'use client';

import { useMemo } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { EmptyState, ListSection } from '@ainexsuite/ui';
import { TaskCard } from './TaskCard';
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

  const renderList = (items: Task[]) => (
    <div className="space-y-3">
      {items.map((task) => (
        <TaskCard key={task.id} task={task} onEditTask={onEditTask} />
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
              {renderList(pinnedTasks)}
            </ListSection>
          )}

          {/* All Tasks */}
          {unpinnedTasks.length > 0 && pinnedTasks.length > 0 && (
            <ListSection title="All Tasks" count={unpinnedTasks.length}>
              {renderList(unpinnedTasks)}
            </ListSection>
          )}

          {/* Tasks without section header when no pinned tasks */}
          {unpinnedTasks.length > 0 && pinnedTasks.length === 0 && renderList(unpinnedTasks)}
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
