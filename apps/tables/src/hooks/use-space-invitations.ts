'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@ainexsuite/auth';
import type { SpaceInvitation, SpaceRole, ChildMember } from '@ainexsuite/types';

const MAIN_APP_URL = process.env.NEXT_PUBLIC_MAIN_APP_URL || 'http://localhost:3000';
const SPACE_COLLECTION = 'spaces';

interface UseSpaceInvitationsResult {
  /** Pending invitations for the current space */
  pendingInvitations: SpaceInvitation[];
  /** Whether invitations are loading */
  loading: boolean;
  /** Any error that occurred */
  error: string | null;
  /** Send an invitation to a user */
  inviteMember: (email: string, role: SpaceRole) => Promise<{ success: boolean; error?: string }>;
  /** Cancel a pending invitation */
  cancelInvitation: (invitationId: string) => Promise<{ success: boolean; error?: string }>;
  /** Refresh the invitations list */
  refresh: () => Promise<void>;
}

/**
 * Hook to manage space invitations for a specific space.
 * Fetches pending invitations and provides functions to send/cancel invitations.
 *
 * Uses the API routes in the main app for centralized invitation management.
 */
export function useSpaceInvitations(spaceId: string | null): UseSpaceInvitationsResult {
  const { user } = useAuth();
  const [pendingInvitations, setPendingInvitations] = useState<SpaceInvitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch pending invitations for the space
   */
  const fetchInvitations = useCallback(async () => {
    if (!spaceId || spaceId === 'personal' || !user) {
      setPendingInvitations([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${MAIN_APP_URL}/api/spaces/invite?spaceId=${encodeURIComponent(spaceId)}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch invitations');
      }

      setPendingInvitations(data.invitations || []);
    } catch (err) {
      console.error('[useSpaceInvitations] Error fetching invitations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch invitations');
      setPendingInvitations([]);
    } finally {
      setLoading(false);
    }
  }, [spaceId, user]);

  // Fetch invitations when spaceId changes
  useEffect(() => {
    void fetchInvitations();
  }, [fetchInvitations]);

  /**
   * Send an invitation to a user
   */
  const inviteMember = useCallback(
    async (email: string, role: SpaceRole): Promise<{ success: boolean; error?: string }> => {
      if (!spaceId || spaceId === 'personal') {
        return { success: false, error: 'Cannot invite to personal space' };
      }

      if (!user) {
        return { success: false, error: 'Must be authenticated to invite members' };
      }

      try {
        const response = await fetch(`${MAIN_APP_URL}/api/spaces/invite`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            spaceId,
            spaceCollection: SPACE_COLLECTION,
            email,
            role,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          return { success: false, error: data.error || 'Failed to send invitation' };
        }

        // Refresh the invitations list
        await fetchInvitations();

        return { success: true };
      } catch (err) {
        console.error('[useSpaceInvitations] Error sending invitation:', err);
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to send invitation',
        };
      }
    },
    [spaceId, user, fetchInvitations]
  );

  /**
   * Cancel a pending invitation
   */
  const cancelInvitation = useCallback(
    async (invitationId: string): Promise<{ success: boolean; error?: string }> => {
      if (!spaceId) {
        return { success: false, error: 'No space selected' };
      }

      try {
        const response = await fetch(
          `${MAIN_APP_URL}/api/spaces/invite?invitationId=${encodeURIComponent(invitationId)}&spaceCollection=${encodeURIComponent(SPACE_COLLECTION)}`,
          {
            method: 'DELETE',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          return { success: false, error: data.error || 'Failed to cancel invitation' };
        }

        // Remove from local state immediately
        setPendingInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));

        return { success: true };
      } catch (err) {
        console.error('[useSpaceInvitations] Error canceling invitation:', err);
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to cancel invitation',
        };
      }
    },
    [spaceId]
  );

  return useMemo(
    () => ({
      pendingInvitations,
      loading,
      error,
      inviteMember,
      cancelInvitation,
      refresh: fetchInvitations,
    }),
    [pendingInvitations, loading, error, inviteMember, cancelInvitation, fetchInvitations]
  );
}

interface UseChildMembersResult {
  /** Add a child member to a family space */
  addChild: (data: {
    displayName: string;
    photoURL?: string;
    birthDate?: string;
    relationship?: string;
  }) => Promise<{ success: boolean; error?: string; childMember?: ChildMember }>;
  /** Update a child member */
  editChild: (
    childId: string,
    data: {
      displayName?: string;
      photoURL?: string;
      birthDate?: string;
      relationship?: string;
    }
  ) => Promise<{ success: boolean; error?: string }>;
  /** Remove a child member */
  removeChild: (childId: string) => Promise<{ success: boolean; error?: string }>;
}

/**
 * Hook to manage child members for family spaces.
 */
export function useChildMembers(spaceId: string | null): UseChildMembersResult {
  const { user } = useAuth();

  const addChild = useCallback(
    async (data: {
      displayName: string;
      photoURL?: string;
      birthDate?: string;
      relationship?: string;
    }): Promise<{ success: boolean; error?: string; childMember?: ChildMember }> => {
      if (!spaceId || spaceId === 'personal') {
        return { success: false, error: 'Cannot add child to personal space' };
      }

      if (!user) {
        return { success: false, error: 'Must be authenticated' };
      }

      try {
        const response = await fetch(`${MAIN_APP_URL}/api/spaces/child-member`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            spaceId,
            spaceCollection: SPACE_COLLECTION,
            ...data,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          return { success: false, error: result.error || 'Failed to add child' };
        }

        return { success: true, childMember: result.childMember };
      } catch (err) {
        console.error('[useChildMembers] Error adding child:', err);
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to add child',
        };
      }
    },
    [spaceId, user]
  );

  const editChild = useCallback(
    async (
      childId: string,
      data: {
        displayName?: string;
        photoURL?: string;
        birthDate?: string;
        relationship?: string;
      }
    ): Promise<{ success: boolean; error?: string }> => {
      if (!spaceId) {
        return { success: false, error: 'No space selected' };
      }

      try {
        const response = await fetch(`${MAIN_APP_URL}/api/spaces/child-member`, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            spaceId,
            spaceCollection: SPACE_COLLECTION,
            childId,
            ...data,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          return { success: false, error: result.error || 'Failed to update child' };
        }

        return { success: true };
      } catch (err) {
        console.error('[useChildMembers] Error editing child:', err);
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to update child',
        };
      }
    },
    [spaceId]
  );

  const removeChild = useCallback(
    async (childId: string): Promise<{ success: boolean; error?: string }> => {
      if (!spaceId) {
        return { success: false, error: 'No space selected' };
      }

      try {
        const response = await fetch(
          `${MAIN_APP_URL}/api/spaces/child-member?spaceId=${encodeURIComponent(spaceId)}&spaceCollection=${encodeURIComponent(SPACE_COLLECTION)}&childId=${encodeURIComponent(childId)}`,
          {
            method: 'DELETE',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const result = await response.json();

        if (!response.ok) {
          return { success: false, error: result.error || 'Failed to remove child' };
        }

        return { success: true };
      } catch (err) {
        console.error('[useChildMembers] Error removing child:', err);
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to remove child',
        };
      }
    },
    [spaceId]
  );

  return useMemo(
    () => ({
      addChild,
      editChild,
      removeChild,
    }),
    [addChild, editChild, removeChild]
  );
}
