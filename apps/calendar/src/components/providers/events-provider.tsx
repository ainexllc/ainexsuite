'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from 'react';
import { useAuth } from '@ainexsuite/auth';
import { EventsService } from '@/lib/events';
import { CalendarEvent } from '@/types/event';

type EventsContextValue = {
  events: CalendarEvent[];
  loading: boolean;
  error: Error | null;
  refreshEvents: () => Promise<void>;
};

const EventsContext = createContext<EventsContextValue | null>(null);

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const userId = user?.uid ?? null;

  const fetchEvents = useCallback(async () => {
    if (!userId) {
      setEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fetchedEvents = await EventsService.getEvents(userId);
      setEvents(fetchedEvents);
    } catch (e) {
      console.error("Failed to fetch events:", e);
      setError(e instanceof Error ? e : new Error("Failed to fetch events"));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Fetch events on mount and when user changes
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const value = useMemo<EventsContextValue>(
    () => ({
      events,
      loading,
      error,
      refreshEvents: fetchEvents,
    }),
    [events, loading, error, fetchEvents]
  );

  return (
    <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
}
