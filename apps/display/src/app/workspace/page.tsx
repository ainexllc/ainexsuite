'use client';

import { useWorkspaceAuth } from '@ainexsuite/auth';
import { WorkspacePageLayout } from '@ainexsuite/ui';
import { DigitalClock } from '@/components/digital-clock';
import { WelcomePanel, useWelcomePanel } from '@/components/welcome-panel';
import { HelpCircle } from 'lucide-react';
import { usePulseStore } from '@/lib/store';

export default function PulseWorkspacePage() {
  const { user } = useWorkspaceAuth();
  const { showWelcome, dismissWelcome, resetWelcome } = useWelcomePanel();
  const { spaces, currentSpaceId, setCurrentSpace } = usePulseStore();

  if (!user) return null;

  // Map spaces for WorkspacePageLayout
  const spaceItems = spaces.map((space) => ({
    id: space.id,
    name: space.name,
    type: space.type as 'personal' | 'family' | 'work' | 'couple' | 'buddy' | 'squad' | 'project',
  }));

  return (
    <WorkspacePageLayout
      insightsBanner={showWelcome ? <WelcomePanel onDismiss={dismissWelcome} /> : null}
      spaces={{
        items: spaceItems,
        currentSpaceId: currentSpaceId || 'personal',
        onSpaceChange: setCurrentSpace,
      }}
      composerActions={
        !showWelcome ? (
          <button
            onClick={resetWelcome}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/10 rounded-lg transition-colors"
            title="Show help & features"
          >
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Help</span>
          </button>
        ) : null
      }
      maxWidth="default"
    >
      <DigitalClock />
    </WorkspacePageLayout>
  );
}