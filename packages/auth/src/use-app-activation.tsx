'use client';

import { useEffect, useState } from 'react';
import { useAuth } from './context';

/**
 * useAppActivation Hook
 *
 * Checks if the current app is in the user's appsEligible list.
 * Returns state for showing the activation modal.
 *
 * Usage:
 * const { needsActivation, appName } = useAppActivation('notes');
 *
 * if (needsActivation) {
 *   return <AppActivationModal appName={appName} appDisplayName="Notes" />;
 * }
 */

export type UseAppActivationOptions = {
  /**
   * The app name (e.g. 'notes', 'journey', 'todo')
   */
  appName: string;

  /**
   * If true, skip activation check (useful for public pages)
   */
  skip?: boolean;
};

export type UseAppActivationReturn = {
  /**
   * True if user needs to activate this app
   */
  needsActivation: boolean;

  /**
   * The app name being checked
   */
  appName: string;

  /**
   * True while checking eligibility
   */
  checking: boolean;
};

export function useAppActivation(
  appNameOrOptions: string | UseAppActivationOptions
): UseAppActivationReturn {
  const options =
    typeof appNameOrOptions === 'string'
      ? { appName: appNameOrOptions }
      : appNameOrOptions;

  const { appName, skip = false } = options;
  const { user, loading } = useAuth();
  const [needsActivation, setNeedsActivation] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Skip if explicitly disabled or still loading auth
    if (skip || loading) {
      setChecking(loading);
      return;
    }

    // No user = needs activation
    if (!user) {
      setNeedsActivation(true);
      setChecking(false);
      return;
    }

    // Check if app is in appsEligible
    const isEligible = user.appsEligible?.includes(appName);

    setNeedsActivation(!isEligible);
    setChecking(false);
  }, [user, loading, appName, skip]);

  return {
    needsActivation,
    appName,
    checking,
  };
}
