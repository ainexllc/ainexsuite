import { db, createActivity } from '@ainexsuite/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  getDoc,
  orderBy,
  limit,
} from 'firebase/firestore';
import type { Workout, CreateWorkoutInput, UpdateWorkoutInput } from '@ainexsuite/types';
import { getCurrentUserId } from './utils';

const WORKOUTS_COLLECTION = 'workouts';

export async function getWorkouts(limitCount: number = 30): Promise<Workout[]> {
  const userId = getCurrentUserId();
  const q = query(
    collection(db, WORKOUTS_COLLECTION),
    where('ownerId', '==', userId),
    orderBy('date', 'desc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Workout));
}

export async function createWorkout(input: CreateWorkoutInput): Promise<string> {
  const userId = getCurrentUserId();
  const workoutData = {
    ...input,
    ownerId: userId,
    createdAt: Date.now(),
  };

  const docRef = await addDoc(collection(db, WORKOUTS_COLLECTION), workoutData);

  // Log activity
  try {
    await createActivity({
      app: 'fit',
      action: 'created',
      itemType: 'workout',
      itemId: docRef.id,
      itemTitle: input.name,
      metadata: { duration: input.duration, exerciseCount: input.exercises.length },
    });
  } catch (error) {
  }

  return docRef.id;
}

export async function updateWorkout(
  id: string,
  updates: UpdateWorkoutInput
): Promise<void> {
  const docRef = doc(db, WORKOUTS_COLLECTION, id);
  await updateDoc(docRef, updates);

  // Log activity
  try {
    await createActivity({
      app: 'fit',
      action: 'updated',
      itemType: 'workout',
      itemId: id,
      itemTitle: updates.name || 'Workout',
      metadata: { duration: updates.duration },
    });
  } catch (error) {
  }
}

export async function deleteWorkout(id: string): Promise<void> {
  const docRef = doc(db, WORKOUTS_COLLECTION, id);

  // Get workout details before deleting
  const workoutDoc = await getDoc(docRef);
  const workout = workoutDoc.exists() ? workoutDoc.data() as Workout : null;

  await deleteDoc(docRef);

  // Log activity
  if (workout) {
    try {
      await createActivity({
        app: 'fit',
        action: 'deleted',
        itemType: 'workout',
        itemId: id,
        itemTitle: workout.name,
      });
    } catch (error) {
    }
  }
}
