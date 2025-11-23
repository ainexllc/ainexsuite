'use client';

import { useState } from 'react';
import { Grid, Layout, Image as ImageIcon, Plus, Monitor, Smartphone, X } from 'lucide-react';
import { cn } from '@ainexsuite/ui';
import { LAYOUTS } from '@/lib/layouts';
import { BACKGROUND_OPTIONS } from '@/lib/backgrounds';

interface BottomDockProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWidget: (type: string) => void;
  onSelectLayout: (id: string) => void;
  onSelectBackground: (url: string | null) => void;
  activeLayoutId: string;
}

export function BottomDock({
  isOpen,
  onClose,
  onAddWidget,
  onSelectLayout,
  onSelectBackground,
  activeLayoutId
}: BottomDockProps) {
  const [activeTab, setActiveTab] = useState<'widgets' | 'layouts' | 'backgrounds'>('widgets');

  return (
    <div className={cn(
      "fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl z-50 transition-all duration-500 ease-out",
      isOpen ? "translate-y-0 opacity-100" : "translate-y-[200%] opacity-0"
    )}>
      <div className="bg-surface-elevated/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[320px] md:h-[240px]">
        
        {/* Sidebar / Tabs */}
        <div className="w-full md:w-16 bg-black/20 border-b md:border-b-0 md:border-r border-white/5 p-2 flex md:flex-col gap-2 items-center justify-center md:justify-start">
          <DockTab 
            icon={<Grid className="w-5 h-5" />} 
            label="Widgets" 
            active={activeTab === 'widgets'} 
            onClick={() => setActiveTab('widgets')} 
          />
          <DockTab 
            icon={<Layout className="w-5 h-5" />} 
            label="Layouts" 
            active={activeTab === 'layouts'} 
            onClick={() => setActiveTab('layouts')} 
          />
          <DockTab 
            icon={<ImageIcon className="w-5 h-5" />} 
            label="Wallpapers" 
            active={activeTab === 'backgrounds'} 
            onClick={() => setActiveTab('backgrounds')} 
          />
          
          <div className="flex-1" />
          
          <button 
            onClick={onClose}
            className="p-3 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors md:mt-auto"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto scrollbar-hide">
            
          {/* WIDGETS TAB */}
          {activeTab === 'widgets' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white/90 mb-4">Add Widgets</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <WidgetCard 
                  title="Weather" 
                  desc="Forecast & Conditions" 
                  icon="🌡️" 
                  onClick={() => onAddWidget('weather')} 
                />
                <WidgetCard 
                  title="Calendar" 
                  desc="Upcoming Events" 
                  icon="📅" 
                  onClick={() => onAddWidget('calendar')} 
                />
                <WidgetCard 
                  title="Focus Timer" 
                  desc="Pomodoro & Stopwatch" 
                  icon="⏱️" 
                  onClick={() => onAddWidget('focus')} 
                />
                <WidgetCard 
                  title="Market" 
                  desc="Stocks & Crypto" 
                  icon="📈" 
                  onClick={() => onAddWidget('market')} 
                />
                <WidgetCard 
                  title="Spark AI" 
                  desc="Daily Inspiration" 
                  icon="✨" 
                  onClick={() => onAddWidget('spark')} 
                />
                <WidgetCard 
                  title="Quick Note" 
                  desc="Scratchpad" 
                  icon="📝" 
                  onClick={() => onAddWidget('notes')} 
                />
              </div>
            </div>
          )}

          {/* LAYOUTS TAB */}
          {activeTab === 'layouts' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white/90 mb-4">Choose Layout</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.values(LAYOUTS).map(layout => (
                  <button
                    key={layout.id}
                    onClick={() => onSelectLayout(layout.id)}
                    className={cn(
                      "p-4 rounded-xl border text-left transition-all group",
                      activeLayoutId === layout.id 
                        ? "bg-accent-500/20 border-accent-500" 
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    )}
                  >
                    <div className="mb-2 text-accent-400">
                        {layout.id === 'desktop' ? <Monitor className="w-6 h-6" /> : <Grid className="w-6 h-6" />}
                    </div>
                    <div className="text-sm font-medium text-white group-hover:text-accent-300">{layout.name}</div>
                    <div className="text-xs text-white/40 mt-1">{layout.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* BACKGROUNDS TAB */}
          {activeTab === 'backgrounds' && (
             <div className="space-y-4">
             <h3 className="text-lg font-semibold text-white/90 mb-4">Wallpapers</h3>
             <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
               {BACKGROUND_OPTIONS.map((bg) => (
                 <button
                    key={bg.id}
                    onClick={() => onSelectBackground(bg.value)}
                    className="relative aspect-video rounded-lg overflow-hidden border border-white/10 hover:border-white/50 transition-all group"
                 >
                    {bg.type === 'image' ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={bg.value} alt={bg.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full" style={{ background: bg.value }} />
                    )}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs font-medium text-white">{bg.name}</span>
                    </div>
                 </button>
               ))}
             </div>
           </div>
          )}

        </div>
      </div>
    </div>
  );
}

function DockTab({ icon, label, active, onClick }: { icon: ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-3 rounded-xl flex md:flex-col items-center gap-2 md:gap-1 transition-all w-full md:w-auto",
        active ? "bg-accent-500 text-white shadow-lg shadow-accent-500/20" : "text-white/40 hover:text-white hover:bg-white/5"
      )}
    >
      {icon}
      <span className="text-[10px] font-medium hidden md:block">{label}</span>
    </button>
  );
}

function WidgetCard({ title, desc, icon, onClick }: { title: string, desc: string, icon: string, onClick: () => void }) {
    return (
        <button 
            onClick={onClick}
            className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-left group"
        >
            <div className="w-10 h-10 rounded-lg bg-black/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <div>
                <div className="text-sm font-medium text-white">{title}</div>
                <div className="text-xs text-white/40">{desc}</div>
            </div>
        </button>
    )
}
