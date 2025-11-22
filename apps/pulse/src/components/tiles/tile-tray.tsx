'use client';

import { X, Layout, Image as ImageIcon, GripHorizontal, Grid, CloudRain, Sparkles, Loader2 } from 'lucide-react';
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

  if (id === 'desktop') {
    return (
      <div className={`${containerClass} flex-col`}>
        <div className={`w-full h-2 rounded-[1px] ${baseColor} opacity-90`} /> {/* Clock Header */}
        <div className="flex-1 grid grid-cols-4 gap-0.5">
           <div className={`col-span-2 rounded-[1px] ${baseColor} opacity-50`} />
           <div className={`col-span-2 rounded-[1px] ${baseColor} opacity-50`} />
           <div className={`col-span-1 rounded-[1px] ${baseColor} opacity-50`} />
           <div className={`col-span-1 rounded-[1px] ${baseColor} opacity-50`} />
           <div className={`col-span-1 rounded-[1px] ${baseColor} opacity-50`} />
           <div className={`col-span-1 rounded-[1px] ${baseColor} opacity-50`} />
           <div className={`col-span-2 rounded-[1px] ${baseColor} opacity-50`} />
           <div className={`col-span-2 rounded-[1px] ${baseColor} opacity-50`} />
        </div>
      </div>
    );
  }

  if (id === 'studio-right') {
     return (
      <div className={containerClass}>
        {/* Left Col: Clock + Tile */}
        <div className="flex-1 h-full flex flex-col gap-0.5">
           <div className={`h-3 rounded-[1px] ${baseColor} opacity-90`} /> {/* Clock */}
           <div className={`flex-1 rounded-[1px] ${baseColor} opacity-50`} /> {/* Tile */}
        </div>
        {/* Right Col: 2x2 Grid */}
        <div className="flex-1 h-full grid grid-cols-2 gap-0.5">
           {[...Array(4)].map((_, i) => (
             <div key={i} className={`rounded-[1px] ${baseColor} opacity-50`} />
           ))}
        </div>
      </div>
    );
  }

  if (id === 'studio-left') {
     return (
      <div className={containerClass}>
        {/* Left Col: 2x2 Grid */}
        <div className="flex-1 h-full grid grid-cols-2 gap-0.5">
           {[...Array(4)].map((_, i) => (
             <div key={i} className={`rounded-[1px] ${baseColor} opacity-50`} />
           ))}
        </div>
        {/* Right Col: Clock + Tile */}
        <div className="flex-1 h-full flex flex-col gap-0.5">
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
  backgroundDim?: number;
  onSelectDim?: (dim: number) => void;
}

export function TileTray({ 
  isOpen, 
  onClose, 
  currentBackground, 
  onSelectBackground,
  activeLayoutId,
  onSelectLayout,
  activeEffect,
  onSelectEffect,
  backgroundDim = 50,
  onSelectDim
}: TileTrayProps) {
  const [activeTab, setActiveTab] = useState<'tiles' | 'backgrounds' | 'layouts' | 'effects'>('tiles');
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const trayRef = useRef<HTMLDivElement>(null);

  // AI Generation State
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerateImage = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.imageUrl) {
        setGeneratedImage(data.imageUrl);
      } else {
        console.error('Generation failed:', data.error);
        // Could add toast notification here
      }
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

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
            {/* AI Generator */}
            <div className="p-4 bg-gradient-to-b from-indigo-500/10 to-purple-500/10 rounded-xl border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 mb-1">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">AI Generator</span>
              </div>
              
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your dream background... (e.g., 'Cyberpunk city at night', 'Peaceful zen garden')"
                className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 resize-none h-20"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleGenerateImage();
                  }
                }}
              />
              
              <button
                onClick={handleGenerateImage}
                disabled={isGenerating || !prompt.trim()}
                className={`w-full py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  isGenerating || !prompt.trim()
                    ? 'bg-white/5 text-white/30 cursor-not-allowed'
                    : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Background'
                )}
              </button>

              {generatedImage && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-white/20 group">
                    <Image 
                      src={generatedImage} 
                      alt="Generated background" 
                      fill 
                      className="object-cover" 
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                       <button
                        onClick={() => onSelectBackground(generatedImage)}
                        className="px-3 py-1.5 bg-white text-black text-xs font-bold rounded-full hover:scale-105 transition-transform"
                      >
                        Use Background
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

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
                  {bg.type === 'image' ? (
                    <Image 
                      src={bg.value} 
                      alt={bg.name} 
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 160px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: bg.value || '#000000' }}>
                      <span className="text-xs text-white/50 font-medium">{bg.name}</span>
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

            {/* Dimming Controls */}
            {onSelectDim && (
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-white/80">Background Dimming</label>
                  <span className="text-xs font-mono text-white/40">{backgroundDim}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="10"
                  value={backgroundDim}
                  onChange={(e) => onSelectDim(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-white/30 px-1">
                  <span>Bright</span>
                  <span>Dim</span>
                  <span>Dark</span>
                </div>
              </div>
            )}
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
                    { id: 'fireworks', name: 'Fireworks', icon: '🎆' },
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
