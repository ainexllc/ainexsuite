'use client';

import { useState, useMemo } from 'react';
import { useWorkspaceAuth } from '@ainexsuite/auth';
import {
  WorkspacePageLayout,
  SpaceTabSelector,
} from '@ainexsuite/ui';
import { useSpaces } from '@/components/providers/spaces-provider';
import { TrackComposer } from '@/components/track-composer';
import { TrackToolbar } from '@/components/track-toolbar';
import { SubscriptionGrid } from '@/components/subscription-grid';
import { SubscriptionList } from '@/components/subscription-list';
import { SubscriptionCalendar } from '@/components/subscription-calendar';
import type { ViewType } from '@/types';

export default function WorkspacePage() {
  const { user } = useWorkspaceAuth();
  const { spaces, currentSpaceId, setCurrentSpace } = useSpaces();
  const [view, setView] = useState<ViewType>('grid');

  const spaceItems = useMemo(
    () => spaces.map((s) => ({ id: s.id, name: s.name, type: s.type })),
    [spaces]
  );

  const currentSpaceName = useMemo(() => {
    const space = spaces.find((s) => s.id === currentSpaceId);
    return space?.name || 'Personal';
  }, [spaces, currentSpaceId]);

  if (!user) return null;

  return (
    <WorkspacePageLayout
      className="pt-[17px]"
      spaceSelector={
        spaceItems.length > 1 ? (
          <SpaceTabSelector
            spaces={spaceItems}
            currentSpaceId={currentSpaceId}
            onSpaceChange={setCurrentSpace}
          />
        ) : undefined
      }
      composer={<TrackComposer placeholder={`Add a subscription for ${currentSpaceName}...`} />}
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