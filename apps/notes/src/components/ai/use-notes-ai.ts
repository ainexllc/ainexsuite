'use client';

import { useMemo, useCallback, useState, useRef } from 'react';
import { useGrokAssistant, type Message } from '@ainexsuite/ai';
import type { Note, Label, NoteColor, NotePriority, NoteType, ChecklistItem } from '@/lib/types/note';
import { generateUUID } from '@ainexsuite/ui';
import { NOTES_SYSTEM_PROMPT } from './notes-ai-prompts';
import { streamLumiChat } from '@/lib/ai/streaming-client';
import type {
  CreateNoteParams,
  UpdateNoteParams,
  DeleteNoteParams,
  TogglePinParams,
  ToggleArchiveParams,
  MoveNoteParams,
  ChangeNoteColorParams,
  DuplicateNoteParams,
  ChangeNotePriorityParams,
  ManageNoteLabelsParams,
  GetNoteContentParams,
  SearchNotesSemanticParams,
} from '@/lib/ai/note-tools';
import type { NoteSpace } from '@/lib/types/note';

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

/** Input type for creating a note via AI */
type CreateNoteInput = {
  title?: string;
  body?: string;
  type?: NoteType;
  color?: NoteColor;
  pinned?: boolean;
  priority?: NotePriority;
  /** For checklist notes: array of checklist items */
  checklist?: ChecklistItem[];
};

/** Note mutations that can be provided to the AI hook */
export interface NoteMutations {
  createNote?: (input: CreateNoteInput) => Promise<string | null>;
  updateNote?: (noteId: string, updates: Partial<Note>) => Promise<void>;
  deleteNote?: (noteId: string) => Promise<void>;
  togglePin?: (noteId: string, pinned: boolean) => Promise<void>;
  toggleArchive?: (noteId: string, archived: boolean) => Promise<void>;
  duplicateNote?: (noteId: string) => Promise<string | null>;
}

export interface UseNotesAIOptions {
  notes: Note[];
  labels: Label[];
  /** User's available spaces for moving notes between */
  spaces?: NoteSpace[];
  /** Currently selected space ID */
  currentSpaceId?: string;
  onError?: (error: Error) => void;
  /** Note mutation functions for AI to execute */
  mutations?: NoteMutations;
  /** Enable streaming responses via Cloud Function (default: true) */
  enableStreaming?: boolean;
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

  // Model info (for display in UI)
  modelName: string;
  modelProvider: 'gemini' | 'grok' | 'streaming';
}

/**
 * Custom hook for the Notes AI Assistant.
 *
 * Provides a chat interface with notes-specific context.
 * The AI has access to the user's notes and labels for context-aware responses.
 */
