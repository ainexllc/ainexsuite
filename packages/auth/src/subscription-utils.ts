/**
 * Subscription utilities for AinexSuite
 * Handles trial logic, subscription tiers, rate limits, and query limits
 *
 * Note: This extends suite-utils.ts with additional subscription-specific logic
 */

import type { User, SubscriptionTier } from '@ainexsuite/types';
import {
  isTrialActive as suiteIsTrialActive,
  getRemainingTrialDays as suiteGetRemainingTrialDays,
  canAccessApp as suiteCanAccessApp,
  type AppName,
} from './suite-utils';

// Re-export for convenience
export type { AppName } from './suite-utils';

// Constants (duplicated from suite-utils to avoid circular dependency issues)
const TRIAL_DURATION_DAYS = 30;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export { TRIAL_DURATION_DAYS };

// Query limits per tier (monthly)
export const QUERY_LIMITS: Record<SubscriptionTier, number> = {
  trial: 200,
  'single-app': 200,
  'three-apps': 500,
  pro: 2000,
  premium: 10000,
} as const;

// Rate limits per tier (requests per hour)
export const RATE_LIMITS: Record<SubscriptionTier, number> = {
  trial: 10,
  'single-app': 10,
  'three-apps': 20,
  pro: 50,
  premium: 200,
} as const;

// App limits per tier
export const APP_LIMITS: Record<SubscriptionTier, number> = {
  trial: 8,           // All apps during trial
  'single-app': 1,    // 1 app of user's choice
  'three-apps': 3,    // 3 apps of user's choice
  pro: 8,             // All apps
  premium: 8,         // All apps
} as const;

/**
 * Check if user's trial is still active
 * Re-export from suite-utils for convenience
 */
export const isTrialActive = suiteIsTrialActive;

/**
 * Check if user can access a specific app
 * Enhanced version that returns boolean instead of object
 */
export function canAccessApp(user: User, appName: AppName): boolean {
  const result = suiteCanAccessApp(user, appName);
  return result.allowed;
}

/**
 * Check if user has access to a specific app based on their subscription
 * For single-app and three-app tiers, checks the subscribedApps array
 * For trial, pro, and premium tiers, allows all apps
 */
export function canAccessSubscribedApp(user: User, appName: string): boolean {
  const tier = getUserTier(user);

  // Trial users can access all apps
  if (tier === 'trial') {
    return true;
  }

  // Pro and Premium users can access all apps
  if (tier === 'pro' || tier === 'premium') {
    return true;
  }

  // For single-app and three-app tiers, check subscribedApps array
  if (user.subscribedApps && Array.isArray(user.subscribedApps)) {
    return user.subscribedApps.includes(appName);
  }

  // Default to no access if subscribedApps not defined
  return false;
}

/**
 * Get the app limit for the user's current subscription tier
 */
export function getAppLimit(user: User): number {
  const tier = getUserTier(user);
  return APP_LIMITS[tier];
}

/**
 * Check if user can select more apps (for upgrading single-app/three-app subscriptions)
 */
export function canSelectMoreApps(user: User): boolean {
  const tier = getUserTier(user);
  const currentAppCount = user.subscribedApps?.length || 0;
  const limit = APP_LIMITS[tier];

  return currentAppCount < limit;
}

/**
 * Check if user should be blocked from logging in
 * Returns true if subscription is expired and trial is over
 */
export function shouldBlockLogin(user: User): boolean {
  // If subscription is active, never block
  if (user.subscriptionStatus === 'active') {
    return false;
  }

  // If subscription is expired, block
  if (user.subscriptionStatus === 'expired') {
    return true;
  }

  // If on trial, check if trial is expired
  if (user.subscriptionStatus === 'trial') {
    return !isTrialActive(user);
  }

  // Default to blocking if status is unknown
  return true;
}

/**
 * Get the monthly query limit for a subscription tier
 */
export function getMonthlyQueryLimit(tier: SubscriptionTier): number {
  return QUERY_LIMITS[tier];
}

/**
 * Get the hourly rate limit for a subscription tier
 */
export function getHourlyRateLimit(tier: SubscriptionTier): number {
  return RATE_LIMITS[tier];
}

/**
 * Get the user's current subscription tier
 * Defaults to 'trial' if not set
 */
export function getUserTier(user: User): SubscriptionTier {
  return user.subscriptionTier || 'trial';
}

/**
 * Get remaining trial days
 * Re-export from suite-utils for convenience
 */
export const getRemainingTrialDays = suiteGetRemainingTrialDays;

/**
 * Get trial expiration date
 */
export function getTrialExpirationDate(user: User): Date | null {
  if (!user.trialStartDate) {
    return null;
  }

  return new Date(user.trialStartDate + (TRIAL_DURATION_DAYS * MILLISECONDS_PER_DAY));
}

/**
 * Check if user has exceeded their query limit
 * Note: This requires tracking query usage separately
 */
export function hasExceededQueryLimit(user: User, currentMonthlyUsage: number): boolean {
  const tier = getUserTier(user);
  const limit = getMonthlyQueryLimit(tier);
  return currentMonthlyUsage >= limit;
}

/**
 * Check if user has exceeded their rate limit
 * Note: This requires tracking hourly usage separately
 */
export function hasExceededRateLimit(user: User, currentHourlyUsage: number): boolean {
  const tier = getUserTier(user);
  const limit = getHourlyRateLimit(tier);
  return currentHourlyUsage >= limit;
}

/**
 * Get subscription status summary
 */
export function getSubscriptionSummary(user: User): {
  tier: SubscriptionTier;
  status: string;
  daysRemaining: number;
  queryLimit: number;
  rateLimit: number;
  isExpired: boolean;
} {
  const tier = getUserTier(user);
  const daysRemaining = getRemainingTrialDays(user);
  const isExpired = user.subscriptionStatus === 'expired' || (user.subscriptionStatus === 'trial' && !isTrialActive(user));

  let status = '';
  if (user.subscriptionStatus === 'active') {
    status = 'Active';
  } else if (user.subscriptionStatus === 'trial' && isTrialActive(user)) {
    status = `Trial (${daysRemaining} days remaining)`;
  } else if (user.subscriptionStatus === 'trial' && !isTrialActive(user)) {
    status = 'Trial Expired';
  } else {
    status = 'Expired';
  }

  return {
    tier,
    status,
    daysRemaining,
    queryLimit: getMonthlyQueryLimit(tier),
    rateLimit: getHourlyRateLimit(tier),
    isExpired,
  };
}
