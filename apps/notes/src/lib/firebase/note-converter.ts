import {
  type FirestoreDataConverter,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import type { Note, NoteDoc, NoteCollaborator } from "@/lib/types/note";

function toDate(value?: Timestamp | null) {
  return value instanceof Timestamp ? value.toDate() : new Date();
}

function toOptionalDate(value?: Timestamp | null) {
  return value instanceof Timestamp ? value.toDate() : null;
}

export const noteConverter: FirestoreDataConverter<Note> = {
  toFirestore(note: Note) {
    const {
      id: _id,
      createdAt,
      updatedAt,
      reminderAt,
      sharedWith,
      sharedWithUserIds,
      deletedAt,
      ...rest
    } = note;
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
    const data = snapshot.data(options) as NoteDoc;

    return {
      id: snapshot.id,
      ownerId: data.ownerId,
      title: data.title,
      body: data.body,
      type: data.type,
      checklist: data.checklist ?? [],
      color: (data.color ?? "default") as NoteDoc["color"],
      pattern: data.pattern ?? "none",
      pinned: Boolean(data.pinned),
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
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
      deletedAt: toOptionalDate(data.deletedAt),
    };
  },
};

export function createNotePayload(
  ownerId: string,
  overrides: Partial<
    Omit<NoteDoc, "createdAt" | "updatedAt" | "reminderAt" | "sharedWith">
  > & {
    type: NoteDoc["type"];
    reminderAt?: Date | null;
    sharedWith?: NoteCollaborator[];
  },
) {
  const now = serverTimestamp();

  return {
    ownerId,
    title: overrides.title ?? "",
    body: overrides.body ?? "",
    type: overrides.type,
    checklist: overrides.checklist ?? [],
    color: overrides.color ?? "default",
    pattern: overrides.pattern ?? "none",
    pinned: overrides.pinned ?? false,
    archived: overrides.archived ?? false,
    labelIds: overrides.labelIds ?? [],
    reminderAt: overrides.reminderAt
      ? Timestamp.fromDate(overrides.reminderAt)
      : null,
    reminderId: overrides.reminderId ?? null,
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
