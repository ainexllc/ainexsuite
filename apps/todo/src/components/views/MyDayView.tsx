'use client';

import { useTodoStore } from '../../lib/store';
import { Task, TaskSpace } from '../../types/models';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { ListSection, ListItem, EmptyState } from '@ainexsuite/ui';

interface MyDayViewProps {
  onEditTask: (taskId: string) => void;
}

export function MyDayView({ onEditTask }: MyDayViewProps) {
  const { myTasks, updateTask, spaces } = useTodoStore();

  // Sort by: Overdue -> Today -> Upcoming -> No Date
  const sortedTasks = [...myTasks].sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const handleToggleComplete = async (task: Task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    await updateTask(task.id, { status: newStatus });
  };

  const getSpaceName = (spaceId: string) => {
    return spaces.find((s: TaskSpace) => s.id === spaceId)?.name || 'Unknown Space';
  };

  const getTaskSection = (dateStr?: string) => {
    if (!dateStr) return 'No Date';
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isPast(date)) return 'Overdue';
    return 'Upcoming';
  };

  // Group by section
  const groupedTasks = sortedTasks.reduce((acc, task) => {
    const section = getTaskSection(task.dueDate);
    if (!acc[section]) acc[section] = [];
    acc[section].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const sections = ['Overdue', 'Today', 'Tomorrow', 'Upcoming', 'No Date'];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {sections.map(section => {
        const tasks = groupedTasks[section] || [];
        if (tasks.length === 0) return null;

        return (
          <ListSection
            key={section}
            title={section}
            count={tasks.length}
          >
            {tasks.map((task: Task) => (
              <ListItem
                key={task.id}
                variant="default"
                title={
                  <span className={task.status === 'done' ? 'line-through' : ''}>
                    {task.title}
                  </span>
                }
                subtitle={
                  <div className="flex items-center gap-2 text-xs">
                    <span>{getSpaceName(task.spaceId)}</span>
                    {task.dueDate && (
                      <>
                        <span>•</span>
                        <span className={section === 'Overdue' ? 'text-red-400' : ''}>
                          {format(new Date(task.dueDate), 'MMM d')}
                        </span>
                      </>
                    )}
                  </div>
                }
                icon={task.status === 'done' ? CheckCircle2 : Circle}
                trailing={
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="h-4 w-4 text-white/30" />
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
          </ListSection>
        );
      })}

      {sortedTasks.length === 0 && (
        <EmptyState
          icon={CheckCircle2}
          title="All caught up!"
          description="No tasks assigned to you right now."
          variant="default"
        />
      )}
    </div>
  );
}
