'use client';

import React, { useState } from 'react';
import { 
  LayoutGrid, Book, PenTool, CheckSquare, 
  Target, Image, TrendingUp, Activity, 
  Dumbbell, GitBranch, Search, Plus, 
  MoreVertical, ExternalLink, Lock, 
  Download, Play, Settings
} from 'lucide-react';
import { clsx } from 'clsx';

// --- Mock Data ---

type AppStatus = 'installed' | 'available' | 'locked';

interface AppData {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: AppStatus;
  color: string;
}

const APPS: AppData[] = [
  { id: 'projects', name: 'Projects', description: 'Project management & collaboration', icon: LayoutGrid, status: 'installed', color: 'bg-violet-500' },
  { id: 'notes', name: 'Notes', description: 'Second brain & knowledge base', icon: Book, status: 'installed', color: 'bg-yellow-500' },
  { id: 'journey', name: 'Journey', description: 'Personal journal & reflection', icon: PenTool, status: 'installed', color: 'bg-purple-500' },
  { id: 'todo', name: 'Todo', description: 'Task management done right', icon: CheckSquare, status: 'available', color: 'bg-blue-500' },
  { id: 'track', name: 'Track', description: 'Goal & habit tracking', icon: Target, status: 'available', color: 'bg-green-500' },
  { id: 'moments', name: 'Moments', description: 'Photo & memory gallery', icon: Image, status: 'locked', color: 'bg-pink-500' },
  { id: 'grow', name: 'Grow', description: 'Personal growth plans', icon: TrendingUp, status: 'locked', color: 'bg-indigo-500' },
  { id: 'pulse', name: 'Pulse', description: 'Health & vitals monitoring', icon: Activity, status: 'available', color: 'bg-red-500' },
  { id: 'fit', name: 'Fit', description: 'Workout & fitness tracking', icon: Dumbbell, status: 'locked', color: 'bg-orange-500' },
  { id: 'workflow', name: 'Workflow', description: 'Automation & integrations', icon: GitBranch, status: 'available', color: 'bg-emerald-500' },
];

// --- Components ---

const SectionHeader = ({ title, description }: { title: string, description: string }) => (
  <div className="mb-8 border-b border-white/10 pb-4">
    <h2 className="text-2xl font-bold text-white">{title}</h2>
    <p className="text-gray-400">{description}</p>
  </div>
);

