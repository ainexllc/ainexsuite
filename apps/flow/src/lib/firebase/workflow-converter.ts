import {
  type FirestoreDataConverter,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import type {
  Workflow,
  WorkflowDoc,
  WorkflowCollaborator,
} from "@/lib/types/workflow";

function toDate(value?: Timestamp | null) {
  return value instanceof Timestamp ? value.toDate() : new Date();
}

function toOptionalDate(value?: Timestamp | null) {
  return value instanceof Timestamp ? value.toDate() : null;
}

export const workflowConverter: FirestoreDataConverter<Workflow> = {
  toFirestore(workflow: Workflow) {
    const {
      id: _id,
      createdAt,
      updatedAt,
      reminderAt,
      sharedWith,
      sharedWithUserIds,
      deletedAt,
      ...rest
    } = workflow;
    void _id;

    const collaboratorDocs =
      sharedWith?.map((collaborator) => ({
        email: collaborator.email,
        role: collaborator.role,
        userId: collaborator.userId,
        invitedAt: Timestamp.fromDate(collaborator.invitedAt),
      })) ?? [];

    return {
      ...rest,
      reminderAt: reminderAt ? Timestamp.fromDate(reminderAt) : null,
      createdAt: createdAt ? Timestamp.fromDate(createdAt) : serverTimestamp(),
      updatedAt: updatedAt ? Timestamp.fromDate(updatedAt) : serverTimestamp(),
      sharedWith: collaboratorDocs,
      sharedWithUserIds: sharedWithUserIds ?? [],
      deletedAt: deletedAt ? Timestamp.fromDate(deletedAt) : null,
    };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options) as WorkflowDoc;

    return {
      id: snapshot.id,
      ownerId: data.ownerId,
      spaceId: data.spaceId,
      title: data.title ?? "Untitled Workflow",
      description: data.description ?? "",
      nodes: data.nodes ?? [],
      edges: data.edges ?? [],
      viewport: data.viewport ?? { x: 0, y: 0, zoom: 1 },
      edgeType: data.edgeType ?? "smoothstep",
      arrowType: data.arrowType ?? "end",
      lineStyle: data.lineStyle ?? "solid",
      thumbnail: data.thumbnail ?? null,
      nodeCount: data.nodeCount ?? (data.nodes?.length ?? 0),
      color: data.color ?? "default",
      pinned: Boolean(data.pinned),
      priority: data.priority ?? null,
      archived: Boolean(data.archived),
      labelIds: data.labelIds ?? [],
      sharedWithUserIds: data.sharedWithUserIds ?? [],
      sharedWith:
        data.sharedWith?.map((collaborator) => ({
          email: collaborator.email,
          role: collaborator.role,
          userId: collaborator.userId ?? "",
          invitedAt: toDate(collaborator.invitedAt),
        })) ?? [],
      reminderAt: toOptionalDate(data.reminderAt),
      reminderId: data.reminderId ?? null,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
      deletedAt: toOptionalDate(data.deletedAt),
    };
  },
};

export function createWorkflowPayload(
  ownerId: string,
  overrides: Partial<
    Omit<WorkflowDoc, "createdAt" | "updatedAt" | "reminderAt" | "sharedWith" | "deletedAt">
  > & {
    reminderAt?: Date | null;
    deletedAt?: Date | null;
    sharedWith?: WorkflowCollaborator[];
    spaceId?: string;
  },
) {
  const now = serverTimestamp();
  const nodes = overrides.nodes ?? [];

  return {
    ownerId,
    ...(overrides.spaceId ? { spaceId: overrides.spaceId } : {}),
    title: overrides.title ?? "Untitled Workflow",
    description: overrides.description ?? "",
    nodes,
    edges: overrides.edges ?? [],
    viewport: overrides.viewport ?? { x: 0, y: 0, zoom: 1 },
    edgeType: overrides.edgeType ?? "smoothstep",
    arrowType: overrides.arrowType ?? "end",
    lineStyle: overrides.lineStyle ?? "solid",
    thumbnail: overrides.thumbnail ?? null,
    nodeCount: overrides.nodeCount ?? nodes.length,
    color: overrides.color ?? "default",
    pinned: overrides.pinned ?? false,
    priority: overrides.priority ?? null,
    archived: overrides.archived ?? false,
    labelIds: overrides.labelIds ?? [],
    reminderAt: overrides.reminderAt
      ? Timestamp.fromDate(overrides.reminderAt)
      : null,
    reminderId: overrides.reminderId ?? null,
    sharedWith:
      overrides.sharedWith?.map((collaborator) => ({
        email: collaborator.email,
        role: collaborator.role,
        userId: collaborator.userId,
        invitedAt: Timestamp.fromDate(collaborator.invitedAt),
      })) ?? [],
    sharedWithUserIds: overrides.sharedWithUserIds ?? [],
    deletedAt: overrides.deletedAt ? Timestamp.fromDate(overrides.deletedAt) : null,
    createdAt: now,
    updatedAt: now,
  };
}
