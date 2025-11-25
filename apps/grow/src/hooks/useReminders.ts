'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@ainexsuite/auth';
import { useGrowStore } from '@/lib/store';
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
import { ReminderSettings, UserReminderPreferences, Habit } from '@/types/models';

// Store reminders in localStorage for persistence
const REMINDERS_STORAGE_KEY = 'grow_habit_reminders';
const PREFERENCES_STORAGE_KEY = 'grow_reminder_preferences';

interface StoredReminders {
  [habitId: string]: ReminderSettings;
}

export function useReminders() {
  const { user } = useAuth();
  const { habits, completions, getCurrentSpace } = useGrowStore();
  const currentSpace = getCurrentSpace();
  const scheduledRef = useRef(false);

  // Load stored reminders
  const getStoredReminders = useCallback((): StoredReminders => {
    if (typeof window === 'undefined') return {};
    try {
      const stored = localStorage.getItem(REMINDERS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }, []);

  // Save reminders
  const saveReminders = useCallback((reminders: StoredReminders) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders));
  }, []);

  // Get preferences
  const getPreferences = useCallback((): UserReminderPreferences | null => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  // Save preferences
  const savePreferences = useCallback((prefs: Partial<UserReminderPreferences>) => {
    if (typeof window === 'undefined' || !user) return;
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
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(updated));
  }, [user, getPreferences]);

  // Get reminder for specific habit
  const getHabitReminder = useCallback((habitId: string): ReminderSettings | null => {
    const reminders = getStoredReminders();
    return reminders[habitId] || null;
  }, [getStoredReminders]);

  // Update reminder for specific habit
  const updateHabitReminder = useCallback((habitId: string, settings: ReminderSettings | null) => {
    const reminders = getStoredReminders();
    if (settings) {
      reminders[habitId] = settings;
    } else {
      delete reminders[habitId];
    }
    saveReminders(reminders);
  }, [getStoredReminders, saveReminders]);

  // Check if habit is completed today
  const isHabitCompletedToday = useCallback((habitId: string): boolean => {
    const today = getTodayDateString();
    return completions.some(
      (c) => c.habitId === habitId && c.date === today
    );
  }, [completions]);

  // Show reminder notification
  const showHabitReminder = useCallback((habit: Habit, preferences: UserReminderPreferences | null) => {
    // Check quiet hours
    if (preferences && isWithinQuietHours(preferences.quietHoursStart, preferences.quietHoursEnd)) {
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

    const reminders = getStoredReminders();
    const preferences = getPreferences();

    // Only schedule if globally enabled
    if (!preferences?.globalEnabled) return;

    const spaceHabits = habits.filter((h) => h.spaceId === currentSpace.id);

    spaceHabits.forEach((habit) => {
      const settings = reminders[habit.id];
      if (!settings?.enabled) return;

      // Check if today is a reminder day
      const today = new Date().getDay();
      if (!settings.daysOfWeek.includes(today)) return;

      // Get the reminder time
      const nextTime = getNextReminderTime(settings.time, settings.customTime);

      // Schedule it
      scheduleReminder(
        `habit-${habit.id}`,
        () => showHabitReminder(habit, preferences),
        nextTime
      );
    });
  }, [currentSpace, habits, getStoredReminders, getPreferences, showHabitReminder]);

  // Initial setup
  useEffect(() => {
    if (!scheduledRef.current && user && currentSpace) {
      scheduledRef.current = true;
      scheduleAllReminders();
    }

    return () => {
      cancelAllReminders();
    };
  }, [user, currentSpace, scheduleAllReminders]);

  // Reschedule when habits or reminders change
  useEffect(() => {
    if (scheduledRef.current) {
      scheduleAllReminders();
    }
  }, [habits, scheduleAllReminders]);

  return {
    getPreferences,
    savePreferences,
    getHabitReminder,
    updateHabitReminder,
    scheduleAllReminders,
  };
}

// Export time preset helpers
export { REMINDER_TIME_PRESETS };
