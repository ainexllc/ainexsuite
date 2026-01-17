export function formatRelativeTime(date: Date) {
  const diff = Date.now() - date.getTime();

  if (diff < 45_000) {
    return "Just now";
  }

  if (diff < 3_600_000) {
    const minutes = Math.max(1, Math.floor(diff / 60_000));
    return `${minutes}m ago`;
  }

  if (diff < 86_400_000) {
    const hours = Math.max(1, Math.floor(diff / 3_600_000));
    return `${hours}h ago`;
  }

  return date.toLocaleDateString();
}

// Trash Retention Utilities
export const TRASH_RETENTION_DAYS = 30;

/**
 * Calculate days remaining before a trashed task is permanently deleted.
 * @param deletedAt - The date when the task was moved to trash
 * @returns Number of days remaining (0 if expired)
 */
export function getDaysRemaining(deletedAt: Date): number {
  const expirationDate = new Date(deletedAt);
  expirationDate.setDate(expirationDate.getDate() + TRASH_RETENTION_DAYS);

  const now = new Date();
  const diffMs = expirationDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}

/**
 * Get a human-readable label for days remaining.
 * @param deletedAt - The date when the task was moved to trash
 * @returns Formatted string like "25 days remaining" or "Expires today"
 */
export function getDaysRemainingLabel(deletedAt: Date): string {
  const days = getDaysRemaining(deletedAt);

  if (days === 0) return "Expires today";
  if (days === 1) return "1 day remaining";
  return `${days} days remaining`;
}

export type UrgencyLevel = "critical" | "warning" | "normal";

/**
 * Determine visual urgency level based on days remaining.
 * - critical: <=3 days (red)
 * - warning: <=7 days (amber)
 * - normal: >7 days (default)
 */
export function getUrgencyLevel(deletedAt: Date): UrgencyLevel {
  const days = getDaysRemaining(deletedAt);
  if (days <= 3) return "critical";
  if (days <= 7) return "warning";
  return "normal";
}
