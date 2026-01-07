import {
  addDoc,
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
  writeBatch,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@ainexsuite/firebase";
import {
  clientWorkflowCollection,
  clientWorkflowDoc,
  clientLegacyWorkflowDoc,
} from "@/lib/firebase/client-collections";
import {
  workflowConverter,
  createWorkflowPayload,
} from "@/lib/firebase/workflow-converter";
import type {
  Workflow,
  WorkflowDraft,
  WorkflowColor,
  EdgeStyleType,
  ArrowType,
  LineStyleType,
  WorkflowViewport,
} from "@/lib/types/workflow";
import type { Node, Edge } from "@xyflow/react";

export type WorkflowsSubscriptionHandler = (workflows: Workflow[]) => void;

export function subscribeToOwnedWorkflows(
  userId: string,
  handler: WorkflowsSubscriptionHandler,
  onError?: (error: Error) => void,
): Unsubscribe {
  const workflowsRef = query(
    clientWorkflowCollection(userId).withConverter(workflowConverter),
    orderBy("pinned", "desc"),
    orderBy("updatedAt", "desc"),
  );

  return onSnapshot(
    workflowsRef,
    (snapshot) => {
      const workflows = snapshot.docs.map((workflowSnapshot) => workflowSnapshot.data());
      handler(workflows);
    },
    (error) => {
      if (onError) onError(error);
    },
  );
}

export function subscribeToSharedWorkflows(
  userId: string,
  handler: WorkflowsSubscriptionHandler,
  onError?: (error: Error) => void,
): Unsubscribe {
  const sharedRef = query(
    collectionGroup(db, "workflows").withConverter(workflowConverter),
    where("sharedWithUserIds", "array-contains", userId),
    orderBy("pinned", "desc"),
    orderBy("updatedAt", "desc"),
  );

  return onSnapshot(
    sharedRef,
    (snapshot) => {
      const workflows = snapshot.docs.map((docSnapshot) => docSnapshot.data());
      handler(workflows);
    },
    (error) => {
      if (onError) onError(error);
    },
  );
}

export async function createWorkflow(
  userId: string,
  input: {
    title?: string;
    description?: string;
    nodes?: Node[];
    edges?: Edge[];
    viewport?: WorkflowViewport;
    edgeType?: EdgeStyleType;
    arrowType?: ArrowType;
    lineStyle?: LineStyleType;
    color?: WorkflowColor;
    pinned?: boolean;
    archived?: boolean;
    labelIds?: string[];
    reminderAt?: Date | null;
    reminderId?: string | null;
    spaceId?: string;
  },
) {
  const workflowData = createWorkflowPayload(userId, {
    ...input,
    spaceId: input.spaceId,
  });

  const docRef = await addDoc(clientWorkflowCollection(userId), workflowData);

  return docRef.id;
}

export async function updateWorkflow(
  userId: string,
  workflowId: string,
  updates: WorkflowDraft,
) {
  const payload: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (typeof updates.title === "string") {
    payload.title = updates.title;
  }

  if (typeof updates.description === "string") {
    payload.description = updates.description;
  }

  if (updates.nodes !== undefined) {
    payload.nodes = updates.nodes;
    payload.nodeCount = updates.nodes.length;
  }

  if (updates.edges !== undefined) {
    payload.edges = updates.edges;
  }

  if (updates.viewport !== undefined) {
    payload.viewport = updates.viewport;
  }

  if (updates.edgeType !== undefined) {
    payload.edgeType = updates.edgeType;
  }

  if (updates.arrowType !== undefined) {
    payload.arrowType = updates.arrowType;
  }

  if (updates.lineStyle !== undefined) {
    payload.lineStyle = updates.lineStyle;
  }

  if (updates.thumbnail !== undefined) {
    payload.thumbnail = updates.thumbnail;
  }

  if (updates.color !== undefined) {
    payload.color = updates.color;
  }

  if (updates.pinned !== undefined) {
    payload.pinned = updates.pinned;
  }

  if (updates.priority !== undefined) {
    payload.priority = updates.priority;
  }

  if (updates.archived !== undefined) {
    payload.archived = updates.archived;
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
  }

  await updateDoc(clientWorkflowDoc(userId, workflowId), payload);
}

export async function togglePin(userId: string, workflowId: string, pinned: boolean) {
  await updateDoc(clientWorkflowDoc(userId, workflowId), {
    pinned,
    updatedAt: serverTimestamp(),
  });
}

export async function toggleArchive(
  userId: string,
  workflowId: string,
  archived: boolean,
) {
  await updateDoc(clientWorkflowDoc(userId, workflowId), {
    archived,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteWorkflow(userId: string, workflowId: string) {
  // Soft delete - set deletedAt timestamp
  await updateDoc(clientWorkflowDoc(userId, workflowId), {
    deletedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function restoreWorkflow(userId: string, workflowId: string) {
  await updateDoc(clientWorkflowDoc(userId, workflowId), {
    deletedAt: null,
    updatedAt: serverTimestamp(),
  });
}

export async function permanentlyDeleteWorkflow(userId: string, workflowId: string) {
  await deleteDoc(clientWorkflowDoc(userId, workflowId));
}

// Batch update workflows
export async function batchUpdateWorkflows(
  userId: string,
  workflowIds: string[],
  updates: Partial<WorkflowDraft>,
) {
  const batch = writeBatch(db);

  for (const workflowId of workflowIds) {
    const workflowRef = clientWorkflowDoc(userId, workflowId);
    batch.update(workflowRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  await batch.commit();
}

// Batch delete workflows (soft delete)
export async function batchDeleteWorkflows(userId: string, workflowIds: string[]) {
  const batch = writeBatch(db);

  for (const workflowId of workflowIds) {
    const workflowRef = clientWorkflowDoc(userId, workflowId);
    batch.update(workflowRef, {
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  await batch.commit();
}

// Get single workflow
export async function getWorkflow(
  userId: string,
  workflowId: string,
): Promise<Workflow | null> {
  const workflowRef = clientWorkflowDoc(userId, workflowId).withConverter(workflowConverter);
  const snapshot = await getDoc(workflowRef);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data();
}

// Check for legacy workflow and migrate
export async function checkAndMigrateLegacyWorkflow(userId: string): Promise<string | null> {
  try {
    const legacyRef = clientLegacyWorkflowDoc(userId);
    const legacySnap = await getDoc(legacyRef);

    if (!legacySnap.exists()) {
      return null;
    }

    const legacyData = legacySnap.data();

    // Create new workflow from legacy data
    const newWorkflowId = await createWorkflow(userId, {
      title: "My Workflow",
      description: "Migrated from legacy workflow",
      nodes: legacyData.nodes ?? [],
      edges: legacyData.edges ?? [],
      viewport: legacyData.viewport ?? { x: 0, y: 0, zoom: 1 },
      edgeType: legacyData.edgeType ?? "smoothstep",
      arrowType: legacyData.arrowType ?? "end",
      lineStyle: legacyData.lineStyle ?? "solid",
    });

    // Delete legacy document
    await deleteDoc(legacyRef);

    return newWorkflowId;
  } catch (error) {
    console.error("Failed to migrate legacy workflow:", error);
    return null;
  }
}
