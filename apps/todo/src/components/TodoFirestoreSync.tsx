'use client';

import { useEffect } from 'react';
import { useAuth } from '@ainexsuite/auth';
import { useTodoStore } from '../lib/store';
import {
  subscribeToSpaceTasks,
  subscribeToPersonalTasks,
  subscribeToSpaceGroups
} from '../lib/firebase-service';

/**
 * Syncs tasks and groups from Firestore based on current space.
 * Spaces are managed by SpacesProvider (unified 'spaces' collection).
 */
export function TodoFirestoreSync() {
  const { user } = useAuth();
  const { currentSpaceId, setTasks, setGroups } = useTodoStore();

  // Sync Tasks for Current Space
  useEffect(() => {
    if (!user || !currentSpaceId) return;

    // Handle different space types:
    // - "personal": Get tasks for the virtual "My Todos" personal space
    // - other: Get tasks for the specific space
    let unsubTasks: () => void;

    if (currentSpaceId === 'personal') {
      unsubTasks = subscribeToPersonalTasks(user.uid, setTasks);
    } else {
      unsubTasks = subscribeToSpaceTasks(currentSpaceId, user.uid, setTasks);
    }

    return () => unsubTasks();
  }, [user, currentSpaceId, setTasks]);

  // Sync Groups for Current Space
  useEffect(() => {
    if (!user || !currentSpaceId) return;

    const unsubGroups = subscribeToSpaceGroups(currentSpaceId, user.uid, setGroups);

    return () => unsubGroups();
  }, [user, currentSpaceId, setGroups]);

  return null;
}
