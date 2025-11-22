'use client';

import { X, Layout, Image as ImageIcon, GripHorizontal, Grid, CloudRain } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { CalendarTile } from './calendar-tile';
import { FocusTile } from './focus-tile';
import { SparkTile } from './spark-tile';
import { WeatherTile } from './weather-tile';
import { MarketTile } from './market-tile';
import { BACKGROUND_OPTIONS } from '@/lib/backgrounds';
import { LAYOUTS } from '@/lib/layouts';
import { EffectType } from '../background-effects';

function LayoutPreview({ id, isActive }: { id: string; isActive: boolean }) {
  const baseColor = isActive ? 'bg-accent-500' : 'bg-white/40 group-hover:bg-white/60';
  const borderColor = isActive ? 'border-accent-500' : 'border-white/10';
  const containerClass = `w-12 h-9 rounded flex gap-0.5 p-0.5 border ${borderColor} transition-colors`;

  if (id === 'classic') {
    return (
      <div className={`${containerClass} flex-col`}>
        <div className={`w-full h-2.5 rounded-[1px] ${baseColor} opacity-90`} /> {/* Clock */}
        <div className="flex-1 grid grid-cols-3 gap-0.5">
          <div className={`rounded-[1px] ${baseColor} opacity-50`} />
          <div className={`rounded-[1px] ${baseColor} opacity-50`} />
          <div className={`rounded-[1px] ${baseColor} opacity-50`} />
        </div>
      </div>
    );
  }
  
  if (id === 'dashboard') {
    return (
      <div className={`${containerClass} flex-col`}>
        <div className={`w-full h-2 rounded-[1px] ${baseColor} opacity-90`} /> {/* Clock Header */}
        <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-0.5">
           {[...Array(6)].map((_, i) => (
             <div key={i} className={`rounded-[1px] ${baseColor} opacity-50`} />
           ))}
        </div>
      </div>
    );
  }

  if (id === 'studio-right') {
     return (
      <div className={`${containerClass} grid-cols-2`}>
        {/* Left Col: Clock + Tile */}
        <div className="flex flex-col gap-0.5">
           <div className={`h-3 rounded-[1px] ${baseColor} opacity-90`} /> {/* Clock */}
           <div className={`flex-1 rounded-[1px] ${baseColor} opacity-50`} /> {/* Tile */}
        </div>
        {/* Right Col: 2x2 Grid */}
        <div className="grid grid-cols-2 grid-rows-2 gap-0.5">
           {[...Array(4)].map((_, i) => (
             <div key={i} className={`rounded-[1px] ${baseColor} opacity-50`} />
           ))}
        </div>
      </div>
    );
  }

  if (id === 'studio-left') {
     return (
      <div className={`${containerClass} grid-cols-2`}>
        {/* Left Col: 2x2 Grid */}
        <div className="grid grid-cols-2 grid-rows-2 gap-0.5">
           {[...Array(4)].map((_, i) => (
             <div key={i} className={`rounded-[1px] ${baseColor} opacity-50`} />
           ))}
        </div>
        {/* Right Col: Clock + Tile */}
        <div className="flex flex-col gap-0.5">
           <div className={`h-3 rounded-[1px] ${baseColor} opacity-90`} /> {/* Clock */}
           <div className={`flex-1 rounded-[1px] ${baseColor} opacity-50`} /> {/* Tile */}
        </div>
      </div>
    );
  }
  
  return <div className={`w-12 h-9 bg-white/10 rounded border ${borderColor}`} />;
}

interface TileTrayProps {
  isOpen: boolean;
  onClose: () => void;
  currentBackground: string | null;
  onSelectBackground: (url: string | null) => void;
  activeLayoutId: string;
  onSelectLayout: (layoutId: string) => void;
  activeEffect: EffectType;
  onSelectEffect: (effect: EffectType) => void;
}

