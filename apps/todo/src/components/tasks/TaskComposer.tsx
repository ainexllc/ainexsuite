'use client';

import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Flame, Plus, Calendar, X, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '@ainexsuite/auth';
import { useTodoStore } from '@/lib/store';
import { useSpaces } from '@/components/providers/spaces-provider';
import { Task, Priority, TaskList, Member } from '@/types/models';
import { TremorCalendar } from '@ainexsuite/ui';

interface TaskComposerProps {
  placeholder?: string;
}

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; iconColor: string; bgColor: string }> = {
  low: { label: 'Low', color: 'text-blue-600 dark:text-blue-400', iconColor: 'text-blue-500', bgColor: 'bg-blue-500/20' },
  medium: { label: 'Medium', color: 'text-amber-600 dark:text-amber-400', iconColor: 'text-amber-500', bgColor: 'bg-amber-500/20' },
  high: { label: 'High', color: 'text-red-500 dark:text-red-400', iconColor: 'text-red-500', bgColor: 'bg-red-500/20' },
  urgent: { label: 'Urgent', color: 'text-purple-600 dark:text-purple-400', iconColor: 'text-purple-500', bgColor: 'bg-purple-500/20' },
};

export function TaskComposer({ placeholder = 'Create todo' }: TaskComposerProps) {
  const { user } = useAuth();
  const { currentSpace: spacesCurrentSpace } = useSpaces();
  const { addTask } = useTodoStore();

  // Build effective space with default lists for task creation
  const defaultLists: TaskList[] = useMemo(
    () => [
      { id: 'default_todo', title: 'To Do', order: 0 },
      { id: 'default_progress', title: 'In Progress', order: 1 },
      { id: 'default_done', title: 'Done', order: 2 },
    ],
    []
  );

  const effectiveSpace = useMemo(
    () => ({
      id: spacesCurrentSpace?.id || 'personal',
      name: spacesCurrentSpace?.name || 'My Todos',
      type: spacesCurrentSpace?.type || 'personal',
      members: ((spacesCurrentSpace as unknown as { members?: Member[] })?.members || []) as Member[],
      memberUids: (spacesCurrentSpace?.memberUids || []) as string[],
      lists: ((spacesCurrentSpace as unknown as { lists?: TaskList[] })?.lists || defaultLists) as TaskList[],
      createdAt: new Date().toISOString(),
      createdBy: '',
    }),
    [spacesCurrentSpace, defaultLists]
  );

  // Simplified state - just title, dueDate, dueTime, priority
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Picker positions for portals
  const [datePickerPos, setDatePickerPos] = useState({ x: 0, y: 0 });
  const [priorityPickerPos, setPriorityPickerPos] = useState({ x: 0, y: 0 });

  const inputRef = useRef<HTMLInputElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const datePickerDropdownRef = useRef<HTMLDivElement>(null);
  const priorityPickerRef = useRef<HTMLDivElement>(null);
  const priorityPickerDropdownRef = useRef<HTMLDivElement>(null);
  const isSubmittingRef = useRef(false);
  const shouldFocusAfterSubmit = useRef(false);

  // Focus input after submission completes
  useEffect(() => {
    if (!isSubmitting && shouldFocusAfterSubmit.current) {
      shouldFocusAfterSubmit.current = false;
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  }, [isSubmitting]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    if (!showDatePicker && !showPriorityPicker) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (showDatePicker) {
        const clickedDateButton = datePickerRef.current?.contains(target);
        const clickedDateDropdown = datePickerDropdownRef.current?.contains(target);
        if (!clickedDateButton && !clickedDateDropdown) {
          setShowDatePicker(false);
        }
      }

      if (showPriorityPicker) {
        const clickedPriorityButton = priorityPickerRef.current?.contains(target);
        const clickedPriorityDropdown = priorityPickerDropdownRef.current?.contains(target);
        if (!clickedPriorityButton && !clickedPriorityDropdown) {
          setShowPriorityPicker(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDatePicker, showPriorityPicker]);

  const resetState = useCallback(() => {
    setTitle('');
    setDueDate('');
    setDueTime('');
    setPriority('medium');
    setShowDatePicker(false);
    setShowPriorityPicker(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (isSubmittingRef.current || isSubmitting || !effectiveSpace || !user) return;
    if (!title.trim()) return;

    try {
      isSubmittingRef.current = true;
      shouldFocusAfterSubmit.current = true;
      setIsSubmitting(true);

      // Combine date and time if both are set
      const fullDueDate = dueDate && dueTime
        ? `${dueDate}T${dueTime}`
        : dueDate;

      const newTask: Task = {
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        spaceId: effectiveSpace.id,
        listId: effectiveSpace.lists[0]?.id || 'default',
        title: title.trim(),
        description: '',
        type: 'text',
        checklist: [],
        status: 'todo',
        priority,
        dueDate: fullDueDate,
        assigneeIds: [user.uid],
        subtasks: [],
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: user.uid,
        ownerId: user.uid,
        order: 0,
        color: 'default',
      };

      await addTask(newTask);
      resetState();
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [isSubmitting, effectiveSpace, user, title, priority, dueDate, dueTime, addTask, resetState]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  const handleDateSelect = useCallback((date: Date | undefined) => {
    if (date) {
      // Use local date parts instead of toISOString() to avoid timezone shift
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      setDueDate(`${year}-${month}-${day}`);
    }
    // Don't close the picker immediately so user can set time
  }, []);

  const handleClearDate = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setDueDate('');
    setDueTime('');
  }, []);

  const formatDueDate = (dateStr: string, timeStr: string): string => {
    if (!dateStr) return '';
    // Parse as local time to avoid timezone shift
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let dateLabel: string;
    if (date.toDateString() === today.toDateString()) {
      dateLabel = 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      dateLabel = 'Tomorrow';
    } else {
      dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    if (timeStr) {
      // Format time to 12-hour format
      const [hours, minutes] = timeStr.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const hour12 = hours % 12 || 12;
      return `${dateLabel} ${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
    }

    return dateLabel;
  };

  if (!user) return null;

  const priorityConfig = PRIORITY_CONFIG[priority];

  return (
    <section className="w-full">
      <div className="flex w-full items-center gap-2 rounded-xl border px-4 py-3 shadow-sm transition bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/20">
        {/* Plus Icon */}
        <Plus className="h-4 w-4 text-zinc-400 dark:text-zinc-500 flex-shrink-0" />

        {/* Title Input */}
        <input
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isSubmitting}
          className="flex-1 min-w-0 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none disabled:opacity-50"
        />

        {/* Due Date Button */}
        <div ref={datePickerRef} className="relative flex-shrink-0">
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
              setShowPriorityPicker(false);
            }}
            className={clsx(
              'flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-colors',
              dueDate
                ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20'
                : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            )}
            aria-label="Set due date"
          >
            <Calendar className="h-4 w-4" />
            {dueDate && <span className="font-medium">{formatDueDate(dueDate, dueTime)}</span>}
            {dueDate && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClearDate}
                onKeyDown={(e) => e.key === 'Enter' && handleClearDate(e as unknown as React.MouseEvent)}
                className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
                aria-label="Clear date"
              >
                <X className="h-3 w-3" />
              </span>
            )}
          </button>

          {/* Date Picker Dropdown via Portal */}
          {showDatePicker && typeof document !== 'undefined' && createPortal(
            <div
              ref={datePickerDropdownRef}
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
                selected={dueDate ? new Date(dueDate + 'T00:00:00') : undefined}
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
                    onChange={(e) => setDueTime(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none [&::-webkit-calendar-picker-indicator]:dark:invert"
                    placeholder="Add time"
                  />
                  {dueTime && (
                    <button
                      type="button"
                      onClick={() => setDueTime('')}
                      className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Done Button */}
              <div className="px-3 pb-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowDatePicker(false)}
                  className="w-full py-1.5 text-xs font-medium rounded-lg transition-colors bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90"
                >
                  Done
                </button>
              </div>
            </div>,
            document.body
          )}
        </div>

        {/* Priority Button */}
        <div ref={priorityPickerRef} className="relative flex-shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (priorityPickerRef.current) {
                const rect = priorityPickerRef.current.getBoundingClientRect();
                setPriorityPickerPos({
                  x: rect.left + rect.width / 2,
                  y: rect.top - 8,
                });
              }
              setShowPriorityPicker(!showPriorityPicker);
              setShowDatePicker(false);
            }}
            className="h-7 w-7 rounded-full flex items-center justify-center transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Set priority"
            title={`${priorityConfig.label} priority`}
          >
            <Flame className={clsx('h-4 w-4', priorityConfig.iconColor)} />
          </button>

          {/* Priority Picker Dropdown via Portal */}
          {showPriorityPicker && typeof document !== 'undefined' && createPortal(
            <div
              ref={priorityPickerDropdownRef}
              className="fixed z-[9999] flex flex-col gap-0.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-1.5 shadow-2xl min-w-[110px] animate-in fade-in slide-in-from-bottom-2 duration-200"
              style={{
                left: priorityPickerPos.x,
                top: priorityPickerPos.y,
                transform: 'translate(-50%, -100%)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {(['high', 'medium', 'low', 'urgent'] as Priority[]).map((p) => {
                const config = PRIORITY_CONFIG[p];
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPriority(p);
                      setShowPriorityPicker(false);
                    }}
                    className={clsx(
                      'flex items-center gap-1.5 px-2 py-1 rounded-xl text-xs font-medium transition',
                      priority === p
                        ? clsx(config.bgColor, config.color)
                        : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    )}
                  >
                    <Flame className={clsx('h-3 w-3', config.iconColor)} />
                    {config.label}
                  </button>
                );
              })}
            </div>,
            document.body
          )}
        </div>

        {/* Enter Hint */}
        <span className="text-xs text-zinc-300 dark:text-zinc-600 flex-shrink-0 hidden sm:block">
          ↵
        </span>
      </div>
    </section>
  );
}
