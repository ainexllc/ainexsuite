/**
 * Label Service for Projects App
 *
 * Provides Firestore operations for managing project labels.
 * Collection path: users/{userId}/labels
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
  Timestamp,
  type FirestoreDataConverter,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@ainexsuite/firebase";
import type { Label, LabelDoc, LabelDraft, ProjectColor } from "@/lib/types/project";

// ============ Collection Path Helpers ============

function userDocPath(userId: string): string {
  return `users/${userId}`;
}

function labelCollectionPath(userId: string): string {
  return `${userDocPath(userId)}/labels`;
}

function labelDocPath(userId: string, labelId: string): string {
  return `${labelCollectionPath(userId)}/${labelId}`;
}

// ============ Collection References ============

function getLabelCollection(userId: string) {
  return collection(db, labelCollectionPath(userId));
}

function getLabelDoc(userId: string, labelId: string) {
  return doc(db, labelDocPath(userId, labelId));
}

// ============ Firestore Converter ============

/**
 * Firestore converter for Label documents.
 * Handles transformation between Label (app type) and LabelDoc (Firestore type).
 */
export const labelConverter: FirestoreDataConverter<Label> = {
  toFirestore(label: Label): LabelDoc {
    const { id: _id, createdAt, updatedAt, ...rest } = label;
    void _id; // Explicitly ignore id

    return {
      ...rest,
      createdAt: Timestamp.fromDate(createdAt),
      updatedAt: Timestamp.fromDate(updatedAt),
    };
  },

  fromFirestore(snapshot, options): Label {
    const data = snapshot.data(options) as LabelDoc;
    const now = new Date();

    return {
      id: snapshot.id,
      ownerId: data.ownerId,
      name: data.name,
      color: data.color,
      parentId: data.parentId ?? null,
      createdAt: data.createdAt?.toDate() ?? now,
      updatedAt: data.updatedAt?.toDate() ?? now,
    };
  },
};

// ============ Payload Creators ============

/**
 * Creates a Firestore-ready payload for a new label.
 */
