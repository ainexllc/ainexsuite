'use client';

import { useMemo } from 'react';
import { Task } from '@/types/models';
import { useTodoStore } from '@/lib/store';
import { format, isToday, isPast, parseISO, isValid } from 'date-fns';
import { AlertCircle, Calendar, Clock, Archive } from 'lucide-react';

interface EisenhowerMatrixProps {
  onEditTask: (taskId: string) => void;
}

export function EisenhowerMatrix({ onEditTask }: EisenhowerMatrixProps) {
  const { tasks, getCurrentSpace } = useTodoStore();
  const currentSpace = getCurrentSpace();

  const matrixTasks = useMemo(() => {
    if (!currentSpace) return { q1: [], q2: [], q3: [], q4: [] };

    const spaceTasks = tasks.filter(t => 
      (currentSpace.id === 'all' || t.spaceId === currentSpace.id) && 
      t.status !== 'done'
    );
    
    const q1: Task[] = []; // Urgent & Important
    const q2: Task[] = []; // Not Urgent & Important
    const q3: Task[] = []; // Urgent & Not Important
    const q4: Task[] = []; // Not Urgent & Not Important

    spaceTasks.forEach(task => {
      const isImportant = task.priority === 'high';
      
      let isUrgent = false;
      if (task.dueDate) {
        const date = parseISO(task.dueDate);
        if (isValid(date)) {
          isUrgent = isToday(date) || isPast(date);
        }
      }

      if (isImportant && isUrgent) q1.push(task);
      else if (isImportant && !isUrgent) q2.push(task);
      else if (!isImportant && isUrgent) q3.push(task);
      else q4.push(task);
    });

    return { q1, q2, q3, q4 };
  }, [tasks, currentSpace]);

  const Quadrant = ({ title, subtitle, tasks, color, icon: Icon }: { title: string, subtitle: string, tasks: Task[], color: string, icon: React.ElementType }) => (
    <div className={`flex flex-col h-full rounded-xl border ${color} bg-surface-card overflow-hidden`}>
      <div className={`p-4 border-b ${color} bg-opacity-50 flex justify-between items-center`}>
        <div>
          <h3 className="font-bold text-ink-900 flex items-center gap-2">
            <Icon className="h-4 w-4" /> {title}
          </h3>
          <p className="text-xs text-ink-500">{subtitle}</p>
        </div>
        <span className="text-xs font-mono bg-surface-elevated px-2 py-1 rounded-full">{tasks.length}</span>
      </div>
      <div className="p-4 flex-1 overflow-y-auto space-y-3">
        {tasks.map(task => (
          <div 
            key={task.id}
            onClick={() => onEditTask(task.id)}
            className="p-3 bg-surface-elevated rounded-lg border border-outline-subtle hover:border-accent-500/50 cursor-pointer transition-all shadow-sm hover:shadow-md group"
          >
            <p className="font-medium text-ink-900 text-sm line-clamp-2">{task.title}</p>
            <div className="flex items-center gap-2 mt-2 text-xs text-ink-500">
              {task.dueDate && (
                <span className={`flex items-center gap-1 ${isPast(parseISO(task.dueDate)) && !isToday(parseISO(task.dueDate)) ? 'text-red-500' : ''}`}>
                  <Calendar className="h-3 w-3" />
                  {format(parseISO(task.dueDate), 'MMM d')}
                </span>
              )}
              {task.tags && task.tags.length > 0 && (
                <span className="bg-surface-base px-1.5 py-0.5 rounded text-[10px]">
                  {task.tags[0]}
                </span>
              )}
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="h-full flex items-center justify-center text-ink-400 text-xs italic">
            No tasks
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[calc(100vh-240px)] min-h-[600px]">
      <Quadrant 
        title="Do First" 
        subtitle="Urgent & Important" 
        tasks={matrixTasks.q1} 
        color="border-red-500/30 bg-red-500/5"
        icon={AlertCircle}
      />
      <Quadrant 
        title="Schedule" 
        subtitle="Less Urgent, Important" 
        tasks={matrixTasks.q2} 
        color="border-blue-500/30 bg-blue-500/5"
        icon={Calendar}
      />
      <Quadrant 
        title="Delegate" 
        subtitle="Urgent, Less Important" 
        tasks={matrixTasks.q3} 
        color="border-yellow-500/30 bg-yellow-500/5"
        icon={Clock}
      />
      <Quadrant 
        title="Eliminate" 
        subtitle="Neither Urgent nor Important" 
        tasks={matrixTasks.q4} 
        color="border-zinc-500/30 bg-zinc-500/5"
        icon={Archive}
      />
    </div>
  );
}
