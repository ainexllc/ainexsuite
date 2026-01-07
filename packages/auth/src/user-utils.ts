/**
 * User Utilities
 * Helper functions for working with User objects and app access
 */

import type { User, AccountType } from '@ainexsuite/types';

/**
 * Calculate account type based on apps eligible
 */
export function calculateAccountType(user: User): AccountType {
  const appsCount = user.appsEligible?.length || 0;

  if (user.suiteAccess) {
    return 'suite';
  } else if (appsCount >= 2) {
    return 'multi-app';
  } else {
    return 'single-app';
  }
}

/**
 * Check if user has access to a specific app
 * Uses appsEligible as source of truth, with fallback to legacy fields
 */
export function hasAppAccess(user: User, appId: string): boolean {
  // Priority 1: Check appsEligible (source of truth)
  if (user.appsEligible && user.appsEligible.length > 0) {
    return user.appsEligible.includes(appId);
  }

  // Priority 2: Fallback to appPermissions (deprecated)
  if (user.appPermissions && user.appPermissions[appId as keyof typeof user.appPermissions]) {
    return user.appPermissions[appId as keyof typeof user.appPermissions]?.approved || false;
  }

  // Priority 3: Fallback to legacy apps field
  if (user.apps && user.apps[appId as keyof typeof user.apps] !== undefined) {
    return user.apps[appId as keyof typeof user.apps] ?? false;
  }

  return false;
}

/**
 * Get list of all apps user has access to
 * Consolidates from all sources for backward compatibility
 */
export function getUserApps(user: User): string[] {
  // Start with appsEligible if available
  if (user.appsEligible && user.appsEligible.length > 0) {
    return user.appsEligible;
  }

  const apps: string[] = [];

  // Fallback 1: Check appPermissions
  if (user.appPermissions) {
    Object.entries(user.appPermissions).forEach(([app, permission]) => {
      if (permission?.approved) {
        apps.push(app);
      }
    });
  }

  // Fallback 2: Check legacy apps field
  if (apps.length === 0 && user.apps) {
    Object.entries(user.apps).forEach(([app, enabled]) => {
      if (enabled) {
        apps.push(app);
      }
    });
  }

  return apps;
}

/**
 * Calculate trial end date from start date
 */
export function calculateTrialEndDate(trialStartDate: number | Date): number {
  const startTime = typeof trialStartDate === 'number' ? trialStartDate : trialStartDate.getTime();
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  return startTime + THIRTY_DAYS_MS;
}

/**
 * Check if user's trial is still active
 * NOTE: This function is exported from suite-utils.ts to avoid duplicate exports
 */
// Commented out to avoid conflict with suite-utils export
// export function isTrialActive(user: User): boolean {
//   if (!user.trialStartDate) {
//     return false;
//   }
//
//   const now = Date.now();
//   const trialEnd = user.trialEndDate || calculateTrialEndDate(user.trialStartDate);
//
//   return now < trialEnd;
// }

/**
 * Migrate legacy user data to new format
 * Consolidates appPermissions and apps into appsEligible
 */
export function migrateUserData(user: User): Partial<User> {
  // If appsEligible already exists and has data, no migration needed
  if (user.appsEligible && user.appsEligible.length > 0) {
    return {
      accountType: calculateAccountType(user),
      trialEndDate: user.trialStartDate ? calculateTrialEndDate(user.trialStartDate) : undefined,
    };
  }

  const appsEligible: string[] = [];

  // Priority 1: Migrate from appPermissions
  if (user.appPermissions) {
    Object.entries(user.appPermissions).forEach(([app, permission]) => {
      if (permission?.approved) {
        appsEligible.push(app);
      }
    });
  }

  // Priority 2: Migrate from legacy apps field
  if (appsEligible.length === 0 && user.apps) {
    Object.entries(user.apps).forEach(([app, enabled]) => {
      if (enabled) {
        appsEligible.push(app);
      }
    });
  }

  // If still no apps, and in development, grant all apps
  if (appsEligible.length === 0 && process.env.NODE_ENV === 'development') {
    appsEligible.push('notes', 'journal', 'todo', 'health', 'album', 'habits', 'hub', 'fit');
  }

  const accountType = calculateAccountType({ ...user, appsEligible });
  const trialEndDate = user.trialStartDate ? calculateTrialEndDate(user.trialStartDate) : undefined;

  return {
    appsEligible,
    accountType,
    trialEndDate,
  };
}

/**
 * Determine if user should be using subdomain or standalone domain
 */
export function getPreferredDomain(user: User, currentHostname: string): 'subdomain' | 'standalone' {
  // If user has explicit preference, use it
  if (user.preferredDomain) {
    return user.preferredDomain;
  }

  // If multi-app or suite user, prefer subdomain for SSO
  const accountType = user.accountType || calculateAccountType(user);
  if (accountType === 'multi-app' || accountType === 'suite') {
    return 'subdomain';
  }

  // Single-app users can use either, check current domain
  if (currentHostname.includes('ainexspace.com')) {
    return 'subdomain';
  }

  return 'standalone';
}

/**
 * Check if user should be redirected to suite dashboard
 */
export function shouldRedirectToSuite(user: User, currentHostname: string): boolean {
  const accountType = user.accountType || calculateAccountType(user);

  // Multi-app or suite users on standalone domains should consider redirecting
  if ((accountType === 'multi-app' || accountType === 'suite') &&
      !currentHostname.includes('ainexspace.com')) {
    return true;
  }

  return false;
}
