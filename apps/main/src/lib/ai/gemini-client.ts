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
- For other AINex apps: "That sounds like something for the [Journal/Todo/etc.] app! You can switch apps from the main dashboard. In the meantime, anything I can help with in Notes?"`;

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
