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
  clientTableCollection,
  clientTableDoc,
} from "@/lib/firebase/client-collections";
import { getFirebaseFirestore } from "@/lib/firebase/client-app";
import { tableDocPath } from "@/lib/firebase/collections";
import {
  tableConverter,
  createTablePayload,
} from "@/lib/firebase/table-converter";
import { getSpace } from "@/lib/firebase/space-service";
import type {
  Table,
  ChecklistItem,
  TableAttachment,
  TableDraft,
  TableType,
  TableColor,
  TablePattern,
} from "@/lib/types/table";
import { getFirebaseStorage } from "@/lib/firebase/client-app";

export type TablesSubscriptionHandler = (tables: Table[]) => void;

export function subscribeToOwnedTables(
  userId: string,
  handler: TablesSubscriptionHandler,
  onError?: (error: Error) => void,
): Unsubscribe {
  const tablesRef = query(
    clientTableCollection(userId).withConverter(tableConverter),
    orderBy("pinned", "desc"),
    orderBy("updatedAt", "desc"),
  );

  return onSnapshot(
    tablesRef,
    (snapshot) => {
      const tables = snapshot.docs.map((tableSnapshot) => tableSnapshot.data());
      handler(tables);
    },
    (error) => {
      if (onError) onError(error);
    },
  );
}

export function subscribeToSharedTables(
  userId: string,
  handler: TablesSubscriptionHandler,
  onError?: (error: Error) => void,
): Unsubscribe {
  const sharedRef = query(
    collectionGroup(getFirebaseFirestore(), "tables").withConverter(tableConverter),
    where("sharedWithUserIds", "array-contains", userId),
    orderBy("pinned", "desc"),
    orderBy("updatedAt", "desc"),
  );

  return onSnapshot(
    sharedRef,
    (snapshot) => {
      const tables = snapshot.docs.map((tableSnapshot) => tableSnapshot.data());
      handler(tables);
    },
    (error) => {
      if (onError) onError(error);
    },
  );
}

/**
 * Subscribe to all tables in a specific space (from any user).
 * Uses collectionGroup query with spaceId filter.
 * Firestore rules must allow access based on space membership.
 */
export function subscribeToSpaceTables(
  spaceId: string,
  userId: string,
  handler: TablesSubscriptionHandler,
  onError?: (error: Error) => void,
): Unsubscribe {
  // Skip for personal space
  if (!spaceId || spaceId === "personal") {
    handler([]);
    return () => {};
  }

  const spaceTablesRef = query(
    collectionGroup(getFirebaseFirestore(), "tables").withConverter(tableConverter),
    where("spaceId", "==", spaceId),
    orderBy("pinned", "desc"),
    orderBy("updatedAt", "desc"),
  );

  return onSnapshot(
    spaceTablesRef,
    (snapshot) => {
      // Filter out current user's tables (they come from subscribeToOwnedTables)
      const tables = snapshot.docs
        .map((tableSnapshot) => tableSnapshot.data())
        .filter(table => table.ownerId !== userId);
      handler(tables);
    },
    (error) => {
      console.error("[Tables] Error subscribing to space tables:", error);
      if (onError) onError(error);
    },
  );
}

export async function createTable(
  userId: string,
  input: {
    title?: string;
    body?: string;
    type?: TableType;
    checklist?: ChecklistItem[];
    spreadsheet?: Table["spreadsheet"];
    color?: TableColor;
    pattern?: TablePattern;
    backgroundImage?: string | null;
    pinned?: boolean;
    archived?: boolean;
    labelIds?: string[];
    reminderAt?: Date | null;
    reminderId?: string | null;
    tableDate?: Date | null;
    spaceId?: string;
  },
) {
  const type = input.type ?? (input.checklist?.length ? "checklist" : "text");

  // For shared spaces, add all space members to sharedWithUserIds
  let sharedWithUserIds: string[] = [];
  if (input.spaceId && input.spaceId !== "personal") {
    const space = await getSpace(input.spaceId);
    if (space?.memberUids) {
      // Include all members except the table owner
      sharedWithUserIds = space.memberUids.filter((uid) => uid !== userId);
    }
  }

  const tableData = createTablePayload(userId, {
    ...input,
    type,
    spaceId: input.spaceId,
    sharedWithUserIds,
  });

  const tableRef = await addDoc(clientTableCollection(userId), tableData);

  return tableRef.id;
}

