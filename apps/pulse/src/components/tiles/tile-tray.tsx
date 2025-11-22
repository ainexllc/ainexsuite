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
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const trayRef = useRef<HTMLDivElement>(null);

  // Reset position when tray opens
  useEffect(() => {
    if (isOpen && position === null) {
       setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, position]);

  const dragRef = useRef({ 
    startX: 0, 
    startY: 0, 
    initialX: 0, 
    initialY: 0,
    isDragging: false 
  });

  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (!dragRef.current.isDragging) return;
      
      const dx = clientX - dragRef.current.startX;
      const dy = clientY - dragRef.current.startY;
      
      setPosition({
        x: dragRef.current.initialX + dx,
        y: dragRef.current.initialY + dy
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        e.preventDefault(); // Prevent scrolling
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleEnd = () => {
      dragRef.current.isDragging = false;
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging]);

  const startDrag = (clientX: number, clientY: number) => {
    setIsDragging(true);
    dragRef.current = {
      isDragging: true,
      startX: clientX,
      startY: clientY,
      initialX: position?.x || 0,
      initialY: position?.y || 0
    };
  };

  const onHeaderMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    startDrag(e.clientX, e.clientY);
  };

  const onHeaderTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    if (e.touches.length > 0) {
      startDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  if (!isOpen) return null;

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
        className={`flex items-center justify-between p-4 border-b border-white/5 bg-white/5 select-none touch-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={onHeaderMouseDown}
        onTouchStart={onHeaderTouchStart}
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="w-4 h-4 text-white/40" />
          <h3 className="text-sm font-semibold text-white/80">Customize</h3>
        </div>
        <button 
          onClick={onClose}
          className="p-1 text-white/40 hover:text-white transition-colors cursor-pointer"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
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
