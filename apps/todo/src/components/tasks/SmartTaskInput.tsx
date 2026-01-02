'use client';

import { useState } from 'react';
import { ArrowRight, Plus } from 'lucide-react';
import { useAuth } from '@ainexsuite/auth';
import { getPrimaryDate, DateSuggestions } from '@ainexsuite/date-detection';
import { useTodoStore } from '@/lib/store';
import { Task, Priority } from '@/types/models';

interface SmartTaskInputProps {
  onOpenFullEditor?: () => void;
}

export function SmartTaskInput({ onOpenFullEditor }: SmartTaskInputProps) {
  const { user } = useAuth();
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

    // Use chrono-node for NLP date parsing
    const detectedDate = getPrimaryDate(text);
    if (detectedDate) {
      dueDate = detectedDate.parsedDate.toISOString().split('T')[0];
      // Remove the date text from title
      title = title.substring(0, detectedDate.position.start) +
              title.substring(detectedDate.position.end);
    }

    return {
      title: title.trim(),
      priority,
      dueDate
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentSpace || !user) return;

    setIsProcessing(true);
    const { title, priority, dueDate } = parseTask(input);

    const newTask: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      spaceId: currentSpace.id,
      listId: currentSpace.lists[0]?.id || 'default', // Fallback
      title,
      description: '',
      status: 'todo',
      priority,
      dueDate,
      assigneeIds: [user.uid],
      subtasks: [],
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user.uid,
      ownerId: user.uid,
      order: 0,
    };

    await addTask(newTask);
    setInput('');
    setIsProcessing(false);
  };

  if (!currentSpace || !user) return null;

  return (
    <div className="w-full space-y-2">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center rounded-2xl border px-5 py-4 shadow-sm transition focus-within:ring-2 focus-within:ring-[var(--color-primary)] bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a todo... (try 'meeting tomorrow at 3pm')"
            className="flex-1 bg-transparent border-none outline-none text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
          />
          <div className="flex items-center gap-2 ml-3">
            {onOpenFullEditor && (
              <button
                type="button"
                onClick={onOpenFullEditor}
                className="p-2 rounded-full text-zinc-400 dark:text-zinc-500 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-all"
                title="Open full editor"
              >
                <Plus className="h-4 w-4" />
              </button>
            )}
            {input.trim() && (
              <button
                type="submit"
                disabled={isProcessing}
                className="p-2 rounded-full bg-[var(--color-primary)] text-white shadow-sm hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Date detection suggestions for calendar */}
      {input.trim().length > 3 && (
        <DateSuggestions
          text={input}
          context={{
            app: 'todo',
            title: parseTask(input).title || input,
          }}
          className="px-2"
        />
      )}
    </div>
  );
}
