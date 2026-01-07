import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collectionGroup,
  deleteDoc as deleteFirestoreDoc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc as updateFirestoreDoc,
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
  clientDocCollection,
  clientDocDoc,
} from "@/lib/firebase/client-collections";
import { getFirebaseFirestore } from "@/lib/firebase/client-app";
import { docDocPath } from "@/lib/firebase/collections";
import {
  docConverter,
  createDocPayload,
} from "@/lib/firebase/doc-converter";
import { getSpace } from "@/lib/firebase/space-service";
import type {
  Doc,
  ChecklistItem,
  DocAttachment,
  DocDraft,
  DocType,
  DocColor,
  DocPattern,
} from "@/lib/types/doc";
import { getFirebaseStorage } from "@/lib/firebase/client-app";

export type DocsSubscriptionHandler = (docs: Doc[]) => void;

export function subscribeToOwnedDocs(
  userId: string,
  handler: DocsSubscriptionHandler,
  onError?: (error: Error) => void,
): Unsubscribe {
  const docsRef = query(
    clientDocCollection(userId).withConverter(docConverter),
    orderBy("pinned", "desc"),
    orderBy("updatedAt", "desc"),
  );

  return onSnapshot(
    docsRef,
    (snapshot) => {
      const docs = snapshot.docs.map((docSnapshot) => docSnapshot.data());
      handler(docs);
    },
    (error) => {
      if (onError) onError(error);
    },
  );
}

export function subscribeToSharedDocs(
  userId: string,
  handler: DocsSubscriptionHandler,
  onError?: (error: Error) => void,
): Unsubscribe {
  const sharedRef = query(
    collectionGroup(getFirebaseFirestore(), "docs").withConverter(docConverter),
    where("sharedWithUserIds", "array-contains", userId),
    orderBy("pinned", "desc"),
    orderBy("updatedAt", "desc"),
  );

  return onSnapshot(
    sharedRef,
    (snapshot) => {
      const docs = snapshot.docs.map((docSnapshot) => docSnapshot.data());
      handler(docs);
    },
    (error) => {
      if (onError) onError(error);
    },
  );
}

/**
 * Subscribe to all docs in a specific space (from any user).
 * Uses collectionGroup query with spaceId filter.
 * Firestore rules must allow access based on space membership.
 */
export function subscribeToSpaceDocs(
  spaceId: string,
  userId: string,
  handler: DocsSubscriptionHandler,
  onError?: (error: Error) => void,
): Unsubscribe {
  // Skip for personal space
  if (!spaceId || spaceId === "personal") {
    handler([]);
    return () => {};
  }

  const spaceDocsRef = query(
    collectionGroup(getFirebaseFirestore(), "docs").withConverter(docConverter),
    where("spaceId", "==", spaceId),
    orderBy("pinned", "desc"),
    orderBy("updatedAt", "desc"),
  );

  return onSnapshot(
    spaceDocsRef,
    (snapshot) => {
      // Filter out current user's docs (they come from subscribeToOwnedDocs)
      const docs = snapshot.docs
        .map((docSnapshot) => docSnapshot.data())
        .filter(doc => doc.ownerId !== userId);
      handler(docs);
    },
    (error) => {
      console.error("[Docs] Error subscribing to space docs:", error);
      if (onError) onError(error);
    },
  );
}

export async function createDoc(
  userId: string,
  input: {
    title?: string;
    body?: string;
    type?: DocType;
    checklist?: ChecklistItem[];
    color?: DocColor;
    pattern?: DocPattern;
    backgroundImage?: string | null;
    pinned?: boolean;
    archived?: boolean;
    labelIds?: string[];
    reminderAt?: Date | null;
    reminderId?: string | null;
    docDate?: Date | null;
    spaceId?: string;
  },
) {
  const type = input.type ?? (input.checklist?.length ? "checklist" : "text");

  // For shared spaces, add all space members to sharedWithUserIds
  let sharedWithUserIds: string[] = [];
  if (input.spaceId && input.spaceId !== "personal") {
    const space = await getSpace(input.spaceId);
    if (space?.memberUids) {
      // Include all members except the doc owner
      sharedWithUserIds = space.memberUids.filter((uid) => uid !== userId);
    }
  }

  const docData = createDocPayload(userId, {
    ...input,
    type,
    spaceId: input.spaceId,
    sharedWithUserIds,
  });

  const docRef = await addDoc(clientDocCollection(userId), docData);

  return docRef.id;
}

