/**
 * Notification Service
 * Browser notifications for medication reminders with localStorage persistence
 */

// Types
interface ScheduledNotification {
  id: string;
  medicationId: string;
  medicationName: string;
  time: string; // HH:mm format
  timeoutId?: number;
  createdAt: string;
}

interface NotificationStorage {
  notifications: ScheduledNotification[];
  lastUpdated: string;
}

const STORAGE_KEY = 'health_medication_notifications';
const NOTIFICATION_TAG_PREFIX = 'medication-reminder-';

// ===== PERMISSION =====

/**
 * Request notification permission from the browser
 * Returns true if permission is granted, false otherwise
 */
export async function requestNotificationPermission(): Promise<boolean> {
  // Check if notifications are supported
  if (!('Notification' in window)) {
    console.warn('Notifications are not supported in this browser');
    return false;
  }

  // Check if already granted
  if (Notification.permission === 'granted') {
    return true;
  }

  // Check if denied (cannot request again)
  if (Notification.permission === 'denied') {
    console.warn('Notification permission has been denied');
    return false;
  }

  // Request permission
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return false;
  }
}

/**
 * Check if notification permission is granted
 */
export function hasNotificationPermission(): boolean {
  if (!('Notification' in window)) {
    return false;
  }
  return Notification.permission === 'granted';
}

/**
 * Get current notification permission status
 */
export function getNotificationPermissionStatus(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

// ===== STORAGE =====

/**
 * Load scheduled notifications from localStorage
 */
function loadScheduledNotifications(): ScheduledNotification[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const data: NotificationStorage = JSON.parse(stored);
    return data.notifications || [];
  } catch (error) {
    console.error('Failed to load scheduled notifications:', error);
    return [];
  }
}

/**
 * Save scheduled notifications to localStorage
 */
