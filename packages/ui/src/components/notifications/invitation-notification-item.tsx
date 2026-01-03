'use client';

import React, { useState, useCallback } from 'react';
import { UserPlus, Check, X, Loader2 } from 'lucide-react';
import type { NotificationItem, SpaceInviteMetadata } from '@ainexsuite/types';

/**
 * InvitationNotificationItem Component
 *
 * Displays a space invitation notification with Accept/Decline actions.
 */

export interface InvitationNotificationItemProps {
  /** The notification item */
  notification: NotificationItem;
  /** Callback when the invitation is accepted */
  onAccept: (invitationId: string, notificationId: string) => Promise<void>;
  /** Callback when the invitation is declined */
  onDecline: (invitationId: string, notificationId: string) => Promise<void>;
  /** Optional callback when the notification is clicked (for navigation) */
  onNotificationClick?: (id: string) => void;
  /** Callback to mark as read */
  onMarkAsRead?: (id: string) => void;
}

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

function formatRole(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function InvitationNotificationItem({
  notification,
  onAccept,
  onDecline,
  onNotificationClick,
  onMarkAsRead,
}: InvitationNotificationItemProps) {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDecling, setIsDeclining] = useState(false);
  const [localResponded, setLocalResponded] = useState(false);
  const [localResponseType, setLocalResponseType] = useState<'accepted' | 'declined' | null>(null);

  const metadata = notification.metadata as SpaceInviteMetadata | undefined;

  // Check if already responded (from Firestore metadata or local state)
  const alreadyResponded = metadata?.responseStatus === 'accepted' || metadata?.responseStatus === 'declined';
  const responded = alreadyResponded || localResponded;
  const responseType = metadata?.responseStatus || localResponseType;

  const handleAccept = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!metadata?.invitationId || isAccepting || isDecling || responded) return;

    setIsAccepting(true);
    try {
      await onAccept(metadata.invitationId, notification.id);
      setLocalResponded(true);
      setLocalResponseType('accepted');
    } catch (error) {
      console.error('Failed to accept invitation:', error);
    } finally {
      setIsAccepting(false);
    }
  }, [metadata?.invitationId, notification.id, onAccept, isAccepting, isDecling, responded]);

  const handleDecline = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!metadata?.invitationId || isAccepting || isDecling || responded) return;

    setIsDeclining(true);
    try {
      await onDecline(metadata.invitationId, notification.id);
      setLocalResponded(true);
      setLocalResponseType('declined');
    } catch (error) {
      console.error('Failed to decline invitation:', error);
    } finally {
      setIsDeclining(false);
    }
  }, [metadata?.invitationId, notification.id, onDecline, isAccepting, isDecling, responded]);

  const handleClick = useCallback(() => {
    onNotificationClick?.(notification.id);
    if (!notification.read) {
      onMarkAsRead?.(notification.id);
    }
  }, [notification.id, notification.read, onNotificationClick, onMarkAsRead]);

  const isLoading = isAccepting || isDecling;

  // Check if invitation has expired
  const isExpired = metadata?.expiresAt ? metadata.expiresAt < Date.now() : false;

  return (
    <li>
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        className={`
          w-full flex flex-col gap-2 px-4 py-3 text-left
          hover:bg-foreground/5 transition-colors cursor-pointer
          ${!notification.read ? 'bg-primary/5' : ''}
        `}
      >
        {/* Header row with icon, content, and unread indicator */}
        <div className="flex items-start gap-3">
          {/* Inviter photo or default icon */}
          <div className="mt-0.5 shrink-0">
            {metadata?.invitedByPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={metadata.invitedByPhoto}
                alt={metadata.invitedByName || 'Inviter'}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-violet-500/20"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-violet-500/10 flex items-center justify-center ring-2 ring-violet-500/20">
                <UserPlus className="h-4 w-4 text-violet-500" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className={`text-sm ${!notification.read ? 'font-medium text-foreground' : 'text-foreground/80'}`}>
              {notification.title}
            </p>
            {metadata && (
              <p className="text-xs text-muted-foreground mt-0.5">
                <span className="font-medium text-foreground/70">{metadata.invitedByName || 'Someone'}</span>
                {' invited you to join '}
                <span className="font-medium text-foreground/70">{metadata.spaceName}</span>
                {' as '}
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-violet-500/10 text-violet-600 dark:text-violet-400">
                  {formatRole(metadata.role)}
                </span>
              </p>
            )}
            <p className="text-[10px] text-muted-foreground/70 mt-1">
              {formatTimestamp(notification.timestamp)}
              {notification.app && ` \u00b7 ${notification.app}`}
            </p>
          </div>

          {/* Unread indicator */}
          {!notification.read && (
            <div className="shrink-0 mt-1">
              <span className="block h-2 w-2 rounded-full bg-primary" />
            </div>
          )}
        </div>

        {/* Action buttons */}
        {!responded && !isExpired && metadata && (
          <div className="flex items-center gap-2 ml-11">
            <button
              type="button"
              onClick={handleAccept}
              disabled={isLoading}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                transition-all duration-200
                ${isLoading
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 active:scale-95'
                }
              `}
            >
              {isAccepting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              Accept
            </button>
            <button
              type="button"
              onClick={handleDecline}
              disabled={isLoading}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                transition-all duration-200
                ${isLoading
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 active:scale-95'
                }
              `}
            >
              {isDecling ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <X className="h-3.5 w-3.5" />
              )}
              Decline
            </button>
          </div>
        )}

        {/* Response feedback */}
        {responded && responseType && (
          <div className="ml-11">
            <span className={`
              inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium
              ${responseType === 'accepted'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-muted text-muted-foreground'
              }
            `}>
              {responseType === 'accepted' ? (
                <>
                  <Check className="h-3 w-3" />
                  Invitation accepted
                </>
              ) : (
                <>
                  <X className="h-3 w-3" />
                  Invitation declined
                </>
              )}
            </span>
          </div>
        )}

        {/* Expired indicator */}
        {isExpired && !responded && (
          <div className="ml-11">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">
              Invitation expired
            </span>
          </div>
        )}
      </div>
    </li>
  );
}
