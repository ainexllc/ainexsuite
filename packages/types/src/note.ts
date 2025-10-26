import type { BaseDocument, NoteColor, NotePattern } from './common';

export interface Note extends BaseDocument {
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
