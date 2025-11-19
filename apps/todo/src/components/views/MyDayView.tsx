'use client';

import { useTodoStore } from '../../lib/store';
import { Task, TaskSpace } from '../../types/models';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { format, isToday, isTomorrow, isPast } from 'date-fns';

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
          <div key={section}>
            <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 ${
              section === 'Overdue' ? 'text-red-400' :
              section === 'Today' ? 'text-accent-400' : 'text-white/50'
            }`}>
              {section} <span className="text-white/20 ml-1">{tasks.length}</span>
            </h3>
            
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
              {tasks.map((task: Task) => (
                <div
                  key={task.id}
                  className="group flex items-center gap-4 p-4 hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5 last:border-0"
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
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-base font-medium ${task.status === 'done' ? 'text-white/40 line-through' : 'text-white'}`}>
                        {task.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/40">
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
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="h-4 w-4 text-white/30" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {sortedTasks.length === 0 && (
        <div className="text-center py-20">
          <div className="bg-white/5 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">All caught up!</h3>
          <p className="text-white/50">No tasks assigned to you right now.</p>
        </div>
      )}
    </div>
  );
}
