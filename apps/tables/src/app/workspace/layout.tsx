'use client';

import { useCallback, useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspaceAuth } from '@ainexsuite/auth';
import {
  WorkspaceLoadingScreen,
  SettingsModal,
  SpaceSettings,
  AddChildModal,
  useFontPreference,
  useFontSizePreference,
  AppFloatingDock,
} from '@ainexsuite/ui';
import type { SpaceSettingsItem } from '@ainexsuite/ui';
import type { SpaceType, SpaceRole, ChildMember } from '@ainexsuite/types';
import type { SpaceMember as TableSpaceMember } from '@/lib/types/table';
import { WorkspaceLayoutWithInsights } from '@/components/layouts/workspace-layout-with-insights';
import { getQuickActionsForApp } from '@ainexsuite/types';
import { StickyNote } from 'lucide-react';
import { SettingsPanel } from '@/components/layout/settings-panel';
import { usePreferences } from '@/components/providers/preferences-provider';
import { useSpaces } from '@/components/providers/spaces-provider';
import { useSpaceInvitations, useChildMembers } from '@/hooks/use-space-invitations';
import { HintsProvider } from '@/components/hints';

export default function WorkspaceRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const {
    user,
    isLoading,
    isReady,
    handleSignOut,
    updatePreferences,
    updateProfile,
    updateProfileImage,
    removeProfileImage,
    generateAnimatedAvatar,
    saveAnimatedAvatar,
    toggleAnimatedAvatar,
    removeAnimatedAvatar,
    pollAnimationStatus,
  } = useWorkspaceAuth();
  const { preferences, updatePreferences: updateAppPreferences, loading: preferencesLoading } = usePreferences();
  const { spaces, updateSpace, deleteSpace, refreshSpaces } = useSpaces();

  // Explicit redirect when not authenticated - safety net for timing issues
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [isLoading, user, router]);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [editingSpaceId, setEditingSpaceId] = useState<string | null>(null);
  const [spaceSettingsOpen, setSpaceSettingsOpen] = useState(false);
  const [addChildModalOpen, setAddChildModalOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<ChildMember | undefined>(undefined);

  // Get current space being edited for SpaceSettings
  const editingSpace = useMemo(() => {
    if (!editingSpaceId) return null;
    return spaces.find((s) => s.id === editingSpaceId) || null;
  }, [editingSpaceId, spaces]);

  // Space invitations hook
  const {
    pendingInvitations,
    inviteMember,
    cancelInvitation,
  } = useSpaceInvitations(editingSpaceId);

  // Child members hook
  const { addChild, editChild, removeChild } = useChildMembers(editingSpaceId);

  // Map ALL spaces to SpaceSettingsItem format (excluding personal space)
  // Use allSpaces so users can see and toggle visibility of hidden spaces
  const spaceSettingsItems = useMemo<SpaceSettingsItem[]>(() => {
    return spaces
      .filter((s) => s.id !== 'personal') // Personal space can't be edited/deleted
      .map((s) => ({
        id: s.id,
        name: s.name,
        type: s.type,
        isGlobal: (s as { isGlobal?: boolean }).isGlobal,
        hiddenInApps: (s as { hiddenInApps?: string[] }).hiddenInApps || [],
        memberCount: s.memberUids?.length || 1,
        isOwner: ((s as { ownerId?: string; createdBy?: string }).ownerId || (s as { ownerId?: string; createdBy?: string }).createdBy) === user?.uid,
      }));
  }, [spaces, user?.uid]);

  // Handle updating space visibility
  const handleUpdateSpaceVisibility = useCallback(async (spaceId: string, hiddenInApps: string[]) => {
    await updateSpace(spaceId, { hiddenInApps });
  }, [updateSpace]);

  // Handle opening SpaceSettings modal
  const handleEditSpace = useCallback((spaceId: string) => {
    setEditingSpaceId(spaceId);
    setSpaceSettingsOpen(true);
  }, []);

  // Handle saving space settings
  const handleSaveSpaceSettings = useCallback(
    async (data: { name: string; color?: string; icon?: string }) => {
      if (!editingSpaceId) return;
      await updateSpace(editingSpaceId, data);
      // Refresh spaces to get updated data
      refreshSpaces();
    },
    [editingSpaceId, updateSpace, refreshSpaces]
  );

  // Handle deleting a space
  const handleDeleteSpace = useCallback(async () => {
    if (!editingSpaceId) return;
    await deleteSpace(editingSpaceId);
    setSpaceSettingsOpen(false);
    setEditingSpaceId(null);
  }, [editingSpaceId, deleteSpace]);

  // Handle inviting a member for SpaceSettings (returns void)
  const handleInviteMemberVoid = useCallback(
    async (email: string, role: SpaceRole): Promise<void> => {
      const result = await inviteMember(email, role);
      if (!result.success) {
        throw new Error(result.error || 'Failed to send invitation');
      }
    },
    [inviteMember]
  );

  // Handle canceling an invitation
  const handleCancelInvitation = useCallback(
    async (invitationId: string) => {
      await cancelInvitation(invitationId);
    },
    [cancelInvitation]
  );

  // Handle adding a child member
  const handleAddChild = useCallback(() => {
    setEditingChild(undefined);
    setAddChildModalOpen(true);
  }, []);

  // Handle editing a child member
  const handleEditChild = useCallback((child: ChildMember) => {
    setEditingChild(child);
    setAddChildModalOpen(true);
  }, []);

  // Handle removing a child member
  const handleRemoveChild = useCallback(
    async (childId: string) => {
      await removeChild(childId);
      // Refresh spaces to get updated data
      refreshSpaces();
    },
    [removeChild, refreshSpaces]
  );

  // Handle submitting add/edit child form
  const handleChildSubmit = useCallback(
    async (data: {
      displayName: string;
      photoURL?: string;
      birthDate?: string;
      relationship?: string;
    }) => {
      const result = await addChild(data);
      if (result.success) {
        refreshSpaces();
      }
      return result;
    },
    [addChild, refreshSpaces]
  );

  // Handle updating a child
  const handleChildUpdate = useCallback(
    async (
      childId: string,
      data: {
        displayName?: string;
        photoURL?: string;
        birthDate?: string;
        relationship?: string;
      }
    ) => {
      const result = await editChild(childId, data);
      if (result.success) {
        refreshSpaces();
      }
      return result;
    },
    [editChild, refreshSpaces]
  );

  // Sync user font preferences from Firestore (theme sync is handled by WorkspaceLayout)
  useFontPreference(user?.preferences?.fontFamily);
  useFontSizePreference(user?.preferences?.fontSize);

  // Get quick actions for Tables app
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const quickActions = getQuickActionsForApp('tables' as any);

  // Handle quick actions
  const handleQuickAction = useCallback((actionId: string) => {
    switch (actionId) {
      case 'new-table':
        // Navigate to create new doc - this will be handled by the workspace page
        router.push('/workspace?action=new-table');
        break;
      case 'new-checklist':
        // Navigate to create new checklist
        router.push('/workspace?action=new-checklist');
        break;
      default:
        // Unknown action - silently ignore for now
        break;
    }
  }, [router]);

  // Handle AI assistant
  const handleAiAssistantClick = useCallback(() => {
    // TODO: Open AI assistant panel
  }, []);

  // Handle settings click
  const handleSettingsClick = useCallback(() => {
    setSettingsModalOpen(true);
  }, []);

  // Show loading screen while checking auth - prevents Firestore calls before auth is confirmed
  if (isLoading || !isReady || !user) {
    return <WorkspaceLoadingScreen />;
  }

  return (
    <HintsProvider>
      <WorkspaceLayoutWithInsights
        user={user}
        onSignOut={handleSignOut}
        quickActions={quickActions}
        onQuickAction={handleQuickAction}
        onAiAssistantClick={handleAiAssistantClick}
        onSettingsClick={handleSettingsClick}
        // Notifications - empty for now, will be populated by notification service
        notifications={[]}
        onUpdatePreferences={updatePreferences}
      >
        {children}
      </WorkspaceLayoutWithInsights>

      {/* Global Settings Modal */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        user={user ? {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          iconURL: user.iconURL,
          animatedAvatarURL: user.animatedAvatarURL,
          animatedAvatarStyle: user.animatedAvatarStyle,
          useAnimatedAvatar: user.useAnimatedAvatar,
        } : null}
        preferences={user?.preferences ?? {
          theme: 'dark',
          language: 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          notifications: { email: true, push: false, inApp: true },
        }}
        onUpdatePreferences={updatePreferences}
        onUpdateProfile={updateProfile}
        onUpdateProfileImage={updateProfileImage}
        onRemoveProfileImage={removeProfileImage}
        profileImageApiEndpoint="/api/generate-profile-image"
        onGenerateAnimatedAvatar={generateAnimatedAvatar}
        onSaveAnimatedAvatar={saveAnimatedAvatar}
        onToggleAnimatedAvatar={toggleAnimatedAvatar}
        onRemoveAnimatedAvatar={removeAnimatedAvatar}
        onPollAnimationStatus={pollAnimationStatus}
        animateAvatarApiEndpoint="/api/animate-avatar"
        spaces={spaceSettingsItems}
        currentAppId="tables"
        onEditSpace={handleEditSpace}
        onUpdateSpaceVisibility={handleUpdateSpaceVisibility}
        onDeleteSpace={deleteSpace}
        appSettings={
          <SettingsPanel
            preferences={preferences}
            isLoading={preferencesLoading}
            onUpdate={updateAppPreferences}
            onClose={() => setSettingsModalOpen(false)}
          />
        }
        appSettingsLabel="Notes"
        appSettingsIcon={<StickyNote className="h-4 w-4" />}
      />

      {/* Space Settings Modal */}
      {editingSpace && (
        <SpaceSettings
          isOpen={spaceSettingsOpen}
          onClose={() => {
            setSpaceSettingsOpen(false);
            setEditingSpaceId(null);
          }}
          space={{
            id: editingSpace.id,
            name: editingSpace.name,
            type: editingSpace.type as SpaceType,
            color: (editingSpace as { color?: string }).color as Parameters<typeof SpaceSettings>[0]['space']['color'],
            icon: (editingSpace as { icon?: string }).icon as Parameters<typeof SpaceSettings>[0]['space']['icon'],
            isGlobal: (editingSpace as { isGlobal?: boolean }).isGlobal,
            members: (editingSpace.members || []).map((m: TableSpaceMember) => ({
              uid: m.uid,
              displayName: m.displayName,
              email: undefined as string | undefined,
              photoURL: m.photoURL,
              role: m.role as SpaceRole,
              joinedAt: typeof m.joinedAt === 'string' ? new Date(m.joinedAt).getTime() : m.joinedAt,
            })),
            childMembers: (editingSpace as { childMembers?: ChildMember[] }).childMembers,
            pendingInviteCount: pendingInvitations.length,
          }}
          pendingInvitations={pendingInvitations}
          currentUserId={user.uid}
          onSave={handleSaveSpaceSettings}
          onDelete={handleDeleteSpace}
          onInviteMember={handleInviteMemberVoid}
          onCancelInvitation={handleCancelInvitation}
          onAddChild={handleAddChild}
          onEditChild={handleEditChild}
          onRemoveChild={handleRemoveChild}
          canEdit={
            (editingSpace.members || []).find((m: TableSpaceMember) => m.uid === user.uid)?.role === 'admin'
          }
          canDelete={
            ((editingSpace as { ownerId?: string; createdBy?: string }).ownerId ||
              (editingSpace as { ownerId?: string; createdBy?: string }).createdBy) === user.uid
          }
        />
      )}

      {/* Add Child Modal */}
      {editingSpace && (
        <AddChildModal
          isOpen={addChildModalOpen}
          onClose={() => {
            setAddChildModalOpen(false);
            setEditingChild(undefined);
          }}
          space={{
            id: editingSpace.id,
            name: editingSpace.name,
          }}
          onAddChild={handleChildSubmit}
          editChild={editingChild}
          onUpdateChild={handleChildUpdate}
        />
      )}

      {/* App Floating Dock - Desktop only */}
      <AppFloatingDock currentApp="tables" />
    </HintsProvider>
  );
}
