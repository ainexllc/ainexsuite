import { getGeminiModel } from './gemini-client';
import {
  // Types
  type Note,
  type Space,
  type Label,
  type NoteColor,
  type NotePriority,
  type ChecklistItemPriority,
  // User Context
  getUserContext,
  // Spaces
  listSpaces,
  getCurrentSpace,
  // CRUD
  createNote,
  getNote,
  updateNote,
  deleteNote,
  // Search & List
  searchNotes,
  listNotes,
  advancedSearchNotes,
  findNoteByTitle,
  // Favorites
  pinNote,
  unpinNote,
  listFavorites,
  // Labels
  listLabels,
  addLabelToNote,
  removeLabelFromNote,
  listNotesByLabel,
  // Archive
  archiveNote,
  unarchiveNote,
  listArchivedNotes,
  // Checklist
  toggleChecklistItem,
  addChecklistItem,
  updateChecklistItem,
  removeChecklistItem,
  toggleAllChecklistItems,
  // Trash
  listTrashedNotes,
  restoreFromTrash,
  emptyTrash,
  // Move & Duplicate
  moveNoteToSpace,
  duplicateNote,
  // Color & Priority
  changeNoteColor,
  setNotePriority,
} from './notes-service';

// Analytics Service
import {
  getNoteStatistics,
  getProductivityInsights,
  getActivityTrends,
  getChecklistProgress,
  getLabelAnalytics,
  getSpaceComparison,
  getWeeklyDigest,
  getActivityHeatmap,
} from './analytics-service';

// Content Analysis Service
import {
  analyzeNoteSentiment,
  extractThemes,
  generateSummary,
  findSimilarNotes,
  extractKeywords,
  detectDuplicates,
} from './content-analysis-service';

// Suggestions Service
import {
  suggestLabels,
  predictPriority,
  suggestRelatedNotes,
  suggestNextActions,
  suggestOrganization,
} from './suggestions-service';

// Batch Operations Service
import {
  bulkUpdateNotes,
  bulkArchive,
  bulkDelete,
  bulkLabel,
  autoOrganize,
} from './batch-service';

// Writing Service
import {
  enhanceNote,
  expandNote,
  condenseNote,
  formatNote,
  translateNote,
  type EnhancementType,
  type ExpandStyle,
  type CondenseTarget,
  type FormatStyle,
} from './writing-service';

// Knowledge Service
import {
  getKnowledgeGraph,
  getTopicClusters,
  discoverInsights,
} from './knowledge-service';

// Planning Service
import {
  setDeadline,
  getUpcomingDeadlines,
  createReminder,
  type RecurringType,
} from './planning-service';

// Wellness Service
import {
  getMoodTrends,
  getEmotionalInsights,
  getWellnessRecommendations,
} from './wellness-service';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  name: string;
  args: Record<string, unknown>;
  result?: string;
}

