'use client';

import React, { useState } from 'react';
import {
  LayoutGrid, Book, PenTool, CheckSquare,
  Target, Image as ImageIcon, TrendingUp, Activity,
  Dumbbell, GitBranch, Plus, Lock,
  Download, MoreHorizontal,
  Clock, Play
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

// --- Data & Types ---

type AppStatus = 'installed' | 'available' | 'locked';
type Category = 'productivity' | 'health' | 'creative' | 'utility';

interface AppData {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: AppStatus;
  category: Category;
  color: string;
  gradient: string;
  notifications?: number;
  lastActive?: string;
}

const APPS: AppData[] = [
  { 
    id: 'projects', name: 'Projects', description: 'Project management', 
    icon: LayoutGrid, status: 'installed', category: 'productivity',
    color: 'bg-violet-500', gradient: 'from-violet-500 to-indigo-600',
    notifications: 3, lastActive: '2m ago'
  },
  { 
    id: 'notes', name: 'Notes', description: 'Knowledge base', 
    icon: Book, status: 'installed', category: 'productivity',
    color: 'bg-yellow-500', gradient: 'from-amber-400 to-orange-500',
    lastActive: '1h ago'
  },
  { 
    id: 'journey', name: 'Journey', description: 'Personal journal', 
    icon: PenTool, status: 'installed', category: 'creative',
    color: 'bg-purple-500', gradient: 'from-fuchsia-500 to-pink-600',
    notifications: 1
  },
  { 
    id: 'todo', name: 'Todo', description: 'Task manager', 
    icon: CheckSquare, status: 'available', category: 'productivity',
    color: 'bg-blue-500', gradient: 'from-blue-400 to-cyan-500'
  },
  { 
    id: 'track', name: 'Track', description: 'Habit tracker', 
    icon: Target, status: 'available', category: 'productivity',
    color: 'bg-green-500', gradient: 'from-emerald-400 to-green-600'
  },
  { 
    id: 'moments', name: 'Moments', description: 'Photo gallery', 
    icon: ImageIcon, status: 'locked', category: 'creative',
    color: 'bg-pink-500', gradient: 'from-rose-400 to-red-500'
  },
  { 
    id: 'grow', name: 'Grow', description: 'Personal growth', 
    icon: TrendingUp, status: 'locked', category: 'health',
    color: 'bg-indigo-500', gradient: 'from-indigo-400 to-violet-500'
  },
  { 
    id: 'pulse', name: 'Pulse', description: 'Health monitor', 
    icon: Activity, status: 'available', category: 'health',
    color: 'bg-red-500', gradient: 'from-red-500 to-orange-600'
  },
  { 
    id: 'fit', name: 'Fit', description: 'Workout tracker', 
    icon: Dumbbell, status: 'locked', category: 'health',
    color: 'bg-orange-500', gradient: 'from-orange-500 to-amber-500'
  },
  { 
    id: 'workflow', name: 'Workflow', description: 'Automation', 
    icon: GitBranch, status: 'available', category: 'utility',
    color: 'bg-emerald-500', gradient: 'from-teal-400 to-emerald-600'
  },
];

// --- Shared Components ---

const SectionHeader = ({ title, description }: { title: string, description: string }) => (
  <div className="mb-10 border-b border-white/10 pb-6">
    <h2 className="text-3xl font-bold text-white tracking-tight mb-2">{title}</h2>
    <p className="text-gray-400 text-lg">{description}</p>
  </div>
);

// ============================================================================
// VARIATION 1: Vision OS (Glass & Depth)
// ============================================================================
const VariationVisionOS = () => {
  return (
    <div className="p-12 bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center min-h-[500px] rounded-3xl overflow-hidden relative">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xl"></div>
      <div className="relative z-10">
        <SectionHeader title="Variation A: Vision Glass" description="High depth, frosted glass, and rounder curvature. Feels spatial and immersive." />
        
        <div className="flex flex-wrap gap-8 justify-center">
          {APPS.map((app) => (
            <motion.div 
              key={app.id}
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="group flex flex-col items-center gap-3 cursor-pointer"
            >
              <div className={clsx(
                "relative w-[88px] h-[88px] rounded-full flex items-center justify-center shadow-2xl border border-white/20 transition-all duration-300",
                "bg-white/10 backdrop-blur-md group-hover:bg-white/20",
                app.status !== 'installed' && "grayscale opacity-80"
              )}>
                {/* Inner Gradient Sphere */}
                <div className={clsx(
                  "w-16 h-16 rounded-full flex items-center justify-center shadow-inner bg-gradient-to-br",
                  app.gradient
                )}>
                   <app.icon className="w-8 h-8 text-white drop-shadow-md" />
                </div>
                
                {/* Locked/Download Indicator */}
                {app.status !== 'installed' && (
                  <div className="absolute -top-1 -right-1 w-8 h-8 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 shadow-lg">
                    {app.status === 'locked' ? <Lock className="w-4 h-4 text-white" /> : <Download className="w-4 h-4 text-white" />}
                  </div>
                )}
              </div>
              <span className="text-sm font-medium text-white drop-shadow-md tracking-wide">{app.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// VARIATION 2: Midnight OLED (Neon & Contrast)
// ============================================================================
const VariationOLED = () => {
  return (
    <div className="p-12 bg-black min-h-[500px] rounded-3xl border border-zinc-800">
      <SectionHeader title="Variation B: Midnight OLED" description="Pure black, thin glowing borders, and high contrast. Tech-focused and precise." />
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {APPS.map((app) => (
          <motion.div 
            key={app.id}
            whileHover={{ scale: 1.02 }}
            className="group relative bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800 hover:border-zinc-600 transition-colors cursor-pointer overflow-hidden"
          >
            {/* Hover Glow Effect */}
            <div className={clsx(
              "absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-br",
              app.gradient
            )}></div>

            <div className="relative z-10 flex flex-col h-full items-center text-center gap-4">
              <div className={clsx(
                "w-14 h-14 rounded-xl flex items-center justify-center border border-white/5",
                "bg-black shadow-[0_0_15px_rgba(0,0,0,0.5)]",
                app.status === 'installed' ? "text-white" : "text-zinc-600"
              )}>
                <app.icon className={clsx(
                  "w-7 h-7 transition-all duration-300",
                  app.status === 'installed' ? "group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" : ""
                )} />
              </div>
              
              <div>
                <h3 className={clsx(
                  "font-semibold text-sm tracking-wider",
                  app.status === 'installed' ? "text-white" : "text-zinc-500"
                )}>{app.name}</h3>
                <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest">{app.status}</p>
              </div>
            </div>
            
            {/* Status Dot */}
            {app.status === 'installed' && (
              <div className={clsx(
                "absolute top-3 right-3 w-1.5 h-1.5 rounded-full shadow-[0_0_5px_currentColor]",
                app.color.replace('bg-', 'text-')
              )}></div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// VARIATION 3: Quick Actions (Interactive)
// ============================================================================
const VariationQuickActions = () => {
  const [hoveredApp, setHoveredApp] = useState<string | null>(null);

  return (
    <div className="p-12 bg-neutral-950 min-h-[500px] rounded-3xl border border-neutral-800">
      <SectionHeader title="Variation C: Quick Actions" description="Icons expand on hover to reveal primary actions. Reduces clicks for power users." />
      
      <div className="flex flex-wrap gap-6 justify-center md:justify-start">
        {APPS.map((app) => (
          <div 
            key={app.id}
            className="relative"
            onMouseEnter={() => setHoveredApp(app.id)}
            onMouseLeave={() => setHoveredApp(null)}
          >
             <motion.div
               animate={{ 
                 width: hoveredApp === app.id && app.status === 'installed' ? 180 : 100,
                 height: 100
               }}
               className={clsx(
                 "rounded-2xl p-4 flex flex-col justify-between overflow-hidden transition-colors",
                 app.status === 'installed' 
                   ? "bg-neutral-800/50 border border-white/10 hover:bg-neutral-800" 
                   : "bg-neutral-900/30 border border-white/5 opacity-60"
               )}
             >
               {/* Normal State Content */}
               <div className="flex flex-col items-center gap-2 w-full transition-opacity duration-200">
                  <div className={clsx(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    app.status === 'installed' ? app.color : "bg-neutral-700"
                  )}>
                    <app.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className={clsx(
                    "text-xs font-medium whitespace-nowrap",
                    hoveredApp === app.id && app.status === 'installed' ? "opacity-0 hidden" : "text-neutral-400"
                  )}>
                    {app.name}
                  </span>
               </div>

               {/* Expanded Actions (Only if installed) */}
               {app.status === 'installed' && (
                 <div className={clsx(
                   "absolute inset-0 flex flex-col justify-center gap-2 p-3 bg-neutral-800 transition-opacity duration-300",
                   hoveredApp === app.id ? "opacity-100" : "opacity-0 pointer-events-none"
                 )}>
                    <button className="flex items-center gap-2 w-full bg-white text-black text-xs font-bold py-1.5 px-3 rounded hover:bg-gray-200 transition-colors">
                      <Play className="w-3 h-3 fill-current" /> Open
                    </button>
                    <button className="flex items-center gap-2 w-full bg-white/10 text-white text-xs font-medium py-1.5 px-3 rounded hover:bg-white/20 transition-colors">
                      <Plus className="w-3 h-3" /> New
                    </button>
                 </div>
               )}

               {/* Install Button for others */}
               {app.status !== 'installed' && (
                 <div className="absolute inset-x-0 bottom-2 flex justify-center">
                   {app.status === 'locked' ? <Lock className="w-3 h-3 text-gray-500" /> : <Download className="w-3 h-3 text-blue-400" />}
                 </div>
               )}

             </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// VARIATION 4: Categorized Shelves (Organization)
// ============================================================================
const VariationShelves = () => {
  const categories: Category[] = ['productivity', 'health', 'creative', 'utility'];

  return (
    <div className="p-12 bg-zinc-950 min-h-[500px] rounded-3xl border border-zinc-800">
      <SectionHeader title="Variation D: The Library" description="Categorized 'shelves' for better organization. Ideal for a growing suite of tools." />

      <div className="space-y-12">
        {categories.map(cat => {
           const catApps = APPS.filter(a => a.category === cat);
           if (catApps.length === 0) return null;

           return (
             <div key={cat}>
               <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <span className="w-1.5 h-1.5 bg-zinc-700 rounded-full"></span>
                 {cat}
               </h3>
               <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                 {catApps.map(app => (
                   <div key={app.id} className="group flex flex-col gap-2 w-24 flex-shrink-0 cursor-pointer">
                      <div className={clsx(
                        "aspect-square rounded-2xl flex items-center justify-center border transition-all duration-300",
                        app.status === 'installed' 
                          ? "bg-zinc-900 border-zinc-800 group-hover:border-zinc-600 group-hover:shadow-lg group-hover:-translate-y-1" 
                          : "bg-zinc-900/30 border-dashed border-zinc-800 opacity-60"
                      )}>
                         <div className={clsx(
                           "w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
                           app.status === 'installed' ? app.color : "bg-zinc-700"
                         )}>
                           <app.icon className="w-5 h-5 text-white" />
                         </div>
                         
                         {app.notifications ? (
                           <div className="absolute top-[-4px] right-[-4px] w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-zinc-950">
                             {app.notifications}
                           </div>
                         ) : null}
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-medium text-zinc-300 group-hover:text-white">{app.name}</p>
                      </div>
                   </div>
                 ))}
                 {/* Add Button per category */}
                 <div className="aspect-square w-24 rounded-2xl border-2 border-dashed border-zinc-800 flex items-center justify-center text-zinc-700 hover:text-zinc-500 hover:border-zinc-700 cursor-pointer transition-colors">
                   <Plus className="w-6 h-6" />
                 </div>
               </div>
             </div>
           );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// VARIATION 5: Info Tiles (Data-Rich Grid)
// ============================================================================
const VariationInfoTiles = () => {
  return (
    <div className="p-12 bg-slate-950 min-h-[500px] rounded-3xl border border-slate-800">
      <SectionHeader title="Variation E: Live Tiles" description="Larger touch targets that expose status and metadata directly on the grid." />
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {APPS.map((app) => (
          <div 
            key={app.id}
            className={clsx(
              "group p-4 rounded-2xl border transition-all duration-200 cursor-pointer",
              app.status === 'installed'
                ? "bg-slate-900/50 border-slate-800 hover:bg-slate-800 hover:border-slate-700"
                : "bg-slate-900/20 border-slate-800/50 opacity-60"
            )}
          >
             <div className="flex justify-between items-start mb-3">
                <div className={clsx(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  app.status === 'installed' ? app.color : "bg-slate-700"
                )}>
                  <app.icon className="w-5 h-5 text-white" />
                </div>
                {app.status === 'installed' ? (
                  <MoreHorizontal className="w-5 h-5 text-slate-600 hover:text-white transition-colors" />
                ) : (
                  <div className="px-2 py-1 bg-slate-800 rounded text-[10px] font-bold text-slate-400 uppercase">
                    {app.status === 'locked' ? 'Pro' : 'Get'}
                  </div>
                )}
             </div>
             
             <h3 className="text-white font-semibold text-base mb-0.5">{app.name}</h3>
             <p className="text-slate-400 text-xs line-clamp-1 mb-3">{app.description}</p>
             
             {app.status === 'installed' && (
               <div className="flex items-center gap-3 pt-3 border-t border-slate-800 text-xs text-slate-500">
                 {app.lastActive && (
                   <div className="flex items-center gap-1">
                     <Clock className="w-3 h-3" /> {app.lastActive}
                   </div>
                 )}
                 {app.notifications && (
                   <div className="flex items-center gap-1 text-blue-400 font-medium ml-auto">
                     <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span> {app.notifications} new
                   </div>
                 )}
               </div>
             )}
          </div>
        ))}
        
        {/* Promo Tile */}
        <div className="p-4 rounded-2xl border border-dashed border-slate-800 flex flex-col items-center justify-center text-center gap-2 hover:bg-slate-900/30 cursor-pointer transition-colors text-slate-500 hover:text-slate-300">
           <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center">
             <Plus className="w-5 h-5" />
           </div>
           <span className="text-sm font-medium">Browse Store</span>
        </div>
      </div>
    </div>
  );
};


// ============================================================================
// MAIN PAGE CONTAINER
// ============================================================================
export default function AppSelectorVariationsPage() {
  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto space-y-24">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
            Concept 5: Variations
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Refining the &quot;Minimalist Cards&quot; concept with 5 distinct visual and functional directions.
          </p>
        </div>

        <VariationVisionOS />
        <VariationOLED />
        <VariationQuickActions />
        <VariationShelves />
        <VariationInfoTiles />
        
        <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl text-center">
           <h3 className="text-white font-bold text-xl mb-2">Recommendation</h3>
           <p className="text-gray-400 max-w-2xl mx-auto">
             For a main dashboard, <strong>Variation B (Midnight OLED)</strong> offers the cleanest aesthetic that scales well.
             <strong>Variation C (Quick Actions)</strong> is best if we want to reduce clicks.
             <strong>Variation A (Vision)</strong> is best for a &quot;wow&quot; factor but might clash with standard web UI.
           </p>
        </div>
      </div>
    </div>
  );
}
