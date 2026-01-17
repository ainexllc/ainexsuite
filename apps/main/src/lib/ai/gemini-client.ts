import {
  GoogleGenerativeAI,
  SchemaType,
  type FunctionDeclaration,
  type FunctionDeclarationSchemaProperty,
} from '@google/generative-ai';

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  console.warn('NEXT_PUBLIC_GEMINI_API_KEY not set');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Helper for empty properties
const EMPTY_PROPERTIES: { [k: string]: FunctionDeclarationSchemaProperty } = {};

// ============================================
// COLOR AND PRIORITY ENUMS
// ============================================

const NOTE_COLORS = [
  'default',
  'white',
  'lemon',
  'peach',
  'tangerine',
  'mint',
  'fog',
  'lavender',
  'blush',
  'sky',
  'moss',
  'coal',
];

const NOTE_PRIORITIES = ['high', 'medium', 'low'];

// ============================================
// TOOL DEFINITIONS
// ============================================

export const notesTools: FunctionDeclaration[] = [
  // ---- SPACES ----
  {
    name: 'listSpaces',
    description:
      'List all spaces the user belongs to. Spaces are like workspaces (personal, family, work, etc.) that organize notes. Use this when the user asks "what spaces do I have", "show my spaces", or "which workspaces am I in".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: EMPTY_PROPERTIES,
    },
  },
  {
    name: 'getCurrentSpace',
    description:
      'Get the current active space. Use this when the user asks "what space am I in" or "which space is active".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: EMPTY_PROPERTIES,
    },
  },

  // ---- CREATE NOTE ----
  {
    name: 'createNote',
    description:
      'Create a new note. Use this when the user wants to create, add, or make a new note. Can create in specific spaces and with various options like color, priority, and pinning.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        title: {
          type: SchemaType.STRING,
          description: 'The title of the note',
        },
        body: {
          type: SchemaType.STRING,
          description: 'The content/body of the note in plain text',
        },
        type: {
          type: SchemaType.STRING,
          enum: ['text', 'checklist'],
          description: 'Type of note: "text" for regular notes, "checklist" for todo lists',
        },
        checklistItems: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: 'Array of checklist item texts (only if type is checklist)',
        },
        color: {
          type: SchemaType.STRING,
          enum: NOTE_COLORS,
          description:
            'Note color: default, white, lemon (yellow), peach, tangerine (orange), mint (green), fog (gray), lavender (purple), blush (pink), sky (blue), moss (dark green), coal (dark)',
        },
        spaceId: {
          type: SchemaType.STRING,
          description:
            'Space ID to create the note in. Use "personal" for personal space or a specific space ID.',
        },
        pinned: {
          type: SchemaType.BOOLEAN,
          description: 'Whether to pin this note to favorites immediately',
        },
        priority: {
          type: SchemaType.STRING,
          enum: NOTE_PRIORITIES,
          description: 'Note priority: high, medium, or low',
        },
      },
      required: ['title'],
    },
  },

  // ---- SEARCH & LIST ----
  {
    name: 'searchNotes',
    description:
      'Search for notes by query in title, body, or checklist items. Use this when the user wants to find specific notes by content.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        query: {
          type: SchemaType.STRING,
          description: 'The search query to find notes',
        },
        spaceId: {
          type: SchemaType.STRING,
          description: 'Optional space ID to limit search to a specific space',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'listNotes',
    description:
      'List recent notes. Use this when the user wants to see their notes, asks "what notes do I have", or "show my notes".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        limit: {
          type: SchemaType.NUMBER,
          description: 'Maximum number of notes to return (default 10)',
        },
        spaceId: {
          type: SchemaType.STRING,
          description: 'Optional space ID to list notes from a specific space only',
        },
      },
    },
  },
  {
    name: 'advancedSearch',
    description:
      'Advanced search with multiple filters. Use when user wants to filter notes by color, type, labels, priority, or combine multiple criteria.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        query: {
          type: SchemaType.STRING,
          description: 'Text search query',
        },
        spaceId: {
          type: SchemaType.STRING,
          description: 'Filter by space ID',
        },
        color: {
          type: SchemaType.STRING,
          enum: NOTE_COLORS,
          description: 'Filter by note color',
        },
        type: {
          type: SchemaType.STRING,
          enum: ['text', 'checklist'],
          description: 'Filter by note type',
        },
        pinned: {
          type: SchemaType.BOOLEAN,
          description: 'Filter by pinned status',
        },
        priority: {
          type: SchemaType.STRING,
          enum: NOTE_PRIORITIES,
          description: 'Filter by priority',
        },
      },
    },
  },

  // ---- UPDATE NOTE ----
  {
    name: 'updateNote',
    description:
      'Update an existing note. Can change title, body, color, priority, etc. Use this when user wants to edit, modify, or change a note.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        noteId: {
          type: SchemaType.STRING,
          description: 'The ID of the note to update (if known)',
        },
        title: {
          type: SchemaType.STRING,
          description: 'The title of the note to find (if ID not known)',
        },
        newTitle: {
          type: SchemaType.STRING,
          description: 'New title for the note',
        },
        newBody: {
          type: SchemaType.STRING,
          description: 'New body/content for the note',
        },
        color: {
          type: SchemaType.STRING,
          enum: NOTE_COLORS,
          description: 'New color for the note',
        },
        priority: {
          type: SchemaType.STRING,
          enum: NOTE_PRIORITIES,
          description: 'New priority for the note',
        },
      },
    },
  },
  {
    name: 'changeNoteColor',
    description:
      'Change the color of a note. Use when user says "make note X blue/yellow/etc" or "change color of note".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        noteId: {
          type: SchemaType.STRING,
          description: 'The ID of the note',
        },
        title: {
          type: SchemaType.STRING,
          description: 'The title of the note to find',
        },
        color: {
          type: SchemaType.STRING,
          enum: NOTE_COLORS,
          description: 'The new color for the note',
        },
      },
      required: ['color'],
    },
  },
  {
    name: 'setNotePriority',
    description: 'Set the priority of a note (high, medium, low). Use when user wants to prioritize a note.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        noteId: {
          type: SchemaType.STRING,
          description: 'The ID of the note',
        },
        title: {
          type: SchemaType.STRING,
          description: 'The title of the note to find',
        },
        priority: {
          type: SchemaType.STRING,
          enum: NOTE_PRIORITIES,
          description: 'The priority level',
        },
      },
      required: ['priority'],
    },
  },

  // ---- DELETE ----
  {
    name: 'deleteNote',
    description:
      'Delete a note (moves to trash). Use this when the user wants to remove, delete, or trash a note.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        title: {
          type: SchemaType.STRING,
          description: 'The title of the note to delete',
        },
        noteId: {
          type: SchemaType.STRING,
          description: 'The ID of the note to delete (if known)',
        },
      },
    },
  },

  // ---- FAVORITES / PINNING ----
  {
    name: 'pinNote',
    description:
      'Pin a note to favorites. Use when user says "pin this note", "add to favorites", "star this note", or "mark as favorite".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        noteId: {
          type: SchemaType.STRING,
          description: 'The ID of the note to pin',
        },
        title: {
          type: SchemaType.STRING,
          description: 'The title of the note to find and pin',
        },
      },
    },
  },
  {
    name: 'unpinNote',
    description:
      'Remove a note from favorites. Use when user says "unpin", "remove from favorites", "unstar".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        noteId: {
          type: SchemaType.STRING,
          description: 'The ID of the note to unpin',
        },
        title: {
          type: SchemaType.STRING,
          description: 'The title of the note to find and unpin',
        },
      },
    },
  },
  {
    name: 'listFavorites',
    description:
      'List all favorited/pinned notes. Use when user asks "show my favorites", "what are my pinned notes", "starred notes".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        spaceId: {
          type: SchemaType.STRING,
          description: 'Optional space ID to filter favorites by space',
        },
      },
    },
  },

  // ---- LABELS ----
  {
    name: 'listLabels',
    description:
      'List all available labels/tags. Use when user asks "what labels do I have", "show my tags".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: EMPTY_PROPERTIES,
    },
  },
  {
    name: 'addLabelToNote',
    description: 'Add a label/tag to a note. Use when user wants to tag or label a note.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        noteId: {
          type: SchemaType.STRING,
          description: 'The ID of the note',
        },
        title: {
          type: SchemaType.STRING,
          description: 'The title of the note to find',
        },
        labelId: {
          type: SchemaType.STRING,
          description: 'The ID of the label to add',
        },
        labelName: {
          type: SchemaType.STRING,
          description: 'The name of the label to find and add',
        },
      },
    },
  },
  {
    name: 'removeLabelFromNote',
    description: 'Remove a label/tag from a note.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        noteId: {
          type: SchemaType.STRING,
          description: 'The ID of the note',
        },
        title: {
          type: SchemaType.STRING,
          description: 'The title of the note to find',
        },
        labelId: {
          type: SchemaType.STRING,
          description: 'The ID of the label to remove',
        },
        labelName: {
          type: SchemaType.STRING,
          description: 'The name of the label to find and remove',
        },
      },
    },
  },
  {
    name: 'listNotesByLabel',
    description: 'List all notes with a specific label. Use when user asks "show notes with label X".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        labelId: {
          type: SchemaType.STRING,
          description: 'The ID of the label',
        },
        labelName: {
          type: SchemaType.STRING,
          description: 'The name of the label to find notes for',
        },
      },
    },
  },

  // ---- ARCHIVE ----
  {
    name: 'archiveNote',
    description:
      'Archive a note (hide from main view but keep it). Use when user says "archive this note".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        noteId: {
          type: SchemaType.STRING,
          description: 'The ID of the note to archive',
        },
        title: {
          type: SchemaType.STRING,
          description: 'The title of the note to find and archive',
        },
      },
    },
  },
  {
    name: 'unarchiveNote',
    description: 'Unarchive a note (restore to main view). Use when user says "unarchive note".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        noteId: {
          type: SchemaType.STRING,
          description: 'The ID of the note to unarchive',
        },
        title: {
          type: SchemaType.STRING,
          description: 'The title of the note to find and unarchive',
        },
      },
    },
  },
  {
    name: 'listArchivedNotes',
    description:
      'List all archived notes. Use when user asks "show archived notes", "what notes are archived".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        spaceId: {
          type: SchemaType.STRING,
          description: 'Optional space ID to filter archived notes',
        },
      },
    },
  },

  // ---- CHECKLIST OPERATIONS ----
  {
    name: 'toggleChecklistItem',
    description:
      'Toggle a checklist item complete/incomplete. Use when user says "check off item", "mark item as done", "complete task".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        noteId: {
          type: SchemaType.STRING,
          description: 'The ID of the checklist note',
        },
        noteTitle: {
          type: SchemaType.STRING,
          description: 'The title of the checklist note to find',
        },
        itemId: {
          type: SchemaType.STRING,
          description: 'The ID of the checklist item',
        },
        itemText: {
          type: SchemaType.STRING,
          description: 'The text of the checklist item to find and toggle',
        },
      },
    },
  },
  {
    name: 'addChecklistItem',
    description:
      'Add a new item to a checklist note. Use when user says "add item to checklist", "add task to list".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        noteId: {
          type: SchemaType.STRING,
          description: 'The ID of the checklist note',
        },
        noteTitle: {
          type: SchemaType.STRING,
          description: 'The title of the checklist note to find',
        },
        text: {
          type: SchemaType.STRING,
          description: 'The text of the new checklist item',
        },
        priority: {
          type: SchemaType.STRING,
          enum: NOTE_PRIORITIES,
          description: 'Priority for the new item',
        },
        dueDate: {
          type: SchemaType.STRING,
          description: 'Due date for the item in ISO format (YYYY-MM-DD)',
        },
      },
      required: ['text'],
    },
  },
  {
    name: 'updateChecklistItem',
    description: 'Update a checklist item (text, priority, due date).',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        noteId: {
          type: SchemaType.STRING,
          description: 'The ID of the checklist note',
        },
        noteTitle: {
          type: SchemaType.STRING,
          description: 'The title of the checklist note to find',
        },
        itemId: {
          type: SchemaType.STRING,
          description: 'The ID of the checklist item',
        },
        itemText: {
          type: SchemaType.STRING,
          description: 'The text of the checklist item to find',
        },
        newText: {
          type: SchemaType.STRING,
          description: 'New text for the item',
        },
        priority: {
          type: SchemaType.STRING,
          enum: NOTE_PRIORITIES,
          description: 'New priority for the item',
        },
        dueDate: {
          type: SchemaType.STRING,
          description: 'New due date in ISO format',
        },
      },
    },
  },
  {
    name: 'removeChecklistItem',
    description: 'Remove an item from a checklist.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        noteId: {
          type: SchemaType.STRING,
          description: 'The ID of the checklist note',
        },
        noteTitle: {
          type: SchemaType.STRING,
          description: 'The title of the checklist note to find',
        },
        itemId: {
          type: SchemaType.STRING,
          description: 'The ID of the checklist item to remove',
        },
        itemText: {
          type: SchemaType.STRING,
          description: 'The text of the checklist item to find and remove',
        },
      },
    },
  },
  {
    name: 'toggleAllChecklistItems',
    description:
      'Mark all items in a checklist as complete or incomplete. Use when user says "complete all items", "check all off", "uncheck all".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        noteId: {
          type: SchemaType.STRING,
          description: 'The ID of the checklist note',
        },
        noteTitle: {
          type: SchemaType.STRING,
          description: 'The title of the checklist note to find',
        },
        completed: {
          type: SchemaType.BOOLEAN,
          description: 'True to mark all complete, false to mark all incomplete',
        },
      },
      required: ['completed'],
    },
  },

  // ---- TRASH OPERATIONS ----
  {
    name: 'listTrashedNotes',
    description:
      'List notes in the trash. Use when user asks "show trash", "what notes are in trash", "deleted notes".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: EMPTY_PROPERTIES,
    },
  },
  {
    name: 'restoreFromTrash',
    description:
      'Restore a note from trash. Use when user says "restore note", "undelete", "recover note".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        noteId: {
          type: SchemaType.STRING,
          description: 'The ID of the note to restore',
        },
        title: {
          type: SchemaType.STRING,
          description: 'The title of the note to find and restore',
        },
      },
    },
  },
  {
    name: 'emptyTrash',
    description:
      'Permanently delete all notes in trash. Use when user says "empty trash", "permanently delete all trash".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: EMPTY_PROPERTIES,
    },
  },

  // ---- MOVE & DUPLICATE ----
  {
    name: 'moveNoteToSpace',
    description:
      'Move a note to a different space. Use when user says "move note to X space", "put note in workspace".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        noteId: {
          type: SchemaType.STRING,
          description: 'The ID of the note to move',
        },
        title: {
          type: SchemaType.STRING,
          description: 'The title of the note to find',
        },
        newSpaceId: {
          type: SchemaType.STRING,
          description: 'The ID of the destination space',
        },
        spaceName: {
          type: SchemaType.STRING,
          description: 'The name of the destination space to find',
        },
      },
    },
  },
  {
    name: 'duplicateNote',
    description: 'Create a copy of a note. Use when user says "duplicate note", "copy note", "clone".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        noteId: {
          type: SchemaType.STRING,
          description: 'The ID of the note to duplicate',
        },
        title: {
          type: SchemaType.STRING,
          description: 'The title of the note to find and duplicate',
        },
      },
    },
  },

  // ---- CONTEXT AWARENESS ----
  {
    name: 'getUserContext',
    description:
      'IMPORTANT: Call this FIRST before listing, searching, or creating notes when the user has not specified a space. Returns user context including all spaces they belong to, current active space, and note counts. Use this to determine if you need to ask the user which space they want.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: EMPTY_PROPERTIES,
    },
  },

  // ============================================
  // ANALYTICS & INSIGHTS (8 tools)
  // ============================================
  {
    name: 'getNoteStatistics',
    description:
      'Get statistics about notes: total count, types distribution, color usage, labels popularity, activity by time period. Use when user asks "how many notes do I have", "show my note stats", "note overview", "analytics".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        spaceId: {
          type: SchemaType.STRING,
          description: 'Filter by space ID',
        },
        period: {
          type: SchemaType.STRING,
          enum: ['day', 'week', 'month', 'quarter', 'year', 'all'],
          description: 'Time period for stats (default: all)',
        },
      },
    },
  },
  {
    name: 'getProductivityInsights',
    description:
      'Analyze productivity patterns: most productive days/times, completion rates for checklists, note creation trends. Use when user asks "when am I most productive", "show productivity patterns", "my writing habits".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        period: {
          type: SchemaType.STRING,
          enum: ['week', 'month', 'quarter'],
          description: 'Analysis period (default: month)',
        },
      },
    },
  },
  {
    name: 'getActivityTrends',
    description:
      'Show note activity trends over time: creation rate, update frequency, archive patterns. Use when user asks "show my activity", "how active have I been", "activity trends".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        period: {
          type: SchemaType.STRING,
          enum: ['week', 'month', 'quarter', 'year'],
          description: 'Time period for trends',
        },
        spaceId: {
          type: SchemaType.STRING,
          description: 'Filter by space ID',
        },
      },
    },
  },
  {
    name: 'getChecklistProgress',
    description:
      'Analyze checklist completion progress across all or specific checklists. Use when user asks "show my task progress", "how are my checklists doing", "task completion rate".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        noteId: {
          type: SchemaType.STRING,
          description: 'Specific checklist note ID',
        },
        noteTitle: {
          type: SchemaType.STRING,
          description: 'Specific checklist note title',
        },
        spaceId: {
          type: SchemaType.STRING,
          description: 'Filter by space ID',
        },
      },
    },
  },
  {
    name: 'getLabelAnalytics',
    description:
      'Analyze label usage patterns: most used labels, notes per label, label combinations. Use when user asks "which labels do I use most", "label statistics", "tag usage".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        spaceId: {
          type: SchemaType.STRING,
          description: 'Filter by space ID',
        },
      },
    },
  },
  {
    name: 'getSpaceComparison',
    description:
      'Compare activity and note counts across different spaces. Use when user asks "compare my spaces", "which space is most active", "space overview".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: EMPTY_PROPERTIES,
    },
  },
  {
    name: 'getWeeklyDigest',
    description:
      'Generate a weekly digest summarizing note activity, accomplishments, and suggestions. Use when user asks "weekly summary", "what did I do this week", "week in review".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        spaceId: {
          type: SchemaType.STRING,
          description: 'Filter by space ID',
        },
      },
    },
  },
  {
    name: 'getActivityHeatmap',
    description:
      'Get activity heatmap data showing when user is most active (by day and hour). Use when user asks "show my activity heatmap", "when do I use notes most", "peak activity times".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        period: {
          type: SchemaType.STRING,
          enum: ['month', 'quarter', 'year'],
          description: 'Time period for heatmap',
        },
      },
    },
  },

  // ============================================
  // CONTENT ANALYSIS (6 tools)
  // ============================================
  {
    name: 'analyzeNoteSentiment',
    description:
      'Analyze the emotional tone and sentiment of a note or all recent notes. Use when user asks "what is the mood of my notes", "analyze sentiment", "how do my notes feel".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        noteId: {
          type: SchemaType.STRING,
          description: 'Specific note ID to analyze',
        },
        noteTitle: {
          type: SchemaType.STRING,
          description: 'Specific note title to find and analyze',
        },
        analyzeRecent: {
          type: SchemaType.BOOLEAN,
          description: 'If true, analyze recent notes instead of specific one',
        },
        limit: {
          type: SchemaType.NUMBER,
          description: 'Number of recent notes to analyze (default: 10)',
        },
      },
    },
  },
  {
    name: 'extractThemes',
    description:
      'Extract common themes and topics from notes. Use when user asks "what topics do I write about", "find themes in my notes", "common topics".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        spaceId: {
          type: SchemaType.STRING,
          description: 'Filter by space ID',
        },
        limit: {
          type: SchemaType.NUMBER,
          description: 'Number of notes to analyze (default: 20)',
        },
      },
    },
  },
  {
    name: 'generateSummary',
    description:
      'Generate an AI-powered summary of a note or collection of notes. Use when user asks "summarize this note", "give me a summary", "TLDR".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        noteId: {
          type: SchemaType.STRING,
          description: 'Specific note ID to summarize',
        },
        noteTitle: {
          type: SchemaType.STRING,
          description: 'Specific note title to find and summarize',
        },
        summarizeRecent: {
          type: SchemaType.BOOLEAN,
          description: 'If true, summarize recent notes',
        },
        limit: {
          type: SchemaType.NUMBER,
          description: 'Number of recent notes to summarize',
        },
        style: {
          type: SchemaType.STRING,
          enum: ['brief', 'detailed', 'bullet-points'],
          description: 'Summary style (default: brief)',
        },
      },
    },
  },
  {
    name: 'findSimilarNotes',
    description:
      'Find notes similar to a given note based on content, themes, or keywords. Use when user asks "find similar notes", "related notes", "notes like this".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        noteId: {
          type: SchemaType.STRING,
          description: 'Note ID to find similar notes for',
        },
        noteTitle: {
          type: SchemaType.STRING,
          description: 'Note title to find similar notes for',
        },
        threshold: {
          type: SchemaType.NUMBER,
          description: 'Similarity threshold 0-1 (default: 0.5)',
        },
      },
    },
  },
  {
    name: 'extractKeywords',
    description:
      'Extract important keywords from a note or notes. Use when user asks "what are the keywords", "important terms", "key concepts".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        noteId: {
          type: SchemaType.STRING,
          description: 'Specific note ID',
        },
        noteTitle: {
          type: SchemaType.STRING,
          description: 'Specific note title',
        },
        extractFromRecent: {
          type: SchemaType.BOOLEAN,
          description: 'Extract from recent notes instead',
        },
        limit: {
          type: SchemaType.NUMBER,
          description: 'Number of notes to analyze',
        },
      },
    },
  },
  {
    name: 'detectDuplicates',
    description:
      'Find potential duplicate or very similar notes. Use when user asks "find duplicates", "are there any similar notes", "duplicate detection".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        spaceId: {
          type: SchemaType.STRING,
          description: 'Filter by space ID',
        },
        threshold: {
          type: SchemaType.NUMBER,
          description: 'Similarity threshold 0-1 (default: 0.8)',
        },
      },
    },
  },

  // ============================================
  // SMART SUGGESTIONS (5 tools)
  // ============================================
  {
    name: 'suggestLabels',
    description:
      'Suggest appropriate labels for a note based on its content. Use when user asks "what labels should I add", "suggest tags", "auto-tag this note".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        noteId: {
          type: SchemaType.STRING,
          description: 'Note ID to suggest labels for',
        },
        noteTitle: {
          type: SchemaType.STRING,
          description: 'Note title to find and suggest labels for',
        },
        createMissing: {
          type: SchemaType.BOOLEAN,
          description: 'Create suggested labels if they do not exist',
        },
      },
    },
  },
  {
    name: 'predictPriority',
    description:
      'Predict and suggest priority level for a note based on content and context. Use when user asks "what priority should this be", "is this urgent", "prioritize this".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        noteId: {
          type: SchemaType.STRING,
          description: 'Note ID to predict priority for',
        },
        noteTitle: {
          type: SchemaType.STRING,
          description: 'Note title to find and predict priority for',
        },
      },
    },
  },
  {
    name: 'suggestRelatedNotes',
    description:
      'Suggest notes that might be related and could be linked. Use when user asks "what notes are related", "find connections", "link suggestions".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        noteId: {
          type: SchemaType.STRING,
          description: 'Note ID to find related notes for',
        },
        noteTitle: {
          type: SchemaType.STRING,
          description: 'Note title to find related notes for',
        },
      },
    },
  },
  {
    name: 'suggestNextActions',
    description:
      'Suggest next actions based on note content or checklist items. Use when user asks "what should I do next", "suggest actions", "next steps".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        noteId: {
          type: SchemaType.STRING,
          description: 'Note ID to suggest actions for',
        },
        noteTitle: {
          type: SchemaType.STRING,
          description: 'Note title to find and suggest actions for',
        },
      },
    },
  },
  {
    name: 'suggestOrganization',
    description:
      'Suggest how to better organize notes: merge candidates, archive suggestions, label improvements. Use when user asks "how can I organize better", "cleanup suggestions", "organization tips".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        spaceId: {
          type: SchemaType.STRING,
          description: 'Filter suggestions by space ID',
        },
      },
    },
  },

  // ============================================
  // BATCH OPERATIONS (5 tools)
  // ============================================
  {
    name: 'bulkUpdateNotes',
    description:
      'Update multiple notes at once: change color, priority, labels, or space. Use when user asks "change color of all my work notes", "move all meeting notes to work space", "update multiple notes".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        noteIds: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: 'Array of note IDs to update',
        },
        searchQuery: {
          type: SchemaType.STRING,
          description: 'Find notes to update by search query',
        },
        color: {
          type: SchemaType.STRING,
          enum: NOTE_COLORS,
          description: 'New color for all notes',
        },
        priority: {
          type: SchemaType.STRING,
          enum: NOTE_PRIORITIES,
          description: 'New priority for all notes',
        },
        addLabels: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: 'Label names to add',
        },
        removeLabels: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: 'Label names to remove',
        },
        spaceId: {
          type: SchemaType.STRING,
          description: 'Move notes to this space',
        },
      },
    },
  },
  {
    name: 'bulkArchive',
    description:
      'Archive multiple notes at once based on criteria. Use when user asks "archive all old notes", "clean up my notes", "archive notes older than X".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        noteIds: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: 'Array of note IDs to archive',
        },
        olderThanDays: {
          type: SchemaType.NUMBER,
          description: 'Archive notes older than this many days',
        },
        color: {
          type: SchemaType.STRING,
          enum: NOTE_COLORS,
          description: 'Archive notes with this color',
        },
        labelName: {
          type: SchemaType.STRING,
          description: 'Archive notes with this label',
        },
        spaceId: {
          type: SchemaType.STRING,
          description: 'Archive notes in this space',
        },
      },
    },
  },
  {
    name: 'bulkDelete',
    description:
      'Move multiple notes to trash at once. Use when user asks "delete all drafts", "remove old notes", "trash these notes".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        noteIds: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: 'Array of note IDs to delete',
        },
        searchQuery: {
          type: SchemaType.STRING,
          description: 'Find notes to delete by search query',
        },
        olderThanDays: {
          type: SchemaType.NUMBER,
          description: 'Delete notes older than this many days',
        },
        archived: {
          type: SchemaType.BOOLEAN,
          description: 'Delete only archived notes',
        },
      },
    },
  },
  {
    name: 'bulkLabel',
    description:
      'Add or remove labels from multiple notes. Use when user asks "add project label to all meeting notes", "tag all recipes", "label multiple notes".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        noteIds: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: 'Array of note IDs to update',
        },
        searchQuery: {
          type: SchemaType.STRING,
          description: 'Find notes by search query',
        },
        addLabels: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: 'Label names to add',
        },
        removeLabels: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: 'Label names to remove',
        },
      },
    },
  },
  {
    name: 'autoOrganize',
    description:
      'Automatically organize notes: apply suggested labels, set priorities, archive old notes. Use when user asks "organize my notes", "auto-tag everything", "clean up and organize".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        spaceId: {
          type: SchemaType.STRING,
          description: 'Space to organize',
        },
        actions: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.STRING,
            enum: ['auto-label', 'auto-priority', 'archive-old', 'detect-duplicates'],
          },
          description: 'Actions to perform',
        },
        dryRun: {
          type: SchemaType.BOOLEAN,
          description: 'Preview changes without applying (default: true)',
        },
      },
    },
  },

  // ============================================
  // WRITING ASSISTANCE (5 tools)
  // ============================================
  {
    name: 'enhanceNote',
    description:
      'Improve writing quality: fix grammar, improve clarity, enhance style. Use when user asks "improve this note", "fix my writing", "make this clearer", "proofread".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        noteId: {
          type: SchemaType.STRING,
          description: 'Note ID to enhance',
        },
        noteTitle: {
          type: SchemaType.STRING,
          description: 'Note title to find and enhance',
        },
        enhancementType: {
          type: SchemaType.STRING,
          enum: ['grammar', 'clarity', 'professional', 'casual', 'concise'],
          description: 'Type of enhancement to apply',
        },
        applyChanges: {
          type: SchemaType.BOOLEAN,
          description: 'Apply changes directly or just preview (default: false)',
        },
      },
    },
  },
  {
    name: 'expandNote',
    description:
      'Expand a note with more details, examples, or explanations. Use when user asks "expand on this", "add more details", "elaborate", "flesh this out".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        noteId: {
          type: SchemaType.STRING,
          description: 'Note ID to expand',
        },
        noteTitle: {
          type: SchemaType.STRING,
          description: 'Note title to find and expand',
        },
        focus: {
          type: SchemaType.STRING,
          description: 'Specific area to expand on',
        },
        style: {
          type: SchemaType.STRING,
          enum: ['detailed', 'examples', 'explanatory', 'creative'],
          description: 'Expansion style',
        },
        applyChanges: {
          type: SchemaType.BOOLEAN,
          description: 'Apply changes directly or just preview',
        },
      },
    },
  },
  {
    name: 'condenseNote',
    description:
      'Shorten a note while keeping key information. Use when user asks "make this shorter", "summarize this note", "condense", "trim this down".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        noteId: {
          type: SchemaType.STRING,
          description: 'Note ID to condense',
        },
        noteTitle: {
          type: SchemaType.STRING,
          description: 'Note title to find and condense',
        },
        targetLength: {
          type: SchemaType.STRING,
          enum: ['brief', 'half', 'bullet-points'],
          description: 'Target length for condensed version',
        },
        applyChanges: {
          type: SchemaType.BOOLEAN,
          description: 'Apply changes directly or just preview',
        },
      },
    },
  },
  {
    name: 'formatNote',
    description:
      'Improve note formatting: add headings, bullet points, structure. Use when user asks "format this better", "add structure", "organize this note", "make this more readable".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        noteId: {
          type: SchemaType.STRING,
          description: 'Note ID to format',
        },
        noteTitle: {
          type: SchemaType.STRING,
          description: 'Note title to find and format',
        },
        formatStyle: {
          type: SchemaType.STRING,
          enum: ['outline', 'paragraphs', 'bullet-list', 'numbered-list', 'sections'],
          description: 'Formatting style to apply',
        },
        applyChanges: {
          type: SchemaType.BOOLEAN,
          description: 'Apply changes directly or just preview',
        },
      },
    },
  },
  {
    name: 'translateNote',
    description:
      'Translate a note to another language. Use when user asks "translate to Spanish", "convert to French", "translate this note".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        noteId: {
          type: SchemaType.STRING,
          description: 'Note ID to translate',
        },
        noteTitle: {
          type: SchemaType.STRING,
          description: 'Note title to find and translate',
        },
        targetLanguage: {
          type: SchemaType.STRING,
          description: 'Target language (e.g., "Spanish", "French", "es", "fr")',
        },
        replaceOriginal: {
          type: SchemaType.BOOLEAN,
          description: 'Replace original note or create new one (default: false)',
        },
      },
      required: ['targetLanguage'],
    },
  },

  // ============================================
  // KNOWLEDGE GRAPH (3 tools)
  // ============================================
  {
    name: 'getKnowledgeGraph',
    description:
      'Get a knowledge graph showing connections between notes based on shared topics, labels, and content similarity. Use when user asks "show note connections", "knowledge map", "how are my notes connected".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        spaceId: {
          type: SchemaType.STRING,
          description: 'Filter by space ID',
        },
        centerNoteId: {
          type: SchemaType.STRING,
          description: 'Note ID to center the graph on',
        },
        centerNoteTitle: {
          type: SchemaType.STRING,
          description: 'Note title to center the graph on',
        },
        depth: {
          type: SchemaType.NUMBER,
          description: 'Connection depth 1-3 (default: 2)',
        },
      },
    },
  },
  {
    name: 'getTopicClusters',
    description:
      'Identify clusters of related notes by topic. Use when user asks "group my notes by topic", "find topic clusters", "categorize my notes".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        spaceId: {
          type: SchemaType.STRING,
          description: 'Filter by space ID',
        },
        maxClusters: {
          type: SchemaType.NUMBER,
          description: 'Maximum number of clusters (default: 5)',
        },
      },
    },
  },
  {
    name: 'discoverInsights',
    description:
      'Discover hidden patterns and insights across notes: recurring themes, forgotten notes, interesting connections. Use when user asks "discover patterns", "find insights", "what am I missing", "hidden connections".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        spaceId: {
          type: SchemaType.STRING,
          description: 'Filter by space ID',
        },
      },
    },
  },

  // ============================================
  // PLANNING TOOLS (3 tools)
  // ============================================
  {
    name: 'setDeadline',
    description:
      'Set a deadline/due date for a note or checklist item. Use when user asks "set deadline", "due by Friday", "remind me by", "set due date".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        noteId: {
          type: SchemaType.STRING,
          description: 'Note ID to set deadline on',
        },
        noteTitle: {
          type: SchemaType.STRING,
          description: 'Note title to find',
        },
        itemId: {
          type: SchemaType.STRING,
          description: 'Checklist item ID (if setting deadline on specific item)',
        },
        itemText: {
          type: SchemaType.STRING,
          description: 'Checklist item text to find',
        },
        deadline: {
          type: SchemaType.STRING,
          description: 'Deadline - ISO date or natural language (e.g., "next Friday", "in 3 days", "2024-12-31")',
        },
      },
      required: ['deadline'],
    },
  },
  {
    name: 'getUpcomingDeadlines',
    description:
      'List upcoming deadlines from checklists. Use when user asks "what is due", "upcoming deadlines", "what do I need to finish", "due soon".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        spaceId: {
          type: SchemaType.STRING,
          description: 'Filter by space ID',
        },
        days: {
          type: SchemaType.NUMBER,
          description: 'Look ahead days (default: 7)',
        },
        includeOverdue: {
          type: SchemaType.BOOLEAN,
          description: 'Include overdue items (default: true)',
        },
      },
    },
  },
  {
    name: 'createReminder',
    description:
      'Create a reminder for a note. Use when user asks "remind me about this", "set a reminder", "notify me later".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        noteId: {
          type: SchemaType.STRING,
          description: 'Note ID to set reminder for',
        },
        noteTitle: {
          type: SchemaType.STRING,
          description: 'Note title to find',
        },
        reminderTime: {
          type: SchemaType.STRING,
          description: 'When to remind - ISO datetime or natural language',
        },
        recurring: {
          type: SchemaType.STRING,
          enum: ['none', 'daily', 'weekly', 'monthly'],
          description: 'Recurrence pattern (default: none)',
        },
      },
      required: ['reminderTime'],
    },
  },

  // ============================================
  // WELLNESS INSIGHTS (3 tools)
  // ============================================
  {
    name: 'getMoodTrends',
    description:
      'Analyze emotional trends from note content over time. Use when user asks "how have I been feeling", "mood trends", "emotional patterns", "track my mood".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        period: {
          type: SchemaType.STRING,
          enum: ['week', 'month', 'quarter'],
          description: 'Time period to analyze',
        },
        spaceId: {
          type: SchemaType.STRING,
          description: 'Filter by space ID',
        },
      },
    },
  },
  {
    name: 'getEmotionalInsights',
    description:
      'Get insights about emotional patterns detected in notes. Use when user asks "emotional insights", "how am I doing emotionally", "stress levels", "emotional health".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        spaceId: {
          type: SchemaType.STRING,
          description: 'Filter by space ID',
        },
      },
    },
  },
  {
    name: 'getWellnessRecommendations',
    description:
      'Get personalized wellness recommendations based on note patterns. Use when user asks "wellness suggestions", "self-care tips", "how can I feel better", "wellness advice".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: EMPTY_PROPERTIES,
    },
  },
];

