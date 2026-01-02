/**
 * Notification Service
 * Handles user notifications for spaces and general app events
 */

import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Unsubscribe,
  writeBatch,
} from 'firebase/firestore';
import { db } from './client';
import type { NotificationItem, NotificationType } from '@ainexsuite/types';

const NOTIFICATIONS_COLLECTION = 'notifications';

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message?: string;
  app?: string;
  actionUrl?: string;
  actionLabel?: string;
  icon?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Create a new notification for a user
 */
export async function createNotification(
  params: CreateNotificationParams
): Promise<NotificationItem> {
  const { userId, type, title, message, app, actionUrl, actionLabel, icon, metadata } = params;

  const notificationData: Omit<NotificationItem, 'id'> = {
    type,
    title,
    message,
    timestamp: Date.now(),
    read: false,
    app: app as NotificationItem['app'],
    actionUrl,
    actionLabel,
    icon,
    metadata,
  };

  // Clean undefined values
  Object.keys(notificationData).forEach((key) => {
    if (notificationData[key as keyof typeof notificationData] === undefined) {
      delete notificationData[key as keyof typeof notificationData];
    }
  });

  const userNotificationsRef = collection(db, 'users', userId, NOTIFICATIONS_COLLECTION);
  const docRef = await addDoc(userNotificationsRef, notificationData);

  return {
    id: docRef.id,
    ...notificationData,
  } as NotificationItem;
}

/**
 * Get notifications for a user
 */
export async function getNotificationsForUser(
  userId: string,
  options?: {
    unreadOnly?: boolean;
    limitCount?: number;
  }
): Promise<NotificationItem[]> {
  const { unreadOnly = false, limitCount = 50 } = options || {};

  const userNotificationsRef = collection(db, 'users', userId, NOTIFICATIONS_COLLECTION);

  let q = query(
    userNotificationsRef,
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );

  if (unreadOnly) {
    q = query(
      userNotificationsRef,
      where('read', '==', false),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as NotificationItem[];
}

/**
 * Subscribe to real-time notifications for a user
 */
export function subscribeToNotifications(
  userId: string,
  callback: (notifications: NotificationItem[]) => void,
  options?: {
    unreadOnly?: boolean;
    limitCount?: number;
  }
): Unsubscribe {
  const { unreadOnly = false, limitCount = 50 } = options || {};

  const userNotificationsRef = collection(db, 'users', userId, NOTIFICATIONS_COLLECTION);

  let q = query(
    userNotificationsRef,
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );

  if (unreadOnly) {
    q = query(
      userNotificationsRef,
      where('read', '==', false),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
  }

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as NotificationItem[];
    callback(notifications);
  });
}

/**
 * Mark a notification as read
 */
export async function markNotificationRead(
  userId: string,
  notificationId: string
): Promise<void> {
  const notificationRef = doc(db, 'users', userId, NOTIFICATIONS_COLLECTION, notificationId);
  await updateDoc(notificationRef, {
    read: true,
  });
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsRead(userId: string): Promise<void> {
  const userNotificationsRef = collection(db, 'users', userId, NOTIFICATIONS_COLLECTION);
  const q = query(userNotificationsRef, where('read', '==', false));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return;

  const batch = writeBatch(db);
  snapshot.docs.forEach((docSnap) => {
    batch.update(docSnap.ref, { read: true });
  });

  await batch.commit();
}

/**
 * Delete a notification
 */
export async function deleteNotification(
  userId: string,
  notificationId: string
): Promise<void> {
  const notificationRef = doc(db, 'users', userId, NOTIFICATIONS_COLLECTION, notificationId);
  await deleteDoc(notificationRef);
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const userNotificationsRef = collection(db, 'users', userId, NOTIFICATIONS_COLLECTION);
  const q = query(userNotificationsRef, where('read', '==', false));
  const snapshot = await getDocs(q);
  return snapshot.size;
}

/**
 * Create a space invite notification
 */
export async function createSpaceInviteNotification(params: {
  userId: string;
  invitationId: string;
  spaceId: string;
  spaceName: string;
  spaceType: string;
  invitedBy: string;
  invitedByName?: string;
  invitedByPhoto?: string;
  role: string;
  expiresAt: number;
}): Promise<NotificationItem> {
  const {
    userId,
    invitationId,
    spaceId,
    spaceName,
    spaceType,
    invitedBy,
    invitedByName,
    invitedByPhoto,
    role,
    expiresAt,
  } = params;

  return createNotification({
    userId,
    type: 'space_invite',
    title: `Invitation to join ${spaceName}`,
    message: invitedByName
      ? `${invitedByName} invited you to join as ${role}`
      : `You've been invited to join as ${role}`,
    icon: 'UserPlus',
    actionUrl: `/spaces/invitations/${invitationId}`,
    actionLabel: 'View Invitation',
    metadata: {
      invitationId,
      spaceId,
      spaceName,
      spaceType,
      invitedBy,
      invitedByName,
      invitedByPhoto,
      role,
      expiresAt,
    },
  });
}

/**
 * Create a notification when someone accepts your invite
 */
export async function createSpaceAcceptedNotification(params: {
  userId: string;
  spaceId: string;
  spaceName: string;
  acceptedByName: string;
  acceptedByPhoto?: string;
}): Promise<NotificationItem> {
  const { userId, spaceId, spaceName, acceptedByName, acceptedByPhoto } = params;

  return createNotification({
    userId,
    type: 'space_accepted',
    title: `${acceptedByName} joined ${spaceName}`,
    message: 'Your invitation was accepted',
    icon: 'UserCheck',
    actionUrl: `/spaces/${spaceId}/members`,
    actionLabel: 'View Members',
    metadata: {
      spaceId,
      spaceName,
      acceptedByName,
      acceptedByPhoto,
    },
  });
}

/**
 * Create a notification when a new member joins a space you're in
 */
export async function createSpaceJoinedNotification(params: {
  userId: string;
  spaceId: string;
  spaceName: string;
  newMemberName: string;
  newMemberPhoto?: string;
}): Promise<NotificationItem> {
  const { userId, spaceId, spaceName, newMemberName, newMemberPhoto } = params;

  return createNotification({
    userId,
    type: 'space_joined',
    title: `${newMemberName} joined ${spaceName}`,
    message: 'A new member has joined your space',
    icon: 'Users',
    actionUrl: `/spaces/${spaceId}/members`,
    actionLabel: 'View Members',
    metadata: {
      spaceId,
      spaceName,
      newMemberName,
      newMemberPhoto,
    },
  });
}
