'use client';

import React from 'react';
import { Bell } from 'lucide-react';

/**
 * NotificationBell Component
 *
 * A bell icon button with an optional unread count badge.
 */

export interface NotificationBellProps {
  /** Number of unread notifications */
  count?: number;
  /** Callback when the bell is clicked */
  onClick: () => void;
  /** Whether the notification panel is open */
  isOpen?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Maximum count to display (shows "9+" if exceeded) */
  maxCount?: number;
}

export function NotificationBell({
  count = 0,
  onClick,
  isOpen = false,
  className = '',
  maxCount = 9,
}: NotificationBellProps) {
  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();
  const hasUnread = count > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative flex h-9 w-9 items-center justify-center rounded-full
        transition-all
        ${isOpen
          ? 'bg-zinc-300/80 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'
          : 'text-zinc-500 hover:bg-zinc-300/80 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'
        }
        focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2 focus:ring-offset-background
        ${className}
      `}
      aria-label={`Notifications${hasUnread ? `, ${count} unread` : ''}`}
      aria-expanded={isOpen}
      aria-haspopup="true"
    >
      <Bell className="h-4 w-4" aria-hidden />
      {hasUnread && (
        <span
          className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white"
          aria-hidden
        >
          {displayCount}
        </span>
      )}
    </button>
  );
}
