'use client';

import { useState } from 'react';
import { LayoutGrid, List, Calendar } from 'lucide-react';
import { WorkspacePageLayout } from '@ainexsuite/ui';

// Components
import { TaskEditor } from '@/components/tasks/TaskEditor';
import { TaskInsights } from '@/components/tasks/TaskInsights';
import { SmartTaskInput } from '@/components/tasks/SmartTaskInput';
import { TaskList } from '@/components/views/TaskList';
import { TaskBoard } from '@/components/views/TaskBoard';
import { MyDayView } from '@/components/views/MyDayView';
import { EisenhowerMatrix } from '@/components/views/EisenhowerMatrix';

import { useTodoStore } from '@/lib/store';

type ViewType = 'list' | 'board' | 'my-day' | 'matrix';

export default function TodoWorkspacePage() {
  const { currentSpaceId, viewPreferences, setViewPreference, spaces, setCurrentSpace } = useTodoStore();

  const [showEditor, setShowEditor] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(undefined);

  // Resolve view from preference or default
  const view = (viewPreferences[currentSpaceId] as ViewType) || 'list';

  const handleSetView = (newView: ViewType) => {
    if (currentSpaceId) {
      setViewPreference(currentSpaceId, newView);
    }
  };

  // Prepare spaces for WorkspacePageLayout
  const spaceItems = [
    { id: 'all', name: 'All Spaces', type: 'personal' as const },
    ...spaces.map(space => ({
      id: space.id,
      name: space.name,
      type: space.type as 'personal' | 'family' | 'work',
    }))
  ];

  // View toggle buttons component
  const viewToggles = (
    <div className="flex items-center gap-2">
      {/* View Toggles */}
      <div className="flex bg-surface-card border border-surface-hover rounded-lg p-1">
        <button
          onClick={() => handleSetView('list')}
          className={`p-1.5 rounded transition-colors ${view === 'list' ? 'bg-accent-500/10 text-accent-500' : 'text-ink-600 hover:text-ink-800'}`}
          title="List View"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          onClick={() => handleSetView('board')}
          className={`p-1.5 rounded transition-colors ${view === 'board' ? 'bg-accent-500/10 text-accent-500' : 'text-ink-600 hover:text-ink-800'}`}
          title="Board View"
        >
          <LayoutGrid className="h-4 w-4" />
        </button>
        <button
          onClick={() => handleSetView('my-day')}
          className={`p-1.5 rounded transition-colors ${view === 'my-day' ? 'bg-accent-500/10 text-accent-500' : 'text-ink-600 hover:text-ink-800'}`}
          title="My Day"
        >
          <Calendar className="h-4 w-4" />
        </button>
        <button
          onClick={() => handleSetView('matrix')}
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
  );

  return (
    <>
      <WorkspacePageLayout
        insightsBanner={<TaskInsights variant="sidebar" />}
        composer={<SmartTaskInput />}
        spaces={{
          items: spaceItems,
          currentSpaceId,
          onSpaceChange: setCurrentSpace,
        }}
        composerActions={viewToggles}
      >
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
      </WorkspacePageLayout>

      {/* Editor Modal */}
      <TaskEditor
        isOpen={showEditor}
        onClose={() => setShowEditor(false)}
        editTaskId={selectedTaskId}
      />
    </>
  );
}