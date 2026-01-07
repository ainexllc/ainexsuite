export function formatDateTimeLocalInput(date: Date) {
  const pad = (value: number) => value.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function parseDateTimeLocalInput(value: string): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

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
