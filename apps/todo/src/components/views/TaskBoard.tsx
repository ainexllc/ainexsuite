'use client';

import { useTodoStore } from '../../lib/store';
import { Task, TaskList } from '../../types/models';
import { Plus, MoreHorizontal, Calendar, CheckCircle2, Circle } from 'lucide-react';
import { format, parseISO, isPast, isToday } from 'date-fns';

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
            {getTasksByList(list.id).map((task: Task) => {
              const date = task.dueDate ? parseISO(task.dueDate) : null;
              const isOverdue = date && isPast(date) && !isToday(date) && task.status !== 'done';

              return (
                <div
                  key={task.id}
                  className="group bg-[#1a1a1a] border border-white/5 hover:border-white/10 rounded-xl p-3 shadow-sm transition-all hover:shadow-md cursor-pointer"
                  onClick={() => onEditTask(task.id)}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleComplete(task);
                      }}
                      className={`mt-0.5 shrink-0 transition-colors ${
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
                      <h4 className={`text-sm font-medium text-white mb-1 truncate ${
                        task.status === 'done' ? 'line-through text-white/40' : ''
                      }`}>
                        {task.title}
                      </h4>
                      
                      <div className="flex items-center gap-3">
                        {date && (
                          <div className={`flex items-center gap-1 text-[10px] ${isOverdue ? 'text-red-400' : 'text-white/40'}`}>
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
            })}
            
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
