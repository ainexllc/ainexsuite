'use client';

import { useState, useMemo } from 'react';
import { LayoutGrid, List, Calendar, Sun, Grid2X2, Columns } from 'lucide-react';
import { WorkspacePageLayout, WorkspaceToolbar, ActivityCalendar, type ViewOption, type SortOption, type SortConfig } from '@ainexsuite/ui';

// Components
import { TaskEditor } from '@/components/tasks/TaskEditor';
import { TaskComposer } from '@/components/tasks/TaskComposer';
import { TaskBoard } from '@/components/views/TaskBoard';
import { TaskKanban } from '@/components/views/TaskKanban';
import { MyDayView } from '@/components/views/MyDayView';
import { EisenhowerMatrix } from '@/components/views/EisenhowerMatrix';
import { SpaceSwitcher } from '@/components/spaces/SpaceSwitcher';

import { useTodoStore } from '@/lib/store';

type ViewType = 'list' | 'masonry' | 'board' | 'my-day' | 'matrix' | 'calendar';

const VIEW_OPTIONS: ViewOption<ViewType>[] = [
  { value: 'list', icon: List, label: 'List view' },
  { value: 'masonry', icon: LayoutGrid, label: 'Masonry view' },
  { value: 'board', icon: Columns, label: 'Board view' },
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
  const { currentSpaceId, viewPreferences, setViewPreference, tasks } = useTodoStore();

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

  const isCalendarView = view === 'calendar';

  return (
    <>
      <WorkspacePageLayout
        composer={<TaskComposer />}
        composerActions={<SpaceSwitcher />}
        toolbar={
          <div className="space-y-2">
            <WorkspaceToolbar
              viewMode={view}
              onViewModeChange={handleSetView}
              viewOptions={VIEW_OPTIONS}
              sort={sort}
              onSortChange={setSort}
              sortOptions={SORT_OPTIONS}
              viewPosition="right"
            />
          </div>
        }
        maxWidth="default"
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
              {(view === 'list' || view === 'masonry') && (
                <TaskBoard
                  viewMode={view}
                  onEditTask={(id) => { setSelectedTaskId(id); setShowEditor(true); }}
                />
              )}

              {view === 'board' && (
                <div className="overflow-x-auto">
                  <TaskKanban onEditTask={(id) => { setSelectedTaskId(id); setShowEditor(true); }} />
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
