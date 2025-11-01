import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@ainexsuite/firebase';
import type {
  PersonalizedPrompt,
  PromptResponse,
  DailyPrompt,
  PromptLibraryEntry,
} from '@ainexsuite/types';

const PROMPT_RESPONSES_COLLECTION = 'prompt_responses';
const DAILY_PROMPTS_COLLECTION = 'daily_prompts';
const PERSONALIZED_PROMPTS_COLLECTION = 'personalized_prompts';
const PROMPT_LIBRARY_COLLECTION = 'prompt_library';

let promptLibraryCache: PromptLibraryEntry[] | null = null;

export async function getPromptLibrary(forceRefresh = false): Promise<PromptLibraryEntry[]> {
  if (promptLibraryCache && !forceRefresh) {
    return promptLibraryCache;
  }

  const snapshot = await getDocs(collection(db, PROMPT_LIBRARY_COLLECTION));
  const prompts = snapshot.docs
    .map((document) => {
      const data = document.data();
      return {
        id: document.id,
        text: data.text ?? '',
        tags: data.tags ?? [],
        tone: data.tone,
        audience: data.audience,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : undefined,
      } as PromptLibraryEntry;
    })
    .filter((entry) => entry.text);

  promptLibraryCache = prompts;
  return prompts;
}

export function clearPromptLibraryCache() {
  promptLibraryCache = null;
}

// Save a personalized prompt
export async function savePersonalizedPrompt(prompt: PersonalizedPrompt): Promise<string> {
  const promptRef = doc(collection(db, PERSONALIZED_PROMPTS_COLLECTION));
  await setDoc(promptRef, {
    ...prompt,
    usedAt: serverTimestamp()
  });
  return promptRef.id;
}

// Save a prompt response
export async function savePromptResponse(response: Omit<PromptResponse, 'respondedAt'>): Promise<string> {
  const responseRef = doc(collection(db, PROMPT_RESPONSES_COLLECTION));
  await setDoc(responseRef, {
    ...response,
    respondedAt: serverTimestamp()
  });
  return responseRef.id;
}

// Update prompt response helpfulness
export async function updatePromptHelpfulness(responseId: string, helpful: boolean): Promise<void> {
  const responseRef = doc(db, PROMPT_RESPONSES_COLLECTION, responseId);
  await updateDoc(responseRef, { helpful });
}

// Get user's prompt responses
export async function getUserPromptResponses(userId: string, limit_count: number = 20): Promise<PromptResponse[]> {
  const q = query(
    collection(db, PROMPT_RESPONSES_COLLECTION),
    where('userId', '==', userId),
    orderBy('respondedAt', 'desc'),
    limit(limit_count)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    respondedAt: doc.data().respondedAt?.toDate() || new Date()
  } as PromptResponse));
}

// Get prompt responses by category
export async function getPromptResponsesByCategory(userId: string, category: string): Promise<PromptResponse[]> {
  // This requires joining with prompts data, so we'll need to fetch prompts first
  // For now, return empty array - this would be implemented with proper indexing
  return [];
}

// Save daily prompt
export async function saveDailyPrompt(dailyPrompt: Omit<DailyPrompt, 'id'>): Promise<string> {
  const promptRef = doc(collection(db, DAILY_PROMPTS_COLLECTION));
  await setDoc(promptRef, {
    ...dailyPrompt,
    delivered: false,
    opened: false,
    completed: false
  });
  return promptRef.id;
}

// Get today's prompt for user
export async function getTodaysPrompt(userId: string): Promise<DailyPrompt | null> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const q = query(
    collection(db, DAILY_PROMPTS_COLLECTION),
    where('userId', '==', userId),
    where('scheduledFor', '>=', Timestamp.fromDate(today)),
    where('scheduledFor', '<', Timestamp.fromDate(tomorrow)),
    limit(1)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
    scheduledFor: doc.data().scheduledFor?.toDate(),
    deliveredAt: doc.data().deliveredAt?.toDate(),
    openedAt: doc.data().openedAt?.toDate(),
    completedAt: doc.data().completedAt?.toDate()
  } as DailyPrompt;
}

// Mark daily prompt as delivered
export async function markPromptAsDelivered(promptId: string): Promise<void> {
  const promptRef = doc(db, DAILY_PROMPTS_COLLECTION, promptId);
  await updateDoc(promptRef, {
    delivered: true,
    deliveredAt: serverTimestamp()
  });
}

// Mark daily prompt as opened
export async function markPromptAsOpened(promptId: string): Promise<void> {
  const promptRef = doc(db, DAILY_PROMPTS_COLLECTION, promptId);
  await updateDoc(promptRef, {
    opened: true,
    openedAt: serverTimestamp()
  });
}

// Mark daily prompt as completed
export async function markPromptAsCompleted(userId: string, promptId: string): Promise<void> {
  const promptRef = doc(db, DAILY_PROMPTS_COLLECTION, promptId);
  await updateDoc(promptRef, {
    completed: true,
    completedAt: serverTimestamp(),
    userId
  });
}

// Get user's prompt history
export async function getUserPromptHistory(userId: string, days: number = 30): Promise<DailyPrompt[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const q = query(
    collection(db, DAILY_PROMPTS_COLLECTION),
    where('userId', '==', userId),
    where('scheduledFor', '>=', Timestamp.fromDate(startDate)),
    orderBy('scheduledFor', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    scheduledFor: doc.data().scheduledFor?.toDate(),
    deliveredAt: doc.data().deliveredAt?.toDate(),
    openedAt: doc.data().openedAt?.toDate(),
    completedAt: doc.data().completedAt?.toDate()
  } as DailyPrompt));
}

// Calculate prompt completion rate
export async function getPromptCompletionRate(userId: string): Promise<number> {
  const history = await getUserPromptHistory(userId, 30);
  if (history.length === 0) return 0;

  const completed = history.filter(p => p.completed).length;
  return (completed / history.length) * 100;
}
