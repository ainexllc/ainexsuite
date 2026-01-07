import {
  type FirestoreDataConverter,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import type { Table, TableDoc, TableCollaborator } from "@/lib/types/table";

function toDate(value?: Timestamp | null) {
  return value instanceof Timestamp ? value.toDate() : new Date();
}

function toOptionalDate(value?: Timestamp | null) {
  return value instanceof Timestamp ? value.toDate() : null;
}

export const tableConverter: FirestoreDataConverter<Table> = {
  toFirestore(table: Table) {
    const {
      id: _id,
      createdAt,
      updatedAt,
      reminderAt,
      tableDate,
      sharedWith,
      sharedWithUserIds,
      deletedAt,
      ...rest
    } = table;
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
      tableDate: tableDate ? Timestamp.fromDate(tableDate) : null,
      createdAt: createdAt ? Timestamp.fromDate(createdAt) : serverTimestamp(),
      updatedAt: updatedAt ? Timestamp.fromDate(updatedAt) : serverTimestamp(),
      sharedWith: collaboratorDocs,
      sharedWithUserIds: sharedWithUserIds ?? [],
      deletedAt: deletedAt ? Timestamp.fromDate(deletedAt) : null,
    };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options) as TableDoc;

    return {
      id: snapshot.id,
      ownerId: data.ownerId,
      spaceId: data.spaceId,
      title: data.title,
      body: data.body,
      type: data.type,
      checklist: data.checklist ?? [],
      spreadsheet: data.spreadsheet,
      color: (data.color ?? "default") as TableDoc["color"],
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
      tableDate: toOptionalDate(data.tableDate),
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
      deletedAt: toOptionalDate(data.deletedAt),
    };
  },
};

export function createTablePayload(
  ownerId: string,
  overrides: Partial<
    Omit<TableDoc, "createdAt" | "updatedAt" | "reminderAt" | "tableDate" | "sharedWith" | "deletedAt">
  > & {
    type: TableDoc["type"];
    reminderAt?: Date | null;
    tableDate?: Date | null;
    deletedAt?: Date | null;
    sharedWith?: TableCollaborator[];
    spaceId?: string;
    backgroundImage?: string | null;
    backgroundOverlay?: TableDoc["backgroundOverlay"];
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
    ...(overrides.spreadsheet ? { spreadsheet: overrides.spreadsheet } : {}),
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
    tableDate: overrides.tableDate
      ? Timestamp.fromDate(overrides.tableDate)
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
