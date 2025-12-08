'use client';

import { useEffect, useMemo, useCallback, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@ainexsuite/auth';
import { WorkspacePageLayout } from '@ainexsuite/ui';
import { DashboardView } from '@/components/dashboard/dashboard-view';
import { JournalInsights } from '@/components/journal/journal-insights';
import { JournalComposer } from '@/components/journal/journal-composer';
import { useSpaces } from '@/components/providers/spaces-provider';
import { getUserJournalEntries } from '@/lib/firebase/firestore';
import type { JournalEntry } from '@ainexsuite/types';

export default function WorkspacePage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const dateFilter = searchParams.get('date');
  const { spaces, currentSpaceId, setCurrentSpace } = useSpaces();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load entries for insights
  const loadEntries = useCallback(async () => {
    if (!user) return;
    try {
      const { entries: fetchedEntries } = await getUserJournalEntries(user.uid, {
        limit: 100,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        spaceId: currentSpaceId,
      });
      setEntries(fetchedEntries);
    } catch (err) {
      console.error('Failed to load entries for insights:', err);
    }
  }, [user, currentSpaceId]);

  // Load entries on mount and when space changes
  useEffect(() => {
    void loadEntries();
  }, [loadEntries, refreshTrigger]);

  // Handle entry created - trigger refresh
  const handleEntryCreated = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Convert spaces to SpaceItem format
  const spacesConfig = useMemo(() => ({
    items: spaces.map((space) => ({
      id: space.id,
      name: space.name,
      type: space.type,
      color: space.type === 'personal' ? '#f97316' : '#8b5cf6',
    })),
    currentSpaceId,
    onSpaceChange: setCurrentSpace,
  }), [spaces, currentSpaceId, setCurrentSpace]);

  if (!user) {
    return null;
  }

  return (
    <WorkspacePageLayout
      insightsBanner={<JournalInsights entries={entries} />}
      composer={<JournalComposer onEntryCreated={handleEntryCreated} />}
      spaces={spacesConfig}
    >
      <DashboardView dateFilter={dateFilter || undefined} />
    </WorkspacePageLayout>
  );
}