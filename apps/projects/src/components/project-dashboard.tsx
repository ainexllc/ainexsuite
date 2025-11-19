'use client';

import { Plus, Presentation, LayoutGrid, MoreVertical, Clock, Folder } from 'lucide-react';

interface ProjectDashboardProps {
  onOpenWhiteboard: () => void;
}

export function ProjectDashboard({ onOpenWhiteboard }: ProjectDashboardProps) {
  // Mock data for visual demonstration
  const recentProjects = [
    { id: 1, title: 'Q4 Marketing Strategy', updated: '2h ago', color: 'bg-blue-500' },
    { id: 2, title: 'Website Redesign', updated: '1d ago', color: 'bg-purple-500' },
    { id: 3, title: 'Mobile App Launch', updated: '3d ago', color: 'bg-green-500' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero / Action Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Call to Action: Whiteboard */}
        <button
          onClick={onOpenWhiteboard}
          className="group relative overflow-hidden rounded-2xl border border-dashed border-white/20 bg-white/5 p-8 text-left transition-all hover:border-cyan-500/50 hover:bg-cyan-500/5"
        >
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="rounded-full bg-cyan-500/10 p-3 w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
              <Presentation className="h-8 w-8 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Planning Whiteboard</h3>
              <p className="text-sm text-white/60">
                Brainstorm ideas, create sticky notes, and map out flows on an infinite canvas.
              </p>
            </div>
          </div>
        </button>

        {/* Create New Project (Placeholder) */}
        <button className="group relative overflow-hidden rounded-2xl border border-white/10 bg-surface-card p-8 text-left transition-all hover:bg-surface-elevated hover:border-white/20 md:col-span-2">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="rounded-full bg-purple-500/10 p-3 w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
              <Plus className="h-8 w-8 text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">New Project</h3>
              <p className="text-sm text-white/60">
                Start a new structured project with tasks, timelines, and milestones.
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Recent Projects Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Clock className="h-4 w-4 text-white/40" />
            Recent Projects
          </h3>
          <button className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
            View All
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentProjects.map((project) => (
            <div
              key={project.id}
              className="group flex items-center gap-4 rounded-xl border border-white/5 bg-surface-card p-4 transition-all hover:bg-surface-elevated hover:border-white/10 cursor-pointer"
            >
              <div className={`h-10 w-10 rounded-lg ${project.color} flex items-center justify-center shadow-lg opacity-80 group-hover:opacity-100 transition-opacity`}>
                <Folder className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white truncate">{project.title}</h4>
                <p className="text-xs text-white/40">Updated {project.updated}</p>
              </div>
              <button className="text-white/20 hover:text-white transition-colors p-1">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          ))}
          
          {/* Empty slots filler */}
          {[1, 2, 3].map((i) => (
            <div key={`empty-${i}`} className="hidden lg:block rounded-xl border border-white/5 bg-white/[0.02] p-4 opacity-50">
               <div className="flex items-center gap-4">
                 <div className="h-10 w-10 rounded-lg bg-white/5" />
                 <div className="space-y-2 flex-1">
                   <div className="h-4 w-24 bg-white/5 rounded" />
                   <div className="h-3 w-16 bg-white/5 rounded" />
                 </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
