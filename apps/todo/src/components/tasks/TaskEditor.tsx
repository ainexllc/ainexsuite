'use client';

import { useState, useEffect } from 'react';
import { Calendar, Flag, Users, Save, Trash2, Loader2 } from 'lucide-react';
import { EntryEditorShell, Textarea, ConfirmationDialog } from '@ainexsuite/ui';
import type { EntryColor } from '@ainexsuite/types';
import { useAuth } from '@ainexsuite/auth';
import { useTodoStore } from '../../lib/store';
import { Task, Priority, TaskList, Member } from '../../types/models';

interface TaskEditorProps {
  isOpen: boolean;
  onClose: () => void;
  editTaskId?: string;
  defaultListId?: string;
}

export function TaskEditor({ isOpen, onClose, editTaskId, defaultListId }: TaskEditorProps) {
  const { user } = useAuth();
  const { getCurrentSpace, addTask, updateTask, deleteTask, tasks, updateTaskColor, toggleTaskPin, toggleTaskArchive } = useTodoStore();
  const currentSpace = getCurrentSpace();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [assignees, setAssignees] = useState<string[]>([]);
  const [listId, setListId] = useState(defaultListId || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Shell state
  const [color, setColor] = useState<EntryColor>('default');
  const [pinned, setPinned] = useState(false);
  const [archived, setArchived] = useState(false);

  // Load data if editing
  useEffect(() => {
    if (isOpen && editTaskId) {
      const task = tasks.find((t: Task) => t.id === editTaskId);
      if (task) {
        setTitle(task.title);
        setDescription(task.description || '');
        setPriority(task.priority);
        setDueDate(task.dueDate || '');
        setAssignees(task.assigneeIds);
        setListId(task.listId);
        setColor((task.color as EntryColor) || 'default');
        setPinned(task.pinned || false);
        setArchived(task.archived || false);
      }
    } else if (isOpen && !editTaskId) {
      // Reset form for new task
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      setAssignees([]);
      setListId(defaultListId || '');
      setColor('default');
      setPinned(false);
      setArchived(false);
    }
  }, [isOpen, editTaskId, tasks, defaultListId]);

  // Ensure listId is set if creating new
  useEffect(() => {
    if (isOpen && !listId && currentSpace && currentSpace.lists.length > 0) {
      setListId(currentSpace.lists[0].id);
    }
  }, [isOpen, listId, currentSpace]);

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
      if (editTaskId) {
        await updateTask(editTaskId, {
          title,
          description,
          priority,
          dueDate,
          assigneeIds: assignees,
          listId,
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
          description,
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
        pinned={pinned}
        onPinChange={handlePinChange}
        archived={archived}
        onArchiveChange={handleArchiveChange}
        toolbarActions={
          editTaskId ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="h-9 w-9 rounded-full flex items-center justify-center transition text-red-500 hover:bg-red-500/20"
              aria-label="Delete task"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null
        }
        footerRightContent={
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-full border px-4 py-1.5 text-sm font-medium transition border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-500"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!title.trim() || isSubmitting}
              className="rounded-full bg-[var(--color-primary)] px-5 py-1.5 text-sm font-semibold text-white shadow-lg shadow-[var(--color-primary)]/20 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)] disabled:opacity-60 inline-flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {editTaskId ? 'Save Changes' : 'Create Task'}
                </>
              )}
            </button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">Task Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
              className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-3 text-base text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              autoFocus
            />
          </div>

          {/* List/Status Selector */}
          <div>
            <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">List</label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {currentSpace.lists.map((list: TaskList) => (
                <button
                  key={list.id}
                  type="button"
                  onClick={() => setListId(list.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                    listId === list.id
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {list.title}
                </button>
              ))}
            </div>
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2 flex items-center gap-1">
                <Flag className="h-4 w-4" /> Priority
              </label>
              <div className="flex gap-2">
                {['low', 'medium', 'high'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p as Priority)}
                    className={`flex-1 py-2 rounded-lg text-sm capitalize transition-all ${
                      priority === p
                        ? p === 'high'
                          ? 'bg-red-500/20 text-red-500 border-2 border-red-500/50'
                          : 'bg-[var(--color-primary)]/20 text-[var(--color-primary)] border-2 border-[var(--color-primary)]/50'
                        : 'bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2 flex items-center gap-1">
                <Calendar className="h-4 w-4" /> Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details, subtasks, or notes..."
              className="min-h-[120px]"
            />
          </div>

          {/* Assignees */}
          <div>
            <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2 flex items-center gap-1">
              <Users className="h-4 w-4" /> Assignees
            </label>
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
                  className={`flex items-center gap-2 px-3 py-2 rounded-full border-2 text-sm transition-all ${
                    assignees.includes(member.uid)
                      ? 'bg-[var(--color-primary)]/20 border-[var(--color-primary)]/50 text-[var(--color-primary)]'
                      : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  <div className="h-5 w-5 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs text-zinc-900 dark:text-zinc-100 font-medium">
                    {member.displayName.slice(0, 1).toUpperCase()}
                  </div>
                  {member.displayName}
                </button>
              ))}
            </div>
          </div>
        </div>
      </EntryEditorShell>

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
