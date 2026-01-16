'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { clsx } from 'clsx';
import { Calendar, ChevronRight, ChevronLeft } from 'lucide-react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  ConfirmationDialog,
  EntryFooterToolbar,
  getEntryColorConfig,
  type FooterPriorityLevel,
  type EntryColor,
  type FooterSpace,
} from '@ainexsuite/ui';
import { useTodoStore } from '../../lib/store';
import { useSpaces } from '../providers/spaces-provider';
import type { Task, Priority } from '../../types/models';

interface TaskCardProps {
  task: Task;
  isSubtask?: boolean;
  parentTasks?: Task[]; // Available parent tasks for indenting
}

export function TaskCard({ task, isSubtask = false, parentTasks = [] }: TaskCardProps) {
  const { updateTask, deleteTask, addTask } = useTodoStore();
  const { spaces } = useSpaces();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Drag and drop
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    transform,
    isDragging,
  } = useDraggable({
    id: task.id,
    data: { type: 'task', task, taskId: task.id },
  });

  // Make task droppable (for subtasks) - only if not a subtask itself
  const {
    setNodeRef: setDropRef,
    isOver: isOverTask,
  } = useDroppable({
    id: `task-drop-${task.id}`,
    data: { type: 'task', taskId: task.id },
    disabled: isSubtask, // Don't allow dropping on subtasks
  });

  // Merge refs
  const setNodeRef = (el: HTMLElement | null) => {
    setDragRef(el);
    setDropRef(el);
  };

  const dragStyle = transform ? {
    transform: CSS.Translate.toString(transform),
  } : undefined;

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  // Reset edit title when task changes
  useEffect(() => {
    setEditTitle(task.title);
  }, [task.title]);

  // Get color config for subtle background tint
  const colorConfig = getEntryColorConfig(task.color || 'default');

  const handleConfirmDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      await deleteTask(task.id);
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    if (isDeleting) return;
    setShowDeleteConfirm(false);
  };

  const handleDuplicate = async () => {
    const now = new Date().toISOString();
    const duplicatedTask: Task = {
      ...task,
      id: `${task.id}-copy-${Date.now()}`,
      title: `${task.title} (Copy)`,
      favorited: false,
      createdAt: now,
      updatedAt: now,
      order: task.order + 0.001, // Place just after original
    };
    await addTask(duplicatedTask);
  };

  const handleColorChange = async (color: EntryColor) => {
    await updateTask(task.id, { color });
  };

  const handlePriorityChange = async (priority: FooterPriorityLevel) => {
    // Map footer priority to task priority (task has 'urgent' but footer uses high/medium/low/null)
    const taskPriority: Priority = priority === null ? 'low' : priority as Priority;
    await updateTask(task.id, { priority: taskPriority });
  };

  const handleMoveToSpace = async (spaceId: string) => {
    if (spaceId !== task.spaceId) {
      // Move to new space and clear group assignment (move to ungrouped)
      await updateTask(task.id, { spaceId, groupId: undefined });
    }
  };

  // Map task priority to footer priority level
  const footerPriority: FooterPriorityLevel =
    task.priority === 'urgent' ? 'high' :
    task.priority === 'low' ? null :
    task.priority as FooterPriorityLevel;

  // Map spaces for the footer toolbar
  const footerSpaces: FooterSpace[] = spaces.map((s) => ({
    id: s.id,
    name: s.name,
  }));

  const handleTitleDoubleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsEditingTitle(true);
  };

  const handleTitleSave = useCallback(async () => {
    const trimmedTitle = editTitle.trim();
    if (trimmedTitle && trimmedTitle !== task.title) {
      await updateTask(task.id, { title: trimmedTitle });
    } else {
      setEditTitle(task.title);
    }
    setIsEditingTitle(false);
  }, [editTitle, task.id, task.title, updateTask]);

  const handleTitleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleTitleSave();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setEditTitle(task.title);
      setIsEditingTitle(false);
    }
  };

  // Indent into first parent task
  const handleIndent = useCallback(() => {
    if (parentTasks.length > 0) {
      const firstTask = parentTasks.find(t => !t.parentId);
      if (firstTask) {
        updateTask(task.id, { parentId: firstTask.id });
      }
    }
  }, [task.id, parentTasks, updateTask]);

  // Unindent from parent
  const handleUnindent = useCallback(() => {
    updateTask(task.id, { parentId: undefined });
  }, [task.id, updateTask]);

  // Format due date for display
  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Check if task is overdue
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <>
      <article
        ref={setNodeRef}
        style={dragStyle}
        {...attributes}
        {...listeners}
        className={clsx(
          'group relative transition-all duration-200',
          // Minimal row design - no pill/card appearance
          'flex items-center gap-2 px-2 py-2',
          // Subtle color tint background
          colorConfig.cardClass,
          // Subtle hover state
          'hover:opacity-80 rounded-md',
          // Cursor - move cursor for dragging
          'cursor-move',
          // Dragging state
          isDragging && 'opacity-50 z-50',
          // Drop target indicator (show when task can receive subtasks)
          !isSubtask && isOverTask && 'ring-2 ring-[var(--color-primary)] ring-inset'
        )}
      >

        {/* Middle: Content - Title + Priority + Tags + Due date */}
        <div className="flex-1 min-w-0 flex items-center gap-3">
          {/* Title */}
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleTitleKeyDown}
              onPointerDown={(e) => e.stopPropagation()}
              className="flex-1 min-w-0 text-sm font-medium bg-transparent border-b border-[var(--color-primary)] outline-none cursor-text text-zinc-900 dark:text-zinc-100"
            />
          ) : (
            <h3
              onDoubleClick={handleTitleDoubleClick}
              onPointerDown={(e) => e.stopPropagation()}
              className={clsx(
                'text-sm font-medium cursor-text truncate',
                task.status === 'done'
                  ? 'text-zinc-400 dark:text-zinc-500 line-through'
                  : 'text-zinc-800 dark:text-zinc-200'
              )}
              title="Double-click to edit"
            >
              {task.title}
            </h3>
          )}

          {/* Indent/Unindent buttons - for parent tasks or subtasks in groups */}
          {parentTasks.length > 0 && (
            <div className="flex items-center gap-0.5 flex-shrink-0">
              {isSubtask && task.parentId ? (
                // Subtask: show unindent button
                <button
                  type="button"
                  onClick={handleUnindent}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                  title="Unindent (move up one level)"
                  aria-label="Unindent"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
              ) : !isSubtask ? (
                // Parent task: show indent button
                <button
                  type="button"
                  onClick={handleIndent}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                  title="Indent (make subtask)"
                  aria-label="Indent"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
          )}

          {/* Tags (condensed - max 2) */}
          {task.tags && task.tags.length > 0 && (
            <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
              {task.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                >
                  {tag}
                </span>
              ))}
              {task.tags.length > 2 && (
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  +{task.tags.length - 2}
                </span>
              )}
            </div>
          )}

          {/* Due date */}
          {task.dueDate && (
            <div className={clsx(
              'hidden sm:flex items-center gap-1 text-[11px] font-medium flex-shrink-0',
              isOverdue ? 'text-red-500' : 'text-zinc-500 dark:text-zinc-400'
            )}>
              <Calendar className="h-3 w-3" />
              <span>{formatDueDate(task.dueDate)}</span>
            </div>
          )}
        </div>

        {/* Right: Footer toolbar - stops drag propagation */}
        <div
          className="flex-shrink-0 cursor-default"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <EntryFooterToolbar
            variant="card"
            entryId={task.id}
            spaces={footerSpaces}
            currentSpaceId={task.spaceId}
            onMoveToSpace={handleMoveToSpace}
            color={task.color || 'default'}
            onColorChange={handleColorChange}
            priority={footerPriority}
            onPriorityChange={handlePriorityChange}
            onDuplicate={handleDuplicate}
            onDelete={() => setShowDeleteConfirm(true)}
            showColorPicker
            showPriorityPicker
            compact={true}
          />
        </div>
      </article>

      {/* Delete confirmation */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete this task?"
        description="This will permanently delete your task. This action cannot be undone."
        confirmText="Delete task"
        cancelText="Keep task"
        variant="danger"
      />
    </>
  );
}
