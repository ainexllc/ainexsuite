import {
  type FirestoreDataConverter,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import type { Doc, DocDoc, DocCollaborator } from "@/lib/types/doc";

function toDate(value?: Timestamp | null) {
  return value instanceof Timestamp ? value.toDate() : new Date();
}

function toOptionalDate(value?: Timestamp | null) {
  return value instanceof Timestamp ? value.toDate() : null;
}

export const docConverter: FirestoreDataConverter<Doc> = {
  toFirestore(doc: Doc) {
    const {
      id: _id,
      createdAt,
      updatedAt,
      reminderAt,
      docDate,
      sharedWith,
      sharedWithUserIds,
      deletedAt,
      ...rest
    } = doc;
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
      docDate: docDate ? Timestamp.fromDate(docDate) : null,
      createdAt: createdAt ? Timestamp.fromDate(createdAt) : serverTimestamp(),
      updatedAt: updatedAt ? Timestamp.fromDate(updatedAt) : serverTimestamp(),
      sharedWith: collaboratorDocs,
      sharedWithUserIds: sharedWithUserIds ?? [],
      deletedAt: deletedAt ? Timestamp.fromDate(deletedAt) : null,
    };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options) as DocDoc;

    return {
      id: snapshot.id,
      ownerId: data.ownerId,
      spaceId: data.spaceId,
      title: data.title,
      body: data.body,
      type: data.type,
      checklist: data.checklist ?? [],
      color: (data.color ?? "default") as DocDoc["color"],
      pattern: data.pattern ?? "none",
      backgroundImage: data.backgroundImage ?? null,
      backgroundOverlay: data.backgroundOverlay ?? "auto",
      pinned: Boolean(data.pinned),
      priority: data.priority ?? null,
      archived: Boolean(data.archived),
      labelIds: data.labelIds ?? [],
      attachments: data.attachments ?? [],
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
      docDate: toOptionalDate(data.docDate),
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
      deletedAt: toOptionalDate(data.deletedAt),
    };
  },
};

export function createDocPayload(
  ownerId: string,
  overrides: Partial<
    Omit<DocDoc, "createdAt" | "updatedAt" | "reminderAt" | "docDate" | "sharedWith" | "deletedAt">
  > & {
    type: DocDoc["type"];
    reminderAt?: Date | null;
    docDate?: Date | null;
    deletedAt?: Date | null;
    sharedWith?: DocCollaborator[];
    spaceId?: string;
    backgroundImage?: string | null;
    backgroundOverlay?: DocDoc["backgroundOverlay"];
  },
) {
  const now = serverTimestamp();

  return {
    ownerId,
    ...(overrides.spaceId ? { spaceId: overrides.spaceId } : {}),
    title: overrides.title ?? "",
    body: overrides.body ?? "",
    type: overrides.type,
    checklist: overrides.checklist ?? [],
    color: overrides.color ?? "default",
    pattern: overrides.pattern ?? "none",
    backgroundImage: overrides.backgroundImage ?? null,
    backgroundOverlay: overrides.backgroundOverlay ?? "auto",
    pinned: overrides.pinned ?? false,
    priority: overrides.priority ?? null,
    archived: overrides.archived ?? false,
    labelIds: overrides.labelIds ?? [],
    reminderAt: overrides.reminderAt
      ? Timestamp.fromDate(overrides.reminderAt)
      : null,
    reminderId: overrides.reminderId ?? null,
    docDate: overrides.docDate
      ? Timestamp.fromDate(overrides.docDate)
      : null,
    attachments: overrides.attachments ?? [],
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
