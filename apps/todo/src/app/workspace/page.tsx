'use client';

import { useState } from 'react';
import { useWorkspaceAuth } from '@ainexsuite/auth';
import { WorkspaceLayout, WorkspaceLoadingScreen } from '@ainexsuite/ui';
import { Plus, LayoutGrid, List, Calendar } from 'lucide-react';

// Components
import { SpaceSwitcher } from '@/components/spaces/SpaceSwitcher';
import { TaskEditor } from '@/components/tasks/TaskEditor';
import { TaskInsights } from '@/components/tasks/TaskInsights';
import { SmartTaskInput } from '@/components/tasks/SmartTaskInput';
import { TaskList } from '@/components/views/TaskList';
import { TaskBoard } from '@/components/views/TaskBoard';
import { MyDayView } from '@/components/views/MyDayView';
import { EisenhowerMatrix } from '@/components/views/EisenhowerMatrix';
import { TodoFirestoreSync } from '@/components/TodoFirestoreSync';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

type ViewType = 'list' | 'board' | 'my-day' | 'matrix';

export default function TodoWorkspacePage() {
  const { user, isLoading, isReady, handleSignOut } = useWorkspaceAuth();

  const [view, setView] = useState<ViewType>('list');
  const [showEditor, setShowEditor] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(undefined);

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
      searchPlaceholder="Search tasks..."
      appName="Task"
    >
      <TodoFirestoreSync />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* AI Insights Banner - Full Width at Top */}
        <TaskInsights variant="sidebar" />

        {/* Header with Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
              <button
                onClick={() => setView('matrix')}
                className={`p-1.5 rounded transition-colors ${view === 'matrix' ? 'bg-accent-500/10 text-accent-500' : 'text-ink-600 hover:text-ink-800'}`}
                title="Eisenhower Matrix"
              >
                <div className="h-4 w-4 grid grid-cols-2 gap-0.5">
                  <div className="bg-current opacity-70 rounded-[1px]" />
                  <div className="bg-current opacity-40 rounded-[1px]" />
                  <div className="bg-current opacity-40 rounded-[1px]" />
                  <div className="bg-current opacity-20 rounded-[1px]" />
                </div>
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

        {/* Smart Input */}
        <div className="max-w-2xl mx-auto w-full">
          <SmartTaskInput />
        </div>

        {/* Content Area */}
        <div className="min-h-[60vh]">
          {view === 'list' && (
            <TaskList onEditTask={(id) => { setSelectedTaskId(id); setShowEditor(true); }} />
          )}

          {view === 'board' && (
            <div className="overflow-x-auto">
              <TaskBoard onEditTask={(id) => { setSelectedTaskId(id); setShowEditor(true); }} />
            </div>
          )}

          {view === 'my-day' && (
            <MyDayView onEditTask={(id) => { setSelectedTaskId(id); setShowEditor(true); }} />
          )}

          {view === 'matrix' && (
            <EisenhowerMatrix onEditTask={(id) => { setSelectedTaskId(id); setShowEditor(true); }} />
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
