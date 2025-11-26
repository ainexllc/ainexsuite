'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@ainexsuite/auth';
import { WorkspaceLayout } from '@ainexsuite/ui/components';
import { useRouter } from 'next/navigation';
import { Plus, LayoutGrid, List, Calendar, Loader2 } from 'lucide-react';

// New Components
import { SpaceSwitcher } from '@/components/spaces/SpaceSwitcher';
import { TaskEditor } from '@/components/tasks/TaskEditor';
import { TaskList } from '@/components/views/TaskList';
import { TaskBoard } from '@/components/views/TaskBoard';
import { MyDayView } from '@/components/views/MyDayView';
import { TodoFirestoreSync } from '@/components/TodoFirestoreSync';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

type ViewType = 'list' | 'board' | 'my-day';

export default function TodoWorkspacePage() {
  const { user, loading, bootstrapStatus, ssoInProgress } = useAuth();
  const router = useRouter();

  const [view, setView] = useState<ViewType>('list');
  const [showEditor, setShowEditor] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(undefined);

  // Redirect to login if not authenticated
  // Wait for bootstrap and SSO to complete before redirecting to prevent interrupting auto-login
  useEffect(() => {
    if (!loading && !ssoInProgress && !user && bootstrapStatus !== 'running') {
      router.push('/');
    }
  }, [user, loading, ssoInProgress, bootstrapStatus, router]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      const { auth } = await import('@ainexsuite/firebase');
      const firebaseAuth = await import('firebase/auth');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (firebaseAuth as any).signOut(auth);
      router.push('/');
    } catch (error) {
      // Ignore sign out error
    }
  };

  // Show loading while authenticating, bootstrapping, or SSO in progress
  if (loading || ssoInProgress || bootstrapStatus === 'running') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <Loader2 className="h-8 w-8 animate-spin text-[#8b5cf6]" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <WorkspaceLayout
      user={user}
      onSignOut={handleSignOut}
      searchPlaceholder="Search tasks..."
      appName="Task"
      appColor="#8b5cf6"
    >
      <TodoFirestoreSync />

      <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col">

        {/* Header with Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 shrink-0">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <SpaceSwitcher />

            {/* View Toggles */}
            <div className="flex bg-surface-card border border-surface-hover rounded-lg p-1">
              <button
                onClick={() => setView('list')}
                className={`p-1.5 rounded transition-colors ${view === 'list' ? 'bg-accent-500/10 text-accent-500' : 'text-ink-600 hover:text-ink-800'}`}
                title="List View"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView('board')}
                className={`p-1.5 rounded transition-colors ${view === 'board' ? 'bg-accent-500/10 text-accent-500' : 'text-ink-600 hover:text-ink-800'}`}
                title="Board View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView('my-day')}
                className={`p-1.5 rounded transition-colors ${view === 'my-day' ? 'bg-accent-500/10 text-accent-500' : 'text-ink-600 hover:text-ink-800'}`}
                title="My Day"
              >
                <Calendar className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => {
                setSelectedTaskId(undefined);
                setShowEditor(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-500 hover:bg-accent-600 text-white text-sm font-medium transition-colors shadow-lg shadow-accent-500/20"
            >
              <Plus className="h-4 w-4" />
              <span>New Task</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {view === 'list' && (
            <div className="h-full overflow-y-auto pr-2">
              <TaskList onEditTask={(id) => { setSelectedTaskId(id); setShowEditor(true); }} />
            </div>
          )}

          {view === 'board' && (
            <div className="h-full overflow-x-auto overflow-y-hidden">
              <TaskBoard onEditTask={(id) => { setSelectedTaskId(id); setShowEditor(true); }} />
            </div>
          )}

          {view === 'my-day' && (
            <div className="h-full overflow-y-auto pr-2">
              <MyDayView onEditTask={(id) => { setSelectedTaskId(id); setShowEditor(true); }} />
            </div>
          )}
        </div>
      </div>

      {/* Editor Modal */}
      <TaskEditor
        isOpen={showEditor}
        onClose={() => setShowEditor(false)}
        editTaskId={selectedTaskId}
      />

    </WorkspaceLayout>
  );
}
