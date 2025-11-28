'use client';

import { useWorkspaceAuth } from '@ainexsuite/auth';
import { WorkspaceLayout, WorkspaceLoadingScreen } from '@ainexsuite/ui';
import { WorkflowCanvas } from '@/components/workflow-canvas/WorkflowCanvas';
import { SpaceSwitcher } from '@/components/spaces';

export default function WorkspacePage() {
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
      searchPlaceholder="Search workflows..."
      appName="Workflow"
    >
      {/* Header with Space Switcher */}
      <div className="flex items-center gap-4 mb-6">
        <SpaceSwitcher />
      </div>

      {/* Workflow Canvas */}
      <div className="h-[calc(100vh-200px)] min-h-[600px] rounded-xl border border-outline-subtle bg-surface-elevated/50 backdrop-blur overflow-hidden relative shadow-inner">
        <WorkflowCanvas />
      </div>
    </WorkspaceLayout>
  );
}