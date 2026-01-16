'use client';

import { clsx } from 'clsx';
import { useDroppable } from '@dnd-kit/core';

interface GroupDropZoneProps {
  groupId: string;
  isEmpty: boolean;
  isCollapsed: boolean;
  children: React.ReactNode;
}

export function GroupDropZone({
  groupId,
  isEmpty,
  isCollapsed,
  children,
}: GroupDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `group-drop-${groupId}`,
    data: { type: 'group', groupId },
  });

  if (isCollapsed) {
    // When collapsed, don't show drop zone, but tasks still exist
    return <>{children}</>;
  }

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        'rounded-lg transition-all duration-150',
        isOver && 'bg-blue-50 dark:bg-blue-950/30 ring-2 ring-blue-400 ring-inset'
      )}
    >
      {isEmpty ? (
        // Empty state - show drop zone hint
        <div
          className={clsx(
            'px-4 py-8 rounded-lg border-2 border-dashed transition-colors',
            isOver
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/30'
              : 'border-zinc-300 dark:border-zinc-600 bg-zinc-50/50 dark:bg-zinc-900/20'
          )}
        >
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            {isOver ? 'Drop tasks here' : 'Drag tasks here to add'}
          </p>
        </div>
      ) : (
        // Has tasks - show them with drop zone around
        <div className="pl-6">{children}</div>
      )}
    </div>
  );
}
