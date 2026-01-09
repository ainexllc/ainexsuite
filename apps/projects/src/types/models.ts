import type { SpaceType } from '@ainexsuite/types';

export type { SpaceType };

export interface SpaceMember {
  uid: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'member' | 'viewer';
  joinedAt: string;
}

export interface ProjectSpace {
  id: string;
  name: string;
  type: SpaceType;
  members: SpaceMember[];
  memberUids: string[];
  createdAt: string;
  createdBy: string;
}

export interface Project {
  id: string;
  // Required - 'personal' for personal content, or actual space ID
  spaceId: string;
  userId: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}
