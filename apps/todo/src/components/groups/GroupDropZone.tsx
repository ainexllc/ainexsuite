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
        // Empty state - compact drop zone hint
        <div
          className={clsx(
            'px-4 py-3 rounded-md border border-dashed transition-all duration-200',
            isOver
              ? 'border-blue-500 bg-blue-100/60 dark:bg-blue-900/40 ring-1 ring-blue-500'
              : 'border-zinc-300 dark:border-zinc-700 bg-zinc-50/20 dark:bg-zinc-900/10'
          )}
        >
          <p className={clsx(
            'text-center text-xs transition-colors',
            isOver
              ? 'text-blue-600 dark:text-blue-400 font-medium'
              : 'text-zinc-400 dark:text-zinc-500'
          )}>
            {isOver ? 'Drop here' : 'Drop tasks here'}
          </p>
        </div>
      ) : (
        // Has tasks - show them with enhanced hover feedback
        <div className={clsx(
          'transition-all duration-200 rounded-lg',
          isOver && 'bg-blue-100/60 dark:bg-blue-900/40 ring-2 ring-blue-500 scale-[1.01] p-2'
        )}>
          {children}
        </div>
      )}
    </div>
  );
}
