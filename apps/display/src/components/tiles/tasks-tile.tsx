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
      <div className="flex items-center gap-1.5 p-1 bg-foreground/5 rounded">
        <button
          onClick={handleComplete}
          disabled={isCompleting}
          className={`w-3 h-3 rounded-full border flex items-center justify-center transition-all ${
            priority.color.replace('text-', 'border-')
          } hover:bg-foreground/10`}
        >
          {isCompleting && <Loader2 className="w-1.5 h-1.5 animate-spin" />}
        </button>
        <span className="text-[10px] flex-1 truncate text-foreground">{task.title}</span>
        {isOverdue && <AlertTriangle className="w-2.5 h-2.5 text-red-400" />}
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-2 p-1.5 rounded-lg transition-all ${
      isOverdue ? 'bg-red-500/10 border border-red-500/20' : 'bg-foreground/5'
    }`}>
      <button
        onClick={handleComplete}
        disabled={isCompleting}
        className={`w-3.5 h-3.5 mt-0.5 rounded-full border flex items-center justify-center transition-all ${
          priority.color.replace('text-', 'border-')
        } hover:bg-foreground/10 active:scale-95`}
      >
        {isCompleting ? (
          <Loader2 className="w-2 h-2 animate-spin" />
        ) : (
          <Check className="w-2 h-2 opacity-0 hover:opacity-50" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-foreground truncate">{task.title}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          {task.dueDate && (
            <span className={`text-[9px] flex items-center gap-0.5 ${
              isOverdue ? 'text-red-400' : 'text-muted-foreground'
            }`}>
              <Clock className="w-2.5 h-2.5" />
              {formatDueDate(task.dueDate)}
            </span>
          )}
          {(task.priority === 'high' || task.priority === 'urgent') && (
            <span className={`text-[9px] flex items-center gap-0.5 ${priority.color}`}>
              <Flag className="w-2.5 h-2.5" />
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
        <div className="flex items-center justify-center h-16">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-16 text-center">
          <div className="p-2 rounded-full bg-emerald-500/10 mb-1">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-[11px] font-medium text-foreground/80">All caught up!</p>
          <p className="text-[9px] text-muted-foreground">
            No tasks pending
          </p>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          {/* Summary header */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              {overdueTasks.length > 0 && (
                <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-red-500/20 rounded">
                  <AlertTriangle className="w-2.5 h-2.5 text-red-400" />
                  <span className="text-[10px] font-medium text-red-400">{overdueTasks.length} overdue</span>
                </div>
              )}
              {todayTasks.length > 0 && (
                <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-foreground/10 rounded">
                  <Clock className="w-2.5 h-2.5 text-foreground/70" />
                  <span className="text-[10px] text-foreground/70">{todayTasks.length} today</span>
                </div>
              )}
            </div>
          </div>

          {/* Task list */}
          <div className={`flex-1 overflow-y-auto space-y-1 ${isCompact ? 'max-h-16' : 'max-h-28'}`}>
            {displayTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onComplete={() => completeTask(task.id)}
                compact={isCompact}
              />
            ))}
            {tasks.length > displayTasks.length && (
              <p className="text-[9px] text-muted-foreground text-center pt-0.5">
                +{tasks.length - displayTasks.length} more
              </p>
            )}
          </div>
        </div>
      )}
    </TileBase>
  );
}
