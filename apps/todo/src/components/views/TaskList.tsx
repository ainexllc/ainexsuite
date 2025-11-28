'use client';

import { useTodoStore } from '../../lib/store';
import { Task } from '../../types/models';
import { CheckCircle2, Circle, Flag } from 'lucide-react';
import { format } from 'date-fns';
import { ListItem, EmptyState } from '@ainexsuite/ui';

interface TaskListProps {
  onEditTask: (taskId: string) => void;
}

export function TaskList({ onEditTask }: TaskListProps) {
  const { getCurrentSpace, tasks, updateTask } = useTodoStore();
  const currentSpace = getCurrentSpace();

  if (!currentSpace) return null;

  // Filter tasks for current space
  const spaceTasks = tasks.filter((t: Task) => t.spaceId === currentSpace.id);

  const handleToggleComplete = async (task: Task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    await updateTask(task.id, { status: newStatus });
  };

  return (
    <div className="space-y-3">
      {spaceTasks.map((task: Task) => (
        <ListItem
          key={task.id}
          variant="default"
          title={
            <div className="flex items-center gap-2">
              <span className={task.status === 'done' ? 'line-through' : ''}>
                {task.title}
              </span>
              {task.priority === 'high' && (
                <Flag className="h-3 w-3 text-red-400 fill-red-400/20" />
              )}
            </div>
          }
          subtitle={task.description || undefined}
          icon={task.status === 'done' ? CheckCircle2 : Circle}
          trailing={
            <div className="flex items-center gap-3">
              {task.dueDate && (
                <div className={`text-xs ${
                  new Date(task.dueDate) < new Date() && task.status !== 'done'
                    ? 'text-red-400'
                    : 'text-white/40'
                }`}>
                  {format(new Date(task.dueDate), 'MMM d')}
                </div>
              )}
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white/60">
                {task.assigneeIds.length > 0 ? 'A' : '?'}
              </div>
            </div>
          }
          onClick={(e) => {
            // Check if click was on the icon (checkbox)
            const target = e.target as HTMLElement;
            const isIconClick = target.closest('svg')?.parentElement?.classList.contains('flex-shrink-0');

            if (isIconClick) {
              handleToggleComplete(task);
            } else {
              onEditTask(task.id);
            }
          }}
        />
      ))}

      {spaceTasks.length === 0 && (
        <EmptyState
          icon={CheckCircle2}
          title="All caught up!"
          description="This space is empty. Add a task to start planning your day or organize your project."
          variant="default"
        />
      )}
    </div>
  );
}
