import type { SpaceType } from '@ainexsuite/types';

export type { SpaceType };

export interface SpaceMember {
  uid: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'member' | 'viewer';
  joinedAt: string;
}

export interface PulseSpace {
  id: string;
  name: string;
  type: SpaceType;
  members: SpaceMember[];
  memberUids: string[];
  createdAt: string;
  createdBy: string;
}

export interface HealthMetric {
  id: string;
  spaceId: string;
  userId: string;
  type: 'heart_rate' | 'blood_pressure' | 'weight' | 'sleep' | 'steps' | 'hydration';
  value: number;
  unit: string;
  timestamp: string;
  notes?: string;
}
