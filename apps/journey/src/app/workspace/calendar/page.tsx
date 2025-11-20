'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@ainexsuite/auth';
import { Loader2 } from 'lucide-react';
import { CalendarView } from '@/components/calendar/calendar-view';
import { getUserJournalEntries } from '@/lib/firebase/firestore';
import type { JournalEntry } from '@ainexsuite/types';

export default function CalendarPage() {
  const { user, loading } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      void loadEntries();
    } else if (!loading) {
      setIsLoadingEntries(false);
    }
  }, [user, loading]);

  const loadEntries = async () => {
    if (!user) return;

    setIsLoadingEntries(true);
    setError(null);
    try {
      const { entries: fetchedEntries } = await getUserJournalEntries(user.uid, {
        limit: 500, // Fetch a reasonable number of entries for calendar view
        sortBy: 'date', // Sort by date for calendar display
        sortOrder: 'asc',
      });
      setEntries(fetchedEntries);
    } catch (err) {
      setError('Failed to load journal entries for the calendar. Please try again.');
    } finally {
      setIsLoadingEntries(false);
    }
  };

  if (loading || isLoadingEntries) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-base">
        <Loader2 className="h-8 w-8 animate-spin text-accent-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-base text-red-400">
        {error}
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-text-primary mb-2">Your Journey Calendar</h2>
        <p className="text-lg text-text-muted">
          Visualize your journal entries across time.
        </p>
      </div>
      <CalendarView entries={entries} />
    </section>
  );
}
