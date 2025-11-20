/**
 * Rate Limiter
 * In-memory rate limiting for AI queries
 * Prevents abuse and ensures fair usage
 */

import type { AITier } from '@ainexsuite/types';
import { RateLimitError } from '@ainexsuite/types';
import { getUsageLimits } from './utils';

/**
 * User request tracking
 */
interface UserRateLimit {
  requests: number[];
  lastCleanup: number;
}

/**
 * In-memory rate limit store
 * Maps userId to their request timestamps
 */
const rateLimitStore = new Map<string, UserRateLimit>();

/**
 * Cleanup interval (every 5 minutes)
 */
const CLEANUP_INTERVAL = 5 * 60 * 1000;

/**
 * Last global cleanup timestamp
 */
let lastGlobalCleanup = Date.now();

/**
 * Remove expired entries from rate limit store
 * Runs periodically to prevent memory bloat
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;

  for (const [userId, data] of rateLimitStore.entries()) {
    // Remove requests older than 1 hour
    data.requests = data.requests.filter((timestamp) => timestamp > oneHourAgo);

    // Remove user entry if no recent requests
    if (data.requests.length === 0) {
      rateLimitStore.delete(userId);
    } else {
      data.lastCleanup = now;
    }
  }

  lastGlobalCleanup = now;
}

/**
 * Check if cleanup is needed
 */
function maybeCleanup(): void {
  const now = Date.now();

  if (now - lastGlobalCleanup > CLEANUP_INTERVAL) {
    cleanupExpiredEntries();
  }
}

/**
 * Get user's rate limit data
 * Creates new entry if doesn't exist
 */
function getUserRateLimit(userId: string): UserRateLimit {
  let userLimit = rateLimitStore.get(userId);

  if (!userLimit) {
    userLimit = {
      requests: [],
      lastCleanup: Date.now(),
    };
    rateLimitStore.set(userId, userLimit);
  }

  return userLimit;
}

/**
 * Clean up old requests for a specific user
 */
function cleanupUserRequests(userLimit: UserRateLimit): void {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;

  userLimit.requests = userLimit.requests.filter(
    (timestamp) => timestamp > oneHourAgo
  );
  userLimit.lastCleanup = now;
}

/**
 * Check rate limit for a user
 *
 * @param userId - User ID to check
 * @param tier - User's subscription tier
 * @returns True if within rate limit, false if exceeded
 * @throws RateLimitError if rate limit exceeded
 */
export function checkRateLimit(userId: string, tier: AITier): boolean {
  // Periodic cleanup
  maybeCleanup();

  const limits = getUsageLimits(tier);
  const userLimit = getUserRateLimit(userId);

  // Clean up old requests for this user
  cleanupUserRequests(userLimit);

  // Check if user has exceeded hourly limit
  if (userLimit.requests.length >= limits.queriesPerHour) {
    const oldestRequest = userLimit.requests[0];
    const now = Date.now();
    const timeSinceOldest = now - oldestRequest;
    const secondsUntilReset = Math.ceil((60 * 60 * 1000 - timeSinceOldest) / 1000);

    throw new RateLimitError(
      `Rate limit exceeded. You can make ${limits.queriesPerHour} requests per hour on the ${tier} tier. Try again in ${secondsUntilReset} seconds.`,
      secondsUntilReset,
      0
    );
  }

  // Record this request
  userLimit.requests.push(Date.now());

  return true;
}

/**
 * Get current rate limit status for a user
 *
 * @param userId - User ID to check
 * @param tier - User's subscription tier
 * @returns Rate limit status
 */
export function getRateLimitStatus(userId: string, tier: AITier) {
  const limits = getUsageLimits(tier);
  const userLimit = getUserRateLimit(userId);

  // Clean up old requests
  cleanupUserRequests(userLimit);

  const used = userLimit.requests.length;
  const remaining = Math.max(0, limits.queriesPerHour - used);
  const resetAt = userLimit.requests[0]
    ? new Date(userLimit.requests[0] + 60 * 60 * 1000)
    : new Date(Date.now() + 60 * 60 * 1000);

  return {
    limit: limits.queriesPerHour,
    used,
    remaining,
    resetAt: resetAt.toISOString(),
  };
}

/**
 * Reset rate limit for a user (admin function)
 *
 * @param userId - User ID to reset
 */
export function resetRateLimit(userId: string): void {
  rateLimitStore.delete(userId);
}

/**
 * Clear all rate limits (admin function)
 * Useful for testing or system maintenance
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear();
  lastGlobalCleanup = Date.now();
}

/**
 * Get rate limit statistics (admin function)
 *
 * @returns Rate limit statistics
 */
export function getRateLimitStats() {
  return {
    totalUsers: rateLimitStore.size,
    totalRequests: Array.from(rateLimitStore.values()).reduce(
      (sum, data) => sum + data.requests.length,
      0
    ),
    lastCleanup: new Date(lastGlobalCleanup).toISOString(),
  };
}

/**
 * Pre-check rate limit without recording a request
 * Useful for checking limits before expensive operations
 *
 * @param userId - User ID to check
 * @param tier - User's subscription tier
 * @returns True if request would be allowed
 */
export function canMakeRequest(userId: string, tier: AITier): boolean {
  const limits = getUsageLimits(tier);
  const userLimit = getUserRateLimit(userId);

  // Clean up old requests
  cleanupUserRequests(userLimit);

  return userLimit.requests.length < limits.queriesPerHour;
}
