import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EntryColor } from '@ainexsuite/types';
import { TaskSpace, Task, TaskStatus, TaskGroup } from '../types/models';
import {
  createTodoSpaceInDb,
  updateTodoSpaceInDb,
  createTaskInDb,
  updateTaskInDb,
  softDeleteTask,
  restoreTaskFromTrash,
  permanentlyDeleteTask,
  permanentlyDeleteAllTrashedTasks,
  createGroupInDb,
  updateGroupInDb,
  deleteGroupAndUnassignTasks
} from './firebase-service';

// Default columns that are collapsed
const DEFAULT_COLLAPSED_COLUMNS: TaskStatus[] = ['blocked', 'done'];

interface TodoState {
  // State
  spaces: TaskSpace[];
  currentSpaceId: string;
  tasks: Task[];
  myTasks: Task[]; // "My Day" view across all spaces
  groups: TaskGroup[]; // Custom task groups

  // Setters (Sync)
  setSpaces: (spaces: TaskSpace[]) => void;
  setTasks: (tasks: Task[]) => void;
  setMyTasks: (tasks: Task[]) => void;
  setGroups: (groups: TaskGroup[]) => void;

  // Actions (DB)
  setCurrentSpace: (spaceId: string) => void;
  addSpace: (space: TaskSpace) => Promise<void>;
  updateSpace: (spaceId: string, updates: Partial<TaskSpace>) => Promise<void>;
  addTask: (task: Task) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>; // Soft delete - moves to trash

  // Trash actions
  restoreTask: (taskId: string) => Promise<void>;
  permanentlyDeleteTask: (taskId: string) => Promise<void>;
  emptyTrash: (spaceId: string) => Promise<void>;

  // Group actions
  addGroup: (group: TaskGroup) => Promise<void>;
  updateGroup: (groupId: string, updates: Partial<TaskGroup>) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  moveTaskToGroup: (taskId: string, groupId: string | null) => Promise<void>;

  // Entry actions (standardized across apps)
  toggleTaskFavorite: (taskId: string, favorited: boolean) => Promise<void>;
  toggleTaskArchive: (taskId: string, archived: boolean) => Promise<void>;
  updateTaskColor: (taskId: string, color: EntryColor) => Promise<void>;

  // View Preferences
  viewPreferences: Record<string, string>; // spaceId -> viewType
  setViewPreference: (spaceId: string, view: string) => void;

  // Kanban Settings
  kanbanCollapsedColumns: TaskStatus[];
  setKanbanCollapsedColumns: (columns: TaskStatus[]) => void;
  toggleKanbanColumnCollapse: (columnId: TaskStatus) => void;

  // Group collapse state (stored locally)
  collapsedGroups: string[]; // Array of collapsed group IDs
  toggleGroupCollapse: (groupId: string) => void;

  // Getters
  getCurrentSpace: () => TaskSpace | undefined;
  getTasksByList: (listId: string) => Task[];
  getTasksByGroup: (groupId: string | null) => Task[];
  getGroupsForCurrentSpace: () => TaskGroup[];
}

