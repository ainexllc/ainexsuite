'use client';

import { useEffect } from 'react';
import { useAuth } from '@ainexsuite/auth';
import { useTodoStore } from '../lib/store';
import {
  subscribeToUserTodoSpaces,
  subscribeToSpaceTasks,
  subscribeToAllUserTasks
} from '../lib/firebase-service';

export function TodoFirestoreSync() {
  const { user } = useAuth();
  const {
    currentSpaceId,
    setSpaces,
    setTasks,
    setMyTasks
  } = useTodoStore();

  // Sync Spaces (User Level)
  useEffect(() => {
    if (!user) return;

    const unsubSpaces = subscribeToUserTodoSpaces(user.uid, setSpaces);

    return () => {
      unsubSpaces();
    };
  }, [user, setSpaces]);

  // Sync Tasks for Current Space (or all user's tasks if "All Spaces")
  useEffect(() => {
    if (!user || !currentSpaceId) return;

    // When viewing "All Spaces", get all tasks where user is an assignee
    // Otherwise, get tasks for the specific space
    const unsubTasks = currentSpaceId === 'all'
      ? subscribeToAllUserTasks(user.uid, setTasks)
      : subscribeToSpaceTasks(currentSpaceId, setTasks);

    // Also update myTasks with the same data when viewing "All Spaces"
    if (currentSpaceId === 'all') {
      const unsubMyTasks = subscribeToAllUserTasks(user.uid, setMyTasks);
      return () => {
        unsubTasks();
        unsubMyTasks();
      };
    }

    return () => unsubTasks();
  }, [user, currentSpaceId, setTasks, setMyTasks]);

  return null;
}
