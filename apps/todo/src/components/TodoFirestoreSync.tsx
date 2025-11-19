'use client';

import { useEffect } from 'react';
import { useAuth } from '@ainexsuite/auth';
import { useTodoStore } from '../lib/store';
import { 
  subscribeToUserTodoSpaces, 
  subscribeToSpaceTasks, 
  subscribeToMyTasks 
} from '../lib/firebase-service';

export function TodoFirestoreSync() {
  const { user } = useAuth();
  const { 
    currentSpaceId, 
    setSpaces, 
    setTasks, 
    setMyTasks 
  } = useTodoStore();

  // Sync Spaces & My Tasks (User Level)
  useEffect(() => {
    if (!user) return;

    const unsubSpaces = subscribeToUserTodoSpaces(user.uid, setSpaces);
    const unsubMyTasks = subscribeToMyTasks(user.uid, setMyTasks);

    return () => {
      unsubSpaces();
      unsubMyTasks();
    };
  }, [user, setSpaces, setMyTasks]);

  // Sync Tasks for Current Space
  useEffect(() => {
    if (!currentSpaceId) return;

    const unsubTasks = subscribeToSpaceTasks(currentSpaceId, setTasks);

    return () => unsubTasks();
  }, [currentSpaceId, setTasks]);

  return null;
}
