'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useAuth } from '@ainexsuite/auth';
import { useGrowStore } from '@/lib/store';
import { useSpaces } from '@/components/providers/spaces-provider';
import { getTodayDateString } from '@/lib/date-utils';
import {
  canShowNotifications,
  showLocalNotification,
  getNextReminderTime,
  scheduleReminder,
  cancelAllReminders,
  isWithinQuietHours,
  REMINDER_TIME_PRESETS,
} from '@/lib/notifications';
import {
  subscribeToUserReminders,
  subscribeToReminderPreferences,
  createReminderInDb,
  updateReminderInDb,
  deleteReminderInDb,
  saveReminderPreferencesInDb,
  updateReminderPreferencesInDb,
} from '@/lib/firebase-service';
import { ReminderSettings, UserReminderPreferences, Habit, HabitReminder } from '@/types/models';

// LocalStorage keys for fallback/cache
const REMINDERS_STORAGE_KEY = 'grow_habit_reminders';
const PREFERENCES_STORAGE_KEY = 'grow_reminder_preferences';

interface StoredReminders {
  [habitId: string]: ReminderSettings;
}

export function useReminders() {
  const { user } = useAuth();
  const { habits, completions } = useGrowStore();
  const { currentSpace } = useSpaces();
  
  const scheduledRef = useRef(false);

  // State for Firestore data
  const [reminders, setReminders] = useState<HabitReminder[]>([]);
  const [preferences, setPreferences] = useState<UserReminderPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Subscribe to Firestore reminders and preferences
  useEffect(() => {
    if (!user?.uid) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Subscribe to reminders
    const unsubReminders = subscribeToUserReminders(user.uid, (fetchedReminders) => {
      setReminders(fetchedReminders);
      // Cache in localStorage for offline access
      const remindersMap: StoredReminders = {};
      fetchedReminders.forEach((r) => {
        remindersMap[r.habitId] = {
          enabled: r.enabled,
          time: r.time,
          customTime: r.customTime,
          daysOfWeek: r.daysOfWeek,
        };
      });
      localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(remindersMap));
    });

    // Subscribe to preferences
    const unsubPrefs = subscribeToReminderPreferences(user.uid, (fetchedPrefs) => {
      setPreferences(fetchedPrefs);
      setIsLoading(false);
      // Cache in localStorage for offline access
      if (fetchedPrefs) {
        localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(fetchedPrefs));
      }
    });

    return () => {
      unsubReminders();
      unsubPrefs();
    };
  }, [user?.uid]);

  // Get preferences (from state or localStorage fallback)
  const getPreferences = useCallback((): UserReminderPreferences | null => {
    if (preferences) return preferences;

    // Fallback to localStorage
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, [preferences]);

  // Save preferences to Firestore
  const savePreferences = useCallback(async (prefs: Partial<UserReminderPreferences>) => {
    if (!user?.uid) return;

    const existing = getPreferences();
    const updated: UserReminderPreferences = {
      userId: user.uid,
      globalEnabled: prefs.globalEnabled ?? existing?.globalEnabled ?? false,
      defaultTime: prefs.defaultTime ?? existing?.defaultTime ?? 'morning',
      defaultCustomTime: prefs.defaultCustomTime ?? existing?.defaultCustomTime,
      quietHoursStart: prefs.quietHoursStart ?? existing?.quietHoursStart,
      quietHoursEnd: prefs.quietHoursEnd ?? existing?.quietHoursEnd,
      soundEnabled: prefs.soundEnabled ?? existing?.soundEnabled ?? true,
      vibrationEnabled: prefs.vibrationEnabled ?? existing?.vibrationEnabled ?? true,
    };

    try {
      if (existing) {
        await updateReminderPreferencesInDb(user.uid, prefs);
      } else {
        await saveReminderPreferencesInDb(updated);
      }
      // Also update localStorage cache
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save preferences to Firestore:', error);
      // Fallback to localStorage only
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(updated));
    }
  }, [user?.uid, getPreferences]);

  // Get reminder for specific habit
  const getHabitReminder = useCallback((habitId: string): ReminderSettings | null => {
    const reminder = reminders.find((r) => r.habitId === habitId);
    if (reminder) {
      return {
        enabled: reminder.enabled,
        time: reminder.time,
        customTime: reminder.customTime,
        daysOfWeek: reminder.daysOfWeek,
      };
    }

    // Fallback to localStorage
    try {
      const stored = localStorage.getItem(REMINDERS_STORAGE_KEY);
      const remindersMap: StoredReminders = stored ? JSON.parse(stored) : {};
      return remindersMap[habitId] || null;
    } catch {
      return null;
    }
  }, [reminders]);

  // Update reminder for specific habit
  const updateHabitReminder = useCallback(async (habitId: string, settings: ReminderSettings | null) => {
    if (!user?.uid) return;

    try {
      if (settings) {
        // Check if reminder exists
        const existing = reminders.find((r) => r.habitId === habitId);
        const reminderId = existing?.id || `reminder_${user.uid}_${habitId}`;

        const reminderData: HabitReminder = {
          id: reminderId,
          userId: user.uid,
          habitId,
          enabled: settings.enabled,
          time: settings.time,
          customTime: settings.customTime,
          daysOfWeek: settings.daysOfWeek,
          createdAt: existing?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        if (existing) {
          await updateReminderInDb(reminderId, {
            enabled: settings.enabled,
            time: settings.time,
            customTime: settings.customTime,
            daysOfWeek: settings.daysOfWeek,
          });
        } else {
          await createReminderInDb(reminderData);
        }
      } else {
        // Delete reminder
        const existing = reminders.find((r) => r.habitId === habitId);
        if (existing) {
          await deleteReminderInDb(existing.id);
        }
      }
    } catch (error) {
      console.error('Failed to update reminder in Firestore:', error);
      // Fallback to localStorage
      const stored = localStorage.getItem(REMINDERS_STORAGE_KEY);
      const remindersMap: StoredReminders = stored ? JSON.parse(stored) : {};
      if (settings) {
        remindersMap[habitId] = settings;
      } else {
        delete remindersMap[habitId];
      }
      localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(remindersMap));
    }
  }, [user?.uid, reminders]);

  // Check if habit is completed today
  const isHabitCompletedToday = useCallback((habitId: string): boolean => {
    const today = getTodayDateString();
    return completions.some(
      (c) => c.habitId === habitId && c.date === today
    );
  }, [completions]);

  // Show reminder notification
  const showHabitReminder = useCallback((habit: Habit, prefs: UserReminderPreferences | null) => {
    // Check quiet hours
    if (prefs && isWithinQuietHours(prefs.quietHoursStart, prefs.quietHoursEnd)) {
      return;
    }

    // Check if already completed
    if (isHabitCompletedToday(habit.id)) {
      return;
    }

    // Show notification
    showLocalNotification({
      title: 'Habit Reminder',
      body: `Time to: ${habit.title}`,
      tag: `habit-${habit.id}`,
      data: { habitId: habit.id, type: 'habit-reminder' },
    });
  }, [isHabitCompletedToday]);

  // Schedule all reminders
  const scheduleAllReminders = useCallback(() => {
    if (!canShowNotifications() || !currentSpace) return;

    cancelAllReminders();

    const currentPrefs = getPreferences();

    // Only schedule if globally enabled
    if (!currentPrefs?.globalEnabled) return;

    const spaceHabits = habits.filter((h) => h.spaceId === currentSpace.id);

    spaceHabits.forEach((habit) => {
      const settings = getHabitReminder(habit.id);
      if (!settings?.enabled) return;

      // Check if today is a reminder day
      const today = new Date().getDay();
      if (!settings.daysOfWeek.includes(today)) return;

      // Get the reminder time
      const nextTime = getNextReminderTime(settings.time, settings.customTime);

      // Schedule it
      scheduleReminder(
        `habit-${habit.id}`,
        () => showHabitReminder(habit, currentPrefs),
        nextTime
      );
    });
  }, [currentSpace, habits, getPreferences, getHabitReminder, showHabitReminder]);

  // Initial setup
  useEffect(() => {
    if (!scheduledRef.current && user && currentSpace && !isLoading) {
      scheduledRef.current = true;
      scheduleAllReminders();
    }

    return () => {
      cancelAllReminders();
    };
  }, [user, currentSpace, isLoading, scheduleAllReminders]);

  // Reschedule when habits or reminders change
  useEffect(() => {
    if (scheduledRef.current && !isLoading) {
      scheduleAllReminders();
    }
  }, [habits, reminders, isLoading, scheduleAllReminders]);

  return {
    getPreferences,
    savePreferences,
    getHabitReminder,
    updateHabitReminder,
    scheduleAllReminders,
    isLoading,
  };
}

// Export time preset helpers
export { REMINDER_TIME_PRESETS };
