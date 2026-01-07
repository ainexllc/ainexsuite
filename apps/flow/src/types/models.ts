import type { SpaceType } from '@ainexsuite/types';

export type { SpaceType };

export interface SpaceMember {
  uid: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'member' | 'viewer';
  joinedAt: string;
}

export interface WorkflowSpace {
  id: string;
  name: string;
  type: SpaceType;
  members: SpaceMember[];
  memberUids: string[];
  createdAt: string;
  createdBy: string;
}

export interface Workflow {
  id: string;
  spaceId: string;
  userId: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  nodes: unknown[];
  edges: unknown[];
  createdAt: string;
  updatedAt: string;
}
