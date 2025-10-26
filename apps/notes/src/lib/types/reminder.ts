import type { Timestamp } from "firebase/firestore";
import type { ReminderChannel } from "@/lib/types/settings";

export type ReminderFrequency = "once" | "daily" | "weekly" | "custom";

export type ReminderStatus = "scheduled" | "sent" | "snoozed" | "cancelled" | "completed";

export type ReminderDoc = {
  ownerId: string;
  noteId: string;
  fireAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  channels: ReminderChannel[];
  status: ReminderStatus;
  snoozeUntil?: Timestamp | null;
  titleSnapshot: string;
  bodySnapshot: string;
  labelIds: string[];
  frequency: ReminderFrequency;
  customCron?: string | null;
  lastSentAt?: Timestamp | null;
};

export type Reminder = Omit<
  ReminderDoc,
  "fireAt" | "createdAt" | "updatedAt" | "snoozeUntil" | "lastSentAt"
> & {
  id: string;
  fireAt: Date;
  createdAt: Date;
  updatedAt: Date;
  snoozeUntil?: Date | null;
  lastSentAt?: Date | null;
};
