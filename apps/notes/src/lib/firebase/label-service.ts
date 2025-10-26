import {
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { clientLabelCollection } from "@/lib/firebase/client-collections";
import { labelConverter, createLabelPayload } from "@/lib/firebase/label-converter";
import type { Label, LabelDraft } from "@/lib/types/note";
import { clientNoteCollection } from "@/lib/firebase/client-collections";

export type LabelsSubscriptionHandler = (labels: Label[]) => void;

export function subscribeToLabels(
  userId: string,
  handler: LabelsSubscriptionHandler,
): Unsubscribe {
  const labelsQuery = query(
    clientLabelCollection(userId).withConverter(labelConverter),
    orderBy("name", "asc"),
  );

  return onSnapshot(labelsQuery, (snapshot) => {
    handler(snapshot.docs.map((doc) => doc.data()));
  });
}

export async function createLabel(userId: string, draft: LabelDraft) {
  const docRef = await addDoc(
    clientLabelCollection(userId),
    createLabelPayload(userId, draft),
  );

  return docRef.id;
}

export async function updateLabel(
  userId: string,
  labelId: string,
  updates: LabelDraft,
) {
  const payload: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (typeof updates.name === "string") {
    payload.name = updates.name;
  }

  if (updates.color) {
    payload.color = updates.color;
  }

  if (updates.parentId !== undefined) {
    payload.parentId = updates.parentId;
  }

  await updateDoc(doc(clientLabelCollection(userId), labelId), payload);
}

export async function deleteLabel(userId: string, labelId: string) {
  await deleteDoc(doc(clientLabelCollection(userId), labelId));

  // Remove label reference from notes.
  const notesWithLabelQuery = query(
    clientNoteCollection(userId),
    where("labelIds", "array-contains", labelId),
  );

  const snapshot = await getDocs(notesWithLabelQuery);

  await Promise.all(
    snapshot.docs.map((doc) =>
      updateDoc(doc.ref, {
        labelIds: (doc.data().labelIds ?? []).filter(
          (id: string) => id !== labelId,
        ),
        updatedAt: serverTimestamp(),
      }),
    ),
  );
}
