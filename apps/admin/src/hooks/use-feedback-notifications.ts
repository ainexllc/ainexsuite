'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '@ainexsuite/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  limit,
  Timestamp,
} from 'firebase/firestore';
import type { NotificationItem } from '@ainexsuite/types';

// Local storage key for tracking read notification IDs
const READ_NOTIFICATIONS_KEY = 'ainex-admin-read-feedback-notifications';
// Local storage key for tracking dismissed notification IDs
const DISMISSED_NOTIFICATIONS_KEY = 'ainex-admin-dismissed-feedback-notifications';

interface FeedbackDoc {
  userId: string | null;
  authorName: string | null;
  authorEmail: string | null;
  message: string;
  appId: string;
  path: string;
  createdAt: Timestamp;
  status: 'new' | 'read' | 'archived';
}

interface UseFeedbackNotificationsResult {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  isLoading: boolean;
}

export function useFeedbackNotifications(): UseFeedbackNotificationsResult {
  const [feedbackItems, setFeedbackItems] = useState<Array<{ id: string; data: FeedbackDoc }>>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const initialLoadDone = useRef(false);

  // Load read/dismissed IDs from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedRead = localStorage.getItem(READ_NOTIFICATIONS_KEY);
        const storedDismissed = localStorage.getItem(DISMISSED_NOTIFICATIONS_KEY);
        if (storedRead) {
          setReadIds(new Set(JSON.parse(storedRead)));
        }
        if (storedDismissed) {
          setDismissedIds(new Set(JSON.parse(storedDismissed)));
        }
      } catch {
        // Ignore localStorage errors
      }
    }
  }, []);

  // Save read IDs to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined' && initialLoadDone.current) {
      try {
        localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify([...readIds]));
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [readIds]);

  // Save dismissed IDs to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined' && initialLoadDone.current) {
      try {
        localStorage.setItem(DISMISSED_NOTIFICATIONS_KEY, JSON.stringify([...dismissedIds]));
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [dismissedIds]);

  // Subscribe to new feedback items in Firestore
  useEffect(() => {
    // Get feedback from the last 7 days with status 'new'
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const feedbackRef = collection(db, 'feedback');
    const feedbackQuery = query(
      feedbackRef,
      where('createdAt', '>=', Timestamp.fromDate(sevenDaysAgo)),
      orderBy('createdAt', 'desc'),
      limit(50) // Limit to 50 most recent
    );

    const unsubscribe = onSnapshot(
      feedbackQuery,
      (snapshot) => {
        const items: Array<{ id: string; data: FeedbackDoc }> = [];
        snapshot.forEach((doc) => {
          items.push({
            id: doc.id,
            data: doc.data() as FeedbackDoc,
          });
        });
        setFeedbackItems(items);
        setIsLoading(false);
        initialLoadDone.current = true;
      },
      (error) => {
        console.error('Error fetching feedback notifications:', error);
        setIsLoading(false);
        initialLoadDone.current = true;
      }
    );

    return () => unsubscribe();
  }, []);

  // Transform feedback items into notification items
  const notifications: NotificationItem[] = feedbackItems
    .filter((item) => !dismissedIds.has(item.id))
    .map((item) => {
      const { data } = item;
      const isRead = readIds.has(item.id) || data.status !== 'new';

      // Create a descriptive title
      const appName = data.appId.charAt(0).toUpperCase() + data.appId.slice(1);
      const title = `New feedback from ${appName}`;

      // Create a preview of the message
      const messagePreview =
        data.message.length > 100
          ? data.message.substring(0, 100) + '...'
          : data.message;

      return {
        id: item.id,
        type: 'feedback' as const,
        title,
        message: messagePreview,
        timestamp: data.createdAt?.toDate?.()?.getTime() ?? Date.now(),
        read: isRead,
        app: 'admin' as const,
        actionUrl: '/workspace/feedback',
        actionLabel: 'View Feedback',
        icon: 'MessageSquare',
        metadata: {
          feedbackId: item.id,
          appId: data.appId,
          authorName: data.authorName,
          authorEmail: data.authorEmail,
          path: data.path,
        },
      };
    });

  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Mark a single notification as read
  const markAsRead = useCallback((id: string) => {
    setReadIds((prev) => new Set([...prev, id]));
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    const allIds = feedbackItems.map((item) => item.id);
    setReadIds((prev) => new Set([...prev, ...allIds]));
  }, [feedbackItems]);

  // Clear all notifications (dismiss them locally)
  const clearAll = useCallback(() => {
    const allIds = feedbackItems.map((item) => item.id);
    setDismissedIds((prev) => new Set([...prev, ...allIds]));
  }, [feedbackItems]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    isLoading,
  };
}
