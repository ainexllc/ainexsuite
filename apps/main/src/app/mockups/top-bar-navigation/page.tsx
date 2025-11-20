'use client';

import React from 'react';
import {
  LayoutGrid, Book, PenTool, CheckSquare,
  Target, Image as ImageIcon, TrendingUp, Activity,
  Dumbbell, GitBranch, Search, Menu, Bell
} from 'lucide-react';
import { clsx } from 'clsx';

// --- Data ---

const APPS = [
  { id: 'projects', name: 'Projects', icon: LayoutGrid, color: 'bg-violet-500', gradient: 'from-violet-500 to-indigo-600' },
  { id: 'notes', name: 'Notes', icon: Book, color: 'bg-yellow-500', gradient: 'from-amber-400 to-orange-500' },
  { id: 'journey', name: 'Journey', icon: PenTool, color: 'bg-purple-500', gradient: 'from-fuchsia-500 to-pink-600' },
  { id: 'todo', name: 'Todo', icon: CheckSquare, color: 'bg-blue-500', gradient: 'from-blue-400 to-cyan-500' },
  { id: 'track', name: 'Track', icon: Target, color: 'bg-green-500', gradient: 'from-emerald-400 to-green-600' },
  { id: 'moments', name: 'Moments', icon: ImageIcon, color: 'bg-pink-500', gradient: 'from-rose-400 to-red-500' },
  { id: 'grow', name: 'Grow', icon: TrendingUp, color: 'bg-indigo-500', gradient: 'from-indigo-400 to-violet-500' },
  { id: 'pulse', name: 'Pulse', icon: Activity, color: 'bg-red-500', gradient: 'from-red-500 to-orange-600' },
  { id: 'fit', name: 'Fit', icon: Dumbbell, color: 'bg-orange-500', gradient: 'from-orange-500 to-amber-500' },
  { id: 'workflow', name: 'Workflow', icon: GitBranch, color: 'bg-emerald-500', gradient: 'from-teal-400 to-emerald-600' },
];

// --- Components ---

const MockupHeader = ({ title }: { title: string }) => (
  <div className="absolute top-0 left-0 bg-blue-600 text-white px-3 py-1 text-xs font-bold rounded-br-lg z-50 shadow-lg">
    {title}
  </div>
);

