/**
 * SubscriptionGuard Component
 * Wraps app content and enforces subscription/trial access
 */

'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useAuth } from './context';
import {
  canAccessApp,
  shouldBlockLogin,
  getSubscriptionSummary,
  type AppName,
} from './subscription-utils';

interface SubscriptionGuardProps {
  appName: AppName;
  children: ReactNode;
}

/**
 * Modal component for paywall/blocking screens
 */
function PaywallModal({
  isBlocked,
  appName,
  tier,
  daysRemaining,
  onUpgrade,
}: {
  isBlocked: boolean;
  appName: string;
  tier: string;
  daysRemaining: number;
  onUpgrade: () => void;
}) {
  if (!isBlocked) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 max-w-md rounded-xl bg-white p-8 shadow-2xl dark:bg-gray-800">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
            <svg
              className="h-8 w-8 text-orange-600 dark:text-orange-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
            Subscription Required
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Your trial has expired. Upgrade to continue using {appName}.
          </p>
        </div>

        <div className="mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Current Tier:</span>
            <span className="font-semibold capitalize text-gray-900 dark:text-white">
              {tier}
            </span>
          </div>
          {daysRemaining > 0 ? (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Trial Days Left:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {daysRemaining}
              </span>
            </div>
          ) : (
            <div className="text-sm text-red-600 dark:text-red-400">Trial Expired</div>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={onUpgrade}
            className="w-full rounded-lg bg-orange-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
          >
            Upgrade to Pro
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Back to Dashboard
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
          Questions? Contact support@ainexsuite.com
        </p>
      </div>
    </div>
  );
}

/**
 * Loading state component
 */
function LoadingState() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600 dark:border-orange-900 dark:border-t-orange-400" />
        <p className="text-gray-600 dark:text-gray-400">Checking subscription...</p>
      </div>
    </div>
  );
}

/**
 * SubscriptionGuard Component
 * Wraps app content and checks subscription status
 */
export function SubscriptionGuard({ appName, children }: SubscriptionGuardProps) {
  const { user, loading, ssoInProgress } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    // Wait for auth and SSO to complete before checking
    if (loading || ssoInProgress) {
      setIsChecking(true);
      return;
    }

    if (!user) {
      // No user, redirect to login
      window.location.href = '/login';
      return;
    }

    // Check if user should be blocked entirely
    if (shouldBlockLogin(user)) {
      setHasAccess(false);
      setIsChecking(false);
      return;
    }

    // Check if user can access this specific app
    const canAccess = canAccessApp(user, appName);
    setHasAccess(canAccess);
    setIsChecking(false);
  }, [user, loading, ssoInProgress, appName]);

  const handleUpgrade = () => {
    // Redirect to pricing/upgrade page
    window.location.href = '/pricing';
  };

  // Show loading state during auth check
  if (loading || isChecking) {
    return <LoadingState />;
  }

  // No user - will redirect to login
  if (!user) {
    return <LoadingState />;
  }

  // Get subscription summary for modal
  const summary = getSubscriptionSummary(user);

  // Show paywall if no access
  if (!hasAccess) {
    return (
      <>
        <PaywallModal
          isBlocked={true}
          appName={appName}
          tier={summary.tier}
          daysRemaining={summary.daysRemaining}
          onUpgrade={handleUpgrade}
        />
        {/* Render blurred content behind modal */}
        <div className="pointer-events-none blur-sm">{children}</div>
      </>
    );
  }

  // User has access, render children
  return <>{children}</>;
}

/**
 * Hook to use subscription info in components
 */
export function useSubscription() {
  const { user } = useAuth();

  if (!user) {
    return {
      tier: 'trial' as const,
      status: 'unknown',
      daysRemaining: 0,
      queryLimit: 0,
      rateLimit: 0,
      isExpired: true,
      canAccessApp: () => false,
    };
  }

  const summary = getSubscriptionSummary(user);

  return {
    ...summary,
    canAccessApp: (appName: AppName) => canAccessApp(user, appName),
  };
}
