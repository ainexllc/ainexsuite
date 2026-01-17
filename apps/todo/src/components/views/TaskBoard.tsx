'use client';

import { useMemo, useCallback, useState, useEffect } from 'react';
import { CheckCircle2, Sun, CalendarDays, Trash2 } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  useSensors,
  useSensor,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { clsx } from 'clsx';
import { EmptyState, ListSection } from '@ainexsuite/ui';
import { TaskCard } from './TaskCard';
import { GroupHeader, GroupManager, GroupDropZone } from '../groups';
import { useSpaces } from '@/components/providers/spaces-provider';
import { useTodoStore } from '../../lib/store';
import { useAuth } from '@ainexsuite/auth';
import type { Task, TaskGroup } from '../../types/models';
import {
  sortParentTasksWithCompletedAtBottom,
  sortSubtasksWithCompletedAtBottom,
} from '../../lib/task-sort';

// Droppable zone for favorited tasks
function FavoritesDropZone({ children }: { children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'favorites',
    data: { type: 'favorites' },
  });

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        'rounded-lg transition-all duration-200',
        isOver && 'bg-blue-50/40 dark:bg-blue-950/20 rounded-lg p-2'
      )}
    >
      {children}
    </div>
  );
}

// Droppable zone for ungrouped tasks
function UngroupedDropZone({ children, hasGroups, isEmpty }: { children: React.ReactNode; hasGroups: boolean; isEmpty: boolean }) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'ungrouped',
    data: { type: 'ungrouped', groupId: null },
  });

  if (!hasGroups) {
    return <>{children}</>;
  }

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        'rounded-lg transition-all duration-200',
        isOver && !isEmpty && 'bg-blue-50/40 dark:bg-blue-950/20 rounded-lg p-2'
      )}
    >
      {isEmpty ? (
        <ListSection title="Ungrouped" count={0}>
          <div
            className={clsx(
              'px-4 py-3 rounded-md border border-dashed transition-all duration-200',
              isOver
                ? 'border-blue-500 bg-blue-100/60 dark:bg-blue-900/40 ring-1 ring-blue-500'
                : 'border-zinc-300 dark:border-zinc-700 bg-zinc-50/20 dark:bg-zinc-900/10'
            )}
          >
            <p className={clsx(
              'text-center text-xs transition-colors',
              isOver
                ? 'text-blue-600 dark:text-blue-400 font-medium'
                : 'text-zinc-400 dark:text-zinc-500'
            )}>
              {isOver ? 'Drop here' : 'Drop tasks here to ungroup'}
            </p>
          </div>
        </ListSection>
      ) : (
        children
      )}
    </div>
  );
}

interface TaskBoardProps {
  searchQuery?: string;
}

