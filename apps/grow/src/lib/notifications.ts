// Notification permission and scheduling utilities

export type NotificationPermissionStatus = 'granted' | 'denied' | 'default' | 'unsupported';

export async function getNotificationPermission(): Promise<NotificationPermissionStatus> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission as NotificationPermissionStatus;
}

export async function requestNotificationPermission(): Promise<NotificationPermissionStatus> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission as NotificationPermissionStatus;
  } catch {
    return 'denied';
  }
}

export function canShowNotifications(): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  return Notification.permission === 'granted';
}

export interface LocalNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  data?: Record<string, unknown>;
}

export function showLocalNotification(options: LocalNotificationOptions): Notification | null {
  if (!canShowNotifications()) {
    console.warn('Notifications not permitted');
    return null;
  }

  try {
    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || '/icons/icon-192.png',
      badge: options.badge || '/icons/icon-192.png',
      tag: options.tag,
      requireInteraction: options.requireInteraction,
      data: options.data,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  } catch (error) {
    console.error('Failed to show notification:', error);
    return null;
  }
}

// Time preset to actual hours
export const REMINDER_TIME_PRESETS = {
  morning: { hour: 8, minute: 0, label: '8:00 AM' },
  afternoon: { hour: 13, minute: 0, label: '1:00 PM' },
  evening: { hour: 19, minute: 0, label: '7:00 PM' },
} as const;

export function parseTimeString(time: string): { hour: number; minute: number } {
  const [hour, minute] = time.split(':').map(Number);
  return { hour, minute };
}

export function formatTimeString(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

export function formatTimeDisplay(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
}

export function isWithinQuietHours(
  quietStart: string | undefined,
  quietEnd: string | undefined
): boolean {
  if (!quietStart || !quietEnd) return false;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const start = parseTimeString(quietStart);
  const end = parseTimeString(quietEnd);
  const startMinutes = start.hour * 60 + start.minute;
  const endMinutes = end.hour * 60 + end.minute;

  // Handle overnight quiet hours (e.g., 22:00 to 07:00)
  if (startMinutes > endMinutes) {
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }

  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

// Calculate next reminder time
export function getNextReminderTime(
  reminderTime: 'morning' | 'afternoon' | 'evening' | 'custom',
  customTime?: string
): Date {
  const now = new Date();
  let targetHour: number;
  let targetMinute: number;

  if (reminderTime === 'custom' && customTime) {
    const parsed = parseTimeString(customTime);
    targetHour = parsed.hour;
    targetMinute = parsed.minute;
  } else if (reminderTime !== 'custom') {
    const preset = REMINDER_TIME_PRESETS[reminderTime];
    targetHour = preset.hour;
    targetMinute = preset.minute;
  } else {
    // Default to morning if custom but no time set
    targetHour = 8;
    targetMinute = 0;
  }

  const target = new Date(now);
  target.setHours(targetHour, targetMinute, 0, 0);

  // If time has passed today, schedule for tomorrow
  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }

  return target;
}

// Store reminder timeouts for cleanup
const reminderTimeouts = new Map<string, NodeJS.Timeout>();

export function scheduleReminder(
  id: string,
  callback: () => void,
  targetTime: Date
): void {
  // Clear existing timeout for this ID
  cancelReminder(id);

  const now = new Date();
  const delay = targetTime.getTime() - now.getTime();

  if (delay <= 0) {
    console.warn('Reminder time is in the past, skipping');
    return;
  }

  // Max timeout is ~24 days in JS, but we'll reschedule daily
  const maxDelay = 24 * 60 * 60 * 1000; // 24 hours
  const actualDelay = Math.min(delay, maxDelay);

  const timeout = setTimeout(() => {
    if (delay > maxDelay) {
      // Reschedule for remaining time
      scheduleReminder(id, callback, targetTime);
    } else {
      callback();
      reminderTimeouts.delete(id);
    }
  }, actualDelay);

  reminderTimeouts.set(id, timeout);
}

export function cancelReminder(id: string): void {
  const timeout = reminderTimeouts.get(id);
  if (timeout) {
    clearTimeout(timeout);
    reminderTimeouts.delete(id);
  }
}

export function cancelAllReminders(): void {
  reminderTimeouts.forEach((timeout) => clearTimeout(timeout));
  reminderTimeouts.clear();
}
