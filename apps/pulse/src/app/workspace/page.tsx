'use client';

import { useWorkspaceAuth, SuiteGuard } from '@ainexsuite/auth';
import { WorkspaceLayout, WorkspaceLoadingScreen } from '@ainexsuite/ui';
import { DigitalClock } from '@/components/digital-clock';
import { SpaceSwitcher } from '@/components/spaces';

function PulseWorkspaceContent() {
  const { user, isLoading, isReady, handleSignOut } = useWorkspaceAuth();

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
        </div>
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
