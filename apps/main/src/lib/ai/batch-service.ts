import { db } from '@ainexsuite/firebase';
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import type {
  Note,
  NoteColor,
  NotePriority,
  ChecklistItem,
} from './notes-service';
import { listLabels, searchNotes } from './notes-service';

// ============================================
// TYPES
// ============================================

export interface BulkUpdateCriteria {
  noteIds?: string[];
  searchQuery?: string;
  spaceId?: string;
  color?: NoteColor;
  labelId?: string;
  priority?: NotePriority;
  type?: 'text' | 'checklist';
  archived?: boolean;
  pinned?: boolean;
}

export interface BulkUpdateInput {
  color?: NoteColor;
  priority?: NotePriority;
  spaceId?: string;
  pinned?: boolean;
  archived?: boolean;
  labelIds?: string[];
}

export interface BulkOperationResult {
  success: boolean;
  updatedCount: number;
  noteIds: string[];
  skipped: Array<{ noteId: string; reason: string }>;
  errors: Array<{ noteId: string; error: string }>;
}

export interface BulkArchiveCriteria {
  noteIds?: string[];
  olderThanDays?: number;
  color?: NoteColor;
  labelId?: string;
  spaceId?: string;
  priority?: NotePriority;
  type?: 'text' | 'checklist';
}

export interface BulkLabelInput {
  noteIds?: string[];
  searchQuery?: string;
  spaceId?: string;
  addLabels: string[];
  removeLabels: string[];
}

export interface BulkLabelResult {
  success: boolean;
  updatedCount: number;
  noteIds: string[];
  labelsAdded: Record<string, number>;
  labelsRemoved: Record<string, number>;
  skipped: Array<{ noteId: string; reason: string }>;
}

export type AutoOrganizeAction =
  | 'auto-label'
  | 'auto-priority'
  | 'archive-old'
  | 'detect-duplicates'
  | 'color-by-type'
  | 'merge-similar';

export interface AutoOrganizeInput {
  spaceId?: string;
  actions: AutoOrganizeAction[];
  dryRun?: boolean;
  options?: {
    archiveOlderThanDays?: number;
    duplicateThreshold?: number;
    autoLabelKeywords?: Record<string, string[]>;
  };
}

export interface AutoOrganizeChange {
  action: AutoOrganizeAction;
  noteId: string;
  noteTitle: string;
  description: string;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
}

export interface AutoOrganizeResult {
  success: boolean;
  dryRun: boolean;
  totalChanges: number;
  changes: AutoOrganizeChange[];
  actionSummary: Record<AutoOrganizeAction, number>;
  duplicatesFound: Array<{
    noteIds: string[];
    titles: string[];
    similarity: number;
  }>;
  recommendations: string[];
}

// ============================================
// HELPERS
// ============================================

function mapNoteDoc(docSnapshot: { id: string; data: () => Record<string, unknown> }): Note {
  const data = docSnapshot.data();
  return {
    id: docSnapshot.id,
    ownerId: (data.ownerId as string) || '',
    spaceId: (data.spaceId as string) || 'personal',
    title: (data.title as string) || '',
    body: (data.body as string) || '',
    type: (data.type as 'text' | 'checklist') || 'text',
    checklist: (data.checklist as ChecklistItem[]) || [],
    color: (data.color as NoteColor) || 'default',
    pinned: (data.pinned as boolean) || false,
    archived: (data.archived as boolean) || false,
    priority: (data.priority as NotePriority) || null,
    labelIds: (data.labelIds as string[]) || [],
    createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
    deletedAt: (data.deletedAt as Timestamp)?.toDate() || null,
  };
}

async function getAllNotes(
  userId: string,
  includeArchived = false,
  includeDeleted = false
): Promise<Note[]> {
  const notesRef = collection(db, 'users', userId, 'notes');
  const q = query(notesRef, orderBy('createdAt', 'desc'), limit(500));
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((docSnapshot) => mapNoteDoc({ id: docSnapshot.id, data: () => docSnapshot.data() }))
    .filter((note) => {
      if (!includeDeleted && note.deletedAt) return false;
      if (!includeArchived && note.archived) return false;
      return true;
    });
}

