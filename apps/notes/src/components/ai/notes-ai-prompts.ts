import { Search, FileText, FolderTree, Plus, Link2, BarChart3 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * System prompt for the Notes AI Assistant.
 * Defines capabilities, context expectations, and behavior guidelines.
 */
export const NOTES_SYSTEM_PROMPT = `You are AINex, the intelligent assistant for the Notes app in AINexSpace.

CAPABILITIES:
- Search and find notes by content, title, keywords, or labels
- Answer questions about the user's note contents
- Summarize individual notes or groups of notes
- Identify patterns, themes, and connections across notes
- Suggest organization improvements (labels, grouping, archiving)
- CREATE new notes with title, content, and optional settings
- EDIT existing notes (update title, content, color, etc.)
- DELETE notes (moves to trash with undo option)
- Toggle pin/archive status on notes
- Provide statistics and insights about the note collection
- Track checklist progress and completion status

YOU HAVE ACCESS TO:
- Full note titles and content previews (first ~200 chars)
- Checklist items with completion status
- Labels and which notes they're applied to
- Note metadata (pinned, priority, dates, colors)
- Statistics about the entire collection
- Tools to create, update, and delete notes

WHEN USING TOOLS:
- Use create_note to make new notes - always confirm what was created
- Use update_note to modify existing notes - reference by note ID
- Use delete_note to trash notes - remind user they can undo
- Always confirm the action was completed successfully
- If a tool fails, explain the error clearly

RESPONSE GUIDELINES:
- Be concise but helpful - aim for scannable responses
- When searching: quote relevant snippets from notes you find
- When summarizing: highlight key points, not full content
- Always reference notes by their title in quotes (e.g., "Shopping List")
- Format lists clearly with bullets or numbers
- If asked about something not in the notes, say so clearly
- Proactively suggest related notes or actions when relevant
- For checklists, mention completion progress (e.g., "3/5 items done")
- After creating/editing notes, briefly describe what was done

TONE:
- Friendly and helpful
- Professional but casual
- Proactive with suggestions`;

/**
 * Suggested prompts shown when the chat is empty.
 * Each prompt has an icon, label, full prompt text, and panel mode it triggers.
 */
export interface SuggestedPrompt {
  id: string;
  icon: LucideIcon;
  label: string;
  prompt: string;
  /** What panel mode this prompt typically triggers */
  triggersPanel: 'activity' | 'search-results' | 'actions';
  /** If true, prompt has a placeholder for user to complete */
  hasPlaceholder?: boolean;
}

export const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  {
    id: 'find',
    icon: Search,
    label: 'Find notes about...',
    prompt: 'Find my notes about ',
    triggersPanel: 'search-results',
    hasPlaceholder: true,
  },
  {
    id: 'summarize',
    icon: FileText,
    label: 'Summarize recent notes',
    prompt: 'Summarize my most recent notes',
    triggersPanel: 'search-results',
  },
  {
    id: 'organize',
    icon: FolderTree,
    label: 'Help me organize',
    prompt: 'How can I better organize my notes?',
    triggersPanel: 'actions',
  },
  {
    id: 'create',
    icon: Plus,
    label: 'Create a note about...',
    prompt: 'Create a new note about ',
    triggersPanel: 'activity',
    hasPlaceholder: true,
  },
  {
    id: 'related',
    icon: Link2,
    label: 'Find related notes',
    prompt: 'Find notes related to ',
    triggersPanel: 'search-results',
    hasPlaceholder: true,
  },
  {
    id: 'stats',
    icon: BarChart3,
    label: 'Show note statistics',
    prompt: 'Show me statistics about my notes',
    triggersPanel: 'actions',
  },
];

/**
 * Keywords that trigger specific panel modes.
 * Used to determine what to show in the insights panel based on AI response.
 */
export const PANEL_TRIGGER_KEYWORDS = {
  'search-results': [
    'found',
    'notes about',
    'matching',
    'results',
    'here are',
    'notes related to',
  ],
  actions: [
    'suggest',
    'recommend',
    'organize',
    'improve',
    'could',
    'should',
    'unlabeled',
    'archive',
    'duplicate',
  ],
} as const;

/**
 * Determines what panel mode should be shown based on a prompt or response.
 */
export function detectPanelMode(
  text: string
): 'activity' | 'search-results' | 'actions' {
  const lowerText = text.toLowerCase();

  // Check for search-related keywords
  if (PANEL_TRIGGER_KEYWORDS['search-results'].some((kw) => lowerText.includes(kw))) {
    return 'search-results';
  }

  // Check for action-related keywords
  if (PANEL_TRIGGER_KEYWORDS.actions.some((kw) => lowerText.includes(kw))) {
    return 'actions';
  }

  // Default to activity
  return 'activity';
}
