/**
 * Suite utilities for tracking app usage and managing trial/subscription logic
 */

import type { User, SubscriptionStatus } from '@ainexsuite/types';

export type AppName = 'notes' | 'journey' | 'todo' | 'track' | 'moments' | 'grow' | 'pulse' | 'fit';

const TRIAL_DURATION_DAYS = 30;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Get the number of apps the user has accessed
 */
export function getAppsUsedCount(user: User): number {
  return Object.keys(user.appsUsed || {}).length;
}

/**
 * Check if user has accessed 2 or more apps
 */
export function hasUsedMultipleApps(user: User): boolean {
  return getAppsUsedCount(user) >= 2;
}

/**
 * Check if user's trial is still active
 */
export function isTrialActive(user: User): boolean {
  if (!user.trialStartDate) {
    return false;
  }
  
  const trialEndTime = user.trialStartDate + (TRIAL_DURATION_DAYS * MILLISECONDS_PER_DAY);
  return Date.now() < trialEndTime;
}

/**
 * Get remaining trial days
 */
export function getRemainingTrialDays(user: User): number {
  if (!user.trialStartDate) {
    return 0;
  }
  
  const trialEndTime = user.trialStartDate + (TRIAL_DURATION_DAYS * MILLISECONDS_PER_DAY);
  const remainingMs = trialEndTime - Date.now();
  const remainingDays = Math.ceil(remainingMs / MILLISECONDS_PER_DAY);
  
  return Math.max(0, remainingDays);
}

/**
 * Check if user needs Suite access
 * User needs Suite if:
 * 1. They've used 2+ apps AND
 * 2. Trial has expired OR subscription status is not 'active'
 */
export function needsSuiteAccess(user: User): boolean {
  // If they already have suite access, no need to check
  if (user.suiteAccess) {
    return false;
  }
  
  // If they've used fewer than 2 apps, no suite needed
  if (!hasUsedMultipleApps(user)) {
    return false;
  }
  
  // If trial is active, allow continued use
  if (isTrialActive(user)) {
    return false;
  }
  
  // If subscription is active, allow access
  if (user.subscriptionStatus === 'active') {
    return false;
  }
  
  // Otherwise, they need Suite access
  return true;
}

/**
 * Check if user can access an app
 * Returns { allowed: boolean, reason?: string }
 */
export function canAccessApp(user: User, appName: AppName): { allowed: boolean; reason?: string } {
  // Check if user has accessed this app before
  const hasAccessedApp = !!user.appsUsed?.[appName];
  
  // If they haven't accessed any apps yet, allow first app
  if (getAppsUsedCount(user) === 0) {
    return { allowed: true };
  }
  
  // If they've already accessed this app before, allow
  if (hasAccessedApp) {
    return { allowed: true };
  }
  
  // If they've only accessed 1 app, allow second app
  if (getAppsUsedCount(user) === 1) {
    return { allowed: true };
  }
  
  // If they've accessed 2+ apps, check Suite access
  if (needsSuiteAccess(user)) {
    return {
      allowed: false,
      reason: 'You need Suite access to use multiple apps. Your 30-day trial has expired.',
    };
  }
  
  // If they have Suite access, allow
  return { allowed: true };
}

/**
 * Mark an app as used for the current user
 */
export function markAppAsUsed(_appName: AppName): void {
  // This function will be called by each app to track usage
  // Implementation will be done via Cloud Function call
}

/**
 * Get subscription status summary
 */
export function getSubscriptionSummary(user: User): {
  status: SubscriptionStatus;
  daysRemaining: number;
  needsUpgrade: boolean;
  message: string;
} {
  const appsCount = getAppsUsedCount(user);
  const daysRemaining = getRemainingTrialDays(user);
  const needsUpgrade = needsSuiteAccess(user);
  
  let message = '';
  
  if (appsCount === 0) {
    message = 'Start exploring apps to begin your 30-day trial';
  } else if (appsCount === 1) {
    message = `You're using 1 app. Try another app to unlock the full Suite`;
  } else if (isTrialActive(user)) {
    message = `${daysRemaining} days left in your trial`;
  } else if (user.subscriptionStatus === 'active') {
    message = 'Active subscription';
  } else {
    message = 'Trial expired. Upgrade to continue using multiple apps';
  }
  
  return {
    status: user.subscriptionStatus,
    daysRemaining,
    needsUpgrade,
    message,
  };
}

