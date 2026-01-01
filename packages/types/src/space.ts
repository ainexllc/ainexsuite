export type SpaceRole = 'admin' | 'member' | 'viewer';
export type SpaceType = 'personal' | 'family' | 'work' | 'couple' | 'buddy' | 'squad' | 'project';
export type SpaceColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink' | 'gray' | 'default';
export type SpaceIcon = 'user' | 'users' | 'home' | 'briefcase' | 'heart' | 'star' | 'folder' | 'sparkles' | 'globe';

export interface SpaceMember {
  uid: string;
  displayName?: string;
  photoURL?: string;
  email?: string;
  role: SpaceRole;
  joinedAt: number;
  addedBy?: string;
}

export interface PendingInvite {
  id: string;
  email: string;
  role: SpaceRole;
  invitedBy: string;
  invitedAt: number;
}

export interface Space {
  id: string;
  name: string;
  type: SpaceType;
  description?: string;
  avatarUrl?: string;
  coverUrl?: string;

  // Customization
  color?: SpaceColor;
  icon?: SpaceIcon;

  // Cross-app visibility
  isGlobal?: boolean; // true = visible in all apps, ignores hiddenInApps
  hiddenInApps?: string[]; // Array of app IDs where this space is hidden (e.g., ['notes', 'fit'])

  // Access Control
  ownerId: string;
  members: SpaceMember[];
  memberUids: string[]; // Helper array for Firestore array-contains queries
  pendingInvites?: PendingInvite[];
  accessCode?: string; // 4-digit PIN for quick access

  // App-specific settings (can be extended)
  settings?: Record<string, unknown>;

  // Metadata
  createdAt: number;
  updatedAt: number;
}
