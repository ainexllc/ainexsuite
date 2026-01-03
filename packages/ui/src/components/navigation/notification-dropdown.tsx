'use client';

import React, { useEffect, useRef } from 'react';
import {
  Bell,
  CheckCheck,
  X,
  Info,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Clock,
  AtSign,
  RefreshCw,
  UserPlus,
  UserCheck,
  Users,
  MessageSquare,
} from 'lucide-react';
import type { NotificationItem, NotificationType } from '@ainexsuite/types';
import { InvitationNotificationItem } from '../notifications/invitation-notification-item';

/**
 * NotificationDropdown Component
 *
 * A dropdown panel showing notification items with actions.
 */

export interface NotificationDropdownProps {
  /** Whether the dropdown is open */
  isOpen: boolean;
  /** Callback to close the dropdown */
  onClose: () => void;
  /** Array of notification items */
  items: NotificationItem[];
  /** Callback when a notification is clicked */
  onNotificationClick?: (id: string) => void;
  /** Callback to mark a notification as read */
  onMarkAsRead?: (id: string) => void;
  /** Callback to mark all notifications as read */
  onMarkAllRead?: () => void;
  /** Callback to clear all notifications */
  onClearAll?: () => void;
  /** Callback to view all notifications (navigate to notifications page) */
  onViewAll?: () => void;
  /** Callback when a space invitation is accepted */
  onAcceptInvitation?: (invitationId: string, notificationId: string) => Promise<void>;
  /** Callback when a space invitation is declined */
  onDeclineInvitation?: (invitationId: string, notificationId: string) => Promise<void>;
  /** Additional CSS classes */
  className?: string;
}

const NOTIFICATION_ICONS: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
  reminder: Clock,
  mention: AtSign,
  update: RefreshCw,
  space_invite: UserPlus,
  space_accepted: UserCheck,
  space_joined: Users,
  feedback: MessageSquare,
};

const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  info: 'text-blue-500',
  success: 'text-green-500',
  warning: 'text-amber-500',
  error: 'text-red-500',
  reminder: 'text-purple-500',
  mention: 'text-cyan-500',
  update: 'text-indigo-500',
  space_invite: 'text-violet-500',
  space_accepted: 'text-emerald-500',
  space_joined: 'text-teal-500',
  feedback: 'text-orange-500',
};

function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export function NotificationDropdown({
  isOpen,
  onClose,
  items,
  onNotificationClick,
  onMarkAsRead,
  onMarkAllRead,
  onClearAll,
  onViewAll,
  onAcceptInvitation,
  onDeclineInvitation,
  className = '',
}: NotificationDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadCount = items.filter((item) => !item.read).length;
  const hasItems = items.length > 0;

  return (
    <div
      ref={dropdownRef}
      className={`
        absolute top-full right-0 mt-2 w-80 sm:w-96
        rounded-xl border border-border
        bg-background/95 backdrop-blur-xl
        shadow-xl
        animate-in fade-in slide-in-from-top-2 duration-200
        z-50
        ${className}
      `}
      role="menu"
      aria-label="Notifications"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold text-foreground">Notifications</span>
          {unreadCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-xs font-medium text-primary">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && onMarkAllRead && (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-colors"
              title="Mark all as read"
            >
              <CheckCheck className="h-4 w-4" />
            </button>
          )}
          {hasItems && onClearAll && (
            <button
              type="button"
              onClick={onClearAll}
              className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
              title="Clear all"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Notification List */}
      <div className="max-h-80 overflow-y-auto">
        {hasItems ? (
          <ul className="py-1">
            {items.map((item) => {
              // Render InvitationNotificationItem for space_invite type
              if (item.type === 'space_invite' && onAcceptInvitation && onDeclineInvitation) {
                return (
                  <InvitationNotificationItem
                    key={item.id}
                    notification={item}
                    onAccept={onAcceptInvitation}
                    onDecline={onDeclineInvitation}
                    onNotificationClick={onNotificationClick}
                    onMarkAsRead={onMarkAsRead}
                  />
                );
              }

              // Default notification rendering
              const Icon = NOTIFICATION_ICONS[item.type] || Info;
              const colorClass = NOTIFICATION_COLORS[item.type] || 'text-muted-foreground';

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onNotificationClick?.(item.id);
                      if (!item.read) {
                        onMarkAsRead?.(item.id);
                      }
                    }}
                    className={`
                      w-full flex items-start gap-3 px-4 py-3 text-left
                      hover:bg-foreground/5 transition-colors
                      ${!item.read ? 'bg-primary/5' : ''}
                    `}
                  >
                    <div className={`mt-0.5 shrink-0 ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!item.read ? 'font-medium text-foreground' : 'text-foreground/80'}`}>
                        {item.title}
                      </p>
                      {item.message && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {item.message}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground/70 mt-1">
                        {formatTimestamp(item.timestamp)}
                        {item.app && ` \u00b7 ${item.app}`}
                      </p>
                    </div>
                    {!item.read && (
                      <div className="shrink-0 mt-1">
                        <span className="block h-2 w-2 rounded-full bg-primary" />
                      </div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bell className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">No notifications</p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">
              You&apos;re all caught up!
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {onViewAll && (
        <div className="border-t border-border px-4 py-2">
          <button
            type="button"
            onClick={onViewAll}
            className="w-full text-center text-sm text-primary hover:text-primary/80 transition-colors py-1"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
}
