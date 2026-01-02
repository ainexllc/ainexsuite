'use client';

import { useEffect } from 'react';
import { useAuth } from '@ainexsuite/auth';
import { useGrowStore } from '../lib/store';
import { useSpaces } from './providers/spaces-provider';
import {
  subscribeToSpaceHabits,
  subscribeToSpaceQuests,
  subscribeToCompletions,
  subscribeToUserNotifications,
} from '../lib/firebase-service';

export function FirestoreSync() {
  const { user } = useAuth();
  const { currentSpaceId } = useSpaces();

  // Note: Permission error handler removed to prevent logout loops
  // Permission errors now just log warnings instead of triggering logout
  // Users will need to manually re-login if their session is truly invalid

  const {
    setHabits,
    setQuests,
    setCompletions,
    setNotifications
  } = useGrowStore();

  // Sync Notifications (User Level)
  useEffect(() => {
    if (!user) return;

    const unsubNotifs = subscribeToUserNotifications(user.uid, (notifs) => {
      setNotifications(notifs);
    });

    return () => {
      unsubNotifs();
    };
  }, [user, setNotifications]);

  // Sync Habits, Quests, Completions for Current Space
  useEffect(() => {
    if (!currentSpaceId || !user) return;

    // Pass userId for personal space queries to match security rules
    const unsubHabits = subscribeToSpaceHabits(currentSpaceId, (habits) => {
      setHabits(habits);
    }, user.uid);

    // Quests are team features - skip for personal space (no Firestore document exists)
    const unsubQuests = currentSpaceId !== 'personal'
      ? subscribeToSpaceQuests(currentSpaceId, (quests) => {
          setQuests(quests);
        })
      : () => { setQuests([]); };

    // Note: In production, completions might be too large to sync all at once.
    const unsubCompletions = subscribeToCompletions(currentSpaceId, (completions) => {
      setCompletions(completions);
    }, user.uid);

    return () => {
      unsubHabits();
      if (typeof unsubQuests === 'function') unsubQuests();
      unsubCompletions();
    };
  }, [currentSpaceId, user, setHabits, setQuests, setCompletions]);

  return null; // This component renders nothing, just logic
}
