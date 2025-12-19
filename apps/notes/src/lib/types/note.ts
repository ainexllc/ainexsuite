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

export type NoteSpaceDoc = {
  name: string;
  type: SpaceType;
  members: SpaceMember[];
  memberUids: string[];
  createdAt: Timestamp;
  createdBy: string;
};

export type NoteSpace = Omit<NoteSpaceDoc, "createdAt"> & {
  id: string;
  createdAt: Date;
};

export type NoteSpaceDraft = {
  name?: string;
  type?: SpaceType;
};

// ============ Note Types ============
export type NoteType = "text" | "checklist";

export type NoteColor =
  | "default"
  | "note-white"
  | "note-lemon"
  | "note-peach"
  | "note-tangerine"
  | "note-mint"
  | "note-fog"
  | "note-lavender"
  | "note-blush"
  | "note-sky"
  | "note-moss"
  | "note-coal";

export type NotePattern =
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

export type NotePriority = "high" | "medium" | "low" | null;

export type ChecklistItem = {
  id: string;
  text: string;
  completed: boolean;
};

export type NoteAttachment = {
  id: string;
  name: string;
  downloadURL: string;
  storagePath: string;
  contentType: string;
  size: number;
};

export type CollaboratorRole = "viewer" | "editor";

export type NoteCollaboratorDoc = {
  email: string;
  role: CollaboratorRole;
  invitedAt: Timestamp;
  userId: string;
};

export type NoteCollaborator = {
  email: string;
  role: CollaboratorRole;
  invitedAt: Date;
  userId: string;
};

export type NoteDoc = {
  ownerId: string;
  spaceId?: string; // Optional - null/undefined means personal default space
  title: string;
  body: string;
  type: NoteType;
  checklist: ChecklistItem[];
  color: NoteColor;
  pattern?: NotePattern;
  backgroundImage?: string | null; // ID of a predefined background image
  backgroundOverlay?: BackgroundOverlay; // Overlay style for background images
  pinned: boolean;
  priority?: NotePriority;
  archived: boolean;
  labelIds: string[];
  reminderAt?: Timestamp | null;
  reminderId?: string | null;
  noteDate?: Timestamp | null; // Associated date for the note (not a reminder)
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deletedAt?: Timestamp | null;
  attachments: NoteAttachment[];
  sharedWith: NoteCollaboratorDoc[];
  sharedWithUserIds: string[];
  width?: number;
  height?: number;
};

export type Note = Omit<NoteDoc, "createdAt" | "updatedAt" | "reminderAt" | "noteDate" | "sharedWith" | "deletedAt"> & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  reminderAt?: Date | null;
  reminderId?: string | null;
  noteDate?: Date | null;
  deletedAt?: Date | null;
  sharedWith: NoteCollaborator[];
  priority?: NotePriority;
};

export type NoteDraft = {
  title?: string;
  body?: string;
  spaceId?: string;
  checklist?: ChecklistItem[];
  color?: NoteColor;
  pattern?: NotePattern;
  backgroundImage?: string | null;
  backgroundOverlay?: BackgroundOverlay;
  reminderAt?: Date | null;
  reminderId?: string | null;
  noteDate?: Date | null;
  labelIds?: string[];
  attachments?: NoteAttachment[];
  sharedWith?: NoteCollaborator[];
  sharedWithUserIds?: string[];
  deletedAt?: Date | null;
  width?: number;
  height?: number;
  pinned?: boolean;
  priority?: NotePriority;
  archived?: boolean;
};

export type LabelDoc = {
  ownerId: string;
  name: string;
  color: NoteColor;
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
  color?: NoteColor;
  parentId?: string | null;
};
