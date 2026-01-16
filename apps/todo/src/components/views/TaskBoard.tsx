'use client';

import { useMemo, useCallback } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { clsx } from 'clsx';
import { EmptyState, ListSection } from '@ainexsuite/ui';
import { TaskCard } from './TaskCard';
import { GroupHeader, GroupManager, GroupDropZone } from '../groups';
import { useSpaces } from '@/components/providers/spaces-provider';
import { useTodoStore } from '../../lib/store';
import { useAuth } from '@ainexsuite/auth';
import type { Task, TaskGroup } from '../../types/models';

// Droppable zone for ungrouped tasks
function UngroupedDropZone({ children, hasGroups }: { children: React.ReactNode; hasGroups: boolean }) {
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
        'rounded-lg transition-colors',
        isOver && 'bg-zinc-100 dark:bg-zinc-800/50 ring-2 ring-zinc-400 ring-inset'
      )}
    >
      {children}
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
    updateTask
  } = useTodoStore();
  const { currentSpace } = useSpaces();
  const { user } = useAuth();

  // Handle drag end - move task to group or make it a subtask
  const handleDragEnd = useCallback((event: DragEndEvent) => {
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

  // Filter tasks for current space, excluding archived
  const spaceTasks = useMemo(() => {
    if (!currentSpace) return [];
    let filtered = tasks.filter(
      (t: Task) => t.spaceId === currentSpace.id && !t.archived
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
      .filter((t) => t.favorited)
      .sort((a, b) => getTime(b.updatedAt) - getTime(a.updatedAt)),
    [spaceTasks, getTime]
  );

  // Get ungrouped tasks (no groupId or groupId doesn't exist)
  const validGroupIds = useMemo(() => new Set(spaceGroups.map((g) => g.id)), [spaceGroups]);

  const ungroupedTasks = useMemo(
    () => spaceTasks
      .filter((t) => !t.favorited && (!t.groupId || !validGroupIds.has(t.groupId)))
      .sort((a, b) => getTime(b.updatedAt) - getTime(a.updatedAt)),
    [spaceTasks, validGroupIds, getTime]
  );

  // Get tasks for a specific group
  const getTasksForGroup = useCallback(
    (groupId: string) => spaceTasks
      .filter((t) => !t.favorited && t.groupId === groupId)
      .sort((a, b) => getTime(b.updatedAt) - getTime(a.updatedAt)),
    [spaceTasks, getTime]
  );

  const hasTasks = spaceTasks.length > 0;
  const hasGroups = spaceGroups.length > 0;

  // Handle creating a new group
  const handleCreateGroup = useCallback(async (name: string) => {
    if (!currentSpace || !user) return;

    const now = new Date().toISOString();
    const newGroup: TaskGroup = {
      id: `group-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      spaceId: currentSpace.id,
      name,
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

  // Helper to get subtasks for a parent task
  const getSubtasks = useCallback(
    (parentId: string, taskList: Task[]) =>
      taskList.filter((t) => t.parentId === parentId).sort((a, b) => a.order - b.order),
    []
  );

  if (!currentSpace) return null;

  const renderTaskList = (items: Task[], showIndentButtons: boolean = false) => {
    // Separate parent tasks from subtasks
    const parentTasks = items.filter((t) => !t.parentId);

    return (
      <div className="space-y-2">
        {parentTasks.map((task) => (
          <div key={task.id}>
            <TaskCard
              task={task}
              isSubtask={false}
              parentTasks={showIndentButtons ? parentTasks : []}
            />
            {/* Render subtasks */}
            {getSubtasks(task.id, items).length > 0 && (
              <div className="ml-6 mt-2 space-y-2">
                {getSubtasks(task.id, items).map((subtask) => (
                  <TaskCard
                    key={subtask.id}
                    task={subtask}
                    isSubtask={true}
                    parentTasks={showIndentButtons ? parentTasks : []}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderGroupSection = (group: TaskGroup) => {
    const groupTasks = getTasksForGroup(group.id);
    const isCollapsed = collapsedGroups.includes(group.id);

    return (
      <div key={group.id} className="space-y-2">
        <GroupHeader
          group={group}
          count={groupTasks.length}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => toggleGroupCollapse(group.id)}
          onRename={(newName) => handleRenameGroup(group.id, newName)}
          onDelete={() => handleDeleteGroup(group.id)}
        />
        {!isCollapsed && (
          <GroupDropZone groupId={group.id} isEmpty={groupTasks.length === 0} isCollapsed={isCollapsed}>
            {renderTaskList(groupTasks, true)}
          </GroupDropZone>
        )}
      </div>
    );
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="space-y-1 lg:px-0 cq-board">
        {hasTasks ? (
          <div className="space-y-8">
            {/* Favorited Tasks */}
            {favoritedTasks.length > 0 && (
              <ListSection
                title="Favorites"
                count={favoritedTasks.length}
              >
                {renderTaskList(favoritedTasks)}
              </ListSection>
            )}

            {/* Custom Groups */}
            {hasGroups && (
              <div className="space-y-6">
                {spaceGroups.map(renderGroupSection)}
              </div>
            )}

            {/* Ungrouped Tasks */}
            {ungroupedTasks.length > 0 && (
              <UngroupedDropZone hasGroups={hasGroups}>
                <ListSection
                  title={hasGroups ? 'Ungrouped' : 'All Tasks'}
                  count={ungroupedTasks.length}
                >
                  {renderTaskList(ungroupedTasks)}
                </ListSection>
              </UngroupedDropZone>
            )}

            {/* Add Group Button */}
            <div className="pt-2">
              <GroupManager onCreateGroup={handleCreateGroup} />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <EmptyState
              icon={CheckCircle2}
              title="All caught up!"
              description="This space is empty. Add a task to start planning your day or organize your project."
              variant="default"
            />

            {/* Add Group Button even when empty */}
            <div className="pt-2">
              <GroupManager onCreateGroup={handleCreateGroup} />
            </div>
          </div>
        )}
      </div>
    </DndContext>
  );
}