// ============================================================================
// CONCEPT 1: The "Dock" Top Bar
// Responsive: Scales icon size down, then horizontally scrolls on mobile.
// ============================================================================
const ConceptDock = () => {
  return (
    <div className="relative h-80 bg-[#050505] border border-white/10 rounded-xl overflow-hidden flex flex-col">
      <MockupHeader title="Concept 1: The Persistent Dock" />
      
      {/* Top Nav */}
      <div className="h-16 border-b border-white/5 flex items-center px-6 justify-between bg-black/50 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-4">
           <div className="w-8 h-8 bg-white rounded-full"></div>
           <span className="font-bold text-white hidden sm:block">AINex Suite</span>
        </div>
        
        {/* THE DOCK */}
        <div className="flex-1 mx-8 overflow-x-auto scrollbar-hide">
          <div className="flex items-center justify-center gap-3 min-w-max px-4">
            {APPS.map(app => (
              <div key={app.id} className="group relative flex flex-col items-center gap-1 cursor-pointer p-1">
                <div className={clsx(
                  "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1",
                  app.gradient
                )}>
                  <app.icon className="w-5 h-5 text-white drop-shadow-md" />
                </div>
                <span className="text-[10px] font-medium text-white/50 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100 absolute -bottom-4 whitespace-nowrap">
                  {app.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 text-gray-400">
           <Search className="w-5 h-5" />
           <div className="w-8 h-8 bg-gray-800 rounded-full"></div>
        </div>
      </div>

      {/* Content Placeholder */}
      <div className="flex-1 p-8 bg-grid-white/[0.02]">
         <div className="h-full w-full bg-white/5 rounded-xl flex items-center justify-center text-white/20">
            App Content Area
         </div>
      </div>
    </div>
  );
};

// ============================================================================
// CONCEPT 2: The "Compact" Ribbon
// Responsive: Just icons, very small, high density. Used in pro tools.
// ============================================================================
const ConceptRibbon = () => {
  return (
    <div className="relative h-80 bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden flex flex-col">
      <MockupHeader title="Concept 2: Compact Ribbon" />

      {/* Top Nav */}
      <div className="h-14 border-b border-white/10 flex items-center px-4 justify-between bg-[#0F0F0F]">
        <div className="flex items-center gap-3">
           <Menu className="w-5 h-5 text-gray-400" />
           <span className="font-bold text-white">Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
           <Bell className="w-5 h-5 text-gray-400" />
           <div className="w-7 h-7 bg-indigo-500 rounded-full flex items-center justify-center text-xs text-white">JD</div>
        </div>
      </div>

      {/* THE RIBBON (Immediately under nav) */}
      <div className="h-12 border-b border-white/5 bg-[#050505] flex items-center px-4 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-1 min-w-max">
          {APPS.map((app, i) => (
            <React.Fragment key={app.id}>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-white/10 transition-colors group">
                <div className={clsx("w-4 h-4 rounded-full flex items-center justify-center", app.color)}>
                  <app.icon className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="text-sm text-gray-400 group-hover:text-white font-medium">{app.name}</span>
              </button>
              {i < APPS.length - 1 && <div className="w-px h-4 bg-white/5 mx-1"></div>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Content Placeholder */}
      <div className="flex-1 p-6">
         <div className="grid grid-cols-3 gap-4 h-full">
            <div className="bg-white/5 rounded-lg col-span-2"></div>
            <div className="bg-white/5 rounded-lg"></div>
         </div>
      </div>
    </div>
  );
};

// ============================================================================
// CONCEPT 3: The "Floating" Bar
// Responsive: Floats over content, creates a "control center" feel.
// ============================================================================
const ConceptFloating = () => {
  return (
    <div className="relative h-80 bg-gradient-to-br from-slate-950 to-black border border-white/10 rounded-xl overflow-hidden flex flex-col">
      <MockupHeader title="Concept 3: Floating Pill" />

      {/* Standard Nav */}
      <div className="h-16 flex items-center px-6 justify-between">
         <div className="font-bold text-xl text-white tracking-tight">AINex</div>
         <div className="flex gap-4 text-sm font-medium text-gray-400">
            <span>Settings</span>
            <span>Help</span>
         </div>
      </div>

      {/* THE FLOATING BAR */}
      <div className="px-4 mb-6 flex justify-center">
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex items-center gap-2 overflow-x-auto max-w-full scrollbar-hide shadow-2xl">
           {APPS.map(app => (
             <div key={app.id} className="group relative p-2 rounded-xl hover:bg-white/10 cursor-pointer transition-all">
                <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br", app.gradient)}>
                   <app.icon className="w-4 h-4 text-white" />
                </div>
                {/* Tooltip */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  {app.name}
                </div>
             </div>
           ))}
           <div className="w-px h-8 bg-white/10 mx-1"></div>
           <div className="p-2 rounded-xl hover:bg-white/10 cursor-pointer">
              <Search className="w-5 h-5 text-gray-400" />
           </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-8 pb-8">
         <h1 className="text-2xl font-bold text-white mb-4">Welcome back</h1>
         <div className="flex gap-4 overflow-x-auto pb-4">
            {[1,2,3].map(i => <div key={i} className="min-w-[200px] h-32 bg-white/5 rounded-xl border border-white/5"></div>)}
         </div>
      </div>
    </div>
  );
};

// ============================================================================
// CONCEPT 4: The "Responsive Grid" Header
// Responsive: Unfolds into a full grid on mobile, horizontal strip on desktop.
// ============================================================================
const ConceptResponsiveHeader = () => {
  return (
    <div className="relative h-80 bg-zinc-950 border border-white/10 rounded-xl overflow-hidden flex flex-col">
      <MockupHeader title="Concept 4: Integrated Header Row" />

      {/* Integrated Header */}
      <div className="border-b border-white/10 bg-black py-4">
        <div className="px-6 flex items-center justify-between mb-4">
           <span className="font-bold text-white">AINex</span>
           <button className="md:hidden text-gray-400"><Menu /></button>
        </div>
        
        {/* THE APP ROW */}
        <div className="px-6 overflow-x-auto scrollbar-hide">
          <div className="flex gap-6 min-w-max">
             {APPS.map(app => (
               <div key={app.id} className="flex flex-col items-center gap-2 group cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
                  <div className={clsx(
                    "w-12 h-12 rounded-full flex items-center justify-center border-2 border-transparent group-hover:border-white/20 transition-all",
                    "bg-zinc-900"
                  )}>
                     <div className={clsx("w-2 h-2 rounded-full", app.color)}></div>
                     <app.icon className="w-5 h-5 text-white absolute" />
                  </div>
                  <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{app.name}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center text-gray-600">
         Page Content
      </div>
    </div>
  );
};


export default function TopBarNavigationPage() {
  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black tracking-tighter text-white">
            Top Navigation Concepts
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Exploring ways to place the app &quot;launcher&quot; at the top of the interface for immediate access.
          </p>
        </div>

        <div className="space-y-12">
          <ConceptDock />
          <ConceptRibbon />
          <ConceptFloating />
          <ConceptResponsiveHeader />
        </div>
        
        <div className="bg-blue-900/20 border border-blue-500/20 p-6 rounded-xl">
           <h3 className="text-blue-400 font-bold mb-2">UX Note</h3>
           <p className="text-blue-200/70 text-sm">
             Placing apps at the top (Concept 1 or 3) is excellent for &quot;Hub&quot; style dashboards where switching context is the primary action.
             It mimics OS-level docks (macOS/iPadOS), making it intuitive.
           </p>
        </div>
      </div>
    </div>
  );
}