interface FunctionCall {
  name: string;
  args: Record<string, unknown>;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Find a note by ID or title
 */
async function resolveNote(
  userId: string,
  noteId?: string,
  title?: string,
  spaceId?: string
): Promise<Note | null> {
  if (noteId) {
    return getNote(userId, noteId);
  }
  if (title) {
    return findNoteByTitle(userId, title, spaceId);
  }
  return null;
}

/**
 * Find a label by ID or name
 */
async function resolveLabel(
  userId: string,
  labelId?: string,
  labelName?: string
): Promise<Label | null> {
  if (labelId) {
    const labels = await listLabels(userId);
    return labels.find((l) => l.id === labelId) || null;
  }
  if (labelName) {
    const labels = await listLabels(userId);
    const nameLower = labelName.toLowerCase();
    return labels.find((l) => l.name.toLowerCase() === nameLower) || null;
  }
  return null;
}

/**
 * Find a space by ID or name
 */
async function resolveSpace(
  userId: string,
  spaceId?: string,
  spaceName?: string
): Promise<Space | null> {
  const spaces = await listSpaces(userId);

  if (spaceId) {
    return spaces.find((s) => s.id === spaceId) || null;
  }
  if (spaceName) {
    const nameLower = spaceName.toLowerCase();
    return spaces.find((s) => s.name.toLowerCase() === nameLower) || null;
  }
  return null;
}

/**
 * Find a checklist item by ID or text
 */
function resolveChecklistItem(
  note: Note,
  itemId?: string,
  itemText?: string
): { id: string; text: string } | null {
  if (itemId) {
    const item = note.checklist.find((i) => i.id === itemId);
    return item ? { id: item.id, text: item.text } : null;
  }
  if (itemText) {
    const textLower = itemText.toLowerCase();
    const item = note.checklist.find((i) => i.text.toLowerCase().includes(textLower));
    return item ? { id: item.id, text: item.text } : null;
  }
  return null;
}

/**
 * Format note for response
 */
function formatNoteForResponse(note: Note) {
  return {
    id: note.id,
    title: note.title,
    type: note.type,
    color: note.color,
    pinned: note.pinned,
    priority: note.priority,
    spaceId: note.spaceId,
    preview: note.body?.substring(0, 100) || '',
    checklistCount: note.checklist?.length || 0,
    checklistCompleted: note.checklist?.filter((i) => i.completed).length || 0,
  };
}

/**
 * Format notes list for response
 */
function formatNotesForResponse(notes: Note[]) {
  return notes.map(formatNoteForResponse);
}

// ============================================
// FUNCTION EXECUTOR
// ============================================

/**
 * Execute a function call and return the result
 */
async function executeFunction(userId: string, functionCall: FunctionCall): Promise<string> {
  const { name, args } = functionCall;

  try {
    switch (name) {
      // ---- USER CONTEXT ----
      case 'getUserContext': {
        const context = await getUserContext(userId);
        return JSON.stringify({
          success: true,
          spaces: context.spaces.map((s) => ({ id: s.id, name: s.name, type: s.type })),
          spaceCount: context.spaces.length,
          spaceNames: context.spaces.map((s) => s.name),
          hasMultipleSpaces: context.hasMultipleSpaces,
          currentSpace: {
            id: context.currentSpace.id,
            name: context.currentSpace.name,
            type: context.currentSpace.type,
          },
          noteCounts: context.noteCounts,
          // Provide a helpful message for the AI
          hint: context.hasMultipleSpaces
            ? `User belongs to ${context.spaces.length} spaces: ${context.spaces.map((s) => s.name).join(', ')}. Ask which space they want before listing or creating notes.`
            : 'User only has one space (Personal). No need to ask about spaces.',
        });
      }

      // ---- SPACES ----
      case 'listSpaces': {
        const spaces = await listSpaces(userId);
        return JSON.stringify({
          success: true,
          spaces: spaces.map((s) => ({ id: s.id, name: s.name, type: s.type })),
          count: spaces.length,
        });
      }

      case 'getCurrentSpace': {
        const space = await getCurrentSpace(userId);
        return JSON.stringify({
          success: true,
          space: space ? { id: space.id, name: space.name, type: space.type } : null,
        });
      }

      // ---- CREATE NOTE ----
      case 'createNote': {
        const noteId = await createNote(
          userId,
          {
            title: args.title as string,
            body: args.body as string | undefined,
            type: args.type as 'text' | 'checklist' | undefined,
            checklistItems: args.checklistItems as string[] | undefined,
            color: args.color as NoteColor | undefined,
            spaceId: args.spaceId as string | undefined,
            pinned: args.pinned as boolean | undefined,
            priority: args.priority as NotePriority | undefined,
          },
          args.spaceId as string | undefined
        );
        return JSON.stringify({
          success: true,
          noteId,
          message: `Created note "${args.title}"${args.pinned ? ' and pinned to favorites' : ''}`,
        });
      }

      // ---- SEARCH & LIST ----
      case 'searchNotes': {
        const notes = await searchNotes(
          userId,
          args.query as string,
          args.spaceId as string | undefined
        );
        return JSON.stringify({
          success: true,
          notes: formatNotesForResponse(notes),
          count: notes.length,
        });
      }

      case 'listNotes': {
        const limit = (args.limit as number) || 10;
        const notes = await listNotes(userId, limit, args.spaceId as string | undefined);
        return JSON.stringify({
          success: true,
          notes: formatNotesForResponse(notes),
          count: notes.length,
        });
      }

      case 'advancedSearch': {
        const notes = await advancedSearchNotes(userId, {
          query: args.query as string | undefined,
          spaceId: args.spaceId as string | undefined,
          color: args.color as NoteColor | undefined,
          type: args.type as 'text' | 'checklist' | undefined,
          pinned: args.pinned as boolean | undefined,
          priority: args.priority as NotePriority | undefined,
        });
        return JSON.stringify({
          success: true,
          notes: formatNotesForResponse(notes),
          count: notes.length,
        });
      }

      // ---- UPDATE NOTE ----
      case 'updateNote': {
        const note = await resolveNote(
          userId,
          args.noteId as string | undefined,
          args.title as string | undefined
        );
        if (!note) {
          return JSON.stringify({
            success: false,
            message: `Could not find note${args.title ? ` with title "${args.title}"` : ''}`,
          });
        }

        const updates: Record<string, unknown> = {};
        if (args.newTitle) updates.title = args.newTitle;
        if (args.newBody) updates.body = args.newBody;
        if (args.color) updates.color = args.color;
        if (args.priority) updates.priority = args.priority;

        await updateNote(userId, note.id, updates);
        return JSON.stringify({
          success: true,
          message: `Updated note "${note.title}"`,
        });
      }

      case 'changeNoteColor': {
        const note = await resolveNote(
          userId,
          args.noteId as string | undefined,
          args.title as string | undefined
        );
        if (!note) {
          return JSON.stringify({
            success: false,
            message: `Could not find note${args.title ? ` with title "${args.title}"` : ''}`,
          });
        }

        await changeNoteColor(userId, note.id, args.color as NoteColor);
        return JSON.stringify({
          success: true,
          message: `Changed color of "${note.title}" to ${args.color}`,
        });
      }

      case 'setNotePriority': {
        const note = await resolveNote(
          userId,
          args.noteId as string | undefined,
          args.title as string | undefined
        );
        if (!note) {
          return JSON.stringify({
            success: false,
            message: `Could not find note${args.title ? ` with title "${args.title}"` : ''}`,
          });
        }

        await setNotePriority(userId, note.id, args.priority as NotePriority);
        return JSON.stringify({
          success: true,
          message: `Set priority of "${note.title}" to ${args.priority}`,
        });
      }

      // ---- DELETE ----
      case 'deleteNote': {
        const note = await resolveNote(
          userId,
          args.noteId as string | undefined,
          args.title as string | undefined
        );
        if (!note) {
          return JSON.stringify({
            success: false,
            message: `Could not find note${args.title ? ` with title "${args.title}"` : ''}`,
          });
        }

        await deleteNote(userId, note.id);
        return JSON.stringify({
          success: true,
          message: `Moved "${note.title}" to trash`,
        });
      }

      // ---- FAVORITES / PINNING ----
      case 'pinNote': {
        const note = await resolveNote(
          userId,
          args.noteId as string | undefined,
          args.title as string | undefined
        );
        if (!note) {
          return JSON.stringify({
            success: false,
            message: `Could not find note${args.title ? ` with title "${args.title}"` : ''}`,
          });
        }

        await pinNote(userId, note.id);
        return JSON.stringify({
          success: true,
          message: `Pinned "${note.title}" to favorites`,
        });
      }

      case 'unpinNote': {
        const note = await resolveNote(
          userId,
          args.noteId as string | undefined,
          args.title as string | undefined
        );
        if (!note) {
          return JSON.stringify({
            success: false,
            message: `Could not find note${args.title ? ` with title "${args.title}"` : ''}`,
          });
        }

        await unpinNote(userId, note.id);
        return JSON.stringify({
          success: true,
          message: `Removed "${note.title}" from favorites`,
        });
      }

      case 'listFavorites': {
        const notes = await listFavorites(userId, args.spaceId as string | undefined);
        return JSON.stringify({
          success: true,
          notes: formatNotesForResponse(notes),
          count: notes.length,
        });
      }

      // ---- LABELS ----
      case 'listLabels': {
        const labels = await listLabels(userId);
        return JSON.stringify({
          success: true,
          labels: labels.map((l) => ({ id: l.id, name: l.name, color: l.color })),
          count: labels.length,
        });
      }

      case 'addLabelToNote': {
        const note = await resolveNote(
          userId,
          args.noteId as string | undefined,
          args.title as string | undefined
        );
        if (!note) {
          return JSON.stringify({
            success: false,
            message: `Could not find note${args.title ? ` with title "${args.title}"` : ''}`,
          });
        }

        const label = await resolveLabel(
          userId,
          args.labelId as string | undefined,
          args.labelName as string | undefined
        );
        if (!label) {
          return JSON.stringify({
            success: false,
            message: `Could not find label${args.labelName ? ` named "${args.labelName}"` : ''}`,
          });
        }

        await addLabelToNote(userId, note.id, label.id);
        return JSON.stringify({
          success: true,
          message: `Added label "${label.name}" to "${note.title}"`,
        });
      }

      case 'removeLabelFromNote': {
        const note = await resolveNote(
          userId,
          args.noteId as string | undefined,
          args.title as string | undefined
        );
        if (!note) {
          return JSON.stringify({
            success: false,
            message: `Could not find note${args.title ? ` with title "${args.title}"` : ''}`,
          });
        }

        const label = await resolveLabel(
          userId,
          args.labelId as string | undefined,
          args.labelName as string | undefined
        );
        if (!label) {
          return JSON.stringify({
            success: false,
            message: `Could not find label${args.labelName ? ` named "${args.labelName}"` : ''}`,
          });
        }

        await removeLabelFromNote(userId, note.id, label.id);
        return JSON.stringify({
          success: true,
          message: `Removed label "${label.name}" from "${note.title}"`,
        });
      }

      case 'listNotesByLabel': {
        const label = await resolveLabel(
          userId,
          args.labelId as string | undefined,
          args.labelName as string | undefined
        );
        if (!label) {
          return JSON.stringify({
            success: false,
            message: `Could not find label${args.labelName ? ` named "${args.labelName}"` : ''}`,
          });
        }

        const notes = await listNotesByLabel(userId, label.id);
        return JSON.stringify({
          success: true,
          label: { id: label.id, name: label.name },
          notes: formatNotesForResponse(notes),
          count: notes.length,
        });
      }

      // ---- ARCHIVE ----
      case 'archiveNote': {
        const note = await resolveNote(
          userId,
          args.noteId as string | undefined,
          args.title as string | undefined
        );
        if (!note) {
          return JSON.stringify({
            success: false,
            message: `Could not find note${args.title ? ` with title "${args.title}"` : ''}`,
          });
        }

        await archiveNote(userId, note.id);
        return JSON.stringify({
          success: true,
          message: `Archived "${note.title}"`,
        });
      }

      case 'unarchiveNote': {
        const note = await resolveNote(
          userId,
          args.noteId as string | undefined,
          args.title as string | undefined
        );
        if (!note) {
          return JSON.stringify({
            success: false,
            message: `Could not find note${args.title ? ` with title "${args.title}"` : ''}`,
          });
        }

        await unarchiveNote(userId, note.id);
        return JSON.stringify({
          success: true,
          message: `Unarchived "${note.title}"`,
        });
      }

      case 'listArchivedNotes': {
        const notes = await listArchivedNotes(userId, args.spaceId as string | undefined);
        return JSON.stringify({
          success: true,
          notes: formatNotesForResponse(notes),
          count: notes.length,
        });
      }

      // ---- CHECKLIST OPERATIONS ----
      case 'toggleChecklistItem': {
        const note = await resolveNote(
          userId,
          args.noteId as string | undefined,
          args.noteTitle as string | undefined
        );
        if (!note) {
          return JSON.stringify({
            success: false,
            message: `Could not find checklist${args.noteTitle ? ` with title "${args.noteTitle}"` : ''}`,
          });
        }

        if (note.type !== 'checklist') {
          return JSON.stringify({
            success: false,
            message: `"${note.title}" is not a checklist`,
          });
        }

        const item = resolveChecklistItem(
          note,
          args.itemId as string | undefined,
          args.itemText as string | undefined
        );
        if (!item) {
          return JSON.stringify({
            success: false,
            message: `Could not find item${args.itemText ? ` matching "${args.itemText}"` : ''}`,
          });
        }

        await toggleChecklistItem(userId, note.id, item.id);
        return JSON.stringify({
          success: true,
          message: `Toggled "${item.text}" in "${note.title}"`,
        });
      }

      case 'addChecklistItem': {
        const note = await resolveNote(
          userId,
          args.noteId as string | undefined,
          args.noteTitle as string | undefined
        );
        if (!note) {
          return JSON.stringify({
            success: false,
            message: `Could not find checklist${args.noteTitle ? ` with title "${args.noteTitle}"` : ''}`,
          });
        }

        if (note.type !== 'checklist') {
          return JSON.stringify({
            success: false,
            message: `"${note.title}" is not a checklist`,
          });
        }

        const itemId = await addChecklistItem(userId, note.id, args.text as string, {
          priority: args.priority as ChecklistItemPriority | undefined,
          dueDate: args.dueDate as string | undefined,
        });
        return JSON.stringify({
          success: true,
          itemId,
          message: `Added "${args.text}" to "${note.title}"`,
        });
      }

      case 'updateChecklistItem': {
        const note = await resolveNote(
          userId,
          args.noteId as string | undefined,
          args.noteTitle as string | undefined
        );
        if (!note) {
          return JSON.stringify({
            success: false,
            message: `Could not find checklist${args.noteTitle ? ` with title "${args.noteTitle}"` : ''}`,
          });
        }

        if (note.type !== 'checklist') {
          return JSON.stringify({
            success: false,
            message: `"${note.title}" is not a checklist`,
          });
        }

        const item = resolveChecklistItem(
          note,
          args.itemId as string | undefined,
          args.itemText as string | undefined
        );
        if (!item) {
          return JSON.stringify({
            success: false,
            message: `Could not find item${args.itemText ? ` matching "${args.itemText}"` : ''}`,
          });
        }

        await updateChecklistItem(userId, note.id, item.id, {
          text: args.newText as string | undefined,
          priority: args.priority as ChecklistItemPriority | undefined,
          dueDate: args.dueDate as string | undefined,
        });
        return JSON.stringify({
          success: true,
          message: `Updated "${item.text}" in "${note.title}"`,
        });
      }

      case 'removeChecklistItem': {
        const note = await resolveNote(
          userId,
          args.noteId as string | undefined,
          args.noteTitle as string | undefined
        );
        if (!note) {
          return JSON.stringify({
            success: false,
            message: `Could not find checklist${args.noteTitle ? ` with title "${args.noteTitle}"` : ''}`,
          });
        }

        if (note.type !== 'checklist') {
          return JSON.stringify({
            success: false,
            message: `"${note.title}" is not a checklist`,
          });
        }

        const item = resolveChecklistItem(
          note,
          args.itemId as string | undefined,
          args.itemText as string | undefined
        );
        if (!item) {
          return JSON.stringify({
            success: false,
            message: `Could not find item${args.itemText ? ` matching "${args.itemText}"` : ''}`,
          });
        }

        await removeChecklistItem(userId, note.id, item.id);
        return JSON.stringify({
          success: true,
          message: `Removed "${item.text}" from "${note.title}"`,
        });
      }

      case 'toggleAllChecklistItems': {
        const note = await resolveNote(
          userId,
          args.noteId as string | undefined,
          args.noteTitle as string | undefined
        );
        if (!note) {
          return JSON.stringify({
            success: false,
            message: `Could not find checklist${args.noteTitle ? ` with title "${args.noteTitle}"` : ''}`,
          });
        }

        if (note.type !== 'checklist') {
          return JSON.stringify({
            success: false,
            message: `"${note.title}" is not a checklist`,
          });
        }

        await toggleAllChecklistItems(userId, note.id, args.completed as boolean);
        return JSON.stringify({
          success: true,
          message: `Marked all items in "${note.title}" as ${args.completed ? 'complete' : 'incomplete'}`,
        });
      }

      // ---- TRASH OPERATIONS ----
      case 'listTrashedNotes': {
        const notes = await listTrashedNotes(userId);
        return JSON.stringify({
          success: true,
          notes: notes.map((n) => ({
            id: n.id,
            title: n.title,
            type: n.type,
            deletedAt: n.deletedAt?.toISOString(),
          })),
          count: notes.length,
        });
      }

      case 'restoreFromTrash': {
        // For trash, we need to search in trashed notes
        const trashedNotes = await listTrashedNotes(userId);

        let noteToRestore: Note | undefined;
        if (args.noteId) {
          noteToRestore = trashedNotes.find((n) => n.id === args.noteId);
        } else if (args.title) {
          const titleLower = (args.title as string).toLowerCase();
          noteToRestore = trashedNotes.find((n) => n.title.toLowerCase().includes(titleLower));
        }

        if (!noteToRestore) {
          return JSON.stringify({
            success: false,
            message: `Could not find note in trash${args.title ? ` with title "${args.title}"` : ''}`,
          });
        }

        await restoreFromTrash(userId, noteToRestore.id);
        return JSON.stringify({
          success: true,
          message: `Restored "${noteToRestore.title}" from trash`,
        });
      }

      case 'emptyTrash': {
        const count = await emptyTrash(userId);
        return JSON.stringify({
          success: true,
          message: `Permanently deleted ${count} note${count === 1 ? '' : 's'} from trash`,
          count,
        });
      }

      // ---- MOVE & DUPLICATE ----
      case 'moveNoteToSpace': {
        const note = await resolveNote(
          userId,
          args.noteId as string | undefined,
          args.title as string | undefined
        );
        if (!note) {
          return JSON.stringify({
            success: false,
            message: `Could not find note${args.title ? ` with title "${args.title}"` : ''}`,
          });
        }

        let targetSpaceId = args.newSpaceId as string | undefined;
        if (!targetSpaceId && args.spaceName) {
          const space = await resolveSpace(userId, undefined, args.spaceName as string);
          if (!space) {
            return JSON.stringify({
              success: false,
              message: `Could not find space named "${args.spaceName}"`,
            });
          }
          targetSpaceId = space.id;
        }

        if (!targetSpaceId) {
          return JSON.stringify({
            success: false,
            message: 'No destination space specified',
          });
        }

        await moveNoteToSpace(userId, note.id, targetSpaceId);
        return JSON.stringify({
          success: true,
          message: `Moved "${note.title}" to space`,
        });
      }

      case 'duplicateNote': {
        const note = await resolveNote(
          userId,
          args.noteId as string | undefined,
          args.title as string | undefined
        );
        if (!note) {
          return JSON.stringify({
            success: false,
            message: `Could not find note${args.title ? ` with title "${args.title}"` : ''}`,
          });
        }

        const newNoteId = await duplicateNote(userId, note.id);
        return JSON.stringify({
          success: true,
          noteId: newNoteId,
          message: `Created copy of "${note.title}"`,
        });
      }

      // ============================================
      // ANALYTICS & INSIGHTS
      // ============================================
      case 'getNoteStatistics': {
        const stats = await getNoteStatistics(
          userId,
          args.spaceId as string | undefined,
          (args.period as string) || 'all'
        );
        return JSON.stringify({ success: true, ...stats });
      }

      case 'getProductivityInsights': {
        const insights = await getProductivityInsights(
          userId,
          (args.period as string) || 'month'
        );
        return JSON.stringify({ success: true, ...insights });
      }

      case 'getActivityTrends': {
        const trends = await getActivityTrends(
          userId,
          (args.period as string) || 'month',
          args.spaceId as string | undefined
        );
        return JSON.stringify({ success: true, ...trends });
      }

      case 'getChecklistProgress': {
        let noteId = args.noteId as string | undefined;
        if (!noteId && args.noteTitle) {
          const note = await resolveNote(userId, undefined, args.noteTitle as string);
          noteId = note?.id;
        }
        const progress = await getChecklistProgress(
          userId,
          noteId,
          args.spaceId as string | undefined
        );
        return JSON.stringify({ success: true, ...progress });
      }

      case 'getLabelAnalytics': {
        const analytics = await getLabelAnalytics(
          userId,
          args.spaceId as string | undefined
        );
        return JSON.stringify({ success: true, ...analytics });
      }

      case 'getSpaceComparison': {
        const comparison = await getSpaceComparison(userId);
        return JSON.stringify({ success: true, ...comparison });
      }

      case 'getWeeklyDigest': {
        const digest = await getWeeklyDigest(
          userId,
          args.spaceId as string | undefined
        );
        return JSON.stringify({ success: true, ...digest });
      }

      case 'getActivityHeatmap': {
        const heatmap = await getActivityHeatmap(
          userId,
          (args.period as string) || 'month'
        );
        return JSON.stringify({ success: true, ...heatmap });
      }

      // ============================================
      // CONTENT ANALYSIS
      // ============================================
      case 'analyzeNoteSentiment': {
        let noteId = args.noteId as string | undefined;
        if (!noteId && args.noteTitle) {
          const note = await resolveNote(userId, undefined, args.noteTitle as string);
          noteId = note?.id;
        }
        // If analyzeRecent is true or no noteId is provided, analyze recent notes
        const noteIdOrAnalyzeRecent: string = args.analyzeRecent || !noteId ? 'analyzeRecent' : noteId;
        const sentiment = await analyzeNoteSentiment(
          userId,
          noteIdOrAnalyzeRecent,
          args.limit as number | undefined
        );
        return JSON.stringify({ success: true, ...sentiment });
      }

      case 'extractThemes': {
        const themes = await extractThemes(
          userId,
          args.spaceId as string | undefined,
          args.limit as number | undefined
        );
        return JSON.stringify({ success: true, ...themes });
      }

      case 'generateSummary': {
        let noteId = args.noteId as string | undefined;
        if (!noteId && args.noteTitle) {
          const note = await resolveNote(userId, undefined, args.noteTitle as string);
          noteId = note?.id;
        }
        const noteIdOrSummarizeRecent: string = args.summarizeRecent || !noteId ? 'summarizeRecent' : noteId;
        const style = args.style as string | undefined;
        const summaryStyle = style === 'detailed' ? 'detailed' : style === 'bullet-points' || style === 'bullets' ? 'bullet-points' : 'brief';
        const summary = await generateSummary(
          userId,
          noteIdOrSummarizeRecent,
          args.limit as number | undefined,
          summaryStyle
        );
        return JSON.stringify({ success: true, ...summary });
      }

      case 'findSimilarNotes': {
        let noteId = args.noteId as string | undefined;
        if (!noteId && args.noteTitle) {
          const note = await resolveNote(userId, undefined, args.noteTitle as string);
          noteId = note?.id;
        }
        if (!noteId) {
          return JSON.stringify({
            success: false,
            message: 'Please specify a note to find similar notes for',
          });
        }
        const similar = await findSimilarNotes(
          userId,
          noteId,
          args.threshold as number | undefined
        );
        return JSON.stringify({ success: true, ...similar });
      }

      case 'extractKeywords': {
        let noteId = args.noteId as string | undefined;
        if (!noteId && args.noteTitle) {
          const note = await resolveNote(userId, undefined, args.noteTitle as string);
          noteId = note?.id;
        }
        const noteIdOrExtractFromRecent: string = args.extractFromRecent || !noteId ? 'extractFromRecent' : noteId;
        const keywords = await extractKeywords(
          userId,
          noteIdOrExtractFromRecent,
          args.limit as number | undefined
        );
        return JSON.stringify({ success: true, ...keywords });
      }

      case 'detectDuplicates': {
        const duplicates = await detectDuplicates(
          userId,
          args.spaceId as string | undefined,
          args.threshold as number | undefined
        );
        return JSON.stringify({ success: true, ...duplicates });
      }

      // ============================================
      // SMART SUGGESTIONS
      // ============================================
      case 'suggestLabels': {
        let noteId = args.noteId as string | undefined;
        if (!noteId && args.noteTitle) {
          const note = await resolveNote(userId, undefined, args.noteTitle as string);
          noteId = note?.id;
        }
        if (!noteId) {
          return JSON.stringify({
            success: false,
            message: 'Please specify a note to suggest labels for',
          });
        }
        const suggestions = await suggestLabels(
          userId,
          noteId,
          args.createMissing as boolean | undefined
        );
        return JSON.stringify({ success: true, ...suggestions });
      }

      case 'predictPriority': {
        let noteId = args.noteId as string | undefined;
        if (!noteId && args.noteTitle) {
          const note = await resolveNote(userId, undefined, args.noteTitle as string);
          noteId = note?.id;
        }
        if (!noteId) {
          return JSON.stringify({
            success: false,
            message: 'Please specify a note to predict priority for',
          });
        }
        const prediction = await predictPriority(userId, noteId);
        return JSON.stringify({ success: true, ...prediction });
      }

      case 'suggestRelatedNotes': {
        let noteId = args.noteId as string | undefined;
        if (!noteId && args.noteTitle) {
          const note = await resolveNote(userId, undefined, args.noteTitle as string);
          noteId = note?.id;
        }
        if (!noteId) {
          return JSON.stringify({
            success: false,
            message: 'Please specify a note to find related notes for',
          });
        }
        const related = await suggestRelatedNotes(userId, noteId);
        return JSON.stringify({ success: true, ...related });
      }

      case 'suggestNextActions': {
        let noteId = args.noteId as string | undefined;
        if (!noteId && args.noteTitle) {
          const note = await resolveNote(userId, undefined, args.noteTitle as string);
          noteId = note?.id;
        }
        if (!noteId) {
          return JSON.stringify({
            success: false,
            message: 'Please specify a note to suggest actions for',
          });
        }
        const actions = await suggestNextActions(userId, noteId);
        return JSON.stringify({ success: true, ...actions });
      }

      case 'suggestOrganization': {
        const suggestions = await suggestOrganization(
          userId,
          args.spaceId as string | undefined
        );
        return JSON.stringify({ success: true, ...suggestions });
      }

      // ============================================
      // BATCH OPERATIONS
      // ============================================
      case 'bulkUpdateNotes': {
        const criteria = {
          noteIds: args.noteIds as string[] | undefined,
          searchQuery: args.searchQuery as string | undefined,
        };
        const updates = {
          color: args.color as NoteColor | undefined,
          priority: args.priority as NotePriority | undefined,
          spaceId: args.spaceId as string | undefined,
        };
        const result = await bulkUpdateNotes(userId, criteria, updates);
        return JSON.stringify(result);
      }

      case 'bulkArchive': {
        const result = await bulkArchive(userId, {
          noteIds: args.noteIds as string[] | undefined,
          olderThanDays: args.olderThanDays as number | undefined,
          color: args.color as NoteColor | undefined,
          spaceId: args.spaceId as string | undefined,
        });
        return JSON.stringify(result);
      }

      case 'bulkDelete': {
        const result = await bulkDelete(userId, {
          noteIds: args.noteIds as string[] | undefined,
          olderThanDays: args.olderThanDays as number | undefined,
        });
        return JSON.stringify(result);
      }

      case 'bulkLabel': {
        const result = await bulkLabel(userId, {
          noteIds: args.noteIds as string[] | undefined,
          searchQuery: args.searchQuery as string | undefined,
          addLabels: (args.addLabels as string[]) || [],
          removeLabels: (args.removeLabels as string[]) || [],
        });
        return JSON.stringify(result);
      }

      case 'autoOrganize': {
        const validActions = ['auto-label', 'auto-priority', 'archive-old', 'detect-duplicates', 'color-by-type', 'merge-similar'] as const;
        const requestedActions = (args.actions as string[]) || ['auto-label', 'auto-priority'];
        const filteredActions = requestedActions.filter((a): a is typeof validActions[number] =>
          (validActions as readonly string[]).includes(a)
        );
        const result = await autoOrganize(userId, {
          spaceId: args.spaceId as string | undefined,
          actions: filteredActions,
          dryRun: args.dryRun !== false, // Default to true for safety
        });
        return JSON.stringify(result);
      }

      // ============================================
      // WRITING ASSISTANCE
      // ============================================
      case 'enhanceNote': {
        let noteId = args.noteId as string | undefined;
        if (!noteId && args.noteTitle) {
          const note = await resolveNote(userId, undefined, args.noteTitle as string);
          noteId = note?.id;
        }
        if (!noteId) {
          return JSON.stringify({
            success: false,
            message: 'Please specify a note to enhance',
          });
        }
        const result = await enhanceNote(
          userId,
          noteId,
          (args.enhancementType as EnhancementType) || 'grammar',
          args.applyChanges as boolean | undefined
        );
        return JSON.stringify({ success: true, ...result });
      }

      case 'expandNote': {
        let noteId = args.noteId as string | undefined;
        if (!noteId && args.noteTitle) {
          const note = await resolveNote(userId, undefined, args.noteTitle as string);
          noteId = note?.id;
        }
        if (!noteId) {
          return JSON.stringify({
            success: false,
            message: 'Please specify a note to expand',
          });
        }
        const result = await expandNote(
          userId,
          noteId,
          args.focus as string | undefined,
          args.style as ExpandStyle | undefined,
          args.applyChanges as boolean | undefined
        );
        return JSON.stringify({ success: true, ...result });
      }

      case 'condenseNote': {
        let noteId = args.noteId as string | undefined;
        if (!noteId && args.noteTitle) {
          const note = await resolveNote(userId, undefined, args.noteTitle as string);
          noteId = note?.id;
        }
        if (!noteId) {
          return JSON.stringify({
            success: false,
            message: 'Please specify a note to condense',
          });
        }
        const result = await condenseNote(
          userId,
          noteId,
          (args.targetLength as CondenseTarget) || 'brief',
          args.applyChanges as boolean | undefined
        );
        return JSON.stringify({ success: true, ...result });
      }

      case 'formatNote': {
        let noteId = args.noteId as string | undefined;
        if (!noteId && args.noteTitle) {
          const note = await resolveNote(userId, undefined, args.noteTitle as string);
          noteId = note?.id;
        }
        if (!noteId) {
          return JSON.stringify({
            success: false,
            message: 'Please specify a note to format',
          });
        }
        const result = await formatNote(
          userId,
          noteId,
          (args.formatStyle as FormatStyle) || 'sections',
          args.applyChanges as boolean | undefined
        );
        return JSON.stringify({ success: true, ...result });
      }

      case 'translateNote': {
        let noteId = args.noteId as string | undefined;
        if (!noteId && args.noteTitle) {
          const note = await resolveNote(userId, undefined, args.noteTitle as string);
          noteId = note?.id;
        }
        if (!noteId) {
          return JSON.stringify({
            success: false,
            message: 'Please specify a note to translate',
          });
        }
        const result = await translateNote(
          userId,
          noteId,
          args.targetLanguage as string,
          args.replaceOriginal as boolean | undefined
        );
        return JSON.stringify({ success: true, ...result });
      }

      // ============================================
      // KNOWLEDGE GRAPH
      // ============================================
      case 'getKnowledgeGraph': {
        let centerNoteId = args.centerNoteId as string | undefined;
        if (!centerNoteId && args.centerNoteTitle) {
          const note = await resolveNote(userId, undefined, args.centerNoteTitle as string);
          centerNoteId = note?.id;
        }
        const graph = await getKnowledgeGraph(
          userId,
          args.spaceId as string | undefined,
          centerNoteId,
          args.depth as number | undefined
        );
        return JSON.stringify({ success: true, ...graph });
      }

      case 'getTopicClusters': {
        const clusters = await getTopicClusters(
          userId,
          args.spaceId as string | undefined,
          args.maxClusters as number | undefined
        );
        return JSON.stringify({ success: true, ...clusters });
      }

      case 'discoverInsights': {
        const insights = await discoverInsights(
          userId,
          args.spaceId as string | undefined
        );
        return JSON.stringify({ success: true, ...insights });
      }

      // ============================================
      // PLANNING TOOLS
      // ============================================
      case 'setDeadline': {
        let noteId = args.noteId as string | undefined;
        if (!noteId && args.noteTitle) {
          const note = await resolveNote(userId, undefined, args.noteTitle as string);
          noteId = note?.id;
        }
        if (!noteId) {
          return JSON.stringify({
            success: false,
            message: 'Please specify a note to set a deadline for',
          });
        }
        const result = await setDeadline(
          userId,
          noteId,
          (args.itemId as string | undefined) || null,
          args.deadline as string
        );
        return JSON.stringify({ success: true, ...result });
      }

      case 'getUpcomingDeadlines': {
        const deadlines = await getUpcomingDeadlines(
          userId,
          args.spaceId as string | undefined,
          args.days as number | undefined,
          args.includeOverdue !== false
        );
        return JSON.stringify({ success: true, ...deadlines });
      }

      case 'createReminder': {
        let noteId = args.noteId as string | undefined;
        if (!noteId && args.noteTitle) {
          const note = await resolveNote(userId, undefined, args.noteTitle as string);
          noteId = note?.id;
        }
        if (!noteId) {
          return JSON.stringify({
            success: false,
            message: 'Please specify a note to set a reminder for',
          });
        }
        const result = await createReminder(
          userId,
          noteId,
          args.reminderTime as string,
          args.recurring as RecurringType | undefined
        );
        return JSON.stringify({ success: true, ...result });
      }

      // ============================================
      // WELLNESS INSIGHTS
      // ============================================
      case 'getMoodTrends': {
        const trends = await getMoodTrends(
          userId,
          (args.period as 'week' | 'month' | 'quarter') || 'month',
          args.spaceId as string | undefined
        );
        return JSON.stringify({ success: true, ...trends });
      }

      case 'getEmotionalInsights': {
        const insights = await getEmotionalInsights(
          userId,
          args.spaceId as string | undefined
        );
        return JSON.stringify({ success: true, ...insights });
      }

      case 'getWellnessRecommendations': {
        const recommendations = await getWellnessRecommendations(userId);
        return JSON.stringify({ success: true, ...recommendations });
      }

      default:
        return JSON.stringify({
          success: false,
          message: `Unknown function: ${name}`,
        });
    }
  } catch (error) {
    console.error(`Error executing function ${name}:`, error);
    return JSON.stringify({
      success: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
}

// ============================================
// MAIN CHAT FUNCTION
// ============================================

/**
 * Send a message and get a response from Gemini
 */
export async function sendMessage(
  userId: string,
  message: string,
  history: ChatMessage[]
): Promise<{ response: string; toolCalls: ToolCall[] }> {
  const model = getGeminiModel();

  // Build chat history for context
  const chatHistory = history.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }));

  // Start chat with history
  const chat = model.startChat({
    history: chatHistory as Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>,
  });

  // Send the message
  const result = await chat.sendMessage(message);
  const response = result.response;

  const toolCalls: ToolCall[] = [];

  // Check for function calls
  const functionCalls = response.functionCalls();

  if (functionCalls && functionCalls.length > 0) {
    // Execute all function calls
    for (const fc of functionCalls) {
      const functionResult = await executeFunction(userId, {
        name: fc.name,
        args: fc.args as Record<string, unknown>,
      });

      toolCalls.push({
        name: fc.name,
        args: fc.args as Record<string, unknown>,
        result: functionResult,
      });
    }

    // Send function results back to get natural language response
    const functionResponses = toolCalls.map((tc) => ({
      functionResponse: {
        name: tc.name,
        response: JSON.parse(tc.result || '{}'),
      },
    }));

    const followUp = await chat.sendMessage(functionResponses);
    const finalText = followUp.response.text();

    return { response: finalText, toolCalls };
  }

  // No function calls, just return the text response
  return { response: response.text(), toolCalls: [] };
}

/**
 * Generate a unique message ID
 */
export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
