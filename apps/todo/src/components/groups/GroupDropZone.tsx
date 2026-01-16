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
      )}
    >
      {isEmpty ? (
        // Empty state - show drop zone hint with glow
        <div
          className={clsx(
            'px-4 py-8 rounded-lg border-2 border-dashed transition-all duration-200',
            isOver
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/40 ring-2 ring-blue-400/50'
              : 'border-zinc-300 dark:border-zinc-600 bg-zinc-50/30 dark:bg-zinc-900/10'
          )}
        >
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            {isOver ? 'Drop tasks here' : 'Drag tasks here to add'}
          </p>
        </div>
      ) : (
        // Has tasks - show them without indentation
        <div className={clsx(
          'transition-colors duration-200',
          isOver && 'bg-blue-50/40 dark:bg-blue-950/20 rounded-lg p-2'
        )}>
          {children}
        </div>
      )}
    </div>
  );
}
