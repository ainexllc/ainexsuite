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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
      <div className="mx-4 max-w-md rounded-xl bg-background p-8 shadow-2xl border border-border">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
            <svg
              className="h-8 w-8 text-orange-600"
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
          <h2 className="mb-2 text-2xl font-bold text-foreground">
            Subscription Required
          </h2>
          <p className="text-muted-foreground">
            Your trial has expired. Upgrade to continue using {appName}.
          </p>
        </div>

        <div className="mb-6 rounded-lg bg-muted p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Current Tier:</span>
            <span className="font-semibold capitalize text-foreground">
              {tier}
            </span>
          </div>
          {daysRemaining > 0 ? (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Trial Days Left:</span>
              <span className="font-semibold text-foreground">
                {daysRemaining}
              </span>
            </div>
          ) : (
            <div className="text-sm text-red-600">Trial Expired</div>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={onUpgrade}
            className="w-full rounded-lg bg-orange-600 px-4 py-3 font-semibold text-foreground transition-colors hover:bg-orange-700"
          >
            Upgrade to Pro
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full rounded-lg border border-border px-4 py-3 font-semibold text-foreground transition-colors hover:bg-muted"
          >
            Back to Dashboard
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Questions? Contact support@ainexspace.com
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
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />
        <p className="text-muted-foreground">Checking subscription...</p>
      </div>
    </div>
  );
}

/**
 * SubscriptionGuard Component
 * Wraps app content and checks subscription status
 */
export function SubscriptionGuard({ appName, children }: SubscriptionGuardProps) {
  const { user, loading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    // Wait for auth to complete before checking
    if (loading) {
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
  }, [user, loading, appName]);

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