export async function updateDoc(
  userId: string,
  docId: string,
  updates: DocDraft,
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

  if (updates.docDate !== undefined) {
    payload.docDate = updates.docDate
      ? Timestamp.fromDate(updates.docDate)
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

  await updateFirestoreDoc(clientDocDoc(userId, docId), payload);
}

export async function togglePin(userId: string, docId: string, pinned: boolean) {
  await updateFirestoreDoc(clientDocDoc(userId, docId), {
    pinned,
    updatedAt: serverTimestamp(),
  });
}

export async function toggleArchive(
  userId: string,
  docId: string,
  archived: boolean,
) {
  await updateFirestoreDoc(clientDocDoc(userId, docId), {
    archived,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteDoc(userId: string, docId: string) {
  await updateFirestoreDoc(clientDocDoc(userId, docId), {
    deletedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function addAttachments(
  userId: string,
  docId: string,
  attachments: DocAttachment[],
) {
  if (!attachments.length) {
    return;
  }

  await updateFirestoreDoc(clientDocDoc(userId, docId), {
    attachments: arrayUnion(...attachments),
    updatedAt: serverTimestamp(),
  });
}

export async function removeAttachments(
  userId: string,
  docId: string,
  attachments: DocAttachment[],
) {
  if (!attachments.length) {
    return;
  }

  await updateFirestoreDoc(clientDocDoc(userId, docId), {
    attachments: arrayRemove(...attachments),
    updatedAt: serverTimestamp(),
  });
}

export async function restoreDoc(userId: string, docId: string) {
  await updateFirestoreDoc(clientDocDoc(userId, docId), {
    deletedAt: null,
    updatedAt: serverTimestamp(),
  });
}

export async function permanentlyDeleteDoc(userId: string, docId: string) {
  const docRef = clientDocDoc(userId, docId).withConverter(docConverter);
  const snapshot = await getDoc(docRef);

  if (snapshot.exists()) {
    const doc = snapshot.data();
    if (doc.attachments?.length) {
      const storage = getFirebaseStorage();
      await Promise.all(
        doc.attachments
          .filter((attachment) => attachment.storagePath)
          .map((attachment) => deleteObject(ref(storage, attachment.storagePath))),
      );
    }
  }

  await deleteFirestoreDoc(clientDocDoc(userId, docId));
}

export async function uploadDocAttachment(
  userId: string,
  docId: string,
  file: File,
): Promise<DocAttachment> {
  const storage = getFirebaseStorage();
  const attachmentId = generateUUID();
  const sanitizedName = file.name.replace(/\s+/g, "-");
  const storagePath = `${docDocPath(userId, docId)}/attachments/${attachmentId}-${sanitizedName}`;
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
export interface GetDocsOptions {
  limit?: number;
  startAfter?: DocumentSnapshot;
  sortBy?: "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  spaceId?: string;
}

export interface GetDocsResult {
  docs: Doc[];
  lastDoc: DocumentSnapshot | null;
}

export async function getUserDocs(
  userId: string,
  options: GetDocsOptions = {},
): Promise<GetDocsResult> {
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

  const docsRef = query(
    clientDocCollection(userId).withConverter(docConverter),
    ...constraints,
  );

  const snapshot = await getDocs(docsRef);

  let docs = snapshot.docs.map((docSnapshot) => docSnapshot.data());

  // Filter by space (client-side for now, similar to Journal)
  if (spaceId && spaceId !== "personal") {
    docs = docs.filter(doc => doc.spaceId === spaceId);
  } else {
    // Personal space: docs without spaceId
    docs = docs.filter(doc => !doc.spaceId || doc.spaceId === "personal");
  }

  // Filter out deleted and archived docs
  docs = docs.filter(doc => !doc.deletedAt && !doc.archived);

  const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

  return { docs, lastDoc };
}

// Batch update docs
export async function batchUpdateDocs(
  userId: string,
  docIds: string[],
  updates: Partial<DocDraft>,
) {
  const db = getFirebaseFirestore();
  const batch = writeBatch(db);

  for (const docId of docIds) {
    const docRef = clientDocDoc(userId, docId);
    batch.update(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  await batch.commit();
}

// Batch delete docs (soft delete)
export async function batchDeleteDocs(userId: string, docIds: string[]) {
  const db = getFirebaseFirestore();
  const batch = writeBatch(db);

  for (const docId of docIds) {
    const docRef = clientDocDoc(userId, docId);
    batch.update(docRef, {
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  await batch.commit();
}

// Migrate docs in a shared space to populate sharedWithUserIds
// Call this when a space is selected to fix any docs that were created before the sharing fix
export async function migrateSpaceDocsSharing(
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

  // Query owned docs in this space that don't have proper sharedWithUserIds
  const docsRef = query(
    clientDocCollection(userId).withConverter(docConverter),
    where("spaceId", "==", spaceId),
  );

  const snapshot = await getDocs(docsRef);
  const db = getFirebaseFirestore();
  const batch = writeBatch(db);
  let updateCount = 0;

  snapshot.docs.forEach((docSnapshot) => {
    const doc = docSnapshot.data();
    const existingSharedWith = doc.sharedWithUserIds || [];

    // Check if all space members are already in sharedWithUserIds
    const missingMembers = sharedWithUserIds.filter(
      (uid) => !existingSharedWith.includes(uid)
    );

    if (missingMembers.length > 0) {
      const docRef = clientDocDoc(userId, docSnapshot.id);
      batch.update(docRef, {
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
