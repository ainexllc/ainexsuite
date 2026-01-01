import type { SpaceType } from '@ainexsuite/types';

/**
 * Base space structure common to all apps
 */
export interface BaseSpace {
  id: string;
  name: string;
  type: SpaceType;
  members: SpaceMember[];
  memberUids: string[];
  createdAt: Date;
  createdBy: string;
}

/**
 * Space member with role and metadata
 */
export interface SpaceMember {
  uid: string;
  displayName: string;
  photoURL?: string;
  role: SpaceMemberRole;
  joinedAt: string;
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
  members: SpaceMember[];
  memberUids: string[];
  createdAt: { toDate: () => Date } | null;
  createdBy: string;
  // Cross-app visibility fields
  isGlobal?: boolean;
  hiddenInApps?: string[];
}

/**
 * Space draft for updates (partial space without id and timestamps)
 */
export type SpaceDraft = Partial<Omit<BaseSpace, 'id' | 'createdAt' | 'createdBy'>>;

/**
 * Context value provided by SpacesProvider
 */
export interface SpacesContextValue<TSpace extends BaseSpace = BaseSpace> {
  /** All spaces including virtual personal space */
  spaces: TSpace[];
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