function saveScheduledNotifications(notifications: ScheduledNotification[]): void {
  try {
    const data: NotificationStorage = {
      notifications,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save scheduled notifications:', error);
  }
}

// ===== SCHEDULING =====

/**
 * Parse time string (HH:mm) to Date object for today or tomorrow
 * If the time has already passed today, schedules for tomorrow
 */
function getNextOccurrence(time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const scheduled = new Date();

  scheduled.setHours(hours, minutes, 0, 0);

  // If the time has already passed today, schedule for tomorrow
  if (scheduled <= now) {
    scheduled.setDate(scheduled.getDate() + 1);
  }

  return scheduled;
}

/**
 * Calculate milliseconds until a given time
 */
function getDelayUntil(time: string): number {
  const targetDate = getNextOccurrence(time);
  return targetDate.getTime() - Date.now();
}

/**
 * Show a medication reminder notification
 */
function showMedicationNotification(medicationId: string, medicationName: string): void {
  if (!hasNotificationPermission()) {
    console.warn('Cannot show notification: permission not granted');
    return;
  }

  try {
    const notification = new Notification('Medication Reminder', {
      body: `Time to take your ${medicationName}`,
      icon: '/icons/medication-reminder.png',
      tag: `${NOTIFICATION_TAG_PREFIX}${medicationId}`,
      requireInteraction: true,
      silent: false,
    });

    notification.onclick = () => {
      // Focus the window and close notification
      window.focus();
      notification.close();
    };

    // Auto-close after 30 seconds if not interacted with
    setTimeout(() => {
      notification.close();
    }, 30000);
  } catch (error) {
    console.error('Failed to show notification:', error);
  }
}

/**
 * Schedule a medication reminder notification
 * If a reminder already exists for this medication+time, it will be replaced
 */
export function scheduleMedicationReminder(
  medicationId: string,
  name: string,
  time: string
): void {
  if (!hasNotificationPermission()) {
    console.warn('Cannot schedule notification: permission not granted');
    return;
  }

  // Validate time format
  if (!/^\d{2}:\d{2}$/.test(time)) {
    console.error('Invalid time format. Expected HH:mm');
    return;
  }

  // Generate unique ID for this reminder
  const id = `${medicationId}-${time}`;

  // Cancel existing reminder for this medication+time if exists
  cancelNotificationById(id);

  // Calculate delay
  const delay = getDelayUntil(time);

  // Set timeout for the notification
  const timeoutId = window.setTimeout(() => {
    showMedicationNotification(medicationId, name);

    // Reschedule for the next day
    scheduleMedicationReminder(medicationId, name, time);
  }, delay);

  // Create notification record
  const notification: ScheduledNotification = {
    id,
    medicationId,
    medicationName: name,
    time,
    timeoutId,
    createdAt: new Date().toISOString(),
  };

  // Save to storage
  const notifications = loadScheduledNotifications();
  const updatedNotifications = notifications.filter((n) => n.id !== id);
  updatedNotifications.push(notification);
  saveScheduledNotifications(updatedNotifications);
}

/**
 * Schedule multiple medication reminders at once
 */
export function scheduleMedicationReminders(
  medicationId: string,
  name: string,
  times: string[]
): void {
  for (const time of times) {
    scheduleMedicationReminder(medicationId, name, time);
  }
}

// ===== CANCELLATION =====

/**
 * Cancel a specific notification by ID
 */
function cancelNotificationById(id: string): void {
  const notifications = loadScheduledNotifications();
  const notification = notifications.find((n) => n.id === id);

  if (notification?.timeoutId) {
    window.clearTimeout(notification.timeoutId);
  }

  const updatedNotifications = notifications.filter((n) => n.id !== id);
  saveScheduledNotifications(updatedNotifications);
}

/**
 * Cancel all reminders for a specific medication
 */
export function cancelMedicationReminders(medicationId: string): void {
  const notifications = loadScheduledNotifications();

  // Clear all timeouts for this medication
  for (const notification of notifications) {
    if (notification.medicationId === medicationId && notification.timeoutId) {
      window.clearTimeout(notification.timeoutId);
    }
  }

  // Remove from storage
  const updatedNotifications = notifications.filter(
    (n) => n.medicationId !== medicationId
  );
  saveScheduledNotifications(updatedNotifications);
}

/**
 * Cancel all medication reminders
 */
export function cancelAllMedicationReminders(): void {
  const notifications = loadScheduledNotifications();

  // Clear all timeouts
  for (const notification of notifications) {
    if (notification.timeoutId) {
      window.clearTimeout(notification.timeoutId);
    }
  }

  // Clear storage
  saveScheduledNotifications([]);
}

// ===== QUERY =====

/**
 * Get all scheduled reminders for a medication
 */
export function getMedicationReminders(medicationId: string): ScheduledNotification[] {
  const notifications = loadScheduledNotifications();
  return notifications.filter((n) => n.medicationId === medicationId);
}

/**
 * Get all scheduled reminders
 */
export function getAllScheduledReminders(): ScheduledNotification[] {
  return loadScheduledNotifications();
}

/**
 * Check if a medication has any scheduled reminders
 */
export function hasMedicationReminders(medicationId: string): boolean {
  const notifications = loadScheduledNotifications();
  return notifications.some((n) => n.medicationId === medicationId);
}

// ===== INITIALIZATION =====

/**
 * Restore scheduled notifications from localStorage on app load
 * This should be called when the app initializes
 */
export function restoreScheduledNotifications(): void {
  if (!hasNotificationPermission()) {
    return;
  }

  const notifications = loadScheduledNotifications();

  // Re-schedule all notifications
  for (const notification of notifications) {
    scheduleMedicationReminder(
      notification.medicationId,
      notification.medicationName,
      notification.time
    );
  }
}

/**
 * Convert dose time label to HH:mm format
 */
export function doseTimeToClockTime(doseTime: string): string {
  const timeMap: Record<string, string> = {
    morning: '08:00',
    afternoon: '12:00',
    evening: '18:00',
    night: '21:00',
    with_food: '12:00',
    before_bed: '22:00',
  };

  // If it's already in HH:mm format, return as-is
  if (/^\d{2}:\d{2}$/.test(doseTime)) {
    return doseTime;
  }

  return timeMap[doseTime] || '09:00';
}

/**
 * Schedule reminders for all active medications
 * Useful for bulk scheduling after permission is granted
 */
export async function scheduleAllMedicationReminders(
  medications: Array<{
    id: string;
    name: string;
    schedule: { times: string[] };
    isActive: boolean;
  }>
): Promise<void> {
  if (!hasNotificationPermission()) {
    const granted = await requestNotificationPermission();
    if (!granted) {
      console.warn('Cannot schedule reminders: notification permission not granted');
      return;
    }
  }

  for (const medication of medications) {
    if (!medication.isActive) continue;

    const clockTimes = medication.schedule.times.map(doseTimeToClockTime);
    scheduleMedicationReminders(medication.id, medication.name, clockTimes);
  }
}
