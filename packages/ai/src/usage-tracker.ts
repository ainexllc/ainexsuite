/**
 * Usage Tracker
 * Tracks AI usage with Firestore for persistence
 * Uses atomic operations to prevent race conditions
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  type Firestore,
} from 'firebase/firestore';
import type { AITier, AIUsageRecord, AIUsageCheck } from '@ainexsuite/types';
import { UsageLimitError } from '@ainexsuite/types';
import {
  getUsageLimits,
  calculateRemaining,
  formatISODate,
  formatISOMonth,
  needsDailyReset,
  needsMonthlyReset,
  getNextDailyReset,
  getNextMonthlyReset,
} from './utils';

/**
 * Firestore collection name for AI usage tracking
 */
const USAGE_COLLECTION = 'ai_usage';

/**
 * Initialize usage record for a new user
 *
 * @param db - Firestore instance
 * @param userId - User ID
 * @param tier - Subscription tier
 * @returns Initialized usage record
 */
async function initializeUsageRecord(
  db: Firestore,
  userId: string,
  tier: AITier
): Promise<AIUsageRecord> {
  const now = Date.now();
  const today = formatISODate();
  const currentMonth = formatISOMonth();

  const record: AIUsageRecord = {
    userId,
    tier,
    dailyUsage: 0,
    monthlyUsage: 0,
    lastResetDaily: today,
    lastResetMonthly: currentMonth,
    updatedAt: now,
  };

  const docRef = doc(db, USAGE_COLLECTION, userId);
  await setDoc(docRef, record);

  return record;
}

/**
 * Get usage record from Firestore
 *
 * @param db - Firestore instance
 * @param userId - User ID
 * @param tier - Subscription tier
 * @returns Usage record
 */
async function getUsageRecord(
  db: Firestore,
  userId: string,
  tier: AITier
): Promise<AIUsageRecord> {
  const docRef = doc(db, USAGE_COLLECTION, userId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return initializeUsageRecord(db, userId, tier);
  }

  return docSnap.data() as AIUsageRecord;
}

/**
 * Reset usage counters if needed
 *
 * @param db - Firestore instance
 * @param userId - User ID
 * @param record - Current usage record
 * @returns Updated record (or null if no reset needed)
 */
async function maybeResetUsage(
  db: Firestore,
  userId: string,
  record: AIUsageRecord
): Promise<AIUsageRecord | null> {
  const dailyReset = needsDailyReset(record.lastResetDaily);
  const monthlyReset = needsMonthlyReset(record.lastResetMonthly);

  if (!dailyReset && !monthlyReset) {
    return null;
  }

  const updates: Partial<AIUsageRecord> = {
    updatedAt: Date.now(),
  };

  if (dailyReset) {
    updates.dailyUsage = 0;
    updates.lastResetDaily = formatISODate();
  }

  if (monthlyReset) {
    updates.monthlyUsage = 0;
    updates.lastResetMonthly = formatISOMonth();
  }

  const docRef = doc(db, USAGE_COLLECTION, userId);
  await updateDoc(docRef, updates);

  return { ...record, ...updates };
}

/**
 * Check usage limit for a user
 * Returns remaining queries and throws error if limit exceeded
 *
 * @param db - Firestore instance
 * @param userId - User ID
 * @param tier - Subscription tier
 * @returns Usage check result with remaining queries
 * @throws UsageLimitError if daily or monthly limit exceeded
 */
export async function checkUsageLimit(
  db: Firestore,
  userId: string,
  tier: AITier
): Promise<AIUsageCheck> {
  const limits = getUsageLimits(tier);

  // Get current usage record
  let record = await getUsageRecord(db, userId, tier);

  // Reset if needed
  const resetRecord = await maybeResetUsage(db, userId, record);
  if (resetRecord) {
    record = resetRecord;
  }

  // Check daily limit
  const dailyRemaining = calculateRemaining(record.dailyUsage, limits.dailyQueries);
  if (dailyRemaining <= 0) {
    throw new UsageLimitError(
      `Daily limit of ${limits.dailyQueries} queries reached for ${tier} tier. Resets at midnight.`,
      'daily',
      getNextDailyReset()
    );
  }

  // Check monthly limit
  const monthlyRemaining = calculateRemaining(
    record.monthlyUsage,
    limits.monthlyQueries
  );
  if (monthlyRemaining <= 0) {
    throw new UsageLimitError(
      `Monthly limit of ${limits.monthlyQueries} queries reached for ${tier} tier. Resets on the 1st of next month.`,
      'monthly',
      getNextMonthlyReset()
    );
  }

  return {
    allowed: true,
    remaining: Math.min(dailyRemaining, monthlyRemaining),
    dailyRemaining,
    monthlyRemaining,
    resetDaily: getNextDailyReset(),
    resetMonthly: getNextMonthlyReset(),
  };
}

