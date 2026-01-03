import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
  writeBatch,
  type Query,
  type DocumentReference,
  type DocumentData,
  type QuerySnapshot,
  type DocumentSnapshot,
  type FirestoreError
} from 'firebase/firestore';
import { db } from '@ainexsuite/firebase';

// Global error handler for permission-denied errors
// Apps can set this to trigger logout when session is invalidated
let globalPermissionErrorHandler: (() => void) | null = null;

export function setPermissionErrorHandler(handler: () => void) {
  globalPermissionErrorHandler = handler;
}

// Used for state management, will be called when permission-denied handling is re-enabled
void globalPermissionErrorHandler;

// Check if error is permission-denied (session invalidated)
function isPermissionDenied(err: FirestoreError): boolean {
  return err?.code === 'permission-denied' ||
    err?.message?.includes('permission-denied') ||
    err?.message?.includes('Missing or insufficient permissions');
}

// Wrapper for onSnapshot with permission-denied handling
function safeOnSnapshot<T extends DocumentData>(
  ref: Query<T> | DocumentReference<T>,
  onNext: (snapshot: QuerySnapshot<T> | DocumentSnapshot<T>) => void,
  onError?: (error: FirestoreError) => void
) {
  return onSnapshot(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ref as any,
    onNext,
    (err: FirestoreError) => {
      if (isPermissionDenied(err)) {
        // eslint-disable-next-line no-console
        console.warn('[Firebase] Permission denied - may need to re-login or check security rules');
        // Note: We no longer automatically logout on permission errors to avoid logout loops
        // The error will be passed to the onError handler if provided
        onError?.(err);
      } else {
        // eslint-disable-next-line no-console
        console.error('[Firebase] Snapshot error:', err);
        onError?.(err);
      }
    }
  );
}

import { Habit, Space, Quest, Completion, Notification, HabitReminder, UserReminderPreferences } from '../types/models';

// Helper to deeply remove undefined values from objects (Firestore doesn't accept undefined)
function removeUndefined<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(removeUndefined) as T;
  }
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        result[key] = typeof value === 'object' && value !== null
          ? removeUndefined(value)
          : value;
      }
    }
    return result as T;
  }
  return obj;
}

// --- Spaces ---

export async function createSpaceInDb(space: Space) {
  const spaceRef = doc(collection(db, 'spaces'), space.id);
  await setDoc(spaceRef, removeUndefined(space));
}

export async function updateSpaceInDb(spaceId: string, updates: Partial<Space>) {
  const spaceRef = doc(db, 'spaces', spaceId);
  await updateDoc(spaceRef, updates);
}

export function subscribeToUserSpaces(userId: string, callback: (spaces: Space[]) => void) {
  const q = query(
    collection(db, 'spaces'),
    where('memberUids', 'array-contains', userId)
  );

  return safeOnSnapshot(q, (snapshot) => {
    const spaces = (snapshot as QuerySnapshot).docs.map(doc => doc.data() as Space);
    callback(spaces);
  });
}

// --- Habits ---

export async function createHabitInDb(habit: Habit) {
  const habitRef = doc(collection(db, 'habits'), habit.id);
  await setDoc(habitRef, removeUndefined(habit));
}

export async function updateHabitInDb(habitId: string, updates: Partial<Habit>) {
  const habitRef = doc(db, 'habits', habitId);
  await updateDoc(habitRef, removeUndefined(updates));
}

export async function deleteHabitInDb(habitId: string) {
  const habitRef = doc(db, 'habits', habitId);
  await deleteDoc(habitRef);
}

// --- Bulk Habit Operations ---

export async function bulkDeleteHabitsInDb(habitIds: string[]): Promise<void> {
  if (habitIds.length === 0) return;

  // Firestore batch limit is 500 operations per batch
  const batchSize = 500;
  const batches: string[][] = [];

  for (let i = 0; i < habitIds.length; i += batchSize) {
    batches.push(habitIds.slice(i, i + batchSize));
  }

  for (const batchIds of batches) {
    const batch = writeBatch(db);
    for (const habitId of batchIds) {
      const habitRef = doc(db, 'habits', habitId);
      batch.delete(habitRef);
    }
    await batch.commit();
  }
}

export async function bulkUpdateHabitsInDb(habitIds: string[], updates: Partial<Habit>): Promise<void> {
  if (habitIds.length === 0) return;

  const cleanUpdates = removeUndefined(updates);

  // Firestore batch limit is 500 operations per batch
  const batchSize = 500;
  const batches: string[][] = [];

  for (let i = 0; i < habitIds.length; i += batchSize) {
    batches.push(habitIds.slice(i, i + batchSize));
  }

  for (const batchIds of batches) {
    const batch = writeBatch(db);
    for (const habitId of batchIds) {
      const habitRef = doc(db, 'habits', habitId);
      batch.update(habitRef, cleanUpdates);
    }
    await batch.commit();
  }
}

export function subscribeToSpaceHabits(spaceId: string, callback: (habits: Habit[]) => void, userId?: string) {
  // For personal space, we need to also filter by createdBy to match security rules
  const q = spaceId === 'personal' && userId
    ? query(
        collection(db, 'habits'),
        where('spaceId', '==', spaceId),
        where('createdBy', '==', userId)
      )
    : query(
        collection(db, 'habits'),
        where('spaceId', '==', spaceId)
      );

  return safeOnSnapshot(q, (snapshot) => {
    const habits = (snapshot as QuerySnapshot).docs.map(doc => doc.data() as Habit);
    callback(habits);
  });
}

