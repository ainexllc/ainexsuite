'use client';

import { useMemo } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { EmptyState, ListSection } from '@ainexsuite/ui';
import { TaskCard } from './TaskCard';
import { useTodoStore } from '../../lib/store';
import type { Task } from '../../types/models';

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
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="mb-4 h-40 break-inside-avoid rounded-2xl bg-surface-muted/80 shadow-inner animate-pulse"
        />
      ))}
    </div>
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

  // Separate pinned and unpinned
  const pinnedTasks = useMemo(
    () => spaceTasks.filter((t) => t.pinned),
    [spaceTasks]
  );
  const unpinnedTasks = useMemo(
    () => spaceTasks.filter((t) => !t.pinned),
    [spaceTasks]
  );

  const hasTasks = spaceTasks.length > 0;

  const masonryClasses = 'columns-1 sm:columns-2 lg:columns-3 gap-4';

  if (!currentSpace) return null;

  return (
    <div className="space-y-1 lg:px-0 cq-board">
      {hasTasks ? (
        <div className="space-y-10">
          {/* Pinned Tasks */}
          {pinnedTasks.length > 0 && (
            <ListSection title="Pinned" count={pinnedTasks.length}>
              <div className={viewMode === 'list' ? 'space-y-3' : masonryClasses}>
                {pinnedTasks.map((task) => (
                  <div
                    key={task.id}
                    className={viewMode === 'list' ? '' : 'mb-4 break-inside-avoid'}
                  >
                    <TaskCard task={task} viewMode={viewMode} onEditTask={onEditTask} />
                  </div>
                ))}
              </div>
            </ListSection>
          )}

          {/* All Tasks */}
          {unpinnedTasks.length > 0 && pinnedTasks.length > 0 && (
            <ListSection title="All Tasks" count={unpinnedTasks.length}>
              <div className={viewMode === 'list' ? 'space-y-3' : masonryClasses}>
                {unpinnedTasks.map((task) => (
                  <div
                    key={task.id}
                    className={viewMode === 'list' ? '' : 'mb-4 break-inside-avoid'}
                  >
                    <TaskCard task={task} viewMode={viewMode} onEditTask={onEditTask} />
                  </div>
                ))}
              </div>
            </ListSection>
          )}

          {/* Tasks without section header when no pinned tasks */}
          {unpinnedTasks.length > 0 && pinnedTasks.length === 0 && (
            <div className={viewMode === 'list' ? 'space-y-3' : masonryClasses}>
              {unpinnedTasks.map((task) => (
                <div
                  key={task.id}
                  className={viewMode === 'list' ? '' : 'mb-4 break-inside-avoid'}
                >
                  <TaskCard task={task} viewMode={viewMode} onEditTask={onEditTask} />
                </div>
              ))}
            </div>
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