/**
 * Increment usage counters atomically
 * Uses Firestore FieldValue.increment() to prevent race conditions
 *
 * @param db - Firestore instance
 * @param userId - User ID
 * @param tier - Subscription tier
 * @returns Updated usage check result
 */
export async function incrementUsage(
  db: Firestore,
  userId: string,
  tier: AITier
): Promise<AIUsageCheck> {
  // First check if usage is allowed
  await checkUsageLimit(db, userId, tier);

  // Atomically increment both counters
  const docRef = doc(db, USAGE_COLLECTION, userId);
  await updateDoc(docRef, {
    dailyUsage: increment(1),
    monthlyUsage: increment(1),
    updatedAt: Date.now(),
  });

  // Return updated limits
  return checkUsageLimit(db, userId, tier);
}

/**
 * Get current usage status without incrementing
 *
 * @param db - Firestore instance
 * @param userId - User ID
 * @param tier - Subscription tier
 * @returns Current usage status
 */
export async function getUsageStatus(
  db: Firestore,
  userId: string,
  tier: AITier
): Promise<AIUsageCheck> {
  const limits = getUsageLimits(tier);

  // Get current usage record
  let record = await getUsageRecord(db, userId, tier);

  // Reset if needed
  const resetRecord = await maybeResetUsage(db, userId, record);
  if (resetRecord) {
    record = resetRecord;
  }

  const dailyRemaining = calculateRemaining(record.dailyUsage, limits.dailyQueries);
  const monthlyRemaining = calculateRemaining(
    record.monthlyUsage,
    limits.monthlyQueries
  );

  return {
    allowed: dailyRemaining > 0 && monthlyRemaining > 0,
    remaining: Math.min(dailyRemaining, monthlyRemaining),
    dailyRemaining,
    monthlyRemaining,
    resetDaily: getNextDailyReset(),
    resetMonthly: getNextMonthlyReset(),
  };
}

/**
 * Reset usage for a user (admin function)
 *
 * @param db - Firestore instance
 * @param userId - User ID
 * @param tier - Subscription tier
 * @param resetType - Type of reset ('daily', 'monthly', or 'both')
 */
export async function resetUsage(
  db: Firestore,
  userId: string,
  tier: AITier,
  resetType: 'daily' | 'monthly' | 'both' = 'both'
): Promise<void> {
  const docRef = doc(db, USAGE_COLLECTION, userId);
  const updates: Partial<AIUsageRecord> = {
    updatedAt: Date.now(),
  };

  if (resetType === 'daily' || resetType === 'both') {
    updates.dailyUsage = 0;
    updates.lastResetDaily = formatISODate();
  }

  if (resetType === 'monthly' || resetType === 'both') {
    updates.monthlyUsage = 0;
    updates.lastResetMonthly = formatISOMonth();
  }

  await updateDoc(docRef, updates);
}

/**
 * Update user's tier (when subscription changes)
 *
 * @param db - Firestore instance
 * @param userId - User ID
 * @param newTier - New subscription tier
 */
export async function updateUserTier(
  db: Firestore,
  userId: string,
  newTier: AITier
): Promise<void> {
  const docRef = doc(db, USAGE_COLLECTION, userId);
  await updateDoc(docRef, {
    tier: newTier,
    updatedAt: Date.now(),
  });
}

/**
 * Get usage statistics for admin dashboard
 *
 * @param db - Firestore instance
 * @param userId - User ID
 * @returns Detailed usage statistics
 */
export async function getUsageStats(db: Firestore, userId: string) {
  const docRef = doc(db, USAGE_COLLECTION, userId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  const record = docSnap.data() as AIUsageRecord;
  const limits = getUsageLimits(record.tier);

  return {
    tier: record.tier,
    daily: {
      used: record.dailyUsage,
      limit: limits.dailyQueries,
      remaining: calculateRemaining(record.dailyUsage, limits.dailyQueries),
      resetAt: getNextDailyReset(),
    },
    monthly: {
      used: record.monthlyUsage,
      limit: limits.monthlyQueries,
      remaining: calculateRemaining(record.monthlyUsage, limits.monthlyQueries),
      resetAt: getNextMonthlyReset(),
    },
    lastUpdated: new Date(record.updatedAt).toISOString(),
  };
}