// ============================================
// SYSTEM INSTRUCTION
// ============================================

const systemInstruction = `You are AINex, a friendly AI assistant helping with the **Notes** app in the AINex productivity suite. Think of yourself as a helpful friend who's great at organizing notes and keeping things tidy.

## CRITICAL: You MUST Use Function Calls
**IMPORTANT**: You have tools/functions available. When a user asks you to create, list, search, delete, pin, or modify notes, you MUST call the appropriate function. NEVER just say "I created a note" or "Done!" without actually calling the function first. The user interface shows when you've called functions - if you don't call them, users will see that nothing actually happened.

- To create a note → CALL createNote function
- To list notes → CALL listNotes or searchNotes function
- To delete a note → CALL deleteNote function
- And so on for all operations

If you respond without calling a function, the action did NOT happen.

## Your Personality
Be conversational and warm - like chatting with a helpful friend:
- Use natural language, not robotic responses
- Add brief acknowledgments ("Got it!", "Sure thing!", "Happy to help!")
- Be enthusiastic about helping organize their notes
- Use contractions (I'll, you've, that's) for a natural feel
- Keep responses concise but friendly, not curt
- End with a helpful follow-up question when it makes sense

### Example Good vs Bad Responses:
- Good: "Done! I created your 'Grocery List' checklist. Want me to add some items to get you started?"
- Bad: "Note created successfully. ID: abc123"

- Good: "Found 5 notes about recipes in your Personal space - here's what I found:"
- Bad: "Search complete. Results: 5 notes."

- Good: "I moved 'Meeting Notes' over to your Work space. Anything else you need help organizing?"
- Bad: "Note moved to destination space."

## App Context
You're currently helping with the **Notes** app. If someone asks about other apps (Journal, Todo, Health, Habits, etc.), let them know you're focused on Notes right now but they can switch to other apps from the main dashboard.

## Key Concepts in Notes:
- **Spaces**: Workspaces like "Personal", "Family", "Work" - notes belong to specific spaces
- **Favorites = Pinned Notes**: When users say "favorites", "starred", or "pinned" - they all mean the same thing. Use pinNote/unpinNote/listFavorites functions for these.
- **Labels**: Tags for organizing notes
- **Archive**: Hidden but not deleted notes
- **Trash**: Deleted notes that can be restored
- **Checklists**: Notes with items that have priorities and due dates
- **Colors**: lemon/yellow, peach, mint/green, sky/blue, lavender/purple, blush/pink, tangerine/orange, fog/gray, moss, coal/black
- **Priority**: High, medium, or low for notes and checklist items

## CRITICAL: Be Interactive and Ask Clarifying Questions

You MUST be interactive and ask clarifying questions when context is ambiguous. Follow this flow:

### When user asks to list, search, or create notes WITHOUT specifying a space:
1. FIRST call \`getUserContext\` to get their spaces and context
2. If user has MULTIPLE spaces (more than just Personal):
   - DO NOT immediately list all notes
   - ASK which space they want: "I see you have notes in [Space1], [Space2], and [Space3]. Which space would you like me to show notes from? Or would you like to see notes from all spaces?"
3. If user has only ONE space (Personal), proceed without asking

### When user asks about "my notes", "my checklists", "my favorites":
- If they have multiple spaces, ALWAYS ask which space first
- Present their space options clearly
- Wait for their response before fetching notes

### When user wants to CREATE a note:
- If they have multiple spaces, ask: "Which space should I create this note in? You have: [list spaces]"
- If they specify a space or only have one, proceed directly

### When user wants to MOVE a note:
- Ask which space to move it to, listing their available spaces

### Examples of being interactive:

User: "Show me my latest notes"
→ Call getUserContext first
→ If multiple spaces: "You're part of 3 spaces: Personal, Work, and Family. Which space would you like to see notes from?"
→ If one space: Proceed to list notes

User: "Create a shopping list"
→ Call getUserContext first
→ If multiple spaces: "I'll create a shopping list for you! Which space should I put it in? You have Personal, Family, and Work."
→ If one space: Create directly in that space

User: "Find my meeting notes"
→ Call getUserContext first
→ If multiple spaces: "I can search for meeting notes. Would you like me to search in a specific space (Personal, Work, Family) or across all your spaces?"

## Function Usage:
- **Context**: ALWAYS start with getUserContext when user doesn't specify a space
- **Spaces**: Use listSpaces, getCurrentSpace, or createNote with spaceId
- **Create notes**: Use createNote (can specify space, color, priority, pin status)
- **Find notes**: Use searchNotes or advancedSearch (can filter by space, color, type, labels)
- **See notes**: Use listNotes (can filter by space)
- **Edit notes**: Use updateNote, changeNoteColor, setNotePriority
- **Delete notes**: Use deleteNote (moves to trash)
- **Favorites**: Use pinNote, unpinNote, listFavorites
- **Labels**: Use listLabels, addLabelToNote, removeLabelFromNote, listNotesByLabel
- **Archive**: Use archiveNote, unarchiveNote, listArchivedNotes
- **Checklists**: Use toggleChecklistItem, addChecklistItem, updateChecklistItem, removeChecklistItem, toggleAllChecklistItems
- **Trash**: Use listTrashedNotes, restoreFromTrash, emptyTrash
- **Move/Copy**: Use moveNoteToSpace, duplicateNote

## Response Guidelines:
- Be warm and conversational - you're a helpful friend, not a robot
- Start responses with brief acknowledgments when appropriate ("Got it!", "Sure!", "Absolutely!")
- ALWAYS ask clarifying questions when context is ambiguous (especially about spaces)
- After executing functions, summarize what you did in a friendly way
- Offer helpful follow-ups ("Want me to add items to that checklist?" or "Need anything else organized?")
- When searching by title, if not found, suggest alternatives helpfully
- "Favorites", "starred", "pinned" all mean the same thing - use the pinNote/unpinNote/listFavorites functions
- Map friendly color names: "yellow" → "lemon", "blue" → "sky", "green" → "mint", "purple" → "lavender", "pink" → "blush", "orange" → "tangerine"
- Always confirm destructive actions like emptying trash with a friendly heads-up
- When asking about spaces, list them clearly so choosing is easy

## Off-Topic Conversations:
If someone asks about things outside Notes (weather, general questions, other apps):
- Respond conversationally and helpfully
- Gently mention you're focused on Notes: "I'm your Notes assistant, so I can't check the weather, but I'm here whenever you need help organizing your notes!"
- For other AINex apps: "That sounds like something for the [Journal/Todo/etc.] app! You can switch apps from the main dashboard. In the meantime, anything I can help with in Notes?"

## Proactive Insights & Suggestions

Be helpful by proactively offering relevant insights and features:

### When Listing Notes:
- If you notice many notes without labels, mention: "I noticed several notes don't have labels. Want me to suggest some tags?"
- If there are old untouched notes, offer: "You have some notes from a while ago - shall I help archive the outdated ones?"

### When Creating Notes:
- After creating a checklist, offer: "Want me to set deadlines for any of these items?"
- After creating a note, suggest if relevant: "This note seems related to [topic] - should I find similar notes?"

### When Searching:
- If search returns many results, offer: "I found quite a few! Want me to help organize them or find themes?"
- If detecting potential duplicates, mention: "I noticed some similar notes - want me to check for duplicates?"

### Contextual Awareness:
- If it's Monday, offer: "Happy Monday! Want me to show your weekly digest?"
- If there are overdue items, alert: "Heads up! You have some overdue tasks."
- After completing tasks, celebrate: "Great progress! You've been productive today."

### Feature Discovery:
Help users discover new capabilities naturally:
- After getNoteStatistics: "I can also show you trends over time or compare your spaces!"
- After creating a note: "Did you know I can help enhance this note, add structure, or suggest related notes?"
- After searching: "Want me to analyze these results for themes or duplicates?"

## Advanced Capabilities:
You now have powerful new tools! Use them when relevant:
- **Analytics**: getNoteStatistics, getProductivityInsights, getActivityTrends, getWeeklyDigest
- **Content Analysis**: analyzeNoteSentiment, extractThemes, generateSummary, findSimilarNotes
- **Smart Suggestions**: suggestLabels, predictPriority, suggestOrganization, suggestNextActions
- **Batch Operations**: bulkUpdateNotes, bulkArchive, bulkLabel, autoOrganize
- **Writing Help**: enhanceNote, expandNote, condenseNote, formatNote, translateNote
- **Knowledge Graph**: getKnowledgeGraph, getTopicClusters, discoverInsights
- **Planning**: setDeadline, getUpcomingDeadlines, createReminder
- **Wellness**: getMoodTrends, getEmotionalInsights, getWellnessRecommendations`;

// ============================================
// MODEL CONFIGURATION
// ============================================

export function getGeminiModel() {
  if (!genAI) {
    throw new Error('Gemini API key not configured');
  }

  return genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
    tools: [
      {
        functionDeclarations: notesTools,
      },
    ],
    systemInstruction,
  });
}

export { genAI };
