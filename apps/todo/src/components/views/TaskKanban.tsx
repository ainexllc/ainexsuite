'use client';

import { useMemo } from 'react';
import { useTodoStore } from '../../lib/store';
import type { Task, TaskStatus } from '../../types/models';
import {
  CheckCircle2,
  Circle,
  Clock,
  Eye,
  Flag,
} from 'lucide-react';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { clsx } from 'clsx';
import { getEntryColorConfig } from '@ainexsuite/ui';

interface TaskKanbanProps {
  onEditTask: (taskId: string) => void;
}

interface StatusColumn {
  id: TaskStatus;
  title: string;
  icon: React.ElementType;
  color: string;
}

const STATUS_COLUMNS: StatusColumn[] = [
  { id: 'todo', title: 'To Do', icon: Circle, color: 'text-zinc-500' },
  { id: 'in_progress', title: 'In Progress', icon: Clock, color: 'text-blue-500' },
  { id: 'review', title: 'Review', icon: Eye, color: 'text-amber-500' },
  { id: 'done', title: 'Done', icon: CheckCircle2, color: 'text-green-500' },
];

export function TaskKanban({ onEditTask }: TaskKanbanProps) {
  const { getCurrentSpace, tasks, updateTask } = useTodoStore();
  const currentSpace = getCurrentSpace();

  // Filter tasks for current space, excluding archived
  const spaceTasks = useMemo(() => {
    if (!currentSpace) return [];
    return tasks.filter(
      (t: Task) =>
        (currentSpace.id === 'all' || t.spaceId === currentSpace.id) && !t.archived
    );
  }, [tasks, currentSpace]);

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      todo: [],
      in_progress: [],
      review: [],
      done: [],
    };

    spaceTasks.forEach((task) => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      } else {
        // Default to todo if status is unknown
        grouped.todo.push(task);
      }
    });

    return grouped;
  }, [spaceTasks]);

  const handleToggleComplete = async (task: Task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    await updateTask(task.id, { status: newStatus });
  };

  if (!currentSpace) return null;

  return (
    <div className="flex gap-4 h-full overflow-x-auto pb-4 -mx-4 px-4">
      {STATUS_COLUMNS.map((column) => {
        const columnTasks = tasksByStatus[column.id];
        const Icon = column.icon;

        return (
          <div key={column.id} className="w-72 shrink-0 flex flex-col">
            {/* Column Header */}
            <div className="flex items-center gap-2 mb-3 px-1">
              <Icon className={clsx('h-4 w-4', column.color)} />
              <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                {column.title}
              </h3>
              <span className="ml-auto bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full text-xs font-medium">
                {columnTasks.length}
              </span>
            </div>

            {/* Column Content */}
            <div className="flex-1 space-y-3 overflow-y-auto min-h-[200px] pb-2">
              {columnTasks.map((task) => (
                <KanbanCard
                  key={task.id}
                  task={task}
                  onEditTask={onEditTask}
                  onToggleComplete={handleToggleComplete}
                />
              ))}

              {/* Empty state for column */}
              {columnTasks.length === 0 && (
                <div className="flex items-center justify-center h-20 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600 text-sm">
                  No tasks
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Simplified card for Kanban view
interface KanbanCardProps {
  task: Task;
  onEditTask: (id: string) => void;
  onToggleComplete: (task: Task) => void;
}

function KanbanCard({ task, onEditTask, onToggleComplete }: KanbanCardProps) {
  const date = task.dueDate ? parseISO(task.dueDate) : null;
  const isOverdue = date && isPast(date) && !isToday(date) && task.status !== 'done';
  const colorConfig = getEntryColorConfig(task.color);

  // Subtask progress
  const completedSubtasks = task.subtasks?.filter((s) => s.isCompleted).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  return (
    <div
      className={clsx(
        'group rounded-xl p-3 shadow-sm transition-all cursor-pointer',
        'border border-zinc-200 dark:border-zinc-800',
        'hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md',
        colorConfig?.cardClass || 'bg-white dark:bg-zinc-900'
      )}
      onClick={() => onEditTask(task.id)}
    >
      <div className="flex items-start gap-2">
        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(task);
          }}
          className={clsx(
            'mt-0.5 shrink-0 transition-colors',
            task.status === 'done'
              ? 'text-green-500'
              : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
          )}
        >
          {task.status === 'done' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <Circle className="h-4 w-4" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          {/* Title */}
          <h4
            className={clsx(
              'text-sm font-medium leading-tight',
              task.status === 'done'
                ? 'line-through text-zinc-400 dark:text-zinc-500'
                : 'text-zinc-900 dark:text-zinc-100'
            )}
          >
            {task.title}
          </h4>

          {/* Meta row */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {/* Priority */}
            {task.priority === 'high' && (
              <Flag className="h-3 w-3 text-amber-500 fill-amber-500/20" />
            )}
            {task.priority === 'urgent' && (
              <Flag className="h-3 w-3 text-red-500 fill-red-500/20" />
            )}

            {/* Due date */}
            {date && (
              <span
                className={clsx(
                  'text-[10px] font-medium px-1.5 py-0.5 rounded',
                  isOverdue
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                )}
              >
                {format(date, 'MMM d')}
              </span>
            )}

            {/* Subtask progress */}
            {totalSubtasks > 0 && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                {completedSubtasks}/{totalSubtasks}
              </span>
            )}

            {/* Tags preview */}
            {task.tags && task.tags.length > 0 && (
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                #{task.tags[0]}
                {task.tags.length > 1 && ` +${task.tags.length - 1}`}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
