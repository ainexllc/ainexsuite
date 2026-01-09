import type { BaseDocument, NoteColor, NotePattern } from './common';

export interface Note extends BaseDocument {
  // Required - 'personal' for personal content, or actual space ID
  spaceId: string;
  title: string;
  body: string;
  color: NoteColor;
  pattern: NotePattern;
  labels: string[];
  pinned: boolean;
  archived: boolean;
  deleted: boolean;
}

export type CreateNoteInput = Omit<Note, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateNoteInput = Partial<Omit<Note, 'id' | 'ownerId' | 'createdAt'>>;

export interface NoteLabel {
  id: string;
  ownerId: string;
  name: string;
  color: string;
  noteCount: number;
  createdAt: number;
}
