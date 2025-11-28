'use client';

import { useTodoStore } from '../../lib/store';
import { Task, TaskList } from '../../types/models';
import { Plus, MoreHorizontal, Calendar, CheckCircle2, Circle } from 'lucide-react';
import { format } from 'date-fns';
import { DataCard } from '@ainexsuite/ui';

interface TaskBoardProps {
  onEditTask: (taskId: string) => void;
}

export function TaskBoard({ onEditTask }: TaskBoardProps) {
  const { getCurrentSpace, getTasksByList, updateTask } = useTodoStore();
  const currentSpace = getCurrentSpace();

  if (!currentSpace) return null;

  const handleToggleComplete = async (task: Task) => {
    // Move to 'Done' list logic or just update status?
    // Simple status update for now.
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    await updateTask(task.id, { status: newStatus });
  };

  return (
    <div className="flex gap-6 h-full overflow-x-auto pb-4">
      {currentSpace.lists.map((list: TaskList) => (
        <div key={list.id} className="w-80 shrink-0 flex flex-col">
          {/* Column Header */}
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-bold text-white text-sm uppercase tracking-wide flex items-center gap-2">
              {list.title}
              <span className="bg-white/10 text-white/50 px-1.5 py-0.5 rounded text-[10px]">
                {getTasksByList(list.id).length}
              </span>
            </h3>
            <button className="text-white/30 hover:text-white">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>

          {/* Tasks Container */}
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
                      task.status === 'done' ? 'text-green-500' : 'text-white/20 hover:text-white/50'
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
                          : 'text-white/40'
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
                className={task.status === 'done' ? '[&_h3]:line-through [&_h3]:text-white/40' : ''}
              />
            ))}

            {/* Add Task Button (Ghost) */}
            <button
              onClick={() => {
                // We need to open editor with this listId pre-selected
                // This logic needs to be passed up or handled by parent setting state
                // For now, just a visual placeholder or simple trigger
                // In real app, parent should pass `onAddTask(listId)`
              }}
              className="w-full py-2 rounded-xl border border-dashed border-white/10 text-white/30 hover:text-white/60 hover:border-white/20 text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="h-4 w-4" /> Add Task
            </button>
          </div>
        </div>
      ))}

      {/* Add List Button */}
      <div className="w-80 shrink-0">
        <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors">
          <Plus className="h-4 w-4" /> Add Section
        </button>
      </div>
    </div>
  );
}
