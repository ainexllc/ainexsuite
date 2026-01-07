import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collectionGroup,
  deleteDoc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  limit,
  startAfter,
  type Unsubscribe,
  type DocumentSnapshot,
  type QueryConstraint,
  writeBatch,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { generateUUID } from "@ainexsuite/ui";
import {
  clientNoteCollection,
  clientNoteDoc,
} from "@/lib/firebase/client-collections";
import { getFirebaseFirestore } from "@/lib/firebase/client-app";
import { noteDocPath } from "@/lib/firebase/collections";
import {
  noteConverter,
  createNotePayload,
} from "@/lib/firebase/note-converter";
import { getSpace } from "@/lib/firebase/space-service";
import type {
  Note,
  ChecklistItem,
  NoteAttachment,
  NoteDraft,
  NoteType,
  NoteColor,
  NotePattern,
} from "@/lib/types/note";
import { getFirebaseStorage } from "@/lib/firebase/client-app";

export type NotesSubscriptionHandler = (notes: Note[]) => void;

export function subscribeToOwnedNotes(
  userId: string,
  handler: NotesSubscriptionHandler,
  onError?: (error: Error) => void,
): Unsubscribe {
  const notesRef = query(
    clientNoteCollection(userId).withConverter(noteConverter),
    orderBy("pinned", "desc"),
    orderBy("updatedAt", "desc"),
  );

  return onSnapshot(
    notesRef,
    (snapshot) => {
      const notes = snapshot.docs.map((noteSnapshot) => noteSnapshot.data());
      handler(notes);
    },
    (error) => {
      if (onError) onError(error);
    },
  );
}

export function subscribeToSharedNotes(
  userId: string,
  handler: NotesSubscriptionHandler,
  onError?: (error: Error) => void,
): Unsubscribe {
  const sharedRef = query(
    collectionGroup(getFirebaseFirestore(), "notes").withConverter(noteConverter),
    where("sharedWithUserIds", "array-contains", userId),
    orderBy("pinned", "desc"),
    orderBy("updatedAt", "desc"),
  );

  return onSnapshot(
    sharedRef,
    (snapshot) => {
      const notes = snapshot.docs.map((docSnapshot) => docSnapshot.data());
      handler(notes);
    },
    (error) => {
      if (onError) onError(error);
    },
  );
}

/**
 * Subscribe to all notes in a specific space (from any user).
 * Uses collectionGroup query with spaceId filter.
 * Firestore rules must allow access based on space membership.
 */
export function subscribeToSpaceNotes(
  spaceId: string,
  userId: string,
  handler: NotesSubscriptionHandler,
  onError?: (error: Error) => void,
): Unsubscribe {
  // Skip for personal space
  if (!spaceId || spaceId === "personal") {
    handler([]);
    return () => {};
  }

  const spaceNotesRef = query(
    collectionGroup(getFirebaseFirestore(), "notes").withConverter(noteConverter),
    where("spaceId", "==", spaceId),
    orderBy("pinned", "desc"),
    orderBy("updatedAt", "desc"),
  );

  return onSnapshot(
    spaceNotesRef,
    (snapshot) => {
      // Filter out current user's notes (they come from subscribeToOwnedNotes)
      const notes = snapshot.docs
        .map((docSnapshot) => docSnapshot.data())
        .filter((note) => note.ownerId !== userId);
      handler(notes);
    },
    (error) => {
      console.error("[Notes] Error subscribing to space notes:", error);
      if (onError) onError(error);
    },
  );
}

export async function createNote(
  userId: string,
  input: {
    title?: string;
    body?: string;
    type?: NoteType;
    checklist?: ChecklistItem[];
    color?: NoteColor;
    pattern?: NotePattern;
    backgroundImage?: string | null;
    pinned?: boolean;
    archived?: boolean;
    labelIds?: string[];
    reminderAt?: Date | null;
    reminderId?: string | null;
    noteDate?: Date | null;
    spaceId?: string;
  },
) {
  const type = input.type ?? (input.checklist?.length ? "checklist" : "text");

  // For shared spaces, add all space members to sharedWithUserIds
  let sharedWithUserIds: string[] = [];
  if (input.spaceId && input.spaceId !== "personal") {
    const space = await getSpace(input.spaceId);
    if (space?.memberUids) {
      // Include all members except the note owner
      sharedWithUserIds = space.memberUids.filter((uid) => uid !== userId);
    }
  }

  const noteData = createNotePayload(userId, {
    ...input,
    type,
    spaceId: input.spaceId,
    sharedWithUserIds,
  });

  const docRef = await addDoc(clientNoteCollection(userId), noteData);

  return docRef.id;
}

