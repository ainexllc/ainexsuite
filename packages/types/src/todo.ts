import type { BaseDocument, Priority, Timestamp } from './common';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Todo extends BaseDocument {
  title: string;
  description: string;
  completed: boolean;
  dueDate: Timestamp | null;
  priority: Priority;
  projectId: string | null;
  subtasks: Subtask[];
  completedAt: Timestamp | null;
}

export type CreateTodoInput = Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>;

export type UpdateTodoInput = Partial<Omit<Todo, 'id' | 'ownerId' | 'createdAt'>>;

export interface Project {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  color: string;
  todoCount: number;
  completedCount: number;
  createdAt: Timestamp;
}

export type CreateProjectInput = Omit<Project, 'id' | 'todoCount' | 'completedCount' | 'createdAt'>;

export type UpdateProjectInput = Partial<Omit<Project, 'id' | 'ownerId' | 'todoCount' | 'completedCount' | 'createdAt'>>;
