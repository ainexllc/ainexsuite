'use client';

/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Calendar,
  Flag,
  Users,
  Trash2,
  Loader2,
  X,
  CheckSquare,
  Image as ImageIcon,
  Calculator,
  Plus,
  Pin,
  PinOff,
  FolderOpen,
} from 'lucide-react';
import { EntryEditorShell, ConfirmationDialog, generateUUID } from '@ainexsuite/ui';
import type { EntryColor } from '@ainexsuite/types';
import { useAuth } from '@ainexsuite/auth';
import { useTodoStore } from '../../lib/store';
import { Task, Priority, TaskList, Member, ChecklistItem, TaskType } from '../../types/models';
import { clsx } from 'clsx';
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

interface TaskEditorProps {
  isOpen: boolean;
  onClose: () => void;
  editTaskId?: string;
  defaultListId?: string;
}

export function TaskEditor({ isOpen, onClose, editTaskId, defaultListId }: TaskEditorProps) {
  const { user } = useAuth();
  const { spaces, getCurrentSpace, addTask, updateTask, deleteTask, tasks, updateTaskColor, toggleTaskPin, toggleTaskArchive } = useTodoStore();
  const currentSpace = getCurrentSpace();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mode, setMode] = useState<TaskType>('text');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [assignees, setAssignees] = useState<string[]>([]);
  const [listId, setListId] = useState(defaultListId || '');
  const [selectedSpaceId, setSelectedSpaceId] = useState(currentSpace?.id || 'personal');
  const [showSpaceSelector, setShowSpaceSelector] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentDraft[]>([]);

  // Shell state
  const [color, setColor] = useState<EntryColor>('default');
  const [pinned, setPinned] = useState(false);
  const [archived, setArchived] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const checklistInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const pendingChecklistFocusId = useRef<string | null>(null);

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

  // Load data if editing
  useEffect(() => {
    if (isOpen && editTaskId) {
      const task = tasks.find((t: Task) => t.id === editTaskId);
      if (task) {
        setTitle(task.title);
        setDescription(task.description || '');
        setMode(task.type || 'text');
        setChecklist(task.checklist || []);
        setPriority(task.priority);
        setDueDate(task.dueDate || '');
        setAssignees(task.assigneeIds);
        setListId(task.listId);
        setSelectedSpaceId(task.spaceId || 'personal');
        setColor((task.color as EntryColor) || 'default');
        setPinned(task.pinned || false);
        setArchived(task.archived || false);
        setAttachments([]);
      }
    } else if (isOpen && !editTaskId) {
      // Reset form for new task
      setTitle('');
      setDescription('');
      setMode('text');
      setChecklist([]);
      setPriority('medium');
      setDueDate('');
      setAssignees([]);
      setListId(defaultListId || '');
      setSelectedSpaceId(currentSpace?.id || 'personal');
      setColor('default');
      setPinned(false);
      setArchived(false);
      setAttachments([]);
      setShowCalculator(false);
      setShowSpaceSelector(false);
    }
  }, [isOpen, editTaskId, tasks, defaultListId, currentSpace?.id]);

  // Ensure listId is set if creating new
  useEffect(() => {
    if (isOpen && !listId && currentSpace && currentSpace.lists.length > 0) {
      setListId(currentSpace.lists[0].id);
    }
  }, [isOpen, listId, currentSpace]);

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

  // Show message if no space is available
  if (!currentSpace) {
    return (
      <EntryEditorShell
        isOpen={isOpen}
        onClose={onClose}
        hideFooter={true}
      >
        <div className="text-center py-8">
          <h2 className="text-lg font-semibold text-foreground">No Space Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please create or select a space before creating tasks.
          </p>
          <button
            onClick={onClose}
            className="mt-6 rounded-full bg-[var(--color-primary)] px-5 py-1.5 text-sm font-semibold text-white"
          >
            Close
          </button>
        </div>
      </EntryEditorShell>
    );
  }

  const handleSubmit = async () => {
    if (!title.trim() || !user) {
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Upload attachments to storage and get URLs
      // For now, we'll skip actual file upload

      if (editTaskId) {
        await updateTask(editTaskId, {
          title,
          description: mode === 'text' ? description : '',
          type: mode,
          checklist: mode === 'checklist' ? checklist : [],
          priority,
          dueDate,
          assigneeIds: assignees,
          listId,
          spaceId: selectedSpaceId === 'personal' ? undefined : selectedSpaceId,
          color,
          pinned,
          archived,
        });
      } else {
        const newTask: Task = {
          id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          spaceId: currentSpace.id,
          listId,
          title,
          description: mode === 'text' ? description : '',
          type: mode,
          checklist: mode === 'checklist' ? checklist : [],
          status: 'todo',
          priority,
          dueDate,
          assigneeIds: assignees.length > 0 ? assignees : [user.uid],
          subtasks: [],
          tags: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: user.uid,
          ownerId: user.uid,
          order: 0,
          color,
          pinned,
          archived,
        };
        await addTask(newTask);
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (editTaskId) {
      await deleteTask(editTaskId);
      onClose();
    }
  };

  const handleColorChange = async (newColor: EntryColor) => {
    setColor(newColor);
    if (editTaskId) {
      await updateTaskColor(editTaskId, newColor);
    }
  };

  const handlePinChange = async (newPinned: boolean) => {
    setPinned(newPinned);
    if (editTaskId) {
      await toggleTaskPin(editTaskId, newPinned);
    }
  };

  const handleArchiveChange = async (newArchived: boolean) => {
    setArchived(newArchived);
    if (editTaskId) {
      await toggleTaskArchive(editTaskId, newArchived);
    }
  };

  return (
    <>
      <EntryEditorShell
        isOpen={isOpen}
        onClose={onClose}
        color={color}
        onColorChange={handleColorChange}
        archived={archived}
        onArchiveChange={handleArchiveChange}
        hideHeaderActions
        toolbarActions={
          <>
            {/* Checklist Toggle */}
            <button
              type="button"
              onClick={() => {
                setMode((prev) => {
                  if (prev === 'text') {
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
                'h-9 w-9 rounded-full flex items-center justify-center transition',
                mode === 'checklist'
                  ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/10'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              )}
              aria-label="Toggle checklist mode"
            >
              <CheckSquare className="h-4 w-4" />
            </button>

            {/* Image Upload */}
            <button
              type="button"
              className="h-9 w-9 rounded-full flex items-center justify-center transition text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Add image"
            >
              <ImageIcon className="h-4 w-4" />
            </button>

            {/* Calculator */}
            <div className="relative">
              <button
                type="button"
                className={clsx(
                  'h-9 w-9 rounded-full flex items-center justify-center transition',
                  showCalculator
                    ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/10'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                )}
                onClick={() => setShowCalculator((prev) => !prev)}
                aria-label="Calculator"
              >
                <Calculator className="h-4 w-4" />
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

            {/* Delete button (only when editing) */}
            {editTaskId && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="h-9 w-9 rounded-full flex items-center justify-center transition text-red-500 hover:bg-red-500/20"
                aria-label="Delete task"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </>
        }
        footerRightContent={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!title.trim() || isSubmitting}
              className="rounded-full bg-[var(--color-primary)] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[var(--color-primary)]/20 transition hover:brightness-110 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)] disabled:opacity-50 disabled:hover:translate-y-0 inline-flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {editTaskId ? 'Saving...' : 'Adding...'}
                </>
              ) : (
                editTaskId ? 'Save Changes' : 'Add task'
              )}
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-3">
          {/* Title row with pin and close buttons */}
          <div className="flex items-start gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className="w-full bg-transparent text-lg font-semibold focus:outline-none text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
              autoFocus
            />
            <button
              type="button"
              onClick={() => handlePinChange(!pinned)}
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
              onClick={onClose}
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
              placeholder="Add details, subtasks, or notes..."
              rows={4}
              className="min-h-[100px] w-full resize-none bg-transparent text-[15px] focus:outline-none leading-7 tracking-[-0.01em] text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
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

          {/* List selector */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {currentSpace.lists.map((list: TaskList) => (
              <button
                key={list.id}
                type="button"
                onClick={() => setListId(list.id)}
                className={clsx(
                  "px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors",
                  listId === list.id
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                )}
              >
                {list.title}
              </button>
            ))}
          </div>

          {/* Space selector (only when editing and has multiple spaces) */}
          {editTaskId && spaces.length > 1 && (
            <div className="relative">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                <button
                  type="button"
                  onClick={() => setShowSpaceSelector(!showSpaceSelector)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  {spaces.find(s => s.id === selectedSpaceId)?.name || 'My Todos'}
                </button>
              </div>
              {showSpaceSelector && (
                <div className="absolute top-10 left-0 z-30 w-48 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-xl py-1">
                  {[{ id: 'personal', name: 'My Todos' }, ...spaces.filter(s => s.id !== 'personal')].map((space) => (
                    <button
                      key={space.id}
                      type="button"
                      onClick={() => {
                        setSelectedSpaceId(space.id);
                        setShowSpaceSelector(false);
                      }}
                      className={clsx(
                        "w-full px-3 py-2 text-left text-sm transition-colors",
                        selectedSpaceId === space.id
                          ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                          : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      )}
                    >
                      {space.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Properties row */}
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
                    "px-3 py-1 rounded-full text-xs capitalize transition-all",
                    priority === p
                      ? p === 'high'
                        ? "bg-red-500/20 text-red-500"
                        : "bg-[var(--color-primary)]/20 text-[var(--color-primary)]"
                      : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Due date */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-transparent text-sm text-zinc-700 dark:text-zinc-300 focus:outline-none"
              />
            </div>
          </div>

          {/* Assignees */}
          {currentSpace.members.length > 0 && (
            <div className="flex items-center gap-2 pt-2">
              <Users className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
              <div className="flex flex-wrap gap-2">
                {currentSpace.members.map((member: Member) => (
                  <button
                    key={member.uid}
                    type="button"
                    onClick={() => {
                      setAssignees(prev =>
                        prev.includes(member.uid)
                          ? prev.filter(id => id !== member.uid)
                          : [...prev, member.uid]
                      );
                    }}
                    className={clsx(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all",
                      assignees.includes(member.uid)
                        ? "bg-[var(--color-primary)]/20 text-[var(--color-primary)]"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
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

        </div>
      </EntryEditorShell>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        multiple
        onChange={(e) => handleFilesSelected(e.target.files)}
      />

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
}
