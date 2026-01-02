'use client';

import { useState, useMemo, useCallback } from 'react';
import { LayoutGrid, ArrowLeft } from 'lucide-react';
import { WorkspacePageLayout, SpaceManagementModal, InlineSpacePicker } from '@ainexsuite/ui';
import type { SpaceType } from '@ainexsuite/types';
import { useWorkspaceAuth } from '@ainexsuite/auth';
import { ProjectsBoard } from '@/components/projects-board';
import { ProjectDashboard } from '@/components/project-dashboard';
import { useSpaces } from '@/components/providers/spaces-provider';
import { MemberManager } from '@/components/spaces/MemberManager';

export default function WorkspacePage() {
  const { user } = useWorkspaceAuth();
  const [viewMode, setViewMode] = useState<'dashboard' | 'whiteboard'>('dashboard');

  // Space management
  const { spaces, currentSpaceId, setCurrentSpace, createSpace, updateSpace, deleteSpace } = useSpaces();
  const [showMemberManager, setShowMemberManager] = useState(false);
  const [showSpaceManagement, setShowSpaceManagement] = useState(false);

  // Get current space for InlineSpacePicker
  const currentSpace = spaces.find((s) => s.id === currentSpaceId) || null;

  // Map spaces to format expected by SpaceManagementModal
  const userSpaces = useMemo(() => {
    return spaces
      .filter((s) => s.id !== 'personal')
      .map((s) => ({
        id: s.id,
        name: s.name,
        type: s.type,
        memberCount: s.memberUids?.length || 1,
        isOwner: ((s as { ownerId?: string; createdBy?: string }).ownerId || (s as { ownerId?: string; createdBy?: string }).createdBy) === user?.uid,
      }));
  }, [spaces, user?.uid]);

  // Space management handlers
  const handleJoinGlobalSpace = useCallback(async (type: SpaceType, _hiddenInApps: string[]) => {
    const name = type.charAt(0).toUpperCase() + type.slice(1);
    await createSpace({ name, type });
  }, [createSpace]);

  const handleLeaveGlobalSpace = useCallback(async (spaceId: string) => {
    await deleteSpace(spaceId);
  }, [deleteSpace]);

  const handleCreateCustomSpace = useCallback(async (name: string, _hiddenInApps: string[]) => {
    await createSpace({ name, type: 'project' });
  }, [createSpace]);

  const handleRenameCustomSpace = useCallback(async (spaceId: string, name: string) => {
    await updateSpace(spaceId, { name });
  }, [updateSpace]);

  const handleDeleteCustomSpace = useCallback(async (spaceId: string) => {
    await deleteSpace(spaceId);
  }, [deleteSpace]);

  return (
    <>
      <WorkspacePageLayout
        composerActions={
          <>
            <InlineSpacePicker
              spaces={spaces}
              currentSpace={currentSpace}
              onSpaceChange={setCurrentSpace}
              onManagePeople={() => setShowMemberManager(true)}
              onManageSpaces={() => setShowSpaceManagement(true)}
            />
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
          </>
        }
        maxWidth="full"
      >
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
      </WorkspacePageLayout>

      {/* Space Management Modals */}
      <MemberManager
        isOpen={showMemberManager}
        onClose={() => setShowMemberManager(false)}
      />

      <SpaceManagementModal
        isOpen={showSpaceManagement}
        onClose={() => setShowSpaceManagement(false)}
        userSpaces={userSpaces}
        onJoinGlobalSpace={handleJoinGlobalSpace}
        onLeaveGlobalSpace={handleLeaveGlobalSpace}
        onCreateCustomSpace={handleCreateCustomSpace}
        onRenameCustomSpace={handleRenameCustomSpace}
        onDeleteCustomSpace={handleDeleteCustomSpace}
      />
    </>
  );
}
