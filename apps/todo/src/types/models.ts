// apps/todo/src/types/models.ts

export type SpaceType = 'personal' | 'family' | 'work';

export interface Member {
  uid: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'member' | 'viewer';
  joinedAt: string;
}

export interface TaskSpace {
  id: string;
  name: string;
  type: SpaceType;
  members: Member[];
  memberUids: string[];
  createdAt: string;
  createdBy: string;
  lists: TaskList[]; // Ordered list of lists/columns
}

export interface TaskList {
  id: string;
  title: string;
  order: number;
}

export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  spaceId: string;
  listId: string; // Belongs to a column/list
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string; // ISO date
  assigneeIds: string[];
  subtasks: Subtask[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  order: number; // For manual sorting within list
}
