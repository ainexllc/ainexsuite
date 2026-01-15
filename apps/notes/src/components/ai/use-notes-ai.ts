'use client';

import { useMemo } from 'react';
import { useGrokAssistant, type Message } from '@ainexsuite/ai';
import type { Note, Label } from '@/lib/types/note';
import { NOTES_SYSTEM_PROMPT } from './notes-ai-prompts';

// Legacy exports for backwards compatibility (can be removed in future)
export type InsightsPanelMode = 'activity' | 'search-results' | 'actions';

export interface AIAction {
  id: string;
  type: 'label' | 'archive' | 'merge' | 'delete' | 'create';
  title: string;
  description: string;
  targetNoteIds?: string[];
  suggestedLabel?: string;
}

export interface ActivityItem {
  id: string;
  type: 'created' | 'edited' | 'archived' | 'labeled' | 'deleted';
  noteId: string;
  noteTitle: string;
  timestamp: Date;
  details?: string;
}

export interface UseNotesAIOptions {
  notes: Note[];
  labels: Label[];
  onError?: (error: Error) => void;
}

export interface UseNotesAIReturn {
  // Chat state
  messages: Message[];
  loading: boolean;
  streaming: boolean;
  sendMessage: (content: string) => Promise<void>;
  cancelRequest: () => void;
  clearMessages: () => void;

  // Context info
  notesContext: string;
}

/**
 * Custom hook for the Notes AI Assistant.
 *
 * Provides a chat interface with notes-specific context.
 * The AI has access to the user's notes and labels for context-aware responses.
 */
export function useNotesAI(options: UseNotesAIOptions): UseNotesAIReturn {
  const { notes, labels, onError } = options;

  // Build comprehensive context string from notes data
  const notesContext = useMemo(() => {
    // Helper to truncate text
    const truncate = (text: string, max: number) =>
      text.length > max ? text.slice(0, max) + '...' : text;

    // Helper to get plain text from HTML body
    const getPlainText = (html: string) =>
      html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

    // Helper to format date
    const formatDate = (date: Date) => {
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      if (days === 0) return 'today';
      if (days === 1) return 'yesterday';
      if (days < 7) return `${days} days ago`;
      return date.toLocaleDateString();
    };

    // Build detailed note summaries (include all notes for comprehensive search)
    const noteSummaries = notes
      .filter((n) => !n.archived) // Exclude archived from main context
      .slice(0, 30) // Limit to 30 most recent for context window
      .map((n, i) => {
        const type = n.type === 'checklist' ? 'CHECKLIST' : 'TEXT';
        const title = n.title || 'Untitled';
        const labelNames = n.labelIds
          .map((id) => labels.find((l) => l.id === id)?.name)
          .filter(Boolean);
        const labelInfo = labelNames.length > 0 ? `Labels: ${labelNames.join(', ')}` : '';
        const pinnedInfo = n.pinned ? '📌 PINNED' : '';
        const priorityInfo = n.priority ? `Priority: ${n.priority}` : '';

        let contentPreview = '';
        if (n.type === 'text' && n.body) {
          const plainText = getPlainText(n.body);
          contentPreview = truncate(plainText, 200);
        } else if (n.type === 'checklist' && n.checklist.length > 0) {
          const completed = n.checklist.filter((item) => item.completed).length;
          const total = n.checklist.length;
          const items = n.checklist
            .slice(0, 5)
            .map((item) => `  ${item.completed ? '✓' : '○'} ${item.text}`)
            .join('\n');
          contentPreview = `Progress: ${completed}/${total} complete\n${items}${total > 5 ? `\n  ...and ${total - 5} more items` : ''}`;
        }

        const meta = [pinnedInfo, priorityInfo, labelInfo, `Updated: ${formatDate(n.updatedAt)}`]
          .filter(Boolean)
          .join(' | ');

        return `
[Note #${i + 1}] "${title}" (${type})
${meta}
${contentPreview}`;
      })
      .join('\n---');

    // Label summary with note counts
    const labelSummary = labels.map((l) => {
      const noteCount = notes.filter((n) => n.labelIds.includes(l.id)).length;
      return `- ${l.name}: ${noteCount} notes`;
    }).join('\n');

    // Statistics
    const activeNotes = notes.filter((n) => !n.archived);
    const stats = {
      total: notes.length,
      active: activeNotes.length,
      text: activeNotes.filter((n) => n.type === 'text').length,
      checklists: activeNotes.filter((n) => n.type === 'checklist').length,
      pinned: activeNotes.filter((n) => n.pinned).length,
      archived: notes.filter((n) => n.archived).length,
      unlabeled: activeNotes.filter((n) => n.labelIds.length === 0).length,
      withReminders: activeNotes.filter((n) => n.reminderAt).length,
      highPriority: activeNotes.filter((n) => n.priority === 'high').length,
    };

    return `
=== USER'S NOTES DATABASE ===

STATISTICS:
- Total notes: ${stats.total} (${stats.active} active, ${stats.archived} archived)
- Text notes: ${stats.text}
- Checklists: ${stats.checklists}
- Pinned/Favorites: ${stats.pinned}
- High priority: ${stats.highPriority}
- With reminders: ${stats.withReminders}
- Unlabeled: ${stats.unlabeled}

LABELS (${labels.length}):
${labelSummary || 'No labels created yet'}

=== NOTE CONTENTS ===
${noteSummaries || 'No notes yet'}
`;
  }, [notes, labels]);

  // Build full system prompt with context
  const fullSystemPrompt = useMemo(() => {
    return `${NOTES_SYSTEM_PROMPT}\n\n${notesContext}`;
  }, [notesContext]);

  // Initialize Grok assistant
  const {
    messages,
    loading,
    streaming,
    sendMessage,
    cancelRequest,
    clearMessages,
  } = useGrokAssistant({
    appName: 'notes',
    systemPrompt: fullSystemPrompt,
    context: {
      noteCount: notes.length,
      labelCount: labels.length,
    },
    onError,
  });

  return {
    // Chat state
    messages,
    loading,
    streaming,
    sendMessage,
    cancelRequest,
    clearMessages,

    // Context
    notesContext,
  };
}
