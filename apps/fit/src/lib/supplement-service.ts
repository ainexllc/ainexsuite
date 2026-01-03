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
  limit,
  onSnapshot,
} from 'firebase/firestore';
import { db, auth } from '@ainexsuite/firebase';
import type {
  Supplement,
  CreateSupplementInput,
  UpdateSupplementInput,
  SupplementLog,
  CreateSupplementLogInput,
  SupplementTime,
} from '@ainexsuite/types';

const SUPPLEMENTS_COLLECTION = 'supplements';
const SUPPLEMENT_LOGS_COLLECTION = 'supplement_logs';

function getCurrentUserId(): string | null {
  return auth.currentUser?.uid || null;
}

function getNowISOString(): string {
  return new Date().toISOString();
}

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

// ============================================================================
// SUPPLEMENTS CRUD
// ============================================================================

/**
 * Subscribe to user's supplements in real-time
 */
export function subscribeToSupplements(
  userId: string,
  callback: (supplements: Supplement[]) => void
): () => void {
  const q = query(
    collection(db, SUPPLEMENTS_COLLECTION),
    where('ownerId', '==', userId),
    orderBy('name', 'asc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const supplements = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Supplement[];
      callback(supplements);
    },
    (error) => {
      console.error('Error subscribing to supplements:', error);
      callback([]);
    }
  );
}

/**
 * Get all supplements for the current user
 */
