"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/lib/auth/auth-context";
import type { Reminder } from "@/lib/types/reminder";
import {
  createReminder as createReminderMutation,
  deleteReminder as deleteReminderMutation,
  subscribeToUpcomingReminders,
  updateReminder as updateReminderMutation,
} from "@/lib/firebase/reminder-service";

type CreateReminderInput = {
  noteId: string;
  fireAt: Date;
  channels: Reminder["channels"];
  frequency?: Reminder["frequency"];
  customCron?: string | null;
  titleSnapshot?: string;
  bodySnapshot?: string;
  labelIds?: string[];
};

type UpdateReminderInput = Partial<Omit<Reminder, "id" | "ownerId" | "noteId">> & {
  fireAt?: Date;
};

type RemindersContextValue = {
  reminders: Reminder[];
  loading: boolean;
  createReminder: (input: CreateReminderInput) => Promise<string | null>;
  updateReminder: (reminderId: string, updates: UpdateReminderInput) => Promise<void>;
  deleteReminder: (reminderId: string) => Promise<void>;
};

const RemindersContext = createContext<RemindersContextValue | null>(null);

type RemindersProviderProps = {
  children: React.ReactNode;
};

export function RemindersProvider({ children }: RemindersProviderProps) {
  const { status, user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = user?.id ?? null;

  useEffect(() => {
    if (status !== "authenticated" || !userId) {
      setReminders([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = subscribeToUpcomingReminders(userId, (incoming) => {
      setReminders(incoming);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [status, userId]);

  const handleCreate = useCallback(
    async (input: CreateReminderInput) => {
      if (!userId) {
        return null;
      }

      return createReminderMutation(userId, {
        noteId: input.noteId,
        fireAt: input.fireAt,
        channels: input.channels,
        frequency: input.frequency ?? "once",
        customCron: input.customCron ?? null,
        titleSnapshot: input.titleSnapshot ?? "",
        bodySnapshot: input.bodySnapshot ?? "",
        labelIds: input.labelIds ?? [],
      });
    },
    [userId],
  );

  const handleUpdate = useCallback(
    async (reminderId: string, updates: UpdateReminderInput) => {
      if (!userId) {
        return;
      }

      await updateReminderMutation(userId, reminderId, updates);
    },
    [userId],
  );

  const handleDelete = useCallback(
    async (reminderId: string) => {
      if (!userId) {
        return;
      }

      await deleteReminderMutation(userId, reminderId);
    },
    [userId],
  );

  const value = useMemo<RemindersContextValue>(
    () => ({
      reminders,
      loading,
      createReminder: handleCreate,
      updateReminder: handleUpdate,
      deleteReminder: handleDelete,
    }),
    [reminders, loading, handleCreate, handleUpdate, handleDelete],
  );

  return <RemindersContext.Provider value={value}>{children}</RemindersContext.Provider>;
}

export function useReminders() {
  const context = useContext(RemindersContext);

  if (!context) {
    throw new Error("useReminders must be used within a RemindersProvider.");
  }

  return context;
}
