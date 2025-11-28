'use client';

import { useState } from 'react';
import { Sparkles, ArrowRight, Calendar, Flag } from 'lucide-react';
import { useTodoStore } from '@/lib/store';
import { Task, Priority } from '@/types/models';

export function SmartTaskInput() {
  const { getCurrentSpace, addTask } = useTodoStore();
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const currentSpace = getCurrentSpace();

  const parseTask = (text: string) => {
    let title = text;
    let priority: Priority = 'medium';
    let dueDate = '';

    // Parse priority
    if (text.toLowerCase().includes('#urgent') || text.toLowerCase().includes('#high')) {
      priority = 'high';
      title = title.replace(/#(urgent|high)/gi, '');
    } else if (text.toLowerCase().includes('#low')) {
      priority = 'low';
      title = title.replace(/#low/gi, '');
    }

    // Simple date parsing (mock)
    const today = new Date();
    if (text.toLowerCase().includes('tomorrow')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      dueDate = tomorrow.toISOString().split('T')[0];
      title = title.replace(/\btomorrow\b/gi, '');
    } else if (text.toLowerCase().includes('today')) {
      dueDate = today.toISOString().split('T')[0];
      title = title.replace(/\btoday\b/gi, '');
    }

    return {
      title: title.trim(),
      priority,
      dueDate
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentSpace) return;

    setIsProcessing(true);
    const { title, priority, dueDate } = parseTask(input);

    const newTask: Task = {
      id: `task_${Date.now()}`,
      spaceId: currentSpace.id,
      listId: currentSpace.lists[0]?.id || 'default', // Fallback
      title,
      description: '',
      status: 'todo',
      priority,
      dueDate,
      assigneeIds: [currentSpace.createdBy],
      subtasks: [],
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentSpace.createdBy,
      order: 0,
    };

    await addTask(newTask);
    setInput('');
    setIsProcessing(false);
  };

  if (!currentSpace) return null;

  return (
    <form onSubmit={handleSubmit} className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-accent-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative flex items-center bg-surface-card border border-outline-subtle rounded-xl p-2 shadow-sm focus-within:ring-2 focus-within:ring-accent-500/50 transition-all">
        <div className="p-2 text-accent-500">
          <Sparkles className="h-5 w-5" />
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a task... (e.g., 'Review report tomorrow #urgent')"
          className="flex-1 bg-transparent border-none outline-none text-ink-900 placeholder:text-muted px-2"
        />
        <button
          type="submit"
          disabled={!input.trim() || isProcessing}
          className="p-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      
      {/* Helper Hints */}
      {input.length > 0 && (
        <div className="absolute top-full left-0 mt-2 flex gap-2 text-xs text-muted animate-in fade-in slide-in-from-top-1">
          <span className="flex items-center gap-1 bg-surface-elevated px-2 py-1 rounded-md border border-outline-subtle">
            <Flag className="h-3 w-3" /> #urgent for High Priority
          </span>
          <span className="flex items-center gap-1 bg-surface-elevated px-2 py-1 rounded-md border border-outline-subtle">
            <Calendar className="h-3 w-3" /> &quot;tomorrow&quot; for Due Date
          </span>
        </div>
      )}
    </form>
  );
}
