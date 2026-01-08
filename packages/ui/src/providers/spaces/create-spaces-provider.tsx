'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { useAuth } from '@ainexsuite/auth';
import { db } from '@ainexsuite/firebase';
import type { SpaceType } from '@ainexsuite/types';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';

// Helper to safely convert Firestore Timestamp, Date, string, or number to Date
function toDate(value: unknown): Date {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  if (value instanceof Timestamp) return value.toDate();
  if (typeof value === 'object' && 'toDate' in value && typeof (value as { toDate: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate();
  }
  if (typeof value === 'number') return new Date(value);
  if (typeof value === 'string') return new Date(value);
  return new Date();
}
import type {
  SpacesProviderConfig,
  SpacesContextValue,
  BaseSpace,
  SpaceMember,
  SpaceDocData,
  SpaceDraft,
} from './types';

/**
 * Factory function to create an app-specific SpacesProvider.
 *
 * This creates a React Context provider and hook that manages spaces for a specific app.
 * Each app has its own Firestore collection and configuration.
 *
 * @example
 * ```tsx
 * // In your app's spaces-provider.tsx
 * export const { SpacesProvider, useSpaces } = createSpacesProvider<NoteSpace>({
 *   collectionName: 'noteSpaces',
 *   storageKey: 'notes-current-space',
 *   defaultSpace: { name: 'My Notes', type: 'personal' },
 *   allowedTypes: ['personal', 'family', 'work'],
 * });
 * ```
 */
export function createSpacesProvider<TSpace extends BaseSpace = BaseSpace>(
  config: SpacesProviderConfig<TSpace>
) {
  const SpacesContext = createContext<SpacesContextValue<TSpace> | null>(null);

  function SpacesProvider({ children }: { children: ReactNode }) {
    const { user, loading: authLoading } = useAuth();
    const [userSpaces, setUserSpaces] = useState<TSpace[]>([]);
    const [currentSpaceId, setCurrentSpaceId] = useState<string>('personal');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const userId = user?.uid ?? null;
    // Wait for auth to be fully complete to avoid permission errors
    // In dev mode, firebaseUser may be null (uses session hydration instead)
    // authLoading is false only when authPhase is 'authenticated' or 'unauthenticated'
    const isAuthReady = !authLoading && !!user;

    // Create virtual personal space (not stored in Firestore)
    const personalSpace = useMemo<TSpace>(
      () =>
        ({
          id: 'personal',
          name: config.defaultSpace.name,
          type: config.defaultSpace.type,
          // Include user in members array so permission checks work
          members: userId ? [{
            uid: userId,
            displayName: user?.displayName || 'Me',
            photoURL: user?.photoURL || undefined,
            role: 'admin',
            joinedAt: new Date().toISOString(),
          }] : [],
          memberUids: userId ? [userId] : [],
          createdAt: new Date(),
          ownerId: userId || '',
        }) as unknown as TSpace,
      [userId, user?.displayName, user?.photoURL]
    );

    // Subscribe to user's spaces from Firestore
    // Wait for auth to be fully complete (not just cached user) to avoid permission errors
    useEffect(() => {
      if (!userId || !isAuthReady) {
        if (!userId && !authLoading) {
          // Only reset to personal space if auth is done and there's no user
          setUserSpaces([]);
          setCurrentSpaceId('personal');
          setLoading(false);
        }
        return;
      }

      setLoading(true);

      const spacesRef = collection(db, config.collectionName);
      const q = query(
        spacesRef,
        where('memberUids', 'array-contains', userId),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          // Transform all spaces, keeping both space object and raw data for filtering
          const spacesWithData = snapshot.docs.map((docSnap) => {
            const data = docSnap.data() as SpaceDocData;

            // Use custom transform if provided
            if (config.transformSpace) {
              return { space: config.transformSpace(docSnap.id, data), data };
            }

            // Default transformation - include isGlobal and hiddenInApps
            // Support both ownerId and createdBy (legacy field) for compatibility
            const ownerId = data.ownerId || data.createdBy || '';
            return {
              space: {
                id: docSnap.id,
                name: data.name,
                type: data.type,
                members: data.members,
                memberUids: data.memberUids,
                createdAt: toDate(data.createdAt),
                ownerId,
                createdBy: ownerId, // Also set createdBy for apps that use that field
                isGlobal: data.isGlobal,
                hiddenInApps: data.hiddenInApps,
              } as unknown as TSpace,
              data,
            };
          });

          // Store all spaces (unfiltered) - needed for settings modal
          const allSpaces = spacesWithData.map(({ space }) => space);

          setUserSpaces(allSpaces);
          setLoading(false);
          setError(null);
        },
        (err) => {
          // eslint-disable-next-line no-console
          console.error(`[Spaces] Error subscribing to ${config.collectionName}:`, err);

          // Check if this is a permission-denied error
          const isPermissionDenied = err?.code === 'permission-denied' ||
            err?.message?.includes('permission-denied') ||
            err?.message?.includes('Missing or insufficient permissions');

          if (isPermissionDenied) {
            // eslint-disable-next-line no-console
            console.warn('[Spaces] Permission denied - falling back to personal space only');
            // Note: We no longer sign out on permission errors to avoid logout loops
            // The user can still use the app with the personal space
          }

          setError(err);
          // Still set loading to false so the app can function with personal space
          setUserSpaces([]);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    }, [userId, isAuthReady, authLoading]);

    // All spaces including virtual personal space (unfiltered - for settings)
    const allSpaces = useMemo(
      () => [personalSpace, ...userSpaces],
      [personalSpace, userSpaces]
    );

    // Visible spaces for this app (filtered by hiddenInApps)
    const spaces = useMemo(
      () => [
        personalSpace,
        ...userSpaces.filter((space) => {
          // Global spaces are always visible
          if ((space as BaseSpace & { isGlobal?: boolean }).isGlobal) return true;
          // Check if this app is in the hidden list
          const hiddenInApps = (space as BaseSpace & { hiddenInApps?: string[] }).hiddenInApps;
          if (hiddenInApps?.includes(config.appId)) return false;
          return true;
        }),
      ],
      [personalSpace, userSpaces]
    );

    // Get current space object
    const currentSpace = useMemo(
      () => spaces.find((s) => s.id === currentSpaceId) || spaces[0],
      [spaces, currentSpaceId]
    );

    // Persist current space to localStorage
    const handleSetCurrentSpace = useCallback((spaceId: string) => {
      setCurrentSpaceId(spaceId);
      if (typeof window !== 'undefined') {
        localStorage.setItem(config.storageKey, spaceId);
      }
    }, []);

    // Restore current space from localStorage on mount
    useEffect(() => {
      if (typeof window !== 'undefined') {
        const savedSpaceId = localStorage.getItem(config.storageKey);
        if (savedSpaceId) {
          setCurrentSpaceId(savedSpaceId);
        }
      }
    }, []);

    // Create a new space
    const handleCreateSpace = useCallback(
      async (input: { name: string; type: SpaceType }): Promise<string> => {
        if (!userId || !user) {
          throw new Error('Must be authenticated to create a space');
        }

        // Validate space type is allowed
        if (!config.allowedTypes.includes(input.type)) {
          throw new Error(
            `Space type "${input.type}" is not allowed for this app`
          );
        }

        // Custom validation if provided
        if (config.validateSpace && !config.validateSpace(input)) {
          throw new Error('Invalid space configuration');
        }

        const spacesRef = collection(db, config.collectionName);

        const member: SpaceMember = {
          uid: userId,
          displayName: user.displayName || 'Me',
          photoURL: user.photoURL || undefined,
          role: 'admin',
          joinedAt: new Date().toISOString(),
        };

        const spaceData = {
          name: input.name,
          type: input.type,
          members: [member],
          memberUids: [userId],
          createdAt: Timestamp.now(),
          ownerId: userId,
        };

        const docRef = await addDoc(spacesRef, spaceData);

        // Auto-switch to the new space
        handleSetCurrentSpace(docRef.id);

        return docRef.id;
      },
      [userId, user, handleSetCurrentSpace]
    );

    // Update an existing space
    const handleUpdateSpace = useCallback(
      async (spaceId: string, updates: SpaceDraft): Promise<void> => {
        const spaceRef = doc(db, config.collectionName, spaceId);
        await updateDoc(spaceRef, updates);
      },
      []
    );

    // Delete a space
    const handleDeleteSpace = useCallback(
      async (spaceId: string): Promise<void> => {
        const spaceRef = doc(db, config.collectionName, spaceId);
        await deleteDoc(spaceRef);

        // Switch back to personal space if deleting current
        if (currentSpaceId === spaceId) {
          handleSetCurrentSpace('personal');
        }
      },
      [currentSpaceId, handleSetCurrentSpace]
    );

    // Force refresh spaces (triggers re-subscription)
    const refreshSpaces = useCallback(() => {
      setLoading(true);
    }, []);

    const value = useMemo<SpacesContextValue<TSpace>>(
      () => ({
        spaces,
        allSpaces,
        currentSpace,
        currentSpaceId,
        loading,
        error,
        setCurrentSpace: handleSetCurrentSpace,
        createSpace: handleCreateSpace,
        updateSpace: handleUpdateSpace,
        deleteSpace: handleDeleteSpace,
        refreshSpaces,
      }),
      [
        spaces,
        allSpaces,
        currentSpace,
        currentSpaceId,
        loading,
        error,
        handleSetCurrentSpace,
        handleCreateSpace,
        handleUpdateSpace,
        handleDeleteSpace,
        refreshSpaces,
      ]
    );

    return (
      <SpacesContext.Provider value={value}>{children}</SpacesContext.Provider>
    );
  }

  /**
   * Hook to access the spaces context.
   * Must be used within a SpacesProvider.
   */
  function useSpaces(): SpacesContextValue<TSpace> {
    const context = useContext(SpacesContext);

    if (!context) {
      throw new Error('useSpaces must be used within a SpacesProvider.');
    }

    return context;
  }

  return { SpacesProvider, useSpaces, SpacesContext };
}