export async function updateNote(
  userId: string,
  noteId: string,
  updates: NoteDraft,
) {
  const payload: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (typeof updates.title === "string") {
    payload.title = updates.title;
  }

  if (typeof updates.body === "string") {
    payload.body = updates.body;
  }

  if (updates.checklist !== undefined) {
    payload.checklist = updates.checklist;
    payload.type = updates.checklist.length ? "checklist" : "text";
  }

  if (updates.color !== undefined) {
    payload.color = updates.color;
  }

  if (updates.pattern !== undefined) {
    payload.pattern = updates.pattern;
  }

  if (updates.backgroundImage !== undefined) {
    payload.backgroundImage = updates.backgroundImage;
  }

  if (updates.backgroundOverlay !== undefined) {
    payload.backgroundOverlay = updates.backgroundOverlay;
  }

  if (updates.pinned !== undefined) {
    payload.pinned = updates.pinned;
  }

  if (updates.priority !== undefined) {
    payload.priority = updates.priority;
  }

  if (updates.labelIds !== undefined) {
    payload.labelIds = updates.labelIds;
  }

  if (updates.reminderAt !== undefined) {
    payload.reminderAt = updates.reminderAt
      ? Timestamp.fromDate(updates.reminderAt)
      : null;
  }

  if (updates.reminderId !== undefined) {
    payload.reminderId = updates.reminderId ?? null;
  }

  if (updates.noteDate !== undefined) {
    payload.noteDate = updates.noteDate
      ? Timestamp.fromDate(updates.noteDate)
      : null;
  }

  if (updates.attachments !== undefined) {
    payload.attachments = updates.attachments;
  }

  if (updates.sharedWith !== undefined) {
    payload.sharedWith = updates.sharedWith.map((collaborator) => ({
      email: collaborator.email,
      role: collaborator.role,
      userId: collaborator.userId,
      invitedAt: Timestamp.fromDate(collaborator.invitedAt),
    }));
  }

  if (updates.sharedWithUserIds !== undefined) {
    payload.sharedWithUserIds = updates.sharedWithUserIds;
  }

  if (updates.spaceId !== undefined) {
    payload.spaceId = updates.spaceId || null;

    // When moving to a shared space, update sharedWithUserIds with space members
    if (updates.spaceId && updates.spaceId !== "personal") {
      const space = await getSpace(updates.spaceId);
      if (space?.memberUids) {
        payload.sharedWithUserIds = space.memberUids.filter((uid) => uid !== userId);
      }
    } else {
      // Moving to personal space - clear sharedWithUserIds (unless explicitly set)
      if (updates.sharedWithUserIds === undefined) {
        payload.sharedWithUserIds = [];
      }
    }
  }

  await updateDoc(clientNoteDoc(userId, noteId), payload);
}

export async function togglePin(userId: string, noteId: string, pinned: boolean) {
  await updateDoc(clientNoteDoc(userId, noteId), {
    pinned,
    updatedAt: serverTimestamp(),
  });
}

