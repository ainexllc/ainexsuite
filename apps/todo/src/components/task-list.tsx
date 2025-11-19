'use client';

import { useState, useEffect } from 'react';
import type { TodoTask, Priority } from '@ainexsuite/types';
import { updateTask, reorderTasks } from '@/lib/todo';
import { Circle, CheckCircle2, Flag, Calendar, GripVertical } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskListProps {
  tasks: TodoTask[];
  onTaskClick: (task: TodoTask) => void;
  onTaskUpdate: () => void;
}

const PRIORITY_COLORS: Record<Priority, string> = {
  urgent: 'text-priority-urgent',
  high: 'text-priority-high',
  medium: 'text-priority-medium',
  low: 'text-priority-low',
  none: 'text-priority-none',
};

interface SortableTaskProps {
  task: TodoTask;
  onToggle: (task: TodoTask, e: React.MouseEvent) => void;
  onTaskClick: (task: TodoTask) => void;
}

function SortableTask({ task, onToggle, onTaskClick }: SortableTaskProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isOverdue = task.dueDate && task.dueDate < Date.now() && !task.completed;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="surface-card rounded-lg p-4 cursor-pointer hover:surface-hover transition-all group"
    >
      <div className="flex items-start gap-3">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 flex-shrink-0 cursor-grab active:cursor-grabbing text-ink-600 hover:text-ink-800"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-5 w-5" />
        </button>

        <button onClick={(e) => onToggle(task, e)} className="mt-0.5 flex-shrink-0">
          {task.completed ? (
            <CheckCircle2 className="h-5 w-5 text-accent-500" />
          ) : (
            <Circle className="h-5 w-5 text-ink-600 group-hover:text-ink-800 transition-colors" />
          )}
        </button>

        <div className="flex-1 min-w-0" onClick={() => onTaskClick(task)}>
          <div className="flex items-start gap-2 mb-1">
            <h3 className={cn('font-medium flex-1', task.completed && 'line-through text-ink-600')}>
              {task.title}
            </h3>

            {task.priority !== 'none' && (
              <Flag className={cn('h-4 w-4 flex-shrink-0', PRIORITY_COLORS[task.priority])} />
            )}
          </div>

          {task.description && (
            <p className="text-sm text-ink-600 mb-2 line-clamp-2">{task.description}</p>
          )}

          <div className="flex items-center gap-3 text-xs text-ink-600">
            {task.dueDate && (
              <div className={cn('flex items-center gap-1', isOverdue && 'text-priority-urgent')}>
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(task.dueDate), 'MMM d')}</span>
              </div>
            )}

            {task.subtasks && task.subtasks.length > 0 && (
              <span>
                {task.subtasks.filter((st) => st.completed).length}/{task.subtasks.length} subtasks
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TaskList({ tasks, onTaskClick, onTaskUpdate }: TaskListProps) {
  const [orderedTasks, setOrderedTasks] = useState(tasks);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleToggle = async (task: TodoTask, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateTask(task.id, {
        completed: !task.completed,
        completedAt: !task.completed ? Date.now() : undefined,
      });
      onTaskUpdate();
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = orderedTasks.findIndex((task) => task.id === active.id);
    const newIndex = orderedTasks.findIndex((task) => task.id === over.id);

    const reorderedTasks = arrayMove(orderedTasks, oldIndex, newIndex);
    setOrderedTasks(reorderedTasks);

    // Update the order in Firebase
    try {
      const taskIds = reorderedTasks.map((task) => task.id);
      const newOrders = reorderedTasks.map((_, index) => index);
      await reorderTasks(taskIds, newOrders);
      onTaskUpdate();
    } catch (error) {
      console.error('Failed to reorder tasks:', error);
      // Revert on error
      setOrderedTasks(tasks);
    }
  };

  // Sync local state when tasks prop changes
  useEffect(() => {
    setOrderedTasks(tasks);
  }, [tasks]);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={orderedTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {orderedTasks.map((task) => (
            <SortableTask
              key={task.id}
              task={task}
              onToggle={handleToggle}
              onTaskClick={onTaskClick}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
