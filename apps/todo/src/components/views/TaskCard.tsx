'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { clsx } from 'clsx';
import {
  CheckCircle2,
  Circle,
  Heart,
  Trash2,
} from 'lucide-react';
import { format, isPast, isToday, parseISO } from 'date-fns';
import { ConfirmationDialog, PriorityIcon } from '@ainexsuite/ui';
import { useTodoStore } from '../../lib/store';
import type { Task } from '../../types/models';

interface TaskCardProps {
  task: Task;
  onEditTask: (taskId: string) => void;
}

export function TaskCard({ task, onEditTask }: TaskCardProps) {
  const { updateTask, toggleTaskPin, deleteTask } = useTodoStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const titleInputRef = useRef<HTMLInputElement>(null);

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

  // Default card styling
  const cardClass = 'bg-zinc-50 dark:bg-zinc-900';

  // Due date logic
  const date = task.dueDate ? parseISO(task.dueDate) : null;
  const isOverdue = date && isPast(date) && !isToday(date) && task.status !== 'done';

  // Subtask progress
  const completedSubtasks = task.subtasks?.filter((s) => s.isCompleted).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  const handleToggleComplete = async (event: React.MouseEvent) => {
    event.stopPropagation();
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    await updateTask(task.id, { status: newStatus });
  };

  const handleDeleteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setShowDeleteConfirm(true);
  };

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

  const handlePin = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    await toggleTaskPin(task.id, !task.pinned);
  };

  const handleCardClick = () => {
    if (isEditingTitle) return;
    onEditTask(task.id);
  };

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

  return (
    <>
      <article
        className={clsx(
          cardClass,
          'border border-zinc-200 dark:border-zinc-800',
          'group relative cursor-pointer overflow-hidden rounded-2xl transition-all duration-200',
          'hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md',
          'flex flex-col px-5 py-3 h-[180px]'
        )}
        onClick={handleCardClick}
      >
        {/* Corner Heart Badge - clickable to unfavorite */}
        {task.pinned && (
          <button
            type="button"
            onClick={handlePin}
            className="absolute -top-0 -right-0 w-10 h-10 overflow-hidden rounded-tr-lg z-20 group/pin"
            aria-label="Remove from favorites"
          >
            <div className="absolute top-0 right-0 bg-[var(--color-primary)] group-hover/pin:brightness-90 w-14 h-14 rotate-45 translate-x-7 -translate-y-7 transition-all" />
            <Heart className="absolute top-1.5 right-1.5 h-3 w-3 text-white fill-white" />
          </button>
        )}

        {/* Heart button - only shows on unpinned tasks */}
        {!task.pinned && (
          <button
            type="button"
            onClick={handlePin}
            className="absolute right-2 top-2 z-20 hidden rounded-full p-2 transition group-hover:flex bg-zinc-100 dark:bg-zinc-800 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 hover:brightness-110"
            aria-label="Add to favorites"
          >
            <Heart className="h-4 w-4" />
          </button>
        )}

        {/* Content area - takes available space */}
        <div className="flex-1 overflow-hidden">
          {/* Title with checkbox and priority */}
          <div className="flex items-start gap-3 pr-8">
            {/* Checkbox */}
            <button
              type="button"
              onClick={handleToggleComplete}
              className={clsx(
                'flex-shrink-0 mt-0.5 transition-colors',
                task.status === 'done'
                  ? 'text-green-500'
                  : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
              )}
              aria-label={task.status === 'done' ? 'Mark incomplete' : 'Mark complete'}
            >
              {task.status === 'done' ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {isEditingTitle ? (
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={handleTitleSave}
                    onKeyDown={handleTitleKeyDown}
                    onClick={(e) => e.stopPropagation()}
                    className={clsx(
                      'flex-1 min-w-0 text-[17px] font-semibold tracking-[-0.02em] bg-transparent border-b-2 border-[var(--color-primary)] outline-none',
                      task.status === 'done'
                        ? 'text-zinc-400 dark:text-zinc-500'
                        : 'text-zinc-900 dark:text-zinc-50'
                    )}
                  />
                ) : (
                  <h3
                    onDoubleClick={handleTitleDoubleClick}
                    className={clsx(
                      'text-[17px] font-semibold tracking-[-0.02em] cursor-text line-clamp-1',
                      task.status === 'done'
                        ? 'text-zinc-400 dark:text-zinc-500 line-through'
                        : 'text-zinc-900 dark:text-zinc-50'
                    )}
                    title="Double-click to edit"
                  >
                    {task.title}
                  </h3>
                )}
                {/* Priority indicator */}
                {(task.priority === 'high' || task.priority === 'urgent') && (
                  <PriorityIcon priority={task.priority} size="sm" />
                )}
              </div>

              {/* Description */}
              {task.description && (
                <p className="mt-1 text-[15px] text-zinc-600 dark:text-zinc-400 leading-6 tracking-[-0.01em] line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2 pl-8">
              {task.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                >
                  {tag}
                </span>
              ))}
              {task.tags.length > 3 && (
                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                  +{task.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer with actions - pinned to bottom */}
        <footer className="mt-auto flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {/* Subtask progress */}
            {totalSubtasks > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-zinc-200 dark:bg-zinc-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">
                {completedSubtasks}/{totalSubtasks}
              </span>
            )}

            {/* Date: show due date if exists (with overdue styling), otherwise show updated date */}
            {date ? (
              <span
                className={clsx(
                  isOverdue && 'text-red-500 dark:text-red-400'
                )}
              >
                {isOverdue ? 'Overdue · ' : ''}{format(date, 'MMM d')}
              </span>
            ) : (
              <span>
                {new Date(task.updatedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            {/* Heart/Pin button - only shows on non-pinned tasks */}
            {!task.pinned && (
              <button
                type="button"
                onClick={handlePin}
                className="h-7 w-7 rounded-full flex items-center justify-center transition text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 hover:brightness-110"
                aria-label="Add to favorites"
              >
                <Heart className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={handleDeleteClick}
              className="h-7 w-7 rounded-full flex items-center justify-center transition text-red-400 hover:bg-red-500/20 hover:text-red-500"
              aria-label="Delete task"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </footer>
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
