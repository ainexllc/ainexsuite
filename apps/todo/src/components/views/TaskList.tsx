'use client';

import { useTodoStore } from '../../lib/store';
import { Task } from '../../types/models';
import { CheckCircle2, Circle, Flag } from 'lucide-react';
import { format, isPast, isToday, parseISO } from 'date-fns';

interface TaskListProps {
  onEditTask: (taskId: string) => void;
}

export function TaskList({ onEditTask }: TaskListProps) {
  const { getCurrentSpace, tasks, updateTask } = useTodoStore();
  const currentSpace = getCurrentSpace();

  if (!currentSpace) return null;

  // Filter tasks for current space
  const spaceTasks = tasks.filter((t: Task) => currentSpace.id === 'all' || t.spaceId === currentSpace.id);

  const handleToggleComplete = async (task: Task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    await updateTask(task.id, { status: newStatus });
  };

  return (
    <div className="space-y-1">
      {spaceTasks.map((task: Task) => {
        const date = task.dueDate ? parseISO(task.dueDate) : null;
        const isOverdue = date && isPast(date) && !isToday(date) && task.status !== 'done';

        return (
          <div
            key={task.id}
            className="group flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/5"
            onClick={() => onEditTask(task.id)}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleComplete(task);
              }}
              className={`shrink-0 transition-colors ${
                task.status === 'done' ? 'text-green-500' : 'text-white/20 hover:text-white/50'
              }`}
            >
              {task.status === 'done' ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-sm ${task.status === 'done' ? 'text-white/40 line-through' : 'text-white'}`}>
                  {task.title}
                </span>
                {task.priority === 'high' && (
                  <Flag className="h-3 w-3 text-red-400 fill-red-400/20" />
                )}
              </div>
              {task.description && (
                <p className="text-xs text-white/40 truncate">{task.description}</p>
              )}
            </div>

            {date && (
              <div className={`text-xs ${isOverdue ? 'text-red-400' : 'text-white/40'}`}>
                {format(date, 'MMM d')}
              </div>
            )}
            
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white/60">
              {/* Assignee Avatar Placeholder */}
              {task.assigneeIds.length > 0 ? 'A' : '?'}
            </div>
          </div>
        );
      })}

      {spaceTasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8 text-white/20" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">All caught up!</h3>
          <p className="text-white/40 max-w-xs mb-6">
            This space is empty. Add a task to start planning your day or organize your project.
          </p>
        </div>
      )}
    </div>
  );
}
