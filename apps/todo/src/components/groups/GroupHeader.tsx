'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Trash2, Edit2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useDroppable } from '@dnd-kit/core';
import type { TaskGroup } from '../../types/models';

interface GroupHeaderProps {
  group: TaskGroup;
  count: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onRename: (newName: string) => void;
  onDelete: () => void;
}

export function GroupHeader({
  group,
  count,
  isCollapsed,
  onToggleCollapse,
  onRename,
  onDelete,
}: GroupHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(group.name);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Make group header droppable (for receiving tasks)
  const { setNodeRef, isOver } = useDroppable({
    id: `group-${group.id}`,
    data: { type: 'group', groupId: group.id },
  });

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  const handleSaveName = () => {
    const trimmedName = editName.trim();
    if (trimmedName && trimmedName !== group.name) {
      onRename(trimmedName);
    } else {
      setEditName(group.name);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveName();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditName(group.name);
      setIsEditing(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
        'group/header',
        isOver && 'bg-blue-50 dark:bg-blue-950/30 ring-2 ring-blue-400 ring-inset'
      )}
    >
      {/* Collapse/Expand button */}
      <button
        type="button"
        onClick={onToggleCollapse}
        onPointerDown={(e) => e.stopPropagation()}
        className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors flex-shrink-0"
        title={isCollapsed ? 'Expand group' : 'Collapse group'}
        aria-label={isCollapsed ? 'Expand group' : 'Collapse group'}
      >
        <ChevronDown
          className={clsx('h-4 w-4 transition-transform', isCollapsed && 'rotate-[-90deg]')}
        />
      </button>

      {/* Group name (editable) */}
      {isEditing ? (
        <input
          ref={editInputRef}
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={handleSaveName}
          onKeyDown={handleKeyDown}
          onPointerDown={(e) => e.stopPropagation()}
          className="flex-1 min-w-0 px-2 py-1 text-sm font-semibold bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded outline-none text-zinc-900 dark:text-zinc-100"
        />
      ) : (
        <h3
          onDoubleClick={() => setIsEditing(true)}
          onPointerDown={(e) => e.stopPropagation()}
          className="flex-1 min-w-0 text-sm font-semibold text-zinc-800 dark:text-zinc-200 cursor-text truncate"
          title="Double-click to rename"
        >
          {group.name}
        </h3>
      )}

      {/* Count badge */}
      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex-shrink-0">
        {count}
      </span>

      {/* Action buttons (rename, delete) - visible on hover */}
      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover/header:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          onPointerDown={(e) => e.stopPropagation()}
          className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          title="Rename group"
          aria-label="Rename group"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={onDelete}
          onPointerDown={(e) => e.stopPropagation()}
          className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-950/30 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          title="Delete group (tasks will be ungrouped)"
          aria-label="Delete group"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
