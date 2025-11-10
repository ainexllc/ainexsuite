'use client';

import type { TodoTask, TodoProject, Priority } from '@ainexsuite/types';
import { updateTask } from '@/lib/todo';
import { Circle, CheckCircle2, Flag, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskListProps {
  tasks: TodoTask[];
  projects: TodoProject[];
  onTaskClick: (task: TodoTask) => void;
  onTaskUpdate: () => void;
}

const PRIORITY_COLORS: Record<Priority, string> = {
  urgent: 'text-priority-urgent',
  high: 'text-priority-high',
  medium: 'text-priority-medium',
  low: 'text-priority-low',
  none: 'text-priority-none',
};

export function TaskList({ tasks, projects, onTaskClick, onTaskUpdate }: TaskListProps) {
  const handleToggle = async (task: TodoTask, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateTask(task.id, {
        completed: !task.completed,
        completedAt: !task.completed ? Date.now() : undefined,
      });
      onTaskUpdate();
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  const getProject = (projectId?: string) => {
    if (!projectId) return null;
    return projects.find((p) => p.id === projectId);
  };

  return (
    <div className="space-y-2">
      {tasks.map((task) => {
        const project = getProject(task.projectId ?? undefined);
        const isOverdue = task.dueDate && task.dueDate < Date.now() && !task.completed;

        return (
          <div
            key={task.id}
            onClick={() => onTaskClick(task)}
            className="surface-card rounded-lg p-4 cursor-pointer hover:surface-hover transition-all group"
          >
            <div className="flex items-start gap-3">
              <button
                onClick={(e) => handleToggle(task, e)}
                className="mt-0.5 flex-shrink-0"
              >
                {task.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-accent-500" />
                ) : (
                  <Circle className="h-5 w-5 text-ink-600 group-hover:text-ink-800 transition-colors" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-1">
                  <h3
                    className={cn(
                      'font-medium flex-1',
                      task.completed && 'line-through text-ink-600'
                    )}
                  >
                    {task.title}
                  </h3>

                  {task.priority !== 'none' && (
                    <Flag className={cn('h-4 w-4 flex-shrink-0', PRIORITY_COLORS[task.priority])} />
                  )}
                </div>

                {task.description && (
                  <p className="text-sm text-ink-600 mb-2 line-clamp-2">
                    {task.description}
                  </p>
                )}

                <div className="flex items-center gap-3 text-xs text-ink-600">
                  {task.dueDate && (
                    <div
                      className={cn(
                        'flex items-center gap-1',
                        isOverdue && 'text-priority-urgent'
                      )}
                    >
                      <Calendar className="h-3 w-3" />
                      <span>{format(new Date(task.dueDate), 'MMM d')}</span>
                    </div>
                  )}

                  {project && (
                    <div className="flex items-center gap-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      <span>{project.name}</span>
                    </div>
                  )}

                  {task.subtasks && task.subtasks.length > 0 && (
                    <span>
                      {task.subtasks.filter((st) => st.completed).length}/{task.subtasks.length} subtasks
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
