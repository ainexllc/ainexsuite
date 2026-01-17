// apps/todo/src/types/models.ts

import type { EntryColor, SpaceType } from '@ainexsuite/types';

export type { SpaceType };

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
export type TaskStatus = 'queued' | 'todo' | 'blocked' | 'in_progress' | 'done';

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TaskAttachment {
  id: string;
  url: string;
  name: string;
  type: string;
  size: number;
}

export type TaskType = 'text' | 'checklist';

export interface Task {
  id: string;
  spaceId: string;
  listId: string; // Belongs to a column/list
  groupId?: string; // Optional custom group assignment
  parentId?: string; // Optional parent task for subtasks
  title: string;
  description?: string;
  type?: TaskType; // 'text' (default) or 'checklist'
  checklist?: ChecklistItem[]; // For checklist mode
  attachments?: TaskAttachment[]; // Image attachments
  status: TaskStatus;
  priority: Priority;
  dueDate?: string; // ISO date
  assigneeIds: string[];
  subtasks: Subtask[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  ownerId: string; // User who created this task (for Firestore rules)
  order: number; // For manual sorting within list
  // Standard entry fields (shared across apps)
  favorited?: boolean;
  archived?: boolean;
  color?: EntryColor;
  // For shared spaces - contains member UIDs who can see this task
  sharedWithUserIds?: string[];
  // Timestamp when task was marked as done (for auto-sorting completed to bottom)
  completedAt?: number | null;
  // My Day feature - ISO date string (e.g., "2026-01-16") when task is added to My Day
  myDayDate?: string;
  // Soft delete - ISO timestamp when task was moved to trash (30-day retention)
  deletedAt?: string;
}

// Custom task groups for manual organization
export interface TaskGroup {
  id: string;
  spaceId: string;
  name: string;
  color?: EntryColor;
  order: number;
  collapsed?: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  ownerId: string;
}
