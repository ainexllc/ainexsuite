import {
  type FirestoreDataConverter,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import type { Label, LabelDoc, LabelDraft } from "@/lib/types/doc";

export const labelConverter: FirestoreDataConverter<Label> = {
  toFirestore(label: Label) {
    const { id: _id, createdAt, updatedAt, ...rest } = label;
    void _id;

    return {
      ...rest,
      createdAt: Timestamp.fromDate(createdAt),
      updatedAt: Timestamp.fromDate(updatedAt),
    } satisfies LabelDoc;
  },
  fromFirestore(snapshot, options) {
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
    } satisfies Label;
  },
};

export function createLabelPayload(ownerId: string, draft: LabelDraft) {
  const now = serverTimestamp();

  return {
    ownerId,
    name: draft.name ?? "Untitled label",
    color: draft.color ?? "doc-fog",
    parentId: draft.parentId ?? null,
    createdAt: now,
    updatedAt: now,
  };
}
