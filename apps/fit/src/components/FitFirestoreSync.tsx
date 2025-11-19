'use client';

import { useEffect } from 'react';
import { useAuth } from '@ainexsuite/auth';
import { useFitStore } from '../lib/store';
import { 
  subscribeToUserFitSpaces, 
  subscribeToSpaceWorkouts, 
  subscribeToSpaceChallenges 
} from '../lib/firebase-service';

export function FitFirestoreSync() {
  const { user } = useAuth();
  const { 
    currentSpaceId, 
    setSpaces, 
    setWorkouts, 
    setChallenges 
  } = useFitStore();

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToUserFitSpaces(user.uid, setSpaces);
    return () => unsubscribe();
  }, [user, setSpaces]);

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