export function useNotesAI(options: UseNotesAIOptions): UseNotesAIReturn {
  const { notes, labels, spaces = [], currentSpaceId = 'personal', onError, mutations, enableStreaming = true } = options;

  // Streaming state (used when enableStreaming is true)
  const [streamingMessages, setStreamingMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Helper to get plain text from HTML body
  const getPlainText = useCallback((html: string) =>
    html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(), []);

  // Function call handler - executes note operations
  const handleFunctionCall = useCallback(
    async (name: string, args: Record<string, unknown>): Promise<unknown> => {
      try {
        switch (name) {
          case 'get_note_content': {
            // Lazy loading - returns full note content on demand
            const params = args as unknown as GetNoteContentParams;
            const note = notes.find((n) => n.id === params.noteId);

            if (!note) {
              return { success: false, error: 'Note not found' };
            }

            // Get full content based on type
            let fullContent = '';
            if (note.type === 'text' && note.body) {
              fullContent = getPlainText(note.body);
            } else if (note.type === 'checklist' && note.checklist.length > 0) {
              const items = note.checklist.map((item) =>
                `${item.completed ? '✓' : '○'} ${item.text}`
              );
              fullContent = items.join('\n');
            }

            // Get label names
            const labelNames = note.labelIds
              .map((id) => labels.find((l) => l.id === id)?.name)
              .filter(Boolean);

            return {
              success: true,
              note: {
                id: note.id,
                title: note.title || 'Untitled',
                type: note.type,
                content: fullContent,
                pinned: note.pinned,
                priority: note.priority,
                labels: labelNames,
                color: note.color,
                createdAt: note.createdAt,
                updatedAt: note.updatedAt,
                checklistProgress: note.type === 'checklist'
                  ? `${note.checklist.filter((i) => i.completed).length}/${note.checklist.length}`
                  : null,
              },
            };
          }

          case 'search_notes_semantic': {
            // Semantic search - currently using keyword fallback
            // TODO: Integrate with Firestore Vector Search Extension when installed
            const params = args as unknown as SearchNotesSemanticParams;
            const limit = params.limit || 5;
            const queryLower = params.query.toLowerCase();
            const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 2);

            // Score notes by relevance
            const scoredNotes = notes
              .filter((n) => !n.archived && !n.deletedAt)
              .map((n) => {
                let score = 0;
                const title = (n.title || '').toLowerCase();
                const body = n.body ? getPlainText(n.body).toLowerCase() : '';
                const checklistText = n.type === 'checklist'
                  ? n.checklist.map((i) => i.text).join(' ').toLowerCase()
                  : '';

                // Score based on query word matches
                for (const word of queryWords) {
                  if (title.includes(word)) score += 3;
                  if (body.includes(word)) score += 1;
                  if (checklistText.includes(word)) score += 1;
                }

                // Boost pinned notes slightly
                if (n.pinned) score += 0.5;

                return { note: n, score };
              })
              .filter((r) => r.score > 0)
              .sort((a, b) => b.score - a.score)
              .slice(0, limit);

            if (scoredNotes.length === 0) {
              return {
                success: true,
                results: [],
                message: `No notes found matching "${params.query}"`,
              };
            }

            // Get label names for results
            const results = scoredNotes.map((r) => {
              const labelNames = r.note.labelIds
                .map((id) => labels.find((l) => l.id === id)?.name)
                .filter(Boolean);

              return {
                id: r.note.id,
                title: r.note.title || 'Untitled',
                type: r.note.type,
                preview: r.note.type === 'text' && r.note.body
                  ? getPlainText(r.note.body).slice(0, 150)
                  : r.note.type === 'checklist'
                    ? r.note.checklist.slice(0, 3).map((i) => i.text).join(', ')
                    : '',
                pinned: r.note.pinned,
                labels: labelNames,
                relevanceScore: r.score,
              };
            });

            return {
              success: true,
              results,
              message: `Found ${results.length} note${results.length !== 1 ? 's' : ''} matching "${params.query}"`,
            };
          }

          case 'create_note': {
            const params = args as unknown as CreateNoteParams;
            if (!mutations?.createNote) {
              return { success: false, error: 'Create note not available' };
            }

            // Convert items array to ChecklistItem objects for checklists
            let checklist: ChecklistItem[] | undefined;
            if (params.type === 'checklist' && params.items?.length) {
              checklist = params.items.map((text) => ({
                id: generateUUID(),
                text,
                completed: false,
              }));
            }

            const noteId = await mutations.createNote({
              title: params.title,
              body: params.body,
              color: params.color as NoteColor | undefined,
              pinned: params.pinned,
              type: params.type as NoteType | undefined,
              checklist,
            });
            return {
              success: true,
              message: `Created ${params.type === 'checklist' ? 'checklist' : 'note'} "${params.title}"`,
              noteId,
            };
          }

          case 'update_note': {
            const params = args as unknown as UpdateNoteParams;
            if (!mutations?.updateNote) {
              return { success: false, error: 'Update note not available' };
            }
            // Verify note exists
            const noteToUpdate = notes.find((n) => n.id === params.noteId);
            if (!noteToUpdate) {
              return { success: false, error: `Note with ID "${params.noteId}" not found` };
            }
            const updates: Partial<Note> = {};
            if (params.title !== undefined) updates.title = params.title;
            if (params.body !== undefined) updates.body = params.body;
            if (params.color !== undefined) updates.color = params.color as NoteColor;
            if (params.pinned !== undefined) updates.pinned = params.pinned;
            if (params.archived !== undefined) updates.archived = params.archived;
            // Handle checklist items update
            if (params.items && params.items.length > 0) {
              updates.checklist = params.items.map((text) => ({
                id: generateUUID(),
                text,
                completed: false,
              }));
              updates.type = 'checklist';
            }
            await mutations.updateNote(params.noteId, updates);
            return {
              success: true,
              message: `Updated note`,
              noteId: params.noteId,
            };
          }

          case 'delete_note': {
            const params = args as unknown as DeleteNoteParams;
            if (!mutations?.deleteNote) {
              return { success: false, error: 'Delete note not available' };
            }
            await mutations.deleteNote(params.noteId);
            return {
              success: true,
              message: `Moved note to trash`,
              noteId: params.noteId,
            };
          }

          case 'toggle_pin': {
            const params = args as unknown as TogglePinParams;
            if (!mutations?.togglePin) {
              return { success: false, error: 'Toggle pin not available' };
            }
            await mutations.togglePin(params.noteId, params.pinned);
            return {
              success: true,
              message: params.pinned ? 'Pinned note' : 'Unpinned note',
              noteId: params.noteId,
            };
          }

          case 'toggle_archive': {
            const params = args as unknown as ToggleArchiveParams;
            if (!mutations?.toggleArchive) {
              return { success: false, error: 'Toggle archive not available' };
            }
            await mutations.toggleArchive(params.noteId, params.archived);
            return {
              success: true,
              message: params.archived ? 'Archived note' : 'Unarchived note',
              noteId: params.noteId,
            };
          }

          case 'move_note': {
            const params = args as unknown as MoveNoteParams;
            if (!mutations?.updateNote) {
              return { success: false, error: 'Move note not available' };
            }
            // Find target space name for confirmation message
            const targetSpace = spaces.find((s) => s.id === params.targetSpaceId);
            const spaceName = targetSpace?.name || (params.targetSpaceId === 'personal' ? 'Personal' : params.targetSpaceId);

            // Validate target space exists (if not personal)
            if (params.targetSpaceId !== 'personal' && !targetSpace) {
              return {
                success: false,
                error: `Space "${params.targetSpaceId}" not found. Please check the available spaces.`,
              };
            }

            await mutations.updateNote(params.noteId, { spaceId: params.targetSpaceId });
            return {
              success: true,
              message: `Moved note to "${spaceName}"`,
              noteId: params.noteId,
              targetSpaceId: params.targetSpaceId,
            };
          }

          case 'change_note_color': {
            const params = args as unknown as ChangeNoteColorParams;
            if (!mutations?.updateNote) {
              return { success: false, error: 'Change color not available' };
            }
            // Find the note to get its title for the response
            const noteForColor = notes.find((n) => n.id === params.noteId);
            if (!noteForColor) {
              return { success: false, error: `Note with ID "${params.noteId}" not found` };
            }
            const noteTitle = noteForColor.title || 'Untitled';

            // Map color value to user-friendly name
            const colorNames: Record<string, string> = {
              'default': 'default',
              'note-white': 'Graphite',
              'note-cream': 'Ivory',
              'note-lemon': 'Sunshine',
              'note-peach': 'Espresso',
              'note-tangerine': 'Apricot',
              'note-mint': 'Midnight',
              'note-fog': 'Cloud',
              'note-lavender': 'Plum',
              'note-blush': 'Rose',
              'note-sky': 'Ocean',
              'note-moss': 'Sage',
              'note-coal': 'Stone',
            };
            const colorName = colorNames[params.color] || params.color;

            try {
              await mutations.updateNote(params.noteId, { color: params.color as NoteColor });
            } catch (err) {
              return { success: false, error: 'Failed to update color' };
            }
            return {
              success: true,
              message: `Changed "${noteTitle}" to ${colorName}`,
              noteId: params.noteId,
              color: params.color,
            };
          }

          case 'duplicate_note': {
            const params = args as unknown as DuplicateNoteParams;
            if (!mutations?.duplicateNote) {
              return { success: false, error: 'Duplicate note not available' };
            }
            // Find the note to get its title for the response
            const noteToDuplicate = notes.find((n) => n.id === params.noteId);
            if (!noteToDuplicate) {
              return { success: false, error: `Note with ID "${params.noteId}" not found` };
            }
            const originalTitle = noteToDuplicate.title || 'Untitled';

            const newNoteId = await mutations.duplicateNote(params.noteId);
            if (!newNoteId) {
              return { success: false, error: 'Failed to duplicate note' };
            }
            return {
              success: true,
              message: `Created a copy of "${originalTitle}"`,
              noteId: newNoteId,
              originalNoteId: params.noteId,
            };
          }

          case 'change_note_priority': {
            const params = args as unknown as ChangeNotePriorityParams;
            if (!mutations?.updateNote) {
              return { success: false, error: 'Change priority not available' };
            }
            // Find the note to get its title for the response
            const noteForPriority = notes.find((n) => n.id === params.noteId);
            if (!noteForPriority) {
              return { success: false, error: `Note with ID "${params.noteId}" not found` };
            }
            const noteTitlePriority = noteForPriority.title || 'Untitled';

            // Convert 'none' to null for storage
            const priorityValue: NotePriority = params.priority === 'none' ? null : params.priority;

            try {
              await mutations.updateNote(params.noteId, { priority: priorityValue });
            } catch {
              return { success: false, error: 'Failed to update priority' };
            }

            const priorityMessage = params.priority === 'none'
              ? `Cleared priority from "${noteTitlePriority}"`
              : `Set "${noteTitlePriority}" to ${params.priority} priority`;

            return {
              success: true,
              message: priorityMessage,
              noteId: params.noteId,
              priority: priorityValue,
            };
          }

          case 'manage_note_labels': {
            const params = args as unknown as ManageNoteLabelsParams;
            if (!mutations?.updateNote) {
              return { success: false, error: 'Manage labels not available' };
            }
            // Find the note to get its current labels and title
            const noteForLabels = notes.find((n) => n.id === params.noteId);
            if (!noteForLabels) {
              return { success: false, error: 'Note not found' };
            }
            const noteTitleLabels = noteForLabels.title || 'Untitled';
            const currentLabelIds = noteForLabels.labelIds || [];

            // Convert label names to IDs by matching against available labels
            const matchedLabels = params.labelNames.map((name) => {
              const matchedLabel = labels.find(
                (l) => l.name.toLowerCase() === name.toLowerCase()
              );
              return matchedLabel;
            }).filter(Boolean);

            const matchedLabelIds = matchedLabels.map((l) => l!.id);
            const matchedLabelNames = matchedLabels.map((l) => l!.name);

            // Check for unmatched labels
            const unmatchedNames = params.labelNames.filter(
              (name) => !labels.find((l) => l.name.toLowerCase() === name.toLowerCase())
            );

            if (unmatchedNames.length > 0 && matchedLabels.length === 0) {
              return {
                success: false,
                error: `Labels not found: ${unmatchedNames.join(', ')}. Available labels: ${labels.map((l) => l.name).join(', ') || 'none'}`,
              };
            }

            // Calculate new label IDs based on action
            let newLabelIds: string[];
            let actionMessage: string;

            switch (params.action) {
              case 'add':
                newLabelIds = [...new Set([...currentLabelIds, ...matchedLabelIds])];
                actionMessage = `Added ${matchedLabelNames.length > 0 ? matchedLabelNames.join(', ') : 'labels'} to "${noteTitleLabels}"`;
                break;
              case 'remove':
                newLabelIds = currentLabelIds.filter((id) => !matchedLabelIds.includes(id));
                actionMessage = `Removed ${matchedLabelNames.length > 0 ? matchedLabelNames.join(', ') : 'labels'} from "${noteTitleLabels}"`;
                break;
              case 'set':
                newLabelIds = matchedLabelIds;
                actionMessage = matchedLabelIds.length > 0
                  ? `Set labels on "${noteTitleLabels}" to: ${matchedLabelNames.join(', ')}`
                  : `Cleared all labels from "${noteTitleLabels}"`;
                break;
              default:
                return { success: false, error: 'Invalid action' };
            }

            await mutations.updateNote(params.noteId, { labelIds: newLabelIds });

            // Add warning about unmatched labels if some were found
            const warning = unmatchedNames.length > 0
              ? ` (Note: labels not found: ${unmatchedNames.join(', ')})`
              : '';

            return {
              success: true,
              message: actionMessage + warning,
              noteId: params.noteId,
              labelIds: newLabelIds,
            };
          }

          default:
            return { success: false, error: `Unknown function: ${name}` };
        }
      } catch (error) {
        console.error(`[Notes AI] Function call error (${name}):`, error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },
    [mutations, spaces, notes, labels, getPlainText]
  );

  // Build optimized context string from notes data
  // Phase 1 Optimization: Compact format reduces tokens by ~60%
  const notesContext = useMemo(() => {
    // Helper to get plain text from HTML body (compact)
    const toPlain = (html: string) =>
      html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

    // Filter active notes
    const activeNotes = notes.filter((n) => !n.archived);
    const displayNotes = activeNotes.slice(0, 30);

    // Compact statistics (single line)
    const stats = `${activeNotes.length} notes (${activeNotes.filter((n) => n.pinned).length} pinned, ${activeNotes.filter((n) => n.type === 'checklist').length} checklists)`;

    // Compact spaces (single line each)
    const currentSpace = spaces.find((s) => s.id === currentSpaceId);
    const spacesLine = spaces.length > 0
      ? spaces.map((s) => `${s.id}:${s.name}${s.id === currentSpaceId ? '*' : ''}`).join(', ')
      : 'personal:Personal*';

    // Compact labels (just names, IDs on demand via get_note_content)
    const labelNames = labels.map((l) => l.name).join(', ') || 'none';

    // Build compact note list with ID lookup table
    // Format: ID|Title|Type|Flags|Labels|Preview
    const noteLines = displayNotes.map((n) => {
      const flags: string[] = [];
      if (n.pinned) flags.push('📌');
      if (n.priority === 'high') flags.push('❗');
      if (n.priority === 'medium') flags.push('⚡');

      const labelList = n.labelIds
        .map((id) => labels.find((l) => l.id === id)?.name)
        .filter(Boolean)
        .join(',');

      let preview = '';
      if (n.type === 'text' && n.body) {
        preview = toPlain(n.body).slice(0, 100);
      } else if (n.type === 'checklist' && n.checklist.length > 0) {
        const done = n.checklist.filter((i) => i.completed).length;
        preview = `[${done}/${n.checklist.length}] ${n.checklist.slice(0, 3).map((i) => i.text).join(', ')}`;
      }

      const type = n.type === 'checklist' ? 'CL' : 'TX';
      const title = n.title || 'Untitled';

      return `${n.id}|${title}|${type}|${flags.join('')}|${labelList}|${preview}`;
    });

    // Build ID-to-Title lookup for tool calls (compact)
    const idLookup = displayNotes.map((n) => `${n.id}→"${n.title || 'Untitled'}"`).join('\n');

    return `CONTEXT: ${stats} | Space: ${currentSpace?.name || 'Personal'}* | Labels: ${labelNames}
SPACES: ${spacesLine}

NOTES (ID|Title|Type|Flags|Labels|Preview):
${noteLines.join('\n')}

ID_LOOKUP:
${idLookup}`;
  }, [notes, labels, spaces, currentSpaceId]);

  // Build full system prompt with context
  const fullSystemPrompt = useMemo(() => {
    return `${NOTES_SYSTEM_PROMPT}\n\n${notesContext}`;
  }, [notesContext]);

  // Initialize Grok assistant (fallback when streaming is disabled)
  const grokAssistant = useGrokAssistant({
    appName: 'notes',
    systemPrompt: fullSystemPrompt,
    context: {
      noteCount: notes.length,
      labelCount: labels.length,
    },
    onError,
    onFunctionCall: handleFunctionCall,
    enableTools: Boolean(mutations), // Only enable tools if mutations are provided
  });

  // Streaming send message handler
  const sendStreamingMessage = useCallback(
    async (content: string) => {
      if (isLoading || isStreaming) return;

      // Add user message
      const userMessage: Message = {
        id: generateUUID(),
        role: 'user',
        content,
        timestamp: Date.now(),
      };
      setStreamingMessages((prev) => [...prev, userMessage]);

      // Add placeholder assistant message for streaming
      const assistantId = generateUUID();
      const assistantMessage: Message = {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      };
      setStreamingMessages((prev) => [...prev, assistantMessage]);

      setIsLoading(true);
      setIsStreaming(true);

      try {
        // Build message history for Cloud Function
        const messageHistory = streamingMessages.map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));

        // Stream response from Cloud Function
        const controller = await streamLumiChat({
          query: content,
          systemPrompt: NOTES_SYSTEM_PROMPT,
          messageHistory,
          notesContext,
          onChunk: (chunk) => {
            // Append chunk to assistant message
            setStreamingMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantId
                  ? { ...msg, content: msg.content + chunk }
                  : msg
              )
            );
          },
          onToolCall: async (toolCall) => {
            // Execute tool call using the same handler as non-streaming mode
            const result = await handleFunctionCall(toolCall.name, toolCall.args);

            // Append tool result to the message
            const resultMessage = typeof result === 'object' && result !== null && 'message' in result
              ? String((result as { message: string }).message)
              : JSON.stringify(result);

            setStreamingMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantId
                  ? { ...msg, content: msg.content + `\n\n✓ ${resultMessage}` }
                  : msg
              )
            );

            return result;
          },
          onError: (error) => {
            console.error('[Notes AI] Streaming error:', error);
            onError?.(error);
            setStreamingMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantId
                  ? { ...msg, content: 'Sorry, an error occurred. Please try again.' }
                  : msg
              )
            );
          },
          onComplete: () => {
            setIsStreaming(false);
            setIsLoading(false);
          },
        });

        abortControllerRef.current = controller;
      } catch (error) {
        console.error('[Notes AI] Streaming request error:', error);
        onError?.(error instanceof Error ? error : new Error('Streaming failed'));
        setIsStreaming(false);
        setIsLoading(false);
      }
    },
    [isLoading, isStreaming, streamingMessages, notesContext, onError, handleFunctionCall]
  );

  // Cancel streaming request
  const cancelStreamingRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setIsLoading(false);
  }, []);

  // Clear streaming messages
  const clearStreamingMessages = useCallback(() => {
    setStreamingMessages([]);
    cancelStreamingRequest();
  }, [cancelStreamingRequest]);

  // Return streaming or Grok assistant based on mode
  if (enableStreaming) {
    return {
      messages: streamingMessages,
      loading: isLoading,
      streaming: isStreaming,
      sendMessage: sendStreamingMessage,
      cancelRequest: cancelStreamingRequest,
      clearMessages: clearStreamingMessages,
      notesContext,
      // Streaming mode uses Cloud Function with Gemini
      modelName: 'Gemini 2.0 Flash',
      modelProvider: 'streaming',
    };
  }

  // Fallback uses Gemini via API route (enableTools mode)
  // Note: useGrokAssistant name is legacy - it actually calls /api/ai/chat which uses Gemini
  return {
    messages: grokAssistant.messages,
    loading: grokAssistant.loading,
    streaming: grokAssistant.streaming,
    sendMessage: grokAssistant.sendMessage,
    cancelRequest: grokAssistant.cancelRequest,
    clearMessages: grokAssistant.clearMessages,
    notesContext,
    // Non-streaming mode uses Gemini with function calling
    modelName: 'Gemini 2.0 Flash',
    modelProvider: 'gemini',
  };
}
