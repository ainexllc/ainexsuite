import type { Timestamp } from "firebase/firestore";

// ============ Space Types ============
export type SpaceType = "personal" | "family" | "work";

export type SpaceMemberRole = "admin" | "member" | "viewer";

export type SpaceMember = {
  uid: string;
  displayName: string;
  photoURL?: string;
  role: SpaceMemberRole;
  joinedAt: string;
};

export type DocSpaceDoc = {
  name: string;
  type: SpaceType;
  members: SpaceMember[];
  memberUids: string[];
  createdAt: Timestamp;
  createdBy: string;
};

export type DocSpace = Omit<DocSpaceDoc, "createdAt"> & {
  id: string;
  createdAt: Date;
};

export type DocSpaceDraft = {
  name?: string;
  type?: SpaceType;
};

// ============ Doc Types ============
export type DocType = "text" | "checklist";

export type DocColor =
  | "default"
  | "doc-white"
  | "doc-lemon"
  | "doc-peach"
  | "doc-tangerine"
  | "doc-mint"
  | "doc-fog"
  | "doc-lavender"
  | "doc-blush"
  | "doc-sky"
  | "doc-moss"
  | "doc-coal";

export type DocPattern =
  | "none"
  | "dots"
  | "grid"
  | "diagonal"
  | "waves"
  | "circles";

export type BackgroundOverlay =
  | "none"      // No overlay
  | "auto"      // Adaptive based on brightness
  | "dim"       // Light dark overlay
  | "dimmer"    // Medium dark overlay
  | "dimmest"   // Heavy dark overlay
  | "glass"     // Frosted glass effect
  | "frost"     // Heavy frosted glass
  | "gradient"; // Dark gradient from bottom

export type DocPriority = "high" | "medium" | "low" | null;

export type ChecklistItem = {
  id: string;
  text: string;
  completed: boolean;
  indent?: number; // 0-3 levels of indentation (default 0)
};

export type DocAttachment = {
  id: string;
  name: string;
  downloadURL: string;
  storagePath: string;
  contentType: string;
  size: number;
};

export type CollaboratorRole = "viewer" | "editor";

export type DocCollaboratorDoc = {
  email: string;
  role: CollaboratorRole;
  invitedAt: Timestamp;
  userId: string;
};

export type DocCollaborator = {
  email: string;
  role: CollaboratorRole;
  invitedAt: Date;
  userId: string;
};

export type DocDoc = {
  ownerId: string;
  spaceId?: string; // Optional - null/undefined means personal default space
  title: string;
  body: string;
  type: DocType;
  checklist: ChecklistItem[];
  color: DocColor;
  pattern?: DocPattern;
  backgroundImage?: string | null; // ID of a predefined background image
  backgroundOverlay?: BackgroundOverlay; // Overlay style for background images
  coverImage?: string | null; // ID of a cover image from covers collection
  pinned: boolean;
  priority?: DocPriority;
  archived: boolean;
  labelIds: string[];
  reminderAt?: Timestamp | null;
  reminderId?: string | null;
  docDate?: Timestamp | null; // Associated date for the doc (not a reminder)
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deletedAt?: Timestamp | null;
  attachments: DocAttachment[];
  sharedWith: DocCollaboratorDoc[];
  sharedWithUserIds: string[];
  width?: number;
  height?: number;
};

export type Doc = Omit<DocDoc, "createdAt" | "updatedAt" | "reminderAt" | "docDate" | "sharedWith" | "deletedAt"> & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  reminderAt?: Date | null;
  reminderId?: string | null;
  docDate?: Date | null;
  deletedAt?: Date | null;
  sharedWith: DocCollaborator[];
  priority?: DocPriority;
};

export type DocDraft = {
  title?: string;
  body?: string;
  spaceId?: string;
  checklist?: ChecklistItem[];
  color?: DocColor;
  pattern?: DocPattern;
  backgroundImage?: string | null;
  backgroundOverlay?: BackgroundOverlay;
  coverImage?: string | null;
  reminderAt?: Date | null;
  reminderId?: string | null;
  docDate?: Date | null;
  labelIds?: string[];
  attachments?: DocAttachment[];
  sharedWith?: DocCollaborator[];
  sharedWithUserIds?: string[];
  deletedAt?: Date | null;
  width?: number;
  height?: number;
  pinned?: boolean;
  priority?: DocPriority;
  archived?: boolean;
};

export type LabelDoc = {
  ownerId: string;
  name: string;
  color: DocColor;
  parentId?: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type Label = Omit<LabelDoc, "createdAt" | "updatedAt"> & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

export type LabelDraft = {
  name?: string;
  color?: DocColor;
  parentId?: string | null;
};
