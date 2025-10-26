import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collectionGroup,
  deleteDoc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
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
import type {
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
): Unsubscribe {
  const notesRef = query(
    clientNoteCollection(userId).withConverter(noteConverter),
    orderBy("pinned", "desc"),
    orderBy("updatedAt", "desc"),
  );

  return onSnapshot(notesRef, (snapshot) => {
    const notes = snapshot.docs.map((noteSnapshot) => noteSnapshot.data());
    handler(notes);
  });
}

export function subscribeToSharedNotes(
  userId: string,
  handler: NotesSubscriptionHandler,
): Unsubscribe {
  const sharedRef = query(
    collectionGroup(getFirebaseFirestore(), "notes").withConverter(noteConverter),
    where("sharedWithUserIds", "array-contains", userId),
    orderBy("pinned", "desc"),
    orderBy("updatedAt", "desc"),
  );

  return onSnapshot(sharedRef, (snapshot) => {
    const notes = snapshot.docs.map((docSnapshot) => docSnapshot.data());
    handler(notes);
  });
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
    pinned?: boolean;
    archived?: boolean;
    labelIds?: string[];
    reminderAt?: Date | null;
    reminderId?: string | null;
  },
) {
  const type = input.type ?? (input.checklist?.length ? "checklist" : "text");
  const noteData = createNotePayload(userId, {
    ...input,
    type,
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
  const attachmentId = crypto.randomUUID();
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
