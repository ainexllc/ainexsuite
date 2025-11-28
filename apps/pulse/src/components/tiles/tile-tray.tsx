'use client';

import { X, Layout, Image as ImageIcon, GripHorizontal, Grid, CloudRain, Sparkles, Loader2, Clock, Palette, Upload, Trash2, Check, Plus, AlertTriangle } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { CalendarTile } from './calendar-tile';
import { FocusTile } from './focus-tile';
import { SparkTile } from './spark-tile';
import { WeatherTile } from './weather-tile';
import { MarketTile } from './market-tile';
import { TimerTile } from './timer-tile';
import { AlarmClockTile } from './alarm-clock-tile';
import { BACKGROUND_OPTIONS } from '@/lib/backgrounds';
import { LAYOUTS } from '@/lib/layouts';
import { EffectType } from '../background-effects';
import { ClockStyle } from '@/lib/clock-settings';
import { useAuth } from '@ainexsuite/auth';
import { UserBackgroundsService, UserBackground } from '@/lib/user-backgrounds';

// Confirmation Modal Component
function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  isDestructive = false 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  title: string; 
  message: string; 
  isDestructive?: boolean; 
}) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center p-4 bg-background/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1a1a1a] border border-border rounded-xl shadow-2xl w-full max-w-xs p-4 space-y-4 transform animate-in zoom-in-95 duration-200">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${isDestructive ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-3 py-1.5 text-xs font-medium text-foreground rounded-lg transition-colors shadow-lg ${
              isDestructive
                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                : 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/20'
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function LayoutPreview({ id, isActive }: { id: string; isActive: boolean }) {
  const baseColor = isActive ? 'bg-accent-500' : 'bg-foreground/40 group-hover:bg-foreground/60';
  const borderColor = isActive ? 'border-accent-500' : 'border-border';
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
  clockStyle?: ClockStyle;
  onSelectClockStyle?: (style: ClockStyle) => void;
  timeFormat?: '12h' | '24h';
  onSelectTimeFormat?: (format: '12h' | '24h') => void;
  onAddTile?: (type: string) => void;
  showClock?: boolean;
  onToggleShowClock?: (show: boolean) => void;
  showTiles?: boolean;
  onToggleShowTiles?: (show: boolean) => void;
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
  onSelectDim,
  clockStyle = 'digital',
  onSelectClockStyle,
  timeFormat = '12h',
  onSelectTimeFormat,
  onAddTile,
  showClock = true,
  onToggleShowClock,
  showTiles = true,
  onToggleShowTiles
}: TileTrayProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'widgets' | 'layout' | 'appearance' | 'clock'>('widgets');
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const trayRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // User Images State
  const [userImages, setUserImages] = useState<UserBackground[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);

  // AI Generation State
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const loadUserImages = useCallback(async () => {
    if (!user) return;
    setIsLoadingImages(true);
    try {
      const images = await UserBackgroundsService.getUserBackgrounds(user.uid);
      setUserImages(images);
    } catch (error) {
      console.error('Failed to load images:', error);
    } finally {
      setIsLoadingImages(false);
    }
  }, [user]);

  // Load images when Appearance tab is active
  useEffect(() => {
    if (activeTab === 'appearance' && user) {
      loadUserImages();
    }
  }, [activeTab, user, loadUserImages]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const url = await UserBackgroundsService.uploadBackground(user.uid, file);
      await loadUserImages();
      onSelectBackground(url);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const confirmDeleteImage = (fullPath: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setImageToDelete(fullPath);
  };

  const handleDeleteImage = async () => {
    if (!user || !imageToDelete) return;

    try {
      await UserBackgroundsService.deleteBackground(imageToDelete);
      
      // If deleted image was active, reset background
      const deletedImage = userImages.find(img => img.fullPath === imageToDelete);
      if (deletedImage && currentBackground === deletedImage.url) {
        onSelectBackground(null);
      }

      await loadUserImages();
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setImageToDelete(null);
    }
  };

  const handleSaveGeneratedImage = async () => {
    if (!generatedImage || !user) return;
    
    setIsUploading(true);
    try {
      // Fetch the image blob from the URL
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      
      // Upload to storage
      const url = await UserBackgroundsService.uploadBackground(
        user.uid, 
        blob, 
        `ai-generated-${Date.now()}.png`
      );
      
      await loadUserImages();
      onSelectBackground(url);
      setGeneratedImage(null); // Clear preview
      setPrompt('');
    } catch (error) {
      console.error('Failed to save generated image:', error);
    } finally {
      setIsUploading(false);
    }
  };

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
    <>
      <ConfirmationModal
        isOpen={!!imageToDelete}
        onClose={() => setImageToDelete(null)}
        onConfirm={handleDeleteImage}
        title="Delete Image"
        message="Are you sure you want to delete this background image? This action cannot be undone."
        isDestructive={true}
      />

      <div 
        ref={trayRef}
        style={{ 
          transform: `translate3d(${currentPos.x}px, ${currentPos.y}px, 0)`,
          willChange: isDragging ? 'transform' : 'auto'
        }}
        className="absolute top-16 right-4 w-[340px] md:w-[380px] bg-surface-elevated/95 backdrop-blur-xl border border-outline-subtle rounded-2xl shadow-2xl z-40 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden flex flex-col max-h-[600px]"
      >
        {/* Header - Draggable Handle */}
        <div
          className={`flex items-center justify-between p-4 border-b border-border bg-foreground/5 select-none touch-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          onMouseDown={onHeaderMouseDown}
          onTouchStart={onHeaderTouchStart}
        >
          <div className="flex items-center gap-2">
            <GripHorizontal className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground/90 tracking-wide">Customize</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-foreground/5 text-muted-foreground hover:bg-foreground/10 hover:text-foreground transition-all cursor-pointer"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex p-1.5 gap-1 border-b border-border bg-background/20">
          {[
              { id: 'widgets', label: 'Widgets', icon: Grid },
              { id: 'layout', label: 'Layout', icon: Layout },
              { id: 'appearance', label: 'Look', icon: Palette },
              { id: 'clock', label: 'Clock', icon: Clock },
          ].map((tab) => (
              <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'widgets' | 'layout' | 'appearance' | 'clock')}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-medium transition-all ${
                      activeTab === tab.id
                      ? 'bg-foreground/10 text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-foreground/10'
                  }`}
              >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
              </button>
          ))}
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-foreground/10 scrollbar-track-transparent">
          {activeTab === 'widgets' && (
            <div className="flex flex-col gap-4">
              {onToggleShowTiles && (
                <div className="p-3 bg-foreground/5 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-foreground/80">Show Tiles</label>
                    <button
                      onClick={() => onToggleShowTiles(!showTiles)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        showTiles ? 'bg-indigo-500' : 'bg-foreground/10'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-foreground rounded-full transition-transform ${
                          showTiles ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}

              <div className="p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20 mb-2">
                  <div className="flex items-center gap-2 text-indigo-200 text-xs font-medium">
                      <Grid className="w-4 h-4" />
                      <span>Drag to place, or click to auto-fill</span>
                  </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                  <div onClick={() => onAddTile?.('alarm-clock')} className="cursor-pointer hover:scale-[1.02] transition-transform active:scale-95">
                  <AlarmClockTile id="alarm-clock-tray" isDraggable={true} />
                  </div>
                  <div onClick={() => onAddTile?.('calendar')} className="cursor-pointer hover:scale-[1.02] transition-transform active:scale-95">
                  <CalendarTile id="calendar-tray" isDraggable={true} />
                  </div>
                  <div onClick={() => onAddTile?.('focus')} className="cursor-pointer hover:scale-[1.02] transition-transform active:scale-95">
                  <FocusTile id="focus-tray" isDraggable={true} />
                  </div>
                  <div onClick={() => onAddTile?.('spark')} className="cursor-pointer hover:scale-[1.02] transition-transform active:scale-95">
                  <SparkTile id="spark-tray" isDraggable={true} />
                  </div>
                  <div onClick={() => onAddTile?.('weather')} className="cursor-pointer hover:scale-[1.02] transition-transform active:scale-95">
                  <WeatherTile id="weather-tray" isDraggable={true} />
                  </div>
                  <div onClick={() => onAddTile?.('market')} className="cursor-pointer hover:scale-[1.02] transition-transform active:scale-95">
                  <MarketTile id="market-tray" isDraggable={true} />
                  </div>
                  <div onClick={() => onAddTile?.('timer')} className="cursor-pointer hover:scale-[1.02] transition-transform active:scale-95">
                  <TimerTile id="timer-tray" isDraggable={true} />
                  </div>
              </div>
            </div>
          )}

          {activeTab === 'layout' && (
              <div className="grid grid-cols-1 gap-3">
                  {Object.values(LAYOUTS).map((layout) => (
                      <button
                          key={layout.id}
                          onClick={() => onSelectLayout(layout.id)}
                          className={`group flex items-center gap-4 p-3 rounded-xl border transition-all text-left ${
                              activeLayoutId === layout.id
                                  ? 'bg-foreground/10 border-accent-500 ring-1 ring-accent-500/50'
                                  : 'bg-foreground/5 border-border hover:bg-foreground/10 hover:border-border-hover'
                          }`}
                      >
                          <LayoutPreview id={layout.id} isActive={activeLayoutId === layout.id} />

                          <div>
                              <h4 className={`text-sm font-medium ${activeLayoutId === layout.id ? 'text-foreground' : 'text-foreground/80'}`}>
                                  {layout.name}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                  {layout.description}
                              </p>
                          </div>
                      </button>
                  ))}
              </div>
          )}

          {activeTab === 'appearance' && (
            <div className="flex flex-col gap-6">
              
              {/* Section: Background */}
              <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <ImageIcon className="w-3 h-3" />
                      Background
                  </h4>

                  {/* My Images / Upload */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">My Gallery</span>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-1 text-[10px] font-medium bg-foreground/10 hover:bg-foreground/20 text-foreground px-2 py-1 rounded transition-colors disabled:opacity-50"
                      >
                        {isUploading ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Upload className="w-3 h-3" />
                        )}
                        Upload
                      </button>
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleFileUpload}
                      />
                    </div>

                    {/* Gallery Grid */}
                    {isLoadingImages ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {/* Add New Button (Shortcut) */}
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="aspect-square rounded-lg bg-foreground/5 border border-border hover:bg-foreground/10 flex flex-col items-center justify-center gap-1 transition-all group"
                        >
                          <Plus className="w-5 h-5 text-muted-foreground group-hover:text-foreground/60" />
                          <span className="text-[9px] text-muted-foreground group-hover:text-foreground/60">Add</span>
                        </button>

                        {userImages.map((img) => (
                          <div 
                            key={img.fullPath}
                            className={`relative group aspect-square rounded-lg overflow-hidden border transition-all cursor-pointer ${
                              currentBackground === img.url
                                ? 'border-accent-500 ring-1 ring-accent-500/50'
                                : 'border-border hover:border-border-hover'
                            }`}
                            onClick={() => onSelectBackground(img.url)}
                          >
                            <Image 
                              src={img.url} 
                              alt="User background" 
                              fill 
                              className="object-cover" 
                              sizes="100px"
                            />

                            {/* Actions Overlay */}
                            <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                onClick={(e) => confirmDeleteImage(img.fullPath, e)}
                                className="p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-foreground rounded-full transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              {currentBackground === img.url && (
                                <div className="absolute top-1 right-1 p-0.5 bg-accent-500 rounded-full">
                                  <Check className="w-2.5 h-2.5 text-foreground" />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* AI Generator */}
                  <details className="group bg-foreground/5 rounded-xl border border-border overflow-hidden">
                      <summary className="flex items-center justify-between p-3 cursor-pointer hover:bg-foreground/5 transition-colors">
                          <div className="flex items-center gap-2 text-indigo-400">
                              <Sparkles className="w-4 h-4" />
                              <span className="text-xs font-semibold uppercase tracking-wider">AI Generator</span>
                          </div>
                          <div className="text-muted-foreground group-open:rotate-180 transition-transform">▼</div>
                      </summary>

                      <div className="p-4 pt-0 space-y-3 bg-gradient-to-b from-indigo-500/10 to-purple-500/10">
                          <textarea
                              value={prompt}
                              onChange={(e) => setPrompt(e.target.value)}
                              placeholder="Describe your dream background... (e.g., 'Cyberpunk city at night', 'Peaceful zen garden')"
                              className="w-full px-3 py-2 bg-background/30 border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-indigo-500/50 resize-none h-20"
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
                                  ? 'bg-foreground/5 text-muted-foreground cursor-not-allowed'
                                  : 'bg-indigo-500 hover:bg-indigo-600 text-foreground shadow-lg shadow-indigo-500/20'
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
                              <div className="relative aspect-video rounded-lg overflow-hidden border border-white/20 group/img">
                                  <Image 
                                  src={generatedImage} 
                                  alt="Generated background" 
                                  fill 
                                  className="object-cover" 
                                  />
                                  <div className="absolute inset-0 bg-background/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <button
                                      onClick={() => onSelectBackground(generatedImage)}
                                      className="px-3 py-1.5 bg-foreground/10 backdrop-blur-md border border-border text-foreground text-xs font-medium rounded-full hover:bg-foreground hover:text-background transition-all"
                                  >
                                      Use
                                  </button>
                                  <button
                                      onClick={handleSaveGeneratedImage}
                                      className="px-3 py-1.5 bg-indigo-500 text-foreground text-xs font-medium rounded-full hover:bg-indigo-600 transition-all flex items-center gap-1"
                                  >
                                      {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                                      Save & Use
                                  </button>
                                  </div>
                              </div>
                              </div>
                          )}
                      </div>
                  </details>

                  {/* Presets Grid */}
                  <div className="grid grid-cols-2 gap-3">
                  {BACKGROUND_OPTIONS.map((bg) => (
                      <button
                      key={bg.id}
                      onClick={() => onSelectBackground(bg.value)}
                      className={`group relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                          currentBackground === bg.value 
                          ? 'border-accent-500 ring-2 ring-accent-500/20' 
                          : 'border-transparent hover:border-white/20'
                      }`}
                      style={{ position: 'relative' }}
                      >
                      {bg.type === 'image' ? (
                          <Image 
                          src={bg.value} 
                          alt={bg.name} 
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          sizes="(max-width: 768px) 50vw, 160px"
                          />
                      ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: bg.value || '#000000' }}>
                          <span className="text-xs text-foreground/50 font-medium">{bg.name}</span>
                          </div>
                      )}

                      {/* Selected Overlay */}
                      {currentBackground === bg.value && (
                          <div className="absolute inset-0 bg-accent-500/20 flex items-center justify-center z-10">
                          <div className="w-2 h-2 rounded-full bg-accent-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                          </div>
                      )}

                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-background/90 via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-20">
                          <p className="text-[10px] font-medium text-foreground truncate">{bg.name}</p>
                      </div>
                      </button>
                  ))}
                  </div>

                   {/* Custom Color & Dim */}
                  <div className="p-3 bg-foreground/5 rounded-xl border border-border space-y-4">
                      <div className="flex items-center justify-between gap-4">
                          <label htmlFor="bg-color-picker" className="text-xs font-medium text-muted-foreground">Solid Color</label>
                          <div className="flex items-center gap-2">
                          <input
                              id="bg-color-picker"
                              type="color"
                              value={currentBackground?.startsWith('#') ? currentBackground : '#000000'}
                              onChange={(e) => onSelectBackground(e.target.value)}
                              className="w-6 h-6 rounded cursor-pointer bg-transparent border-none p-0"
                          />
                          <span className="text-xs font-mono text-muted-foreground">
                              {currentBackground?.startsWith('#') ? currentBackground : 'IMG'}
                          </span>
                          </div>
                      </div>

                      {onSelectDim && (
                          <div className="space-y-2">
                              <div className="flex items-center justify-between">
                              <label className="text-xs font-medium text-muted-foreground">Overlay Intensity</label>
                              <span className="text-xs font-mono text-muted-foreground/80">{backgroundDim}%</span>
                              </div>
                              <input
                              type="range"
                              min="0"
                              max="90"
                              step="10"
                              value={backgroundDim}
                              onChange={(e) => onSelectDim(Number(e.target.value))}
                              className="w-full h-1.5 bg-foreground/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                              />
                          </div>
                      )}
                  </div>
              </div>

              {/* Section: Effects */}
              <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <CloudRain className="w-3 h-3" />
                      Atmosphere
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                      {[
                          { id: 'none', name: 'None', icon: '🚫' },
                          { id: 'rain', name: 'Rain', icon: '🌧️' },
                          { id: 'snow', name: 'Snow', icon: '❄️' },
                          { id: 'fireflies', name: 'Fireflies', icon: '✨' },
                          { id: 'sakura', name: 'Sakura', icon: '🌸' },
                          { id: 'autumn-leaves', name: 'Autumn', icon: '🍂' },
                          { id: 'confetti', name: 'Confetti', icon: '🎉' },
                          { id: 'christmas-lights', name: 'Lights', icon: '🎄' },
                      ].map((effect) => (
                          <button
                              key={effect.id}
                              onClick={() => onSelectEffect(effect.id as EffectType)}
                              className={`
                                  flex flex-col items-center justify-center gap-1 p-2 rounded-lg border transition-all min-h-[60px]
                                  ${activeEffect === effect.id
                                      ? 'bg-accent-500/20 border-accent-500 text-foreground'
                                      : 'bg-foreground/5 border-border hover:bg-foreground/10 hover:border-border-hover text-muted-foreground hover:text-foreground'
                                  }
                              `}
                          >
                              <span className="text-lg">{effect.icon}</span>
                              <span className="text-[10px] font-medium truncate w-full text-center">{effect.name}</span>
                          </button>
                      ))}
                  </div>
              </div>
            </div>
          )}

          {activeTab === 'clock' && onSelectClockStyle && (
              <div className="flex flex-col gap-6">

              {onToggleShowClock && (
                <div className="p-3 bg-foreground/5 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-foreground/80">Show Clock</label>
                    <button
                      onClick={() => onToggleShowClock(!showClock)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        showClock ? 'bg-indigo-500' : 'bg-foreground/10'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-foreground rounded-full transition-transform ${
                          showClock ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3">
                  {[
                      { id: 'digital', name: 'Digital Classic', desc: 'Clean, modern mono font' },
                      { id: 'neon', name: 'Neon Cyber', desc: 'Glowing, futuristic look' },
                      { id: 'flip', name: 'Retro Flip', desc: 'Classic split-flap display' },
                      { id: 'retro-digital', name: 'Old School', desc: 'LCD 7-segment style' },
                      { id: 'analog', name: 'Analog', desc: 'Traditional watch face' },
                  ].map((style) => (
                      <button
                          key={style.id}
                          onClick={() => onSelectClockStyle(style.id as ClockStyle)}
                          className={`group flex items-center gap-4 p-3 rounded-xl border transition-all text-left ${
                              clockStyle === style.id
                                  ? 'bg-foreground/10 border-accent-500 ring-1 ring-accent-500/50'
                                  : 'bg-foreground/5 border-border hover:bg-foreground/10 hover:border-border-hover'
                          }`}
                      >
                          {/* Preview Icon/Graphic */}
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${clockStyle === style.id ? 'bg-accent-500/20 text-accent-500' : 'bg-foreground/5 text-muted-foreground'}`}>
                              {style.id === 'digital' && <span className="font-mono font-bold text-xs">12:00</span>}
                              {style.id === 'neon' && <span className="font-bold text-xs" style={{ textShadow: '0 0 5px currentColor' }}>12:00</span>}
                              {style.id === 'flip' && (
                                  <div className="flex gap-0.5">
                                      <div className="w-4 h-5 bg-current rounded-sm opacity-50" />
                                      <div className="w-4 h-5 bg-current rounded-sm opacity-50" />
                                  </div>
                              )}
                              {style.id === 'retro-digital' && <span className="font-mono font-bold text-xs tracking-widest">88:88</span>}
                              {style.id === 'analog' && <Clock className="w-6 h-6" />}
                          </div>

                          <div>
                              <h4 className={`text-sm font-medium ${clockStyle === style.id ? 'text-foreground' : 'text-foreground/80'}`}>
                                  {style.name}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                  {style.desc}
                              </p>
                          </div>
                      </button>
                  ))}
              </div>

              {/* Time Format Toggle */}
              {onSelectTimeFormat && (
                  <div className="p-3 bg-foreground/5 rounded-xl border border-border space-y-3">
                    <label className="text-xs font-medium text-foreground/80">Time Format</label>
                    <div className="flex p-1 bg-background/20 rounded-lg border border-border">
                      <button
                        onClick={() => onSelectTimeFormat('12h')}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                          timeFormat === '12h'
                            ? 'bg-foreground/10 text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
                        }`}
                      >
                        12-Hour
                      </button>
                      <button
                        onClick={() => onSelectTimeFormat('24h')}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                          timeFormat === '24h'
                            ? 'bg-foreground/10 text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
                        }`}
                      >
                        24-Hour
                      </button>
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
