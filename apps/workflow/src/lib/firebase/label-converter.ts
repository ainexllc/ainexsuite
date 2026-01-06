import {
  type FirestoreDataConverter,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import type { Label, LabelDoc, LabelDraft } from "@/lib/types/workflow";

function toDate(value?: Timestamp | null) {
  return value instanceof Timestamp ? value.toDate() : new Date();
}

export const labelConverter: FirestoreDataConverter<Label> = {
  toFirestore(label: Label) {
    const { id: _id, createdAt, updatedAt, ...rest } = label;
    void _id;

    return {
      ...rest,
      createdAt: createdAt ? Timestamp.fromDate(createdAt) : serverTimestamp(),
      updatedAt: updatedAt ? Timestamp.fromDate(updatedAt) : serverTimestamp(),
    };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options) as LabelDoc;

    return {
      id: snapshot.id,
      ownerId: data.ownerId,
      name: data.name ?? "",
      color: data.color ?? "default",
      parentId: data.parentId ?? null,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    };
  },
};

export function createLabelPayload(
  ownerId: string,
  draft: LabelDraft,
) {
  const now = serverTimestamp();

  return {
    ownerId,
    name: draft.name ?? "",
    color: draft.color ?? "default",
    parentId: draft.parentId ?? null,
    createdAt: now,
    updatedAt: now,
  };
}
