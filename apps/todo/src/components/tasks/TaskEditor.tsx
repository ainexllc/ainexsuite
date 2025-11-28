'use client';

import { useState, useEffect } from 'react';
import { Calendar, Flag, Users, Save, Trash2 } from 'lucide-react';
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter, Button, Textarea, ConfirmationDialog } from '@ainexsuite/ui';
import { useTodoStore } from '../../lib/store';
import { Task, Priority, TaskList, Member } from '../../types/models';

interface TaskEditorProps {
  isOpen: boolean;
  onClose: () => void;
  editTaskId?: string;
  defaultListId?: string;
}

export function TaskEditor({ isOpen, onClose, editTaskId, defaultListId }: TaskEditorProps) {
  const { getCurrentSpace, addTask, updateTask, deleteTask, tasks } = useTodoStore();
  const currentSpace = getCurrentSpace();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [assignees, setAssignees] = useState<string[]>([]);
  const [listId, setListId] = useState(defaultListId || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
      }
    } else if (isOpen && !editTaskId) {
      // Reset form for new task
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      setAssignees([]);
      setListId(defaultListId || '');
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
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalContent className="text-center py-8">
          <ModalTitle>No Space Selected</ModalTitle>
          <ModalDescription className="mt-2">
            Please create or select a space before creating tasks.
          </ModalDescription>
          <div className="mt-6">
            <Button onClick={onClose}>Close</Button>
          </div>
        </ModalContent>
      </Modal>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }

    if (editTaskId) {
      await updateTask(editTaskId, {
        title,
        description,
        priority,
        dueDate,
        assigneeIds: assignees,
        listId,
      });
    } else {
      const newTask: Task = {
        id: `task_${Date.now()}`,
        spaceId: currentSpace.id,
        listId,
        title,
        description,
        status: 'todo',
        priority,
        dueDate,
        assigneeIds: assignees.length > 0 ? assignees : [currentSpace.createdBy],
        subtasks: [],
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: currentSpace.createdBy,
        order: 0,
      };
      await addTask(newTask);
    }
    onClose();
  };

  const handleDelete = async () => {
    if (editTaskId) {
      await deleteTask(editTaskId);
      onClose();
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <form onSubmit={handleSubmit}>
        <ModalHeader onClose={onClose}>
          <ModalTitle>
            {editTaskId ? 'Edit Task' : 'New Task'}
          </ModalTitle>
        </ModalHeader>

        <ModalContent className="space-y-6">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Task Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
              className="w-full bg-surface-card border border-outline-subtle rounded-lg px-4 py-3 text-base text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent-500"
              autoFocus
              required
            />
          </div>
          {/* List/Status Selector */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">List</label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {currentSpace.lists.map((list: TaskList) => (
                <button
                  key={list.id}
                  type="button"
                  onClick={() => setListId(list.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                    listId === list.id
                      ? 'bg-accent-500 text-foreground'
                      : 'bg-surface-card border border-outline-subtle text-muted-foreground hover:bg-surface-elevated'
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
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-1">
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
                          : 'bg-accent-500/20 text-accent-500 border-2 border-accent-500/50'
                        : 'bg-surface-card border-2 border-outline-subtle text-muted-foreground hover:bg-surface-elevated'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                <Calendar className="h-4 w-4" /> Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-surface-card border border-outline-subtle rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details, subtasks, or notes..."
              className="min-h-[120px]"
            />
          </div>

          {/* Assignees */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-1">
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
                      ? 'bg-accent-500/20 border-accent-500/50 text-accent-500'
                      : 'bg-surface-card border-outline-subtle text-muted-foreground hover:bg-surface-elevated'
                  }`}
                >
                  <div className="h-5 w-5 rounded-full bg-surface-elevated flex items-center justify-center text-xs text-foreground font-medium">
                    {member.displayName.slice(0, 1).toUpperCase()}
                  </div>
                  {member.displayName}
                </button>
              ))}
            </div>
          </div>
        </ModalContent>

        <ModalFooter className={editTaskId ? "justify-between" : undefined}>
          {editTaskId && (
            <Button
              type="button"
              variant="danger"
              onClick={() => setShowDeleteConfirm(true)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Task
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()} className="gap-2">
              <Save className="h-4 w-4" />
              {editTaskId ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </ModalFooter>
      </form>
    </Modal>

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
