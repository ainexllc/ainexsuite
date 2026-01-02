'use client';

import { useState, useCallback } from 'react';
import {
  collection,
  addDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db, auth } from '@ainexsuite/firebase';
import type { CalendarEventDraft, UseCalendarActionResult } from '../types';

const EVENTS_COLLECTION = 'calendar_events';

/** Event colors based on source app */
const APP_COLORS: Record<string, string> = {
  notes: '#eab308', // Yellow
  journal: '#f97316', // Orange
  todo: '#8b5cf6', // Purple
  health: '#10b981', // Emerald
  habits: '#14b8a6', // Teal
  projects: '#6366f1', // Indigo
  default: '#3b82f6', // Blue
};

/**
 * React hook for adding detected dates to the calendar
 *
 * @example
 * ```tsx
 * const { addToCalendar, loading, addedEventIds } = useCalendarAction();
 *
 * const handleAddEvent = async (draft: CalendarEventDraft) => {
 *   const eventId = await addToCalendar(draft);
 *   if (eventId) {
 *     toast.success('Added to calendar!');
 *   }
 * };
 * ```
 */
export function useCalendarAction(): UseCalendarActionResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [addedEventIds, setAddedEventIds] = useState<string[]>([]);

  const addToCalendar = useCallback(
    async (draft: CalendarEventDraft): Promise<string | null> => {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        setError(new Error('User not authenticated'));
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const eventsRef = collection(db, 'users', userId, EVENTS_COLLECTION);

        // Get color based on source app
        const color = APP_COLORS[draft.source.app] || APP_COLORS.default;

        // Create the event document
        const docData = {
          userId,
          title: draft.title,
          description: draft.description || `Added from ${draft.source.app}`,
          startTime: Timestamp.fromDate(draft.startTime),
          endTime: Timestamp.fromDate(draft.endTime),
          allDay: draft.allDay,
          type: draft.type,
          color,
          // Store source info for cross-app linking
          source: {
            app: draft.source.app,
            entryId: draft.source.entryId || null,
            entryType: draft.source.entryType || null,
            detectedText: draft.detectedText,
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        const docRef = await addDoc(eventsRef, docData);

        setAddedEventIds((prev) => [...prev, docRef.id]);
        return docRef.id;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to add event');
        setError(error);
        console.error('Failed to add calendar event:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    addToCalendar,
    loading,
    error,
    addedEventIds,
  };
}

/**
 * Check if an event was already added to calendar
 * (based on detected text ID)
 */
export function useIsEventAdded(
  detectedDateId: string,
  addedEventIds: string[]
): boolean {
  // In a more complex implementation, we'd track which detected dates
  // have been converted to events. For now, we use a simple check.
  return addedEventIds.some((id) => id.includes(detectedDateId));
}
