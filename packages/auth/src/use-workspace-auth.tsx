'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context';

interface UseWorkspaceAuthOptions {
  /**
   * Where to redirect if not authenticated
   * @default '/'
   */
  redirectTo?: string;
}

interface UseWorkspaceAuthReturn {
  /** Current authenticated user */
  user: ReturnType<typeof useAuth>['user'];
  /** Whether auth is loading */
  loading: boolean;
  /** Whether SSO is in progress */
  ssoInProgress: boolean;
  /** Bootstrap status */
  bootstrapStatus: ReturnType<typeof useAuth>['bootstrapStatus'];
  /** Whether any loading state is active (auth, SSO, or bootstrap) */
  isLoading: boolean;
  /** Whether user is authenticated and ready */
  isReady: boolean;
  /** Sign out handler */
  handleSignOut: () => Promise<void>;
}

/**
 * Shared hook for workspace authentication logic.
 * Handles auth redirect, loading states, and sign out consistently across all apps.
 *
 * @example
 * ```tsx
 * const { user, isLoading, isReady, handleSignOut } = useWorkspaceAuth();
 *
 * if (isLoading) return <LoadingScreen />;
 * if (!isReady) return null;
 *
 * return <WorkspaceLayout user={user} onSignOut={handleSignOut}>...</WorkspaceLayout>;
 * ```
 */
export function useWorkspaceAuth(options: UseWorkspaceAuthOptions = {}): UseWorkspaceAuthReturn {
  const { redirectTo = '/' } = options;
  const { user, loading, ssoInProgress, bootstrapStatus } = useAuth();
  const router = useRouter();

  // Combined loading state
  const isLoading = loading || ssoInProgress || bootstrapStatus === 'running';

  // User is ready when not loading and authenticated
  const isReady = !isLoading && !!user;

  // Redirect to login if not authenticated
  // Wait for bootstrap and SSO to complete before redirecting to prevent interrupting auto-login
  useEffect(() => {
    if (!loading && !ssoInProgress && !user && bootstrapStatus !== 'running') {
      router.push(redirectTo);
    }
  }, [user, loading, ssoInProgress, bootstrapStatus, router, redirectTo]);

  // Shared sign out handler
  const handleSignOut = useCallback(async () => {
    try {
      const { auth } = await import('@ainexsuite/firebase');
      const firebaseAuth = await import('firebase/auth');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (firebaseAuth as any).signOut(auth);
      router.push(redirectTo);
    } catch {
      // Ignore sign out errors
    }
  }, [router, redirectTo]);

  return {
    user,
    loading,
    ssoInProgress,
    bootstrapStatus,
    isLoading,
    isReady,
    handleSignOut,
  };
}