// --- MOCKUP 1: The "App Store" Grid ---
const Mockup1 = () => {
  const installed = APPS.filter(a => a.status === 'installed');
  const available = APPS.filter(a => a.status !== 'installed');

  return (
    <div className="p-8 bg-black min-h-[600px] rounded-xl border border-white/10">
      <SectionHeader title="Concept 1: The Storefront" description="Clear separation between 'Your Apps' and 'Discover'. Visual hierarchy emphasizes ownership." />
      
      {/* My Apps Section */}
      <div className="mb-12">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
          Your Workspace
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {installed.map(app => (
            <div key={app.id} className="group relative bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all cursor-pointer">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </div>
              <div className={`${app.color} w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>
                <app.icon className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-medium text-white">{app.name}</h4>
              <p className="text-sm text-gray-400 mt-1">{app.description}</p>
              <div className="mt-4 flex items-center text-xs text-green-400">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Active
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Discover Section */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-6 bg-purple-500 rounded-full"></span>
          Discover More
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {available.map(app => (
            <div key={app.id} className="flex items-start gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-xl hover:border-white/20 transition-colors">
              <div className={`${app.color} bg-opacity-20 w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0`}>
                <app.icon className={`w-8 h-8 ${app.color.replace('bg-', 'text-')}`} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-white text-lg">{app.name}</h4>
                  {app.status === 'locked' ? (
                    <Lock className="w-4 h-4 text-gray-600" />
                  ) : (
                    <span className="text-xs bg-white/10 px-2 py-1 rounded text-gray-300">Free</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{app.description}</p>
                <button className={clsx(
                  "mt-3 w-full py-2 rounded-lg text-sm font-medium transition-colors",
                  app.status === 'locked' 
                    ? "bg-white/5 text-gray-500 cursor-not-allowed"
                    : "bg-white text-black hover:bg-gray-200"
                )}>
                  {app.status === 'locked' ? 'Unlock Access' : 'Add to Workspace'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- MOCKUP 2: The Sidebar Hub ---
const Mockup2 = () => {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="flex bg-black min-h-[600px] rounded-xl border border-white/10 overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-20 bg-neutral-900 border-r border-white/10 flex flex-col items-center py-6 gap-4">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-4">
          <LayoutGrid className="w-6 h-6 text-black" />
        </div>
        <div className="w-full h-px bg-white/10 mb-2"></div>
        {APPS.filter(a => a.status === 'installed').map(app => (
          <div key={app.id} className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/20 flex items-center justify-center cursor-pointer transition-colors" title={app.name}>
            <app.icon className="w-5 h-5 text-gray-300" />
          </div>
        ))}
        <div className="mt-auto w-10 h-10 rounded-full border border-dashed border-gray-600 flex items-center justify-center text-gray-500 hover:text-white cursor-pointer">
          <Plus className="w-5 h-5" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
         <SectionHeader title="Concept 2: The Dock & Hub" description="Sidebar provides quick access to installed apps. Main area acts as a comprehensive catalog." />
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2 bg-white/5 p-1 rounded-lg">
            {['all', 'productivity', 'health', 'utility'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  "px-4 py-1.5 rounded-md text-sm capitalize transition-colors",
                  activeTab === tab ? "bg-white text-black" : "text-gray-400 hover:text-white"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="text" placeholder="Search apps..." className="bg-white/5 border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-sm text-white focus:outline-none focus:border-white/30 w-64" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {APPS.map(app => (
            <div key={app.id} className="bg-neutral-900 border border-white/5 p-5 rounded-xl flex flex-col gap-4 hover:border-white/20 transition-colors">
              <div className="flex justify-between items-start">
                 <div className={`${app.color} w-10 h-10 rounded-lg flex items-center justify-center`}>
                    <app.icon className="w-5 h-5 text-white" />
                 </div>
                 {app.status === 'installed' ? (
                   <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full">Installed</span>
                 ) : (
                   <button className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-full transition-colors">
                     Get
                   </button>
                 )}
              </div>
              <div>
                <h3 className="font-medium text-white">{app.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{app.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- MOCKUP 3: The "Unified" Dashboard Widget ---
const Mockup3 = () => {
  return (
    <div className="p-8 bg-gradient-to-br from-gray-900 to-black min-h-[600px] rounded-xl border border-white/10">
      <SectionHeader title="Concept 3: Unified Dashboard" description="All apps in one unified grid. Status is indicated by opacity and action buttons overlay." />
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {APPS.map(app => {
          const isInstalled = app.status === 'installed';
          return (
            <div 
              key={app.id} 
              className={clsx(
                "relative group aspect-square rounded-2xl p-6 flex flex-col justify-between transition-all duration-300",
                isInstalled 
                  ? "bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] cursor-pointer" 
                  : "bg-black/40 border border-white/5 opacity-70 grayscale hover:grayscale-0 hover:opacity-100"
              )}
            >
              {/* Action Overlay for Non-Installed */}
              {!isInstalled && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-sm rounded-2xl z-10">
                  <button className="bg-white text-black px-4 py-2 rounded-full font-medium text-sm transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    {app.status === 'locked' ? 'Upgrade' : 'Install'}
                  </button>
                </div>
              )}

              <div className="flex justify-between items-start">
                <div className={clsx(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg",
                  isInstalled ? app.color : "bg-gray-800"
                )}>
                  <app.icon className="w-6 h-6 text-white" />
                </div>
                {isInstalled && <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>}
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white tracking-tight">{app.name}</h3>
                <p className="text-xs text-gray-400 mt-1 font-medium uppercase tracking-wider">{app.status}</p>
              </div>
            </div>
          );
        })}
        
        {/* "Coming Soon" Placeholder */}
        <div className="aspect-square rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-gray-600 gap-2">
           <Plus className="w-8 h-8" />
           <span className="text-sm font-medium">Suggest an App</span>
        </div>
      </div>
    </div>
  );
};

// --- MOCKUP 4: The Spotlight / List View ---
const Mockup4 = () => {
  return (
    <div className="p-8 bg-neutral-950 min-h-[600px] rounded-xl border border-white/10">
      <SectionHeader title="Concept 4: The Spotlight List" description="Clean, informative list view. Best for scaling if we add many more apps." />

      {/* Featured / Quick Access Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-gradient-to-r from-violet-900/50 to-fuchsia-900/50 rounded-xl p-6 border border-white/10 relative overflow-hidden group cursor-pointer">
           <div className="relative z-10">
             <h3 className="text-white font-bold text-lg mb-1">Back to Projects</h3>
             <p className="text-gray-300 text-sm mb-4">You have 3 deadlines today.</p>
             <div className="flex items-center gap-2 text-xs font-medium bg-white/10 w-fit px-3 py-1 rounded-full text-white group-hover:bg-white group-hover:text-black transition-colors">
               Open Projects <ExternalLink className="w-3 h-3" />
             </div>
           </div>
           <LayoutGrid className="absolute -bottom-4 -right-4 w-32 h-32 text-white/5 rotate-12" />
        </div>
        <div className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 rounded-xl p-6 border border-white/10 relative overflow-hidden group cursor-pointer">
           <div className="relative z-10">
             <h3 className="text-white font-bold text-lg mb-1">Quick Task</h3>
             <p className="text-gray-300 text-sm mb-4">Capture a thought before it's gone.</p>
             <div className="flex items-center gap-2 text-xs font-medium bg-white/10 w-fit px-3 py-1 rounded-full text-white group-hover:bg-white group-hover:text-black transition-colors">
               Add Todo <Plus className="w-3 h-3" />
             </div>
           </div>
           <CheckSquare className="absolute -bottom-4 -right-4 w-32 h-32 text-white/5 rotate-12" />
        </div>
      </div>

      {/* Detailed List */}
      <div className="space-y-2">
        <div className="flex items-center px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="w-10"></div>
          <div className="flex-1">Application</div>
          <div className="w-32 hidden md:block">Category</div>
          <div className="w-24">Status</div>
          <div className="w-10"></div>
        </div>
        {APPS.map(app => (
          <div key={app.id} className="group flex items-center p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all">
            <div className="w-12 flex justify-center">
              <div className={`${app.color} bg-opacity-20 p-2 rounded-lg`}>
                <app.icon className={`w-5 h-5 ${app.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
            <div className="flex-1 px-4">
              <h4 className="text-white font-medium">{app.name}</h4>
              <p className="text-gray-400 text-xs md:hidden">{app.description}</p>
            </div>
            <div className="w-32 hidden md:block text-sm text-gray-400">Productivity</div>
            <div className="w-24">
              {app.status === 'installed' && <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-500/10 text-green-400 text-xs font-medium ring-1 ring-inset ring-green-500/20">Active</span>}
              {app.status === 'available' && <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs font-medium ring-1 ring-inset ring-blue-500/20">Install</span>}
              {app.status === 'locked' && <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-500/10 text-gray-400 text-xs font-medium ring-1 ring-inset ring-gray-500/20">Locked</span>}
            </div>
            <div className="w-10 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <button className="p-1 hover:bg-white/20 rounded">
                 <MoreVertical className="w-4 h-4 text-gray-400" />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- MOCKUP 5: The Minimalist Cards ---
const Mockup5 = () => {
  return (
    <div className="p-8 bg-zinc-950 min-h-[600px] rounded-xl border border-white/10">
      <SectionHeader title="Concept 5: Minimalist Cards" description="Focus on iconography and simplicity. Very Apple-esque." />

      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-6">Your Suite</h3>
      
      <div className="flex flex-wrap gap-6 justify-center md:justify-start">
        {APPS.map(app => (
          <div key={app.id} className="flex flex-col items-center gap-3 group w-24">
             <div className={clsx(
               "w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-105",
               app.status === 'installed' ? app.color : "bg-gray-800"
             )}>
               <app.icon className="w-10 h-10 text-white drop-shadow-md" />
               
               {app.status !== 'installed' && (
                 <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center backdrop-blur-[1px]">
                    {app.status === 'locked' ? <Lock className="w-6 h-6 text-white/70" /> : <Download className="w-6 h-6 text-white/70" />}
                 </div>
               )}
             </div>
             <div className="text-center">
               <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{app.name}</span>
               {app.status === 'installed' && <div className="w-1 h-1 bg-white rounded-full mx-auto mt-1 opacity-50"></div>}
             </div>
          </div>
        ))}
        
        {/* Add Button */}
        <div className="flex flex-col items-center gap-3 group w-24">
           <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-all cursor-pointer">
             <Plus className="w-8 h-8 text-gray-500 group-hover:text-white" />
           </div>
           <span className="text-sm font-medium text-gray-500">Add</span>
        </div>
      </div>
    </div>
  );
};

export default function AppSelectorPage() {
  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
            App Selector Concepts
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Exploring different ways to present the "My Apps" vs. "Available Apps" hierarchy for the main dashboard.
          </p>
        </div>

        <Mockup1 />
        <Mockup2 />
        <Mockup3 />
        <Mockup4 />
        <Mockup5 />
        
        <div className="bg-blue-900/20 border border-blue-500/20 p-6 rounded-xl text-center">
           <h3 className="text-blue-400 font-bold mb-2">Which one works best?</h3>
           <p className="text-blue-200/70">These components are isolated and can be easily moved into the production `WorkspaceLayout` or `Dashboard`.</p>
        </div>
      </div>
    </div>
  );
}
