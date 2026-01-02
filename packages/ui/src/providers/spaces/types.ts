import type { SpaceType } from '@ainexsuite/types';

/**
 * Base space structure common to all apps
 * Uses loose typing for members to allow app-specific member types
 */
export interface BaseSpace {
  id: string;
  name: string;
  type: SpaceType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  members: any[]; // Loose typing to allow app-specific member types
  memberUids: string[];
  createdAt: Date | number | string;
  ownerId?: string; // Owner user ID
  createdBy?: string; // Legacy: some apps use createdBy instead of ownerId
  // Cross-app visibility
  isGlobal?: boolean;
  hiddenInApps?: string[];
}

/**
 * Space member with role and metadata
 */
export interface SpaceMember {
  uid: string;
  displayName?: string;
  photoURL?: string;
  email?: string;
  role: SpaceMemberRole;
  joinedAt: string | number;
  addedBy?: string;
}

export type SpaceMemberRole = 'admin' | 'member' | 'viewer';

/**
 * Configuration for the shared SpacesProvider factory
 */
export interface SpacesProviderConfig<TSpace extends BaseSpace = BaseSpace> {
  /**
   * Unique identifier for this app (used for per-app visibility filtering)
   * @example 'notes', 'journal', 'todo', 'fit'
   */
  appId: string;

  /**
   * Firestore collection name for spaces (use 'spaces' for unified collection)
   * @example 'spaces' (unified) or 'noteSpaces' (legacy)
   */
  collectionName: string;

  /**
   * localStorage key for persisting current space selection
   * @example 'notes-current-space', 'journey-current-space'
   */
  storageKey: string;

  /**
   * Configuration for the default personal space (virtual, not stored in Firestore)
   */
  defaultSpace: {
    /** Display name for personal space */
    name: string;
    /** Space type (usually 'personal') */
    type: SpaceType;
  };

  /**
   * Allowed space types for this app
   * @example ['personal', 'family', 'work'] or ['personal', 'family', 'couple']
   */
  allowedTypes: SpaceType[];

  /**
   * Optional: Transform Firestore document data into app-specific space type
   */
  transformSpace?: (id: string, data: SpaceDocData) => TSpace;

  /**
   * Optional: Custom validation before creating a space
   */
  validateSpace?: (input: { name: string; type: SpaceType }) => boolean;
}

/**
 * Raw Firestore document data structure
 */
export interface SpaceDocData {
  name: string;
  type: SpaceType;
  description?: string;
  members: SpaceMember[];
  memberUids: string[];
  createdAt: { toDate: () => Date } | number | null;
  ownerId?: string;
  createdBy?: string; // Legacy field, some spaces use this instead of ownerId
  // Cross-app visibility fields
  isGlobal?: boolean;
  hiddenInApps?: string[];
  // Public/Joinable spaces
  isPublic?: boolean;
}

/**
 * Space draft for updates (partial space without id and timestamps)
 * Includes Record<string, unknown> to allow app-specific fields
 */
export type SpaceDraft = Partial<Omit<BaseSpace, 'id' | 'createdAt' | 'ownerId'>> & Record<string, unknown>;

/**
 * Context value provided by SpacesProvider
 */
export interface SpacesContextValue<TSpace extends BaseSpace = BaseSpace> {
  /** Visible spaces for this app (filtered by hiddenInApps) including virtual personal space */
  spaces: TSpace[];
  /** All user spaces without filtering (for settings/management) including virtual personal space */
  allSpaces: TSpace[];
  /** Currently selected space */
  currentSpace: TSpace;
  /** ID of currently selected space */
  currentSpaceId: string;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Change current space selection */
  setCurrentSpace: (spaceId: string) => void;
  /** Create a new space */
  createSpace: (input: { name: string; type: SpaceType }) => Promise<string>;
  /** Update an existing space */
  updateSpace: (spaceId: string, updates: SpaceDraft) => Promise<void>;
  /** Delete a space */
  deleteSpace: (spaceId: string) => Promise<void>;
  /** Force refresh spaces from Firestore */
  refreshSpaces: () => void;
}
