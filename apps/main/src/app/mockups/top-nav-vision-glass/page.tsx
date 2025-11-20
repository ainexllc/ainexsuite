'use client';

import React, { useState } from 'react';
import { 
  LayoutGrid, Book, PenTool, CheckSquare, 
  Target, Image as ImageIcon, TrendingUp, Activity, 
  Dumbbell, GitBranch, Home
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

// --- Data ---

const APPS = [
  { id: 'dashboard', name: 'Home', icon: Home, color: 'from-gray-500 to-slate-600' },
  { id: 'projects', name: 'Projects', icon: LayoutGrid, color: 'from-violet-500 to-indigo-600' },
  { id: 'notes', name: 'Notes', icon: Book, color: 'from-amber-400 to-orange-500' },
  { id: 'journey', name: 'Journey', icon: PenTool, color: 'from-fuchsia-500 to-pink-600' },
  { id: 'todo', name: 'Tasks', icon: CheckSquare, color: 'from-blue-400 to-cyan-500' },
  { id: 'track', name: 'Track', icon: Target, color: 'from-emerald-400 to-green-600' },
  { id: 'moments', name: 'Moments', icon: ImageIcon, color: 'from-rose-400 to-red-500' },
  { id: 'grow', name: 'Grow', icon: TrendingUp, color: 'from-indigo-400 to-violet-500' },
  { id: 'pulse', name: 'Pulse', icon: Activity, color: 'from-red-500 to-orange-600' },
  { id: 'fit', name: 'Fit', icon: Dumbbell, color: 'from-orange-500 to-amber-500' },
  { id: 'workflow', name: 'Workflow', icon: GitBranch, color: 'from-teal-400 to-emerald-600' },
];

// ============================================================================
// Vision Glass Top Nav
// ============================================================================
const VisionGlassNav = () => {
  const [active, setActive] = useState('dashboard');

  return (
    <div className="relative w-full bg-black border-b border-white/10">
        {/* Scrollable Container */}
        <div className="flex items-start justify-start md:justify-center gap-2 px-4 py-4 overflow-x-auto scrollbar-hide w-full">
          {APPS.map((app) => {
            const isActive = active === app.id;
            
            return (
              <button
                key={app.id}
                onClick={() => setActive(app.id)}
                className="group flex flex-col items-center gap-2 min-w-[72px] pb-2 outline-none"
              >
                {/* Glass Icon Container */}
                <motion.div 
                   whileHover={{ y: -4 }}
                   whileTap={{ scale: 0.95 }}
                   className={clsx(
                     "relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300",
                     "bg-white/5 backdrop-blur-md border border-white/10 shadow-lg",
                     isActive ? "ring-2 ring-blue-500/50 bg-white/10" : "group-hover:bg-white/10"
                   )}
                >
                  {/* Inner Gradient Sphere */}
                  <div className={clsx(
                    "w-10 h-10 rounded-xl flex items-center justify-center shadow-inner bg-gradient-to-br",
                    app.color
                  )}>
                     <app.icon className="w-5 h-5 text-white drop-shadow-md" />
                  </div>
                  
                  {/* Active Indicator Dot (Optional, or just rely on ring/glow) */}
                  {isActive && (
                    <motion.div 
                      layoutId="active-dot"
                      className="absolute -bottom-1 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                    />
                  )}
                </motion.div>

                {/* App Name */}
                <span className={clsx(
                  "text-[11px] font-medium tracking-wide transition-colors duration-200",
                  isActive ? "text-white" : "text-gray-500 group-hover:text-gray-300"
                )}>
                  {app.name}
                </span>
              </button>
            );
          })}
        </div>
    </div>
  );
};

export default function VisionGlassPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      <div className="p-12 text-center space-y-4">
         <h1 className="text-4xl font-bold">Vision Glass Navigation</h1>
         <p className="text-gray-400">Combining layout 1 with Vision Pro styling.</p>
      </div>

      {/* Mockup Context */}
      <div className="max-w-[1440px] mx-auto border border-white/10 rounded-xl overflow-hidden bg-black shadow-2xl">
         
         {/* Top Bar */}
         <div className="h-14 bg-black/50 flex items-center justify-between px-6 border-b border-white/5">
            <div className="flex items-center gap-2 font-bold text-lg">
               <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center">
                  <span className="text-xs text-white">AI</span>
               </div>
               AINex
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
               <span>Good Morning, User</span>
               <div className="w-8 h-8 bg-gray-800 rounded-full"></div>
            </div>
         </div>

         {/* THE NAVIGATION */}
         <VisionGlassNav />

         {/* Page Content Placeholder */}
         <div className="p-8 min-h-[400px] bg-grid-white/[0.02]">
            <div className="bg-white/5 border border-white/5 rounded-2xl p-8 max-w-2xl mx-auto text-center">
               <h2 className="text-2xl font-bold mb-2">Dashboard Content</h2>
               <p className="text-gray-400">
                 The navigation bar above persists across the app, allowing 1-click switching between contexts.
                 The &quot;Glass&quot; aesthetic makes it feel premium and raised above the content.
               </p>
            </div>
         </div>

      </div>
    </div>
  );
}
