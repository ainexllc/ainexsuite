import {
  collection,
  doc,
  setDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '@ainexsuite/firebase';
import { FitSpace, Workout, Challenge } from '../types/models';

// --- Spaces ---

export async function createFitSpaceInDb(space: FitSpace) {
  const spaceRef = doc(collection(db, 'fit_spaces'), space.id);
  await setDoc(spaceRef, space);
}

export function subscribeToUserFitSpaces(userId: string, callback: (spaces: FitSpace[]) => void) {
  const q = query(
    collection(db, 'fit_spaces'), 
    where('memberUids', 'array-contains', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const spaces = snapshot.docs.map(doc => doc.data() as FitSpace);
    callback(spaces);
  });
}

// --- Workouts ---

export async function createWorkoutInDb(workout: Workout) {
  const workoutRef = doc(collection(db, 'workouts'), workout.id);
  await setDoc(workoutRef, workout);
}

export function subscribeToSpaceWorkouts(spaceId: string, callback: (workouts: Workout[]) => void) {
  const q = query(
    collection(db, 'workouts'),
    where('spaceId', '==', spaceId),
    orderBy('date', 'desc'),
    limit(50)
  );

  return onSnapshot(q, (snapshot) => {
    const workouts = snapshot.docs.map(doc => doc.data() as Workout);
    callback(workouts);
  });
}

// --- Challenges ---

export async function createChallengeInDb(challenge: Challenge) {
  const challengeRef = doc(collection(db, 'challenges'), challenge.id);
  await setDoc(challengeRef, challenge);
}

export function subscribeToSpaceChallenges(spaceId: string, callback: (challenges: Challenge[]) => void) {
  const q = query(
    collection(db, 'challenges'),
    where('spaceId', '==', spaceId)
  );

  return onSnapshot(q, (snapshot) => {
    const challenges = snapshot.docs.map(doc => doc.data() as Challenge);
    callback(challenges);
  });
}
