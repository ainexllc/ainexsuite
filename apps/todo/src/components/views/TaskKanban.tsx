'use client';

import { useMemo, useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
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
  Ban,
  GripVertical,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { clsx } from 'clsx';
import { getEntryColorConfig, PriorityIcon } from '@ainexsuite/ui';

interface TaskKanbanProps {
  onEditTask: (taskId: string) => void;
  searchQuery?: string;
}

interface StatusColumn {
  id: TaskStatus;
  title: string;
  icon: React.ElementType;
  color: string;
  wipLimit?: number; // Work-in-progress limit
}

const STATUS_COLUMNS: StatusColumn[] = [
  { id: 'todo', title: 'To Do', icon: Circle, color: 'text-zinc-500' },
  { id: 'blocked', title: 'Blockers', icon: Ban, color: 'text-red-500' },
  { id: 'in_progress', title: 'In Progress', icon: Clock, color: 'text-blue-500', wipLimit: 5 },
  { id: 'done', title: 'Done', icon: CheckCircle2, color: 'text-green-500' },
];

export function TaskKanban({ onEditTask, searchQuery = '' }: TaskKanbanProps) {
  const {
    getCurrentSpace,
    tasks,
    updateTask,
    kanbanCollapsedColumns,
    toggleKanbanColumnCollapse
  } = useTodoStore();
  const currentSpace = getCurrentSpace();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeOverColumn, setActiveOverColumn] = useState<TaskStatus | null>(null);

  // Convert array to Set for easier checking
  const collapsedColumns = useMemo(() => new Set(kanbanCollapsedColumns), [kanbanCollapsedColumns]);

  // Sensors for drag and drop - includes touch support
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // Short delay to distinguish from scroll
        tolerance: 8, // Allow small movement during delay
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
      queued: [],
      todo: [],
      blocked: [],
      in_progress: [],
      done: [],
    };

    spaceTasks.forEach((task) => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      } else {
        grouped.todo.push(task);
      }
    });

    // Sort each column by order
    Object.keys(grouped).forEach((status) => {
      grouped[status as TaskStatus].sort((a, b) => (a.order || 0) - (b.order || 0));
    });

    return grouped;
  }, [spaceTasks]);

  const handleToggleComplete = useCallback(async (task: Task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    await updateTask(task.id, { status: newStatus });
  }, [updateTask]);

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = event.active.id as string;
    const task = spaceTasks.find((t) => t.id === taskId);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (!over) {
      setActiveOverColumn(null);
      return;
    }

    const overId = over.id as string;

    // Check if over a column
    const targetColumn = STATUS_COLUMNS.find((col) => col.id === overId);
    if (targetColumn) {
      setActiveOverColumn(targetColumn.id);
      return;
    }

    // Check if over a task - get that task's column
    const targetTask = spaceTasks.find((t) => t.id === overId);
    if (targetTask) {
      setActiveOverColumn(targetTask.status);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    setActiveOverColumn(null);

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
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 h-full overflow-x-auto pb-3 w-full">
        {STATUS_COLUMNS.map((column) => {
          const columnTasks = tasksByStatus[column.id];
          const Icon = column.icon;
          const isCollapsed = collapsedColumns.has(column.id);
          const isOverWipLimit = column.wipLimit !== undefined && columnTasks.length > column.wipLimit;
          const isActiveDropTarget = activeOverColumn === column.id;

          return (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={columnTasks}
              icon={Icon}
              isCollapsed={isCollapsed}
              isOverWipLimit={isOverWipLimit}
              isActiveDropTarget={isActiveDropTarget}
              onToggleCollapse={() => toggleKanbanColumnCollapse(column.id)}
              onEditTask={onEditTask}
              onToggleComplete={handleToggleComplete}
            />
          );
        })}
      </div>

      {/* Drag overlay - shows the card being dragged */}
      <DragOverlay dropAnimation={{
        duration: 200,
        easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
      }}>
        {activeTask ? (
          <div className="rotate-2 scale-105">
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
  isCollapsed: boolean;
  isOverWipLimit?: boolean;
  isActiveDropTarget: boolean;
  onToggleCollapse: () => void;
  onEditTask: (id: string) => void;
  onToggleComplete: (task: Task) => void;
}

function KanbanColumn({
  column,
  tasks,
  icon: Icon,
  isCollapsed,
  isOverWipLimit,
  isActiveDropTarget,
  onToggleCollapse,
  onEditTask,
  onToggleComplete,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useSortable({
    id: column.id,
    data: {
      type: 'column',
      column,
    },
  });

  // Collapsed column view - fixed width, no flex
  if (isCollapsed) {
    return (
      <div className="w-10 shrink-0 grow-0 flex flex-col">
        <button
          onClick={onToggleCollapse}
          className={clsx(
            'flex flex-col items-center gap-1.5 py-2 px-1.5 rounded-lg transition-colors h-full min-h-[44px]',
            'bg-zinc-100/80 dark:bg-zinc-800/40 hover:bg-zinc-200 dark:hover:bg-zinc-800 active:bg-zinc-300 dark:active:bg-zinc-700'
          )}
        >
          <ChevronRight className="h-4 w-4 text-zinc-400" />
          <Icon className={clsx('h-4 w-4', column.color)} />
          <span className="bg-zinc-200/80 dark:bg-zinc-700/80 text-zinc-500 dark:text-zinc-400 px-1.5 py-0.5 rounded text-[10px] font-medium">
            {tasks.length}
          </span>
          <span
            className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 mt-1"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
          >
            {column.title}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-[200px] max-w-[400px] flex flex-col">
      {/* Column Header */}
      <div className="flex items-center gap-1.5 mb-1.5 px-0.5">
        <button
          onClick={onToggleCollapse}
          className="p-1.5 -m-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 active:bg-zinc-300 dark:active:bg-zinc-600 transition-colors"
        >
          <ChevronDown className="h-4 w-4 text-zinc-400" />
        </button>
        <Icon className={clsx('h-4 w-4', column.color)} />
        <h3 className="font-semibold text-[11px] text-zinc-900 dark:text-zinc-100">
          {column.title}
        </h3>
        <span className={clsx(
          'ml-auto px-1.5 py-0.5 rounded-full text-[9px] font-medium transition-colors',
          isOverWipLimit
            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
        )}>
          {tasks.length}
          {column.wipLimit && (
            <span className="text-zinc-400 dark:text-zinc-500">/{column.wipLimit}</span>
          )}
        </span>
        {isOverWipLimit && (
          <AlertTriangle className="h-2.5 w-2.5 text-red-500" />
        )}
      </div>

      {/* WIP Limit Warning */}
      {isOverWipLimit && (
        <div className="mb-1 px-1.5 py-0.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50">
          <p className="text-[8px] font-medium text-red-600 dark:text-red-400">
            Over WIP limit!
          </p>
        </div>
      )}

      {/* Column Content - Droppable area */}
      <div
        ref={setNodeRef}
        className={clsx(
          'flex-1 space-y-1.5 overflow-y-auto min-h-[120px] pb-1.5 rounded-xl p-1 transition-all duration-200',
          isOver || isActiveDropTarget
            ? 'bg-[var(--color-primary)]/10 ring-2 ring-[var(--color-primary)]/40'
            : 'bg-zinc-50/50 dark:bg-zinc-900/30'
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
            "flex items-center justify-center h-10 rounded-lg border border-dashed text-[10px] transition-colors",
            isOver || isActiveDropTarget
              ? "border-[var(--color-primary)]/50 text-[var(--color-primary)] bg-[var(--color-primary)]/5"
              : "border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600"
          )}>
            {isOver || isActiveDropTarget ? 'Drop here' : 'Empty'}
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
      className={clsx(
        'transition-opacity',
        isDragging && 'opacity-40'
      )}
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

  // Check if we have any metadata to show
  const hasMetadata = task.priority === 'high' || task.priority === 'urgent' || date || totalSubtasks > 0 || (task.tags && task.tags.length > 0);

  return (
    <div
      className={clsx(
        'group rounded-lg px-2 py-1.5 transition-all min-h-[44px]',
        'border border-zinc-200/80 dark:border-zinc-800/80',
        isDragging
          ? 'shadow-lg border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]/30'
          : 'hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm active:bg-zinc-50 dark:active:bg-zinc-800/50 cursor-pointer',
        colorConfig?.cardClass || 'bg-white dark:bg-zinc-900'
      )}
      onClick={() => onEditTask?.(task.id)}
    >
      <div className="flex items-start gap-1">
        {/* Drag handle - always visible for touch, larger touch target */}
        <button
          {...dragHandleProps}
          className="mt-0.5 shrink-0 p-1 -m-1 text-zinc-300 dark:text-zinc-700 hover:text-zinc-500 dark:hover:text-zinc-400 cursor-grab active:cursor-grabbing touch-none"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-3 w-3" />
        </button>

        {/* Check icon - turns green when done */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete?.(task);
          }}
          className={clsx(
            'mt-px shrink-0 p-1 -m-0.5 transition-colors',
            task.status === 'done'
              ? 'text-green-500'
              : 'text-zinc-300 dark:text-zinc-600 hover:text-zinc-500 dark:hover:text-zinc-400'
          )}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
        </button>

        <div className="flex-1 min-w-0">
          {/* Title */}
          <h4
            className={clsx(
              'text-[11px] font-medium leading-snug',
              task.status === 'done'
                ? 'line-through text-zinc-400 dark:text-zinc-500'
                : 'text-zinc-900 dark:text-zinc-100'
            )}
          >
            {task.title}
          </h4>

          {/* Meta row - only show if we have metadata */}
          {hasMetadata && (
            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
              {/* Priority */}
              {(task.priority === 'high' || task.priority === 'urgent') && (
                <PriorityIcon priority={task.priority} size="sm" />
              )}

              {/* Due date */}
              {date && (
                <span
                  className={clsx(
                    'text-[8px] font-medium px-1 py-px rounded',
                    isOverdue
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                  )}
                >
                  {format(date, 'MMM d')}
                </span>
              )}

              {/* Subtask progress */}
              {totalSubtasks > 0 && (
                <span className="text-[8px] font-medium px-1 py-px rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                  {completedSubtasks}/{totalSubtasks}
                </span>
              )}

              {/* Tags preview */}
              {task.tags && task.tags.length > 0 && (
                <span className="text-[8px] text-zinc-400 dark:text-zinc-500">
                  #{task.tags[0]}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
