'use client';

import React, { useState } from 'react';
import { 
  BookOpen, Flame, Calendar, Clock, BarChart2, 
  PenTool, Sparkles, Plus, Search, Filter, 
  ChevronRight, MoreHorizontal, CalendarDays,
  Zap, Layout, List, Grid, Sidebar, AlignLeft,
  Hash, MoreVertical, ArrowRight, Heart, Smile
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

// --- Data ---
const ENTRIES = [
  { id: 1, title: 'Reflections on the Quarter', preview: 'The last three months have been a whirlwind of activity. I started by focusing on the core infrastructure...', date: '2h ago', fullDate: 'Oct 24, 2025', tags: ['Review', 'Work'], mood: 'Productive' },
  { id: 2, title: 'Morning Walk Ideas', preview: 'The mist was heavy this morning. It reminded me of that trip to the coast where we saw the lighthouse...', date: 'Yesterday', fullDate: 'Oct 23, 2025', tags: ['Nature', 'Ideas'], mood: 'Calm' },
  { id: 3, title: 'Project Alpha Launch', preview: 'We finally shipped it! The team is exhausted but the energy is high. We need to remember to celebrate...', date: '3d ago', fullDate: 'Oct 21, 2025', tags: ['Milestone'], mood: 'Excited' },
  { id: 4, title: 'The Art of Stillness', preview: 'Reading a book about doing nothing. It is harder than it sounds. I feel the urge to check my phone...', date: '1w ago', fullDate: 'Oct 18, 2025', tags: ['Reading', 'Mindfulness'], mood: 'Peaceful' },
];

const STATS = [
  { label: 'Streak', value: '12', icon: Flame },
  { label: 'Entries', value: '48', icon: BookOpen },
  { label: 'Words', value: '12k', icon: BarChart2 },
];

// --- Helper Components ---
const Tag = ({ children, color = "bg-white/5 text-gray-400" }: { children: React.ReactNode, color?: string }) => (
  <span className={`px-2 py-1 rounded-md text-[10px] uppercase tracking-wider font-medium ${color} border border-white/5`}>
    {children}
  </span>
);

// ============================================================================
// 1. THE MINIMALIST STREAM (Clean, Text-Focus)
// ============================================================================
const VariationMinimalist = () => (
  <div className="h-full bg-[#050505] p-8 font-sans">
    <div className="max-w-2xl mx-auto">
      <header className="mb-12 border-b border-white/10 pb-8">
        <h1 className="text-3xl font-light text-white mb-2">Journal</h1>
        <div className="flex justify-between items-center">
           <p className="text-gray-500">Thursday, October 24</p>
           <button className="text-cyan-400 text-sm hover:text-cyan-300 flex items-center gap-1">
             <Plus className="w-4 h-4" /> New Entry
           </button>
        </div>
      </header>
      
      <div className="space-y-12">
        {ENTRIES.map(entry => (
          <div key={entry.id} className="group cursor-pointer">
            <div className="flex items-baseline justify-between mb-2">
               <h3 className="text-xl text-gray-200 group-hover:text-cyan-400 transition-colors">{entry.title}</h3>
               <span className="text-xs text-gray-600">{entry.date}</span>
            </div>
            <p className="text-gray-500 leading-relaxed mb-3 line-clamp-2 group-hover:text-gray-400 transition-colors">
              {entry.preview}
            </p>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
               {entry.tags.map(t => <span key={t} className="text-xs text-cyan-500/70">#{t}</span>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ============================================================================
// 2. THE TIMELINE (Vertical History)
// ============================================================================
const VariationTimeline = () => (
  <div className="h-full bg-[#080808] p-8">
    <div className="max-w-3xl mx-auto">
       <div className="flex justify-between items-center mb-12">
          <h2 className="text-2xl font-bold text-white">Your Timeline</h2>
          <button className="px-4 py-2 bg-teal-500/10 text-teal-400 rounded-full text-sm font-medium hover:bg-teal-500/20 transition-colors">
            + Write Today
          </button>
       </div>

       <div className="relative border-l border-white/10 ml-4 space-y-12">
          {ENTRIES.map(entry => (
            <div key={entry.id} className="relative pl-8 group">
               {/* Dot */}
               <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-zinc-800 border border-zinc-600 group-hover:bg-teal-500 group-hover:border-teal-400 transition-colors shadow-[0_0_0_4px_#080808]"></div>
               
               <div className="flex flex-col sm:flex-row gap-4">
                  <div className="sm:w-32 flex-shrink-0 pt-1">
                     <span className="text-sm font-bold text-gray-400 block">{entry.fullDate}</span>
                     <span className="text-xs text-gray-600">{entry.mood}</span>
                  </div>
                  <div className="flex-1 bg-white/[0.03] border border-white/5 rounded-xl p-5 hover:border-white/10 hover:bg-white/[0.05] transition-all cursor-pointer">
                     <h3 className="text-lg font-semibold text-white mb-2">{entry.title}</h3>
                     <p className="text-gray-400 text-sm leading-relaxed">{entry.preview}</p>
                     <div className="mt-4 flex gap-2">
                        {entry.tags.map(t => <Tag key={t} color="bg-teal-500/10 text-teal-400 border-teal-500/10">{t}</Tag>)}
                     </div>
                  </div>
               </div>
            </div>
          ))}
       </div>
    </div>
  </div>
);

// ============================================================================
// 3. THE MASONRY GRID (Visual Cards)
// ============================================================================
const VariationGrid = () => (
  <div className="h-full bg-zinc-950 p-8">
     <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
           <div>
              <h2 className="text-3xl font-bold text-white">Entries</h2>
              <p className="text-zinc-400">48 memories captured</p>
           </div>
           <div className="flex gap-2">
              <button className="p-2 bg-white/5 rounded-lg text-white"><Grid className="w-5 h-5" /></button>
              <button className="p-2 text-zinc-500 hover:text-white"><List className="w-5 h-5" /></button>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {/* New Entry Card */}
           <div className="aspect-[4/3] rounded-2xl border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center text-zinc-500 hover:border-zinc-600 hover:text-zinc-300 hover:bg-zinc-900 cursor-pointer transition-all">
              <Plus className="w-8 h-8 mb-2" />
              <span className="font-medium">New Entry</span>
           </div>

           {ENTRIES.map((entry, i) => (
             <div key={entry.id} className={`rounded-2xl bg-zinc-900/50 border border-white/5 p-6 hover:-translate-y-1 transition-transform cursor-pointer ${i === 1 ? 'md:row-span-2 bg-gradient-to-b from-zinc-900 to-zinc-950' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                   <span className="text-xs font-medium text-zinc-500 uppercase">{entry.date}</span>
                   <MoreHorizontal className="w-4 h-4 text-zinc-600 hover:text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{entry.title}</h3>
                <p className="text-zinc-400 text-sm mb-4 line-clamp-4">{entry.preview}</p>
                <div className="flex flex-wrap gap-2 mt-auto">
                   {entry.tags.map(t => <span key={t} className="text-[10px] text-zinc-500">#{t}</span>)}
                </div>
             </div>
           ))}
        </div>
     </div>
  </div>
);

// ============================================================================
// 4. THE SPLIT SIDEBAR (Classic Note App)
// ============================================================================
const VariationSidebar = () => (
  <div className="h-full flex bg-black text-white overflow-hidden border border-white/10 rounded-xl">
     {/* Sidebar */}
     <div className="w-64 bg-zinc-950 border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
           <div className="flex items-center gap-2 font-bold text-sky-400">
              <BookOpen className="w-5 h-5" /> Journey
           </div>
        </div>
        <div className="p-2 space-y-1 flex-1 overflow-y-auto">
           {['All Entries', 'Favorites', 'Drafts', 'Trash'].map((item, i) => (
             <button key={item} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${i === 0 ? 'bg-sky-500/10 text-sky-400' : 'text-gray-400 hover:bg-white/5'}`}>
               {item}
             </button>
           ))}
           <div className="pt-4 px-3 text-xs font-bold text-gray-600 uppercase tracking-wider">Tags</div>
           {['Work', 'Life', 'Ideas'].map(tag => (
              <button key={tag} className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-400 hover:bg-white/5 flex items-center gap-2">
                 <Hash className="w-3 h-3" /> {tag}
              </button>
           ))}
        </div>
     </div>

     {/* List */}
     <div className="w-80 border-r border-white/10 flex flex-col bg-zinc-900/50">
        <div className="p-4 border-b border-white/10">
           <input type="text" placeholder="Search..." className="w-full bg-black border border-white/10 rounded-md px-3 py-1.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-sky-500/50" />
        </div>
        <div className="overflow-y-auto flex-1">
           {ENTRIES.map((entry, i) => (
             <div key={entry.id} className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/[0.02] ${i === 0 ? 'bg-white/[0.04]' : ''}`}>
                <h4 className="font-semibold text-sm text-white mb-1">{entry.title}</h4>
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                   <span>{entry.date}</span>
                   <span>{entry.preview.slice(0, 20)}...</span>
                </div>
                <div className="flex gap-1">
                   {entry.tags.slice(0,2).map(t => <span key={t} className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-gray-400">{t}</span>)}
                </div>
             </div>
           ))}
        </div>
     </div>

     {/* Editor / Preview Area */}
     <div className="flex-1 bg-[#050505] p-8 flex flex-col items-center justify-center text-gray-500">
        <div className="max-w-2xl w-full">
           <div className="text-xs text-gray-500 mb-4 uppercase tracking-wide text-center">Oct 24, 2025 • Productive</div>
           <h1 className="text-3xl font-bold text-white mb-6 text-center">{ENTRIES[0].title}</h1>
           <div className="prose prose-invert max-w-none">
              <p>{ENTRIES[0].preview} The infrastructure holds the key to scalability. We spent too long ignoring technical debt...</p>
              <p>Later in the day, I had a conversation with the lead engineer...</p>
           </div>
        </div>
     </div>
  </div>
);

// ============================================================================
// 5. THE QUANTIFIED SELF (Data Heavy)
// ============================================================================
const VariationData = () => (
  <div className="h-full bg-slate-950 p-8">
     <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
           <h1 className="text-2xl font-bold text-white">Insights</h1>
           <div className="flex gap-2">
             <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400">Last 30 Days</span>
           </div>
        </div>

        {/* Charts / Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           <div className="col-span-2 bg-slate-900/50 border border-white/5 rounded-2xl p-6">
              <h3 className="text-sm font-medium text-slate-400 mb-4">Mood Trends</h3>
              <div className="h-32 flex items-end gap-2">
                 {[40, 60, 30, 80, 50, 70, 90].map((h, i) => (
                    <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-indigo-500/20 rounded-t-md relative group">
                       <div className="absolute bottom-0 w-full bg-indigo-500 rounded-t-md" style={{ height: '4px' }}></div>
                    </div>
                 ))}
              </div>
           </div>
           <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
              <div className="flex justify-between">
                 <Flame className="w-5 h-5 text-orange-500" />
                 <span className="text-xs text-green-400">+2 this week</span>
              </div>
              <div>
                 <div className="text-3xl font-bold text-white">12</div>
                 <div className="text-xs text-slate-500 uppercase tracking-wider">Day Streak</div>
              </div>
           </div>
           <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
              <div className="flex justify-between">
                 <BarChart2 className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                 <div className="text-3xl font-bold text-white">14.2k</div>
                 <div className="text-xs text-slate-500 uppercase tracking-wider">Total Words</div>
              </div>
           </div>
        </div>

        {/* Recent Entries Table */}
        <div className="bg-slate-900/30 border border-white/5 rounded-2xl overflow-hidden">
           <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-semibold text-white">Recent Logs</h3>
              <button className="text-xs text-indigo-400 hover:text-indigo-300">View All</button>
           </div>
           <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.02] text-slate-500">
                 <tr>
                    <th className="px-6 py-3 font-medium">Title</th>
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Mood</th>
                    <th className="px-6 py-3 font-medium">Tags</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                 {ENTRIES.map(entry => (
                    <tr key={entry.id} className="hover:bg-white/[0.02] transition-colors">
                       <td className="px-6 py-4 font-medium text-slate-200">{entry.title}</td>
                       <td className="px-6 py-4 text-slate-500">{entry.date}</td>
                       <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 text-xs text-slate-300 border border-white/5">
                             <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div> {entry.mood}
                          </span>
                       </td>
                       <td className="px-6 py-4 text-slate-500">{entry.tags.join(', ')}</td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
     </div>
  </div>
);

// ============================================================================
// 6. THE CALENDAR FOCUS
// ============================================================================
const VariationCalendar = () => (
  <div className="h-full bg-[#09090b] p-8 flex gap-8">
     {/* Calendar Sidebar */}
     <div className="w-80 flex-shrink-0 space-y-8">
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
           <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-white">October 2025</h2>
              <div className="flex gap-2">
                 <ChevronRight className="w-4 h-4 text-gray-400 rotate-180" />
                 <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
           </div>
           <div className="grid grid-cols-7 gap-2 text-center text-sm mb-2 text-gray-500">
              {['S','M','T','W','T','F','S'].map(d => <div key={d}>{d}</div>)}
           </div>
           <div className="grid grid-cols-7 gap-2 text-center text-sm">
              {Array.from({length: 31}, (_, i) => i + 1).map(d => (
                 <div key={d} className={`aspect-square flex items-center justify-center rounded-lg cursor-pointer hover:bg-white/5 ${d === 24 ? 'bg-sky-600 text-white' : 'text-gray-400'} ${[21, 23, 18].includes(d) ? 'relative' : ''}`}>
                    {d}
                    {[21, 23, 18].includes(d) && <div className="absolute bottom-1 w-1 h-1 bg-sky-400 rounded-full"></div>}
                 </div>
              ))}
           </div>
        </div>
     </div>

     {/* Day View */}
     <div className="flex-1 space-y-6">
        <div className="flex justify-between items-end">
           <div>
              <div className="text-sm text-sky-400 uppercase font-bold tracking-widest mb-1">Today</div>
              <h1 className="text-3xl font-bold text-white">Thursday, Oct 24</h1>
           </div>
           <button className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-sky-900/20 transition-all">
              <Plus className="w-5 h-5" /> Add Entry
           </button>
        </div>

        <div className="space-y-4">
           {ENTRIES.slice(0,1).map(entry => (
              <div key={entry.id} className="bg-zinc-900/30 border border-white/10 rounded-2xl p-8">
                 <h2 className="text-2xl font-bold text-white mb-4">{entry.title}</h2>
                 <div className="prose prose-invert max-w-none text-gray-400">
                    <p>{entry.preview} ...</p>
                 </div>
                 <div className="mt-8 flex gap-3">
                    {entry.tags.map(t => <Tag key={t}>{t}</Tag>)}
                 </div>
              </div>
           ))}
           <div className="flex items-center justify-center py-12 border-2 border-dashed border-zinc-800 rounded-2xl text-zinc-600">
              <span className="text-sm">No other entries for this day</span>
           </div>
        </div>
     </div>
  </div>
);

// ============================================================================
// 7. THE IMMERSIVE HERO (Magazine)
// ============================================================================
const VariationImmersive = () => (
  <div className="h-full bg-black p-8 relative overflow-hidden">
     {/* Background blob */}
     <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-fuchsia-900/20 rounded-full blur-[120px] pointer-events-none"></div>
     
     <div className="max-w-4xl mx-auto relative z-10">
        <div className="py-12 text-center space-y-6">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-400 text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3 h-3" /> Daily Prompt
           </div>
           <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight">
              What is a lesson you learned the hard way recently?
           </h1>
           <button className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-200 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              Start Writing
           </button>
        </div>

        <div className="mt-20">
           <div className="flex items-center justify-between mb-8 px-4">
              <h3 className="text-xl font-bold text-white">Previous Thoughts</h3>
              <button className="text-sm text-gray-400 hover:text-white">View Archive</button>
           </div>
           
           <div className="space-y-4">
              {ENTRIES.map(entry => (
                 <div key={entry.id} className="group flex items-center justify-between p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 hover:bg-white/[0.06] transition-all cursor-pointer">
                    <div className="flex items-center gap-6">
                       <div className="w-16 text-center">
                          <div className="text-xs text-gray-500 uppercase tracking-wider">{entry.date.includes('ago') ? 'OCT' : 'OCT'}</div>
                          <div className="text-2xl font-bold text-white">24</div>
                       </div>
                       <div>
                          <h4 className="text-lg font-semibold text-white group-hover:text-fuchsia-400 transition-colors">{entry.title}</h4>
                          <p className="text-sm text-gray-500">{entry.preview.slice(0, 60)}...</p>
                       </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all" />
                 </div>
              ))}
           </div>
        </div>
     </div>
  </div>
);

// ============================================================================
// 8. THE ISLAND (Central Floating)
// ============================================================================
const VariationIsland = () => (
  <div className="h-full bg-neutral-950 flex items-center justify-center p-8">
     <div className="w-full max-w-5xl h-[800px] bg-[#0a0a0a] rounded-[40px] border border-white/10 shadow-2xl overflow-hidden flex">
        {/* Nav Rail */}
        <div className="w-20 bg-black border-r border-white/5 flex flex-col items-center py-8 gap-8">
           <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg">
              <BookOpen className="w-5 h-5 text-white" />
           </div>
           <div className="flex-1 flex flex-col gap-6 text-gray-500">
              <button className="p-2 hover:bg-white/5 rounded-xl hover:text-white"><HomeIcon /></button>
              <button className="p-2 hover:bg-white/5 rounded-xl hover:text-white"><Search /></button>
              <button className="p-2 hover:bg-white/5 rounded-xl hover:text-white"><Heart /></button>
           </div>
           <div className="w-8 h-8 rounded-full bg-gray-800"></div>
        </div>

        {/* Content */}
        <div className="flex-1 p-12 overflow-y-auto">
           <header className="flex justify-between items-center mb-12">
              <div>
                 <h1 className="text-3xl font-bold text-white mb-1">Good Evening</h1>
                 <p className="text-gray-400">You have 3 drafts pending.</p>
              </div>
              <button className="px-5 py-2.5 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition-colors">
                 + New Note
              </button>
           </header>

           <div className="grid grid-cols-2 gap-6 mb-12">
              <div className="bg-rose-500/5 border border-rose-500/10 rounded-3xl p-6 flex flex-col justify-between h-48 cursor-pointer hover:bg-rose-500/10 transition-colors">
                 <div className="flex justify-between items-start">
                    <div className="p-3 bg-rose-500/20 rounded-2xl w-fit"><Zap className="w-6 h-6 text-rose-400" /></div>
                    <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-1 rounded-lg">TODAY</span>
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-white">Daily Reflection</h3>
                    <p className="text-rose-200/50 text-sm mt-1">3 prompts waiting</p>
                 </div>
              </div>
              <div className="bg-orange-500/5 border border-orange-500/10 rounded-3xl p-6 flex flex-col justify-between h-48 cursor-pointer hover:bg-orange-500/10 transition-colors">
                 <div className="flex justify-between items-start">
                    <div className="p-3 bg-orange-500/20 rounded-2xl w-fit"><Smile className="w-6 h-6 text-orange-400" /></div>
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-white">Mood Log</h3>
                    <p className="text-orange-200/50 text-sm mt-1">How are you feeling?</p>
                 </div>
              </div>
           </div>

           <h3 className="text-lg font-bold text-white mb-6">Recent Notes</h3>
           <div className="space-y-3">
              {ENTRIES.map(entry => (
                 <div key={entry.id} className="p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 flex justify-between items-center group cursor-pointer transition-colors">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-gray-500 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                          24
                       </div>
                       <div>
                          <h4 className="font-semibold text-white">{entry.title}</h4>
                          <p className="text-xs text-gray-500">{entry.tags.join(', ')}</p>
                       </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white" />
                 </div>
              ))}
           </div>
        </div>
     </div>
  </div>
);

// Icon Helper for Island
const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);


// ============================================================================
// MAIN PAGE
// ============================================================================
export default function DashboardVariationsPage() {
  const [activeTab, setActiveTab] = useState(0);
  
  const VARIATIONS = [
    { id: 0, name: "Minimalist Stream", component: VariationMinimalist },
    { id: 1, name: "Timeline", component: VariationTimeline },
    { id: 2, name: "Masonry Grid", component: VariationGrid },
    { id: 3, name: "Split Sidebar", component: VariationSidebar },
    { id: 4, name: "Quantified Self", component: VariationData },
    { id: 5, name: "Calendar Focus", component: VariationCalendar },
    { id: 6, name: "Immersive Hero", component: VariationImmersive },
    { id: 7, name: "The Island", component: VariationIsland },
  ];

  const ActiveComponent = VARIATIONS[activeTab].component;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950">
       {/* Switcher */}
       <div className="h-16 border-b border-white/10 flex items-center px-8 gap-4 overflow-x-auto bg-black/50 backdrop-blur sticky top-0 z-50">
          <span className="text-white font-bold mr-4">Variations:</span>
          {VARIATIONS.map(v => (
             <button 
                key={v.id}
                onClick={() => setActiveTab(v.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === v.id ? 'bg-white text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}
             >
                {v.name}
             </button>
          ))}
       </div>

       {/* Content */}
       <div className="flex-1 relative">
          <ActiveComponent />
       </div>
    </div>
  );
}
