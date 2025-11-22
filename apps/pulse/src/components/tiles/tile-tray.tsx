'use client';

import { X, Layout, Image as ImageIcon, GripHorizontal } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { CalendarTile } from './calendar-tile';
import { FocusTile } from './focus-tile';
import { SparkTile } from './spark-tile';
import { WeatherTile } from './weather-tile';
import { MarketTile } from './market-tile';
import { BACKGROUND_OPTIONS } from '@/lib/backgrounds';

interface TileTrayProps {
  isOpen: boolean;
  onClose: () => void;
  currentBackground: string | null;
  onSelectBackground: (url: string | null) => void;
}

export function TileTray({ isOpen, onClose, currentBackground, onSelectBackground }: TileTrayProps) {
  const [activeTab, setActiveTab] = useState<'tiles' | 'backgrounds'>('tiles');
  // Start with null so we know it's uninitialized
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const trayRef = useRef<HTMLDivElement>(null);

  // Reset position when tray opens or switch to saving strictly relative to the *clock* container
  useEffect(() => {
    if (isOpen && position === null) {
       // Default initial position (top-right relative to the clock container)
       // Since it's absolute positioned, we can just start at {0, 0} or specific coordinates if we want
       // We'll rely on the initial render position defined by CSS (top-16 right-4) 
       // and use transform for the *delta* movement.
       setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, position]);

  // Optimization: Use refs for mutable drag state to avoid re-renders during move
  const dragRef = useRef({ 
    startX: 0, 
    startY: 0, 
    initialX: 0, 
    initialY: 0,
    isDragging: false 
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current.isDragging) return;
      
      e.preventDefault(); // Prevent selection/scrolling while dragging
      
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      
      // Update state via requestAnimationFrame only if needed, but direct update is usually fine for simple xy
      // Using functional update to avoid dependency issues
      setPosition({
        x: dragRef.current.initialX + dx,
        y: dragRef.current.initialY + dy
      });
    };

    const handleMouseUp = () => {
      dragRef.current.isDragging = false;
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const onHeaderMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    
    setIsDragging(true);
    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      initialX: position?.x || 0,
      initialY: position?.y || 0
    };
  };

  if (!isOpen) return null;

  // If position is null, we haven't initialized, but we can render at 0,0 delta
  const currentPos = position || { x: 0, y: 0 };

  return (
    <div 
      ref={trayRef}
      style={{ 
        transform: `translate3d(${currentPos.x}px, ${currentPos.y}px, 0)`,
        willChange: isDragging ? 'transform' : 'auto'
      }}
      className="absolute top-16 right-4 w-[320px] md:w-[360px] bg-surface-elevated border border-outline-subtle rounded-2xl shadow-xl z-40 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden flex flex-col max-h-[500px]"
    >
      {/* Header - Draggable Handle */}
      <div 
        className={`flex items-center justify-between p-4 border-b border-white/5 bg-white/5 select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={onHeaderMouseDown}
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="w-4 h-4 text-white/40" />
          <h3 className="text-sm font-semibold text-white/80">Customize</h3>
        </div>
        <button 
          onClick={onClose}
          className="p-1 text-white/40 hover:text-white transition-colors cursor-pointer"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex p-2 gap-2 border-b border-white/5">
        <button
          onClick={() => setActiveTab('tiles')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'tiles' 
              ? 'bg-white/10 text-white' 
              : 'text-white/40 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layout className="w-4 h-4" />
          Tiles
        </button>
        <button
          onClick={() => setActiveTab('backgrounds')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'backgrounds' 
              ? 'bg-white/10 text-white' 
              : 'text-white/40 hover:text-white hover:bg-white/5'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          Backgrounds
        </button>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {activeTab === 'tiles' ? (
          <div className="flex flex-col gap-4">
            <div>
              <CalendarTile id="calendar-tray" isDraggable={true} />
            </div>
            <div>
              <FocusTile id="focus-tray" isDraggable={true} />
            </div>
            <div>
              <SparkTile id="spark-tray" isDraggable={true} />
            </div>
            <div>
              <WeatherTile id="weather-tray" isDraggable={true} />
            </div>
            <div>
              <MarketTile id="market-tray" isDraggable={true} />
            </div>
            <p className="text-xs text-white/30 text-center mt-4 select-none">
              Drag tiles to the slots around the clock
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {BACKGROUND_OPTIONS.map((bg) => (
              <button
                key={bg.id}
                onClick={() => onSelectBackground(bg.url)}
                className={`group relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                  currentBackground === bg.url 
                    ? 'border-accent-500' 
                    : 'border-transparent hover:border-white/20'
                }`}
                style={{ position: 'relative' }}
              >
                {bg.url ? (
                  <Image 
                    src={bg.url} 
                    alt={bg.name} 
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 160px"
                  />
                ) : (
                  <div className="w-full h-full bg-black flex items-center justify-center">
                    <span className="text-xs text-white/50 font-medium">{bg.name}</span>
                  </div>
                )}
                
                {/* Selected Overlay */}
                {currentBackground === bg.url && (
                  <div className="absolute inset-0 bg-accent-500/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-accent-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                  </div>
                )}
                
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[10px] font-medium text-white truncate">{bg.name}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