export async function updateDoc(
  userId: string,
  tableId: string,
  updates: TableDraft,
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

  if (updates.spreadsheet !== undefined) {
    payload.spreadsheet = updates.spreadsheet;
    payload.type = "spreadsheet";
  }

  if (updates.type !== undefined) {
    payload.type = updates.type;
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

  if (updates.tableDate !== undefined) {
    payload.tableDate = updates.tableDate
      ? Timestamp.fromDate(updates.tableDate)
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

  await updateFirestoreDoc(clientTableDoc(userId, tableId), payload);
}

export async function togglePin(userId: string, tableId: string, pinned: boolean) {
  await updateFirestoreDoc(clientTableDoc(userId, tableId), {
    pinned,
    updatedAt: serverTimestamp(),
  });
}

export async function toggleArchive(
  userId: string,
  tableId: string,
  archived: boolean,
) {
  await updateFirestoreDoc(clientTableDoc(userId, tableId), {
    archived,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTable(userId: string, tableId: string) {
  await updateFirestoreDoc(clientTableDoc(userId, tableId), {
    deletedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function addAttachments(
  userId: string,
  tableId: string,
  attachments: TableAttachment[],
) {
  if (!attachments.length) {
    return;
  }

  await updateFirestoreDoc(clientTableDoc(userId, tableId), {
    attachments: arrayUnion(...attachments),
    updatedAt: serverTimestamp(),
  });
}

export async function removeAttachments(
  userId: string,
  tableId: string,
  attachments: TableAttachment[],
) {
  if (!attachments.length) {
    return;
  }

  await updateFirestoreDoc(clientTableDoc(userId, tableId), {
    attachments: arrayRemove(...attachments),
    updatedAt: serverTimestamp(),
  });
}

export async function restoreTable(userId: string, tableId: string) {
  await updateFirestoreDoc(clientTableDoc(userId, tableId), {
    deletedAt: null,
    updatedAt: serverTimestamp(),
  });
}

export async function permanentlyDeleteTable(userId: string, tableId: string) {
  const tableRef = clientTableDoc(userId, tableId).withConverter(tableConverter);
  const snapshot = await getDoc(tableRef);

  if (snapshot.exists()) {
    const table = snapshot.data();
    if (table.attachments?.length) {
      const storage = getFirebaseStorage();
      await Promise.all(
        table.attachments
          .filter((attachment) => attachment.storagePath)
          .map((attachment) => deleteObject(ref(storage, attachment.storagePath))),
      );
    }
  }

  await deleteFirestoreDoc(clientTableDoc(userId, tableId));
}

export async function uploadTableAttachment(
  userId: string,
  tableId: string,
  file: File,
): Promise<TableAttachment> {
  const storage = getFirebaseStorage();
  const attachmentId = generateUUID();
  const sanitizedName = file.name.replace(/\s+/g, "-");
  const storagePath = `${tableDocPath(userId, tableId)}/attachments/${attachmentId}-${sanitizedName}`;
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
export interface GetTablesOptions {
  limit?: number;
  startAfter?: DocumentSnapshot;
  sortBy?: "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  spaceId?: string;
}

export interface GetTablesResult {
  tables: Table[];
  lastDoc: DocumentSnapshot | null;
}

export async function getUserTables(
  userId: string,
  options: GetTablesOptions = {},
): Promise<GetTablesResult> {
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

  const tablesRef = query(
    clientTableCollection(userId).withConverter(tableConverter),
    ...constraints,
  );

  const snapshot = await getDocs(tablesRef);

  let tables = snapshot.docs.map((tableSnapshot) => tableSnapshot.data());

  // Filter by space (client-side for now, similar to Journal)
  if (spaceId && spaceId !== "personal") {
    tables = tables.filter(table => table.spaceId === spaceId);
  } else {
    // Personal space: tables without spaceId
    tables = tables.filter(table => !table.spaceId || table.spaceId === "personal");
  }

  // Filter out deleted and archived tables
  tables = tables.filter(table => !table.deletedAt && !table.archived);

  const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

  return { tables, lastDoc };
}

// Batch update tables
export async function batchUpdateTables(
  userId: string,
  tableIds: string[],
  updates: Partial<TableDraft>,
) {
  const db = getFirebaseFirestore();
  const batch = writeBatch(db);

  for (const tableId of tableIds) {
    const tableRef = clientTableDoc(userId, tableId);
    batch.update(tableRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  await batch.commit();
}

// Batch delete tables (soft delete)
export async function batchDeleteTables(userId: string, tableIds: string[]) {
  const db = getFirebaseFirestore();
  const batch = writeBatch(db);

  for (const tableId of tableIds) {
    const tableRef = clientTableDoc(userId, tableId);
    batch.update(tableRef, {
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  await batch.commit();
}

// Migrate tables in a shared space to populate sharedWithUserIds
// Call this when a space is selected to fix any tables that were created before the sharing fix
export async function migrateSpaceTablesSharing(
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

  // Query owned tables in this space that don't have proper sharedWithUserIds
  const tablesRef = query(
    clientTableCollection(userId).withConverter(tableConverter),
    where("spaceId", "==", spaceId),
  );

  const snapshot = await getDocs(tablesRef);
  const db = getFirebaseFirestore();
  const batch = writeBatch(db);
  let updateCount = 0;

  snapshot.docs.forEach((tableSnapshot) => {
    const table = tableSnapshot.data();
    const existingSharedWith = table.sharedWithUserIds || [];

    // Check if all space members are already in sharedWithUserIds
    const missingMembers = sharedWithUserIds.filter(
      (uid) => !existingSharedWith.includes(uid)
    );

    if (missingMembers.length > 0) {
      const tableRef = clientTableDoc(userId, tableSnapshot.id);
      batch.update(tableRef, {
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
