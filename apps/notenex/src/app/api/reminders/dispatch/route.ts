import { NextResponse, type NextRequest } from "next/server";
import {
  FieldValue,
  Timestamp,
  type QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { getAdminFirestore, getAdminAuth } from "@/lib/firebase/admin-app";
import { sendEmail, sendSms } from "@/lib/notifications/channels";
import type { ReminderDoc } from "@/lib/types/reminder";
import { serverEnv } from "@/env";
import { adminNoteDoc, adminPreferenceDoc } from "@/lib/firebase/admin-collections";
import type { UserPreferenceDoc } from "@/lib/types/settings";
import type { UserPreferenceDoc } from "@/lib/types/settings";

const MAX_REMINDERS_PER_RUN = 50;

type ProcessedReminder = {
  reminderId: string;
  ownerId: string;
  channels: string[];
  nextFireAt: Date | null;
};

function getTargetTimestamp(data: ReminderDoc): Date {
  const base = data.snoozeUntil ?? data.fireAt;
  if (base instanceof Timestamp) {
    return base.toDate();
  }
  return new Date();
}

function computeNextOccurrence(reminder: ReminderDoc, reference: Date): Date | null {
  switch (reminder.frequency) {
    case "daily": {
      const next = new Date(reference);
      next.setDate(next.getDate() + 1);
      return next;
    }
    case "weekly": {
      const next = new Date(reference);
      next.setDate(next.getDate() + 7);
      return next;
    }
    case "custom":
      console.warn(
        `Custom cron '${reminder.customCron ?? ""}' is not yet supported for auto-rescheduling.`,
      );
      return null;
    default:
      return null;
  }
}

async function fetchDueReminders(now: Date) {
  const db = getAdminFirestore();

  const scheduledSnapshot = await db
    .collectionGroup("reminders")
    .where("status", "==", "scheduled")
    .where("fireAt", "<=", Timestamp.fromDate(now))
    .limit(MAX_REMINDERS_PER_RUN)
    .get();

  const snoozedSnapshot = await db
    .collectionGroup("reminders")
    .where("status", "==", "snoozed")
    .where("fireAt", "<=", Timestamp.fromDate(now))
    .limit(MAX_REMINDERS_PER_RUN)
    .get();

  const docs = new Map<string, FirebaseFirestore.QueryDocumentSnapshot<ReminderDoc>>();

  for (const doc of [...scheduledSnapshot.docs, ...snoozedSnapshot.docs]) {
    docs.set(doc.ref.path, doc as QueryDocumentSnapshot<ReminderDoc>);
  }

  return Array.from(docs.values());
}

export async function POST(request: NextRequest) {
  if (serverEnv.REMINDER_DISPATCH_TOKEN) {
    const token = request.headers.get("x-reminder-dispatch-token");
    if (token !== serverEnv.REMINDER_DISPATCH_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const now = new Date();
  const dueSnapshots = await fetchDueReminders(now);

  if (!dueSnapshots.length) {
    return NextResponse.json({ processed: 0 });
  }

  const auth = getAdminAuth();
  const userCache = new Map<string, { email?: string | null; phoneNumber?: string | null; displayName?: string | null }>();
  const preferenceCache = new Map<string, UserPreferenceDoc | null>();

  const processed: ProcessedReminder[] = [];

  for (const snapshot of dueSnapshots) {
    const data = snapshot.data() as ReminderDoc;
    const reminderId = snapshot.id;
    const userId = data.ownerId;

    if (!userId) {
      console.warn(`Reminder ${reminderId} missing ownerId, skipping.`);
      continue;
    }

    const targetTime = getTargetTimestamp(data);
    let channels = data.channels?.length ? data.channels : [];
    if (!channels.length) {
      let prefs = preferenceCache.get(userId);
      if (prefs === undefined) {
        try {
          const prefSnapshot = await adminPreferenceDoc(userId).get();
          prefs = prefSnapshot.exists
            ? (prefSnapshot.data() as UserPreferenceDoc)
            : null;
          preferenceCache.set(userId, prefs);
        } catch (error) {
          console.error(`Failed to read preferences for ${userId}`, error);
          prefs = null;
          preferenceCache.set(userId, null);
        }
      }
      if (prefs?.reminderChannels?.length) {
        channels = prefs.reminderChannels;
      } else {
        channels = ["push"];
      }
    }

    if (!userCache.has(userId)) {
      try {
        const userRecord = await auth.getUser(userId);
        userCache.set(userId, {
          email: userRecord.email,
          phoneNumber: userRecord.phoneNumber,
          displayName: userRecord.displayName,
        });
      } catch (error) {
        console.error(`Failed to load user ${userId} for reminder ${reminderId}`, error);
        userCache.set(userId, { email: null, phoneNumber: null, displayName: null });
      }
    }

    const userInfo = userCache.get(userId)!;
    const deliveries: string[] = [];
    const subject = `Reminder: ${data.titleSnapshot || "Untitled note"}`;
    const formattedTime = formatReminderTimestamp(targetTime);
    const html = `
      <div style="font-family: 'Inter', Arial, sans-serif; line-height: 1.6;">
        <h2 style="margin-bottom: 8px;">${subject}</h2>
        <p style="margin: 0 0 12px;">Scheduled for ${formattedTime}.</p>
        <p style="margin: 0 0 12px; white-space: pre-wrap;">${data.bodySnapshot || ""}</p>
        <p style="margin: 0; font-size: 12px; color: #6b7280;">Sent by NoteNex reminders</p>
      </div>
    `;
    const smsBody = `${subject}\nDue ${formattedTime}`;

    if (channels.includes("email") && userInfo.email) {
      const ok = await sendEmail({
        to: userInfo.email,
        subject,
        html,
      });
      if (ok) {
        deliveries.push("email");
      }
    }

    let smsRecipient = userInfo.phoneNumber ?? null;
    if (!smsRecipient && channels.includes("sms")) {
      let prefs = preferenceCache.get(userId);
      if (prefs === undefined) {
        try {
          const prefSnapshot = await adminPreferenceDoc(userId).get();
          prefs = prefSnapshot.exists
            ? (prefSnapshot.data() as UserPreferenceDoc)
            : null;
          preferenceCache.set(userId, prefs);
        } catch (error) {
          console.error(`Failed to read preferences for ${userId}`, error);
          prefs = null;
          preferenceCache.set(userId, null);
        }
      }
      smsRecipient = prefs?.smsNumber ?? null;
    }

    if (channels.includes("sms") && smsRecipient) {
      const ok = await sendSms({
        to: smsRecipient,
        body: smsBody,
      });
      if (ok) {
        deliveries.push("sms");
      }
    }

    // Browser channel is satisfied by in-app overdue list; we log for monitoring.
    if (channels.includes("push")) {
      deliveries.push("push");
    }

    const nextOccurrence = computeNextOccurrence(data, targetTime);
    const reminderUpdate: Record<string, unknown> = {
      lastSentAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      snoozeUntil: null,
    };

    if (nextOccurrence) {
      reminderUpdate.fireAt = Timestamp.fromDate(nextOccurrence);
      reminderUpdate.status = "scheduled";
    } else {
      reminderUpdate.status = "sent";
    }

    await snapshot.ref.update(reminderUpdate);

    if (nextOccurrence && data.noteId) {
      try {
        await adminNoteDoc(userId, data.noteId).update({
          reminderAt: Timestamp.fromDate(nextOccurrence),
          updatedAt: FieldValue.serverTimestamp(),
        });
      } catch (error) {
        console.error(
          `Failed to update recurring reminder linkage for note ${data.noteId}`,
          error,
        );
      }
    }

    processed.push({
      reminderId,
      ownerId: userId,
      channels: deliveries,
      nextFireAt: nextOccurrence,
    });
  }

  return NextResponse.json({ processed: processed.length, reminders: processed });
}

function formatReminderTimestamp(date: Date) {
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
