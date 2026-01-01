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
    const { user } = useAuth();
    const [userSpaces, setUserSpaces] = useState<TSpace[]>([]);
    const [currentSpaceId, setCurrentSpaceId] = useState<string>('personal');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const userId = user?.uid ?? null;

    // Create virtual personal space (not stored in Firestore)
    const personalSpace = useMemo<TSpace>(
      () =>
        ({
          id: 'personal',
          name: config.defaultSpace.name,
          type: config.defaultSpace.type,
          members: [],
          memberUids: userId ? [userId] : [],
          createdAt: new Date(),
          createdBy: userId || '',
        }) as unknown as TSpace,
      [userId]
    );

    // Subscribe to user's spaces from Firestore
    useEffect(() => {
      if (!userId) {
        setUserSpaces([]);
        setCurrentSpaceId('personal');
        setLoading(false);
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
          const spaces = snapshot.docs
            .map((docSnap) => {
              const data = docSnap.data() as SpaceDocData;

              // Use custom transform if provided
              if (config.transformSpace) {
                return { space: config.transformSpace(docSnap.id, data), data };
              }

              // Default transformation
              return {
                space: {
                  id: docSnap.id,
                  name: data.name,
                  type: data.type,
                  members: data.members,
                  memberUids: data.memberUids,
                  createdAt: toDate(data.createdAt),
                  createdBy: data.createdBy,
                } as TSpace,
                data,
              };
            })
            // Filter out spaces hidden in this app (unless isGlobal)
            .filter(({ data }) => {
              // Global spaces are always visible
              if (data.isGlobal) return true;
              // Check if this app is in the hidden list
              if (data.hiddenInApps?.includes(config.appId)) return false;
              return true;
            })
            .map(({ space }) => space);

          setUserSpaces(spaces);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error(`Error subscribing to ${config.collectionName}:`, err);
          setError(err);
          // Still set loading to false so the app can function with personal space
          setUserSpaces([]);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    }, [userId]);

    // All spaces including virtual personal space
    const spaces = useMemo(
      () => [personalSpace, ...userSpaces],
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
          createdBy: userId,
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