// --- Completions ---

export async function createCompletionInDb(completion: Completion) {
  const compRef = doc(collection(db, 'completions'), completion.id);
  await setDoc(compRef, removeUndefined(completion));
}

export async function deleteCompletionInDb(completionId: string) {
  const compRef = doc(db, 'completions', completionId);
  await deleteDoc(compRef);
}

export async function updateCompletionInDb(completionId: string, updates: Partial<Completion>) {
  const compRef = doc(db, 'completions', completionId);
  await updateDoc(compRef, removeUndefined(updates));
}

export function subscribeToCompletions(spaceId: string, callback: (completions: Completion[]) => void, userId?: string) {
  // For personal space, we need to also filter by userId to match security rules
  const q = spaceId === 'personal' && userId
    ? query(
        collection(db, 'completions'),
        where('spaceId', '==', spaceId),
        where('userId', '==', userId)
      )
    : query(
        collection(db, 'completions'),
        where('spaceId', '==', spaceId)
      );

  return safeOnSnapshot(q, (snapshot) => {
    const completions = (snapshot as QuerySnapshot).docs.map(doc => doc.data() as Completion);
    callback(completions);
  });
}

// --- Quests ---

export async function createQuestInDb(quest: Quest) {
  const questRef = doc(collection(db, 'quests'), quest.id);
  await setDoc(questRef, removeUndefined(quest));
}

export function subscribeToSpaceQuests(spaceId: string, callback: (quests: Quest[]) => void) {
  const q = query(
    collection(db, 'quests'),
    where('spaceId', '==', spaceId)
  );

  return safeOnSnapshot(q, (snapshot) => {
    const quests = (snapshot as QuerySnapshot).docs.map(doc => doc.data() as Quest);
    callback(quests);
  });
}

// --- Notifications ---

export async function createNotificationInDb(notification: Notification) {
  const notifRef = doc(collection(db, 'notifications'), notification.id);
  await setDoc(notifRef, removeUndefined(notification));
}

export async function markNotificationReadInDb(notificationId: string) {
  const notifRef = doc(db, 'notifications', notificationId);
  await updateDoc(notifRef, { isRead: true });
}

export function subscribeToUserNotifications(userId: string, callback: (notifications: Notification[]) => void) {
  const q = query(
    collection(db, 'notifications'),
    where('recipientId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(20)
  );

  return safeOnSnapshot(q, (snapshot) => {
    const notifications = (snapshot as QuerySnapshot).docs.map(doc => doc.data() as Notification);
    callback(notifications);
  });
}

// --- Reminders ---

export async function createReminderInDb(reminder: HabitReminder) {
  const reminderRef = doc(collection(db, 'habitReminders'), reminder.id);
  await setDoc(reminderRef, removeUndefined(reminder));
}

export async function updateReminderInDb(reminderId: string, updates: Partial<HabitReminder>) {
  const reminderRef = doc(db, 'habitReminders', reminderId);
  await updateDoc(reminderRef, removeUndefined({
    ...updates,
    updatedAt: new Date().toISOString()
  }));
}

export async function deleteReminderInDb(reminderId: string) {
  const reminderRef = doc(db, 'habitReminders', reminderId);
  await deleteDoc(reminderRef);
}

export function subscribeToUserReminders(userId: string, callback: (reminders: HabitReminder[]) => void) {
  const q = query(
    collection(db, 'habitReminders'),
    where('userId', '==', userId)
  );

  return safeOnSnapshot(q, (snapshot) => {
    const reminders = (snapshot as QuerySnapshot).docs.map(doc => doc.data() as HabitReminder);
    callback(reminders);
  });
}

export async function getUserReminders(userId: string): Promise<HabitReminder[]> {
  const q = query(
    collection(db, 'habitReminders'),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as HabitReminder);
}

export async function getReminderByHabitId(userId: string, habitId: string): Promise<HabitReminder | null> {
  const q = query(
    collection(db, 'habitReminders'),
    where('userId', '==', userId),
    where('habitId', '==', habitId)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as HabitReminder;
}

export async function getReminderPreferences(userId: string): Promise<UserReminderPreferences | null> {
  const prefsRef = doc(db, 'userReminderPreferences', userId);
  const snapshot = await getDoc(prefsRef);
  if (!snapshot.exists()) return null;
  return snapshot.data() as UserReminderPreferences;
}

// --- User Reminder Preferences ---

export async function saveReminderPreferencesInDb(preferences: UserReminderPreferences) {
  const prefsRef = doc(db, 'userReminderPreferences', preferences.userId);
  await setDoc(prefsRef, removeUndefined(preferences));
}

export async function updateReminderPreferencesInDb(userId: string, updates: Partial<UserReminderPreferences>) {
  const prefsRef = doc(db, 'userReminderPreferences', userId);
  await updateDoc(prefsRef, removeUndefined(updates));
}

export function subscribeToReminderPreferences(userId: string, callback: (preferences: UserReminderPreferences | null) => void) {
  const prefsRef = doc(db, 'userReminderPreferences', userId);

  return safeOnSnapshot(prefsRef, (snapshot) => {
    const docSnap = snapshot as DocumentSnapshot;
    if (docSnap.exists()) {
      callback(docSnap.data() as UserReminderPreferences);
    } else {
      callback(null);
    }
  });
}