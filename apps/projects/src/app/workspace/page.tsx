'use client';

import { useState } from 'react';
import { useWorkspaceAuth } from '@ainexsuite/auth';
import { WorkspaceLayout, WorkspaceLoadingScreen } from '@ainexsuite/ui';
import { LayoutGrid, ArrowLeft } from 'lucide-react';
import { ProjectsBoard } from '@/components/projects-board';
import { ProjectDashboard } from '@/components/project-dashboard';
import { SpaceSwitcher } from '@/components/spaces';

export default function WorkspacePage() {
  const { user, isLoading, isReady, handleSignOut } = useWorkspaceAuth();
  const [viewMode, setViewMode] = useState<'dashboard' | 'whiteboard'>('dashboard');

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
      searchPlaceholder="Search projects..."
      appName="Projects"
    >
      {/* Header with Space Switcher and View Toggle */}
        <div className="flex items-center justify-between mb-4">
          <SpaceSwitcher />
          <div className="flex items-center gap-3">
          {viewMode === 'whiteboard' ? (
            <button
              onClick={() => setViewMode('dashboard')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-elevated border border-border hover:bg-surface-hover transition-colors text-sm font-medium text-text-secondary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
          ) : (
            <button
              onClick={() => setViewMode('whiteboard')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-colors text-sm font-medium"
            >
              <LayoutGrid className="h-4 w-4" />
              Open Whiteboard
            </button>
          )}
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[600px]">
          {viewMode === 'whiteboard' ? (
            <div className="h-[calc(100vh-200px)] w-full">
              <ProjectsBoard />
            </div>
          ) : (
            <ProjectDashboard onOpenWhiteboard={() => setViewMode('whiteboard')} />
          )}
        </div>
    </WorkspaceLayout>
  );
}