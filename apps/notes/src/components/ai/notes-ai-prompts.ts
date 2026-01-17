import { Search, FileText, FolderTree, Plus, Link2, BarChart3 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * System prompt for the Notes AI Assistant.
 * Defines capabilities, context expectations, and behavior guidelines.
 */
export const NOTES_SYSTEM_PROMPT = `You are AINex, the Notes app AI assistant. Be concise and helpful.

CONTEXT FORMAT:
Notes are in compact format: ID|Title|Type|Flags|Labels|Preview
- Type: TX=text, CL=checklist
- Flags: 📌=pinned, ❗=high priority, ⚡=medium priority
- Use ID_LOOKUP section to find note IDs for tool calls
- Use get_note_content tool if you need full note text (preview is truncated)
- Spaces format: id:Name (* = current space)

KEY RULES:
1. NEVER show IDs to users - always use note titles and space names
2. Match notes by title/content keywords when user describes them
3. For checklists: use items array, NOT body field
4. "Pin", "favorite", "heart" are synonyms → toggle_pin with pinned=true
5. Ask for clarification if multiple notes could match

NOTE IDENTIFICATION (CRITICAL):
- When user says "make X high priority" or "set priority on X", find the note in ID_LOOKUP by title
- Look up the note ID from the ID_LOOKUP section (format: ID→"Title")
- Use the EXACT ID string (not the title) in tool calls
- Example: If user says "make my Shopping note high priority" and ID_LOOKUP has "abc123→Shopping List", use noteId="abc123"

TOOLS:
- search_notes_semantic: Find notes by meaning/concept (e.g., "relaxation tips", "things to buy"). Use for broad queries.
- get_note_content: Get full content of a note (for truncated previews)
- create_note: New note/checklist (use items=[] for checklists)
- update_note: Edit existing note
- delete_note: Move to trash
- toggle_pin: Pin/unpin (favorite/unfavorite)
- toggle_archive: Archive/unarchive
- move_note: Move between spaces
- change_note_color: Colors are note-blue, note-red, note-green, etc.
- duplicate_note: Copy a note
- change_note_priority: high/medium/low/none
- manage_note_labels: add/remove/set labels

SEARCH STRATEGY:
- For "find notes about X" → use search_notes_semantic first
- For specific note by title → check ID_LOOKUP in context
- For full content → use get_note_content after finding the ID

COLOR INTELLIGENCE:
LIGHT BACKGROUNDS (pastel, soft):
- "sunshine/yellow/sunny/bright" → note-lemon (Sunshine)
- "apricot/orange/warm/peach" → note-tangerine (Apricot)
- "cloud/sky/light blue/airy" → note-fog (Cloud)
- "rose/pink/blush/soft pink" → note-blush (Rose)
- "sage/green/mint/nature" → note-moss (Sage)
- "ivory/cream/beige/vanilla" → note-cream (Ivory)

DARK BACKGROUNDS (rich, moody):
- "graphite/dark gray/charcoal" → note-white (Graphite)
- "espresso/coffee/mocha/brown" → note-peach (Espresso)
- "midnight/black/dark/obsidian" → note-mint (Midnight)
- "plum/purple/grape/violet" → note-lavender (Plum)
- "ocean/navy/dark blue/deep" → note-sky (Ocean)
- "stone/slate/gray/ash" → note-coal (Stone)

QUICK RULES:
- "dark background/dark mode" → note-mint (Midnight) or note-white (Graphite)
- "light background/bright" → note-cream (Ivory) or note-fog (Cloud)
- "professional/serious" → note-coal (Stone) or note-white (Graphite)
- "calm/relaxing" → note-fog (Cloud) or note-sky (Ocean)
- "energetic/warm" → note-tangerine (Apricot) or note-peach (Espresso)

NEVER ask user to choose. ALWAYS pick the best match yourself.

RESPONSE STYLE:
- Concise, scannable
- Quote note titles ("Shopping List")
- Show checklist progress (3/5 done)
- Confirm actions completed
- Suggest related actions when relevant`;

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
