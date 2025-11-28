'use client';

import { useState } from 'react';
import { useWorkspaceAuth } from '@ainexsuite/auth';
import { WorkspaceLayout, WorkspaceLoadingScreen } from '@ainexsuite/ui';
import { NoteBoard } from '@/components/notes/note-board';
import { WorkspaceInsights } from '@/components/notes/workspace-insights';
import { SpaceSwitcher } from '@/components/spaces';

export default function NotesWorkspace() {
  const { user, isLoading, isReady, handleSignOut } = useWorkspaceAuth();
  const [mobileInsightsExpanded, setMobileInsightsExpanded] = useState(false);

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
      {/* Two-column layout matching Journey: max-w-7xl, mx-auto, gap-8 */}
      <div className="max-w-7xl mx-auto">
        {/* Mobile: Condensed AI Insights at top (hidden on xl+) */}
        <div className="xl:hidden mb-4">
          {mobileInsightsExpanded ? (
            <WorkspaceInsights
              variant="sidebar"
              onExpand={() => setMobileInsightsExpanded(false)}
            />
          ) : (
            <WorkspaceInsights
              variant="condensed"
              onExpand={() => setMobileInsightsExpanded(true)}
            />
          )}
        </div>

        <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start xl:gap-8">
          {/* Left: Notes Content */}
          <div className="space-y-6">
            {/* Space Switcher above note composer */}
            <div className="flex items-center gap-4">
              <SpaceSwitcher />
            </div>
            <NoteBoard />
          </div>

          {/* Right: AI Insights Sidebar (visible on xl screens) */}
          <div className="sticky top-28 hidden h-fit flex-col gap-6 xl:flex">
            <WorkspaceInsights variant="sidebar" />
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
