'use client';

/* eslint-disable @next/next/no-img-element */

import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import {
  Flag,
  Users,
  Pin,
  PinOff,
  Palette,
  X,
  Tag,
  CheckSquare,
  Image as ImageIcon,
  Calculator,
  Plus,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '@ainexsuite/auth';
import { useTodoStore } from '@/lib/store';
import { useSpaces } from '@/components/providers/spaces-provider';
import { Task, Priority, TaskList, Member, ChecklistItem, TaskType } from '@/types/models';
import { ENTRY_COLORS, getEntryColorConfig, generateUUID, DatePicker } from '@ainexsuite/ui';
import type { EntryColor } from '@ainexsuite/types';
import { InlineCalculator } from './inline-calculator';

type AttachmentDraft = {
  id: string;
  file: File;
  preview: string;
};

const checklistTemplate = (): ChecklistItem => ({
  id: generateUUID(),
  text: '',
  completed: false,
});

interface TaskComposerProps {
  placeholder?: string;
}

export function TaskComposer({ placeholder = 'Add a todo...' }: TaskComposerProps) {
  const { user } = useAuth();
  const { currentSpace: spacesCurrentSpace } = useSpaces();
  const { addTask } = useTodoStore();

  // Build effective space with default lists for task creation
  const defaultLists: TaskList[] = useMemo(() => [
    { id: 'default_todo', title: 'To Do', order: 0 },
    { id: 'default_progress', title: 'In Progress', order: 1 },
    { id: 'default_done', title: 'Done', order: 2 },
  ], []);

  const effectiveSpace = useMemo(() => ({
    id: spacesCurrentSpace?.id || 'personal',
    name: spacesCurrentSpace?.name || 'My Todos',
    type: spacesCurrentSpace?.type || 'personal',
    members: ((spacesCurrentSpace as unknown as { members?: Member[] })?.members || []) as Member[],
    memberUids: (spacesCurrentSpace?.memberUids || []) as string[],
    lists: ((spacesCurrentSpace as unknown as { lists?: TaskList[] })?.lists || defaultLists) as TaskList[],
    createdAt: new Date().toISOString(),
    createdBy: '',
  }), [spacesCurrentSpace, defaultLists]);

  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mode, setMode] = useState<TaskType>('text');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [assignees, setAssignees] = useState<string[]>([]);
  const [listId, setListId] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentDraft[]>([]);

  // Visual state
  const [color, setColor] = useState<EntryColor>('default');
  const [pinned, setPinned] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  const composerRef = useRef<HTMLDivElement | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const checklistInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const pendingChecklistFocusId = useRef<string | null>(null);
  const isSubmittingRef = useRef(false);

  // Set default list when space changes
  useEffect(() => {
    if (effectiveSpace && effectiveSpace.lists.length > 0 && !listId) {
      setListId(effectiveSpace.lists[0].id);
    }
  }, [effectiveSpace, listId]);

  // Focus new checklist item
  useEffect(() => {
    if (!pendingChecklistFocusId.current) return;
    const target = checklistInputRefs.current[pendingChecklistFocusId.current];
    if (target) {
      target.focus();
      pendingChecklistFocusId.current = null;
    }
  }, [checklist]);

  // Cleanup attachment previews
  useEffect(() => {
    return () => {
      attachments.forEach((item) => URL.revokeObjectURL(item.preview));
    };
  }, [attachments]);

  const hasContent = useMemo(() => {
    if (title.trim() || description.trim() || attachments.length) return true;
    if (mode === 'checklist') return checklist.some((item) => item.text.trim());
    return false;
  }, [title, description, attachments, checklist, mode]);

  const resetState = useCallback(() => {
    setExpanded(false);
    setTitle('');
    setDescription('');
    setMode('text');
    setChecklist([]);
    setPriority('medium');
    setDueDate('');
    setAssignees([]);
    setListId(effectiveSpace?.lists[0]?.id || '');
    setTags([]);
    setTagInput('');
    setColor('default');
    setPinned(false);
    setShowPalette(false);
    setShowTagInput(false);
    setShowCalculator(false);
    setAttachments((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.preview));
      return [];
    });
  }, [effectiveSpace?.lists]);

  const handleSubmit = useCallback(async () => {
    if (isSubmittingRef.current || isSubmitting || !effectiveSpace || !user) return;

    if (!hasContent) {
      resetState();
      return;
    }

    try {
      isSubmittingRef.current = true;
      setIsSubmitting(true);

      // TODO: Upload attachments to storage and get URLs
      // For now, we'll skip actual file upload

      const newTask: Task = {
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        spaceId: effectiveSpace.id,
        listId: listId || effectiveSpace.lists[0]?.id || 'default',
        title: title.trim(),
        description: mode === 'text' ? description.trim() : '',
        type: mode,
        checklist: mode === 'checklist' ? checklist : [],
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
  }, [isSubmitting, effectiveSpace, user, hasContent, resetState, title, description, mode, checklist, priority, dueDate, assignees, listId, tags, color, pinned, addTask]);

  const handleChecklistChange = (itemId: string, next: Partial<ChecklistItem>) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, ...next } : item
      )
    );
  };

  const handleAddChecklistItem = () => {
    const newItem = checklistTemplate();
    pendingChecklistFocusId.current = newItem.id;
    setChecklist((prev) => [...prev, newItem]);
  };

  const handleRemoveChecklistItem = (itemId: string) => {
    setChecklist((prev) => prev.filter((item) => item.id !== itemId));
  };

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

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || !files.length) return;

    const drafts: AttachmentDraft[] = Array.from(files).map((file) => ({
      id: generateUUID(),
      file,
      preview: URL.createObjectURL(file),
    }));

    setAttachments((prev) => [...prev, ...drafts]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments((prev) => {
      prev
        .filter((item) => item.id === attachmentId)
        .forEach((item) => URL.revokeObjectURL(item.preview));
      return prev.filter((item) => item.id !== attachmentId);
    });
  };

  const handleCalculatorInsert = useCallback((result: string) => {
    setDescription((prev) => (prev ? `${prev} ${result}` : result));
    setShowCalculator(false);
  }, []);

  // Click outside to save/close
  useEffect(() => {
    if (!expanded) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!composerRef.current) return;
      if (composerRef.current.contains(event.target as Node)) return;
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

  if (!user) return null;

  const colorConfig = getEntryColorConfig(color);

  return (
    <section className="w-full">
      {!expanded ? (
        <div className="flex w-full items-center gap-2 rounded-2xl border px-5 py-4 shadow-sm transition bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700">
          <button
            type="button"
            data-composer-expand
            className="flex-1 min-w-0 text-left text-sm text-zinc-400 dark:text-zinc-500 focus-visible:outline-none"
            onClick={() => setExpanded(true)}
          >
            <span>{placeholder}</span>
          </button>
        </div>
      ) : (
        <div
          ref={composerRef}
          className={clsx(
            'w-full rounded-2xl shadow-lg border transition-all',
            colorConfig.cardClass,
            'border-zinc-200 dark:border-zinc-800'
          )}
        >
          <div className="flex flex-col gap-3 px-5 py-4">
            {/* Title row with pin and close buttons */}
            <div className="flex items-start gap-2">
              <input
                ref={titleInputRef}
                data-composer-input
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
                {pinned ? <PinOff className="h-5 w-5" /> : <Pin className="h-5 w-5" />}
              </button>
              <button
                type="button"
                onClick={resetState}
                className="p-2 rounded-full transition-colors text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Description or Checklist */}
            {mode === 'text' ? (
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
            ) : (
              <div className="space-y-2">
                {checklist.map((item, idx) => (
                  <div key={item.id} className="group flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={(e) =>
                        handleChecklistChange(item.id, { completed: e.target.checked })
                      }
                      className="h-4 w-4 accent-[var(--color-primary)]"
                    />
                    <input
                      value={item.text}
                      onChange={(e) =>
                        handleChecklistChange(item.id, { text: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                          e.preventDefault();
                          const nextItem = checklist[idx + 1];
                          if (nextItem) {
                            checklistInputRefs.current[nextItem.id]?.focus();
                          } else {
                            handleAddChecklistItem();
                          }
                        }
                      }}
                      placeholder={`Item ${idx + 1}`}
                      ref={(el) => {
                        if (el) {
                          checklistInputRefs.current[item.id] = el;
                        } else {
                          delete checklistInputRefs.current[item.id];
                        }
                      }}
                      className="flex-1 bg-transparent border-b border-transparent pb-1 text-sm focus:border-zinc-300 dark:focus:border-zinc-600 focus:outline-none text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                    />
                    <button
                      type="button"
                      className="opacity-0 transition group-hover:opacity-100"
                      onClick={() => handleRemoveChecklistItem(item.id)}
                      aria-label="Remove item"
                    >
                      <X className="h-4 w-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddChecklistItem}
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-700 px-3 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 transition hover:border-zinc-300 dark:hover:border-zinc-600"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add item
                </button>
              </div>
            )}

            {/* Attachments Preview */}
            {attachments.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-3">
                {attachments.map((attachment) => (
                  <figure
                    key={attachment.id}
                    className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-800/60 shadow-sm"
                  >
                    <img
                      src={attachment.preview}
                      alt={attachment.file.name}
                      className="h-24 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(attachment.id)}
                      className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white shadow-lg transition hover:bg-black/70"
                      aria-label="Remove attachment"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </figure>
                ))}
              </div>
            )}

            {/* List Selection */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {effectiveSpace.lists.map((list: TaskList) => (
                <button
                  key={list.id}
                  type="button"
                  onClick={() => setListId(list.id)}
                  className={clsx(
                    'px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors',
                    listId === list.id
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  )}
                >
                  {list.title}
                </button>
              ))}
            </div>

            {/* Properties row - Priority & Due Date */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {/* Priority buttons */}
              <div className="flex items-center gap-1">
                <Flag className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={clsx(
                      'px-3 py-1 rounded-full text-xs capitalize transition-all',
                      priority === p
                        ? p === 'high'
                          ? 'bg-red-500/20 text-red-500'
                          : 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]'
                        : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Due date */}
              <div className="w-48">
                <DatePicker
                  value={dueDate ? new Date(dueDate) : null}
                  onChange={(date) => setDueDate(date ? date.toISOString().split('T')[0] : '')}
                  placeholder="Due date"
                  presets="smart"
                />
              </div>
            </div>

            {/* Assignees */}
            {effectiveSpace.members.length > 1 && (
              <div className="flex items-center gap-2 pt-2">
                <Users className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                <div className="flex flex-wrap gap-2">
                  {effectiveSpace.members.map((member: Member) => (
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
                        'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all',
                        assignees.includes(member.uid)
                          ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      )}
                    >
                      <div className="h-5 w-5 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs text-zinc-900 dark:text-zinc-100 font-medium">
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
                {/* Checklist Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    setMode((prev) => {
                      if (prev === 'text') {
                        // Convert text body to checklist items
                        if (description.trim()) {
                          const lines = description.split('\n').filter((line) => line.trim());
                          const items = lines.map((line) => ({
                            id: generateUUID(),
                            text: line.trim(),
                            completed: false,
                          }));
                          setChecklist(items);
                          setDescription('');
                        }
                        return 'checklist';
                      } else {
                        // Convert checklist items to text body
                        if (checklist.length) {
                          const text = checklist.map((item) => item.text).filter((t) => t.trim()).join('\n');
                          setDescription(text);
                          setChecklist([]);
                        }
                        return 'text';
                      }
                    });
                  }}
                  className={clsx(
                    'p-2 rounded-full transition-colors',
                    mode === 'checklist'
                      ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/10'
                      : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  )}
                  aria-label="Toggle checklist mode"
                >
                  <CheckSquare className="h-5 w-5" />
                </button>

                {/* Image Upload */}
                <button
                  type="button"
                  className="p-2 rounded-full transition-colors text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Add image"
                >
                  <ImageIcon className="h-5 w-5" />
                </button>

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
                      setShowCalculator(false);
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
                      setShowCalculator(false);
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

                {/* Calculator */}
                <div className="relative">
                  <button
                    type="button"
                    className={clsx(
                      'p-2 rounded-full transition-colors',
                      showCalculator
                        ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/10'
                        : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    )}
                    onClick={() => {
                      setShowCalculator((prev) => !prev);
                      setShowPalette(false);
                      setShowTagInput(false);
                    }}
                    aria-label="Calculator"
                  >
                    <Calculator className="h-5 w-5" />
                  </button>
                  {showCalculator && (
                    <div className="absolute bottom-12 left-1/2 z-30 -translate-x-1/2">
                      <InlineCalculator
                        onInsert={handleCalculatorInsert}
                        onClose={() => setShowCalculator(false)}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => void handleSubmit()}
                  className="rounded-full bg-[var(--color-primary)] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[var(--color-primary)]/20 transition hover:brightness-110 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                  disabled={isSubmitting || !title.trim()}
                >
                  {isSubmitting ? 'Adding...' : 'Add task'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        multiple
        onChange={(e) => handleFilesSelected(e.target.files)}
      />
    </section>
  );
}
