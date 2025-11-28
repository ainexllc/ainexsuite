'use client';

import { useWorkspaceAuth, SuiteGuard } from '@ainexsuite/auth';
import { WorkspaceLayout, WorkspaceLoadingScreen } from '@ainexsuite/ui';
import { DigitalClock } from '@/components/digital-clock';
import { SpaceSwitcher } from '@/components/spaces';
import { WelcomePanel, useWelcomePanel } from '@/components/welcome-panel';
import { HelpCircle } from 'lucide-react';

function PulseWorkspaceContent() {
  const { user, isLoading, isReady, handleSignOut } = useWorkspaceAuth();
  const { showWelcome, dismissWelcome, resetWelcome } = useWelcomePanel();

  // Show standardized loading screen
  if (isLoading) {
    return <WorkspaceLoadingScreen />;
  }

  // Return null while redirecting
  if (!isReady || !user) {
    return null;
  }

  return (
    <WorkspaceLayout
      user={user}
      onSignOut={handleSignOut}
      searchPlaceholder="Search health data..."
      appName="Pulse"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <SpaceSwitcher />
          {!showWelcome && (
            <button
              onClick={resetWelcome}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Show help & features"
            >
              <HelpCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Help</span>
            </button>
          )}
        </div>
        {showWelcome && <WelcomePanel onDismiss={dismissWelcome} />}
        <DigitalClock />
      </div>
    </WorkspaceLayout>
  );
}

export default function PulseWorkspacePage() {
  return (
    <SuiteGuard appName="pulse">
      <PulseWorkspaceContent />
    </SuiteGuard>
  );
}