function createLabelPayload(
  ownerId: string,
  draft: LabelDraft
): Omit<LabelDoc, "createdAt" | "updatedAt"> & {
  createdAt: ReturnType<typeof serverTimestamp>;
  updatedAt: ReturnType<typeof serverTimestamp>;
} {
  const now = serverTimestamp();

  return {
    ownerId,
    name: draft.name ?? "Untitled label",
    color: draft.color ?? ("default" as ProjectColor),
    parentId: draft.parentId ?? null,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Creates a Firestore-ready update payload from a draft.
 */
function createUpdatePayload(draft: LabelDraft): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (typeof draft.name === "string") {
    payload.name = draft.name;
  }

  if (draft.color !== undefined) {
    payload.color = draft.color;
  }

  if (draft.parentId !== undefined) {
    payload.parentId = draft.parentId;
  }

  return payload;
}

// ============ Subscription Handler Type ============

export type LabelsSubscriptionHandler = (labels: Label[]) => void;

// ============ Service Functions ============

/**
 * Subscribes to real-time updates of a user's labels.
 * Labels are ordered alphabetically by name.
 *
 * @param userId - The user's ID
 * @param handler - Callback function that receives the updated labels array
 * @returns Unsubscribe function to stop listening
 *
 * @example
 * const unsubscribe = subscribeToLabels(userId, (labels) => {
 *   setLabels(labels);
 * });
 *
 * // Later, to stop listening:
 * unsubscribe();
 */
export function subscribeToLabels(
  userId: string,
  handler: LabelsSubscriptionHandler
): Unsubscribe {
  const labelsQuery = query(
    getLabelCollection(userId).withConverter(labelConverter),
    orderBy("name", "asc")
  );

  return onSnapshot(
    labelsQuery,
    (snapshot) => {
      const labels = snapshot.docs.map((doc) => doc.data());
      handler(labels);
    },
    (error) => {
      console.error("[label-service] subscribeToLabels error:", error);
      // Return empty array on error to prevent UI breakage
      handler([]);
    }
  );
}

/**
 * Creates a new label for the user.
 *
 * @param userId - The user's ID
 * @param draft - Partial label data (name, color, parentId)
 * @returns The ID of the newly created label
 *
 * @example
 * const labelId = await createLabel(userId, {
 *   name: "High Priority",
 *   color: "project-tangerine"
 * });
 */
export async function createLabel(
  userId: string,
  draft: LabelDraft
): Promise<string> {
  const payload = createLabelPayload(userId, draft);
  const docRef = await addDoc(getLabelCollection(userId), payload);
  return docRef.id;
}

/**
 * Updates an existing label.
 *
 * @param userId - The user's ID
 * @param labelId - The label's ID
 * @param draft - Partial label data to update
 *
 * @example
 * await updateLabel(userId, labelId, {
 *   name: "Updated Name",
 *   color: "project-mint"
 * });
 */
export async function updateLabel(
  userId: string,
  labelId: string,
  draft: LabelDraft
): Promise<void> {
  const payload = createUpdatePayload(draft);
  await updateDoc(getLabelDoc(userId, labelId), payload);
}

/**
 * Deletes a label.
 *
 * Note: This does NOT automatically remove the label reference from projects.
 * If you need to clean up project references, handle that separately or
 * use a Cloud Function trigger.
 *
 * @param userId - The user's ID
 * @param labelId - The label's ID to delete
 *
 * @example
 * await deleteLabel(userId, labelId);
 */
export async function deleteLabel(
  userId: string,
  labelId: string
): Promise<void> {
  await deleteDoc(getLabelDoc(userId, labelId));
}

/**
 * Deletes a label and removes its reference from all projects.
 * Use this when you want to ensure data consistency.
 *
 * @param userId - The user's ID
 * @param labelId - The label's ID to delete
 * @param projectsCollectionPath - Optional custom path to projects collection
 *
 * @example
 * await deleteLabelWithCleanup(userId, labelId);
 */
export async function deleteLabelWithCleanup(
  userId: string,
  labelId: string,
  projectsCollectionPath?: string
): Promise<void> {
  // Delete the label first
  await deleteDoc(getLabelDoc(userId, labelId));

  // Clean up label references from projects
  const projectsPath = projectsCollectionPath ?? `${userDocPath(userId)}/projects`;
  const projectsCollection = collection(db, projectsPath);

  const projectsWithLabelQuery = query(
    projectsCollection,
    where("labelIds", "array-contains", labelId)
  );

  const snapshot = await getDocs(projectsWithLabelQuery);

  await Promise.all(
    snapshot.docs.map((docSnapshot) =>
      updateDoc(docSnapshot.ref, {
        labelIds: (docSnapshot.data().labelIds ?? []).filter(
          (id: string) => id !== labelId
        ),
        updatedAt: serverTimestamp(),
      })
    )
  );
}

/**
 * Retrieves a single label by ID.
 *
 * @param userId - The user's ID
 * @param labelId - The label's ID
 * @returns The label if found, null otherwise
 *
 * @example
 * const label = await getLabel(userId, labelId);
 * if (label) {
 *   console.log(label.name);
 * }
 */
export async function getLabel(
  userId: string,
  labelId: string
): Promise<Label | null> {
  const docRef = getLabelDoc(userId, labelId).withConverter(labelConverter);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data();
}

/**
 * Retrieves all labels for a user (one-time fetch).
 * Prefer subscribeToLabels for real-time updates.
 *
 * @param userId - The user's ID
 * @returns Array of labels, ordered by name
 *
 * @example
 * const labels = await getLabels(userId);
 */
export async function getLabels(userId: string): Promise<Label[]> {
  const labelsQuery = query(
    getLabelCollection(userId).withConverter(labelConverter),
    orderBy("name", "asc")
  );

  const snapshot = await getDocs(labelsQuery);
  return snapshot.docs.map((doc) => doc.data());
}

/**
 * Retrieves multiple labels by their IDs.
 * Useful for fetching labels associated with a project.
 *
 * @param userId - The user's ID
 * @param labelIds - Array of label IDs to fetch
 * @returns Array of found labels (missing labels are filtered out)
 *
 * @example
 * const projectLabels = await getLabelsByIds(userId, project.labelIds);
 */
export async function getLabelsByIds(
  userId: string,
  labelIds: string[]
): Promise<Label[]> {
  if (labelIds.length === 0) {
    return [];
  }

  // Firestore 'in' queries are limited to 30 items
  // For larger sets, we need to batch the queries
  const BATCH_SIZE = 30;
  const batches: string[][] = [];

  for (let i = 0; i < labelIds.length; i += BATCH_SIZE) {
    batches.push(labelIds.slice(i, i + BATCH_SIZE));
  }

  const results: Label[] = [];

  for (const batch of batches) {
    // Use individual gets for small batches, or 'in' query for larger ones
    if (batch.length <= 10) {
      // Individual gets are more efficient for small numbers
      const promises = batch.map((id) => getLabel(userId, id));
      const labels = await Promise.all(promises);
      results.push(...labels.filter((label): label is Label => label !== null));
    } else {
      // Use 'in' query for larger batches
      // Note: This requires fetching all labels and filtering client-side
      // since Firestore doesn't support 'in' on document IDs directly
      const allLabels = await getLabels(userId);
      const batchSet = new Set(batch);
      results.push(...allLabels.filter((label) => batchSet.has(label.id)));
    }
  }

  return results;
}
