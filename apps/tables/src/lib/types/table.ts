import type { Timestamp } from "firebase/firestore";
import type { SpreadsheetData } from "./spreadsheet";

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

export type TableSpaceDoc = {
  name: string;
  type: SpaceType;
  members: SpaceMember[];
  memberUids: string[];
  createdAt: Timestamp;
  createdBy: string;
};

export type TableSpace = Omit<TableSpaceDoc, "createdAt"> & {
  id: string;
  createdAt: Date;
};

export type TableSpaceDraft = {
  name?: string;
  type?: SpaceType;
};

// ============ Table Types ============
export type TableType = "text" | "checklist" | "spreadsheet";

export type TableColor =
  | "default"
  | "table-white"
  | "table-lemon"
  | "table-peach"
  | "table-tangerine"
  | "table-mint"
  | "table-fog"
  | "table-lavender"
  | "table-blush"
  | "table-sky"
  | "table-moss"
  | "table-coal";

export type TablePattern =
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

export type TablePriority = "high" | "medium" | "low" | null;

export type ChecklistItem = {
  id: string;
  text: string;
  completed: boolean;
  indent?: number; // 0-3 levels of indentation (default 0)
};

export type TableAttachment = {
  id: string;
  name: string;
  downloadURL: string;
  storagePath: string;
  contentType: string;
  size: number;
};

export type CollaboratorRole = "viewer" | "editor";

export type TableCollaboratorDoc = {
  email: string;
  role: CollaboratorRole;
  invitedAt: Timestamp;
  userId: string;
};

export type TableCollaborator = {
  email: string;
  role: CollaboratorRole;
  invitedAt: Date;
  userId: string;
};

export type TableDoc = {
  ownerId: string;
  spaceId?: string; // Optional - null/undefined means personal default space
  title: string;
  body: string;
  type: TableType;
  checklist: ChecklistItem[];
  spreadsheet?: SpreadsheetData; // Spreadsheet data for "spreadsheet" type tables
  color: TableColor;
  pattern?: TablePattern;
  backgroundImage?: string | null; // ID of a predefined background image
  backgroundOverlay?: BackgroundOverlay; // Overlay style for background images
  coverImage?: string | null; // ID of a cover image from covers collection
  pinned: boolean;
  priority?: TablePriority;
  archived: boolean;
  labelIds: string[];
  reminderAt?: Timestamp | null;
  reminderId?: string | null;
  tableDate?: Timestamp | null; // Associated date for the table (not a reminder)
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deletedAt?: Timestamp | null;
  attachments: TableAttachment[];
  sharedWith: TableCollaboratorDoc[];
  sharedWithUserIds: string[];
  width?: number;
  height?: number;
};

export type Table = Omit<TableDoc, "createdAt" | "updatedAt" | "reminderAt" | "tableDate" | "sharedWith" | "deletedAt"> & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  reminderAt?: Date | null;
  reminderId?: string | null;
  tableDate?: Date | null;
  deletedAt?: Date | null;
  sharedWith: TableCollaborator[];
  priority?: TablePriority;
};

export type TableDraft = {
  title?: string;
  body?: string;
  spaceId?: string;
  type?: TableType;
  checklist?: ChecklistItem[];
  spreadsheet?: SpreadsheetData;
  color?: TableColor;
  pattern?: TablePattern;
  backgroundImage?: string | null;
  backgroundOverlay?: BackgroundOverlay;
  coverImage?: string | null;
  reminderAt?: Date | null;
  reminderId?: string | null;
  tableDate?: Date | null;
  labelIds?: string[];
  attachments?: TableAttachment[];
  sharedWith?: TableCollaborator[];
  sharedWithUserIds?: string[];
  deletedAt?: Date | null;
  width?: number;
  height?: number;
  pinned?: boolean;
  priority?: TablePriority;
  archived?: boolean;
};

export type LabelDoc = {
  ownerId: string;
  name: string;
  color: TableColor;
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
  color?: TableColor;
  parentId?: string | null;
};
