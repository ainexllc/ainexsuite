import { db } from '@ainexsuite/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

// ============================================
// TYPES
// ============================================

export type NoteColor =
  | 'default'
  | 'white'
  | 'lemon'
  | 'peach'
  | 'tangerine'
  | 'mint'
  | 'fog'
  | 'lavender'
  | 'blush'
  | 'sky'
  | 'moss'
  | 'coal';

export type NotePriority = 'high' | 'medium' | 'low' | null;

export type ChecklistItemPriority = 'high' | 'medium' | 'low' | null;

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  indent: number;
  collapsed?: boolean;
  dueDate?: string;
  priority?: ChecklistItemPriority;
  notes?: string;
  completedAt?: Date | null;
}

export interface NoteInput {
  title: string;
  body?: string;
  type?: 'text' | 'checklist';
  checklistItems?: string[];
  color?: NoteColor;
  spaceId?: string;
  pinned?: boolean;
  priority?: NotePriority;
  labelIds?: string[];
}

export interface Note {
  id: string;
  ownerId: string;
  spaceId: string;
  title: string;
  body: string;
  type: 'text' | 'checklist';
  checklist: ChecklistItem[];
  color: NoteColor;
  pinned: boolean;
  archived: boolean;
  priority: NotePriority;
  labelIds: string[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface Space {
  id: string;
  name: string;
  type: 'personal' | 'family' | 'work' | 'couple' | 'buddy' | 'squad' | 'project';
  memberUids: string[];
  createdAt: Date;
}

export interface Label {
  id: string;
  name: string;
  color: NoteColor;
  parentId?: string | null;
  createdAt: Date;
}

export interface NoteUpdateInput {
  title?: string;
  body?: string;
  color?: NoteColor;
  priority?: NotePriority;
  pinned?: boolean;
  archived?: boolean;
  spaceId?: string;
  labelIds?: string[];
}

export interface AdvancedSearchFilters {
  query?: string;
  spaceId?: string;
  color?: NoteColor;
  type?: 'text' | 'checklist';
  labelIds?: string[];
  pinned?: boolean;
  archived?: boolean;
  priority?: NotePriority;
}

// ============================================
// HELPERS
// ============================================

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

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

// ============================================
// USER CONTEXT
// ============================================

export interface UserContext {
  spaces: Space[];
  currentSpace: Space;
  hasMultipleSpaces: boolean;
  noteCounts: {
    total: number;
    favorites: number;
    archived: number;
    trash: number;
  };
}

/**
 * Get user context including spaces and note counts
 * This should be called first to determine if clarifying questions are needed
 */
export async function getUserContext(userId: string): Promise<UserContext> {
  const spaces = await listSpaces(userId);
  const currentSpace = (await getCurrentSpace(userId)) || spaces[0];

  // Get note counts
  const notesRef = collection(db, 'users', userId, 'notes');

  // Total non-deleted, non-archived notes
  const totalQuery = query(notesRef, where('deletedAt', '==', null), limit(100));
  const totalSnap = await getDocs(totalQuery);
  const totalNotes = totalSnap.docs.filter((d) => !d.data().archived).length;

  // Favorites count
  const favQuery = query(
    notesRef,
    where('pinned', '==', true),
    where('deletedAt', '==', null),
    limit(100)
  );
  const favSnap = await getDocs(favQuery);
  const favCount = favSnap.docs.filter((d) => !d.data().archived).length;

  // Archived count
  const archiveQuery = query(
    notesRef,
    where('archived', '==', true),
    where('deletedAt', '==', null),
    limit(100)
  );
  const archiveSnap = await getDocs(archiveQuery);

  // Trash count
  const trashQuery = query(notesRef, orderBy('deletedAt', 'desc'), limit(100));
  const trashSnap = await getDocs(trashQuery);
  const trashCount = trashSnap.docs.filter((d) => d.data().deletedAt).length;

  return {
    spaces,
    currentSpace,
    hasMultipleSpaces: spaces.length > 1,
    noteCounts: {
      total: totalNotes,
      favorites: favCount,
      archived: archiveSnap.size,
      trash: trashCount,
    },
  };
}

// ============================================
// SPACES
// ============================================

/**
 * List all spaces the user belongs to
 */
export async function listSpaces(userId: string): Promise<Space[]> {
  const spacesRef = collection(db, 'spaces');
  const q = query(spacesRef, where('memberUids', 'array-contains', userId));

  const snapshot = await getDocs(q);

  const spaces: Space[] = [
    {
      id: 'personal',
      name: 'Personal',
      type: 'personal',
      memberUids: [userId],
      createdAt: new Date(),
    },
  ];

  snapshot.docs.forEach((docSnapshot) => {
    const data = docSnapshot.data();
    spaces.push({
      id: docSnapshot.id,
      name: (data.name as string) || '',
      type: (data.type as Space['type']) || 'personal',
      memberUids: (data.memberUids as string[]) || [],
      createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
    });
  });

  return spaces;
}

/**
 * Get current/active space for user
 */
export async function getCurrentSpace(userId: string): Promise<Space | null> {
  const prefsRef = doc(db, 'users', userId, 'preferences', 'notes');
  const prefsSnap = await getDoc(prefsRef);

  if (prefsSnap.exists()) {
    const data = prefsSnap.data();
    const currentSpaceId = data.currentSpaceId as string;

    if (currentSpaceId && currentSpaceId !== 'personal') {
      const spaceRef = doc(db, 'spaces', currentSpaceId);
      const spaceSnap = await getDoc(spaceRef);
      if (spaceSnap.exists()) {
        const spaceData = spaceSnap.data();
        return {
          id: spaceSnap.id,
          name: (spaceData.name as string) || '',
          type: (spaceData.type as Space['type']) || 'personal',
          memberUids: (spaceData.memberUids as string[]) || [],
          createdAt: (spaceData.createdAt as Timestamp)?.toDate() || new Date(),
        };
      }
    }
  }

  return {
    id: 'personal',
    name: 'Personal',
    type: 'personal',
    memberUids: [userId],
    createdAt: new Date(),
  };
}

// ============================================
// NOTES CRUD
// ============================================

/**
 * Create a new note in Firestore
 */
export async function createNote(
  userId: string,
  input: NoteInput,
  spaceId?: string
): Promise<string> {
  const notesRef = collection(db, 'users', userId, 'notes');

  const type = input.type || (input.checklistItems?.length ? 'checklist' : 'text');

  const checklist: ChecklistItem[] =
    input.checklistItems?.map((text) => ({
      id: generateId(),
      text,
      completed: false,
      indent: 0,
    })) || [];

  const noteData = {
    ownerId: userId,
    spaceId: spaceId || input.spaceId || 'personal',
    title: input.title || '',
    body: input.body || '',
    type,
    checklist,
    color: input.color || 'default',
    pattern: 'none',
    pinned: input.pinned || false,
    archived: false,
    priority: input.priority || null,
    labelIds: input.labelIds || [],
    attachments: [],
    sharedWith: [],
    sharedWithUserIds: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(notesRef, noteData);
  return docRef.id;
}

/**
 * Get a single note by ID
 */
export async function getNote(userId: string, noteId: string): Promise<Note | null> {
  const noteRef = doc(db, 'users', userId, 'notes', noteId);
  const noteSnap = await getDoc(noteRef);

  if (!noteSnap.exists()) return null;

  return mapNoteDoc({ id: noteSnap.id, data: () => noteSnap.data() });
}

/**
 * Update a note
 */
export async function updateNote(
  userId: string,
  noteId: string,
  updates: NoteUpdateInput
): Promise<void> {
  const noteRef = doc(db, 'users', userId, 'notes', noteId);
  await updateDoc(noteRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a note (soft delete - moves to trash)
 */
export async function deleteNote(userId: string, noteId: string): Promise<void> {
  const noteRef = doc(db, 'users', userId, 'notes', noteId);
  await updateDoc(noteRef, {
    deletedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// ============================================
// SEARCH & LIST
// ============================================

/**
 * Search notes by title/body content
 */
export async function searchNotes(
  userId: string,
  searchQuery: string,
  spaceId?: string
): Promise<Note[]> {
  const notesRef = collection(db, 'users', userId, 'notes');

  let q;
  if (spaceId) {
    q = query(
      notesRef,
      where('spaceId', '==', spaceId),
      where('deletedAt', '==', null),
      orderBy('updatedAt', 'desc'),
      limit(50)
    );
  } else {
    q = query(notesRef, where('deletedAt', '==', null), orderBy('updatedAt', 'desc'), limit(50));
  }

  const snapshot = await getDocs(q);
  const searchLower = searchQuery.toLowerCase();

  const notes = snapshot.docs
    .map((docSnapshot) => mapNoteDoc({ id: docSnapshot.id, data: () => docSnapshot.data() }))
    .filter(
      (note) =>
        note.title.toLowerCase().includes(searchLower) ||
        note.body.toLowerCase().includes(searchLower) ||
        note.checklist.some((item) => item.text.toLowerCase().includes(searchLower))
    );

  return notes;
}

/**
 * List recent notes
 */
export async function listNotes(
  userId: string,
  limitCount: number = 10,
  spaceId?: string
): Promise<Note[]> {
  const notesRef = collection(db, 'users', userId, 'notes');

  let q;
  if (spaceId) {
    q = query(
      notesRef,
      where('spaceId', '==', spaceId),
      orderBy('updatedAt', 'desc'),
      limit(limitCount)
    );
  } else {
    q = query(notesRef, orderBy('updatedAt', 'desc'), limit(limitCount));
  }

  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((docSnapshot) => mapNoteDoc({ id: docSnapshot.id, data: () => docSnapshot.data() }))
    .filter((note) => !note.deletedAt && !note.archived);
}

/**
 * Advanced search with multiple filters
 */
export async function advancedSearchNotes(
  userId: string,
  filters: AdvancedSearchFilters
): Promise<Note[]> {
  const notesRef = collection(db, 'users', userId, 'notes');

  // Start with base query
  let q = query(notesRef, where('deletedAt', '==', null), orderBy('updatedAt', 'desc'), limit(50));

  // Add space filter if provided
  if (filters.spaceId) {
    q = query(
      notesRef,
      where('spaceId', '==', filters.spaceId),
      where('deletedAt', '==', null),
      orderBy('updatedAt', 'desc'),
      limit(50)
    );
  }

  const snapshot = await getDocs(q);

  let notes = snapshot.docs.map((docSnapshot) =>
    mapNoteDoc({ id: docSnapshot.id, data: () => docSnapshot.data() })
  );

  // Apply client-side filters
  if (filters.query) {
    const searchLower = filters.query.toLowerCase();
    notes = notes.filter(
      (note) =>
        note.title.toLowerCase().includes(searchLower) ||
        note.body.toLowerCase().includes(searchLower) ||
        note.checklist.some((item) => item.text.toLowerCase().includes(searchLower))
    );
  }

  if (filters.color) {
    notes = notes.filter((note) => note.color === filters.color);
  }

  if (filters.type) {
    notes = notes.filter((note) => note.type === filters.type);
  }

  if (filters.pinned !== undefined) {
    notes = notes.filter((note) => note.pinned === filters.pinned);
  }

  if (filters.archived !== undefined) {
    notes = notes.filter((note) => note.archived === filters.archived);
  }

  if (filters.priority) {
    notes = notes.filter((note) => note.priority === filters.priority);
  }

  if (filters.labelIds && filters.labelIds.length > 0) {
    notes = notes.filter((note) => filters.labelIds!.some((id) => note.labelIds.includes(id)));
  }

  return notes;
}

/**
 * Find note by title
 */
export async function findNoteByTitle(
  userId: string,
  title: string,
  spaceId?: string
): Promise<Note | null> {
  const notes = await searchNotes(userId, title, spaceId);
  const titleLower = title.toLowerCase();
  return notes.find((note) => note.title.toLowerCase() === titleLower) || notes[0] || null;
}

// ============================================
// FAVORITES / PINNING
// ============================================

/**
 * Pin a note to favorites
 */
export async function pinNote(userId: string, noteId: string): Promise<void> {
  const noteRef = doc(db, 'users', userId, 'notes', noteId);
  await updateDoc(noteRef, {
    pinned: true,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Unpin a note from favorites
 */
export async function unpinNote(userId: string, noteId: string): Promise<void> {
  const noteRef = doc(db, 'users', userId, 'notes', noteId);
  await updateDoc(noteRef, {
    pinned: false,
    updatedAt: serverTimestamp(),
  });
}

/**
 * List all favorited/pinned notes
 */
export async function listFavorites(userId: string, spaceId?: string): Promise<Note[]> {
  const notesRef = collection(db, 'users', userId, 'notes');

  // Query for pinned notes - filter deletedAt client-side since null vs undefined is tricky
  let q;
  if (spaceId) {
    q = query(
      notesRef,
      where('spaceId', '==', spaceId),
      where('pinned', '==', true),
      orderBy('updatedAt', 'desc'),
      limit(50)
    );
  } else {
    q = query(
      notesRef,
      where('pinned', '==', true),
      orderBy('updatedAt', 'desc'),
      limit(50)
    );
  }

  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((docSnapshot) => mapNoteDoc({ id: docSnapshot.id, data: () => docSnapshot.data() }))
    .filter((note) => !note.archived && !note.deletedAt);
}

// ============================================
// LABELS
// ============================================

/**
 * List all labels for a user
 */
export async function listLabels(userId: string): Promise<Label[]> {
  const labelsRef = collection(db, 'users', userId, 'labels');
  const q = query(labelsRef, orderBy('name', 'asc'));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnapshot) => {
    const data = docSnapshot.data();
    return {
      id: docSnapshot.id,
      name: (data.name as string) || '',
      color: (data.color as NoteColor) || 'default',
      parentId: (data.parentId as string) || null,
      createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
    };
  });
}

/**
 * Add a label to a note
 */
export async function addLabelToNote(
  userId: string,
  noteId: string,
  labelId: string
): Promise<void> {
  const noteRef = doc(db, 'users', userId, 'notes', noteId);
  const noteSnap = await getDoc(noteRef);

  if (!noteSnap.exists()) throw new Error('Note not found');

  const data = noteSnap.data();
  const labelIds = (data.labelIds as string[]) || [];

  if (!labelIds.includes(labelId)) {
    await updateDoc(noteRef, {
      labelIds: [...labelIds, labelId],
      updatedAt: serverTimestamp(),
    });
  }
}

/**
 * Remove a label from a note
 */
export async function removeLabelFromNote(
  userId: string,
  noteId: string,
  labelId: string
): Promise<void> {
  const noteRef = doc(db, 'users', userId, 'notes', noteId);
  const noteSnap = await getDoc(noteRef);

  if (!noteSnap.exists()) throw new Error('Note not found');

  const data = noteSnap.data();
  const labelIds = (data.labelIds as string[]) || [];

  await updateDoc(noteRef, {
    labelIds: labelIds.filter((id) => id !== labelId),
    updatedAt: serverTimestamp(),
  });
}

/**
 * List notes by label
 */
export async function listNotesByLabel(userId: string, labelId: string): Promise<Note[]> {
  const notesRef = collection(db, 'users', userId, 'notes');
  const q = query(
    notesRef,
    where('labelIds', 'array-contains', labelId),
    where('deletedAt', '==', null),
    orderBy('updatedAt', 'desc'),
    limit(50)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((docSnapshot) => mapNoteDoc({ id: docSnapshot.id, data: () => docSnapshot.data() }))
    .filter((note) => !note.archived);
}

// ============================================
// ARCHIVE
// ============================================

/**
 * Archive a note
 */
export async function archiveNote(userId: string, noteId: string): Promise<void> {
  const noteRef = doc(db, 'users', userId, 'notes', noteId);
  await updateDoc(noteRef, {
    archived: true,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Unarchive a note
 */
export async function unarchiveNote(userId: string, noteId: string): Promise<void> {
  const noteRef = doc(db, 'users', userId, 'notes', noteId);
  await updateDoc(noteRef, {
    archived: false,
    updatedAt: serverTimestamp(),
  });
}

/**
 * List archived notes
 */
export async function listArchivedNotes(userId: string, spaceId?: string): Promise<Note[]> {
  const notesRef = collection(db, 'users', userId, 'notes');

  let q;
  if (spaceId) {
    q = query(
      notesRef,
      where('spaceId', '==', spaceId),
      where('archived', '==', true),
      where('deletedAt', '==', null),
      orderBy('updatedAt', 'desc'),
      limit(50)
    );
  } else {
    q = query(
      notesRef,
      where('archived', '==', true),
      where('deletedAt', '==', null),
      orderBy('updatedAt', 'desc'),
      limit(50)
    );
  }

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnapshot) =>
    mapNoteDoc({ id: docSnapshot.id, data: () => docSnapshot.data() })
  );
}

// ============================================
// CHECKLIST OPERATIONS
// ============================================

/**
 * Toggle a checklist item's completion status
 */
export async function toggleChecklistItem(
  userId: string,
  noteId: string,
  itemId: string
): Promise<void> {
  const noteRef = doc(db, 'users', userId, 'notes', noteId);
  const noteSnap = await getDoc(noteRef);

  if (!noteSnap.exists()) throw new Error('Note not found');

  const data = noteSnap.data();
  const checklist = (data.checklist as ChecklistItem[]) || [];

  const updatedChecklist = checklist.map((item) => {
    if (item.id === itemId) {
      return {
        ...item,
        completed: !item.completed,
        completedAt: !item.completed ? new Date() : null,
      };
    }
    return item;
  });

  await updateDoc(noteRef, {
    checklist: updatedChecklist,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Add a new item to a checklist
 */
export async function addChecklistItem(
  userId: string,
  noteId: string,
  text: string,
  options?: { priority?: ChecklistItemPriority; dueDate?: string }
): Promise<string> {
  const noteRef = doc(db, 'users', userId, 'notes', noteId);
  const noteSnap = await getDoc(noteRef);

  if (!noteSnap.exists()) throw new Error('Note not found');

  const data = noteSnap.data();
  const checklist = (data.checklist as ChecklistItem[]) || [];

  const newItem: ChecklistItem = {
    id: generateId(),
    text,
    completed: false,
    indent: 0,
    priority: options?.priority || null,
    dueDate: options?.dueDate,
  };

  await updateDoc(noteRef, {
    checklist: [...checklist, newItem],
    updatedAt: serverTimestamp(),
  });

  return newItem.id;
}

/**
 * Update a checklist item (priority, due date, text)
 */
export async function updateChecklistItem(
  userId: string,
  noteId: string,
  itemId: string,
  updates: { text?: string; priority?: ChecklistItemPriority; dueDate?: string }
): Promise<void> {
  const noteRef = doc(db, 'users', userId, 'notes', noteId);
  const noteSnap = await getDoc(noteRef);

  if (!noteSnap.exists()) throw new Error('Note not found');

  const data = noteSnap.data();
  const checklist = (data.checklist as ChecklistItem[]) || [];

  const updatedChecklist = checklist.map((item) => {
    if (item.id === itemId) {
      return { ...item, ...updates };
    }
    return item;
  });

  await updateDoc(noteRef, {
    checklist: updatedChecklist,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Remove a checklist item
 */
export async function removeChecklistItem(
  userId: string,
  noteId: string,
  itemId: string
): Promise<void> {
  const noteRef = doc(db, 'users', userId, 'notes', noteId);
  const noteSnap = await getDoc(noteRef);

  if (!noteSnap.exists()) throw new Error('Note not found');

  const data = noteSnap.data();
  const checklist = (data.checklist as ChecklistItem[]) || [];

  await updateDoc(noteRef, {
    checklist: checklist.filter((item) => item.id !== itemId),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Mark all checklist items as complete or incomplete
 */
export async function toggleAllChecklistItems(
  userId: string,
  noteId: string,
  completed: boolean
): Promise<void> {
  const noteRef = doc(db, 'users', userId, 'notes', noteId);
  const noteSnap = await getDoc(noteRef);

  if (!noteSnap.exists()) throw new Error('Note not found');

  const data = noteSnap.data();
  const checklist = (data.checklist as ChecklistItem[]) || [];

  const updatedChecklist = checklist.map((item) => ({
    ...item,
    completed,
    completedAt: completed ? new Date() : null,
  }));

  await updateDoc(noteRef, {
    checklist: updatedChecklist,
    updatedAt: serverTimestamp(),
  });
}

// ============================================
// TRASH OPERATIONS
// ============================================

/**
 * List trashed notes
 */
export async function listTrashedNotes(userId: string): Promise<Note[]> {
  const notesRef = collection(db, 'users', userId, 'notes');
  const q = query(notesRef, orderBy('deletedAt', 'desc'), limit(50));

  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((docSnapshot) => mapNoteDoc({ id: docSnapshot.id, data: () => docSnapshot.data() }))
    .filter((note) => note.deletedAt !== null);
}

/**
 * Restore a note from trash
 */
export async function restoreFromTrash(userId: string, noteId: string): Promise<void> {
  const noteRef = doc(db, 'users', userId, 'notes', noteId);
  await updateDoc(noteRef, {
    deletedAt: null,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Permanently delete a note
 */
export async function permanentlyDeleteNote(userId: string, noteId: string): Promise<void> {
  const noteRef = doc(db, 'users', userId, 'notes', noteId);
  await deleteDoc(noteRef);
}

/**
 * Empty the trash (permanently delete all trashed notes)
 */
export async function emptyTrash(userId: string): Promise<number> {
  const trashedNotes = await listTrashedNotes(userId);

  for (const note of trashedNotes) {
    await permanentlyDeleteNote(userId, note.id);
  }

  return trashedNotes.length;
}

// ============================================
// MOVE NOTES BETWEEN SPACES
// ============================================

/**
 * Move a note to a different space
 */
export async function moveNoteToSpace(
  userId: string,
  noteId: string,
  newSpaceId: string
): Promise<void> {
  const noteRef = doc(db, 'users', userId, 'notes', noteId);
  await updateDoc(noteRef, {
    spaceId: newSpaceId,
    updatedAt: serverTimestamp(),
  });
}

// ============================================
// NOTE PRIORITY
// ============================================

/**
 * Set note priority
 */
export async function setNotePriority(
  userId: string,
  noteId: string,
  priority: NotePriority
): Promise<void> {
  const noteRef = doc(db, 'users', userId, 'notes', noteId);
  await updateDoc(noteRef, {
    priority,
    updatedAt: serverTimestamp(),
  });
}

// ============================================
// NOTE COLOR
// ============================================

/**
 * Change note color
 */
export async function changeNoteColor(
  userId: string,
  noteId: string,
  color: NoteColor
): Promise<void> {
  const noteRef = doc(db, 'users', userId, 'notes', noteId);
  await updateDoc(noteRef, {
    color,
    updatedAt: serverTimestamp(),
  });
}

// ============================================
// DUPLICATE NOTE
// ============================================

/**
 * Duplicate a note
 */
export async function duplicateNote(userId: string, noteId: string): Promise<string> {
  const note = await getNote(userId, noteId);

  if (!note) throw new Error('Note not found');

  const newNoteId = await createNote(userId, {
    title: `${note.title} (Copy)`,
    body: note.body,
    type: note.type,
    color: note.color,
    spaceId: note.spaceId,
    priority: note.priority,
    labelIds: note.labelIds,
  });

  // Copy checklist items if present
  if (note.type === 'checklist' && note.checklist.length > 0) {
    const noteRef = doc(db, 'users', userId, 'notes', newNoteId);
    await updateDoc(noteRef, {
      checklist: note.checklist.map((item) => ({
        ...item,
        id: generateId(),
        completed: false,
        completedAt: null,
      })),
    });
  }

  return newNoteId;
}
