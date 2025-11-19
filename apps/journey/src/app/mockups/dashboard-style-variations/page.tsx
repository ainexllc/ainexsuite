'use client';

import React, { useState } from 'react';
import { 
  BookOpen, Flame, CalendarCheck2, Clock3, BarChart3, 
  Sparkles, PenLine, Plus, ArrowRight, Tag, MoreHorizontal,
  ChevronLeft, ChevronRight, LayoutGrid, List, AlignLeft,
  Zap, Moon, Sun, Cloud, Search, Filter
} from 'lucide-react';
import { clsx } from 'clsx';

// --- Types ---
interface Theme {
  id: string;
  name: string;
  bg: string;
  panel: string;
  panelHover: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentBg: string;
  radius: string;
  font: string;
  shadow: string;
  bgSurface: string; // New: specific surface background for inner cards
  bgHover: string;   // New: hover state for inner cards
}

// --- Themes Configuration ---
const THEMES: Theme[] = [
  {
    id: 'obsidian',
    name: 'Obsidian',
    bg: 'bg-[#050505]',
    panel: 'bg-[#0A0A0A] border border-white/5',
    panelHover: 'hover:bg-[#111] hover:border-white/10',
    border: 'border-white/5',
    textPrimary: 'text-white',
    textSecondary: 'text-neutral-400',
    accent: 'text-sky-400',
    accentBg: 'bg-sky-500/10',
    radius: 'rounded-[24px]',
    font: 'font-sans',
    shadow: 'shadow-none',
    bgSurface: 'bg-white/[0.02]',
    bgHover: 'hover:bg-white/[0.05]'
  },
  {
    id: 'frosted',
    name: 'Frosted Glass',
    bg: 'bg-[url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop")] bg-cover bg-fixed',
    panel: 'bg-white/5 backdrop-blur-xl border border-white/10',
    panelHover: 'hover:bg-white/10 hover:border-white/20',
    border: 'border-white/10',
    textPrimary: 'text-white',
    textSecondary: 'text-blue-100/70',
    accent: 'text-cyan-300',
    accentBg: 'bg-cyan-400/20',
    radius: 'rounded-[32px]',
    font: 'font-sans',
    shadow: 'shadow-xl shadow-black/20',
    bgSurface: 'bg-white/5',
    bgHover: 'hover:bg-white/10'
  },
  {
    id: 'midnight',
    name: 'Midnight Blue',
    bg: 'bg-slate-950',
    panel: 'bg-slate-900/50 border border-slate-800',
    panelHover: 'hover:bg-slate-900 hover:border-slate-700',
    border: 'border-slate-800',
    textPrimary: 'text-slate-100',
    textSecondary: 'text-slate-400',
    accent: 'text-indigo-400',
    accentBg: 'bg-indigo-500/10',
    radius: 'rounded-2xl',
    font: 'font-sans',
    shadow: 'shadow-sm',
    bgSurface: 'bg-slate-800/50',
    bgHover: 'hover:bg-slate-800'
  },
  {
    id: 'wireframe',
    name: 'Wireframe',
    bg: 'bg-black',
    panel: 'bg-transparent border border-white/20',
    panelHover: 'hover:border-white/40',
    border: 'border-white/20',
    textPrimary: 'text-white',
    textSecondary: 'text-gray-500',
    accent: 'text-white',
    accentBg: 'bg-white/10',
    radius: 'rounded-none',
    font: 'font-mono',
    shadow: 'shadow-none',
    bgSurface: 'bg-transparent border border-white/10',
    bgHover: 'hover:bg-white/5'
  },
  {
    id: 'luxury',
    name: 'Warm Luxury',
    bg: 'bg-[#1c1917]',
    panel: 'bg-[#292524] border border-[#44403c]',
    panelHover: 'hover:bg-[#44403c]',
    border: 'border-[#44403c]',
    textPrimary: 'text-[#fafaf9]',
    textSecondary: 'text-[#a8a29e]',
    accent: 'text-[#d6d3d1]',
    accentBg: 'bg-[#57534e]',
    radius: 'rounded-lg',
    font: 'font-serif',
    shadow: 'shadow-2xl',
    bgSurface: 'bg-[#44403c]/20',
    bgHover: 'hover:bg-[#44403c]/40'
  },
  {
    id: 'cyber',
    name: 'Cyberpunk',
    bg: 'bg-[#050505]',
    panel: 'bg-black border border-zinc-800',
    panelHover: 'hover:border-fuchsia-500/50 hover:shadow-[0_0_15px_rgba(217,70,239,0.3)]',
    border: 'border-zinc-800',
    textPrimary: 'text-white',
    textSecondary: 'text-zinc-500',
    accent: 'text-fuchsia-400',
    accentBg: 'bg-fuchsia-500/10',
    radius: 'rounded-sm',
    font: 'font-sans',
    shadow: 'shadow-none',
    bgSurface: 'bg-zinc-900',
    bgHover: 'hover:bg-zinc-800'
  },
  {
    id: 'solid',
    name: 'Solid Flat',
    bg: 'bg-[#121212]',
    panel: 'bg-[#1E1E1E] border-none',
    panelHover: 'hover:bg-[#252525]',
    border: 'border-[#2C2C2C]',
    textPrimary: 'text-gray-100',
    textSecondary: 'text-gray-400',
    accent: 'text-emerald-400',
    accentBg: 'bg-emerald-500/10',
    radius: 'rounded-xl',
    font: 'font-sans',
    shadow: 'shadow-lg',
    bgSurface: 'bg-[#252525]',
    bgHover: 'hover:bg-[#2C2C2C]'
  },
  {
    id: 'gradient',
    name: 'Gradient Mesh',
    bg: 'bg-black',
    panel: 'bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-sm',
    panelHover: 'hover:from-white/15 hover:to-white/5',
    border: 'border-white/10',
    textPrimary: 'text-white',
    textSecondary: 'text-white/60',
    accent: 'text-white',
    accentBg: 'bg-white/20',
    radius: 'rounded-3xl',
    font: 'font-sans',
    shadow: 'shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]',
    bgSurface: 'bg-white/5',
    bgHover: 'hover:bg-white/10'
  }
];

