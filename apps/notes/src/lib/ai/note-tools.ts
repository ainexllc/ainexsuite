/**
 * Tool definitions for AI note actions
 * Used with Gemini function calling
 */

import { SchemaType, type FunctionDeclaration } from '@google/generative-ai';

/**
 * Tool definitions for Gemini function calling
 */
export const NOTE_TOOLS: FunctionDeclaration[] = [
  {
    name: 'create_note',
    description: 'Create a new note with the specified title and content. Use this when the user asks to create, make, or add a new note.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        title: {
          type: SchemaType.STRING,
          description: 'The title of the note. Keep it concise and descriptive.',
        },
        body: {
          type: SchemaType.STRING,
          description: 'The content/body of the note. Can include formatted text.',
        },
        color: {
          type: SchemaType.STRING,
          enum: ['default', 'note-white', 'note-cream', 'note-yellow', 'note-orange', 'note-red', 'note-pink', 'note-purple', 'note-blue', 'note-cyan', 'note-teal', 'note-green', 'note-gray'],
          description: 'The background color of the note. Optional, defaults to "default".',
        },
        pinned: {
          type: SchemaType.BOOLEAN,
          description: 'Whether to pin the note. Optional, defaults to false.',
        },
        type: {
          type: SchemaType.STRING,
          enum: ['text', 'checklist'],
          description: 'The type of note. Use "checklist" for task lists. Defaults to "text".',
        },
      },
      required: ['title', 'body'],
    },
  },
  {
    name: 'update_note',
    description: 'Update an existing note. Use this when the user asks to edit, modify, change, or update a note. You must specify the note ID.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        noteId: {
          type: SchemaType.STRING,
          description: 'The ID of the note to update. Get this from the notes context.',
        },
        title: {
          type: SchemaType.STRING,
          description: 'New title for the note. Optional - only include if changing.',
        },
        body: {
          type: SchemaType.STRING,
          description: 'New content for the note. Optional - only include if changing.',
        },
        color: {
          type: SchemaType.STRING,
          enum: ['default', 'note-white', 'note-cream', 'note-yellow', 'note-orange', 'note-red', 'note-pink', 'note-purple', 'note-blue', 'note-cyan', 'note-teal', 'note-green', 'note-gray'],
          description: 'New background color. Optional.',
        },
        pinned: {
          type: SchemaType.BOOLEAN,
          description: 'Set pinned status. Optional.',
        },
        archived: {
          type: SchemaType.BOOLEAN,
          description: 'Set archived status. Optional.',
        },
      },
      required: ['noteId'],
    },
  },
  {
    name: 'delete_note',
    description: 'Delete a note (moves to trash). Use this when the user asks to delete, remove, or trash a note. The note can be restored from trash.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        noteId: {
          type: SchemaType.STRING,
          description: 'The ID of the note to delete. Get this from the notes context.',
        },
      },
      required: ['noteId'],
    },
  },
  {
    name: 'toggle_pin',
    description: 'Pin or unpin a note. Pinned notes appear at the top.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        noteId: {
          type: SchemaType.STRING,
          description: 'The ID of the note to pin/unpin.',
        },
        pinned: {
          type: SchemaType.BOOLEAN,
          description: 'True to pin, false to unpin.',
        },
      },
      required: ['noteId', 'pinned'],
    },
  },
  {
    name: 'toggle_archive',
    description: 'Archive or unarchive a note. Archived notes are hidden from the main view.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        noteId: {
          type: SchemaType.STRING,
          description: 'The ID of the note to archive/unarchive.',
        },
        archived: {
          type: SchemaType.BOOLEAN,
          description: 'True to archive, false to unarchive.',
        },
      },
      required: ['noteId', 'archived'],
    },
  },
];

/**
 * Tool call result type
 */
export interface ToolCallResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

/**
 * Type for tool call parameters
 */
export interface CreateNoteParams {
  title: string;
  body: string;
  color?: string;
  pinned?: boolean;
  type?: 'text' | 'checklist';
  items?: string[];
}

export interface UpdateNoteParams {
  noteId: string;
  title?: string;
  body?: string;
  color?: string;
  pinned?: boolean;
  archived?: boolean;
  items?: string[];
}

export interface DeleteNoteParams {
  noteId: string;
}

export interface TogglePinParams {
  noteId: string;
  pinned: boolean;
}

export interface ToggleArchiveParams {
  noteId: string;
  archived: boolean;
}

export interface MoveNoteParams {
  noteId: string;
  targetSpaceId: string;
}

export interface ChangeNoteColorParams {
  noteId: string;
  color: string;
}

export interface DuplicateNoteParams {
  noteId: string;
  targetSpaceId?: string;
}

export interface ChangeNotePriorityParams {
  noteId: string;
  priority: 'high' | 'medium' | 'low' | 'none';
}

export interface ManageNoteLabelsParams {
  noteId: string;
  labelIds?: string[];
  labelNames: string[];
  action: 'add' | 'remove' | 'set';
}

export interface GetNoteContentParams {
  noteId: string;
}

export interface SearchNotesSemanticParams {
  query: string;
  limit?: number;
}

export type ToolCallParams =
  | { name: 'create_note'; args: CreateNoteParams }
  | { name: 'update_note'; args: UpdateNoteParams }
  | { name: 'delete_note'; args: DeleteNoteParams }
  | { name: 'toggle_pin'; args: TogglePinParams }
  | { name: 'toggle_archive'; args: ToggleArchiveParams };
