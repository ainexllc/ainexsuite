/**
 * Health Metrics Firestore Operations
 * CRUD operations for health metrics data
 */

import { db } from '@ainexsuite/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';
import type { HealthMetric, CreateHealthMetricInput, UpdateHealthMetricInput } from '@ainexsuite/types';

const COLLECTION = 'health_metrics';

/**
 * Get all health metrics for a user
 */
export async function getHealthMetrics(
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<HealthMetric[]> {
  const metricsRef = collection(db, COLLECTION);

  const q = query(
    metricsRef,
    where('ownerId', '==', userId),
    orderBy('date', 'desc')
  );

  const snapshot = await getDocs(q);
  const metrics = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as HealthMetric[];

  // Client-side date filtering if needed
  if (startDate || endDate) {
    return metrics.filter((m) => {
      const date = new Date(m.date);
      if (startDate && date < startDate) return false;
      if (endDate && date > endDate) return false;
      return true;
    });
  }

  return metrics;
}

/**
 * Get health metric for a specific date
 */
export async function getHealthMetricByDate(userId: string, date: string): Promise<HealthMetric | null> {
  const metricsRef = collection(db, COLLECTION);

  const q = query(
    metricsRef,
    where('ownerId', '==', userId),
    where('date', '==', date)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  } as HealthMetric;
}

/**
 * Create a new health metric entry
 */
export async function createHealthMetric(
  userId: string,
  data: Omit<CreateHealthMetricInput, 'ownerId'>
): Promise<HealthMetric> {
  const now = Timestamp.now();

  const metricData = {
    ...data,
    ownerId: userId,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(collection(db, COLLECTION), metricData);

  return {
    id: docRef.id,
    ...metricData,
    createdAt: now.toMillis(),
    updatedAt: now.toMillis(),
  } as HealthMetric;
}

/**
 * Update an existing health metric
 */
export async function updateHealthMetric(
  id: string,
  data: UpdateHealthMetricInput
): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Delete a health metric
 */
export async function deleteHealthMetric(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  await deleteDoc(docRef);
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Calculate trends for a specific metric over time
 */
export function calculateTrend(
  metrics: HealthMetric[],
  metricKey: keyof HealthMetric
): { average: number; trend: 'up' | 'down' | 'stable'; change: number } {
  const values = metrics
    .map((m) => m[metricKey])
    .filter((v): v is number => typeof v === 'number');

  if (values.length === 0) {
    return { average: 0, trend: 'stable', change: 0 };
  }

  const average = values.reduce((a, b) => a + b, 0) / values.length;

  if (values.length < 2) {
    return { average, trend: 'stable', change: 0 };
  }

  // Compare recent vs older values
  const midpoint = Math.floor(values.length / 2);
  const recentAvg = values.slice(0, midpoint).reduce((a, b) => a + b, 0) / midpoint;
  const olderAvg = values.slice(midpoint).reduce((a, b) => a + b, 0) / (values.length - midpoint);

  const change = olderAvg !== 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;
  const trend = change > 5 ? 'up' : change < -5 ? 'down' : 'stable';

  return { average, trend, change };
}
