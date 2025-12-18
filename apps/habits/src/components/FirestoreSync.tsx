'use client';

import { useEffect } from 'react';
import { useAuth } from '@ainexsuite/auth';
import { useGrowStore } from '../lib/store';
import { 
  subscribeToUserSpaces, 
  subscribeToSpaceHabits, 
  subscribeToSpaceQuests,
  subscribeToCompletions,
  subscribeToUserNotifications
} from '../lib/firebase-service';

export function FirestoreSync() {
  const { user } = useAuth();
  const { 
    currentSpaceId, 
    setSpaces, 
    setHabits, 
    setQuests, 
    setCompletions,
    setNotifications
  } = useGrowStore();

  // Sync Spaces & Notifications (User Level)
  useEffect(() => {
    if (!user) return;

    const unsubSpaces = subscribeToUserSpaces(user.uid, (spaces) => {
      setSpaces(spaces);
    });

    const unsubNotifs = subscribeToUserNotifications(user.uid, (notifs) => {
      setNotifications(notifs);
    });

    return () => {
      unsubSpaces();
      unsubNotifs();
    };
  }, [user, setSpaces, setNotifications]);

  // Sync Habits, Quests, Completions for Current Space
  useEffect(() => {
    if (!currentSpaceId) return;

    const unsubHabits = subscribeToSpaceHabits(currentSpaceId, (habits) => {
      setHabits(habits);
    });

    const unsubQuests = subscribeToSpaceQuests(currentSpaceId, (quests) => {
      setQuests(quests);
    });

    // Note: In production, completions might be too large to sync all at once.
    const unsubCompletions = subscribeToCompletions(currentSpaceId, (completions) => {
      setCompletions(completions);
    });

    return () => {
      unsubHabits();
      unsubQuests();
      unsubCompletions();
    };
  }, [currentSpaceId, setHabits, setQuests, setCompletions]);

  return null; // This component renders nothing, just logic
}
