'use client';

import { useState, useEffect } from 'react';
import { Bell, Clock, Droplets, Target, Save, Loader2 } from 'lucide-react';
import { useAuth } from '@ainexsuite/auth';
import type { ReminderPreferences } from '@/lib/types/settings';
import {
  getReminderPreferences,
  saveReminderPreferences,
  DEFAULT_REMINDER_PREFERENCES,
} from '@/lib/reminder-preferences';

interface ReminderSettingsProps {
  onClose?: () => void;
}

export function ReminderSettings({ onClose }: ReminderSettingsProps) {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<ReminderPreferences>(DEFAULT_REMINDER_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      loadPreferences();
      checkPermission();
    }
  }, [user?.uid]);

  const loadPreferences = async () => {
    try {
      const prefs = await getReminderPreferences();
      setPreferences(prefs);
    } finally {
      setLoading(false);
    }
  };

  const checkPermission = async () => {
    if ('Notification' in window) {
      setHasPermission(Notification.permission === 'granted');
    }
  };

  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setHasPermission(permission === 'granted');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveReminderPreferences(preferences);
      onClose?.();
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = <K extends keyof ReminderPreferences>(
    key: K,
    value: ReminderPreferences[K]
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Permission Check */}
      {!hasPermission && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Notifications Disabled
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Enable browser notifications to receive health reminders.
              </p>
              <button
                onClick={requestPermission}
                className="mt-2 px-3 py-1.5 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 transition-colors"
              >
                Enable Notifications
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Master Toggle */}
      <div className="flex items-center justify-between p-4 bg-surface-elevated border border-outline-subtle rounded-xl">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-emerald-600" />
          <div>
            <p className="font-medium text-ink-900">All Reminders</p>
            <p className="text-sm text-ink-500">Enable or disable all health reminders</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={preferences.globalEnabled}
            onChange={(e) => updatePreference('globalEnabled', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
        </label>
      </div>

      {preferences.globalEnabled && (
        <>
          {/* Daily Check-in */}
          <div className="p-4 bg-surface-elevated border border-outline-subtle rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-ink-900">Daily Check-in</p>
                  <p className="text-sm text-ink-500">Reminder to log your health metrics</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.checkinReminder.enabled}
                  onChange={(e) =>
                    updatePreference('checkinReminder', {
                      ...preferences.checkinReminder,
                      enabled: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
              </label>
            </div>
            {preferences.checkinReminder.enabled && (
              <div>
                <label className="block text-sm text-ink-600 mb-1">Reminder Time</label>
                <input
                  type="time"
                  value={preferences.checkinReminder.time}
                  onChange={(e) =>
                    updatePreference('checkinReminder', {
                      ...preferences.checkinReminder,
                      time: e.target.value,
                    })
                  }
                  className="px-3 py-2 border border-outline-subtle rounded-lg bg-surface-base text-ink-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}
          </div>

          {/* Water Reminders */}
          <div className="p-4 bg-surface-elevated border border-outline-subtle rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Droplets className="w-5 h-5 text-cyan-600" />
                <div>
                  <p className="font-medium text-ink-900">Water Reminders</p>
                  <p className="text-sm text-ink-500">Stay hydrated throughout the day</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.waterReminders.enabled}
                  onChange={(e) =>
                    updatePreference('waterReminders', {
                      ...preferences.waterReminders,
                      enabled: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
              </label>
            </div>
            {preferences.waterReminders.enabled && (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm text-ink-600 mb-1">Every (minutes)</label>
                  <select
                    value={preferences.waterReminders.intervalMinutes}
                    onChange={(e) =>
                      updatePreference('waterReminders', {
                        ...preferences.waterReminders,
                        intervalMinutes: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-outline-subtle rounded-lg bg-surface-base text-ink-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value={30}>30 min</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                    <option value={180}>3 hours</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-ink-600 mb-1">Start</label>
                  <input
                    type="time"
                    value={preferences.waterReminders.startTime}
                    onChange={(e) =>
                      updatePreference('waterReminders', {
                        ...preferences.waterReminders,
                        startTime: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-outline-subtle rounded-lg bg-surface-base text-ink-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-ink-600 mb-1">End</label>
                  <input
                    type="time"
                    value={preferences.waterReminders.endTime}
                    onChange={(e) =>
                      updatePreference('waterReminders', {
                        ...preferences.waterReminders,
                        endTime: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-outline-subtle rounded-lg bg-surface-base text-ink-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Goal Reminders */}
          <div className="p-4 bg-surface-elevated border border-outline-subtle rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="font-medium text-ink-900">Goal Achievements</p>
                  <p className="text-sm text-ink-500">Notify when you reach your goals</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.goalNotifications}
                  onChange={(e) => updatePreference('goalNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>

          {/* Quiet Hours */}
          <div className="p-4 bg-surface-elevated border border-outline-subtle rounded-xl space-y-4">
            <div>
              <p className="font-medium text-ink-900">Quiet Hours</p>
              <p className="text-sm text-ink-500">Pause all notifications during this time</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-ink-600 mb-1">From</label>
                <input
                  type="time"
                  value={preferences.quietHoursStart || '22:00'}
                  onChange={(e) => updatePreference('quietHoursStart', e.target.value)}
                  className="w-full px-3 py-2 border border-outline-subtle rounded-lg bg-surface-base text-ink-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm text-ink-600 mb-1">To</label>
                <input
                  type="time"
                  value={preferences.quietHoursEnd || '07:00'}
                  onChange={(e) => updatePreference('quietHoursEnd', e.target.value)}
                  className="w-full px-3 py-2 border border-outline-subtle rounded-lg bg-surface-base text-ink-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            Save Reminder Settings
          </>
        )}
      </button>
    </div>
  );
}