// --- Mock Data ---
const IDEA_SUGGESTIONS = [
  { id: '1', type: 'prompt', title: 'Reflect on Calm', description: 'When did you last feel truly at peace?', icon: Cloud },
  { id: '2', type: 'goal', title: 'Weekly Goal', description: 'Review your progress on "Morning Pages".', icon: Zap },
  { id: '3', type: 'memory', title: 'On This Day', description: '1 year ago: "First day at the new job..."', icon: CalendarCheck2 },
];

// --- Components ---

const LayoutContainer = ({ theme, children }: { theme: Theme, children: React.ReactNode }) => (
  <div className={clsx("min-h-screen p-6 md:p-12 transition-colors duration-500", theme.bg, theme.font)}>
    <div className="max-w-6xl mx-auto">
      {children}
    </div>
  </div>
);

const Panel = ({ theme, children, className, hover = false }: { theme: Theme, children: React.ReactNode, className?: string, hover?: boolean }) => (
  <div className={clsx(
    "relative overflow-hidden transition-all duration-300",
    theme.panel,
    theme.radius,
    theme.shadow,
    hover && theme.panelHover,
    hover && "cursor-pointer group",
    className
  )}>
    {children}
  </div>
);

// ============================================================================
// MAIN DASHBOARD CONTENT (Layout Preserved)
// ============================================================================
const DashboardContent = ({ theme }: { theme: Theme }) => {
  const [isPersonalized, setIsPersonalized] = useState(true);

  return (
    <>
      {/* HEADER */}
      <Panel theme={theme} className="p-8 mb-8 flex flex-col md:flex-row md:items-start justify-between gap-8">
         {/* Background Glow for specific themes */}
         {theme.id === 'obsidian' && <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-[100px] pointer-events-none" />}
         {theme.id === 'cyber' && <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-fuchsia-500/50 to-transparent" />}

         <div className="space-y-4 relative z-10 flex-1">
            <div className={clsx("inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit", theme.accentBg, theme.accent)}>
               <Sparkles className="w-3 h-3" /> Notebook Lite
            </div>
            
            {/* PERSONALIZED WELCOME MESSAGE */}
            {isPersonalized ? (
              <div className="space-y-3 max-w-2xl">
                <h1 className={clsx("text-3xl md:text-4xl font-bold tracking-tight", theme.textPrimary)}>
                   It looks like you've been focusing on "Morning Routines" lately.
                </h1>
                <p className={clsx("leading-relaxed", theme.textSecondary)}>
                   Your last 3 entries mention waking up early. Would you like to explore a guided reflection on building habits?
                </p>
                <button className={clsx("text-xs font-bold uppercase tracking-wider hover:underline", theme.accent)}>
                   Start Reflection →
                </button>
              </div>
            ) : (
               <div className="space-y-3">
                  <h1 className={clsx("text-3xl md:text-4xl font-bold tracking-tight", theme.textPrimary)}>
                     Welcome back, Dino.
                  </h1>
                  <div className={clsx("flex items-center justify-between gap-4 rounded-lg border p-3 max-w-md", theme.border, theme.bgSurface)}>
                    <p className={clsx("text-sm", theme.textSecondary)}>
                      Get personalized welcome messages based on your recent entries?
                    </p>
                    <button
                      onClick={() => setIsPersonalized(true)}
                      className={clsx("px-4 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap", theme.radius, theme.accentBg, theme.accent)}
                    >
                      Enable
                    </button>
                  </div>
               </div>
            )}
         </div>

         <div className="flex flex-wrap gap-3 relative z-10">
            <button className={clsx("h-11 px-6 font-semibold transition-all flex items-center gap-2 whitespace-nowrap", theme.radius, 
               theme.id === 'wireframe' ? 'border border-white text-white hover:bg-white hover:text-black' : 
               theme.id === 'cyber' ? 'bg-fuchsia-600 text-white hover:bg-fuchsia-500 hover:shadow-[0_0_15px_rgba(217,70,239,0.5)]' :
               'bg-white text-black hover:bg-gray-200'
            )}>
               <Plus className="w-4 h-4" /> New Entry
            </button>
            <button className={clsx("h-11 px-6 border transition-colors flex items-center gap-2 font-medium whitespace-nowrap", theme.radius, theme.border, theme.textSecondary, "hover:text-white hover:bg-white/5")}>
               <PenLine className="w-4 h-4" /> Resume
            </button>
         </div>
      </Panel>

      {/* IDEA SUGGESTIONS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {IDEA_SUGGESTIONS.map((idea) => (
          <Panel key={idea.id} theme={theme} hover={true} className="p-4 flex flex-col justify-between h-32">
             <div className="flex justify-between items-start">
                <div className={clsx("p-2 rounded-lg", theme.bgSurface, theme.textSecondary)}>
                   <idea.icon className="w-5 h-5" />
                </div>
                {idea.type === 'prompt' && <span className={clsx("text-[10px] font-bold uppercase", theme.accent)}>Daily</span>}
             </div>
             <div>
                <h4 className={clsx("font-semibold mb-1", theme.textPrimary)}>{idea.title}</h4>
                <p className={clsx("text-xs line-clamp-2", theme.textSecondary)}>{idea.description}</p>
             </div>
          </Panel>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
         
         {/* MAIN COLUMN */}
         <div className="space-y-8">
            {/* List Header */}
            <div className="flex items-center justify-between px-1">
               <h3 className={clsx("font-semibold", theme.textSecondary)}>Recent Entries</h3>
               <div className="flex gap-2">
                  <button className={clsx("p-1.5 rounded-lg transition-colors", theme.textSecondary, "hover:bg-white/5 hover:text-white")}><ChevronLeft className="w-4 h-4" /></button>
                  <button className={clsx("p-1.5 rounded-lg transition-colors", theme.textSecondary, "hover:bg-white/5 hover:text-white")}><ChevronRight className="w-4 h-4" /></button>
               </div>
            </div>

            {/* List Items */}
            <div className="space-y-3">
               {[
                 { title: 'The Silence of Morning', preview: 'Woke up before the sun today...', date: '2h ago', day: '24', month: 'OCT' },
                 { title: 'Project Kickoff Thoughts', preview: 'Excited but nervous about the new scope...', date: 'Yesterday', day: '23', month: 'OCT' },
                 { title: 'Weekend Plans', preview: 'Thinking of heading to the coast...', date: '3d ago', day: '21', month: 'OCT' },
                 { title: 'Atomic Habits Notes', preview: 'The idea of 1% improvement...', date: '1w ago', day: '18', month: 'OCT' },
               ].map((entry, i) => (
                 <Panel key={i} theme={theme} hover={true} className="p-4 flex items-start gap-4">
                    <div className={clsx("w-12 h-12 flex-shrink-0 flex flex-col items-center justify-center border", theme.radius, theme.panel, theme.border)}>
                       <span className={clsx("text-xs font-bold", theme.textSecondary)}>{entry.month}</span>
                       <span className={clsx("text-sm font-bold", theme.textPrimary)}>{entry.day}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="flex justify-between items-start">
                          <h4 className={clsx("font-semibold truncate transition-colors", theme.textPrimary, `group-hover:${theme.accent}`.replace('text-', 'text-'))}>{entry.title}</h4>
                          <span className={clsx("text-xs whitespace-nowrap ml-2", theme.textSecondary)}>{entry.date}</span>
                       </div>
                       <p className={clsx("text-sm truncate mt-1", theme.textSecondary)}>{entry.preview}</p>
                    </div>
                 </Panel>
               ))}
            </div>
         </div>

         {/* SIDEBAR COLUMN */}
         <div className="space-y-6">
            
            {/* Stats Card */}
            <Panel theme={theme} className="p-6 space-y-6">
               <div className="flex items-center justify-between">
                  <h3 className={clsx("font-semibold", theme.textPrimary)}>Writing Health</h3>
                  <Flame className={clsx("w-4 h-4", theme.accent)} />
               </div>
               <div className="grid grid-cols-2 gap-3">
                  {[
                    { l: 'Streak', v: '12 Days' },
                    { l: 'Weekly', v: '4 Entries' },
                    { l: 'Words', v: '420 Avg', full: true }
                  ].map((s, i) => (
                    <div key={i} className={clsx("p-3 border", theme.radius, theme.panel, theme.border, s.full && "col-span-2")}>
                       <div className={clsx("text-[10px] font-bold uppercase tracking-wider mb-1", theme.textSecondary)}>{s.l}</div>
                       <div className={clsx("font-bold", theme.textPrimary)}>{s.v}</div>
                    </div>
                  ))}
               </div>
            </Panel>

            {/* Latest Entry Preview */}
            <Panel theme={theme} hover={true} className="p-6 space-y-4">
               <div className="flex items-center justify-between">
                  <h3 className={clsx("font-semibold", theme.textPrimary)}>Latest</h3>
                  <BookOpen className={clsx("w-4 h-4", theme.textSecondary)} />
               </div>
               <div>
                  <div className={clsx("text-xs font-medium uppercase tracking-wider mb-1", theme.textSecondary)}>2 HOURS AGO</div>
                  <h4 className={clsx("text-lg font-bold mb-2", theme.textPrimary)}>The Silence of Morning</h4>
                  <p className={clsx("text-sm line-clamp-3 leading-relaxed", theme.textSecondary)}>
                     Woke up before the sun today. There is a specific quality to the silence at 5am that feels heavy, but in a comforting way.
                  </p>
               </div>
               <div className="pt-2 flex gap-2">
                  <button className={clsx("px-3 py-1.5 text-xs font-medium border", theme.radius, theme.border, theme.textPrimary, "hover:bg-white/5")}>Read</button>
               </div>
            </Panel>

            {/* Quick Filters */}
            <Panel theme={theme} className="p-6">
               <div className="flex items-center justify-between mb-4">
                  <h3 className={clsx("font-semibold text-sm", theme.textPrimary)}>Filters</h3>
                  <Tag className={clsx("w-3.5 h-3.5", theme.textSecondary)} />
               </div>
               <div className="flex flex-wrap gap-2">
                  {['Work', 'Personal', 'Ideas', 'Morning'].map(t => (
                     <button key={t} className={clsx("px-3 py-1.5 border text-xs transition-colors", theme.radius, theme.border, theme.panel, theme.textSecondary, "hover:text-white hover:border-white/20")}>
                        #{t}
                     </button>
                  ))}
               </div>
            </Panel>

         </div>
      </div>
    </>
  );
};


export default function DashboardStyleVariationsPage() {
  const [activeTab, setActiveTab] = useState('obsidian');
  const activeTheme = THEMES.find(t => t.id === activeTab) || THEMES[0];

  return (
    <div className="min-h-screen flex flex-col">
       {/* Style Switcher (Fixed Top) */}
       <div className="h-16 bg-black border-b border-white/10 flex items-center px-8 gap-2 overflow-x-auto sticky top-0 z-50">
          <span className="text-white font-bold mr-4 text-sm">Style:</span>
          {THEMES.map(t => (
             <button 
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={clsx(
                  "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-colors",
                  activeTab === t.id ? "bg-white text-black" : "bg-white/5 text-gray-400 hover:text-white"
                )}
              >
                {t.name}
             </button>
          ))}
       </div>

       {/* Layout Wrapper */}
       <LayoutContainer theme={activeTheme}>
          <DashboardContent theme={activeTheme} />
       </LayoutContainer>
    </div>
  );
}