export function TaskBoard({ searchQuery = '' }: TaskBoardProps) {
  const {
    tasks,
    groups,
    collapsedGroups,
    toggleGroupCollapse,
    addGroup,
    updateGroup,
    deleteGroup,
    moveTaskToGroup,
    updateTask,
    deleteTask, // Soft delete - moves to trash
    permanentlyDeleteTask,
    emptyTrash,
  } = useTodoStore();
  const { currentSpace } = useSpaces();
  const { user } = useAuth();

  // Task lifecycle: auto-move completed tasks to trash after 24h, delete trash after 7d
  useEffect(() => {
    if (!currentSpace) return;

    const processTaskLifecycle = async () => {
      const now = Date.now();
      const dayAgo = now - 24 * 60 * 60 * 1000;
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

      // Find completed tasks older than 24 hours (need to move to trash)
      const tasksToTrash = tasks.filter((t: Task) => {
        if (t.spaceId !== currentSpace.id) return false;
        if (t.status !== 'done' || t.deletedAt) return false;
        const completedAt = t.completedAt || Date.parse(t.updatedAt);
        return completedAt < dayAgo;
      });

      // Find trashed tasks older than 7 days (need to permanently delete)
      const tasksToDelete = tasks.filter((t: Task) => {
        if (t.spaceId !== currentSpace.id || !t.deletedAt) return false;
        const deletedAt = Date.parse(t.deletedAt);
        return deletedAt < weekAgo;
      });

      // Move old completed tasks to trash
      for (const task of tasksToTrash) {
        await deleteTask(task.id);
      }

      // Permanently delete old trashed tasks
      for (const task of tasksToDelete) {
        await permanentlyDeleteTask(task.id);
      }
    };

    processTaskLifecycle();
  }, [tasks, currentSpace, deleteTask, permanentlyDeleteTask]);

  // Track active dragging task for DragOverlay
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Multi-sensor support: Pointer, Touch, and Keyboard
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
    useSensor(KeyboardSensor)
  );

  // Handle drag start - set active task for DragOverlay
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const taskData = event.active.data.current;
    if (taskData?.type === 'task' && taskData.task) {
      setActiveTask(taskData.task as Task);
    }
  }, []);

  // Handle drag end - move task to group or make it a subtask
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveTask(null); // Clear the active task

    const { active, over } = event;

    if (!over) return;

    const taskId = active.id as string;
    const overData = over.data.current;

    if (!overData) return;

    // Check if dropped on a task (make it a subtask)
    if (overData.type === 'task') {
      const targetTaskId = overData.taskId as string;
      // Don't allow making a task a subtask of itself
      if (targetTaskId !== taskId) {
        updateTask(taskId, { parentId: targetTaskId });
      }
    }
    // Check if dropped on a group or ungrouped zone
    else if (overData.type === 'group') {
      moveTaskToGroup(taskId, overData.groupId);
    } else if (overData.type === 'ungrouped') {
      moveTaskToGroup(taskId, null);
    }
  }, [moveTaskToGroup, updateTask]);

  // Helper to get time from Date or Firestore Timestamp
  const getTime = useCallback((date: Date | { toDate: () => Date } | string | number | undefined) => {
    if (!date) return 0;
    if (typeof date === 'number') return date;
    if (typeof date === 'string') return new Date(date).getTime();
    if (date instanceof Date) return date.getTime();
    if (typeof date.toDate === 'function') return date.toDate().getTime();
    return 0;
  }, []);

  // Filter tasks for current space, excluding archived and deleted
  const spaceTasks = useMemo(() => {
    if (!currentSpace) return [];
    let filtered = tasks.filter(
      (t: Task) => t.spaceId === currentSpace.id && !t.archived && !t.deletedAt
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

  // Get groups for current space
  const spaceGroups = useMemo(() => {
    if (!currentSpace) return [];
    return groups
      .filter((g) => g.spaceId === currentSpace.id)
      .sort((a, b) => a.order - b.order);
  }, [groups, currentSpace]);

  // Separate favorited and non-favorited, sorted by latest updated
  const favoritedTasks = useMemo(
    () => spaceTasks
      .filter((t) => t.favorited && t.status !== 'done')
      .sort((a, b) => getTime(b.updatedAt) - getTime(a.updatedAt)),
    [spaceTasks, getTime]
  );

  // Get today's date string for My Day comparison
  const todayString = useMemo(() => new Date().toISOString().split('T')[0], []);

  // My Day tasks - tasks with myDayDate set to today
  const myDayTasks = useMemo(
    () => spaceTasks
      .filter((t) => t.myDayDate === todayString && t.status !== 'done')
      .sort((a, b) => getTime(b.updatedAt) - getTime(a.updatedAt)),
    [spaceTasks, todayString, getTime]
  );

  // Upcoming tasks - tasks with due dates (today or future), excluding completed
  const upcomingTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return spaceTasks
      .filter((t) => {
        if (!t.dueDate || t.status === 'done') return false;
        const dueDate = new Date(t.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate >= today;
      })
      .sort((a, b) => {
        // Sort by due date ascending (soonest first)
        const dateA = new Date(a.dueDate!).getTime();
        const dateB = new Date(b.dueDate!).getTime();
        return dateA - dateB;
      });
  }, [spaceTasks]);

  // Get ungrouped tasks (no groupId or groupId doesn't exist)
  const validGroupIds = useMemo(() => new Set(spaceGroups.map((g) => g.id)), [spaceGroups]);

  const ungroupedTasks = useMemo(
    () => spaceTasks
      .filter((t) =>
        !t.favorited &&
        !t.dueDate && // Exclude tasks with due dates (they show in Upcoming)
        t.status !== 'done' && // Exclude completed tasks
        (!t.groupId || !validGroupIds.has(t.groupId))
      )
      .sort((a, b) => getTime(b.updatedAt) - getTime(a.updatedAt)),
    [spaceTasks, validGroupIds, getTime]
  );

  // Get tasks for a specific group
  const getTasksForGroup = useCallback(
    (groupId: string) => spaceTasks
      .filter((t) => !t.favorited && t.groupId === groupId && t.status !== 'done')
      .sort((a, b) => getTime(b.updatedAt) - getTime(a.updatedAt)),
    [spaceTasks, getTime]
  );

  // Completed tasks - tasks marked as done in the last 24 hours
  const completedTasks = useMemo(() => {
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return spaceTasks
      .filter((t) => {
        if (t.status !== 'done') return false;
        const completedAt = t.completedAt || Date.parse(t.updatedAt);
        return completedAt > dayAgo;
      })
      .sort((a, b) => {
        const aTime = a.completedAt || Date.parse(a.updatedAt);
        const bTime = b.completedAt || Date.parse(b.updatedAt);
        return bTime - aTime; // Most recently completed first
      });
  }, [spaceTasks]);

  // Trashed tasks - tasks with deletedAt in the last 7 days
  const trashedTasks = useMemo(() => {
    if (!currentSpace) return [];
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return tasks
      .filter((t: Task) => {
        if (!t.deletedAt || t.spaceId !== currentSpace.id) return false;
        const deletedAt = Date.parse(t.deletedAt);
        return deletedAt > weekAgo;
      })
      .sort((a, b) => {
        const aTime = Date.parse(a.deletedAt!);
        const bTime = Date.parse(b.deletedAt!);
        return bTime - aTime; // Most recently deleted first
      });
  }, [tasks, currentSpace]);

  const hasTasks = spaceTasks.length > 0;
  const hasGroups = spaceGroups.length > 0;

  // Handle creating a new group
  const handleCreateGroup = useCallback(async (name: string, color?: import('@ainexsuite/types').EntryColor) => {
    if (!currentSpace || !user) return;

    const now = new Date().toISOString();
    const newGroup: TaskGroup = {
      id: `group-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      spaceId: currentSpace.id,
      name,
      color: color || 'default',
      order: spaceGroups.length,
      createdAt: now,
      updatedAt: now,
      createdBy: user.uid,
      ownerId: user.uid,
    };

    await addGroup(newGroup);
  }, [currentSpace, user, spaceGroups.length, addGroup]);

  // Handle renaming a group
  const handleRenameGroup = useCallback(async (groupId: string, newName: string) => {
    await updateGroup(groupId, { name: newName });
  }, [updateGroup]);

  // Handle deleting a group
  const handleDeleteGroup = useCallback(async (groupId: string) => {
    await deleteGroup(groupId);
  }, [deleteGroup]);

  // Handle emptying the trash
  const handleEmptyTrash = useCallback(async () => {
    if (!currentSpace) return;
    await emptyTrash(currentSpace.id);
  }, [currentSpace, emptyTrash]);

  // Helper to get subtasks for a parent task
  const getSubtasks = useCallback(
    (parentId: string, taskList: Task[]) =>
      taskList.filter((t) => t.parentId === parentId).sort((a, b) => a.order - b.order),
    []
  );

  // Get children stats for a parent task
  const getChildrenStats = useCallback(
    (parentId: string, taskList: Task[]) => {
      const children = taskList.filter((t) => t.parentId === parentId);
      if (children.length === 0) return null;
      return {
        completed: children.filter((t) => t.status === 'done').length,
        total: children.length,
      };
    },
    []
  );

  // Handle changing group color
  const handleColorChange = useCallback(async (groupId: string, color: import('@ainexsuite/types').EntryColor) => {
    await updateGroup(groupId, { color });
  }, [updateGroup]);

  if (!currentSpace) return null;

  // flatRender: when true, render all tasks as standalone items (for Favorites section)
  const renderTaskList = (items: Task[], flatRender = false) => {
    // For flat render (Favorites), show all tasks independently without parent/subtask hierarchy
    if (flatRender) {
      const sortedItems = sortParentTasksWithCompletedAtBottom(items);
      return (
        <div className="space-y-1">
          {sortedItems.map((task) => (
            <div key={task.id}>
              <TaskCard task={task} isSubtask={!!task.parentId} />
            </div>
          ))}
        </div>
      );
    }

    // Separate parent tasks from subtasks
    const parentTasks = items.filter((t) => !t.parentId);

    // Sort parent tasks: uncompleted first, completed at bottom
    const sortedParents = sortParentTasksWithCompletedAtBottom(parentTasks);

    return (
      <div className="space-y-1">
        {sortedParents.map((task) => {
          const subtasks = getSubtasks(task.id, items);
          // Sort subtasks: uncompleted first, completed at bottom
          const sortedSubtasks = sortSubtasksWithCompletedAtBottom(subtasks);
          const childrenStats = getChildrenStats(task.id, items);

          return (
            <div key={task.id} className="space-y-0.5">
              <TaskCard task={task} isSubtask={false} childrenStats={childrenStats} />
              {/* Render subtasks */}
              {sortedSubtasks.length > 0 && (
                <div className="ml-6 space-y-0.5">
                  {sortedSubtasks.map((subtask) => (
                    <TaskCard
                      key={subtask.id}
                      task={subtask}
                      isSubtask={true}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderGroupSection = (group: TaskGroup) => {
    const groupTasks = getTasksForGroup(group.id);
    const completedCount = groupTasks.filter((t) => t.status === 'done').length;
    const isCollapsed = collapsedGroups.includes(group.id);

    return (
      <div key={group.id} className="space-y-2">
        <GroupHeader
          group={group}
          count={groupTasks.length}
          completedCount={completedCount}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => toggleGroupCollapse(group.id)}
          onRename={(newName) => handleRenameGroup(group.id, newName)}
          onColorChange={(color) => handleColorChange(group.id, color)}
          onDelete={() => handleDeleteGroup(group.id)}
        />
        {!isCollapsed && (
          <GroupDropZone groupId={group.id} isEmpty={groupTasks.length === 0} isCollapsed={isCollapsed}>
            {renderTaskList(groupTasks)}
          </GroupDropZone>
        )}
      </div>
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="cq-board">
        {hasTasks ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_3fr] gap-6 lg:gap-8">
            {/* Left Column - My Day, Favorites, Inbox */}
            <div className="space-y-6">
              {/* My Day at top */}
              {myDayTasks.length > 0 && (
                <ListSection
                  title="My Day"
                  count={myDayTasks.length}
                  icon={Sun}
                >
                  {renderTaskList(myDayTasks, true)}
                </ListSection>
              )}

              {/* Favorites */}
              {favoritedTasks.length > 0 && (
                <FavoritesDropZone>
                  <ListSection
                    title="Favorites"
                    count={favoritedTasks.length}
                  >
                    {renderTaskList(favoritedTasks, true)}
                  </ListSection>
                </FavoritesDropZone>
              )}

              {/* Inbox/Ungrouped */}
              <UngroupedDropZone hasGroups={hasGroups} isEmpty={ungroupedTasks.length === 0}>
                <ListSection
                  title="Inbox"
                  count={ungroupedTasks.length}
                >
                  {ungroupedTasks.length > 0 ? renderTaskList(ungroupedTasks) : (
                    <div className="px-4 py-6 text-center text-sm text-zinc-400 dark:text-zinc-500">
                      No tasks in inbox
                    </div>
                  )}
                </ListSection>
              </UngroupedDropZone>

              {/* Completed - tasks done in last 24 hours */}
              {completedTasks.length > 0 && (
                <ListSection
                  title="Completed"
                  count={completedTasks.length}
                  icon={CheckCircle2}
                >
                  {renderTaskList(completedTasks, true)}
                </ListSection>
              )}

              {/* Trash - deleted tasks from last 7 days */}
              {trashedTasks.length > 0 && (
                <ListSection
                  title="Trash"
                  count={trashedTasks.length}
                  icon={Trash2}
                  action={
                    <button
                      onClick={handleEmptyTrash}
                      className="text-[11px] font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    >
                      Empty
                    </button>
                  }
                >
                  {renderTaskList(trashedTasks, true)}
                </ListSection>
              )}
            </div>

            {/* Right Column - Upcoming + Groups */}
            <div className="space-y-6">
              {/* Upcoming at top of right column */}
              {upcomingTasks.length > 0 && (
                <ListSection
                  title="Upcoming"
                  count={upcomingTasks.length}
                  icon={CalendarDays}
                >
                  {renderTaskList(upcomingTasks, true)}
                </ListSection>
              )}

              {/* Custom Groups */}
              {spaceGroups.map(renderGroupSection)}

              {/* Add Group Button */}
              <GroupManager onCreateGroup={handleCreateGroup} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_3fr] gap-6 lg:gap-8">
            {/* Left Column - Empty Inbox */}
            <div className="space-y-6">
              <UngroupedDropZone hasGroups={hasGroups} isEmpty={true}>
                <ListSection title="Inbox" count={0}>
                  <div className="px-4 py-6 text-center text-sm text-zinc-400 dark:text-zinc-500">
                    No tasks yet
                  </div>
                </ListSection>
              </UngroupedDropZone>

              {/* Completed - tasks done in last 24 hours */}
              {completedTasks.length > 0 && (
                <ListSection
                  title="Completed"
                  count={completedTasks.length}
                  icon={CheckCircle2}
                >
                  {renderTaskList(completedTasks, true)}
                </ListSection>
              )}

              {/* Trash - deleted tasks from last 7 days */}
              {trashedTasks.length > 0 && (
                <ListSection
                  title="Trash"
                  count={trashedTasks.length}
                  icon={Trash2}
                  action={
                    <button
                      onClick={handleEmptyTrash}
                      className="text-[11px] font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    >
                      Empty
                    </button>
                  }
                >
                  {renderTaskList(trashedTasks, true)}
                </ListSection>
              )}
            </div>

            {/* Right Column - Groups + Empty State */}
            <div className="space-y-6">
              {hasGroups ? (
                spaceGroups.map(renderGroupSection)
              ) : (
                <EmptyState
                  icon={CheckCircle2}
                  title="All caught up!"
                  description="Add a task to start planning your day or organize your project."
                  variant="default"
                />
              )}
              <GroupManager onCreateGroup={handleCreateGroup} />
            </div>
          </div>
        )}
      </div>

      {/* Drag overlay - ghost preview that follows cursor */}
      <DragOverlay
        dropAnimation={{
          duration: 200,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}
      >
        {activeTask && (
          <div className="rotate-1 scale-105 shadow-lg rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-4 py-2 opacity-90">
            <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
              {activeTask.title}
            </span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
