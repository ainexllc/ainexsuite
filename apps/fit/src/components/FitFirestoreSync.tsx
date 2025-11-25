'use client';

import { useEffect } from 'react';
import { useAuth } from '@ainexsuite/auth';
import { useFitStore } from '../lib/store';
import { 
  subscribeToUserFitSpaces, 
  subscribeToSpaceWorkouts, 
  subscribeToSpaceChallenges 
} from '../lib/firebase-service';
import { FitSpace } from '../types/models';

export function FitFirestoreSync() {
  const { user } = useAuth();
  const { 
    currentSpaceId, 
    setSpaces, 
    setWorkouts, 
    setChallenges,
    addSpace 
  } = useFitStore();

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToUserFitSpaces(user.uid, (spaces) => {
      setSpaces(spaces);

      // Auto-create personal space if none exists
      if (spaces.length === 0) {
        const defaultSpace: FitSpace = {
          id: `fit_space_${user.uid}_personal`,
          name: 'My Workouts',
          type: 'personal',
          members: [{
            uid: user.uid,
            displayName: user.displayName || 'Me',
            photoURL: user.photoURL || undefined,
            role: 'admin',
            joinedAt: new Date().toISOString()
          }],
          memberUids: [user.uid],
          createdAt: new Date().toISOString(),
          createdBy: user.uid,
        };
        addSpace(defaultSpace).catch(err => 
          console.error('Failed to create default space:', err)
        );
      }
    });
    return () => unsubscribe();
  }, [user, setSpaces, addSpace]);

  useEffect(() => {
    if (!currentSpaceId) return;

    const unsubWorkouts = subscribeToSpaceWorkouts(currentSpaceId, setWorkouts);
    const unsubChallenges = subscribeToSpaceChallenges(currentSpaceId, setChallenges);

    return () => {
      unsubWorkouts();
      unsubChallenges();
    };
  }, [currentSpaceId, setWorkouts, setChallenges]);

  return null;
}
