'use client';

import React, { useState } from 'react';
import { 
  BookOpen, Flame, CalendarCheck2, Clock3, BarChart3, 
  Sparkles, PenLine, Plus, ArrowRight, Tag, MoreHorizontal,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

// --- Mock Data ---
const STATS = {
  streak: 12,
  weekCount: 4,
  cadence: 3.5,
  averageWords: 420,
  mostCommonMood: { label: 'Reflective', description: 'You are looking inward lately.' }
};

const LATEST_ENTRY = {
  id: '1',
  title: 'The Silence of Morning',
  preview: 'Woke up before the sun today. There is a specific quality to the silence at 5am that feels heavy, but in a comforting way. I made coffee and sat by the window...',
  date: '2 hours ago',
  tags: ['Morning', 'Routine', 'Calm']
};

const ENTRIES = [
  { id: '1', title: 'The Silence of Morning', preview: 'Woke up before the sun today...', date: '2 hours ago', tags: ['Morning', 'Routine'] },
  { id: '2', title: 'Project Kickoff Thoughts', preview: 'Excited but nervous about the new scope...', date: 'Yesterday', tags: ['Work'] },
  { id: '3', title: 'Weekend Plans', preview: 'Thinking of heading to the coast...', date: '3 days ago', tags: [] },
];

// --- Components ---

const GlassPanel = ({ children, className, hoverEffect = false }: { children: React.ReactNode, className?: string, hoverEffect?: boolean }) => (
  <div className={clsx(
    "bg-[#0A0A0A] border border-white/5 rounded-[20px] p-6 transition-all duration-300 relative overflow-hidden",
    hoverEffect && "hover:border-white/10 hover:bg-[#0F0F0F] group",
    className
  )}>
    {children}
  </div>
);

// --- 1. RESTYLED HEADER ---
const RestyledHeader = () => (
  <div className="bg-[#0A0A0A] border border-white/5 rounded-[24px] p-8 mb-8 relative overflow-hidden">
     {/* Subtle gradient glow */}
     <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-[100px] pointer-events-none"></div>

     <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="space-y-2">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-bold uppercase tracking-widest">
              <Sparkles className="w-3 h-3" /> Notebook Lite
           </div>
           <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">
              Welcome back, Dino.
           </h1>
           <p className="text-gray-400 max-w-xl leading-relaxed">
              Move from an idea to a saved entry in seconds. This pared-back dashboard keeps the writing tools up front so you can jump straight into your next note.
           </p>
        </div>

        <div className="flex flex-wrap gap-3">
           <button className="h-11 px-6 rounded-full bg-white text-black font-semibold hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Entry
           </button>
           {/* Draft button example */}
           <button className="h-11 px-6 rounded-full border border-white/10 hover:bg-white/5 text-gray-300 hover:text-white font-medium transition-colors flex items-center gap-2">
              <PenLine className="w-4 h-4" /> Resume Draft
           </button>
        </div>
     </div>
     
     {/* Prompt Card embedded in header */}
     <div className="mt-8 pt-6 border-t border-white/5 flex items-start gap-4">
        <div className="p-2 bg-sky-500/10 rounded-xl text-sky-400 mt-1">
           <Sparkles className="w-4 h-4" />
        </div>
        <div>
           <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-1">Daily Spark</h3>
           <p className="text-lg text-white font-medium">"What is a small win you had today that went unnoticed?"</p>
        </div>
     </div>
  </div>
);

// --- 2. RESTYLED STATS CARD ---
const RestyledStatsCard = () => {
  const metrics = [
    { label: 'Streak', value: '12 days', icon: Flame, color: 'text-orange-400', desc: 'Keep it going!' },
    { label: 'This Week', value: '4 entries', icon: CalendarCheck2, color: 'text-green-400', desc: 'Consistent flow.' },
    { label: 'Avg Words', value: '420', icon: BarChart3, color: 'text-blue-400', desc: 'Deep thoughts.' },
  ];

  return (
    <GlassPanel className="flex flex-col gap-6">
       <div className="flex items-center justify-between">
          <div>
             <h3 className="text-lg font-semibold text-white">Writing Health</h3>
             <p className="text-sm text-gray-500">Momentum across your archive.</p>
          </div>
          <div className="p-2 bg-white/5 rounded-lg">
             <Flame className="w-4 h-4 text-orange-400" />
          </div>
       </div>

       <div className="grid grid-cols-2 gap-3">
          {metrics.map((m, i) => (
             <div key={i} className={clsx(
               "p-4 rounded-2xl border border-white/5 bg-white/[0.02]",
               i === 2 && "col-span-2"
             )}>
                <div className="flex items-center gap-2 mb-2">
                   <m.icon className={clsx("w-3.5 h-3.5", m.color)} />
                   <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{m.label}</span>
                </div>
                <div className="text-xl font-bold text-white">{m.value}</div>
                <div className="text-xs text-gray-600 mt-1">{m.desc}</div>
             </div>
          ))}
       </div>
       
       {/* Mood Trend */}
       <div className="p-4 rounded-2xl bg-sky-500/5 border border-sky-500/10">
          <div className="flex items-center justify-between mb-2">
             <span className="text-[10px] font-bold uppercase tracking-wider text-sky-500/70">Mood Trend</span>
             <Sparkles className="w-3 h-3 text-sky-500" />
          </div>
          <div className="text-white font-medium">Reflective</div>
          <div className="text-xs text-sky-500/60 mt-1">You are looking inward lately.</div>
       </div>
    </GlassPanel>
  );
};

// --- 3. RESTYLED LATEST ENTRY ---
const RestyledLatestEntry = () => (
  <GlassPanel hoverEffect={true}>
     <div className="flex items-center justify-between mb-6">
        <div>
           <h3 className="text-lg font-semibold text-white">Latest Entry</h3>
           <p className="text-sm text-gray-500">Jump back in.</p>
        </div>
        <BookOpen className="w-5 h-5 text-gray-600" />
     </div>

     <div className="space-y-4">
        <div className="flex items-center gap-2">
           <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{LATEST_ENTRY.date}</span>
           <span className="w-1 h-1 rounded-full bg-gray-700"></span>
           <div className="flex gap-1">
              {LATEST_ENTRY.tags.map(t => (
                 <span key={t} className="text-xs text-gray-500">#{t}</span>
              ))}
           </div>
        </div>
        
        <div>
           <h4 className="text-xl font-bold text-white mb-2 group-hover:text-sky-400 transition-colors">{LATEST_ENTRY.title}</h4>
           <p className="text-gray-400 leading-relaxed text-sm line-clamp-3">
              {LATEST_ENTRY.preview}
           </p>
        </div>

        <div className="pt-4 flex gap-2">
           <button className="px-4 py-2 rounded-full border border-white/10 text-xs font-medium text-white hover:bg-white/5 transition-colors flex items-center gap-2">
              Preview <ArrowRight className="w-3 h-3" />
           </button>
           <button className="px-4 py-2 rounded-full bg-white/10 text-xs font-medium text-white hover:bg-white/20 transition-colors flex items-center gap-2">
              <PenLine className="w-3 h-3" /> Edit
           </button>
        </div>
     </div>
  </GlassPanel>
);

// --- 4. RESTYLED LIST ---
const RestyledList = () => (
  <div className="space-y-4">
     <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="font-semibold text-gray-300">Recent Entries</h3>
        <div className="flex gap-2">
           <button className="p-1.5 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white"><ChevronLeft className="w-4 h-4" /></button>
           <span className="text-sm text-gray-500 self-center">1 / 5</span>
           <button className="p-1.5 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white"><ChevronRight className="w-4 h-4" /></button>
        </div>
     </div>

     {ENTRIES.map(entry => (
        <div key={entry.id} className="group flex items-start gap-4 p-4 rounded-2xl hover:bg-white/[0.02] border border-transparent hover:border-white/5 transition-all cursor-pointer">
           <div className="w-12 h-12 rounded-xl bg-white/[0.03] flex-shrink-0 flex flex-col items-center justify-center border border-white/5">
              <span className="text-xs font-bold text-gray-400">OCT</span>
              <span className="text-sm font-bold text-white">24</span>
           </div>
           <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                 <h4 className="font-semibold text-gray-200 truncate group-hover:text-sky-400 transition-colors">{entry.title}</h4>
                 <span className="text-xs text-gray-600 whitespace-nowrap ml-2">{entry.date}</span>
              </div>
              <p className="text-sm text-gray-500 truncate mt-0.5">{entry.preview}</p>
              <div className="flex gap-2 mt-2">
                 {entry.tags.map(t => (
                    <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-500 border border-white/5">#{t}</span>
                 ))}
              </div>
           </div>
        </div>
     ))}
  </div>
);


export default function DashboardRestylePage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
         {/* New Header Layout */}
         <RestyledHeader />

         <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
            {/* Main Column */}
            <div className="space-y-8">
               <RestyledList />
            </div>

            {/* Sidebar Column (Sticky) */}
            <div className="space-y-6">
               <RestyledStatsCard />
               <RestyledLatestEntry />
               
               {/* Quick Tags */}
               <GlassPanel>
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="font-semibold text-white text-sm">Quick Filters</h3>
                     <Tag className="w-3.5 h-3.5 text-gray-500" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                     {['Work', 'Ideas', 'Personal', 'Morning', 'Review', 'Health'].map(t => (
                        <button key={t} className="px-3 py-1.5 rounded-full border border-white/5 bg-white/[0.02] hover:bg-white/10 hover:border-white/10 text-xs text-gray-400 hover:text-white transition-colors">
                           #{t}
                        </button>
                     ))}
                  </div>
               </GlassPanel>
            </div>
         </div>
      </div>
    </div>
  );
}
