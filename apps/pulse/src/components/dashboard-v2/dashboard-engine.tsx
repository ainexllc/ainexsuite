'use client';

import { useState, useEffect, useRef } from 'react';
import { Settings, Clock, Plus, Sparkles, Monitor } from 'lucide-react';
import { User } from 'firebase/auth';
import { cn } from '@ainexsuite/ui';
import { BottomDock } from './bottom-dock';
import { WidgetWrapper } from './widget-wrapper';
import { LAYOUTS, DEFAULT_LAYOUT, LayoutConfig } from '@/lib/layouts';
import { CalendarTile } from '../tiles/calendar-tile';
import { WeatherTile } from '../tiles/weather-tile';
import { FocusTile } from '../tiles/focus-tile';
import { MarketTile } from '../tiles/market-tile';
import { SparkTile } from '../tiles/spark-tile';
import { TimerTile } from '../tiles/timer-tile';
import { NotesTile } from '../tiles/notes-tile'; // Assuming this exists or will exist

// --- Flip Clock Components (Copied for V2 prototype) ---
const FlipDigit = ({ digit }: { digit: string }) => {
  const [current, setCurrent] = useState(digit);
  const [prev, setPrev] = useState(digit);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (digit !== current) {
      setPrev(current);
      setCurrent(digit);
      setFlipping(true);
      const timer = setTimeout(() => {
        setFlipping(false);
        setPrev(digit);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [digit, current]);

  if (digit === ':' || digit === ' ') {
    return <div className="text-4xl md:text-8xl font-mono font-bold text-white/50 mx-1">{digit}</div>;
  }

  return (
    <div className="relative w-16 h-24 md:w-24 md:h-36 bg-[#222] rounded-xl shadow-2xl mx-1 perspective-1000">
      <div className="absolute inset-0 h-1/2 overflow-hidden rounded-t-xl bg-[#333] border-b border-black/20 z-0">
        <div className="absolute top-0 left-0 right-0 h-[200%] flex items-center justify-center text-5xl md:text-8xl font-bold text-white font-bebas">{current}</div>
      </div>
      <div className="absolute top-1/2 left-0 right-0 bottom-0 overflow-hidden rounded-b-xl bg-[#282828] z-0">
        <div className="absolute -top-[100%] left-0 right-0 h-[200%] flex items-center justify-center text-5xl md:text-8xl font-bold text-white font-bebas">{prev}</div>
      </div>
      {flipping && (
        <>
          <div className="absolute inset-0 h-1/2 overflow-hidden rounded-t-xl bg-[#333] border-b border-black/20 z-20 origin-bottom animate-flip-top" style={{ animationDuration: '0.6s', animationFillMode: 'forwards', backfaceVisibility: 'hidden' }}>
            <div className="absolute top-0 left-0 right-0 h-[200%] flex items-center justify-center text-5xl md:text-8xl font-bold text-white font-bebas">{prev}</div>
          </div>
          <div className="absolute top-1/2 left-0 right-0 bottom-0 overflow-hidden rounded-b-xl bg-[#282828] z-20 origin-top animate-flip-bottom" style={{ animationDuration: '0.6s', animationFillMode: 'forwards', backfaceVisibility: 'hidden', transform: 'rotateX(180deg)' }}>
            <div className="absolute -top-[100%] left-0 right-0 h-[200%] flex items-center justify-center text-5xl md:text-8xl font-bold text-white font-bebas">{current}</div>
          </div>
        </>
      )}
      <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-black/40 z-30 transform -translate-y-1/2 shadow-sm" />
    </div>
  );
};

const V2Clock = () => {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) return null;

  const formatTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    return {
      h1: Math.floor(hours / 10).toString(),
      h2: (hours % 10).toString(),
      m1: Math.floor(minutes / 10).toString(),
      m2: (minutes % 10).toString(),
      ampm
    };
  };

  const { h1, h2, m1, m2, ampm } = formatTime(time);

  return (
    <div className="flex flex-col items-center justify-center mb-8 scale-75 md:scale-100 origin-top">
      <div className="flex items-end gap-2">
        <div className="flex">
          {h1 !== '0' && <FlipDigit digit={h1} />}
          <FlipDigit digit={h2} />
        </div>
        <FlipDigit digit=":" />
        <div className="flex">
          <FlipDigit digit={m1} />
          <FlipDigit digit={m2} />
        </div>
        <div className="text-xl md:text-3xl font-bold text-white/50 mb-4 ml-2">{ampm}</div>
      </div>
    </div>
  );
};

// --- Main Engine ---

const MOCK_INITIAL_TILES = {
  'slot-1': 'weather',
  'slot-2': 'calendar',
  'slot-3': 'focus',
};

