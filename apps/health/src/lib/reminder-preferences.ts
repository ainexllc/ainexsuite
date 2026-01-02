/**
 * Reminder Preferences Service
 * Firestore-backed reminder settings with notification scheduling
 */

import { db, auth } from '@ainexsuite/firebase';
import {
  collection,
  doc,
  query,
  where,
  limit,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import type { ReminderPreferences } from './types/settings';
import {
  requestNotificationPermission,
  hasNotificationPermission,
} from './notification-service';

// Collection
const REMINDER_PREFS_COLLECTION = 'health_reminder_preferences';

// ===== DEFAULT PREFERENCES =====

export const DEFAULT_REMINDER_PREFERENCES: ReminderPreferences = {
  globalEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  checkinReminder: {
    enabled: false,
    time: '09:00',
  },
  waterReminders: {
    enabled: false,
    startTime: '08:00',
    endTime: '20:00',
    intervalMinutes: 60,
  },
  goalNotifications: false,
};

// ===== HELPERS =====

function getCurrentUserId(): string | null {
  return auth.currentUser?.uid ?? null;
}

// ===== CRUD =====

/**
 * Get user's reminder preferences
 */
export async function getReminderPreferences(): Promise<ReminderPreferences> {
  const userId = getCurrentUserId();
  if (!userId) return DEFAULT_REMINDER_PREFERENCES;

  try {
    const prefsRef = collection(db, REMINDER_PREFS_COLLECTION);
    const q = query(prefsRef, where('ownerId', '==', userId), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return DEFAULT_REMINDER_PREFERENCES;
    }

    const data = snapshot.docs[0].data();
    return {
      ...DEFAULT_REMINDER_PREFERENCES,
      ...data,
    } as ReminderPreferences;
  } catch (error) {
    console.error('Failed to fetch reminder preferences:', error);
    return DEFAULT_REMINDER_PREFERENCES;
  }
}

/**
 * Save/update reminder preferences
 */
export async function saveReminderPreferences(
  prefs: Partial<ReminderPreferences>
): Promise<boolean> {
  const userId = getCurrentUserId();
  if (!userId) return false;

  try {
    const docRef = doc(db, REMINDER_PREFS_COLLECTION, userId);
    await setDoc(
      docRef,
      {
        ...prefs,
        ownerId: userId,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // Reschedule notifications based on new preferences
    const fullPrefs = await getReminderPreferences();
    await applyReminderPreferences(fullPrefs);

    return true;
  } catch (error) {
    console.error('Failed to save reminder preferences:', error);
    return false;
  }
}

/**
 * Enable or disable all reminders globally
 */
export async function setGlobalRemindersEnabled(enabled: boolean): Promise<boolean> {
  if (enabled) {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.warn('Cannot enable reminders: notification permission not granted');
      return false;
    }
  }

  return saveReminderPreferences({ globalEnabled: enabled });
}

// ===== SCHEDULING =====

// Active timeout IDs for non-medication reminders
const activeTimeouts: Map<string, number> = new Map();

/**
 * Apply reminder preferences by scheduling/canceling notifications
 */
export async function applyReminderPreferences(
  prefs: ReminderPreferences
): Promise<void> {
  // Cancel all existing non-medication reminders
  cancelAllHealthReminders();

  if (!prefs.globalEnabled) {
    return;
  }

  if (!hasNotificationPermission()) {
    console.warn('Cannot apply reminders: notification permission not granted');
    return;
  }

  // Schedule check-in reminder
  if (prefs.checkinReminder.enabled) {
    scheduleCheckinReminder(prefs.checkinReminder.time, prefs);
  }

  // Schedule water reminders
  if (prefs.waterReminders.enabled) {
    scheduleWaterReminders(prefs.waterReminders, prefs);
  }
}

/**
 * Schedule daily check-in reminder
 */
function scheduleCheckinReminder(
  time: string,
  prefs: ReminderPreferences
): void {
  const delay = getDelayUntil(time);

  // Skip if within quiet hours
  if (isWithinQuietHours(time, prefs)) {
    return;
  }

  const timeoutId = window.setTimeout(() => {
    showNotification('Daily Check-in', 'Time to log your daily health metrics!', 'checkin');
    // Reschedule for tomorrow
    scheduleCheckinReminder(time, prefs);
  }, delay);

  activeTimeouts.set('checkin', timeoutId);
}

/**
 * Schedule periodic water reminders throughout the day
 */
function scheduleWaterReminders(
  config: ReminderPreferences['waterReminders'],
  prefs: ReminderPreferences
): void {
  const { startTime, endTime, intervalMinutes } = config;

  const now = new Date();
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  // Calculate all reminder times for today
  let currentTime = new Date();
  currentTime.setHours(startHour, startMin, 0, 0);

  const endDateTime = new Date();
  endDateTime.setHours(endHour, endMin, 0, 0);

  let reminderIndex = 0;

  while (currentTime <= endDateTime) {
    const timeStr = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;

    // Only schedule if in the future and not in quiet hours
    if (currentTime > now && !isWithinQuietHours(timeStr, prefs)) {
      const delay = currentTime.getTime() - now.getTime();

      const timeoutId = window.setTimeout(() => {
        showNotification(
          'Water Reminder',
          'Time to drink some water! Stay hydrated.',
          'water'
        );
      }, delay);

      activeTimeouts.set(`water-${reminderIndex}`, timeoutId);
      reminderIndex++;
    }

    // Move to next interval
    currentTime = new Date(currentTime.getTime() + intervalMinutes * 60 * 1000);
  }

  // Schedule re-initialization for tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(startHour, startMin, 0, 0);
  const delayUntilTomorrow = tomorrow.getTime() - now.getTime();

  const reinitId = window.setTimeout(() => {
    scheduleWaterReminders(config, prefs);
  }, delayUntilTomorrow);

  activeTimeouts.set('water-reinit', reinitId);
}

/**
 * Cancel all health reminders (except medication)
 */
function cancelAllHealthReminders(): void {
  for (const [, timeoutId] of activeTimeouts) {
    window.clearTimeout(timeoutId);
  }
  activeTimeouts.clear();
}

// ===== GOAL NOTIFICATIONS =====

/**
 * Show goal achievement notification
 */
export function showGoalAchievementNotification(
  goalName: string,
  streak?: number
): void {
  const message = streak
    ? `${goalName} complete! ${streak} day streak!`
    : `${goalName} achieved for today!`;

  showNotification('Goal Achieved!', message, 'goal');
}

// ===== UTILITY FUNCTIONS =====

/**
 * Parse time string (HH:mm) to get delay until next occurrence
 */
function getDelayUntil(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const scheduled = new Date();

  scheduled.setHours(hours, minutes, 0, 0);

  // If time has passed today, schedule for tomorrow
  if (scheduled <= now) {
    scheduled.setDate(scheduled.getDate() + 1);
  }

  return scheduled.getTime() - now.getTime();
}

/**
 * Check if a time is within quiet hours
 */
function isWithinQuietHours(
  time: string,
  prefs: ReminderPreferences
): boolean {
  if (!prefs.quietHoursStart || !prefs.quietHoursEnd) {
    return false;
  }

  const [timeHour, timeMin] = time.split(':').map(Number);
  const [startHour, startMin] = prefs.quietHoursStart.split(':').map(Number);
  const [endHour, endMin] = prefs.quietHoursEnd.split(':').map(Number);

  const timeMinutes = timeHour * 60 + timeMin;
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  // Handle overnight quiet hours (e.g., 22:00 - 07:00)
  if (startMinutes > endMinutes) {
    return timeMinutes >= startMinutes || timeMinutes <= endMinutes;
  }

  return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
}

/**
 * Show a notification
 */
function showNotification(
  title: string,
  body: string,
  type: 'checkin' | 'water' | 'goal'
): void {
  if (!hasNotificationPermission()) {
    return;
  }

  try {
    const notification = new Notification(title, {
      body,
      icon: `/icons/health-${type}.png`,
      tag: `health-${type}`,
      silent: false,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Auto-close after 10 seconds
    setTimeout(() => {
      notification.close();
    }, 10000);
  } catch (error) {
    console.error('Failed to show notification:', error);
  }
}

/**
 * Get formatted summary of active reminders
 */
export function getReminderSummary(prefs: ReminderPreferences): string {
  if (!prefs.globalEnabled) {
    return 'Reminders disabled';
  }

  const active: string[] = [];

  if (prefs.checkinReminder.enabled) {
    active.push(`Check-in at ${prefs.checkinReminder.time}`);
  }

  if (prefs.waterReminders.enabled) {
    active.push(
      `Water every ${prefs.waterReminders.intervalMinutes} min (${prefs.waterReminders.startTime}-${prefs.waterReminders.endTime})`
    );
  }

  if (prefs.goalNotifications) {
    active.push('Goal notifications');
  }

  return active.length > 0 ? active.join(', ') : 'No reminders configured';
}
