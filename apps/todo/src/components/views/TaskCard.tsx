'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { Calendar, Circle, CheckCircle2, X, Clock, Star } from 'lucide-react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  ConfirmationDialog,
  EntryFooterToolbar,
  TremorCalendar,
  type FooterPriorityLevel,
} from '@ainexsuite/ui';
import { useTodoStore } from '../../lib/store';
import type { Task, Priority } from '../../types/models';

interface TaskCardProps {
  task: Task;
  isSubtask?: boolean;
  /** Stats for subtasks of this task */
  childrenStats?: { completed: number; total: number } | null;
}

export function TaskCard({ task, isSubtask = false, childrenStats = null }: TaskCardProps) {
  const { updateTask, deleteTask, addTask } = useTodoStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerPos, setDatePickerPos] = useState({ x: 0, y: 0 });
  const [dueTime, setDueTime] = useState(() => {
    // Extract time from dueDate if it has time component
    if (task.dueDate && task.dueDate.includes('T')) {
      const timePart = task.dueDate.split('T')[1];
      if (timePart) return timePart.substring(0, 5);
    }
    return '';
  });
  const titleInputRef = useRef<HTMLInputElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);

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

  // Reset dueTime when task.dueDate changes
  useEffect(() => {
    if (task.dueDate && task.dueDate.includes('T')) {
      const timePart = task.dueDate.split('T')[1];
      if (timePart) setDueTime(timePart.substring(0, 5));
    } else {
      setDueTime('');
    }
  }, [task.dueDate]);

  // Date picker handlers
  const handleDateSelect = useCallback(async (date: Date | undefined) => {
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const fullDueDate = dueTime ? `${dateStr}T${dueTime}` : dateStr;
      await updateTask(task.id, { dueDate: fullDueDate });
    }
  }, [task.id, dueTime, updateTask]);

  const handleTimeChange = useCallback(async (newTime: string) => {
    setDueTime(newTime);
    if (task.dueDate) {
      const datePart = task.dueDate.split('T')[0];
      const fullDueDate = newTime ? `${datePart}T${newTime}` : datePart;
      await updateTask(task.id, { dueDate: fullDueDate });
    }
  }, [task.id, task.dueDate, updateTask]);

  const handleClearDate = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDueTime('');
    await updateTask(task.id, { dueDate: '' });
    setShowDatePicker(false);
  }, [task.id, updateTask]);

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

  const handlePriorityChange = async (priority: FooterPriorityLevel) => {
    // Map footer priority to task priority (task has 'urgent' but footer uses high/medium/low/null)
    const taskPriority: Priority = priority === null ? 'low' : priority as Priority;
    await updateTask(task.id, { priority: taskPriority });
  };

  // Map task priority to footer priority level
  const footerPriority: FooterPriorityLevel =
    task.priority === 'urgent' ? 'high' :
    task.priority === 'low' ? null :
    task.priority as FooterPriorityLevel;

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

  // Toggle task completion
  const handleToggleComplete = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    await updateTask(task.id, { status: newStatus });
  }, [task.id, task.status, updateTask]);

  // Toggle favorite status
  const handleToggleFavorite = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    await updateTask(task.id, { favorited: !task.favorited });
  }, [task.id, task.favorited, updateTask]);

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
          'flex items-center gap-2 px-4 py-0',
          // Subtle hover state
          'hover:bg-zinc-100 dark:hover:bg-zinc-800/50 rounded-md',
          // Cursor - move cursor for dragging
          'cursor-move',
          // Dragging state - hide original since DragOverlay shows preview
          isDragging && 'opacity-30 scale-95 z-50',
          // Drop target indicator (show when task can receive subtasks)
          !isSubtask && isOverTask && 'ring-2 ring-[var(--color-primary)] ring-inset'
        )}
      >
        {/* Primary color accent bar for subtasks */}
        {isSubtask && (
          <div
            className="absolute top-0 bottom-0 left-1 w-0.5 rounded-full opacity-30"
            style={{ backgroundColor: 'var(--color-primary)' }}
          />
        )}

        {/* Completion checkbox - using primary color like Notes checklist */}
        <button
          type="button"
          onClick={handleToggleComplete}
          onPointerDown={(e) => e.stopPropagation()}
          className="flex-shrink-0 p-0.5 transition-transform active:scale-90"
          title={task.status === 'done' ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {task.status === 'done' ? (
            <CheckCircle2
              className="h-4 w-4"
              style={{ color: 'var(--color-primary)', fill: 'var(--color-primary)' }}
              strokeWidth={0}
            />
          ) : (
            <Circle
              className="h-4 w-4 text-zinc-400 hover:text-zinc-500 dark:text-zinc-500 dark:hover:text-zinc-400 transition-colors"
              strokeWidth={2}
            />
          )}
        </button>

        {/* Content - Title + Tags + Due date */}
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
              className="flex-1 min-w-0 text-xs font-medium bg-transparent border-b border-[var(--color-primary)] outline-none cursor-text text-zinc-900 dark:text-zinc-100"
            />
          ) : (
            <h3
              onDoubleClick={handleTitleDoubleClick}
              onPointerDown={(e) => e.stopPropagation()}
              className={clsx(
                'text-xs font-medium cursor-text truncate transition-all',
                task.status === 'done'
                  ? 'text-zinc-400 dark:text-zinc-500 line-through decoration-zinc-300 dark:decoration-zinc-600 opacity-50'
                  : 'text-zinc-700 dark:text-zinc-300'
              )}
              title="Double-click to edit"
            >
              {task.title}
            </h3>
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

          {/* Subtask progress badge */}
          {childrenStats && childrenStats.total > 0 && (
            <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 tabular-nums flex-shrink-0 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
              {childrenStats.completed}/{childrenStats.total}
            </span>
          )}
        </div>

        {/* Right: Favorite + Date picker + Footer toolbar - hidden until hover */}
        <div
          className="flex-shrink-0 flex items-center gap-1 cursor-default opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {/* Favorite Toggle */}
          <button
            type="button"
            onClick={handleToggleFavorite}
            className={clsx(
              'p-1.5 rounded-lg text-[11px] transition-colors',
              task.favorited
                ? 'text-amber-500 hover:bg-amber-500/10'
                : 'text-zinc-400 dark:text-zinc-500 hover:text-amber-400 hover:bg-amber-500/10'
            )}
            aria-label={task.favorited ? 'Remove from favorites' : 'Add to favorites'}
            title={task.favorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={clsx('h-3.5 w-3.5', task.favorited && 'fill-current')} />
          </button>

          {/* Date Picker Button */}
          <div ref={datePickerRef} className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (datePickerRef.current) {
                  const rect = datePickerRef.current.getBoundingClientRect();
                  setDatePickerPos({
                    x: rect.left + rect.width / 2,
                    y: rect.bottom,
                  });
                }
                setShowDatePicker(!showDatePicker);
              }}
              className={clsx(
                'flex items-center gap-1 px-1.5 py-1 rounded-lg text-[11px] transition-colors',
                task.dueDate
                  ? 'text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10'
                  : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              )}
              aria-label="Set due date"
            >
              <Calendar className="h-3.5 w-3.5" />
            </button>

            {/* Date Picker Dropdown via Portal */}
            {showDatePicker && typeof document !== 'undefined' && createPortal(
              <div
                className="fixed z-[9999] rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200"
                style={{
                  left: datePickerPos.x,
                  top: datePickerPos.y + 8,
                  transform: 'translateX(-50%)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <TremorCalendar
                  mode="single"
                  selected={task.dueDate ? new Date(task.dueDate.split('T')[0] + 'T00:00:00') : undefined}
                  onSelect={handleDateSelect}
                  enableYearNavigation
                />

                {/* Time Picker */}
                <div className="px-3 py-2 border-t border-zinc-200 dark:border-zinc-700">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-zinc-400" />
                    <input
                      type="time"
                      value={dueTime}
                      onChange={(e) => handleTimeChange(e.target.value)}
                      className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none [&::-webkit-calendar-picker-indicator]:dark:invert"
                      placeholder="Add time"
                    />
                    {dueTime && (
                      <button
                        type="button"
                        onClick={() => handleTimeChange('')}
                        className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Clear & Done Buttons */}
                <div className="px-3 pb-3 pt-1 flex items-center gap-2">
                  {task.dueDate && (
                    <button
                      type="button"
                      onClick={handleClearDate}
                      className="flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(false)}
                    className="flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90"
                  >
                    Done
                  </button>
                </div>
              </div>,
              document.body
            )}
          </div>

          <EntryFooterToolbar
            variant="card"
            entryId={task.id}
            priority={footerPriority}
            onPriorityChange={handlePriorityChange}
            onDuplicate={handleDuplicate}
            onDelete={() => setShowDeleteConfirm(true)}
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
