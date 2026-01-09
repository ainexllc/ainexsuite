'use client';

/**
 * Simplified Workspace Auth Hook
 *
 * With middleware handling server-side route protection, this hook
 * primarily provides user data and auth utilities to components.
 */

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context';

interface UseWorkspaceAuthOptions {
  redirectTo?: string;
}

interface UseWorkspaceAuthReturn {
  user: ReturnType<typeof useAuth>['user'];
  loading: boolean;
  isLoading: boolean;
  isReady: boolean;
  handleSignOut: () => Promise<void>;
  updatePreferences: ReturnType<typeof useAuth>['updatePreferences'];
  updateProfile: ReturnType<typeof useAuth>['updateProfile'];
  updateProfileImage: ReturnType<typeof useAuth>['updateProfileImage'];
  removeProfileImage: ReturnType<typeof useAuth>['removeProfileImage'];
  generateAnimatedAvatar: ReturnType<typeof useAuth>['generateAnimatedAvatar'];
  saveAnimatedAvatar: ReturnType<typeof useAuth>['saveAnimatedAvatar'];
  toggleAnimatedAvatar: ReturnType<typeof useAuth>['toggleAnimatedAvatar'];
  removeAnimatedAvatar: ReturnType<typeof useAuth>['removeAnimatedAvatar'];
  pollAnimationStatus: ReturnType<typeof useAuth>['pollAnimationStatus'];
}

/**
 * Workspace auth hook - provides user data and auth utilities.
 *
 * Note: Route protection is handled by middleware (server-side).
 * This hook is for accessing user data and auth functions in components.
 */
export function useWorkspaceAuth(options: UseWorkspaceAuthOptions = {}): UseWorkspaceAuthReturn {
  const { redirectTo = '/' } = options;
  const {
    user,
    loading,
    signOut,
    updatePreferences,
    updateProfile,
    updateProfileImage,
    removeProfileImage,
    generateAnimatedAvatar,
    saveAnimatedAvatar,
    toggleAnimatedAvatar,
    removeAnimatedAvatar,
    pollAnimationStatus,
  } = useAuth();
  const router = useRouter();

  const isLoading = loading;
  const isReady = !loading && !!user;

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      router.push(redirectTo);
    } catch {
      // Ignore errors
    }
  }, [signOut, router, redirectTo]);

  return {
    user,
    loading,
    isLoading,
    isReady,
    handleSignOut,
    updatePreferences,
    updateProfile,
    updateProfileImage,
    removeProfileImage,
    generateAnimatedAvatar,
    saveAnimatedAvatar,
    toggleAnimatedAvatar,
    removeAnimatedAvatar,
    pollAnimationStatus,
  };
}
