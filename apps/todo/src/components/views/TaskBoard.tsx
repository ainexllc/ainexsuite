'use client';

import { useTodoStore } from '../../lib/store';
import { Task, TaskList } from '../../types/models';
import { Plus, MoreHorizontal, Calendar, CheckCircle2, Circle } from 'lucide-react';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { DataCard } from '@ainexsuite/ui';

interface TaskBoardProps {
  onEditTask: (taskId: string) => void;
}

export function TaskBoard({ onEditTask }: TaskBoardProps) {
  const { getCurrentSpace, getTasksByList, updateTask, tasks } = useTodoStore();
  const currentSpace = getCurrentSpace();

  if (!currentSpace) return null;

  const handleToggleComplete = async (task: Task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    await updateTask(task.id, { status: newStatus });
  };

  // Handle "All Spaces" view with status-based columns
  if (currentSpace.id === 'all') {
    const columns = [
      { id: 'todo', title: 'To Do', status: 'todo' },
      { id: 'in_progress', title: 'In Progress', status: 'in_progress' },
      { id: 'done', title: 'Done', status: 'done' }
    ];

    return (
      <div className="flex gap-6 h-full overflow-x-auto pb-4">
        {columns.map(col => {
          const columnTasks = tasks.filter(t =>
            col.status === 'done' ? t.status === 'done' :
            col.status === 'in_progress' ? t.status === 'in_progress' || t.status === 'review' :
            t.status === 'todo'
          );

          return (
            <div key={col.id} className="w-80 shrink-0 flex flex-col">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="font-bold text-foreground text-sm uppercase tracking-wide flex items-center gap-2">
                  {col.title}
                  <span className="bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-[10px]">
                    {columnTasks.length}
                  </span>
                </h3>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto min-h-[200px]">
                {columnTasks.map(task => (
                  <TaskCard key={task.id} task={task} onEditTask={onEditTask} onToggleComplete={handleToggleComplete} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-full overflow-x-auto pb-4">
      {currentSpace.lists.map((list: TaskList) => (
        <div key={list.id} className="w-80 shrink-0 flex flex-col">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-bold text-foreground text-sm uppercase tracking-wide flex items-center gap-2">
              {list.title}
              <span className="bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-[10px]">
                {getTasksByList(list.id).length}
              </span>
            </h3>
            <button className="text-muted-foreground hover:text-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto min-h-[200px]">
            {getTasksByList(list.id).map((task: Task) => (
              <DataCard
                key={task.id}
                variant="compact"
                title={task.title}
                icon={
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleComplete(task);
                    }}
                    className={`transition-colors ${
                      task.status === 'done' ? 'text-green-500' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {task.status === 'done' ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </button>
                }
                footer={
                  <div className="flex items-center gap-3 text-xs">
                    {task.dueDate && (
                      <div className={`flex items-center gap-1 ${
                        new Date(task.dueDate) < new Date() && task.status !== 'done'
                          ? 'text-red-400'
                          : 'text-muted-foreground'
                      }`}>
                        <Calendar className="h-3 w-3" />
                        {format(new Date(task.dueDate), 'MMM d')}
                      </div>
                    )}
                    {task.priority === 'high' && (
                      <span className="text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">
                        High
                      </span>
                    )}
                  </div>
                }
                onClick={() => onEditTask(task.id)}
                className={task.status === 'done' ? '[&_h3]:line-through [&_h3]:text-muted-foreground' : ''}
              />
            ))}

            {/* Add Task Button (Ghost) */}
            <button
              className="w-full py-2 rounded-xl border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-border/80 text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="h-4 w-4" /> Add Task
            </button>
          </div>
        </div>
      ))}

      {/* Add List Button */}
      <div className="w-80 shrink-0">
        <button className="w-full py-3 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground font-medium text-sm flex items-center justify-center gap-2 transition-colors">
          <Plus className="h-4 w-4" /> Add Section
        </button>
      </div>
    </div>
  );
}

// Extracted TaskCard for reuse
function TaskCard({ task, onEditTask, onToggleComplete }: { task: Task, onEditTask: (id: string) => void, onToggleComplete: (t: Task) => void }) {
  const date = task.dueDate ? parseISO(task.dueDate) : null;
  const isOverdue = date && isPast(date) && !isToday(date) && task.status !== 'done';

  return (
    <div
      className="group bg-card border border-border hover:border-border/80 rounded-xl p-3 shadow-sm transition-all hover:shadow-md cursor-pointer"
      onClick={() => onEditTask(task.id)}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(task);
          }}
          className={`mt-0.5 shrink-0 transition-colors ${
            task.status === 'done' ? 'text-green-500' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {task.status === 'done' ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-medium text-foreground mb-1 truncate ${
            task.status === 'done' ? 'line-through text-muted-foreground' : ''
          }`}>
            {task.title}
          </h4>

          <div className="flex items-center gap-3">
            {date && (
              <div className={`flex items-center gap-1 text-[10px] ${isOverdue ? 'text-red-400' : 'text-muted-foreground'}`}>
                <Calendar className="h-3 w-3" />
                {format(date, 'MMM d')}
              </div>
            )}

            {task.priority === 'high' && (
              <span className="text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">
                High
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
