/**
 * Suite Guard Component
 * Protects apps and enforces Suite access requirements
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from './context';
import { canAccessApp, getSubscriptionSummary, type AppName } from './suite-utils';
import { db } from '@ainexsuite/firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface SuiteGuardProps {
  appName: AppName;
  children: React.ReactNode;
  PaywallComponent?: React.ComponentType<{ message: string; daysRemaining?: number; onUpgrade?: () => void }>;
  LoadingComponent?: React.ComponentType<{ message?: string }>;
}

export function SuiteGuard({ appName, children, PaywallComponent, LoadingComponent }: SuiteGuardProps) {
  const { user, loading, ssoInProgress } = useAuth();
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [accessAllowed, setAccessAllowed] = useState(false);

  useEffect(() => {

    // Wait for auth loading and SSO to complete before making decisions
    if (loading || ssoInProgress) {
      return;
    }

    if (!user) {
      // Redirect non-logged-in users to public homepage
      window.location.href = '/';
      return;
    }

    checkAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, ssoInProgress, appName]);

  const checkAccess = async () => {
    if (!user) {
      setCheckingAccess(false);
      return;
    }

    try {
      // Check if user can access this app
      const accessCheck = canAccessApp(user, appName);
      
      if (accessCheck.allowed) {
        // Track app usage
        await trackAppUsage(appName);
        setAccessAllowed(true);
      } else {
        setAccessAllowed(false);
      }
    } catch (error) {
      // On error, allow access (fail open)
      setAccessAllowed(true);
    } finally {
      setCheckingAccess(false);
    }
  };

  const trackAppUsage = async (app: AppName) => {
    if (!user || !user.uid) {
      return;
    }

    try {
      // Check if app is already tracked
      if (user.appsUsed?.[app]) {
        return; // Already tracked
      }

      // Update user document to track app usage
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        [`appsUsed.${app}`]: Date.now(),
        // Also update legacy apps field for backward compatibility
        [`apps.${app}`]: true,
      });

    } catch (error) {
      // Non-blocking error - don't fail the access check
    }
  };

  if (loading || ssoInProgress || checkingAccess) {
    if (LoadingComponent) {
      return <LoadingComponent message="Checking access..." />;
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-accent-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  if (!accessAllowed) {
    const summary = getSubscriptionSummary(user);
    if (PaywallComponent) {
      return (
        <PaywallComponent
          message={summary.message}
          daysRemaining={summary.daysRemaining}
          onUpgrade={() => {
            const isDev = process.env.NODE_ENV === 'development';
            const suiteUrl = isDev ? 'http://localhost:3010' : 'https://www.ainexspace.com';
            window.location.href = suiteUrl;
          }}
        />
      );
    }
    // Fallback if no PaywallComponent provided
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-background rounded-2xl shadow-xl border border-border p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Suite Access Required</h2>
          <p className="text-muted-foreground mb-6">
            You need Suite access to use multiple apps. Your 30-day trial has expired.
          </p>
          <button
            onClick={() => {
              const isDev = process.env.NODE_ENV === 'development';
              const suiteUrl = isDev ? 'http://localhost:3010' : 'https://www.ainexspace.com';
              window.location.href = suiteUrl;
            }}
            className="w-full bg-accent-500 hover:bg-accent-600 text-foreground font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Upgrade to Suite
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