export async function getSupplements(): Promise<Supplement[]> {
  const userId = getCurrentUserId();
  if (!userId) return [];

  try {
    const q = query(
      collection(db, SUPPLEMENTS_COLLECTION),
      where('ownerId', '==', userId),
      orderBy('name', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Supplement[];
  } catch (error) {
    console.error('Error fetching supplements:', error);
    return [];
  }
}

/**
 * Get active supplements (for daily tracking)
 */
export async function getActiveSupplements(): Promise<Supplement[]> {
  const userId = getCurrentUserId();
  if (!userId) return [];

  try {
    const q = query(
      collection(db, SUPPLEMENTS_COLLECTION),
      where('ownerId', '==', userId),
      where('isActive', '==', true),
      orderBy('name', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Supplement[];
  } catch (error) {
    console.error('Error fetching active supplements:', error);
    return [];
  }
}

/**
 * Get a single supplement by ID
 */
export async function getSupplementById(supplementId: string): Promise<Supplement | null> {
  const userId = getCurrentUserId();
  if (!userId) return null;

  try {
    const docRef = doc(db, SUPPLEMENTS_COLLECTION, supplementId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    if (data.ownerId !== userId) return null;

    return { id: docSnap.id, ...data } as Supplement;
  } catch (error) {
    console.error('Error fetching supplement:', error);
    return null;
  }
}

/**
 * Create a new supplement
 */
export async function createSupplement(
  data: Omit<CreateSupplementInput, 'ownerId'>
): Promise<Supplement | null> {
  const userId = getCurrentUserId();
  if (!userId) return null;

  try {
    const now = getNowISOString();

    const supplementData = {
      ...data,
      ownerId: userId,
      isActive: data.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, SUPPLEMENTS_COLLECTION), supplementData);

    return { id: docRef.id, ...supplementData } as Supplement;
  } catch (error) {
    console.error('Error creating supplement:', error);
    return null;
  }
}

/**
 * Update a supplement
 */
export async function updateSupplement(
  supplementId: string,
  data: UpdateSupplementInput
): Promise<boolean> {
  const userId = getCurrentUserId();
  if (!userId) return false;

  try {
    const docRef = doc(db, SUPPLEMENTS_COLLECTION, supplementId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return false;
    if (docSnap.data().ownerId !== userId) return false;

    await updateDoc(docRef, {
      ...data,
      updatedAt: getNowISOString(),
    });

    return true;
  } catch (error) {
    console.error('Error updating supplement:', error);
    return false;
  }
}

/**
 * Toggle supplement active status
 */
export async function toggleSupplementActive(supplementId: string): Promise<boolean> {
  const userId = getCurrentUserId();
  if (!userId) return false;

  try {
    const docRef = doc(db, SUPPLEMENTS_COLLECTION, supplementId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return false;
    if (docSnap.data().ownerId !== userId) return false;

    const currentActive = docSnap.data().isActive;
    await updateDoc(docRef, {
      isActive: !currentActive,
      updatedAt: getNowISOString(),
    });

    return true;
  } catch (error) {
    console.error('Error toggling supplement active:', error);
    return false;
  }
}

/**
 * Update supplement inventory
 */
export async function updateInventory(
  supplementId: string,
  inventory: number
): Promise<boolean> {
  return updateSupplement(supplementId, { inventory });
}

/**
 * Delete a supplement
 */
export async function deleteSupplement(supplementId: string): Promise<boolean> {
  const userId = getCurrentUserId();
  if (!userId) return false;

  try {
    const docRef = doc(db, SUPPLEMENTS_COLLECTION, supplementId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return false;
    if (docSnap.data().ownerId !== userId) return false;

    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting supplement:', error);
    return false;
  }
}

// ============================================================================
// SUPPLEMENT LOGS
// ============================================================================

/**
 * Get supplement logs for a specific date
 */
export async function getLogsForDate(date: string): Promise<SupplementLog[]> {
  const userId = getCurrentUserId();
  if (!userId) return [];

  try {
    const q = query(
      collection(db, SUPPLEMENT_LOGS_COLLECTION),
      where('ownerId', '==', userId),
      where('date', '==', date),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as SupplementLog[];
  } catch (error) {
    console.error('Error fetching supplement logs:', error);
    return [];
  }
}

/**
 * Get today's logs
 */
export async function getTodaysLogs(): Promise<SupplementLog[]> {
  return getLogsForDate(getTodayDateString());
}

/**
 * Subscribe to today's logs in real-time
 */
export function subscribeToTodaysLogs(
  userId: string,
  callback: (logs: SupplementLog[]) => void
): () => void {
  const today = getTodayDateString();

  const q = query(
    collection(db, SUPPLEMENT_LOGS_COLLECTION),
    where('ownerId', '==', userId),
    where('date', '==', today),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const logs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SupplementLog[];
      callback(logs);
    },
    (error) => {
      console.error('Error subscribing to supplement logs:', error);
      callback([]);
    }
  );
}

/**
 * Log supplement intake
 */
export async function logSupplement(
  data: Omit<CreateSupplementLogInput, 'ownerId'>
): Promise<SupplementLog | null> {
  const userId = getCurrentUserId();
  if (!userId) return null;

  try {
    const now = getNowISOString();

    const logData = {
      ...data,
      ownerId: userId,
      date: data.date || getTodayDateString(),
      takenAt: data.status === 'taken' ? now : undefined,
      createdAt: now,
    };

    const docRef = await addDoc(collection(db, SUPPLEMENT_LOGS_COLLECTION), logData);

    // If taken, decrement inventory
    if (data.status === 'taken') {
      const supplement = await getSupplementById(data.supplementId);
      if (supplement && supplement.inventory !== undefined && supplement.inventory > 0) {
        await updateInventory(data.supplementId, supplement.inventory - 1);
      }
    }

    return { id: docRef.id, ...logData } as SupplementLog;
  } catch (error) {
    console.error('Error logging supplement:', error);
    return null;
  }
}

/**
 * Check if supplement has been logged for a specific time today
 */
export async function hasLoggedForTime(
  supplementId: string,
  time: SupplementTime
): Promise<boolean> {
  const userId = getCurrentUserId();
  if (!userId) return false;

  try {
    const today = getTodayDateString();

    const q = query(
      collection(db, SUPPLEMENT_LOGS_COLLECTION),
      where('ownerId', '==', userId),
      where('supplementId', '==', supplementId),
      where('date', '==', today),
      where('time', '==', time),
      limit(1)
    );

    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking supplement log:', error);
    return false;
  }
}

/**
 * Delete a supplement log
 */
export async function deleteLog(logId: string): Promise<boolean> {
  const userId = getCurrentUserId();
  if (!userId) return false;

  try {
    const docRef = doc(db, SUPPLEMENT_LOGS_COLLECTION, logId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return false;
    if (docSnap.data().ownerId !== userId) return false;

    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting supplement log:', error);
    return false;
  }
}

// ============================================================================
// SUPPLEMENT HELPERS
// ============================================================================

export const SUPPLEMENT_TIME_LABELS: Record<SupplementTime, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  night: 'Night',
  with_food: 'With Food',
  before_bed: 'Before Bed',
};

export const SUPPLEMENT_TIME_ORDER: SupplementTime[] = [
  'morning',
  'with_food',
  'afternoon',
  'evening',
  'night',
  'before_bed',
];

/**
 * Get supplements that should be taken at a specific time
 */
export function getSupplementsForTime(
  supplements: Supplement[],
  time: SupplementTime
): Supplement[] {
  return supplements.filter(
    (s) => s.isActive && s.schedule.times.includes(time)
  );
}

/**
 * Check if supplement needs refill based on inventory
 */
export function needsRefill(supplement: Supplement): boolean {
  if (supplement.inventory === undefined) return false;
  if (supplement.lowStockThreshold === undefined) return false;
  return supplement.inventory <= supplement.lowStockThreshold;
}

/**
 * Get supplements that need refill
 */
export function getSupplementsNeedingRefill(supplements: Supplement[]): Supplement[] {
  return supplements.filter(needsRefill);
}
