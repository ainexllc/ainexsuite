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
  Timestamp,
  updateDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '@ainexsuite/firebase';
import { SentimentAnalysis, SentimentInsight, SentimentMetrics } from '@ainexsuite/types';

const SENTIMENT_COLLECTION = 'sentiment_analysis';
const INSIGHTS_COLLECTION = 'sentiment_insights';
const METRICS_COLLECTION = 'sentiment_metrics';

// Convert Date to Timestamp for Firestore
const toFirestoreData = (data: any) => {
  const converted = { ...data };
  if (data.analyzedAt instanceof Date) {
    converted.analyzedAt = Timestamp.fromDate(data.analyzedAt);
  }
  if (data.createdAt instanceof Date) {
    converted.createdAt = Timestamp.fromDate(data.createdAt);
  }
  if (data.lastAnalyzedAt instanceof Date) {
    converted.lastAnalyzedAt = Timestamp.fromDate(data.lastAnalyzedAt);
  }
  return converted;
};

// Convert Timestamp to Date from Firestore
const fromFirestoreData = (data: any) => {
  const converted = { ...data };
  if (data.analyzedAt?.toDate) {
    converted.analyzedAt = data.analyzedAt.toDate();
  }
  if (data.createdAt?.toDate) {
    converted.createdAt = data.createdAt.toDate();
  }
  if (data.lastAnalyzedAt?.toDate) {
    converted.lastAnalyzedAt = data.lastAnalyzedAt.toDate();
  }
  return converted;
};

// Save sentiment analysis for an entry
export async function saveSentimentAnalysis(analysis: SentimentAnalysis): Promise<void> {
  const docRef = doc(db, SENTIMENT_COLLECTION, analysis.entryId);
  await setDoc(docRef, toFirestoreData(analysis));
}

// Get sentiment analysis for an entry
export async function getSentimentAnalysis(entryId: string): Promise<SentimentAnalysis | null> {
  const docRef = doc(db, SENTIMENT_COLLECTION, entryId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return fromFirestoreData({ id: docSnap.id, ...docSnap.data() }) as SentimentAnalysis;
  }
  return null;
}

// Get sentiment analyses for a user
export async function getUserSentimentAnalyses(userId: string, limitCount = 100): Promise<SentimentAnalysis[]> {
  const q = query(
    collection(db, SENTIMENT_COLLECTION),
    where('userId', '==', userId),
    orderBy('analyzedAt', 'desc'),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc =>
    fromFirestoreData({ id: doc.id, ...doc.data() }) as SentimentAnalysis
  );
}

// Save sentiment insight
export async function saveSentimentInsight(insight: SentimentInsight): Promise<void> {
  const docRef = doc(collection(db, INSIGHTS_COLLECTION));
  await setDoc(docRef, toFirestoreData(insight));
}

// Get user insights
export async function getUserInsights(userId: string, unreadOnly = false): Promise<SentimentInsight[]> {
  let q = query(
    collection(db, INSIGHTS_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  if (unreadOnly) {
    q = query(
      collection(db, INSIGHTS_COLLECTION),
      where('userId', '==', userId),
      where('read', '==', false),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc =>
    fromFirestoreData({ id: doc.id, ...doc.data() }) as SentimentInsight
  );
}

// Mark insight as read
export async function markInsightAsRead(insightId: string): Promise<void> {
  const docRef = doc(db, INSIGHTS_COLLECTION, insightId);
  await updateDoc(docRef, { read: true });
}

// Save or update user metrics
export async function saveUserMetrics(metrics: SentimentMetrics): Promise<void> {
  const docRef = doc(db, METRICS_COLLECTION, metrics.userId);
  await setDoc(docRef, toFirestoreData(metrics));
}

// Get user metrics
export async function getUserMetrics(userId: string): Promise<SentimentMetrics | null> {
  const docRef = doc(db, METRICS_COLLECTION, userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return fromFirestoreData(docSnap.data()) as SentimentMetrics;
  }
  return null;
}

// Batch save sentiment analyses
export async function batchSaveSentimentAnalyses(analyses: SentimentAnalysis[]): Promise<void> {
  const batch = writeBatch(db);

  analyses.forEach(analysis => {
    const docRef = doc(db, SENTIMENT_COLLECTION, analysis.entryId);
    batch.set(docRef, toFirestoreData(analysis));
  });

  await batch.commit();
}

// Get sentiment analyses by date range
export async function getSentimentAnalysesByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<SentimentAnalysis[]> {
  const q = query(
    collection(db, SENTIMENT_COLLECTION),
    where('userId', '==', userId),
    where('analyzedAt', '>=', Timestamp.fromDate(startDate)),
    where('analyzedAt', '<=', Timestamp.fromDate(endDate)),
    orderBy('analyzedAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc =>
    fromFirestoreData({ id: doc.id, ...doc.data() }) as SentimentAnalysis
  );
}
