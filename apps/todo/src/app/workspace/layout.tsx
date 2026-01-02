'use client';

import { useCallback, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspaceAuth } from '@ainexsuite/auth';
import { WorkspaceLoadingScreen, SettingsModal, useFontPreference, useFontSizePreference } from '@ainexsuite/ui';
import type { SpaceSettingsItem } from '@ainexsuite/ui';
import { WorkspaceLayoutWithInsights } from '@/components/layouts';
import { TodoFirestoreSync } from '@/components/TodoFirestoreSync';
import { SpacesProvider, useSpaces } from '@/components/providers/spaces-provider';
import { PreferencesProvider } from '@/components/providers/preferences-provider';
import { HintsProvider } from '@/components/hints';
import { getQuickActionsForApp } from '@ainexsuite/types';
import { CheckSquare } from 'lucide-react';
import { SettingsPanel } from '@/components/layout/settings-panel';

// Simple Todo app preferences
interface TodoAppPreferences {
  defaultView?: 'list' | 'board' | 'my-day' | 'matrix' | 'calendar';
  showCompletedTasks?: boolean;
  enableDueDateReminders?: boolean;
  taskSortOrder?: 'manual' | 'dueDate' | 'priority' | 'createdAt';
}

/**
 * Inner layout that has access to SpacesProvider context
 */
function WorkspaceLayoutInner({
  children,
  user,
  handleSignOut,
  updatePreferences,
}: {
  children: React.ReactNode;
  user: NonNullable<ReturnType<typeof useWorkspaceAuth>['user']>;
  handleSignOut: () => void;
  updatePreferences: (updates: { theme?: 'light' | 'dark' | 'system' }) => Promise<void>;
}) {
  const router = useRouter();
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const { allSpaces, updateSpace, deleteSpace } = useSpaces();

  // Simple local state for Todo app preferences
  const [appPreferences, setAppPreferences] = useState<TodoAppPreferences>({
    defaultView: 'list',
    showCompletedTasks: false,
    enableDueDateReminders: true,
    taskSortOrder: 'manual',
  });

  // Map ALL spaces to SpaceSettingsItem format (excluding personal space)
  // Use allSpaces so users can see and toggle visibility of hidden spaces
  const spaceSettingsItems = useMemo<SpaceSettingsItem[]>(() => {
    return allSpaces
      .filter((s) => s.id !== 'personal')
      .map((s) => ({
        id: s.id,
        name: s.name,
        type: s.type,
        isGlobal: (s as { isGlobal?: boolean }).isGlobal,
        hiddenInApps: (s as { hiddenInApps?: string[] }).hiddenInApps || [],
        memberCount: s.memberUids?.length || 1,
        isOwner: ((s as { ownerId?: string; createdBy?: string }).ownerId || (s as { ownerId?: string; createdBy?: string }).createdBy) === user?.uid,
      }));
  }, [allSpaces, user?.uid]);

  // Handle updating space visibility
  const handleUpdateSpaceVisibility = useCallback(async (spaceId: string, hiddenInApps: string[]) => {
    await updateSpace(spaceId, { hiddenInApps });
  }, [updateSpace]);

  // Get quick actions for Todo app
  const quickActions = getQuickActionsForApp('todo');

  // Handle quick actions
  const handleQuickAction = useCallback((actionId: string) => {
    switch (actionId) {
      case 'new-task':
        router.push('/workspace?action=new-task');
        break;
      case 'new-project':
        router.push('/workspace?action=new-project');
        break;
      default:
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

  // Handle app preferences update
  const handleUpdateAppPreferences = useCallback(async (updates: Partial<TodoAppPreferences>) => {
    setAppPreferences((prev) => ({ ...prev, ...updates }));
    // TODO: Persist to Firestore when ready
  }, []);

  return (
    <>
      <WorkspaceLayoutWithInsights
        user={user}
        onSignOut={handleSignOut}
        quickActions={quickActions}
        onQuickAction={handleQuickAction}
        onAiAssistantClick={handleAiAssistantClick}
        onSettingsClick={handleSettingsClick}
        notifications={[]}
        onUpdatePreferences={updatePreferences}
      >
        <TodoFirestoreSync />
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
        } : null}
        preferences={user?.preferences ?? {
          theme: 'dark',
          language: 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          notifications: { email: true, push: false, inApp: true },
        }}
        onUpdatePreferences={updatePreferences}
        spaces={spaceSettingsItems}
        currentAppId="todo"
        onUpdateSpaceVisibility={handleUpdateSpaceVisibility}
        onDeleteSpace={deleteSpace}
        appSettings={
          <SettingsPanel
            preferences={appPreferences}
            isLoading={false}
            onUpdate={handleUpdateAppPreferences}
            onClose={() => setSettingsModalOpen(false)}
          />
        }
        appSettingsLabel="Todo"
        appSettingsIcon={<CheckSquare className="h-4 w-4" />}
      />
    </>
  );
}

export default function WorkspaceRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isReady, handleSignOut, updatePreferences } = useWorkspaceAuth();

  // Sync user font preferences from Firestore (theme sync is handled by WorkspaceLayout)
  useFontPreference(user?.preferences?.fontFamily);
  useFontSizePreference(user?.preferences?.fontSize);

  // Show loading screen while checking auth - prevents Firestore calls before auth is confirmed
  if (isLoading || !isReady || !user) {
    return <WorkspaceLoadingScreen />;
  }

  return (
    <SpacesProvider>
      <PreferencesProvider>
        <HintsProvider>
          <WorkspaceLayoutInner
            user={user}
            handleSignOut={handleSignOut}
            updatePreferences={updatePreferences}
          >
            {children}
          </WorkspaceLayoutInner>
        </HintsProvider>
      </PreferencesProvider>
    </SpacesProvider>
  );
}