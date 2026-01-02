'use client';

import { useCallback, useEffect, useState } from 'react';
import { useWorkspaceAuth } from '@ainexsuite/auth';
import type { ReminderPreferences } from '@/lib/types/settings';
import {
  getReminderPreferences,
  saveReminderPreferences,
  setGlobalRemindersEnabled,
  applyReminderPreferences,
  DEFAULT_REMINDER_PREFERENCES,
  getReminderSummary,
} from '@/lib/reminder-preferences';
import {
  requestNotificationPermission,
  hasNotificationPermission,
  getNotificationPermissionStatus,
} from '@/lib/notification-service';

// ===== TYPES =====

interface UseHealthRemindersReturn {
  // State
  preferences: ReminderPreferences;
  loading: boolean;
  permissionStatus: NotificationPermission | 'unsupported';
  summary: string;

  // Actions
  updatePreferences: (updates: Partial<ReminderPreferences>) => Promise<boolean>;
  enableReminders: () => Promise<boolean>;
  disableReminders: () => Promise<boolean>;
  requestPermission: () => Promise<boolean>;

  // Specific toggles
  toggleCheckinReminder: (enabled: boolean) => Promise<boolean>;
  toggleWaterReminders: (enabled: boolean) => Promise<boolean>;
  toggleGoalNotifications: (enabled: boolean) => Promise<boolean>;
  setCheckinTime: (time: string) => Promise<boolean>;
  setWaterInterval: (minutes: number) => Promise<boolean>;
  setQuietHours: (start: string, end: string) => Promise<boolean>;
}

// ===== HOOK =====

export function useHealthReminders(): UseHealthRemindersReturn {
  const { user } = useWorkspaceAuth();
  const [preferences, setPreferences] = useState<ReminderPreferences>(DEFAULT_REMINDER_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>(
    getNotificationPermissionStatus()
  );

  // Load preferences on mount/user change
  useEffect(() => {
    if (!user?.uid) {
      setPreferences(DEFAULT_REMINDER_PREFERENCES);
      setLoading(false);
      return;
    }

    setLoading(true);

    getReminderPreferences()
      .then((prefs) => {
        setPreferences(prefs);
        // Apply reminders if enabled
        if (prefs.globalEnabled && hasNotificationPermission()) {
          applyReminderPreferences(prefs);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.uid]);

  // Update permission status when it changes
  useEffect(() => {
    const checkPermission = () => {
      setPermissionStatus(getNotificationPermissionStatus());
    };

    // Check periodically for permission changes
    const interval = setInterval(checkPermission, 5000);
    return () => clearInterval(interval);
  }, []);

  // Update preferences
  const updatePreferences = useCallback(
    async (updates: Partial<ReminderPreferences>): Promise<boolean> => {
      // Optimistic update
      const newPrefs = { ...preferences, ...updates };
      setPreferences(newPrefs);

      const success = await saveReminderPreferences(updates);
      if (!success) {
        // Revert on failure
        setPreferences(preferences);
      }
      return success;
    },
    [preferences]
  );

  // Enable all reminders
  const enableReminders = useCallback(async (): Promise<boolean> => {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      return false;
    }
    setPermissionStatus('granted');
    return setGlobalRemindersEnabled(true);
  }, []);

  // Disable all reminders
  const disableReminders = useCallback(async (): Promise<boolean> => {
    return setGlobalRemindersEnabled(false);
  }, []);

  // Request permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    const granted = await requestNotificationPermission();
    setPermissionStatus(granted ? 'granted' : 'denied');
    return granted;
  }, []);

  // Toggle check-in reminder
  const toggleCheckinReminder = useCallback(
    async (enabled: boolean): Promise<boolean> => {
      return updatePreferences({
        checkinReminder: {
          ...preferences.checkinReminder,
          enabled,
        },
      });
    },
    [preferences.checkinReminder, updatePreferences]
  );

  // Toggle water reminders
  const toggleWaterReminders = useCallback(
    async (enabled: boolean): Promise<boolean> => {
      return updatePreferences({
        waterReminders: {
          ...preferences.waterReminders,
          enabled,
        },
      });
    },
    [preferences.waterReminders, updatePreferences]
  );

  // Toggle goal notifications
  const toggleGoalNotifications = useCallback(
    async (enabled: boolean): Promise<boolean> => {
      return updatePreferences({ goalNotifications: enabled });
    },
    [updatePreferences]
  );

  // Set check-in time
  const setCheckinTime = useCallback(
    async (time: string): Promise<boolean> => {
      return updatePreferences({
        checkinReminder: {
          ...preferences.checkinReminder,
          time,
        },
      });
    },
    [preferences.checkinReminder, updatePreferences]
  );

  // Set water reminder interval
  const setWaterInterval = useCallback(
    async (minutes: number): Promise<boolean> => {
      return updatePreferences({
        waterReminders: {
          ...preferences.waterReminders,
          intervalMinutes: minutes,
        },
      });
    },
    [preferences.waterReminders, updatePreferences]
  );

  // Set quiet hours
  const setQuietHours = useCallback(
    async (start: string, end: string): Promise<boolean> => {
      return updatePreferences({
        quietHoursStart: start,
        quietHoursEnd: end,
      });
    },
    [updatePreferences]
  );

  // Calculate summary
  const summary = getReminderSummary(preferences);

  return {
    preferences,
    loading,
    permissionStatus,
    summary,
    updatePreferences,
    enableReminders,
    disableReminders,
    requestPermission,
    toggleCheckinReminder,
    toggleWaterReminders,
    toggleGoalNotifications,
    setCheckinTime,
    setWaterInterval,
    setQuietHours,
  };
}
