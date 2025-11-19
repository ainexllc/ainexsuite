'use client';

import React, { useState } from 'react';
import { 
  BookOpen, Flame, Calendar, Clock, BarChart2, 
  PenTool, Sparkles, Plus, Search, Filter, 
  ChevronRight, MoreHorizontal, CalendarDays,
  Zap
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

// --- Types ---
type ViewMode = 'grid' | 'list';

// --- Mock Data ---
const ENTRIES = [
  { id: 1, title: 'Reflections on the Quarter', preview: 'The last three months have been a whirlwind of activity. I started by focusing on...', date: '2 hours ago', tags: ['Quarterly Review', 'Work'], mood: 'Productive' },
  { id: 2, title: 'Morning Walk Ideas', preview: 'The mist was heavy this morning. It reminded me of that trip to the coast...', date: 'Yesterday', tags: ['Nature', 'Ideas'], mood: 'Calm' },
  { id: 3, title: 'Project Alpha Launch', preview: 'We finally shipped it! The team is exhausted but the energy is high.', date: '3 days ago', tags: ['Work', 'Milestone'], mood: 'Excited' },
];

const STATS = [
  { label: 'Streak', value: '12 Days', icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { label: 'Entries', value: '48', icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { label: 'Words', value: '12.4k', icon: BarChart2, color: 'text-purple-400', bg: 'bg-purple-500/10' },
];

// --- Components ---

const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={clsx(
    "bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-6",
    className
  )}>
    {children}
  </div>
);

const StatCard = ({ stat }: { stat: any }) => (
  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
    <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center", stat.bg)}>
      <stat.icon className={clsx("w-6 h-6", stat.color)} />
    </div>
    <div>
      <p className="text-sm text-gray-400">{stat.label}</p>
      <p className="text-xl font-bold text-white">{stat.value}</p>
    </div>
  </div>
);

const EntryCard = ({ entry }: { entry: any }) => (
  <motion.div 
    whileHover={{ scale: 1.01 }}
    className="group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 rounded-2xl p-6 transition-all cursor-pointer"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="flex gap-2">
        {entry.tags.map((tag: string) => (
          <span key={tag} className="px-2 py-1 rounded-md bg-white/5 text-[10px] uppercase tracking-wider font-medium text-gray-400 border border-white/5">
            {tag}
          </span>
        ))}
      </div>
      <span className="text-xs text-gray-500 font-medium">{entry.date}</span>
    </div>
    
    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-sky-400 transition-colors">{entry.title}</h3>
    <p className="text-sm text-gray-400 leading-relaxed line-clamp-2 mb-4">
      {entry.preview}
    </p>

    <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
       <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-2 h-2 rounded-full bg-sky-400"></div>
          {entry.mood}
       </div>
       <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
    </div>
  </motion.div>
);

// ============================================================================
// DASHBOARD REDESIGN MOCKUP
// ============================================================================
export default function DashboardRedesignPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-sans bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-900/20 via-[#050505] to-[#050505]">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sky-400 mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Journey Workspace</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              Good Evening, Dino.
            </h1>
            <p className="text-gray-400 max-w-lg text-lg">
              Ready to capture today's moments? You're on a 12-day streak.
            </p>
          </div>

          <div className="flex gap-3">
             <button className="h-12 px-6 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-colors flex items-center gap-2">
                <Search className="w-4 h-4" />
                <span className="hidden md:inline">Search</span>
             </button>
             <button className="h-12 px-8 rounded-full bg-sky-500 hover:bg-sky-400 text-black font-bold transition-all shadow-[0_0_20px_rgba(14,165,233,0.3)] flex items-center gap-2">
                <Plus className="w-5 h-5" />
                New Entry
             </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {STATS.map((stat, i) => (
             <GlassCard key={i} className="flex items-center gap-4 !p-4">
                <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center", stat.bg)}>
                   <stat.icon className={clsx("w-6 h-6", stat.color)} />
                </div>
                <div>
                   <div className="text-2xl font-bold text-white">{stat.value}</div>
                   <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">{stat.label}</div>
                </div>
             </GlassCard>
           ))}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* Left Column: Entries */}
           <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                 <h2 className="text-xl font-semibold text-white">Recent Entries</h2>
                 <div className="flex gap-2">
                    <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                       <Filter className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                       <CalendarDays className="w-4 h-4" />
                    </button>
                 </div>
              </div>

              <div className="space-y-4">
                 {ENTRIES.map(entry => (
                   <EntryCard key={entry.id} entry={entry} />
                 ))}
              </div>
           </div>

           {/* Right Column: Tools / Spark */}
           <div className="space-y-6">
              <GlassCard className="relative overflow-hidden !border-sky-500/20">
                 <div className="absolute top-0 right-0 p-4 opacity-20">
                    <Zap className="w-24 h-24 text-sky-400 rotate-12" />
                 </div>
                 <h3 className="text-lg font-bold text-white mb-2 relative z-10">Daily Prompt</h3>
                 <p className="text-gray-400 text-sm mb-6 relative z-10">
                    "What is one small win you had today that went unnoticed?"
                 </p>
                 <button className="w-full py-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 text-sky-400 font-medium transition-colors relative z-10">
                    Answer Prompt
                 </button>
              </GlassCard>

              <div className="p-6 rounded-3xl border border-white/5 bg-white/[0.02]">
                 <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Tags</h3>
                 <div className="flex flex-wrap gap-2">
                    {['Work', 'Personal', 'Ideas', 'Health', 'Family', 'Travel'].map(tag => (
                       <span key={tag} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-gray-300 cursor-pointer transition-colors">
                          #{tag}
                       </span>
                    ))}
                 </div>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}
