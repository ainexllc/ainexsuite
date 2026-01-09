import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EntryColor } from '@ainexsuite/types';
import { TaskSpace, Task, TaskStatus } from '../types/models';
import {
  createTodoSpaceInDb,
  updateTodoSpaceInDb,
  createTaskInDb,
  updateTaskInDb,
  deleteTaskFromDb
} from './firebase-service';

// Default columns that are collapsed
const DEFAULT_COLLAPSED_COLUMNS: TaskStatus[] = ['blocked', 'done'];

interface TodoState {
  // State
  spaces: TaskSpace[];
  currentSpaceId: string;
  tasks: Task[];
  myTasks: Task[]; // "My Day" view across all spaces

  // Setters (Sync)
  setSpaces: (spaces: TaskSpace[]) => void;
  setTasks: (tasks: Task[]) => void;
  setMyTasks: (tasks: Task[]) => void;

  // Actions (DB)
  setCurrentSpace: (spaceId: string) => void;
  addSpace: (space: TaskSpace) => Promise<void>;
  updateSpace: (spaceId: string, updates: Partial<TaskSpace>) => Promise<void>;
  addTask: (task: Task) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;

  // Entry actions (standardized across apps)
  toggleTaskPin: (taskId: string, pinned: boolean) => Promise<void>;
  toggleTaskArchive: (taskId: string, archived: boolean) => Promise<void>;
  updateTaskColor: (taskId: string, color: EntryColor) => Promise<void>;

  // View Preferences
  viewPreferences: Record<string, string>; // spaceId -> viewType
  setViewPreference: (spaceId: string, view: string) => void;

  // Kanban Settings
  kanbanCollapsedColumns: TaskStatus[];
  setKanbanCollapsedColumns: (columns: TaskStatus[]) => void;
  toggleKanbanColumnCollapse: (columnId: TaskStatus) => void;

  // Getters
  getCurrentSpace: () => TaskSpace | undefined;
  getTasksByList: (listId: string) => Task[];
}

export const useTodoStore = create<TodoState>()(
  persist(
    (set, get) => ({
      spaces: [],
      currentSpaceId: 'personal',
      tasks: [],
      myTasks: [],
      viewPreferences: {},
      kanbanCollapsedColumns: DEFAULT_COLLAPSED_COLUMNS,

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
        set((state) => ({
          tasks: state.tasks.map((t) => t.id === taskId ? { ...t, ...updates } : t)
        }));
        await updateTaskInDb(taskId, updates);
      },

      deleteTask: async (taskId) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== taskId)
        }));
        await deleteTaskFromDb(taskId);
      },

      // Entry actions (standardized across apps)
      toggleTaskPin: async (taskId, pinned) => {
        set((state) => ({
          tasks: state.tasks.map((t) => t.id === taskId ? { ...t, pinned } : t)
        }));
        await updateTaskInDb(taskId, { pinned });
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
    }),
    {
      name: 'todo-storage-client-prefs',
      partialize: (state) => ({ currentSpaceId: state.currentSpaceId, viewPreferences: state.viewPreferences }),
      version: 1,
      migrate: (persistedState, version) => {
        const state = persistedState as { currentSpaceId?: string; viewPreferences?: Record<string, string> };
        // Migration: 'all' space was removed, default to 'personal'
        if (version === 0 && state.currentSpaceId === 'all') {
          return { ...state, currentSpaceId: 'personal' };
        }
        return state;
      },
    }
  )
);
