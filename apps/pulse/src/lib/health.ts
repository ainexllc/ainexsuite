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
import type {
  HealthMetric,
  CreateHealthMetricInput,
  UpdateHealthMetricInput,
} from '@ainexsuite/types';
import { getCurrentUserId } from './utils';

const METRICS_COLLECTION = 'health_metrics';

export async function getHealthMetrics(days: number = 30): Promise<HealthMetric[]> {
  const userId = getCurrentUserId();
  const q = query(
    collection(db, METRICS_COLLECTION),
    where('ownerId', '==', userId),
    orderBy('date', 'desc'),
    limit(days)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as HealthMetric));
}

export async function createHealthMetric(
  input: CreateHealthMetricInput
): Promise<string> {
  const userId = getCurrentUserId();
  const metricData = {
    ...input,
    ownerId: userId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const docRef = await addDoc(collection(db, METRICS_COLLECTION), metricData);

  // Log activity
  try {
    const dateStr = new Date(input.date).toLocaleDateString();
    await createActivity({
      app: 'pulse',
      action: 'created',
      itemType: 'metric',
      itemId: docRef.id,
      itemTitle: `Health Metric - ${dateStr}`,
      metadata: { metricType: input.metricType },
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }

  return docRef.id;
}

export async function updateHealthMetric(
  id: string,
  updates: UpdateHealthMetricInput
): Promise<void> {
  const docRef = doc(db, METRICS_COLLECTION, id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Date.now(),
  });

  // Log activity
  try {
    const dateStr = updates.date ? new Date(updates.date).toLocaleDateString() : 'Health Metric';
    await createActivity({
      app: 'pulse',
      action: 'updated',
      itemType: 'metric',
      itemId: id,
      itemTitle: `Health Metric - ${dateStr}`,
      metadata: { metricType: updates.metricType },
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

export async function deleteHealthMetric(id: string): Promise<void> {
  const docRef = doc(db, METRICS_COLLECTION, id);

  // Get metric details before deleting
  const metricDoc = await getDoc(docRef);
  const metric = metricDoc.exists() ? metricDoc.data() as HealthMetric : null;

  await deleteDoc(docRef);

  // Log activity
  if (metric) {
    try {
      const dateStr = new Date(metric.date).toLocaleDateString();
      await createActivity({
        app: 'pulse',
        action: 'deleted',
        itemType: 'metric',
        itemId: id,
        itemTitle: `Health Metric - ${dateStr}`,
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }
}