export const useTodoStore = create<TodoState>()(
  persist(
    (set, get) => ({
      spaces: [],
      currentSpaceId: 'personal',
      tasks: [],
      myTasks: [],
      groups: [],
      viewPreferences: {},
      kanbanCollapsedColumns: DEFAULT_COLLAPSED_COLUMNS,
      collapsedGroups: [],

      setSpaces: (spaces) => {
        const currentId = get().currentSpaceId;
        let nextId = currentId;
        // Keep 'personal' as valid virtual space (note: 'all' space was removed)
        if (!currentId || currentId === 'all' || (currentId !== 'personal' && !spaces.find(s => s.id === currentId))) {
          // Default to 'personal' (My Todos) for new users
          nextId = 'personal';
        }
        set({ spaces, currentSpaceId: nextId });
      },
      setTasks: (tasks) => set({ tasks }),
      setMyTasks: (myTasks) => set({ myTasks }),
      setGroups: (groups) => set({ groups }),

      setCurrentSpace: (spaceId) => set({ currentSpaceId: spaceId }),

      setViewPreference: (spaceId, view) => set((state) => ({
        viewPreferences: { ...state.viewPreferences, [spaceId]: view }
      })),

      setKanbanCollapsedColumns: (columns) => set({ kanbanCollapsedColumns: columns }),

      toggleKanbanColumnCollapse: (columnId) => set((state) => {
        const isCollapsed = state.kanbanCollapsedColumns.includes(columnId);
        return {
          kanbanCollapsedColumns: isCollapsed
            ? state.kanbanCollapsedColumns.filter((id) => id !== columnId)
            : [...state.kanbanCollapsedColumns, columnId]
        };
      }),

      toggleGroupCollapse: (groupId) => set((state) => {
        const isCollapsed = state.collapsedGroups.includes(groupId);
        return {
          collapsedGroups: isCollapsed
            ? state.collapsedGroups.filter((id) => id !== groupId)
            : [...state.collapsedGroups, groupId]
        };
      }),

      addSpace: async (space) => {
        set((state) => ({ spaces: [...state.spaces, space], currentSpaceId: space.id }));
        await createTodoSpaceInDb(space);
      },

      updateSpace: async (spaceId, updates) => {
        set((state) => ({
          spaces: state.spaces.map((s) => s.id === spaceId ? { ...s, ...updates } : s)
        }));
        await updateTodoSpaceInDb(spaceId, updates);
      },

      addTask: async (task) => {
        set((state) => ({ tasks: [...state.tasks, task] }));
        await createTaskInDb(task);
      },

      updateTask: async (taskId, updates) => {
        // Auto-track completedAt when status changes
        const finalUpdates: Partial<Task> = { ...updates };
        if ('status' in updates) {
          if (updates.status === 'done') {
            // Set completedAt when marked done
            finalUpdates.completedAt = Date.now();
          } else {
            // Clear completedAt when changed away from done
            finalUpdates.completedAt = null;
          }
        }

        set((state) => ({
          tasks: state.tasks.map((t) => t.id === taskId ? { ...t, ...finalUpdates } : t)
        }));
        await updateTaskInDb(taskId, finalUpdates);
      },

      // Soft delete - moves to trash with 30-day retention
      deleteTask: async (taskId) => {
        const deletedAt = new Date().toISOString();
        set((state) => ({
          tasks: state.tasks.map((t) => t.id === taskId ? { ...t, deletedAt } : t)
        }));
        await softDeleteTask(taskId);
      },

      // Restore from trash
      restoreTask: async (taskId) => {
        set((state) => ({
          tasks: state.tasks.map((t) => t.id === taskId ? { ...t, deletedAt: undefined } : t)
        }));
        await restoreTaskFromTrash(taskId);
      },

      // Permanently delete single task
      permanentlyDeleteTask: async (taskId) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== taskId)
        }));
        await permanentlyDeleteTask(taskId);
      },

      // Empty trash - permanently delete all trashed tasks in a space
      emptyTrash: async (spaceId) => {
        const { tasks } = get();
        const trashedTasks = tasks.filter((t) => t.deletedAt && t.spaceId === spaceId);
        const taskIds = trashedTasks.map((t) => t.id);

        set((state) => ({
          tasks: state.tasks.filter((t) => !taskIds.includes(t.id))
        }));
        await permanentlyDeleteAllTrashedTasks(taskIds);
      },

      // Group actions
      addGroup: async (group) => {
        set((state) => ({ groups: [...state.groups, group] }));
        await createGroupInDb(group);
      },

      updateGroup: async (groupId, updates) => {
        set((state) => ({
          groups: state.groups.map((g) => g.id === groupId ? { ...g, ...updates } : g)
        }));
        await updateGroupInDb(groupId, updates);
      },

      deleteGroup: async (groupId) => {
        // Get tasks in this group to unassign them
        const { tasks } = get();
        const tasksInGroup = tasks.filter((t) => t.groupId === groupId);
        const taskIds = tasksInGroup.map((t) => t.id);

        // Optimistically update state
        set((state) => ({
          groups: state.groups.filter((g) => g.id !== groupId),
          tasks: state.tasks.map((t) => t.groupId === groupId ? { ...t, groupId: undefined } : t)
        }));

        // Delete from DB
        await deleteGroupAndUnassignTasks(groupId, taskIds);
      },

      moveTaskToGroup: async (taskId, groupId) => {
        set((state) => ({
          tasks: state.tasks.map((t) => t.id === taskId ? { ...t, groupId: groupId || undefined } : t)
        }));
        await updateTaskInDb(taskId, { groupId: groupId || undefined });
      },

      // Entry actions (standardized across apps)
      toggleTaskFavorite: async (taskId, favorited) => {
        set((state) => ({
          tasks: state.tasks.map((t) => t.id === taskId ? { ...t, favorited } : t)
        }));
        await updateTaskInDb(taskId, { favorited });
      },

      toggleTaskArchive: async (taskId, archived) => {
        set((state) => ({
          tasks: state.tasks.map((t) => t.id === taskId ? { ...t, archived } : t)
        }));
        await updateTaskInDb(taskId, { archived });
      },

      updateTaskColor: async (taskId, color) => {
        set((state) => ({
          tasks: state.tasks.map((t) => t.id === taskId ? { ...t, color } : t)
        }));
        await updateTaskInDb(taskId, { color });
      },

      getCurrentSpace: () => {
        const { spaces, currentSpaceId } = get();
        if (currentSpaceId === 'personal') {
          return {
            id: 'personal',
            name: 'My Todos',
            type: 'personal',
            members: [],
            memberUids: [],
            createdAt: new Date().toISOString(),
            createdBy: '',
            lists: [
              { id: 'personal_todo', title: 'To Do', order: 0 },
              { id: 'personal_progress', title: 'In Progress', order: 1 },
              { id: 'personal_done', title: 'Done', order: 2 },
            ]
          } as TaskSpace;
        }
        return spaces.find((s) => s.id === currentSpaceId);
      },

      getTasksByList: (listId) => {
        const { tasks } = get();
        return tasks.filter((t) => t.listId === listId).sort((a, b) => a.order - b.order);
      },

      getTasksByGroup: (groupId) => {
        const { tasks, currentSpaceId } = get();
        return tasks
          .filter((t) => t.spaceId === currentSpaceId && !t.archived && t.groupId === groupId)
          .sort((a, b) => a.order - b.order);
      },

      getGroupsForCurrentSpace: () => {
        const { groups, currentSpaceId } = get();
        return groups
          .filter((g) => g.spaceId === currentSpaceId)
          .sort((a, b) => a.order - b.order);
      },
    }),
    {
      name: 'todo-storage-client-prefs',
      partialize: (state) => ({
        currentSpaceId: state.currentSpaceId,
        viewPreferences: state.viewPreferences,
        collapsedGroups: state.collapsedGroups
      }),
      version: 2,
      migrate: (persistedState, version) => {
        const state = persistedState as {
          currentSpaceId?: string;
          viewPreferences?: Record<string, string>;
          collapsedGroups?: string[];
        };
        // Migration: 'all' space was removed, default to 'personal'
        if (version < 1 && state.currentSpaceId === 'all') {
          return { ...state, currentSpaceId: 'personal' };
        }
        // Migration: add collapsedGroups if missing
        if (version < 2 && !state.collapsedGroups) {
          return { ...state, collapsedGroups: [] };
        }
        return state;
      },
    }
  )
);
