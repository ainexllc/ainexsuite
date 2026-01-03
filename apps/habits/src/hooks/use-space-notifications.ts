'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@ainexsuite/auth';
import {
  subscribeToNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  markInvitationResponded,
} from '@ainexsuite/firebase';
import type { NotificationItem } from '@ainexsuite/types';

interface UseSpaceNotificationsResult {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotif: (id: string) => void;
  handleAcceptInvitation: (invitationId: string, notificationId: string) => Promise<void>;
  handleDeclineInvitation: (invitationId: string, notificationId: string) => Promise<void>;
  isLoading: boolean;
}

export function useSpaceNotifications(): UseSpaceNotificationsResult {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Subscribe to notifications
  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      unsubscribeRef.current = subscribeToNotifications(
        user.uid,
        (items) => {
          setNotifications(items);
          setIsLoading(false);
        },
        { limitCount: 50 }
      );
    } catch {
      setIsLoading(false);
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [user?.uid]);

  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Mark a single notification as read
  const markAsRead = useCallback(
    async (id: string) => {
      if (!user?.uid) return;
      try {
        await markNotificationRead(user.uid, id);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    },
    [user?.uid]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user?.uid) return;
    try {
      await markAllNotificationsRead(user.uid);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [user?.uid]);

  // Delete a notification
  const deleteNotif = useCallback(
    async (id: string) => {
      if (!user?.uid) return;
      try {
        await deleteNotification(user.uid, id);
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    },
    [user?.uid]
  );

  // Handle accepting a space invitation
  const handleAcceptInvitation = useCallback(
    async (invitationId: string, notificationId: string) => {
      if (!user?.uid) return;

      try {
        const response = await fetch('/api/spaces/invite/respond', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            invitationId,
            spaceCollection: 'spaces',
            action: 'accept',
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to accept invitation');
        }

        // Mark notification as responded (accepted) and read
        await markInvitationResponded(user.uid, notificationId, 'accepted');
      } catch (error) {
        console.error('Error accepting invitation:', error);
        throw error;
      }
    },
    [user?.uid]
  );

  // Handle declining a space invitation
  const handleDeclineInvitation = useCallback(
    async (invitationId: string, notificationId: string) => {
      if (!user?.uid) return;

      try {
        const response = await fetch('/api/spaces/invite/respond', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            invitationId,
            spaceCollection: 'spaces',
            action: 'decline',
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to decline invitation');
        }

        // Mark notification as responded (declined) and read
        await markInvitationResponded(user.uid, notificationId, 'declined');
      } catch (error) {
        console.error('Error declining invitation:', error);
        throw error;
      }
    },
    [user?.uid]
  );

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotif,
    handleAcceptInvitation,
    handleDeclineInvitation,
    isLoading,
  };
}
