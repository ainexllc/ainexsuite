'use client';

import React, { useState } from 'react';
import { 
  LayoutGrid, Book, PenTool, CheckSquare, 
  Target, Image as ImageIcon, TrendingUp, Activity, 
  Dumbbell, GitBranch, Home, Settings
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

// --- Data ---

const APPS = [
  { id: 'dashboard', name: 'Dashboard', icon: Home, color: 'text-white' },
  { id: 'projects', name: 'Projects', icon: LayoutGrid, color: 'text-violet-400' },
  { id: 'notes', name: 'Notes', icon: Book, color: 'text-yellow-400' },
  { id: 'journey', name: 'Journey', icon: PenTool, color: 'text-purple-400' },
  { id: 'todo', name: 'Todo', icon: CheckSquare, color: 'text-blue-400' },
  { id: 'track', name: 'Track', icon: Target, color: 'text-green-400' },
  { id: 'moments', name: 'Moments', icon: ImageIcon, color: 'text-pink-400' },
  { id: 'grow', name: 'Grow', icon: TrendingUp, color: 'text-indigo-400' },
  { id: 'pulse', name: 'Pulse', icon: Activity, color: 'text-red-400' },
  { id: 'fit', name: 'Fit', icon: Dumbbell, color: 'text-orange-400' },
  { id: 'workflow', name: 'Workflow', icon: GitBranch, color: 'text-emerald-400' },
];

// --- Shared Layout Wrapper ---
const MockupContainer = ({ title, children, dark = true }: { title: string, children: React.ReactNode, dark?: boolean }) => (
  <div className={`relative rounded-xl border ${dark ? 'bg-neutral-950 border-white/10' : 'bg-white border-gray-200'} overflow-hidden mb-12`}>
    <div className="absolute top-0 left-0 bg-blue-600 text-white px-3 py-1 text-xs font-bold rounded-br-lg z-20">
      {title}
    </div>
    <div className="pt-8 pb-12">
      {children}
    </div>
  </div>
);

// ============================================================================
// 1. Material 3 Navigation Rail (Horizontal)
// ============================================================================
const Variation1 = () => {
  const [active, setActive] = useState('dashboard');
  return (
    <MockupContainer title="1. Pill Indicators">
      <div className="border-b border-white/10 bg-black">
        <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
          {APPS.map(app => {
            const isActive = active === app.id;
            return (
              <button
                key={app.id}
                onClick={() => setActive(app.id)}
                className="group flex flex-col items-center min-w-[64px] gap-1"
              >
                <div className={clsx(
                  "h-8 px-5 rounded-full flex items-center justify-center transition-all duration-300",
                  isActive ? "bg-blue-600 text-white" : "hover:bg-white/10 text-gray-400 group-hover:text-white"
                )}>
                  <app.icon className="w-5 h-5" />
                </div>
                <span className={clsx(
                  "text-[10px] font-medium transition-colors",
                  isActive ? "text-white" : "text-gray-500"
                )}>
                  {app.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </MockupContainer>
  );
};

// ============================================================================
// 2. MacOS Finder / Toolbar Style
// ============================================================================
const Variation2 = () => {
  const [active, setActive] = useState('dashboard');
  return (
    <MockupContainer title="2. The Toolbar">
      <div className="border-b border-white/10 bg-[#1e1e1e]">
        <div className="flex items-center gap-1 px-2 py-2 overflow-x-auto scrollbar-hide">
          {APPS.map(app => {
            const isActive = active === app.id;
            return (
              <button
                key={app.id}
                onClick={() => setActive(app.id)}
                className={clsx(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md transition-all whitespace-nowrap",
                  isActive ? "bg-white/10 text-white shadow-sm" : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                )}
              >
                <app.icon className={clsx("w-4 h-4", isActive ? app.color : "text-current")} />
                <span className="text-sm font-medium">{app.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </MockupContainer>
  );
};

// ============================================================================
// 3. Underline Tabs (Classic)
// ============================================================================
const Variation3 = () => {
  const [active, setActive] = useState('dashboard');
  return (
    <MockupContainer title="3. Classic Tabs">
      <div className="border-b border-white/10 bg-black">
        <div className="flex items-end gap-6 px-6 overflow-x-auto scrollbar-hide">
          {APPS.map(app => {
            const isActive = active === app.id;
            return (
              <button
                key={app.id}
                onClick={() => setActive(app.id)}
                className={clsx(
                  "relative pb-3 flex items-center gap-2 transition-colors whitespace-nowrap",
                  isActive ? "text-blue-400" : "text-gray-400 hover:text-gray-200"
                )}
              >
                <app.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{app.name}</span>
                {isActive && (
                  <motion.div 
                    layoutId="underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" 
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </MockupContainer>
  );
};

// ============================================================================
// 4. Segmented Control (Floating)
// ============================================================================
const Variation4 = () => {
  const [active, setActive] = useState('dashboard');
  return (
    <MockupContainer title="4. Floating Segment">
      <div className="bg-gradient-to-b from-zinc-900 to-black py-4 px-4">
        <div className="bg-zinc-800/50 border border-white/5 p-1 rounded-xl flex gap-1 overflow-x-auto scrollbar-hide mx-auto max-w-full w-fit">
          {APPS.map(app => {
            const isActive = active === app.id;
            return (
              <button
                key={app.id}
                onClick={() => setActive(app.id)}
                className={clsx(
                  "relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap z-10",
                  isActive ? "text-white" : "text-gray-400 hover:text-gray-200"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="segment"
                    className="absolute inset-0 bg-zinc-700 rounded-lg -z-10 shadow-sm border border-white/5" 
                  />
                )}
                <app.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{app.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </MockupContainer>
  );
};

// ============================================================================
// 5. Vertical Stack (Tab Bar Style)
// ============================================================================
const Variation5 = () => {
  const [active, setActive] = useState('dashboard');
  return (
    <MockupContainer title="5. iOS Tab Bar Top">
      <div className="border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="flex justify-between md:justify-start md:gap-8 px-4 py-2 overflow-x-auto scrollbar-hide">
          {APPS.map(app => {
            const isActive = active === app.id;
            return (
              <button
                key={app.id}
                onClick={() => setActive(app.id)}
                className="flex flex-col items-center gap-1 min-w-[60px] group"
              >
                <app.icon className={clsx(
                  "w-6 h-6 transition-colors",
                  isActive ? "text-blue-500" : "text-gray-500 group-hover:text-gray-300"
                )} />
                <span className={clsx(
                  "text-[10px] font-medium",
                  isActive ? "text-blue-500" : "text-gray-500 group-hover:text-gray-300"
                )}>
                  {app.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </MockupContainer>
  );
};

// ============================================================================
// 6. Connected Cards (Browser Tabs)
// ============================================================================
const Variation6 = () => {
  const [active, setActive] = useState('dashboard');
  return (
    <MockupContainer title="6. Browser Tabs">
      <div className="bg-zinc-900 pt-2 border-b border-zinc-800">
        <div className="flex items-end overflow-x-auto scrollbar-hide px-2">
          {APPS.map(app => {
            const isActive = active === app.id;
            return (
              <button
                key={app.id}
                onClick={() => setActive(app.id)}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2.5 rounded-t-lg border-t border-l border-r mr-[-1px] transition-colors whitespace-nowrap min-w-[120px]",
                  isActive 
                    ? "bg-black border-zinc-700 text-white relative z-10" 
                    : "bg-zinc-800 border-zinc-800 text-gray-500 hover:bg-zinc-700"
                )}
              >
                <app.icon className={clsx("w-4 h-4", isActive ? app.color : "text-gray-500")} />
                <span className="text-sm font-medium">{app.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </MockupContainer>
  );
};

// ============================================================================
// 7. Neon Glow (Cyberpunk)
// ============================================================================
const Variation7 = () => {
  const [active, setActive] = useState('dashboard');
  return (
    <MockupContainer title="7. Neon Outline">
      <div className="bg-[#050505] border-b border-white/5 py-4">
        <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide">
          {APPS.map(app => {
            const isActive = active === app.id;
            return (
              <button
                key={app.id}
                onClick={() => setActive(app.id)}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded border transition-all duration-300 whitespace-nowrap",
                  isActive 
                    ? "border-blue-500 bg-blue-500/10 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]" 
                    : "border-white/10 bg-transparent text-gray-500 hover:border-white/30 hover:text-gray-300"
                )}
              >
                <app.icon className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">{app.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </MockupContainer>
  );
};

// ============================================================================
// 8. Minimalist Dot
// ============================================================================
const Variation8 = () => {
  const [active, setActive] = useState('dashboard');
  return (
    <MockupContainer title="8. Minimalist Dot">
      <div className="bg-black border-b border-white/10 py-3">
        <div className="flex gap-8 px-6 overflow-x-auto scrollbar-hide">
          {APPS.map(app => {
            const isActive = active === app.id;
            return (
              <button
                key={app.id}
                onClick={() => setActive(app.id)}
                className="group flex flex-col items-center gap-2"
              >
                <div className={clsx(
                  "flex items-center gap-2 transition-opacity whitespace-nowrap",
                  isActive ? "opacity-100" : "opacity-50 group-hover:opacity-80"
                )}>
                   <app.icon className="w-5 h-5" />
                   <span className="text-sm font-medium">{app.name}</span>
                </div>
                <div className={clsx(
                  "w-1 h-1 rounded-full transition-all duration-300",
                  isActive ? "bg-white scale-100" : "bg-transparent scale-0"
                )} />
              </button>
            );
          })}
        </div>
      </div>
    </MockupContainer>
  );
};

// ============================================================================
// 9. Glass Chips (Gradient)
// ============================================================================
const Variation9 = () => {
  const [active, setActive] = useState('dashboard');
  return (
    <MockupContainer title="9. Glass Chips">
      <div className="bg-zinc-950 py-4">
        <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide">
          {APPS.map(app => {
            const isActive = active === app.id;
            return (
              <button
                key={app.id}
                onClick={() => setActive(app.id)}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-md transition-all whitespace-nowrap",
                  isActive 
                    ? "bg-white/10 border-white/20 text-white" 
                    : "bg-black/20 border-white/5 text-gray-500 hover:bg-white/5"
                )}
              >
                <div className={clsx("w-2 h-2 rounded-full", isActive ? "bg-green-400" : "bg-gray-600")} />
                <app.icon className="w-4 h-4" />
                <span className="text-sm">{app.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </MockupContainer>
  );
};

// ============================================================================
// 10. The Sidebar Top (Vertical Separators)
// ============================================================================
const Variation10 = () => {
  const [active, setActive] = useState('dashboard');
  return (
    <MockupContainer title="10. Divider Row">
      <div className="bg-black border-y border-white/10">
        <div className="flex items-stretch overflow-x-auto scrollbar-hide">
          {APPS.map(app => {
            const isActive = active === app.id;
            return (
              <button
                key={app.id}
                onClick={() => setActive(app.id)}
                className={clsx(
                  "flex items-center gap-3 px-6 py-4 border-r border-white/5 transition-colors whitespace-nowrap hover:bg-white/5",
                  isActive ? "bg-white/10" : ""
                )}
              >
                <app.icon className={clsx("w-5 h-5", isActive ? "text-white" : "text-gray-500")} />
                <span className={clsx("text-sm font-medium", isActive ? "text-white" : "text-gray-500")}>
                  {app.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </MockupContainer>
  );
};


export default function TopNavVariationsPage() {
  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-4xl font-black tracking-tighter">
            10 Top Navigation Mockups
          </h1>
          <p className="text-gray-400">
            Focus: Single row, Icon + Name, No Search, Responsive Scroll.
          </p>
        </div>

        <Variation1 />
        <Variation2 />
        <Variation3 />
        <Variation4 />
        <Variation5 />
        <Variation6 />
        <Variation7 />
        <Variation8 />
        <Variation9 />
        <Variation10 />
      </div>
    </div>
  );
}
