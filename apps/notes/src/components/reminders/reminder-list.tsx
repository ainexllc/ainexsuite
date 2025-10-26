"use client";

import { useMemo, useState } from "react";
import { AlarmClock, Clock4, MoreHorizontal, X } from "lucide-react";
import { clsx } from "clsx";
import { useReminders } from "@/components/providers/reminders-provider";
import { useNotes } from "@/components/providers/notes-provider";
import {
  DEFAULT_REMINDER_CHANNELS,
  REMINDER_CHANNELS,
} from "@/components/reminders/reminder-constants";

function nextTriggerDate(fireAt: Date, snoozeUntil?: Date | null) {
  return snoozeUntil ?? fireAt;
}

function formatReminderTimestamp(date: Date) {
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function ReminderList() {
  const { reminders, loading, updateReminder, deleteReminder } = useReminders();
  const { notes, updateNote } = useNotes();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const entries = useMemo(() => {
    return reminders.map((reminder) => {
      const note = notes.find((item) => item.id === reminder.noteId) ?? null;
      const timestamp = nextTriggerDate(reminder.fireAt, reminder.snoozeUntil);
      return {
        reminder,
        note,
        timestamp,
        title:
          note?.title?.trim() ||
          reminder.titleSnapshot?.trim() ||
          "Untitled note",
      };
    });
  }, [reminders, notes]);

  const now = Date.now();
  const overdue = entries.filter((entry) => entry.timestamp.getTime() <= now);
  const upcoming = entries.filter((entry) => entry.timestamp.getTime() > now);

  const handleSnooze = async (reminderId: string, minutes: number) => {
    const entry = entries.find((item) => item.reminder.id === reminderId);
    if (!entry) {
      return;
    }

    const sourceTime = nextTriggerDate(entry.reminder.fireAt, entry.reminder.snoozeUntil);
    const newDate = new Date(sourceTime.getTime() + minutes * 60_000);
    setProcessingId(reminderId);
    try {
      const channels = entry.reminder.channels.length
        ? entry.reminder.channels
        : DEFAULT_REMINDER_CHANNELS;
      await updateReminder(reminderId, {
        fireAt: newDate,
        channels,
        status: "snoozed",
        snoozeUntil: null,
      });
      await updateNote(entry.reminder.noteId, {
        reminderAt: newDate,
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleComplete = async (reminderId: string) => {
    const entry = entries.find((item) => item.reminder.id === reminderId);
    if (!entry) {
      return;
    }

    setProcessingId(reminderId);
    try {
      await updateReminder(reminderId, {
        status: "completed",
        snoozeUntil: null,
      });
      await updateNote(entry.reminder.noteId, {
        reminderAt: null,
        reminderId: null,
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (reminderId: string) => {
    const entry = entries.find((item) => item.reminder.id === reminderId);
    if (!entry) {
      return;
    }

    setProcessingId(reminderId);
    try {
      await deleteReminder(reminderId);
      await updateNote(entry.reminder.noteId, {
        reminderAt: null,
        reminderId: null,
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-20 rounded-2xl bg-surface-muted/80 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!entries.length) {
    return (
      <div className="rounded-3xl border border-dashed border-outline-subtle/70 bg-surface-elevated/60 px-8 py-12 text-center">
        <AlarmClock className="mx-auto h-10 w-10 text-accent-500" aria-hidden />
        <p className="mt-3 text-base font-semibold text-ink-700">
          No reminders scheduled
        </p>
        <p className="mt-1 text-sm text-muted">
          Set a reminder from any note to have it appear here.
        </p>
      </div>
    );
  }

  const renderSection = (
    label: string,
    items: typeof entries,
    emptyLabel: string,
  ) => (
    <section className="space-y-3">
      <header className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-ink-400">
        <span>{label}</span>
        {items.length > 0 && <span>{items.length}</span>}
      </header>

      {items.length ? (
        <ul className="space-y-3">
          {items.map(({ reminder, note, timestamp, title }) => {
            const isProcessing = processingId === reminder.id;
            const channels = reminder.channels.length
              ? reminder.channels
              : DEFAULT_REMINDER_CHANNELS;

            return (
              <li
                key={reminder.id}
                className="rounded-3xl border border-outline-subtle/70 bg-white/80 p-4 shadow-sm"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink-800">{title}</p>
                    <p className="text-xs text-muted">
                      {note?.labelIds?.length ? `${note.labelIds.length} labels · ` : ""}
                      {formatReminderTimestamp(timestamp)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {channels.map((channel) => {
                      const config = REMINDER_CHANNELS.find((item) => item.id === channel);
                      if (!config) {
                        return null;
                      }
                      const Icon = config.icon;
                      return (
                        <span
                          key={channel}
                          className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink-600"
                        >
                          <Icon className="h-3 w-3" />
                          {config.label}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleSnooze(reminder.id, 60)}
                    className={clsx(
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition",
                      isProcessing
                        ? "cursor-not-allowed border-outline-subtle text-muted"
                        : "border-outline-subtle text-ink-600 hover:border-accent-400 hover:text-accent-600",
                    )}
                  >
                    <Clock4 className="h-3.5 w-3.5" /> Snooze 1h
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleComplete(reminder.id)}
                    className={clsx(
                      "inline-flex items-center gap-2 rounded-full bg-accent-500 px-3 py-1 text-xs font-semibold text-ink-50 transition",
                      isProcessing && "cursor-not-allowed opacity-70",
                    )}
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" /> Mark done
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleDelete(reminder.id)}
                    className={clsx(
                      "inline-flex items-center gap-2 rounded-full border border-danger/80 px-3 py-1 text-xs font-medium text-danger transition",
                      isProcessing && "cursor-not-allowed opacity-60",
                    )}
                  >
                    <X className="h-3.5 w-3.5" /> Dismiss
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-2xl border border-dashed border-outline-subtle/60 bg-surface-muted/50 px-4 py-6 text-center text-sm text-muted">
          {emptyLabel}
        </div>
      )}
    </section>
  );

  return (
    <div className="space-y-8">
      {renderSection("Overdue", overdue, "You are all caught up here.")}
      {renderSection("Upcoming", upcoming, "No upcoming reminders yet.")}
    </div>
  );
}
