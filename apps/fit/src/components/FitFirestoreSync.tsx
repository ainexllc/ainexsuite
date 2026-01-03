'use client';

import { useEffect } from 'react';
import { useAuth } from '@ainexsuite/auth';
import { useFitStore } from '../lib/store';

/**
 * Component that handles Firestore synchronization for the Fit app.
 * Currently a placeholder - will be expanded when workout/nutrition data is added.
 */
export function FitFirestoreSync() {
  const { user } = useAuth();
  const { currentSpaceId } = useFitStore();

  useEffect(() => {
    if (!user || !currentSpaceId) return;

    // TODO: Subscribe to workouts, meals, body metrics, etc.
    // This will be implemented when we move the data services from Health app

  }, [user, currentSpaceId]);

  return null;
}
