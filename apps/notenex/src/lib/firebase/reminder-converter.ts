import {
  type FirestoreDataConverter,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import type { Reminder, ReminderDoc } from "@/lib/types/reminder";

function toDate(value: Timestamp | null | undefined): Date {
  return value instanceof Timestamp ? value.toDate() : new Date();
}

function toOptionalDate(value?: Timestamp | null): Date | null {
  return value instanceof Timestamp ? value.toDate() : null;
}

export const reminderConverter: FirestoreDataConverter<Reminder> = {
  toFirestore(reminder: Reminder) {
    const { id: _id, fireAt, createdAt, updatedAt, snoozeUntil, ...rest } = reminder;
    void _id;

    return {
      ...rest,
      fireAt: Timestamp.fromDate(fireAt),
      snoozeUntil: snoozeUntil ? Timestamp.fromDate(snoozeUntil) : null,
      createdAt: createdAt ? Timestamp.fromDate(createdAt) : serverTimestamp(),
      updatedAt: updatedAt ? Timestamp.fromDate(updatedAt) : serverTimestamp(),
    };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options) as ReminderDoc;

    return {
      id: snapshot.id,
      ownerId: data.ownerId,
      noteId: data.noteId,
      fireAt: toDate(data.fireAt),
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
      channels: data.channels ?? [],
      status: data.status,
      snoozeUntil: toOptionalDate(data.snoozeUntil),
      titleSnapshot: data.titleSnapshot ?? "",
      bodySnapshot: data.bodySnapshot ?? "",
      labelIds: data.labelIds ?? [],
      frequency: data.frequency ?? "once",
      customCron: data.customCron ?? null,
      lastSentAt: toOptionalDate(data.lastSentAt),
    };
  },
};

export function createReminderPayload(
  ownerId: string,
  overrides: Partial<
    Omit<ReminderDoc, "createdAt" | "updatedAt" | "fireAt" | "snoozeUntil" | "lastSentAt">
  > & {
    noteId: string;
    fireAt: Date;
    channels: ReminderDoc["channels"];
    status?: ReminderDoc["status"];
    snoozeUntil?: Date | null;
    lastSentAt?: Date | null;
  },
) {
  const now = serverTimestamp();
  return {
    ownerId,
    noteId: overrides.noteId,
    fireAt: Timestamp.fromDate(overrides.fireAt),
    channels: overrides.channels,
    status: overrides.status ?? "scheduled",
    snoozeUntil: overrides.snoozeUntil
      ? Timestamp.fromDate(overrides.snoozeUntil)
      : null,
    titleSnapshot: overrides.titleSnapshot ?? "",
    bodySnapshot: overrides.bodySnapshot ?? "",
    labelIds: overrides.labelIds ?? [],
    frequency: overrides.frequency ?? "once",
    customCron: overrides.customCron ?? null,
    lastSentAt: overrides.lastSentAt
      ? Timestamp.fromDate(overrides.lastSentAt)
      : null,
    createdAt: now,
    updatedAt: now,
  };
}
