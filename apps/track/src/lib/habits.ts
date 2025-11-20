import { db, createActivity } from '@ainexsuite/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { auth } from '@ainexsuite/firebase';
import type { Habit, HabitCompletion, CreateHabitInput } from '@ainexsuite/types';

const HABITS_COLLECTION = 'habits';
const COMPLETIONS_COLLECTION = 'habit_completions';

function getCurrentUserId(): string {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return user.uid;
}

// Habits
export async function createHabit(input: Omit<CreateHabitInput, 'ownerId'>): Promise<string> {
  const userId = getCurrentUserId();
  const habitData = {
    ...input,
    ownerId: userId,
    archived: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, HABITS_COLLECTION), habitData);

  // Log activity
  try {
    await createActivity({
      app: 'track',
      action: 'created',
      itemType: 'habit',
      itemId: docRef.id,
      itemTitle: input.name,
      metadata: { frequency: input.frequency, color: input.color },
    });
  } catch (error) {
  }

  return docRef.id;
}

export async function updateHabit(
  habitId: string,
  updates: Partial<Omit<Habit, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const habitRef = doc(db, HABITS_COLLECTION, habitId);
  await updateDoc(habitRef, { ...updates, updatedAt: serverTimestamp() });

  // Log activity
  try {
    const action = updates.archived !== undefined ? 'archived' : 'updated';
    await createActivity({
      app: 'track',
      action,
      itemType: 'habit',
      itemId: habitId,
      itemTitle: updates.name || 'Habit',
      metadata: { archived: updates.archived },
    });
  } catch (error) {
  }
}

export async function deleteHabit(habitId: string): Promise<void> {
  const habitRef = doc(db, HABITS_COLLECTION, habitId);

  // Get habit details before deleting
  const habitDoc = await getDoc(habitRef);
  const habit = habitDoc.exists() ? habitDoc.data() as Habit : null;

  await deleteDoc(habitRef);

  // Log activity
  if (habit) {
    try {
      await createActivity({
        app: 'track',
        action: 'deleted',
        itemType: 'habit',
        itemId: habitId,
        itemTitle: habit.name,
      });
    } catch (error) {
    }
  }
}

export async function getHabits(): Promise<Habit[]> {
  const userId = getCurrentUserId();
  const q = query(
    collection(db, HABITS_COLLECTION),
    where('ownerId', '==', userId),
    orderBy('createdAt', 'asc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toMillis() || Date.now(),
    updatedAt: doc.data().updatedAt?.toMillis() || Date.now(),
  })) as Habit[];
}

// Completions
export async function createCompletion(habitId: string, date: number): Promise<string> {
  const userId = getCurrentUserId();
  const completionData = {
    habitId,
    ownerId: userId,
    date,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, COMPLETIONS_COLLECTION), completionData);
  return docRef.id;
}

export async function deleteCompletion(completionId: string): Promise<void> {
  const completionRef = doc(db, COMPLETIONS_COLLECTION, completionId);
  await deleteDoc(completionRef);
}

export async function getCompletions(startDate?: Date, endDate?: Date): Promise<HabitCompletion[]> {
  const userId = getCurrentUserId();
  const constraints = [
    where('ownerId', '==', userId),
    orderBy('date', 'desc'),
  ];

  if (startDate) {
    constraints.push(where('date', '>=', startDate.getTime()));
  }
  if (endDate) {
    constraints.push(where('date', '<=', endDate.getTime()));
  }

  const q = query(collection(db, COMPLETIONS_COLLECTION), ...constraints);
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toMillis() || Date.now(),
  })) as HabitCompletion[];
}

export async function getCompletionForDate(habitId: string, date: Date): Promise<HabitCompletion | null> {
  const userId = getCurrentUserId();
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const q = query(
    collection(db, COMPLETIONS_COLLECTION),
    where('ownerId', '==', userId),
    where('habitId', '==', habitId),
    where('date', '>=', dayStart.getTime()),
    where('date', '<=', dayEnd.getTime())
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toMillis() || Date.now(),
  } as HabitCompletion;
}
