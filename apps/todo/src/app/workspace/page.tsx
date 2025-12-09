'use client';

import { useState, useMemo } from 'react';
import { LayoutGrid, List, Calendar, Sun, Grid2X2 } from 'lucide-react';
import { WorkspacePageLayout, WorkspaceToolbar, ActivityCalendar, type ViewOption, type SortOption, type SortConfig } from '@ainexsuite/ui';

// Components
import { TaskEditor } from '@/components/tasks/TaskEditor';
import { TaskInsights } from '@/components/tasks/TaskInsights';
import { SmartTaskInput } from '@/components/tasks/SmartTaskInput';
import { TaskList } from '@/components/views/TaskList';
import { TaskBoard } from '@/components/views/TaskBoard';
import { MyDayView } from '@/components/views/MyDayView';
import { EisenhowerMatrix } from '@/components/views/EisenhowerMatrix';

import { useTodoStore } from '@/lib/store';

type ViewType = 'list' | 'board' | 'my-day' | 'matrix' | 'calendar';

const VIEW_OPTIONS: ViewOption<ViewType>[] = [
  { value: 'list', icon: List, label: 'List view' },
  { value: 'board', icon: LayoutGrid, label: 'Board view' },
  { value: 'my-day', icon: Sun, label: 'My Day' },
  { value: 'matrix', icon: Grid2X2, label: 'Eisenhower Matrix' },
  { value: 'calendar', icon: Calendar, label: 'Calendar view' },
];

const SORT_OPTIONS: SortOption[] = [
  { field: 'createdAt', label: 'Date created' },
  { field: 'updatedAt', label: 'Date modified' },
  { field: 'dueDate', label: 'Due date' },
  { field: 'title', label: 'Title' },
];

export default function TodoWorkspacePage() {
  const { currentSpaceId, viewPreferences, setViewPreference, spaces, setCurrentSpace, tasks } = useTodoStore();

  const [showEditor, setShowEditor] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(undefined);
  const [sort, setSort] = useState<SortConfig>({ field: 'createdAt', direction: 'desc' });

  // Resolve view from preference or default
  const view = (viewPreferences[currentSpaceId] as ViewType) || 'list';

  const handleSetView = (newView: ViewType) => {
    if (currentSpaceId) {
      setViewPreference(currentSpaceId, newView);
    }
  };

  // Calculate activity data for calendar view
  const activityData = useMemo(() => {
    const data: Record<string, number> = {};
    tasks.forEach((task) => {
      if (task.createdAt) {
        const date = new Date(task.createdAt).toISOString().split('T')[0];
        data[date] = (data[date] || 0) + 1;
      }
    });
    return data;
  }, [tasks]);

  // Prepare spaces for WorkspacePageLayout
  const spaceItems = [
    { id: 'all', name: 'All Spaces', type: 'personal' as const },
    ...spaces.map(space => ({
      id: space.id,
      name: space.name,
      type: space.type as 'personal' | 'family' | 'work',
    }))
  ];

  const isCalendarView = view === 'calendar';

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
        toolbar={
          <WorkspaceToolbar
            viewMode={view}
            onViewModeChange={handleSetView}
            viewOptions={VIEW_OPTIONS}
            sort={sort}
            onSortChange={setSort}
            sortOptions={SORT_OPTIONS}
          />
        }
      >
        {/* Content Area */}
        <div className="min-h-[60vh]">
          {isCalendarView ? (
            <ActivityCalendar
              activityData={activityData}
              size="large"
            />
          ) : (
            <>
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
            </>
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
