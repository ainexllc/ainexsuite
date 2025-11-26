export type SpaceRole = 'admin' | 'member' | 'viewer';
export type SpaceType = 'personal' | 'family' | 'work' | 'couple' | 'buddy' | 'squad' | 'project';

export interface SpaceMember {
  uid: string;
  role: SpaceRole;
  joinedAt: number;
  addedBy?: string;
}

export interface Space {
  id: string;
  name: string;
  type: SpaceType;
  description?: string;
  avatarUrl?: string;
  coverUrl?: string;
  
  // Access Control
  ownerId: string;
  members: SpaceMember[];
  memberUids: string[]; // Helper array for Firestore array-contains queries
  accessCode?: string; // 4-digit PIN for quick access
  
  // App-specific settings (can be extended)
  settings?: Record<string, unknown>;
  
  // Metadata
  createdAt: number;
  updatedAt: number;
}
