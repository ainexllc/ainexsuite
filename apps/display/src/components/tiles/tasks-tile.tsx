'use client';

import { TileBase, TileProps } from './tile-base';
import { useAuth } from '@ainexsuite/auth';
import { useTasksData, Task, Priority } from '@/hooks/use-tasks-data';
import { Check, AlertTriangle, Clock, Loader2, Flag } from 'lucide-react';
import { useState } from 'react';

// Priority colors and icons
const PRIORITY_CONFIG: Record<Priority, { color: string; bgColor: string; label: string }> = {
  urgent: { color: 'text-red-500', bgColor: 'bg-red-500/20', label: 'Urgent' },
  high: { color: 'text-orange-500', bgColor: 'bg-orange-500/20', label: 'High' },
  medium: { color: 'text-yellow-500', bgColor: 'bg-yellow-500/20', label: 'Medium' },
  low: { color: 'text-blue-500', bgColor: 'bg-blue-500/20', label: 'Low' },
};

// Format due date display
function formatDueDate(dateString: string | undefined): string {
  if (!dateString) return '';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(dateString);
  dueDate.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays <= 7) return `${diffDays}d`;
  return dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Task item component
function TaskItem({
  task,
  onComplete,
  compact = false
}: {
  task: Task;
  onComplete: () => void;
  compact?: boolean;
}) {
  const [isCompleting, setIsCompleting] = useState(false);
  const priority = PRIORITY_CONFIG[task.priority];
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  const handleComplete = async () => {
    if (isCompleting) return;
    setIsCompleting(true);
    try {
      await onComplete();
    } finally {
      setIsCompleting(false);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 p-1.5 bg-foreground/5 rounded-lg">
        <button
          onClick={handleComplete}
          disabled={isCompleting}
          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
            priority.color.replace('text-', 'border-')
          } hover:bg-foreground/10`}
        >
          {isCompleting && <Loader2 className="w-2 h-2 animate-spin" />}
        </button>
        <span className="text-xs flex-1 truncate text-foreground">{task.title}</span>
        {isOverdue && <AlertTriangle className="w-3 h-3 text-red-400" />}
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
      isOverdue ? 'bg-red-500/10 border border-red-500/20' : 'bg-foreground/5'
    }`}>
      <button
        onClick={handleComplete}
        disabled={isCompleting}
        className={`w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center transition-all ${
          priority.color.replace('text-', 'border-')
        } hover:bg-foreground/10 active:scale-95`}
      >
        {isCompleting ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Check className="w-3 h-3 opacity-0 hover:opacity-50" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground truncate">{task.title}</p>
        <div className="flex items-center gap-2 mt-1">
          {task.dueDate && (
            <span className={`text-[10px] flex items-center gap-1 ${
              isOverdue ? 'text-red-400' : 'text-muted-foreground'
            }`}>
              <Clock className="w-3 h-3" />
              {formatDueDate(task.dueDate)}
            </span>
          )}
          {(task.priority === 'high' || task.priority === 'urgent') && (
            <span className={`text-[10px] flex items-center gap-0.5 ${priority.color}`}>
              <Flag className="w-3 h-3" />
              {priority.label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function TasksTile(props: Omit<TileProps, 'title' | 'children'>) {
  const { user } = useAuth();
  const { tasks, todayTasks, overdueTasks, highPriorityTasks, isLoading, completeTask } = useTasksData(user?.uid);

  const isCompact = props.variant === 'small';

  // Prioritize what to show: overdue first, then today's tasks, then high priority
  const displayTasks = [
    ...overdueTasks.slice(0, 2),
    ...todayTasks.filter(t => !overdueTasks.includes(t)).slice(0, 2),
    ...highPriorityTasks.filter(t => !overdueTasks.includes(t) && !todayTasks.includes(t)).slice(0, 2),
  ].slice(0, isCompact ? 3 : 5);

  return (
    <TileBase {...props} title="Tasks">
      {isLoading ? (
        <div className="flex items-center justify-center h-24">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-24 text-center">
          <div className="p-3 rounded-full bg-emerald-500/10 mb-2">
            <Check className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-sm font-medium text-foreground/80">All caught up!</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            No tasks pending
          </p>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          {/* Summary header */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2">
              {overdueTasks.length > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 rounded-lg">
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                  <span className="text-xs font-medium text-red-400">{overdueTasks.length} overdue</span>
                </div>
              )}
              {todayTasks.length > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 bg-foreground/10 rounded-lg">
                  <Clock className="w-3 h-3 text-foreground/70" />
                  <span className="text-xs text-foreground/70">{todayTasks.length} today</span>
                </div>
              )}
            </div>
          </div>

          {/* Task list */}
          <div className={`flex-1 overflow-y-auto space-y-1.5 ${isCompact ? 'max-h-24' : 'max-h-40'}`}>
            {displayTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onComplete={() => completeTask(task.id)}
                compact={isCompact}
              />
            ))}
            {tasks.length > displayTasks.length && (
              <p className="text-[10px] text-muted-foreground text-center pt-1">
                +{tasks.length - displayTasks.length} more tasks
              </p>
            )}
          </div>
        </div>
      )}
    </TileBase>
  );
}
