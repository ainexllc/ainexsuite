'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  checkAllAppsLoginStatus,
  getCurrentAppSlug,
  type LoginStatus
} from '../utils/cross-app-navigation';

const APP_SLUGS = [
  'main',
  'notes',
  'journey',
  'todo',
  'health',
  'moments',
  'grow',
  'pulse',
  'fit',
  'projects',
  'workflow',
] as const;

export interface UseAppLoginStatusOptions {
  /** Whether the current user is logged in on this app */
  isLoggedIn?: boolean;
  /** Whether to auto-check on mount */
  autoCheck?: boolean;
}

export interface UseAppLoginStatusReturn {
  /** Map of app slugs to their login status */
  statuses: Record<string, LoginStatus>;
  /** Whether a check is in progress */
  isChecking: boolean;
  /** Manually trigger a status check */
  checkStatuses: () => Promise<void>;
  /** Get status for a specific app */
  getStatus: (slug: string) => LoginStatus;
}

/**
 * Hook to check login status across all apps
 * Useful for showing login indicators in navigation panels
 *
 * @example
 * ```tsx
 * const { statuses, isChecking, checkStatuses } = useAppLoginStatus({ isLoggedIn: !!user });
 *
 * // In your component
 * <button onClick={checkStatuses}>Refresh Status</button>
 * {apps.map(app => (
 *   <AppItem key={app.slug} status={statuses[app.slug]} />
 * ))}
 * ```
 */
export function useAppLoginStatus(options: UseAppLoginStatusOptions = {}): UseAppLoginStatusReturn {
  const { isLoggedIn = false, autoCheck = false } = options;
  const [statuses, setStatuses] = useState<Record<string, LoginStatus>>({});
  const [isChecking, setIsChecking] = useState(false);

  const currentAppSlug = getCurrentAppSlug();

  const checkStatuses = useCallback(async () => {
    setIsChecking(true);

    // Initialize all as checking
    const initialStatuses: Record<string, LoginStatus> = {};
    APP_SLUGS.forEach(slug => {
      if (slug === currentAppSlug) {
        initialStatuses[slug] = isLoggedIn ? 'logged-in' : 'logged-out';
      } else {
        initialStatuses[slug] = 'checking';
      }
    });
    setStatuses(initialStatuses);

    try {
      const results = await checkAllAppsLoginStatus(
        [...APP_SLUGS],
        currentAppSlug || undefined,
        isLoggedIn
      );
      setStatuses(results);
    } catch (error) {
      console.error('Failed to check app login statuses:', error);
    } finally {
      setIsChecking(false);
    }
  }, [currentAppSlug, isLoggedIn]);

  const getStatus = useCallback((slug: string): LoginStatus => {
    return statuses[slug] || 'checking';
  }, [statuses]);

  // Auto-check on mount if enabled
  useEffect(() => {
    if (autoCheck) {
      checkStatuses();
    }
  }, [autoCheck, checkStatuses]);

  // Update current app status when isLoggedIn changes
  useEffect(() => {
    if (currentAppSlug) {
      setStatuses(prev => ({
        ...prev,
        [currentAppSlug]: isLoggedIn ? 'logged-in' : 'logged-out'
      }));
    }
  }, [currentAppSlug, isLoggedIn]);

  return {
    statuses,
    isChecking,
    checkStatuses,
    getStatus,
  };
}
