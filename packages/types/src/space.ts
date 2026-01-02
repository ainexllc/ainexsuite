export type SpaceRole = 'admin' | 'member' | 'viewer';
export type SpaceType = 'personal' | 'family' | 'work' | 'couple' | 'buddy' | 'squad' | 'project';
export type SpaceColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink' | 'gray' | 'default';
export type SpaceIcon = 'user' | 'users' | 'home' | 'briefcase' | 'heart' | 'star' | 'folder' | 'sparkles' | 'globe';
export type InviteStatus = 'pending' | 'accepted' | 'declined' | 'expired';

/** Member limits per space type (null = unlimited) */
export const SPACE_MEMBER_LIMITS: Record<SpaceType, number | null> = {
  personal: 1,
  couple: 2,
  family: null,
  work: null,
  buddy: 2,
  squad: null,
  project: null,
};

/** Space types that support child members (no signup required) */
export const CHILD_MEMBER_SPACE_TYPES: SpaceType[] = ['family'];

export interface SpaceMember {
  uid: string;
  displayName?: string;
  photoURL?: string;
  email?: string;
  role: SpaceRole;
  joinedAt: number;
  addedBy?: string;
  isChild?: false;
}

/** Child member for family spaces (no uid/email required) */
export interface ChildMember {
  id: string;
  displayName: string;
  photoURL?: string;
  birthDate?: string;
  relationship?: string;
  role: 'viewer';
  joinedAt: number;
  addedBy: string;
  isChild: true;
}

/** Union type for all member types */
export type AnySpaceMember = SpaceMember | ChildMember;

/** @deprecated Use SpaceInvitation instead */
export interface PendingInvite {
  id: string;
  email: string;
  role: SpaceRole;
  invitedBy: string;
  invitedAt: number;
}

/** Space invitation stored in spaceInvitations collection */
export interface SpaceInvitation {
  id: string;
  spaceId: string;
  spaceName: string;
  spaceType: SpaceType;
  email: string;
  role: SpaceRole;
  invitedBy: string;
  invitedByName?: string;
  invitedByPhoto?: string;
  invitedAt: number;
  expiresAt: number;
  token: string;
  status: InviteStatus;
  inviteeUid?: string;
  respondedAt?: number;
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

  // Public/Joinable - allows users to browse and request to join
  isPublic?: boolean; // true = appears in public spaces list for users to join

  // Access Control
  ownerId: string;
  members: SpaceMember[];
  memberUids: string[]; // Helper array for Firestore array-contains queries
  childMembers?: ChildMember[]; // Family spaces only - members without accounts
  pendingInvites?: PendingInvite[]; // @deprecated - use spaceInvitations collection
  pendingInviteCount?: number; // Denormalized count for UI
  accessCode?: string; // 4-digit PIN for quick access

  // App-specific settings (can be extended)
  settings?: Record<string, unknown>;

  // Metadata
  createdAt: number;
  updatedAt: number;
}
