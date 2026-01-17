'use client';

import { useMemo } from 'react';
import { useTodoStore } from '../../lib/store';
import { Task, TaskSpace } from '../../types/models';
import { CheckCircle2, Circle, ArrowRight, Sun } from 'lucide-react';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { ListSection, ListItem, EmptyState } from '@ainexsuite/ui';
import { useSpaces } from '@/components/providers/spaces-provider';

interface MyDayViewProps {
  onEditTask: (taskId: string) => void;
  searchQuery?: string;
}

export function MyDayView({ onEditTask, searchQuery = '' }: MyDayViewProps) {
  const { tasks, updateTask, spaces } = useTodoStore();
  const { currentSpaceId } = useSpaces();

  // Get today's date string for My Day filtering
  const todayString = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Get My Day tasks - filtered by myDayDate === today
  const myDayTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Must have myDayDate set to today
      if (task.myDayDate !== todayString) return false;
      // Must be in current space
      if (task.spaceId !== currentSpaceId) return false;
      // Must not be archived or deleted
      if (task.archived || task.deletedAt) return false;
      return true;
    });
  }, [tasks, currentSpaceId, todayString]);

  // Filter tasks based on search query
  const filteredTasks = searchQuery.trim()
    ? myDayTasks.filter((task) => {
        const query = searchQuery.toLowerCase().trim();
        return (
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.tags?.some((tag: string) => tag.toLowerCase().includes(query)) ||
          task.subtasks?.some((st) => st.title.toLowerCase().includes(query))
        );
      })
    : myDayTasks;

  // Sort by: Overdue -> Today -> Upcoming -> No Date
  const sortedTasks = [...filteredTasks].sort((a, b) => {
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

  const getTaskSection = (task: Task) => {
    if (task.status === 'done') return 'Completed';
    if (!task.dueDate) return 'No Date';
    const date = new Date(task.dueDate);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isPast(date)) return 'Overdue';
    return 'Upcoming';
  };

  // Group by section
  const groupedTasks = sortedTasks.reduce((acc, task) => {
    const section = getTaskSection(task);
    if (!acc[section]) acc[section] = [];
    acc[section].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const sections = ['Overdue', 'Today', 'Tomorrow', 'Upcoming', 'No Date', 'Completed'];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {sections.map(section => {
        const tasks = groupedTasks[section] || [];
        if (tasks.length === 0 && section !== 'Completed') return null;
        if (section === 'Completed' && tasks.length === 0) return null; // Hide if empty

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
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
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
          icon={Sun}
          title="Your day is clear"
          description="Add tasks to My Day by clicking the sun icon on any task."
          variant="default"
        />
      )}
    </div>
  );
}
