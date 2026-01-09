'use client';

import { useEffect } from 'react';
import { useAuth } from '@ainexsuite/auth';
import { useTodoStore } from '../lib/store';
import {
  subscribeToSpaceTasks,
  subscribeToPersonalTasks
} from '../lib/firebase-service';

/**
 * Syncs tasks from Firestore based on current space.
 * Spaces are managed by SpacesProvider (unified 'spaces' collection).
 */
export function TodoFirestoreSync() {
  const { user } = useAuth();
  const { currentSpaceId, setTasks } = useTodoStore();

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

  return null;
}
