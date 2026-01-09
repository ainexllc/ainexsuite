'use client';

import { useMemo, useEffect } from 'react';
import { useWorkspaceAuth } from '@ainexsuite/auth';
import {
  WorkspacePageLayout,
  InlineSpacePicker,
} from '@ainexsuite/ui';
import type { SpaceType } from '@ainexsuite/types';
import { DigitalClock } from '@/components/digital-clock';
import { WelcomePanel, useWelcomePanel } from '@/components/welcome-panel';
import { HelpCircle } from 'lucide-react';
import { usePulseStore } from '@/lib/store';
import { SpaceService } from '@/lib/space-service';
import { useAuth } from '@ainexsuite/auth';

export default function MosaicWorkspacePage() {
  const { user } = useWorkspaceAuth();
  const { user: authUser } = useAuth();
  const { showWelcome, dismissWelcome, resetWelcome } = useWelcomePanel();
  const { spaces, currentSpaceId, setCurrentSpace, setSpaces } = usePulseStore();

  // Subscribe to spaces from Firestore
  useEffect(() => {
    if (!authUser) return;

    const unsubscribe = SpaceService.subscribeToSpaces(authUser.uid, (firestoreSpaces) => {
      setSpaces(firestoreSpaces);
    });

    return () => unsubscribe();
  }, [authUser, setSpaces]);

  // Get current space for InlineSpacePicker
  const currentSpace = useMemo(() => {
    if (currentSpaceId === 'personal') {
      return { id: 'personal', name: 'My Display', type: 'personal' as SpaceType };
    }
    const space = spaces.find((s) => s.id === currentSpaceId);
    return space ? { id: space.id, name: space.name, type: space.type as SpaceType } : null;
  }, [spaces, currentSpaceId]);

  // Map spaces for InlineSpacePicker
  const spaceItems = useMemo(() => {
    return [
      { id: 'personal', name: 'My Mosaic', type: 'personal' as SpaceType },
      ...spaces.map((space) => ({
        id: space.id,
        name: space.name,
        type: space.type as SpaceType,
      })),
    ];
  }, [spaces]);

  if (!user) return null;

  return (
    <WorkspacePageLayout
      className="pt-[17px]"
      insightsBanner={showWelcome ? <WelcomePanel onDismiss={dismissWelcome} /> : null}
      composerActions={
        <>
          <InlineSpacePicker
            spaces={spaceItems}
            currentSpace={currentSpace}
            onSpaceChange={setCurrentSpace}
          />
          {!showWelcome && (
            <button
              onClick={resetWelcome}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/10 rounded-lg transition-colors"
              title="Show help & features"
            >
              <HelpCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Help</span>
            </button>
          )}
        </>
      }
      maxWidth="default"
    >
      <DigitalClock />
    </WorkspacePageLayout>
  );
}
