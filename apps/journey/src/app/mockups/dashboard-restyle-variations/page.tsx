'use client';

import React, { useState } from 'react';
import { 
  BookOpen, Flame, CalendarCheck2, Clock3, BarChart3, 
  Sparkles, PenLine, Plus, ArrowRight, Tag, MoreHorizontal,
  ChevronLeft, ChevronRight, LayoutGrid, List, AlignLeft,
  Zap, Moon, Sun, Cloud, Search, Filter
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

// --- Mock Data ---
const ENTRIES = [
  { id: '1', title: 'The Silence of Morning', preview: 'Woke up before the sun today. There is a specific quality to the silence at 5am that feels heavy, but in a comforting way...', date: '2h ago', day: '24', month: 'OCT', tags: ['Morning', 'Routine'], mood: 'Calm' },
  { id: '2', title: 'Project Kickoff Thoughts', preview: 'Excited but nervous about the new scope. We need to make sure the team is aligned on the core objectives before we start coding...', date: 'Yesterday', day: '23', month: 'OCT', tags: ['Work'], mood: 'Anxious' },
  { id: '3', title: 'Weekend Plans', preview: 'Thinking of heading to the coast. The weather is supposed to be perfect for a long hike along the cliffs...', date: '3d ago', day: '21', month: 'OCT', tags: ['Personal'], mood: 'Excited' },
  { id: '4', title: 'Book Notes: Atomic Habits', preview: 'The idea of 1% improvement really stuck with me. It is not about the massive overnight success...', date: '1w ago', day: '18', month: 'OCT', tags: ['Reading'], mood: 'Inspired' },
];

// --- Shared Components ---
const GlassPanel = ({ children, className, hoverEffect = false, border = true }: { children: React.ReactNode, className?: string, hoverEffect?: boolean, border?: boolean }) => (
  <div className={clsx(
    "bg-[#0A0A0A] rounded-[20px] p-6 transition-all duration-300 relative overflow-hidden",
    border && "border border-white/5",
    hoverEffect && "hover:border-white/10 hover:bg-[#0F0F0F] group cursor-pointer",
    className
  )}>
    {children}
  </div>
);

const Badge = ({ children, color = "bg-white/5 text-gray-400" }: { children: React.ReactNode, color?: string }) => (
  <span className={clsx("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-white/5", color)}>
    {children}
  </span>
);

// ============================================================================
// 1. THE "FROSTED CARDS" (Heavier Blur)
// ============================================================================
const VariationFrosted = () => (
  <div className="p-8 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-fixed min-h-[600px] rounded-xl overflow-hidden relative">
     <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
     <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <div className="lg:col-span-2 space-y-4">
           <div className="flex justify-between items-end mb-4">
              <h2 className="text-3xl font-bold text-white">Journal</h2>
              <button className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-white text-sm font-medium hover:bg-white/20 transition-colors">
                 + New Entry
              </button>
           </div>
           {ENTRIES.map(entry => (
              <div key={entry.id} className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/15 transition-colors cursor-pointer group">
                 <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-white group-hover:text-sky-300 transition-colors">{entry.title}</h3>
                    <span className="text-xs text-gray-300">{entry.date}</span>
                 </div>
                 <p className="text-gray-300 mb-4 leading-relaxed">{entry.preview}</p>
                 <div className="flex gap-2">
                    {entry.tags.map(t => <span key={t} className="text-xs text-sky-200 opacity-70">#{t}</span>)}
                 </div>
              </div>
           ))}
        </div>
        <div className="space-y-4">
           <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-sky-400 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-sky-500/20">
                 <Flame className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-white">12</div>
              <div className="text-xs font-bold text-sky-200 uppercase tracking-widest">Day Streak</div>
           </div>
        </div>
     </div>
  </div>
);

// ============================================================================
// 2. THE "NEON NIGHT" (Cyberpunk-lite)
// ============================================================================
const VariationNeon = () => (
  <div className="p-8 bg-[#050505] min-h-[600px] rounded-xl border border-white/5">
     <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-12 pb-6 border-b border-white/10">
           <div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-cyan-500">
                 NIGHT LOG
              </h1>
              <p className="text-gray-500 mt-1 font-mono text-xs tracking-widest">SYSTEM STATUS: ONLINE // STREAK: 12</p>
           </div>
           <button className="w-12 h-12 rounded-full border border-cyan-500/50 text-cyan-400 flex items-center justify-center hover:bg-cyan-500/10 hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all">
              <Plus className="w-6 h-6" />
           </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {ENTRIES.map(entry => (
              <div key={entry.id} className="group relative p-6 bg-zinc-900 border border-zinc-800 hover:border-fuchsia-500/50 transition-colors">
                 <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-fuchsia-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <div className="flex justify-between items-start mb-4">
                    <div className="font-mono text-xs text-cyan-500">{entry.date}</div>
                    <div className="font-mono text-xs text-fuchsia-500">[{entry.mood.toUpperCase()}]</div>
                 </div>
                 <h3 className="text-xl font-bold text-white mb-2 font-sans tracking-tight">{entry.title}</h3>
                 <p className="text-zinc-400 text-sm mb-4 font-mono">{entry.preview}</p>
                 <div className="flex gap-2 mt-auto">
                    {entry.tags.map(t => <span key={t} className="text-[10px] font-bold text-zinc-500 bg-zinc-950 px-2 py-1 border border-zinc-800">#{t}</span>)}
                 </div>
              </div>
           ))}
        </div>
     </div>
  </div>
);

// ============================================================================
// 3. THE "PAPER & INK" (High Contrast Serif)
// ============================================================================
const VariationPaper = () => (
  <div className="p-8 bg-[#F5F5F0] text-zinc-900 min-h-[600px] rounded-xl">
     <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
           <div className="inline-block border-b-2 border-black pb-1 mb-4">
              <span className="text-xs font-bold tracking-[0.2em]">JOURNAL 001</span>
           </div>
           <h1 className="text-5xl font-serif italic">The Daily Record</h1>
        </div>

        <div className="space-y-12 border-l-2 border-zinc-200 pl-8 ml-4">
           {ENTRIES.map(entry => (
              <div key={entry.id} className="relative">
                 <div className="absolute -left-[41px] top-1 w-4 h-4 rounded-full bg-zinc-900 border-4 border-[#F5F5F0]"></div>
                 <div className="flex flex-col md:flex-row gap-8 group cursor-pointer">
                    <div className="md:w-32 flex-shrink-0 pt-2">
                       <span className="font-bold font-serif text-lg block">{entry.month} {entry.day}</span>
                       <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{entry.mood}</span>
                    </div>
                    <div className="flex-1">
                       <h2 className="text-2xl font-serif font-bold mb-3 group-hover:underline decoration-2 underline-offset-4">{entry.title}</h2>
                       <p className="text-zinc-600 leading-relaxed font-serif text-lg">{entry.preview}</p>
                    </div>
                 </div>
              </div>
           ))}
        </div>
     </div>
  </div>
);

// ============================================================================
// 4. THE "LINEAR FEED" (Social Media Style)
// ============================================================================
const VariationLinear = () => (
  <div className="p-8 bg-black min-h-[600px] rounded-xl border border-white/10 flex justify-center">
     <div className="w-full max-w-md border-x border-white/10 min-h-full bg-[#050505]">
        <div className="sticky top-0 bg-black/80 backdrop-blur border-b border-white/10 p-4 flex justify-between items-center z-10">
           <h2 className="font-bold text-white text-lg">Feed</h2>
           <Sparkles className="w-5 h-5 text-sky-400" />
        </div>
        
        {/* Create Box */}
        <div className="p-4 border-b border-white/10 flex gap-3">
           <div className="w-10 h-10 rounded-full bg-gray-800"></div>
           <div className="flex-1">
              <div className="bg-white/5 rounded-2xl p-3 text-gray-500 text-sm cursor-text hover:bg-white/10 transition-colors">
                 What's on your mind?
              </div>
           </div>
        </div>

        {/* Feed Items */}
        <div>
           {ENTRIES.map(entry => (
              <div key={entry.id} className="p-4 border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors">
                 <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500"></div>
                    <div>
                       <div className="font-bold text-white text-sm">You</div>
                       <div className="text-xs text-gray-500">{entry.date} • {entry.mood}</div>
                    </div>
                    <MoreHorizontal className="w-4 h-4 text-gray-600 ml-auto" />
                 </div>
                 <h3 className="font-semibold text-white mb-1">{entry.title}</h3>
                 <p className="text-sm text-gray-400 mb-3">{entry.preview}</p>
                 <div className="flex gap-4 text-gray-600">
                    <div className="flex items-center gap-1 hover:text-sky-400 text-xs"><Tag className="w-4 h-4" /> {entry.tags.length}</div>
                    <div className="flex items-center gap-1 hover:text-pink-400 text-xs"><Zap className="w-4 h-4" /> Edit</div>
                 </div>
              </div>
           ))}
        </div>
     </div>
  </div>
);

// ============================================================================
// 5. THE "BENTO BOX" (Modular Grid)
// ============================================================================
const VariationBento = () => (
  <div className="p-8 bg-[#080808] min-h-[600px] rounded-xl border border-white/5">
     <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 grid-rows-3 gap-4 h-[600px]">
        
        {/* Profile / Welcome */}
        <GlassPanel className="col-span-2 row-span-1 flex flex-col justify-center bg-gradient-to-br from-indigo-900/20 to-purple-900/20 !border-indigo-500/10">
           <h2 className="text-2xl font-bold text-white">Good Evening</h2>
           <p className="text-indigo-200/70">You've written 12,400 words this month.</p>
        </GlassPanel>

        {/* Stats 1 */}
        <GlassPanel className="col-span-1 row-span-1 flex flex-col items-center justify-center text-center">
           <Flame className="w-8 h-8 text-orange-500 mb-2" />
           <div className="text-2xl font-bold text-white">12</div>
           <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Streak</div>
        </GlassPanel>

        {/* Action */}
        <GlassPanel className="col-span-1 row-span-1 flex items-center justify-center hover:bg-white/5 cursor-pointer group">
           <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-8 h-8" />
           </div>
        </GlassPanel>

        {/* Main List */}
        <GlassPanel className="col-span-2 row-span-2 overflow-hidden flex flex-col">
           <h3 className="font-bold text-gray-400 mb-4 text-sm uppercase tracking-widest">Recent Entries</h3>
           <div className="flex-1 space-y-3 overflow-y-auto pr-2">
              {ENTRIES.map(entry => (
                 <div key={entry.id} className="flex justify-between items-center p-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer">
                    <div>
                       <div className="font-medium text-white text-sm">{entry.title}</div>
                       <div className="text-xs text-gray-500">{entry.date}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                 </div>
              ))}
           </div>
        </GlassPanel>

        {/* Prompt */}
        <GlassPanel className="col-span-2 row-span-1 bg-yellow-500/5 !border-yellow-500/10">
           <div className="flex items-center gap-2 mb-2 text-yellow-500">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Daily Prompt</span>
           </div>
           <p className="text-white text-lg font-medium">"What is a memory you keep returning to?"</p>
        </GlassPanel>

        {/* Tags */}
        <GlassPanel className="col-span-2 row-span-1">
           <div className="flex flex-wrap gap-2">
              {['Work', 'Life', 'Ideas', 'Health', 'Travel', 'Books', 'Music'].map(t => (
                 <span key={t} className="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-gray-400 border border-white/5">{t}</span>
              ))}
           </div>
        </GlassPanel>
     </div>
  </div>
);

// ============================================================================
// 6. THE "MINIMALIST SIDEBAR" (Notion-esque)
// ============================================================================
const VariationMinimalSidebar = () => (
  <div className="p-8 bg-white text-black min-h-[600px] rounded-xl border border-gray-200 flex">
     <div className="w-56 pr-8 border-r border-gray-100">
        <div className="flex items-center gap-2 font-bold text-gray-900 mb-8">
           <BookOpen className="w-5 h-5" /> Journey
        </div>
        <div className="space-y-1">
           {['Inbox', 'Journal', 'Favorites', 'Archive'].map((item, i) => (
              <div key={item} className={`px-3 py-1.5 rounded-md text-sm font-medium cursor-pointer ${i === 1 ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                 {item}
              </div>
           ))}
        </div>
        <div className="mt-8">
           <div className="px-3 text-xs font-bold text-gray-400 mb-2">TAGS</div>
           {['Work', 'Personal', 'Ideas'].map(t => (
              <div key={t} className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 cursor-pointer flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span> {t}
              </div>
           ))}
        </div>
     </div>
     <div className="flex-1 pl-8">
        <div className="flex justify-between items-center mb-8">
           <h1 className="text-3xl font-bold text-gray-900">Journal</h1>
           <div className="flex gap-2">
              <button className="p-2 text-gray-400 hover:text-gray-900"><Search className="w-5 h-5" /></button>
              <button className="p-2 text-gray-400 hover:text-gray-900"><MoreHorizontal className="w-5 h-5" /></button>
              <button className="bg-black text-white px-3 py-1.5 rounded-md text-sm font-medium">New</button>
           </div>
        </div>
        <div className="space-y-6">
           {ENTRIES.map(entry => (
              <div key={entry.id} className="group border-b border-gray-100 pb-6">
                 <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm text-gray-400">{entry.month} {entry.day}</span>
                    {entry.tags.map(t => <span key={t} className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600 font-medium">{t}</span>)}
                 </div>
                 <h3 className="text-xl font-semibold text-gray-900 mb-1 cursor-pointer">{entry.title}</h3>
                 <p className="text-gray-500 leading-relaxed">{entry.preview}</p>
              </div>
           ))}
        </div>
     </div>
  </div>
);

// ============================================================================
// 7. THE "GALLERY" (Image Heavy / Visual)
// ============================================================================
const VariationGallery = () => (
  <div className="p-8 bg-[#050505] min-h-[600px] rounded-xl border border-white/5">
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2 aspect-video bg-gradient-to-br from-pink-900 to-rose-900 rounded-2xl p-8 flex flex-col justify-end relative overflow-hidden group cursor-pointer">
           <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
           <div className="relative z-10">
              <div className="text-xs font-bold text-rose-200 mb-2">LATEST ENTRY</div>
              <h2 className="text-3xl font-bold text-white mb-2">{ENTRIES[0].title}</h2>
              <p className="text-rose-100/80 line-clamp-2">{ENTRIES[0].preview}</p>
           </div>
        </div>
        <div className="aspect-video md:aspect-auto lg:col-span-1 bg-zinc-900 rounded-2xl p-6 flex flex-col justify-between border border-white/5 hover:border-white/20 transition-colors cursor-pointer">
           <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400"><BookOpen className="w-5 h-5" /></div>
           <div>
              <div className="text-xs text-zinc-500 mb-1">{ENTRIES[1].date}</div>
              <h3 className="font-bold text-white leading-tight">{ENTRIES[1].title}</h3>
           </div>
        </div>
        <div className="aspect-video md:aspect-auto lg:col-span-1 bg-zinc-900 rounded-2xl p-6 flex flex-col justify-between border border-white/5 hover:border-white/20 transition-colors cursor-pointer">
           <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400"><Sparkles className="w-5 h-5" /></div>
           <div>
              <div className="text-xs text-zinc-500 mb-1">{ENTRIES[2].date}</div>
              <h3 className="font-bold text-white leading-tight">{ENTRIES[2].title}</h3>
           </div>
        </div>
        <div className="lg:col-span-4 mt-4">
           <h3 className="text-white font-bold mb-4">Archive</h3>
           <div className="flex gap-4 overflow-x-auto pb-4">
              {[1,2,3,4,5].map(i => (
                 <div key={i} className="min-w-[200px] h-32 bg-zinc-900/50 rounded-xl border border-white/5"></div>
              ))}
           </div>
        </div>
     </div>
  </div>
);

// ============================================================================
// 8. THE "TERMINAL" (Developer Style)
// ============================================================================
const VariationTerminal = () => (
  <div className="p-8 bg-[#1a1b26] min-h-[600px] rounded-xl border border-[#24283b] font-mono text-[#a9b1d6]">
     <div className="max-w-4xl mx-auto">
        <div className="mb-8 border-b border-[#24283b] pb-4 flex gap-4 text-sm">
           <span className="text-[#7aa2f7]">~</span>
           <span className="text-[#9ece6a]">dinohorn</span>
           <span>/</span>
           <span className="text-[#7aa2f7]">journal</span>
           <span className="text-[#565f89] ml-auto">zsh — 80x24</span>
        </div>
        
        <div className="mb-8">
           <div className="flex gap-2 mb-2">
              <span className="text-[#f7768e]">❯</span>
              <span className="text-[#e0af68]">journey</span>
              <span>status</span>
           </div>
           <div className="pl-4 text-sm">
              <div>STREAK: <span className="text-[#9ece6a]">12 days</span></div>
              <div>ENTRIES: <span className="text-[#7aa2f7]">48 total</span></div>
              <div>LAST_SYNC: <span className="text-[#bb9af7]">just now</span></div>
           </div>
        </div>

        <div>
           <div className="flex gap-2 mb-4">
              <span className="text-[#f7768e]">❯</span>
              <span className="text-[#e0af68]">ls</span>
              <span>-la --sort=date</span>
           </div>
           <div className="space-y-2 pl-4">
              {ENTRIES.map(entry => (
                 <div key={entry.id} className="flex gap-4 hover:bg-[#24283b] p-1 -ml-1 cursor-pointer">
                    <span className="text-[#565f89] w-24">{entry.day}{entry.month}</span>
                    <span className="text-[#7aa2f7] w-20">[{entry.mood}]</span>
                    <span className="text-[#c0caf5] flex-1">{entry.title}</span>
                    <span className="text-[#565f89] text-xs">#{entry.tags[0]}</span>
                 </div>
              ))}
           </div>
           <div className="mt-4 flex gap-2 animate-pulse">
              <span className="text-[#f7768e]">❯</span>
              <span className="w-2 h-5 bg-[#a9b1d6]"></span>
           </div>
        </div>
     </div>
  </div>
);


export default function DashboardRestyleVariationsPage() {
  const [activeTab, setActiveTab] = useState(0);
  
  const VARIATIONS = [
    { id: 0, name: "Frosted Glass", component: VariationFrosted },
    { id: 1, name: "Neon Night", component: VariationNeon },
    { id: 2, name: "Paper & Ink", component: VariationPaper },
    { id: 3, name: "Linear Feed", component: VariationLinear },
    { id: 4, name: "Bento Box", component: VariationBento },
    { id: 5, name: "Minimal Sidebar", component: VariationMinimalSidebar },
    { id: 6, name: "Gallery", component: VariationGallery },
    { id: 7, name: "Terminal", component: VariationTerminal },
  ];

  const ActiveComponent = VARIATIONS[activeTab].component;

  return (
    <div className="min-h-screen flex flex-col bg-[#111]">
       {/* Switcher */}
       <div className="h-16 border-b border-white/10 flex items-center px-8 gap-4 overflow-x-auto bg-black/50 backdrop-blur sticky top-0 z-50">
          <span className="text-white font-bold mr-4">Restyle Variations:</span>
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
       <div className="flex-1 relative p-4 md:p-12">
          <ActiveComponent />
       </div>
    </div>
  );
}
