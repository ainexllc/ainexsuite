import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TaskSpace, Task } from '../types/models';
import { 
  createTodoSpaceInDb, 
  updateTodoSpaceInDb,
  createTaskInDb,
  updateTaskInDb
} from './firebase-service';

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
  
  // Getters
  getCurrentSpace: () => TaskSpace | undefined;
  getTasksByList: (listId: string) => Task[];
}

export const useTodoStore = create<TodoState>()(
  persist(
    (set, get) => ({
      spaces: [],
      currentSpaceId: '',
      tasks: [],
      myTasks: [],

      setSpaces: (spaces) => {
        const currentId = get().currentSpaceId;
        let nextId = currentId;
        if (spaces.length > 0 && !spaces.find(s => s.id === currentId)) {
          nextId = spaces[0].id;
        }
        set({ spaces, currentSpaceId: nextId });
      },
      setTasks: (tasks) => set({ tasks }),
      setMyTasks: (myTasks) => set({ myTasks }),

      setCurrentSpace: (spaceId) => set({ currentSpaceId: spaceId }),
      
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

      getCurrentSpace: () => {
        const { spaces, currentSpaceId } = get();
        return spaces.find((s) => s.id === currentSpaceId);
      },

      getTasksByList: (listId) => {
        const { tasks } = get();
        return tasks.filter((t) => t.listId === listId).sort((a, b) => a.order - b.order);
      },
    }),
    {
      name: 'todo-storage-client-prefs',
      partialize: (state) => ({ currentSpaceId: state.currentSpaceId }),
    }
  )
);
