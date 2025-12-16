'use client';

import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import {
  Calendar,
  Flag,
  Users,
  Pin,
  PinOff,
  Palette,
  X,
  Tag,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '@ainexsuite/auth';
import { useTodoStore } from '@/lib/store';
import { Task, Priority, TaskList, Member } from '@/types/models';
import { ENTRY_COLORS, getEntryColorConfig } from '@ainexsuite/ui';
import type { EntryColor } from '@ainexsuite/types';

export function TaskComposer() {
  const { user } = useAuth();
  const { getCurrentSpace, addTask } = useTodoStore();
  const currentSpace = getCurrentSpace();

  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [assignees, setAssignees] = useState<string[]>([]);
  const [listId, setListId] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Visual state
  const [color, setColor] = useState<EntryColor>('default');
  const [pinned, setPinned] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);

  const composerRef = useRef<HTMLDivElement | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const isSubmittingRef = useRef(false);

  // Set default list when space changes
  useEffect(() => {
    if (currentSpace && currentSpace.lists.length > 0 && !listId) {
      setListId(currentSpace.lists[0].id);
    }
  }, [currentSpace, listId]);

  const hasContent = useMemo(() => {
    return Boolean(title.trim() || description.trim());
  }, [title, description]);

  const resetState = useCallback(() => {
    setExpanded(false);
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
    setAssignees([]);
    setListId(currentSpace?.lists[0]?.id || '');
    setTags([]);
    setTagInput('');
    setColor('default');
    setPinned(false);
    setShowPalette(false);
    setShowTagInput(false);
  }, [currentSpace]);

  const handleSubmit = useCallback(async () => {
    // Use ref for immediate check to prevent race conditions
    if (isSubmittingRef.current || isSubmitting || !currentSpace || !user) return;

    if (!hasContent) {
      resetState();
      return;
    }

    try {
      // Set both ref and state immediately
      isSubmittingRef.current = true;
      setIsSubmitting(true);

      const newTask: Task = {
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        spaceId: currentSpace.id,
        listId: listId || currentSpace.lists[0]?.id || 'default',
        title: title.trim(),
        description: description.trim(),
        status: 'todo',
        priority,
        dueDate,
        assigneeIds: assignees.length > 0 ? assignees : [user.uid],
        subtasks: [],
        tags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: user.uid,
        ownerId: user.uid,
        order: 0,
        color,
        pinned,
      };

      await addTask(newTask);
      resetState();
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [isSubmitting, currentSpace, user, hasContent, resetState, title, description, priority, dueDate, assignees, listId, tags, color, pinned, addTask]);

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Click outside to save/close
  useEffect(() => {
    if (!expanded) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!composerRef.current) return;
      if (composerRef.current.contains(event.target as Node)) return;
      // Use ref for immediate check to prevent race conditions
      if (isSubmittingRef.current || isSubmitting) return;

      if (hasContent) {
        void handleSubmit();
      } else {
        resetState();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [expanded, hasContent, handleSubmit, resetState, isSubmitting]);

  if (!currentSpace || !user) return null;

  const colorConfig = getEntryColorConfig(color);

  return (
    <section className="w-full">
      {!expanded ? (
        <button
          type="button"
          className="flex w-full items-center rounded-2xl border px-5 py-4 text-left text-sm shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
          onClick={() => setExpanded(true)}
        >
          <span>Add a task...</span>
        </button>
      ) : (
        <div
          ref={composerRef}
          className={clsx(
            'w-full rounded-2xl shadow-lg border transition-all',
            colorConfig.cardClass,
            'border-zinc-200 dark:border-zinc-800'
          )}
        >
          <div className="flex flex-col gap-4 px-5 py-4">
            {/* Title row with pin button */}
            <div className="flex items-start gap-3">
              <input
                ref={titleInputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title"
                className="w-full bg-transparent text-lg font-semibold focus:outline-none text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setPinned((prev) => !prev)}
                className={clsx(
                  'p-2 rounded-full transition-colors',
                  pinned
                    ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/10'
                    : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                )}
                aria-label={pinned ? 'Unpin task' : 'Pin task'}
              >
                {pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
              </button>
            </div>

            {/* Description */}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                  event.preventDefault();
                  void handleSubmit();
                }
              }}
              placeholder="Add details..."
              rows={3}
              className="min-h-[80px] w-full resize-none bg-transparent text-[15px] focus:outline-none leading-7 tracking-[-0.01em] text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
            />

            {/* List Selection */}
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">List</label>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {currentSpace.lists.map((list: TaskList) => (
                  <button
                    key={list.id}
                    type="button"
                    onClick={() => setListId(list.id)}
                    className={clsx(
                      'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
                      listId === list.id
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    )}
                  >
                    {list.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority & Due Date Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Priority */}
              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 flex items-center gap-1">
                  <Flag className="h-3 w-3" /> Priority
                </label>
                <div className="flex gap-1.5">
                  {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={clsx(
                        'flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-all',
                        priority === p
                          ? p === 'high'
                            ? 'bg-red-500/20 text-red-500 border border-red-500/50'
                            : 'bg-[var(--color-primary)]/20 text-[var(--color-primary)] border border-[var(--color-primary)]/50'
                          : 'bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
            </div>

            {/* Assignees */}
            {currentSpace.members.length > 1 && (
              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 flex items-center gap-1">
                  <Users className="h-3 w-3" /> Assignees
                </label>
                <div className="flex flex-wrap gap-2">
                  {currentSpace.members.map((member: Member) => (
                    <button
                      key={member.uid}
                      type="button"
                      onClick={() => {
                        setAssignees((prev) =>
                          prev.includes(member.uid)
                            ? prev.filter((id) => id !== member.uid)
                            : [...prev, member.uid]
                        );
                      }}
                      className={clsx(
                        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-medium transition-all',
                        assignees.includes(member.uid)
                          ? 'bg-[var(--color-primary)]/20 border-[var(--color-primary)]/50 text-[var(--color-primary)]'
                          : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      )}
                    >
                      <div className="h-4 w-4 rounded-full bg-zinc-300 dark:bg-zinc-600 flex items-center justify-center text-[10px] text-zinc-700 dark:text-zinc-200 font-semibold">
                        {member.displayName.slice(0, 1).toUpperCase()}
                      </div>
                      {member.displayName}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tags Display */}
            {tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 ml-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Bottom Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-1">
                {/* Color Picker */}
                <div className="relative">
                  <button
                    type="button"
                    className={clsx(
                      'p-2 rounded-full transition-colors',
                      showPalette
                        ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/10'
                        : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    )}
                    onClick={() => {
                      setShowPalette((prev) => !prev);
                      setShowTagInput(false);
                    }}
                    aria-label="Choose color"
                  >
                    <Palette className="h-5 w-5" />
                  </button>
                  {showPalette && (
                    <div className="absolute bottom-12 left-0 z-30 flex gap-2 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-3 shadow-xl">
                      {ENTRY_COLORS.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => {
                            setColor(option.id);
                            setShowPalette(false);
                          }}
                          className={clsx(
                            'h-7 w-7 rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]',
                            option.swatchClass,
                            option.id === color && 'ring-2 ring-[var(--color-primary)]'
                          )}
                          aria-label={`Set color ${option.label}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Tag Input */}
                <div className="relative">
                  <button
                    type="button"
                    className={clsx(
                      'p-2 rounded-full transition-colors',
                      showTagInput
                        ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/10'
                        : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    )}
                    onClick={() => {
                      setShowTagInput((prev) => !prev);
                      setShowPalette(false);
                    }}
                    aria-label="Add tags"
                  >
                    <Tag className="h-5 w-5" />
                  </button>
                  {showTagInput && (
                    <div className="absolute bottom-12 left-0 z-30 w-56 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-xl">
                      <div className="flex gap-2">
                        <input
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddTag();
                            }
                          }}
                          placeholder="Add a tag..."
                          className="flex-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-[var(--color-primary)]"
                          autoFocus
                        />
                        <button
                          onClick={handleAddTag}
                          className="px-3 py-1.5 bg-[var(--color-primary)] text-white rounded-lg text-xs font-medium hover:brightness-110"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="text-sm font-medium transition-colors text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  onClick={resetState}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => void handleSubmit()}
                  className="rounded-full bg-[var(--color-primary)] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[var(--color-primary)]/20 transition hover:brightness-110 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                  disabled={isSubmitting || !title.trim()}
                >
                  {isSubmitting ? 'Saving...' : 'Add Task'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
