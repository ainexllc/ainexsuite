'use client';

import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTodoStore } from '../../lib/store';
import type { Task, TaskStatus } from '../../types/models';
import {
  CheckCircle2,
  Circle,
  Clock,
  Eye,
  Flag,
  GripVertical,
} from 'lucide-react';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { clsx } from 'clsx';
import { getEntryColorConfig } from '@ainexsuite/ui';

interface TaskKanbanProps {
  onEditTask: (taskId: string) => void;
  searchQuery?: string;
}

interface StatusColumn {
  id: TaskStatus;
  title: string;
  icon: React.ElementType;
  color: string;
}

const STATUS_COLUMNS: StatusColumn[] = [
  { id: 'todo', title: 'To Do', icon: Circle, color: 'text-zinc-500' },
  { id: 'in_progress', title: 'In Progress', icon: Clock, color: 'text-blue-500' },
  { id: 'review', title: 'Review', icon: Eye, color: 'text-amber-500' },
  { id: 'done', title: 'Done', icon: CheckCircle2, color: 'text-green-500' },
];

export function TaskKanban({ onEditTask, searchQuery = '' }: TaskKanbanProps) {
  const { getCurrentSpace, tasks, updateTask } = useTodoStore();
  const currentSpace = getCurrentSpace();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filter tasks for current space, excluding archived
  const spaceTasks = useMemo(() => {
    if (!currentSpace) return [];
    let filtered = tasks.filter(
      (t: Task) =>
        (currentSpace.id === 'all' || t.spaceId === currentSpace.id) && !t.archived
    );

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.tags?.some((tag) => tag.toLowerCase().includes(query)) ||
          task.subtasks?.some((st) => st.title.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [tasks, currentSpace, searchQuery]);

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      todo: [],
      in_progress: [],
      review: [],
      done: [],
    };

    spaceTasks.forEach((task) => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      } else {
        grouped.todo.push(task);
      }
    });

    return grouped;
  }, [spaceTasks]);

  const handleToggleComplete = async (task: Task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    await updateTask(task.id, { status: newStatus });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = event.active.id as string;
    const task = spaceTasks.find((t) => t.id === taskId);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column
    const targetColumn = STATUS_COLUMNS.find((col) => col.id === overId);
    if (targetColumn) {
      const task = spaceTasks.find((t) => t.id === taskId);
      if (task && task.status !== targetColumn.id) {
        await updateTask(taskId, { status: targetColumn.id });
      }
      return;
    }

    // Check if dropped on another task - get that task's column
    const targetTask = spaceTasks.find((t) => t.id === overId);
    if (targetTask) {
      const task = spaceTasks.find((t) => t.id === taskId);
      if (task && task.status !== targetTask.status) {
        await updateTask(taskId, { status: targetTask.status });
      }
    }
  };

  if (!currentSpace) return null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 h-full overflow-x-auto pb-4 -mx-4 px-4">
        {STATUS_COLUMNS.map((column) => {
          const columnTasks = tasksByStatus[column.id];
          const Icon = column.icon;

          return (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={columnTasks}
              icon={Icon}
              onEditTask={onEditTask}
              onToggleComplete={handleToggleComplete}
            />
          );
        })}
      </div>

      {/* Drag overlay - shows the card being dragged */}
      <DragOverlay>
        {activeTask ? (
          <div className="opacity-90 rotate-3">
            <KanbanCardContent
              task={activeTask}
              isDragging
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// Droppable column component
interface KanbanColumnProps {
  column: StatusColumn;
  tasks: Task[];
  icon: React.ElementType;
  onEditTask: (id: string) => void;
  onToggleComplete: (task: Task) => void;
}

function KanbanColumn({ column, tasks, icon: Icon, onEditTask, onToggleComplete }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useSortable({
    id: column.id,
    data: {
      type: 'column',
      column,
    },
  });

  return (
    <div className="w-72 shrink-0 flex flex-col">
      {/* Column Header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <Icon className={clsx('h-4 w-4', column.color)} />
        <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
          {column.title}
        </h3>
        <span className="ml-auto bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full text-xs font-medium">
          {tasks.length}
        </span>
      </div>

      {/* Column Content - Droppable area */}
      <div
        ref={setNodeRef}
        className={clsx(
          'flex-1 space-y-3 overflow-y-auto min-h-[200px] pb-2 rounded-xl p-2 transition-colors',
          isOver && 'bg-[var(--color-primary)]/10 ring-2 ring-[var(--color-primary)]/30'
        )}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <SortableKanbanCard
              key={task.id}
              task={task}
              onEditTask={onEditTask}
              onToggleComplete={onToggleComplete}
            />
          ))}
        </SortableContext>

        {/* Empty state for column */}
        {tasks.length === 0 && (
          <div className={clsx(
            "flex items-center justify-center h-20 rounded-xl border-2 border-dashed text-sm transition-colors",
            isOver
              ? "border-[var(--color-primary)]/50 text-[var(--color-primary)]"
              : "border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600"
          )}>
            {isOver ? 'Drop here' : 'No tasks'}
          </div>
        )}
      </div>
    </div>
  );
}

