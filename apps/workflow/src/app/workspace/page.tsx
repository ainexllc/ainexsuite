'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useWorkspaceAuth, useAuth } from '@ainexsuite/auth';
import { WorkspacePageLayout, InlineSpacePicker, SpaceManagementModal } from '@ainexsuite/ui';
import type { SpaceType } from '@ainexsuite/types';
import { WorkflowCanvas } from '@/components/workflow-canvas/WorkflowCanvas';
import { MemberManager } from '@/components/spaces/MemberManager';
import { useWorkflowStore } from '@/lib/store';
import { SpaceService } from '@/lib/space-service';

export default function WorkspacePage() {
  const { user } = useWorkspaceAuth();
  const { user: authUser } = useAuth();
  const { spaces, currentSpaceId, setCurrentSpace, setSpaces, addSpace, updateSpace, deleteSpace } = useWorkflowStore();

  // Space management modals
  const [showMemberManager, setShowMemberManager] = useState(false);
  const [showSpaceManagement, setShowSpaceManagement] = useState(false);

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
      return { id: 'personal', name: 'My Workflows', type: 'personal' as SpaceType };
    }
    const space = spaces.find((s) => s.id === currentSpaceId);
    return space ? { id: space.id, name: space.name, type: space.type as SpaceType } : null;
  }, [spaces, currentSpaceId]);

  // Map spaces for InlineSpacePicker
  const spaceItems = useMemo(() => {
    return [
      { id: 'personal', name: 'My Workflows', type: 'personal' as SpaceType },
      ...spaces.map((space) => ({
        id: space.id,
        name: space.name,
        type: space.type as SpaceType,
      })),
    ];
  }, [spaces]);

  // Map spaces to format expected by SpaceManagementModal
  const userSpaces = useMemo(() => {
    return spaces.map((s) => ({
      id: s.id,
      name: s.name,
      type: s.type as SpaceType,
      memberCount: s.memberUids?.length || 1,
      isOwner: s.createdBy === user?.uid,
    }));
  }, [spaces, user?.uid]);

  // Space management handlers
  const handleJoinGlobalSpace = useCallback(async (type: SpaceType, _hiddenInApps: string[]) => {
    if (!user) return;
    const name = type.charAt(0).toUpperCase() + type.slice(1);
    const newSpace = {
      id: crypto.randomUUID(),
      name,
      type,
      members: [],
      memberUids: [user.uid],
      createdAt: new Date().toISOString(),
      createdBy: user.uid,
    };
    await addSpace(newSpace);
  }, [user, addSpace]);

  const handleLeaveGlobalSpace = useCallback(async (spaceId: string) => {
    await deleteSpace(spaceId);
  }, [deleteSpace]);

  const handleCreateCustomSpace = useCallback(async (name: string, _hiddenInApps: string[]) => {
    if (!user) return;
    const newSpace = {
      id: crypto.randomUUID(),
      name,
      type: 'project' as SpaceType,
      members: [],
      memberUids: [user.uid],
      createdAt: new Date().toISOString(),
      createdBy: user.uid,
    };
    await addSpace(newSpace);
  }, [user, addSpace]);

  const handleRenameCustomSpace = useCallback(async (spaceId: string, name: string) => {
    await updateSpace(spaceId, { name });
  }, [updateSpace]);

  const handleDeleteCustomSpace = useCallback(async (spaceId: string) => {
    await deleteSpace(spaceId);
  }, [deleteSpace]);

  if (!user) return null;

  return (
    <>
      <WorkspacePageLayout
        maxWidth="full"
        composerActions={
          <InlineSpacePicker
            spaces={spaceItems}
            currentSpace={currentSpace}
            onSpaceChange={setCurrentSpace}
            onManagePeople={() => setShowMemberManager(true)}
            onManageSpaces={() => setShowSpaceManagement(true)}
          />
        }
      >
        {/* Workflow Canvas */}
        <div className="h-[calc(100vh-200px)] min-h-[600px] rounded-xl border border-outline-subtle bg-surface-elevated/50 backdrop-blur overflow-hidden relative shadow-inner">
          <WorkflowCanvas />
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