export function DashboardEngine({ user }: { user: User }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [layoutId, setLayoutId] = useState<string>('classic');
  const [tiles, setTiles] = useState<Record<string, string | null>>(MOCK_INITIAL_TILES);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);

  const activeLayout = LAYOUTS[layoutId] || DEFAULT_LAYOUT;

  // Auto-assign slots when layout changes
  useEffect(() => {
    // Ensure we don't lose widgets when switching layouts (simple migration)
    // Logic: Collect all active widgets, redistribute them into new slots.
    // For prototype, we just keep existing IDs if they match, otherwise drop.
    // (Production needs smarter migration)
  }, [layoutId]);

  const handleAddWidget = (type: string) => {
    // Find first empty slot
    const emptySlot = activeLayout.slots.find(slot => !tiles[slot.id]);
    if (emptySlot) {
      setTiles(prev => ({ ...prev, [emptySlot.id]: type }));
    } else {
      // If no empty slot, replace the last one? Or alert?
      // For prototype: Just replace the last slot
      const lastSlot = activeLayout.slots[activeLayout.slots.length - 1];
      setTiles(prev => ({ ...prev, [lastSlot.id]: type }));
    }
  };

  const handleRemoveWidget = (slotId: string) => {
    setTiles(prev => ({ ...prev, [slotId]: null }));
  };

  // Render Helpers
  const renderWidget = (type: string, slotId: string) => {
    const commonProps = {
      // Strip default styling so WidgetWrapper controls it
      className: "!bg-transparent !border-none !p-0 !shadow-none h-full",
      onRemove: undefined, // Managed by wrapper
      isDraggable: false, // Managed by wrapper
    };

    switch (type) {
      case 'calendar': return <CalendarTile {...commonProps} />;
      case 'weather': return <WeatherTile {...commonProps} />;
      case 'focus': return <FocusTile {...commonProps} />;
      case 'market': return <MarketTile {...commonProps} />;
      case 'spark': return <SparkTile {...commonProps} />;
      case 'timer': return <TimerTile {...commonProps} />;
      case 'notes': return <NotesTile {...commonProps} />;
      default: return <div className="text-white/50">Unknown Widget</div>;
    }
  };

  return (
    <div className="relative h-full w-full flex flex-col">
      {/* Background Layer */}
      <div className="fixed inset-0 -z-10">
         {backgroundImage ? (
           // eslint-disable-next-line @next/next/no-img-element
           <img src={backgroundImage} alt="bg" className="w-full h-full object-cover transition-all duration-500" style={{ filter: isEditMode ? 'blur(10px) brightness(0.5)' : 'brightness(0.7)' }} />
         ) : (
           <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black" />
         )}
      </div>

      {/* Top Actions */}
      <div className="absolute top-0 right-0 z-40 p-4">
        <button
          onClick={() => setIsEditMode(!isEditMode)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-300",
            isEditMode 
              ? "bg-accent-500 text-white shadow-lg scale-105" 
              : "bg-white/10 text-white/80 hover:bg-white/20 backdrop-blur-md"
          )}
        >
          {isEditMode ? <Settings className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {isEditMode ? 'Done' : 'Customize'}
        </button>
      </div>

      {/* Content Container */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-500 p-4 md:p-8 overflow-y-auto",
        isEditMode && "scale-[0.98] translate-y-[-20px]" // Slight "zoom out" effect
      )}>
        <V2Clock />

        {/* The Grid */}
        <div className={cn(
          "grid w-full max-w-6xl mx-auto transition-all duration-500",
          activeLayout.gridClassName
        )}>
          {activeLayout.slots.map((slot) => (
            <div 
              key={slot.id} 
              className={cn(
                slot.className,
                "transition-all duration-300 min-h-[200px]",
                // Grid lines in edit mode
                isEditMode && !tiles[slot.id] && "border-2 border-dashed border-white/10 rounded-2xl bg-white/5"
              )}
            >
              {tiles[slot.id] ? (
                <WidgetWrapper
                  isEditMode={isEditMode}
                  onRemove={() => handleRemoveWidget(slot.id)}
                >
                  {renderWidget(tiles[slot.id]!, slot.id)}
                </WidgetWrapper>
              ) : (
                // Empty Slot State
                isEditMode && (
                  <button
                    onClick={() => handleAddWidget('calendar')} // Default action or open menu
                    className="w-full h-full flex flex-col items-center justify-center gap-2 text-white/20 hover:text-white/60 hover:bg-white/5 rounded-2xl transition-all"
                  >
                    <Plus className="w-8 h-8" />
                    <span className="text-xs font-medium">Add Widget</span>
                  </button>
                )
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Dock */}
      <BottomDock 
        isOpen={isEditMode} 
        onClose={() => setIsEditMode(false)}
        onAddWidget={handleAddWidget}
        onSelectLayout={setLayoutId}
        activeLayoutId={layoutId}
        onSelectBackground={setBackgroundImage}
      />
    </div>
  );
}