// Sortable/Draggable card wrapper
interface SortableKanbanCardProps {
  task: Task;
  onEditTask: (id: string) => void;
  onToggleComplete: (task: Task) => void;
}

function SortableKanbanCard({ task, onEditTask, onToggleComplete }: SortableKanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(isDragging && 'opacity-50')}
    >
      <KanbanCardContent
        task={task}
        onEditTask={onEditTask}
        onToggleComplete={onToggleComplete}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

// Card content component (used for both regular and overlay)
interface KanbanCardContentProps {
  task: Task;
  onEditTask?: (id: string) => void;
  onToggleComplete?: (task: Task) => void;
  isDragging?: boolean;
  dragHandleProps?: Record<string, unknown>;
}

function KanbanCardContent({
  task,
  onEditTask,
  onToggleComplete,
  isDragging,
  dragHandleProps
}: KanbanCardContentProps) {
  const date = task.dueDate ? parseISO(task.dueDate) : null;
  const isOverdue = date && isPast(date) && !isToday(date) && task.status !== 'done';
  const colorConfig = getEntryColorConfig(task.color);

  const completedSubtasks = task.subtasks?.filter((s) => s.isCompleted).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  return (
    <div
      className={clsx(
        'group rounded-xl p-3 shadow-sm transition-all',
        'border border-zinc-200 dark:border-zinc-800',
        isDragging
          ? 'shadow-lg border-[var(--color-primary)]'
          : 'hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md cursor-pointer',
        colorConfig?.cardClass || 'bg-white dark:bg-zinc-900'
      )}
      onClick={() => onEditTask?.(task.id)}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <button
          {...dragHandleProps}
          className="mt-0.5 shrink-0 text-zinc-300 dark:text-zinc-700 hover:text-zinc-500 dark:hover:text-zinc-400 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete?.(task);
          }}
          className={clsx(
            'mt-0.5 shrink-0 transition-colors',
            task.status === 'done'
              ? 'text-green-500'
              : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
          )}
        >
          {task.status === 'done' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <Circle className="h-4 w-4" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          {/* Title */}
          <h4
            className={clsx(
              'text-sm font-medium leading-tight',
              task.status === 'done'
                ? 'line-through text-zinc-400 dark:text-zinc-500'
                : 'text-zinc-900 dark:text-zinc-100'
            )}
          >
            {task.title}
          </h4>

          {/* Meta row */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {/* Priority */}
            {task.priority === 'high' && (
              <Flag className="h-3 w-3 text-amber-500 fill-amber-500/20" />
            )}
            {task.priority === 'urgent' && (
              <Flag className="h-3 w-3 text-red-500 fill-red-500/20" />
            )}

            {/* Due date */}
            {date && (
              <span
                className={clsx(
                  'text-[10px] font-medium px-1.5 py-0.5 rounded',
                  isOverdue
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                )}
              >
                {format(date, 'MMM d')}
              </span>
            )}

            {/* Subtask progress */}
            {totalSubtasks > 0 && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                {completedSubtasks}/{totalSubtasks}
              </span>
            )}

            {/* Tags preview */}
            {task.tags && task.tags.length > 0 && (
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                #{task.tags[0]}
                {task.tags.length > 1 && ` +${task.tags.length - 1}`}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
