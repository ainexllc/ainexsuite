'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspaceAuth } from '@ainexsuite/auth';
import { WorkspaceLoadingScreen, SettingsModal, useFontPreference, useFontSizePreference } from '@ainexsuite/ui';
import { WorkspaceLayoutWithInsights } from '@/components/layouts';
import { TodoFirestoreSync } from '@/components/TodoFirestoreSync';
import { getQuickActionsForApp } from '@ainexsuite/types';
import { CheckSquare } from 'lucide-react';
import { SettingsPanel } from '@/components/layout/settings-panel';

// Simple Todo app preferences
interface TodoAppPreferences {
  defaultView?: 'list' | 'masonry' | 'board' | 'my-day' | 'matrix' | 'calendar';
  showCompletedTasks?: boolean;
  enableDueDateReminders?: boolean;
  taskSortOrder?: 'manual' | 'dueDate' | 'priority' | 'createdAt';
}

export default function WorkspaceRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading, isReady, handleSignOut, updatePreferences } = useWorkspaceAuth();
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // Simple local state for Todo app preferences
  const [appPreferences, setAppPreferences] = useState<TodoAppPreferences>({
    defaultView: 'list',
    showCompletedTasks: false,
    enableDueDateReminders: true,
    taskSortOrder: 'manual',
  });

  // Sync user font preferences from Firestore (theme sync is handled by WorkspaceLayout)
  useFontPreference(user?.preferences?.fontFamily);
  useFontSizePreference(user?.preferences?.fontSize);

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

  // Show standardized loading screen
  if (isLoading) {
    return <WorkspaceLoadingScreen />;
  }

  // Return null while redirecting
  if (!isReady || !user) {
    return null;
  }

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