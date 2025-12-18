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
} from 'firebase/firestore';
import type {
  LearningGoal,
  CreateLearningGoalInput,
  UpdateLearningGoalInput,
  LearningSession,
  CreateLearningSessionInput,
  SkillProgress,
} from '@ainexsuite/types';
import { getCurrentUserId } from './utils';

const GOALS_COLLECTION = 'learning_goals';
const SESSIONS_COLLECTION = 'learning_sessions';

export async function getLearningGoals(): Promise<LearningGoal[]> {
  const userId = getCurrentUserId();
  const q = query(
    collection(db, GOALS_COLLECTION),
    where('ownerId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as LearningGoal));
}

export async function createLearningGoal(
  input: CreateLearningGoalInput
): Promise<string> {
  const userId = getCurrentUserId();
  const goalData = {
    ...input,
    ownerId: userId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const docRef = await addDoc(collection(db, GOALS_COLLECTION), goalData);

  // Log activity
  try {
    await createActivity({
      app: 'habits',
      action: 'created',
      itemType: 'goal',
      itemId: docRef.id,
      itemTitle: input.title,
      metadata: {
        currentLevel: input.currentLevel,
        targetLevel: input.targetLevel,
      },
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }

  return docRef.id;
}

export async function updateLearningGoal(
  id: string,
  updates: UpdateLearningGoalInput
): Promise<void> {
  const docRef = doc(db, GOALS_COLLECTION, id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Date.now(),
  });

  // Log activity
  try {
    await createActivity({
      app: 'habits',
      action: 'updated',
      itemType: 'goal',
      itemId: id,
      itemTitle: updates.title || 'Learning Goal',
      metadata: {
        ...(updates.currentLevel !== undefined && { currentLevel: updates.currentLevel }),
        ...(updates.targetLevel !== undefined && { targetLevel: updates.targetLevel }),
      },
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

export async function deleteLearningGoal(id: string): Promise<void> {
  const docRef = doc(db, GOALS_COLLECTION, id);

  // Get goal details before deleting
  const goalDoc = await getDoc(docRef);
  const goal = goalDoc.exists() ? goalDoc.data() as LearningGoal : null;

  await deleteDoc(docRef);

  // Log activity
  if (goal) {
    try {
      await createActivity({
        app: 'habits',
        action: 'deleted',
        itemType: 'goal',
        itemId: id,
        itemTitle: goal.title,
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }
}

export async function getLearningSessions(): Promise<LearningSession[]> {
  const userId = getCurrentUserId();
  const q = query(
    collection(db, SESSIONS_COLLECTION),
    where('ownerId', '==', userId),
    orderBy('date', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as LearningSession));
}

export async function createLearningSession(
  input: CreateLearningSessionInput
): Promise<string> {
  const userId = getCurrentUserId();
  const sessionData = {
    ...input,
    ownerId: userId,
    date: Date.now(),
  };

  const docRef = await addDoc(collection(db, SESSIONS_COLLECTION), sessionData);
  return docRef.id;
}

export async function getSkills(): Promise<SkillProgress[]> {
  const sessions = await getLearningSessions();
  const skillMap = new Map<string, SkillProgress>();

  sessions.forEach((session) => {
    session.skillsPracticed.forEach((skill) => {
      const existing = skillMap.get(skill);
      if (existing) {
        existing.totalSessions += 1;
        existing.totalMinutes += session.duration;
        if (session.date > existing.lastPracticed) {
          existing.lastPracticed = session.date;
        }
      } else {
        skillMap.set(skill, {
          skill,
          level: 0, // Calculate based on time invested
          totalSessions: 1,
          totalMinutes: session.duration,
          lastPracticed: session.date,
        });
      }
    });
  });

  // Calculate skill levels based on total minutes
  // Basic formula: 1 hour = 5 points, max 100
  const skills = Array.from(skillMap.values()).map((s) => ({
    ...s,
    level: Math.min(100, Math.floor((s.totalMinutes / 60) * 5)),
  }));

  return skills.sort((a, b) => b.totalMinutes - a.totalMinutes);
}
