import {
  addDoc,
  deleteDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { clientReminderCollection, clientReminderDoc } from "@/lib/firebase/client-collections";
import { reminderConverter, createReminderPayload } from "@/lib/firebase/reminder-converter";
import type { Reminder } from "@/lib/types/reminder";

export type ReminderSubscriptionHandler = (reminders: Reminder[]) => void;

export function subscribeToUpcomingReminders(
  userId: string,
  handler: ReminderSubscriptionHandler,
): Unsubscribe {
  const remindersRef = query(
    clientReminderCollection(userId).withConverter(reminderConverter),
    where("status", "in", ["scheduled", "snoozed", "sent"]),
    orderBy("fireAt", "asc"),
  );

  return onSnapshot(remindersRef, (snapshot) => {
    const reminders = snapshot.docs.map((docSnapshot) => docSnapshot.data());
    handler(reminders);
  });
}

export async function createReminder(
  userId: string,
  input: Parameters<typeof createReminderPayload>[1],
) {
  const payload = createReminderPayload(userId, input);
  const docRef = await addDoc(clientReminderCollection(userId), payload);
  return docRef.id;
}

export async function updateReminder(
  userId: string,
  reminderId: string,
  updates: Partial<Omit<Reminder, "id" | "ownerId" | "noteId">>,
) {
  const updatePayload: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (updates.fireAt) {
    updatePayload.fireAt = Timestamp.fromDate(updates.fireAt);
  }

  if (updates.channels) {
    updatePayload.channels = updates.channels;
  }

  if (updates.status) {
    updatePayload.status = updates.status;
  }

  if (updates.snoozeUntil !== undefined) {
    updatePayload.snoozeUntil = updates.snoozeUntil
      ? Timestamp.fromDate(updates.snoozeUntil)
      : null;
  }

  if (updates.frequency) {
    updatePayload.frequency = updates.frequency;
  }

  if (updates.customCron !== undefined) {
    updatePayload.customCron = updates.customCron;
  }

  if (updates.titleSnapshot !== undefined) {
    updatePayload.titleSnapshot = updates.titleSnapshot;
  }

  if (updates.bodySnapshot !== undefined) {
    updatePayload.bodySnapshot = updates.bodySnapshot;
  }

  if (updates.labelIds !== undefined) {
    updatePayload.labelIds = updates.labelIds;
  }

  if (updates.lastSentAt !== undefined) {
    updatePayload.lastSentAt = updates.lastSentAt
      ? Timestamp.fromDate(updates.lastSentAt)
      : null;
  }

  await updateDoc(clientReminderDoc(userId, reminderId), updatePayload);
}

export async function deleteReminder(userId: string, reminderId: string) {
  await deleteDoc(clientReminderDoc(userId, reminderId));
}