export async function toggleArchive(
  userId: string,
  noteId: string,
  archived: boolean,
) {
  await updateDoc(clientNoteDoc(userId, noteId), {
    archived,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteNote(userId: string, noteId: string) {
  await updateDoc(clientNoteDoc(userId, noteId), {
    deletedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function addAttachments(
  userId: string,
  noteId: string,
  attachments: NoteAttachment[],
) {
  if (!attachments.length) {
    return;
  }

  await updateDoc(clientNoteDoc(userId, noteId), {
    attachments: arrayUnion(...attachments),
    updatedAt: serverTimestamp(),
  });
}

export async function removeAttachments(
  userId: string,
  noteId: string,
  attachments: NoteAttachment[],
) {
  if (!attachments.length) {
    return;
  }

  await updateDoc(clientNoteDoc(userId, noteId), {
    attachments: arrayRemove(...attachments),
    updatedAt: serverTimestamp(),
  });
}

export async function restoreNote(userId: string, noteId: string) {
  await updateDoc(clientNoteDoc(userId, noteId), {
    deletedAt: null,
    updatedAt: serverTimestamp(),
  });
}

export async function permanentlyDeleteNote(userId: string, noteId: string) {
  const noteRef = clientNoteDoc(userId, noteId).withConverter(noteConverter);
  const snapshot = await getDoc(noteRef);

  if (snapshot.exists()) {
    const note = snapshot.data();
    if (note.attachments?.length) {
      const storage = getFirebaseStorage();
      await Promise.all(
        note.attachments
          .filter((attachment) => attachment.storagePath)
          .map((attachment) => deleteObject(ref(storage, attachment.storagePath))),
      );
    }
  }

  await deleteDoc(clientNoteDoc(userId, noteId));
}

export async function uploadNoteAttachment(
  userId: string,
  noteId: string,
  file: File,
): Promise<NoteAttachment> {
  const storage = getFirebaseStorage();
  const attachmentId = generateUUID();
  const sanitizedName = file.name.replace(/\s+/g, "-");
  const storagePath = `${noteDocPath(userId, noteId)}/attachments/${attachmentId}-${sanitizedName}`;
  const fileRef = ref(storage, storagePath);

  const uploadResult = await uploadBytes(fileRef, file, {
    contentType: file.type,
    customMetadata: {
      originalName: file.name,
    },
  });

  const downloadURL = await getDownloadURL(uploadResult.ref);

  return {
    id: attachmentId,
    name: file.name,
    storagePath,
    downloadURL,
    contentType: file.type,
    size: file.size,
  };
}

export async function deleteAttachment(storagePath: string) {
  const storage = getFirebaseStorage();
  const fileRef = ref(storage, storagePath);
  await deleteObject(fileRef);
}

// Paginated query for infinite scroll
export interface GetNotesOptions {
  limit?: number;
  startAfter?: DocumentSnapshot;
  sortBy?: "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  spaceId?: string;
}

export interface GetNotesResult {
  notes: Note[];
  lastDoc: DocumentSnapshot | null;
}

export async function getUserNotes(
  userId: string,
  options: GetNotesOptions = {},
): Promise<GetNotesResult> {
  const {
    limit: limitCount = 20,
    startAfter: startAfterDoc,
    sortBy = "updatedAt",
    sortOrder = "desc",
    spaceId,
  } = options;

  // Build query constraints
  const constraints: QueryConstraint[] = [
    orderBy("pinned", "desc"),
    orderBy(sortBy, sortOrder),
    limit(limitCount),
  ];

  // Add cursor pagination
  if (startAfterDoc) {
    constraints.push(startAfter(startAfterDoc));
  }

  const notesRef = query(
    clientNoteCollection(userId).withConverter(noteConverter),
    ...constraints,
  );

  const snapshot = await getDocs(notesRef);

  let notes = snapshot.docs.map((doc) => doc.data());

  // Filter by space (client-side for now, similar to Journal)
  if (spaceId && spaceId !== "personal") {
    notes = notes.filter((note) => note.spaceId === spaceId);
  } else {
    // Personal space: notes without spaceId
    notes = notes.filter((note) => !note.spaceId || note.spaceId === "personal");
  }

  // Filter out deleted and archived notes
  notes = notes.filter((note) => !note.deletedAt && !note.archived);

  const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

  return { notes, lastDoc };
}

// Batch update notes
export async function batchUpdateNotes(
  userId: string,
  noteIds: string[],
  updates: Partial<NoteDraft>,
) {
  const db = getFirebaseFirestore();
  const batch = writeBatch(db);

  for (const noteId of noteIds) {
    const noteRef = clientNoteDoc(userId, noteId);
    batch.update(noteRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  await batch.commit();
}

// Batch delete notes (soft delete)
export async function batchDeleteNotes(userId: string, noteIds: string[]) {
  const db = getFirebaseFirestore();
  const batch = writeBatch(db);

  for (const noteId of noteIds) {
    const noteRef = clientNoteDoc(userId, noteId);
    batch.update(noteRef, {
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  await batch.commit();
}

// Migrate notes in a shared space to populate sharedWithUserIds
// Call this when a space is selected to fix any notes that were created before the sharing fix
export async function migrateSpaceNotesSharing(
  userId: string,
  spaceId: string,
): Promise<number> {
  if (!spaceId || spaceId === "personal") {
    return 0;
  }

  const space = await getSpace(spaceId);
  if (!space?.memberUids || space.memberUids.length < 2) {
    return 0; // No other members to share with
  }

  const sharedWithUserIds = space.memberUids.filter((uid) => uid !== userId);
  if (sharedWithUserIds.length === 0) {
    return 0;
  }

  // Query owned notes in this space that don't have proper sharedWithUserIds
  const notesRef = query(
    clientNoteCollection(userId).withConverter(noteConverter),
    where("spaceId", "==", spaceId),
  );

  const snapshot = await getDocs(notesRef);
  const db = getFirebaseFirestore();
  const batch = writeBatch(db);
  let updateCount = 0;

  snapshot.docs.forEach((docSnapshot) => {
    const note = docSnapshot.data();
    const existingSharedWith = note.sharedWithUserIds || [];

    // Check if all space members are already in sharedWithUserIds
    const missingMembers = sharedWithUserIds.filter(
      (uid) => !existingSharedWith.includes(uid)
    );

    if (missingMembers.length > 0) {
      const noteRef = clientNoteDoc(userId, docSnapshot.id);
      batch.update(noteRef, {
        sharedWithUserIds: [...new Set([...existingSharedWith, ...sharedWithUserIds])],
      });
      updateCount++;
    }
  });

  if (updateCount > 0) {
    await batch.commit();
  }

  return updateCount;
}