async function getNotesByIds(userId: string, noteIds: string[]): Promise<Note[]> {
  const allNotes = await getAllNotes(userId, true, false);
  return allNotes.filter((note) => noteIds.includes(note.id));
}

async function getNotesByCriteria(
  userId: string,
  criteria: BulkUpdateCriteria | BulkArchiveCriteria
): Promise<Note[]> {
  // If specific noteIds provided, fetch those
  if (criteria.noteIds && criteria.noteIds.length > 0) {
    return getNotesByIds(userId, criteria.noteIds);
  }

  // If search query provided, use search
  if ('searchQuery' in criteria && criteria.searchQuery) {
    return searchNotes(userId, criteria.searchQuery, criteria.spaceId);
  }

  // Otherwise, filter from all notes
  let notes = await getAllNotes(userId, true, false);

  if (criteria.spaceId) {
    notes = notes.filter((n) => n.spaceId === criteria.spaceId);
  }

  if (criteria.color) {
    notes = notes.filter((n) => n.color === criteria.color);
  }

  if (criteria.labelId) {
    notes = notes.filter((n) => n.labelIds.includes(criteria.labelId!));
  }

  if (criteria.priority !== undefined) {
    notes = notes.filter((n) => n.priority === criteria.priority);
  }

  if (criteria.type) {
    notes = notes.filter((n) => n.type === criteria.type);
  }

  if ('archived' in criteria && criteria.archived !== undefined) {
    notes = notes.filter((n) => n.archived === criteria.archived);
  }

  if ('pinned' in criteria && criteria.pinned !== undefined) {
    notes = notes.filter((n) => n.pinned === criteria.pinned);
  }

  // Handle olderThanDays criteria
  if ('olderThanDays' in criteria && criteria.olderThanDays) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - criteria.olderThanDays);
    notes = notes.filter((n) => n.updatedAt < cutoffDate);
  }

  return notes;
}

function calculateStringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  if (s1 === s2) return 1;
  if (s1.length < 2 || s2.length < 2) return 0;

  // Simple Jaccard similarity based on words
  const words1 = new Set(s1.split(/\s+/).filter((w) => w.length > 2));
  const words2 = new Set(s2.split(/\s+/).filter((w) => w.length > 2));

  const intersection = new Set([...words1].filter((w) => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  return union.size > 0 ? intersection.size / union.size : 0;
}

// ============================================
// BULK UPDATE OPERATIONS
// ============================================

/**
 * Bulk update multiple notes at once
 * Can target notes by IDs, search query, or various criteria
 */
export async function bulkUpdateNotes(
  userId: string,
  criteria: BulkUpdateCriteria,
  updates: BulkUpdateInput
): Promise<BulkOperationResult> {
  const result: BulkOperationResult = {
    success: true,
    updatedCount: 0,
    noteIds: [],
    skipped: [],
    errors: [],
  };

  try {
    // Get notes matching criteria
    const notes = await getNotesByCriteria(userId, criteria);

    if (notes.length === 0) {
      result.skipped.push({ noteId: 'N/A', reason: 'No notes found matching criteria' });
      return result;
    }

    // Use batch for efficient updates
    const batch = writeBatch(db);
    const maxBatchSize = 500;
    let batchCount = 0;

    for (const note of notes) {
      if (batchCount >= maxBatchSize) {
        // Commit current batch and start new one
        await batch.commit();
        batchCount = 0;
      }

      try {
        const noteRef = doc(db, 'users', userId, 'notes', note.id);
        const updateData: Record<string, unknown> = {
          updatedAt: serverTimestamp(),
        };

        // Apply updates
        if (updates.color !== undefined) {
          updateData.color = updates.color;
        }
        if (updates.priority !== undefined) {
          updateData.priority = updates.priority;
        }
        if (updates.spaceId !== undefined) {
          updateData.spaceId = updates.spaceId;
        }
        if (updates.pinned !== undefined) {
          updateData.pinned = updates.pinned;
        }
        if (updates.archived !== undefined) {
          updateData.archived = updates.archived;
        }
        if (updates.labelIds !== undefined) {
          updateData.labelIds = updates.labelIds;
        }

        batch.update(noteRef, updateData);
        result.noteIds.push(note.id);
        result.updatedCount++;
        batchCount++;
      } catch (err) {
        result.errors.push({
          noteId: note.id,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    // Commit remaining updates
    if (batchCount > 0) {
      await batch.commit();
    }
  } catch (err) {
    result.success = false;
    result.errors.push({
      noteId: 'BATCH',
      error: err instanceof Error ? err.message : 'Batch operation failed',
    });
  }

  return result;
}

// ============================================
// BULK ARCHIVE OPERATIONS
// ============================================

/**
 * Bulk archive multiple notes based on criteria
 */
export async function bulkArchive(
  userId: string,
  criteria: BulkArchiveCriteria
): Promise<BulkOperationResult> {
  // Ensure we're not archiving already archived notes
  const extendedCriteria = { ...criteria, archived: false };
  return bulkUpdateNotes(userId, extendedCriteria, { archived: true });
}

/**
 * Bulk unarchive multiple notes
 */
export async function bulkUnarchive(
  userId: string,
  criteria: BulkArchiveCriteria
): Promise<BulkOperationResult> {
  // Target only archived notes
  const extendedCriteria = { ...criteria, archived: true };
  return bulkUpdateNotes(userId, extendedCriteria, { archived: false });
}

// ============================================
// BULK DELETE OPERATIONS
// ============================================

/**
 * Bulk delete (soft delete) multiple notes - moves them to trash
 */
export async function bulkDelete(
  userId: string,
  criteria: BulkArchiveCriteria
): Promise<BulkOperationResult> {
  const result: BulkOperationResult = {
    success: true,
    updatedCount: 0,
    noteIds: [],
    skipped: [],
    errors: [],
  };

  try {
    const notes = await getNotesByCriteria(userId, criteria);

    if (notes.length === 0) {
      result.skipped.push({ noteId: 'N/A', reason: 'No notes found matching criteria' });
      return result;
    }

    // Filter out already deleted notes
    const notesToDelete = notes.filter((n) => !n.deletedAt);

    if (notesToDelete.length === 0) {
      result.skipped.push({ noteId: 'N/A', reason: 'All matching notes are already in trash' });
      return result;
    }

    const batch = writeBatch(db);

    for (const note of notesToDelete) {
      try {
        const noteRef = doc(db, 'users', userId, 'notes', note.id);
        batch.update(noteRef, {
          deletedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        result.noteIds.push(note.id);
        result.updatedCount++;
      } catch (err) {
        result.errors.push({
          noteId: note.id,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    await batch.commit();
  } catch (err) {
    result.success = false;
    result.errors.push({
      noteId: 'BATCH',
      error: err instanceof Error ? err.message : 'Batch delete failed',
    });
  }

  return result;
}

/**
 * Bulk restore notes from trash
 */
export async function bulkRestore(userId: string, noteIds: string[]): Promise<BulkOperationResult> {
  const result: BulkOperationResult = {
    success: true,
    updatedCount: 0,
    noteIds: [],
    skipped: [],
    errors: [],
  };

  try {
    // Get all notes including deleted ones
    const allNotes = await getAllNotes(userId, true, true);
    const trashedNotes = allNotes.filter(
      (n) => n.deletedAt && noteIds.includes(n.id)
    );

    if (trashedNotes.length === 0) {
      result.skipped.push({ noteId: 'N/A', reason: 'No trashed notes found with specified IDs' });
      return result;
    }

    const batch = writeBatch(db);

    for (const note of trashedNotes) {
      const noteRef = doc(db, 'users', userId, 'notes', note.id);
      batch.update(noteRef, {
        deletedAt: null,
        updatedAt: serverTimestamp(),
      });
      result.noteIds.push(note.id);
      result.updatedCount++;
    }

    await batch.commit();
  } catch (err) {
    result.success = false;
    result.errors.push({
      noteId: 'BATCH',
      error: err instanceof Error ? err.message : 'Batch restore failed',
    });
  }

  return result;
}

// ============================================
// BULK LABEL OPERATIONS
// ============================================

/**
 * Bulk add/remove labels from multiple notes
 */
export async function bulkLabel(
  userId: string,
  input: BulkLabelInput
): Promise<BulkLabelResult> {
  const result: BulkLabelResult = {
    success: true,
    updatedCount: 0,
    noteIds: [],
    labelsAdded: {},
    labelsRemoved: {},
    skipped: [],
  };

  try {
    // Get target notes
    let notes: Note[];
    if (input.noteIds && input.noteIds.length > 0) {
      notes = await getNotesByIds(userId, input.noteIds);
    } else if (input.searchQuery) {
      notes = await searchNotes(userId, input.searchQuery, input.spaceId);
    } else if (input.spaceId) {
      const allNotes = await getAllNotes(userId);
      notes = allNotes.filter((n) => n.spaceId === input.spaceId);
    } else {
      result.skipped.push({
        noteId: 'N/A',
        reason: 'Must specify noteIds, searchQuery, or spaceId',
      });
      return result;
    }

    if (notes.length === 0) {
      result.skipped.push({ noteId: 'N/A', reason: 'No notes found matching criteria' });
      return result;
    }

    // Validate labels exist
    const labels = await listLabels(userId);
    const labelIds = new Set(labels.map((l) => l.id));

    const invalidAddLabels = input.addLabels.filter((id) => !labelIds.has(id));
    const invalidRemoveLabels = input.removeLabels.filter((id) => !labelIds.has(id));

    if (invalidAddLabels.length > 0) {
      result.skipped.push({
        noteId: 'N/A',
        reason: `Invalid label IDs to add: ${invalidAddLabels.join(', ')}`,
      });
    }

    if (invalidRemoveLabels.length > 0) {
      result.skipped.push({
        noteId: 'N/A',
        reason: `Invalid label IDs to remove: ${invalidRemoveLabels.join(', ')}`,
      });
    }

    const validAddLabels = input.addLabels.filter((id) => labelIds.has(id));
    const validRemoveLabels = input.removeLabels.filter((id) => labelIds.has(id));

    if (validAddLabels.length === 0 && validRemoveLabels.length === 0) {
      result.skipped.push({ noteId: 'N/A', reason: 'No valid labels to add or remove' });
      return result;
    }

    // Process updates
    const batch = writeBatch(db);

    for (const note of notes) {
      const currentLabels = new Set(note.labelIds);
      let changed = false;

      // Add labels
      for (const labelId of validAddLabels) {
        if (!currentLabels.has(labelId)) {
          currentLabels.add(labelId);
          result.labelsAdded[labelId] = (result.labelsAdded[labelId] || 0) + 1;
          changed = true;
        }
      }

      // Remove labels
      for (const labelId of validRemoveLabels) {
        if (currentLabels.has(labelId)) {
          currentLabels.delete(labelId);
          result.labelsRemoved[labelId] = (result.labelsRemoved[labelId] || 0) + 1;
          changed = true;
        }
      }

      if (changed) {
        const noteRef = doc(db, 'users', userId, 'notes', note.id);
        batch.update(noteRef, {
          labelIds: Array.from(currentLabels),
          updatedAt: serverTimestamp(),
        });
        result.noteIds.push(note.id);
        result.updatedCount++;
      } else {
        result.skipped.push({
          noteId: note.id,
          reason: 'No label changes needed',
        });
      }
    }

    if (result.updatedCount > 0) {
      await batch.commit();
    }
  } catch (err) {
    result.success = false;
    result.skipped.push({
      noteId: 'BATCH',
      reason: err instanceof Error ? err.message : 'Batch label operation failed',
    });
  }

  return result;
}

// ============================================
// AUTO-ORGANIZE OPERATIONS
// ============================================

/**
 * Automatically organize notes based on specified actions
 */
export async function autoOrganize(
  userId: string,
  input: AutoOrganizeInput
): Promise<AutoOrganizeResult> {
  const result: AutoOrganizeResult = {
    success: true,
    dryRun: input.dryRun ?? false,
    totalChanges: 0,
    changes: [],
    actionSummary: {
      'auto-label': 0,
      'auto-priority': 0,
      'archive-old': 0,
      'detect-duplicates': 0,
      'color-by-type': 0,
      'merge-similar': 0,
    },
    duplicatesFound: [],
    recommendations: [],
  };

  try {
    let notes = await getAllNotes(userId, true, false);

    if (input.spaceId) {
      notes = notes.filter((n) => n.spaceId === input.spaceId);
    }

    const labels = await listLabels(userId);
    const labelMap = new Map(labels.map((l) => [l.id, l]));
    const labelNameMap = new Map(labels.map((l) => [l.name.toLowerCase(), l]));

    const batch = writeBatch(db);
    let batchCount = 0;
    const maxBatchSize = 500;

    // Process each action
    for (const action of input.actions) {
      switch (action) {
        case 'auto-label': {
          // Auto-label based on keywords in title/body
          const keywords = input.options?.autoLabelKeywords || {
            work: ['meeting', 'project', 'deadline', 'task', 'review'],
            personal: ['todo', 'reminder', 'idea', 'note'],
            shopping: ['buy', 'purchase', 'order', 'shop', 'groceries'],
            health: ['exercise', 'workout', 'diet', 'health', 'medical'],
            travel: ['trip', 'flight', 'hotel', 'vacation', 'travel'],
          };

          for (const note of notes) {
            const content = `${note.title} ${note.body}`.toLowerCase();
            const matchedLabels: string[] = [];

            for (const [labelName, keywordList] of Object.entries(keywords)) {
              const label = labelNameMap.get(labelName.toLowerCase());
              if (label && keywordList.some((kw) => content.includes(kw))) {
                if (!note.labelIds.includes(label.id)) {
                  matchedLabels.push(label.id);
                }
              }
            }

            if (matchedLabels.length > 0) {
              const change: AutoOrganizeChange = {
                action: 'auto-label',
                noteId: note.id,
                noteTitle: note.title,
                description: `Adding labels: ${matchedLabels.map((id) => labelMap.get(id)?.name || id).join(', ')}`,
                before: { labelIds: note.labelIds },
                after: { labelIds: [...note.labelIds, ...matchedLabels] },
              };
              result.changes.push(change);
              result.actionSummary['auto-label']++;

              if (!input.dryRun) {
                const noteRef = doc(db, 'users', userId, 'notes', note.id);
                batch.update(noteRef, {
                  labelIds: [...note.labelIds, ...matchedLabels],
                  updatedAt: serverTimestamp(),
                });
                batchCount++;
              }
            }
          }
          break;
        }

        case 'auto-priority': {
          // Auto-set priority based on keywords
          const highPriorityKeywords = ['urgent', 'asap', 'important', 'critical', 'deadline'];
          const mediumPriorityKeywords = ['soon', 'this week', 'follow up', 'pending'];

          for (const note of notes) {
            if (note.priority !== null) continue; // Skip notes with existing priority

            const content = `${note.title} ${note.body}`.toLowerCase();
            let newPriority: NotePriority = null;

            if (highPriorityKeywords.some((kw) => content.includes(kw))) {
              newPriority = 'high';
            } else if (mediumPriorityKeywords.some((kw) => content.includes(kw))) {
              newPriority = 'medium';
            }

            if (newPriority) {
              const change: AutoOrganizeChange = {
                action: 'auto-priority',
                noteId: note.id,
                noteTitle: note.title,
                description: `Setting priority to ${newPriority}`,
                before: { priority: note.priority },
                after: { priority: newPriority },
              };
              result.changes.push(change);
              result.actionSummary['auto-priority']++;

              if (!input.dryRun) {
                const noteRef = doc(db, 'users', userId, 'notes', note.id);
                batch.update(noteRef, {
                  priority: newPriority,
                  updatedAt: serverTimestamp(),
                });
                batchCount++;
              }
            }
          }
          break;
        }

        case 'archive-old': {
          const days = input.options?.archiveOlderThanDays || 90;
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - days);

          for (const note of notes) {
            if (note.archived || note.pinned) continue; // Don't archive pinned or already archived

            if (note.updatedAt < cutoffDate) {
              const change: AutoOrganizeChange = {
                action: 'archive-old',
                noteId: note.id,
                noteTitle: note.title,
                description: `Archiving note not updated in ${days} days (last updated: ${note.updatedAt.toLocaleDateString()})`,
                before: { archived: false },
                after: { archived: true },
              };
              result.changes.push(change);
              result.actionSummary['archive-old']++;

              if (!input.dryRun) {
                const noteRef = doc(db, 'users', userId, 'notes', note.id);
                batch.update(noteRef, {
                  archived: true,
                  updatedAt: serverTimestamp(),
                });
                batchCount++;
              }
            }
          }
          break;
        }

        case 'detect-duplicates': {
          const threshold = input.options?.duplicateThreshold || 0.7;
          const checkedPairs = new Set<string>();

          for (let i = 0; i < notes.length; i++) {
            for (let j = i + 1; j < notes.length; j++) {
              const pairKey = [notes[i].id, notes[j].id].sort().join('-');
              if (checkedPairs.has(pairKey)) continue;
              checkedPairs.add(pairKey);

              const titleSimilarity = calculateStringSimilarity(notes[i].title, notes[j].title);
              const bodySimilarity = calculateStringSimilarity(notes[i].body, notes[j].body);
              const avgSimilarity = (titleSimilarity * 0.6 + bodySimilarity * 0.4);

              if (avgSimilarity >= threshold) {
                result.duplicatesFound.push({
                  noteIds: [notes[i].id, notes[j].id],
                  titles: [notes[i].title, notes[j].title],
                  similarity: Math.round(avgSimilarity * 100),
                });
                result.actionSummary['detect-duplicates']++;
              }
            }
          }

          if (result.duplicatesFound.length > 0) {
            result.recommendations.push(
              `Found ${result.duplicatesFound.length} potential duplicate note pairs. Review and consider merging or deleting duplicates.`
            );
          }
          break;
        }

        case 'color-by-type': {
          // Assign colors based on note type
          const checklistColor: NoteColor = 'mint';
          const textColor: NoteColor = 'default';

          for (const note of notes) {
            const targetColor = note.type === 'checklist' ? checklistColor : textColor;
            if (note.color !== targetColor && note.color === 'default') {
              const change: AutoOrganizeChange = {
                action: 'color-by-type',
                noteId: note.id,
                noteTitle: note.title,
                description: `Setting color to ${targetColor} for ${note.type} note`,
                before: { color: note.color },
                after: { color: targetColor },
              };
              result.changes.push(change);
              result.actionSummary['color-by-type']++;

              if (!input.dryRun) {
                const noteRef = doc(db, 'users', userId, 'notes', note.id);
                batch.update(noteRef, {
                  color: targetColor,
                  updatedAt: serverTimestamp(),
                });
                batchCount++;
              }
            }
          }
          break;
        }

        case 'merge-similar': {
          // This is a suggestion-only action (no automatic merging)
          // It identifies similar notes that could potentially be merged
          const similarGroups: Map<string, string[]> = new Map();
          const threshold = 0.5;

          for (let i = 0; i < notes.length; i++) {
            const baseWords = notes[i].title.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
            if (baseWords.length === 0) continue;

            const key = baseWords[0];
            if (!similarGroups.has(key)) {
              similarGroups.set(key, []);
            }

            for (let j = i + 1; j < notes.length; j++) {
              const similarity = calculateStringSimilarity(notes[i].title, notes[j].title);
              if (similarity >= threshold) {
                const group = similarGroups.get(key) || [];
                if (!group.includes(notes[i].id)) group.push(notes[i].id);
                if (!group.includes(notes[j].id)) group.push(notes[j].id);
                similarGroups.set(key, group);
              }
            }
          }

          // Report groups with 2+ notes
          for (const [keyword, noteIds] of similarGroups) {
            if (noteIds.length >= 2) {
              const titles = noteIds.map((id) => notes.find((n) => n.id === id)?.title || id);
              result.recommendations.push(
                `Consider merging similar notes about "${keyword}": ${titles.slice(0, 3).join(', ')}${noteIds.length > 3 ? ` (+${noteIds.length - 3} more)` : ''}`
              );
              result.actionSummary['merge-similar']++;
            }
          }
          break;
        }
      }

      // Commit batch if getting too large
      if (!input.dryRun && batchCount >= maxBatchSize) {
        await batch.commit();
        batchCount = 0;
      }
    }

    // Commit remaining changes
    if (!input.dryRun && batchCount > 0) {
      await batch.commit();
    }

    result.totalChanges = result.changes.length;

    // Add general recommendations
    if (result.totalChanges === 0 && input.actions.length > 0) {
      result.recommendations.push('Your notes are already well-organized! No changes needed.');
    }

    if (notes.filter((n) => n.labelIds.length === 0).length > 10) {
      result.recommendations.push(
        `${notes.filter((n) => n.labelIds.length === 0).length} notes have no labels. Consider running auto-label to organize them.`
      );
    }

    if (notes.filter((n) => n.priority === null).length > 20) {
      result.recommendations.push(
        'Many notes have no priority set. Consider running auto-priority to identify important items.'
      );
    }
  } catch (err) {
    result.success = false;
    result.recommendations.push(
      `Error during auto-organize: ${err instanceof Error ? err.message : 'Unknown error'}`
    );
  }

  return result;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get a preview of what bulk operation would affect
 */
export async function previewBulkOperation(
  userId: string,
  criteria: BulkUpdateCriteria | BulkArchiveCriteria
): Promise<{ noteCount: number; notes: Array<{ id: string; title: string; color: string }> }> {
  const notes = await getNotesByCriteria(userId, criteria);

  return {
    noteCount: notes.length,
    notes: notes.slice(0, 20).map((n) => ({
      id: n.id,
      title: n.title,
      color: n.color,
    })),
  };
}

/**
 * Get batch operation statistics for the user
 */
export async function getBatchStats(
  userId: string,
  spaceId?: string
): Promise<{
  totalNotes: number;
  archivedNotes: number;
  trashedNotes: number;
  notesWithoutLabels: number;
  notesWithoutPriority: number;
  oldNotes: number;
  duplicateCandidates: number;
}> {
  let notes = await getAllNotes(userId, true, true);

  if (spaceId) {
    notes = notes.filter((n) => n.spaceId === spaceId);
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const activeNotes = notes.filter((n) => !n.deletedAt);
  const notArchived = activeNotes.filter((n) => !n.archived);

  return {
    totalNotes: notArchived.length,
    archivedNotes: activeNotes.filter((n) => n.archived).length,
    trashedNotes: notes.filter((n) => n.deletedAt).length,
    notesWithoutLabels: notArchived.filter((n) => n.labelIds.length === 0).length,
    notesWithoutPriority: notArchived.filter((n) => n.priority === null).length,
    oldNotes: notArchived.filter((n) => n.updatedAt < thirtyDaysAgo).length,
    duplicateCandidates: 0, // Would need to run duplicate detection to get accurate count
  };
}
