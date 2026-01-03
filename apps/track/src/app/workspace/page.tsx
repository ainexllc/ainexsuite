'use client';

import { useState } from 'react';
import { useWorkspaceAuth } from '@ainexsuite/auth';
import { WorkspacePageLayout } from '@ainexsuite/ui';
import { TrackComposer } from '@/components/track-composer';
import { TrackToolbar } from '@/components/track-toolbar';
import { SubscriptionGrid } from '@/components/subscription-grid';
import { SubscriptionList } from '@/components/subscription-list';
import { SubscriptionCalendar } from '@/components/subscription-calendar';
import { SubscriptionInsights } from '@/components/SubscriptionInsights';
import { SubscriptionProvider } from '@/components/providers/subscription-provider';
import type { ViewType } from '@/types';

// Wrapper to provide context
export default function WorkspacePage() {
  const { user } = useWorkspaceAuth();
  if (!user) return null;

  return (
    <SubscriptionProvider>
      <WorkspaceContent />
    </SubscriptionProvider>
  );
}

function WorkspaceContent() {
  const [view, setView] = useState<ViewType>('grid');

  return (
    <WorkspacePageLayout
      insightsBanner={<SubscriptionInsights />}
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