export function TileTray({ 
  isOpen, 
  onClose, 
  currentBackground, 
  onSelectBackground,
  activeLayoutId,
  onSelectLayout,
  activeEffect,
  onSelectEffect
}: TileTrayProps) {
  const [activeTab, setActiveTab] = useState<'tiles' | 'backgrounds' | 'layouts' | 'effects'>('tiles');
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
      <div className="flex p-2 gap-1 border-b border-white/5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('tiles')}
          className={`flex-shrink-0 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'tiles' 
              ? 'bg-white/10 text-white' 
              : 'text-white/40 hover:text-white hover:bg-white/5'
          }`}
        >
          <Grid className="w-3 h-3" />
          Tiles
        </button>
        <button
          onClick={() => setActiveTab('layouts')}
          className={`flex-shrink-0 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'layouts' 
              ? 'bg-white/10 text-white' 
              : 'text-white/40 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layout className="w-3 h-3" />
          Layouts
        </button>
        <button
          onClick={() => setActiveTab('backgrounds')}
          className={`flex-shrink-0 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'backgrounds' 
              ? 'bg-white/10 text-white' 
              : 'text-white/40 hover:text-white hover:bg-white/5'
          }`}
        >
          <ImageIcon className="w-3 h-3" />
          BG
        </button>
        <button
          onClick={() => setActiveTab('effects')}
          className={`flex-shrink-0 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'effects' 
              ? 'bg-white/10 text-white' 
              : 'text-white/40 hover:text-white hover:bg-white/5'
          }`}
        >
          <CloudRain className="w-3 h-3" />
          Effects
        </button>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {activeTab === 'tiles' && (
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
        )}

        {activeTab === 'layouts' && (
            <div className="grid grid-cols-1 gap-3">
                {Object.values(LAYOUTS).map((layout) => (
                    <button
                        key={layout.id}
                        onClick={() => onSelectLayout(layout.id)}
                        className={`group flex items-center gap-4 p-3 rounded-xl border transition-all text-left ${
                            activeLayoutId === layout.id 
                                ? 'bg-white/10 border-accent-500' 
                                : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                        }`}
                    >
                        <LayoutPreview id={layout.id} isActive={activeLayoutId === layout.id} />
                        
                        <div>
                            <h4 className={`text-sm font-medium ${activeLayoutId === layout.id ? 'text-white' : 'text-white/80'}`}>
                                {layout.name}
                            </h4>
                            <p className="text-xs text-white/40 mt-1 leading-relaxed">
                                {layout.description}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        )}

        {activeTab === 'backgrounds' && (
          <div className="flex flex-col gap-4">
            {/* Presets Grid */}
            <div className="grid grid-cols-2 gap-3">
              {BACKGROUND_OPTIONS.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => onSelectBackground(bg.value)}
                  className={`group relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                    currentBackground === bg.value 
                      ? 'border-accent-500' 
                      : 'border-transparent hover:border-white/20'
                  }`}
                  style={{ position: 'relative' }}
                >
                  {bg.type === 'image' && bg.url ? (
                    <Image 
                      src={bg.url} 
                      alt={bg.name} 
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 160px"
                    />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: bg.value || '#000000' }}
                    >
                      <span className="text-xs text-white/50 font-medium mix-blend-difference">{bg.name}</span>
                    </div>
                  )}
                  
                  {/* Selected Overlay */}
                  {currentBackground === bg.value && (
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

            {/* Custom Color Picker */}
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center justify-between gap-4">
                <label htmlFor="bg-color-picker" className="text-xs font-medium text-white/80">Custom Color</label>
                <div className="flex items-center gap-2">
                  <input 
                    id="bg-color-picker"
                    type="color" 
                    value={currentBackground?.startsWith('#') ? currentBackground : '#000000'}
                    onChange={(e) => onSelectBackground(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-none p-0"
                  />
                  <span className="text-xs font-mono text-white/40">
                    {currentBackground?.startsWith('#') ? currentBackground : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'effects' && (
            <div className="grid grid-cols-2 gap-3">
                {[
                    { id: 'none', name: 'None', icon: '🚫' },
                    { id: 'rain', name: 'Rain', icon: '🌧️' },
                    { id: 'heavy-rain', name: 'Heavy Rain', icon: '⛈️' },
                    { id: 'snow', name: 'Snow', icon: '❄️' },
                    { id: 'heavy-snow', name: 'Heavy Snow', icon: '🌨️' },
                    { id: 'fog', name: 'Mystic Fog', icon: '🌫️' },
                    { id: 'christmas-lights', name: 'Lights', icon: '🎄' },
                    { id: 'christmas-lights-snow', name: 'Lights & Snow', icon: '⛄' },
                    { id: 'fireflies', name: 'Fireflies', icon: '✨' },
                    { id: 'sakura', name: 'Sakura', icon: '🌸' },
                    { id: 'confetti', name: 'Confetti', icon: '🎉' },
                ].map((effect) => (
                    <button
                        key={effect.id}
                        onClick={() => onSelectEffect(effect.id as EffectType)}
                        className={`
                            flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all
                            ${activeEffect === effect.id 
                                ? 'bg-accent-500/20 border-accent-500 text-white' 
                                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white/60 hover:text-white'
                            }
                        `}
                    >
                        <span className="text-2xl">{effect.icon}</span>
                        <span className="text-xs font-medium">{effect.name}</span>
                    </button>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
