'use client';

import type { TodoProject } from '@ainexsuite/types';
import { Inbox, Calendar, CalendarClock, CheckCircle2, Folder, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewFilter = 'all' | 'today' | 'upcoming' | 'completed';

interface SidebarProps {
  projects: TodoProject[];
  selectedProject: string | null;
  onSelectProject: (projectId: string | null) => void;
  viewFilter: ViewFilter;
  onViewFilterChange: (filter: ViewFilter) => void;
  onCreateProject: () => void;
  taskCounts: {
    all: number;
    today: number;
    upcoming: number;
    completed: number;
  };
}

export function Sidebar({
  projects,
  selectedProject,
  onSelectProject,
  viewFilter,
  onViewFilterChange,
  onCreateProject,
  taskCounts,
}: SidebarProps) {
  return (
    <aside className="w-[280px] h-[calc(100vh-64px)] surface-elevated border-r border-surface-hover fixed left-0 top-16 overflow-y-auto">
      <div className="p-4">
        {/* Main Views */}
        <div className="mb-6">
          <button
            onClick={() => {
              onSelectProject(null);
              onViewFilterChange('all');
            }}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left',
              viewFilter === 'all' && !selectedProject
                ? 'bg-accent-500 text-foreground'
                : 'hover:surface-card'
            )}
          >
            <Inbox className="h-5 w-5" />
            <span className="font-medium">All Tasks</span>
            <span className="ml-auto text-sm opacity-75">{taskCounts.all}</span>
          </button>

          <button
            onClick={() => {
              onSelectProject(null);
              onViewFilterChange('today');
            }}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left',
              viewFilter === 'today' && !selectedProject
                ? 'bg-accent-500 text-foreground'
                : 'hover:surface-card'
            )}
          >
            <Calendar className="h-5 w-5" />
            <span className="font-medium">Today</span>
            <span className="ml-auto text-sm opacity-75">{taskCounts.today}</span>
          </button>

          <button
            onClick={() => {
              onSelectProject(null);
              onViewFilterChange('upcoming');
            }}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left',
              viewFilter === 'upcoming' && !selectedProject
                ? 'bg-accent-500 text-foreground'
                : 'hover:surface-card'
            )}
          >
            <CalendarClock className="h-5 w-5" />
            <span className="font-medium">Upcoming</span>
            <span className="ml-auto text-sm opacity-75">{taskCounts.upcoming}</span>
          </button>

          <button
            onClick={() => {
              onSelectProject(null);
              onViewFilterChange('completed');
            }}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left',
              viewFilter === 'completed' && !selectedProject
                ? 'bg-accent-500 text-foreground'
                : 'hover:surface-card'
            )}
          >
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">Completed</span>
            <span className="ml-auto text-sm opacity-75">{taskCounts.completed}</span>
          </button>
        </div>

        {/* Projects */}
        <div>
          <div className="flex items-center justify-between mb-2 px-4">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Projects
            </h3>
            <button
              onClick={onCreateProject}
              className="p-1 hover:bg-surface-hover rounded transition-colors"
              title="New project"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground px-4 py-2">No projects yet</p>
          ) : (
            <div className="space-y-1">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => {
                    onSelectProject(project.id);
                    onViewFilterChange('all');
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-left',
                    selectedProject === project.id
                      ? 'bg-accent-500 text-foreground'
                      : 'hover:surface-card'
                  )}
                >
                  <Folder className="h-4 w-4" style={{ color: project.color }} />
                  <span className="text-sm flex-1 truncate">{project.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
