import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '@ainexsuite/firebase';
import { Habit, Space, Quest, Completion, Notification } from '../types/models';

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

  return onSnapshot(q, (snapshot) => {
    const spaces = snapshot.docs.map(doc => doc.data() as Space);
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

export function subscribeToSpaceHabits(spaceId: string, callback: (habits: Habit[]) => void) {
  const q = query(
    collection(db, 'habits'),
    where('spaceId', '==', spaceId)
  );

  return onSnapshot(q, (snapshot) => {
    const habits = snapshot.docs.map(doc => doc.data() as Habit);
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

export function subscribeToCompletions(spaceId: string, callback: (completions: Completion[]) => void) {
  const q = query(
    collection(db, 'completions'),
    where('spaceId', '==', spaceId)
  );

  return onSnapshot(q, (snapshot) => {
    const completions = snapshot.docs.map(doc => doc.data() as Completion);
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

  return onSnapshot(q, (snapshot) => {
    const quests = snapshot.docs.map(doc => doc.data() as Quest);
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

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => doc.data() as Notification);
    callback(notifications);
  });
}