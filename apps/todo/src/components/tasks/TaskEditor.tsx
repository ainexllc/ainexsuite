'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Flag, Users, Save } from 'lucide-react';
import { useTodoStore } from '../../lib/store';
import { Task, Priority } from '../../types/models';

interface TaskEditorProps {
  isOpen: boolean;
  onClose: () => void;
  editTaskId?: string;
  defaultListId?: string;
}

export function TaskEditor({ isOpen, onClose, editTaskId, defaultListId }: TaskEditorProps) {
  const { getCurrentSpace, addTask, updateTask, tasks } = useTodoStore();
  const currentSpace = getCurrentSpace();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [assignees, setAssignees] = useState<string[]>([]);
  const [listId, setListId] = useState(defaultListId || '');

  // Load data if editing
  useEffect(() => {
    if (isOpen && editTaskId) {
      const task = tasks.find(t => t.id === editTaskId);
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

  if (!isOpen) return null;

  // Show message if no space is available
  if (!currentSpace) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="w-full max-w-md bg-surface-card border border-surface-hover rounded-2xl shadow-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-ink-800 mb-2">No Space Selected</h3>
          <p className="text-ink-600 mb-6">
            Please create or select a space before creating tasks.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Please enter a task title');
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
        status: 'todo', // Default, logic should map listId to status conceptually if strict
        priority,
        dueDate,
        assigneeIds: assignees.length > 0 ? assignees : [currentSpace.createdBy], // Default to creator if empty? Or unassigned.
        subtasks: [],
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: currentSpace.createdBy, // Should be current user from auth
        order: 0, // Should calculate max order + 1
      };
      await addTask(newTask);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-surface-card border border-surface-hover rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-surface-hover flex items-center justify-between">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task Title"
            className="bg-transparent text-xl font-bold text-ink-800 placeholder:text-ink-600 focus:outline-none w-full mr-4"
            autoFocus
          />
          <button onClick={onClose} className="text-ink-600 hover:text-ink-800">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* List/Status Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {currentSpace.lists.map(list => (
              <button
                key={list.id}
                type="button"
                onClick={() => setListId(list.id)}
                className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                  listId === list.id
                    ? 'bg-accent-500 text-white'
                    : 'bg-surface-hover text-ink-600 hover:bg-surface-elevated'
                }`}
              >
                {list.title}
              </button>
            ))}
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-xs font-medium text-ink-600 mb-1.5 flex items-center gap-1">
                <Flag className="h-3.5 w-3.5" /> Priority
              </label>
              <div className="flex gap-1">
                {['low', 'medium', 'high'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p as Priority)}
                    className={`flex-1 py-1.5 rounded text-xs capitalize transition-colors ${
                      priority === p
                        ? p === 'high' ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-accent-500/20 text-accent-500 border border-accent-500/50'
                        : 'bg-surface-hover text-ink-600 border border-transparent hover:bg-surface-elevated'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-medium text-ink-600 mb-1.5 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-surface-hover border border-surface-hover rounded-lg px-3 py-1.5 text-sm text-ink-800 focus:outline-none focus:border-accent-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-ink-600 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details, subtasks, or notes..."
              className="w-full bg-surface-hover border border-surface-hover rounded-xl p-4 text-sm text-ink-800 placeholder:text-ink-600 focus:outline-none focus:border-accent-500 min-h-[120px]"
            />
          </div>

          {/* Assignees */}
          <div>
            <label className="block text-xs font-medium text-ink-600 mb-2 flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> Assignees
            </label>
            <div className="flex flex-wrap gap-2">
              {currentSpace.members.map(member => (
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
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-all ${
                    assignees.includes(member.uid)
                      ? 'bg-accent-500/20 border-accent-500/50 text-accent-500'
                      : 'bg-surface-hover border-surface-hover text-ink-600 hover:bg-surface-elevated'
                  }`}
                >
                  <div className="h-4 w-4 rounded-full bg-surface-elevated flex items-center justify-center text-[8px] text-ink-800">
                    {member.displayName.slice(0, 1)}
                  </div>
                  {member.displayName}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-surface-hover flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-ink-600 hover:text-ink-800 hover:bg-surface-hover text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg text-sm font-medium shadow-lg shadow-accent-500/20 transition-colors flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {editTaskId ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
}
