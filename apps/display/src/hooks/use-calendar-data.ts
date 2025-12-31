'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@ainexsuite/firebase';

export type EventType = 'event' | 'task' | 'reminder' | 'holiday';

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  description?: string;
  startTime: Timestamp;
  endTime: Timestamp;
  allDay: boolean;
  color?: string;
  type: EventType;
  location?: string;
}

export interface CalendarData {
  upcomingEvents: CalendarEvent[];
  nextEvent: CalendarEvent | null;
  todayEvents: CalendarEvent[];
  isLoading: boolean;
  error: string | null;
}

// Get time until event in human readable format
export function getTimeUntil(startTime: Timestamp): string {
  const now = new Date();
  const eventTime = startTime.toDate();
  const diffMs = eventTime.getTime() - now.getTime();

  if (diffMs < 0) {
    const minsPast = Math.abs(Math.floor(diffMs / 60000));
    if (minsPast < 60) return `${minsPast}m ago`;
    return `${Math.floor(minsPast / 60)}h ago`;
  }

  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Now';
  if (mins < 60) return `In ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `In ${hours}h`;
  const days = Math.floor(hours / 24);
  return `In ${days}d`;
}

// Format event time for display
export function formatEventTime(event: CalendarEvent): string {
  if (event.allDay) return 'All day';

  const start = event.startTime.toDate();
  return start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function useCalendarData(userId: string | undefined): CalendarData {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Get events starting from now
    const now = Timestamp.now();

    const eventsQuery = query(
      collection(db, 'calendar_events'),
      where('userId', '==', userId),
      where('startTime', '>=', now),
      orderBy('startTime', 'asc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(
      eventsQuery,
      (snapshot) => {
        const eventsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as CalendarEvent[];
        setEvents(eventsData);
        setIsLoading(false);
      },
      (err) => {
        console.error('Error fetching calendar events:', err);
        setError('Failed to load events');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Get today's events
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  const todayEvents = events.filter(e => {
    const eventDate = e.startTime.toDate();
    return eventDate >= todayStart && eventDate < todayEnd;
  });

  const nextEvent = events.length > 0 ? events[0] : null;

  return {
    upcomingEvents: events,
    nextEvent,
    todayEvents,
    isLoading,
    error,
  };
}
