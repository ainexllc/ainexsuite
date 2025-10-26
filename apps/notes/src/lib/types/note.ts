import type { Timestamp } from "firebase/firestore";
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
  title: string;
  body: string;
  type: NoteType;
  checklist: ChecklistItem[];
  color: NoteColor;
  pattern?: NotePattern;
  pinned: boolean;
  archived: boolean;
  labelIds: string[];
  reminderAt?: Timestamp | null;
  reminderId?: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deletedAt?: Timestamp | null;
  attachments: NoteAttachment[];
  sharedWith: NoteCollaboratorDoc[];
  sharedWithUserIds: string[];
};

export type Note = Omit<NoteDoc, "createdAt" | "updatedAt" | "reminderAt" | "sharedWith"> & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  reminderAt?: Date | null;
  reminderId?: string | null;
  deletedAt?: Date | null;
  sharedWith: NoteCollaborator[];
};

export type NoteDraft = {
  title?: string;
  body?: string;
  checklist?: ChecklistItem[];
  color?: NoteColor;
  pattern?: NotePattern;
  reminderAt?: Date | null;
  reminderId?: string | null;
  labelIds?: string[];
  attachments?: NoteAttachment[];
  sharedWith?: NoteCollaborator[];
  sharedWithUserIds?: string[];
  deletedAt?: Date | null;
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
