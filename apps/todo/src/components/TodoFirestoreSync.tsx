'use client';

import { useEffect } from 'react';
import { useAuth } from '@ainexsuite/auth';
import { useTodoStore } from '../lib/store';
import {
  subscribeToUserTodoSpaces,
  subscribeToSpaceTasks,
  subscribeToAllUserTasks,
  subscribeToPersonalTasks
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

    // Handle different space types:
    // - "all": Get all tasks where user is an assignee
    // - "personal": Get tasks for the virtual "My Todos" personal space
    // - other: Get tasks for the specific space
    let unsubTasks: () => void;

    if (currentSpaceId === 'all') {
      unsubTasks = subscribeToAllUserTasks(user.uid, setTasks);
      const unsubMyTasks = subscribeToAllUserTasks(user.uid, setMyTasks);
      return () => {
        unsubTasks();
        unsubMyTasks();
      };
    } else if (currentSpaceId === 'personal') {
      unsubTasks = subscribeToPersonalTasks(user.uid, setTasks);
    } else {
      unsubTasks = subscribeToSpaceTasks(currentSpaceId, setTasks);
    }

    return () => unsubTasks();
  }, [user, currentSpaceId, setTasks, setMyTasks]);

  return null;
}
