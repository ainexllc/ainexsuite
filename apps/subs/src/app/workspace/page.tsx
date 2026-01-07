'use client';

import { useState } from 'react';
import { useWorkspaceAuth } from '@ainexsuite/auth';
import { WorkspacePageLayout } from '@ainexsuite/ui';
import { TrackComposer } from '@/components/track-composer';
import { TrackToolbar } from '@/components/track-toolbar';
import { SubscriptionGrid } from '@/components/subscription-grid';
import { SubscriptionList } from '@/components/subscription-list';
import { SubscriptionCalendar } from '@/components/subscription-calendar';
import type { ViewType } from '@/types';

export default function WorkspacePage() {
  const { user } = useWorkspaceAuth();
  const [view, setView] = useState<ViewType>('grid');

  if (!user) return null;

  return (
    <WorkspacePageLayout
      composer={<TrackComposer />}
      toolbar={
        <TrackToolbar
          viewMode={view}
          onViewModeChange={(v) => setView(v)}
        />
      }
      maxWidth="default"
    >
      {view === 'grid' && <SubscriptionGrid />}
      {view === 'list' && <SubscriptionList />}
      {view === 'calendar' && <SubscriptionCalendar />}
    </WorkspacePageLayout>
  );
}