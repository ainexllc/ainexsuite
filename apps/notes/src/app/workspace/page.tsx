'use client';

import { useWorkspaceAuth } from '@ainexsuite/auth';
import { WorkspaceLayout, WorkspaceLoadingScreen } from '@ainexsuite/ui';
import { NoteBoard } from '@/components/notes/note-board';
import { WorkspaceInsights } from '@/components/notes/workspace-insights';
import { SpaceSwitcher } from '@/components/spaces';

export default function NotesWorkspace() {
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
      searchPlaceholder="Search notes..."
      appName="NOTES"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* AI Insights Banner - Full Width at Top */}
        <WorkspaceInsights variant="sidebar" />

        {/* Space Switcher */}
        <div className="flex items-center gap-4">
          <SpaceSwitcher />
        </div>

        {/* Notes Content - Full Width */}
        <NoteBoard />
      </div>
    </WorkspaceLayout>
  );
}
