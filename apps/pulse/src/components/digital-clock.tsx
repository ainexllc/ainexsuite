'use client';

import { useEffect, useState, useRef } from 'react';
import { Clock, Maximize2, Minimize2, Plus } from 'lucide-react';
import { useAuth } from '@ainexsuite/auth';
import { TileTray } from './tiles/tile-tray';
import { CalendarTile } from './tiles/calendar-tile';
import { FocusTile } from './tiles/focus-tile';
import { SparkTile } from './tiles/spark-tile';
import { WeatherTile } from './tiles/weather-tile';
import { MarketTile } from './tiles/market-tile';
import { ClockService, ClockStyle } from '@/lib/clock-settings';
import { LAYOUTS, DEFAULT_LAYOUT, SlotSize } from '@/lib/layouts';
import { BackgroundEffects, EffectType } from './background-effects';

type TimeFormat = '12h' | '24h';

const DEFAULT_TILES: Record<string, string | null> = {
  'slot-1': null,
  'slot-2': null,
  'slot-3': null,
};

interface FullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void>;
  mozRequestFullScreen?: () => Promise<void>;
}

interface FullscreenDocument extends Document {
  webkitFullscreenElement?: Element;
  mozFullScreenElement?: Element;
  webkitExitFullscreen?: () => Promise<void>;
  mozCancelFullScreen?: () => Promise<void>;
}

// Detect system clock format preference
const getSystemTimeFormat = (): TimeFormat => {
  // Check if browser has Intl API support
  if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
    const formatter = new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: 'numeric',
    });
    const formatted = formatter.format(new Date());
    // If format includes 'AM' or 'PM', system uses 12h format
    return formatted.includes('AM') || formatted.includes('PM') ? '12h' : '24h';
  }
  // Default to 12h if we can't detect
  return '12h';
};

export function DigitalClock() {
  const { user } = useAuth();
  const [time, setTime] = useState<Date | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isTrayOpen, setIsTrayOpen] = useState(false);
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const isDraggingTile = useRef(false);

  // Initialize state with defaults
  const [tiles, setTiles] = useState<Record<string, string | null>>(DEFAULT_TILES);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [backgroundEffect, setBackgroundEffect] = useState<EffectType>('none');
  const [backgroundDim, setBackgroundDim] = useState<number>(50); // Default 50% for image readability
  const [clockStyle, setClockStyle] = useState<ClockStyle>('digital');
  const [timeFormat, setTimeFormat] = useState<TimeFormat>(getSystemTimeFormat());
  const [weatherZipcode, setWeatherZipcode] = useState<string>('66221');
  const [activeLayoutId, setActiveLayoutId] = useState<string>(DEFAULT_LAYOUT.id);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const trayContainerRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  const activeLayout = LAYOUTS[activeLayoutId] || DEFAULT_LAYOUT;

  // Click outside listener for tray
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isTrayOpen || isDraggingTile.current) return;

      // Check if click is inside tray or toggle button
      if (
        trayContainerRef.current &&
        !trayContainerRef.current.contains(event.target as Node) &&
        toggleButtonRef.current &&
        !toggleButtonRef.current.contains(event.target as Node)
      ) {
        setIsTrayOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isTrayOpen]);

  // Listen for fullscreen changes (e.g., user presses Escape)
  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as FullscreenDocument;
      const isCurrentlyFullscreen = !!(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement
      );
      setIsMaximized(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Sync with Firestore on load and changes
  useEffect(() => {
    if (!user) return;

    // Subscribe to real-time updates
    const unsubscribe = ClockService.subscribeToSettings(user.uid, (settings) => {
      if (settings) {
        setTiles(settings.tiles || DEFAULT_TILES);
        setBackgroundImage(settings.backgroundImage);
        if (settings.timeFormat) {
          setTimeFormat(settings.timeFormat as TimeFormat);
        }
        if (settings.weatherZipcode) {
          setWeatherZipcode(settings.weatherZipcode);
        }
        if (settings.layoutId && LAYOUTS[settings.layoutId]) {
            setActiveLayoutId(settings.layoutId);
        }
        if (settings.backgroundEffect) {
            setBackgroundEffect(settings.backgroundEffect as EffectType);
        }
        if (typeof settings.backgroundDim === 'number') {
            setBackgroundDim(settings.backgroundDim);
        }
        if (settings.clockStyle) {
            setClockStyle(settings.clockStyle as ClockStyle);
        }
      }
    });

    return () => unsubscribe();
  }, [user]);

  const updateSettings = async (
    newTiles: Record<string, string | null>, 
    newBg: string | null, 
    newFormat?: TimeFormat,
    newLayoutId?: string,
    newEffect?: EffectType,
    newDim?: number,
    newClockStyle?: ClockStyle
  ) => {
    if (!user) return;

    // Optimistic update
    setTiles(newTiles);
    setBackgroundImage(newBg);
    if (newFormat) {
      setTimeFormat(newFormat);
    }
    if (newLayoutId) {
        setActiveLayoutId(newLayoutId);
    }
    if (newEffect) {
        setBackgroundEffect(newEffect);
    }
    if (typeof newDim === 'number') {
        setBackgroundDim(newDim);
    }
    if (newClockStyle) {
        setClockStyle(newClockStyle);
    }

    // Persist
    try {
      await ClockService.saveSettings(user.uid, {
        tiles: newTiles,
        backgroundImage: newBg,
        timeFormat: newFormat || timeFormat,
        weatherZipcode: weatherZipcode,
        layoutId: newLayoutId || activeLayoutId,
        backgroundEffect: newEffect || backgroundEffect,
        backgroundDim: typeof newDim === 'number' ? newDim : backgroundDim,
        clockStyle: newClockStyle || clockStyle
      });
    } catch (error) {
      console.error('Failed to save clock settings:', error);
    }
  };

  const handleZipcodeChange = (zip: string) => {
    setWeatherZipcode(zip);
    if (user) {
      ClockService.saveSettings(user.uid, {
        tiles,
        backgroundImage,
        timeFormat,
        weatherZipcode: zip,
        layoutId: activeLayoutId,
        backgroundEffect,
        backgroundDim,
        clockStyle
      }).catch(e => console.error(e));
    }
  };

  const handleTimeFormatChange = (format: TimeFormat) => {
    updateSettings(tiles, backgroundImage, format);
    setShowFormatMenu(false);
  };

  const handleLayoutSelect = (layoutId: string) => {
      if (layoutId === activeLayoutId) return;

      // Smart Migration Logic:
      // 1. Collect all current tile IDs that are placed
      const activeTileIds = Object.values(tiles).filter(Boolean) as string[];
      
      // 2. Get the new layout configuration
      const targetLayout = LAYOUTS[layoutId];
      if (!targetLayout) return;

      // 3. Map existing tiles to new slots sequentially
      //    (This preserves as many as possible, dropping extras if new layout is smaller)
      const nextTiles: Record<string, string | null> = {};
      const targetSlots = targetLayout.slots.map(s => s.id);

      // Fill target slots with available tiles
      targetSlots.forEach((slotId, index) => {
          if (index < activeTileIds.length) {
              nextTiles[slotId] = activeTileIds[index];
          } else {
              nextTiles[slotId] = null;
          }
      });

      updateSettings(nextTiles, backgroundImage, undefined, layoutId);
  };

  const handleEffectSelect = (effect: EffectType) => {
      updateSettings(tiles, backgroundImage, undefined, undefined, effect);
  };

  const handleDimSelect = (dim: number) => {
      updateSettings(tiles, backgroundImage, undefined, undefined, undefined, dim);
  };

  const handleClockStyleSelect = (style: ClockStyle) => {
      updateSettings(tiles, backgroundImage, undefined, undefined, undefined, undefined, style);
  };

  // Format time string for display
  const getFormattedTime = (): string => {
    if (!time) return '';

    const baseFormat = { hour12: timeFormat === '12h', hour: '2-digit' as const, minute: '2-digit' as const, second: '2-digit' as const };
    let timeStr = time.toLocaleTimeString([], baseFormat);

    // For 12h format, remove leading 0 from single-digit hours (e.g., "09:30 AM" -> "9:30 AM")
    if (timeFormat === '12h') {
      timeStr = timeStr.replace(/^0(\d)/, '$1');
    }

    return timeStr;
  };

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const toggleMaximize = async () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    try {
      if (!isMaximized) {
        // Try Fullscreen API first (works on most devices except iOS Chrome)
        const elem = containerRef.current as FullscreenElement;

        if (elem?.requestFullscreen) {
          await elem.requestFullscreen();
        } else if (elem?.webkitRequestFullscreen) {
          // Safari (limited support on iOS)
          await elem.webkitRequestFullscreen();
        } else if (elem?.mozRequestFullScreen) {
          // Firefox
          await elem.mozRequestFullScreen();
        }

        // For iOS, hide browser UI by scrolling (helps with Chrome and Safari)
        if (isIOS) {
          window.scrollTo(0, 1);
          // Trigger viewport-height fix for iOS Safari address bar
          setTimeout(() => {
            window.scrollTo(0, 0);
          }, 100);
        }

        setIsMaximized(true);
      } else {
        // Exit fullscreen
        const doc = document as FullscreenDocument;
        if (doc.fullscreenElement) {
          await document.exitFullscreen();
        } else if (doc.webkitFullscreenElement && doc.webkitExitFullscreen) {
          // Safari
          await doc.webkitExitFullscreen();
        } else if (doc.mozFullScreenElement && doc.mozCancelFullScreen) {
          // Firefox
          await doc.mozCancelFullScreen();
        }

        setIsMaximized(false);
      }
    } catch (error) {
      console.error('Fullscreen toggle failed:', error);
      // Fallback to CSS-based fullscreen
      setIsMaximized(!isMaximized);
    }
  };

  const handleDragStart = (_e: React.DragEvent) => {
    isDraggingTile.current = true;
  };

  const handleDragEnd = (_e: React.DragEvent) => {
    isDraggingTile.current = false;
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetSlot: string) => {
    e.preventDefault();
    isDraggingTile.current = false;
    const droppedTileId = e.dataTransfer.getData('text/plain');
    
    if (!droppedTileId) return;

    const newTiles = { ...tiles };
    
    // Find if the dropped tile was already in a slot (dragged from one slot to another)
    const sourceEntry = Object.entries(tiles).find(([_, value]) => value === droppedTileId);
    const sourceSlot = sourceEntry ? sourceEntry[0] : null;

    if (sourceSlot === targetSlot) return;

    // Check if there's an existing tile in the target slot
    const existingTileInTarget = newTiles[targetSlot];

    if (existingTileInTarget) {
      // SWAP LOGIC
      if (sourceSlot) {
        // If dragging from another slot, swap them
        newTiles[sourceSlot] = existingTileInTarget;
        newTiles[targetSlot] = droppedTileId;
      } else {
        // If dragging from tray, replace the existing one
        newTiles[targetSlot] = droppedTileId;
      }
    } else {
      // MOVE LOGIC (Target is empty)
      if (sourceSlot) {
        newTiles[sourceSlot] = null; // Clear source
      }
      newTiles[targetSlot] = droppedTileId;
    }
    
    updateSettings(newTiles, backgroundImage);
  };

  const removeTile = (slot: string) => {
    const newTiles = { ...tiles, [slot]: null };
    updateSettings(newTiles, backgroundImage);
  };

  const handleBackgroundSelect = (url: string | null) => {
    updateSettings(tiles, url);
  };

  const renderTile = (tileId: string | null, slot: string, size: SlotSize) => {
    if (!tileId) return null;
    
    const props = {
      id: tileId,
      onRemove: () => removeTile(slot),
      isDraggable: true,
      onDragStart: (e: React.DragEvent) => {
         isDraggingTile.current = true;
         e.dataTransfer.setData('text/plain', tileId);
      },
      onDragEnd: () => {
        isDraggingTile.current = false;
      },
      variant: size
    };

    if (tileId.includes('calendar')) return <CalendarTile {...props} />;
    if (tileId.includes('focus')) return <FocusTile {...props} />;
    if (tileId.includes('spark')) return <SparkTile {...props} />;
    if (tileId.includes('weather')) return <WeatherTile {...props} weatherZipcode={weatherZipcode} onZipcodeChange={handleZipcodeChange} />;
    if (tileId.includes('market')) return <MarketTile {...props} />;
    return null;
  };

  const renderClockContent = () => {
    if (!time) return null;

    // Neon Style
    if (clockStyle === 'neon') {
        return (
            <div className="relative">
                <div 
                    className="text-7xl font-bold tracking-wider relative z-10"
                    style={{ 
                        color: '#fff',
                        textShadow: `
                            0 0 5px #fff,
                            0 0 10px #fff,
                            0 0 20px #0ff,
                            0 0 30px #0ff,
                            0 0 40px #0ff
                        `
                    }}
                >
                    {getFormattedTime()}
                </div>
                {/* Reflection/Glow under */}
                <div 
                    className="absolute top-full left-0 right-0 text-7xl font-bold tracking-wider opacity-20 transform scale-y-[-0.5] origin-top blur-sm"
                    style={{ 
                        color: '#0ff',
                    }}
                >
                    {getFormattedTime()}
                </div>
            </div>
        );
    }

    // Retro Flip (Simplified CSS simulation)
    if (clockStyle === 'flip') {
        return (
            <div className="flex gap-4 items-center">
                {getFormattedTime().split('').map((char, i) => (
                    <div key={i} className={`
                        relative bg-[#222] text-white rounded-lg px-3 py-4 shadow-2xl border-t border-white/10
                        ${char === ':' || char === ' ' ? 'bg-transparent shadow-none border-none px-0' : 'min-w-[60px]'}
                    `}>
                        <div className="text-6xl font-mono font-bold text-center">
                            {char}
                        </div>
                        {char !== ':' && char !== ' ' && (
                            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-black/50 z-20" />
                        )}
                    </div>
                ))}
            </div>
        );
    }

    // Analog
    if (clockStyle === 'analog') {
        const seconds = time.getSeconds();
        const minutes = time.getMinutes();
        const hours = time.getHours();
        
        const secondDeg = (seconds / 60) * 360;
        const minuteDeg = ((minutes * 60 + seconds) / 3600) * 360;
        const hourDeg = ((hours % 12 * 3600 + minutes * 60 + seconds) / 43200) * 360;

        return (
            <div className="relative w-48 h-48 rounded-full border-4 border-white/20 bg-black/40 backdrop-blur-sm shadow-2xl flex items-center justify-center">
                {/* Markers */}
                {[...Array(12)].map((_, i) => (
                    <div 
                        key={i} 
                        className={`absolute w-1 bg-white/50 ${i % 3 === 0 ? 'h-4' : 'h-2'}`}
                        style={{ 
                            top: '10px', 
                            left: 'calc(50% - 0.5px)', 
                            transformOrigin: '50% calc(50% + 10px - 50% + 50%)', // Wait, simpler rotation
                            transform: `rotate(${i * 30}deg) translateY(-80px)` // Proper way for markers
                        }}
                    />
                ))}
                
                {/* Hour Hand */}
                <div 
                    className="absolute w-1.5 bg-white h-12 rounded-full origin-bottom"
                    style={{ transform: `rotate(${hourDeg}deg)`, bottom: '50%' }}
                />
                
                {/* Minute Hand */}
                <div 
                    className="absolute w-1 bg-white/80 h-16 rounded-full origin-bottom"
                    style={{ transform: `rotate(${minuteDeg}deg)`, bottom: '50%' }}
                />
                
                {/* Second Hand */}
                <div 
                    className="absolute w-0.5 bg-red-500 h-20 rounded-full origin-bottom"
                    style={{ transform: `rotate(${secondDeg}deg)`, bottom: '50%' }}
                />
                
                {/* Center Dot */}
                <div className="absolute w-3 h-3 bg-white rounded-full shadow-md z-10" />
            </div>
        );
    }

    // Default Digital
    return (
        <div className="text-6xl font-mono font-bold tracking-tight drop-shadow-lg text-white">
            {getFormattedTime()}
        </div>
    );
  };

  const renderClock = () => (
      <div className={`flex flex-col items-center justify-center transition-transform duration-300 relative ${activeLayoutId.includes('studio') ? 'h-full' : 'mt-12 mb-12'}`}>
          <div className="flex items-center gap-2 text-gray-400 mb-4">
            <Clock className="w-4 h-4" />
            <span className="text-sm uppercase tracking-wider font-medium shadow-sm">Current Time</span>
          </div>
          
          {renderClockContent()}

          {clockStyle !== 'analog' && (
            <div className="text-gray-400 mt-4 font-medium drop-shadow-md">
                {time && time.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          )}

          {/* Time Format Menu (Only for digital styles) */}
          {clockStyle !== 'analog' && (
              <div className="mt-4 relative">
                <button
                  onClick={() => setShowFormatMenu(!showFormatMenu)}
                  className="px-3 py-1 text-xs uppercase tracking-wider text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                  aria-label="Change time format"
                >
                  {timeFormat.toUpperCase()}
                </button>

                {showFormatMenu && (
                  <div className="absolute top-full mt-2 bg-black/80 border border-white/20 rounded-lg overflow-hidden z-40">
                    <button
                      onClick={() => handleTimeFormatChange('12h')}
                      className={`block w-full px-4 py-2 text-sm text-left hover:bg-white/10 ${timeFormat === '12h' ? 'bg-white/20 text-white' : 'text-gray-400'}`}
                    >
                      12-Hour Format
                    </button>
                    <button
                      onClick={() => handleTimeFormatChange('24h')}
                      className={`block w-full px-4 py-2 text-sm text-left hover:bg-white/10 ${timeFormat === '24h' ? 'bg-white/20 text-white' : 'text-gray-400'}`}
                    >
                      24-Hour Format
                    </button>
                  </div>
                )}
              </div>
          )}
      </div>
  );

  // Render Logic for Studio Layouts (Left/Right)
  const renderStudioLayout = (isRight: boolean) => {
    // isRight = true means Studio Right (Clock Left, Grid Right)
    // isRight = false means Studio Left (Grid Left, Clock Right)
    
    const clockColumn = (
        <div className="flex flex-col gap-6 h-full justify-center">
            <div className="flex-1 flex items-center justify-center">
                {renderClock()}
            </div>
            <div 
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, isRight ? 'left-1' : 'right-1')}
                className={`
                    min-h-[120px] rounded-xl border-2 border-dashed transition-colors flex items-center justify-center relative 
                    ${tiles[isRight ? 'left-1' : 'right-1'] ? 'border-transparent' : 'border-white/5 hover:border-white/20 bg-white/5'} 
                    ${isTrayOpen ? 'animate-pulse border-white/20' : ''}
                `}
            >
                 {tiles[isRight ? 'left-1' : 'right-1'] ? (
                    <div className="w-full h-full">
                        {renderTile(tiles[isRight ? 'left-1' : 'right-1'], isRight ? 'left-1' : 'right-1', 'medium')}
                    </div>
                ) : (
                    <div className="text-white/20 text-sm font-medium opacity-0 hover:opacity-100 transition-opacity select-none pointer-events-none">
                        Drop Tile
                    </div>
                )}
            </div>
        </div>
    );

    const gridColumn = (
        <div className="grid grid-cols-2 gap-6 auto-rows-fr">
            {['1', '2', '3', '4'].map((num) => {
                const slotId = isRight ? `right-${num}` : `left-${num}`;
                return (
                    <div
                    key={slotId}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, slotId)}
                    className={`
                        min-h-[120px] rounded-xl border-2 border-dashed transition-colors flex items-center justify-center relative 
                        ${tiles[slotId] ? 'border-transparent' : 'border-white/5 hover:border-white/20 bg-white/5'} 
                        ${isTrayOpen ? 'animate-pulse border-white/20' : ''}
                    `}
                >
                    {tiles[slotId] ? (
                        <div className="w-full h-full">
                            {renderTile(tiles[slotId], slotId, 'small')}
                        </div>
                    ) : (
                        <div className="text-white/20 text-sm font-medium opacity-0 hover:opacity-100 transition-opacity select-none pointer-events-none">
                            Drop Tile
                        </div>
                    )}
                </div>
                );
            })}
        </div>
    );

    return (
        <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            {isRight ? (
                <>
                    {clockColumn}
                    {gridColumn}
                </>
            ) : (
                <>
                    {gridColumn}
                    {clockColumn}
                </>
            )}
        </div>
    );
  };

  if (!time) {
    return null; // Avoid hydration mismatch
  }

  return (
    <div 
      ref={containerRef}
      className={`w-full bg-black text-white border border-outline-subtle shadow-sm flex flex-col items-center relative group transition-all duration-300 bg-cover bg-center bg-no-repeat ${
        isMaximized
          ? 'fixed inset-0 z-50 rounded-none border-none justify-center overflow-hidden'
          : 'p-8 rounded-2xl mb-8 justify-start min-h-[400px]'
      }`}
      style={{
        backgroundImage: backgroundImage && backgroundImage.startsWith('http') ? `url(${backgroundImage})` : undefined,
        backgroundColor: backgroundImage && !backgroundImage.startsWith('http') ? backgroundImage : '#000000',
        ...(isMaximized && {
          height: '100dvh',
          width: '100vw',
        })
      }}
      // Catch drag events bubbling up from tiles
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Background Overlay for Readability */}
      {/* We apply the dimming level as opacity. 0 dim = 0 opacity, 100 dim = 1 opacity (blackout) */}
      <div 
        className="absolute inset-0 bg-black z-0 transition-opacity duration-300" 
        style={{ opacity: backgroundDim / 100 }}
      />

      {/* Render Atmospheric Effects - Placed ABOVE the dimmer layer so they remain bright */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <BackgroundEffects effect={backgroundEffect} />
      </div>

      {/* Content Container (z-10 to sit above overlay) */}
      <div className="relative z-10 w-full h-full flex flex-col items-center">
        {/* Controls */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-20 opacity-20 group-hover:opacity-100 transition-opacity">
          <button
            onClick={toggleMaximize}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
            aria-label={isMaximized ? "Exit maximize" : "Maximize"}
          >
            {isMaximized ? (
              <Minimize2 className="w-5 h-5" />
            ) : (
              <Maximize2 className="w-5 h-5" />
            )}
          </button>
          <button
            ref={toggleButtonRef}
            onClick={() => setIsTrayOpen(!isTrayOpen)}
            className={`p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10 ${isTrayOpen ? 'bg-white/10 text-white' : ''}`}
            aria-label="Customize"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        
        {/* Dynamic Layout Rendering */}
        {activeLayoutId === 'studio-right' ? (
            renderStudioLayout(true)
        ) : activeLayoutId === 'studio-left' ? (
            renderStudioLayout(false)
        ) : (
            /* Standard Layouts (Classic, Dashboard, Focus) */
            <>
                {renderClock()}
                <div className={`w-full max-w-6xl grid ${activeLayout.gridClassName} mt-auto px-4 pb-4 transition-all duration-300`}>
                {activeLayout.slots.map((slot) => (
                    <div
                    key={slot.id}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, slot.id)}
                    className={`
                        min-h-[120px] rounded-xl border-2 border-dashed transition-colors flex items-center justify-center relative 
                        ${slot.className} 
                        ${tiles[slot.id] ? 'border-transparent' : 'border-white/5 hover:border-white/20 bg-white/5'} 
                        ${isTrayOpen ? 'animate-pulse border-white/20' : ''}
                    `}
                    >
                    {tiles[slot.id] ? (
                        <div className="w-full h-full">
                        {renderTile(tiles[slot.id], slot.id, slot.size)}
                        </div>
                    ) : (
                        <div className="text-white/20 text-sm font-medium opacity-0 hover:opacity-100 transition-opacity select-none pointer-events-none">
                        Drop Tile
                        </div>
                    )}
                    </div>
                ))}
                </div>
            </>
        )}
      </div>

      {/* Tile Tray - Moved to root level for proper z-index stacking over effects */}
      {isTrayOpen && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-50">
          <div className="pointer-events-auto inline-block" ref={trayContainerRef}>
            <TileTray 
              isOpen={isTrayOpen} 
              onClose={() => setIsTrayOpen(false)} 
              currentBackground={backgroundImage}
              onSelectBackground={handleBackgroundSelect}
              activeLayoutId={activeLayoutId}
              onSelectLayout={handleLayoutSelect}
              activeEffect={backgroundEffect}
              onSelectEffect={handleEffectSelect}
              backgroundDim={backgroundDim}
              onSelectDim={handleDimSelect}
              clockStyle={clockStyle}
              onSelectClockStyle={handleClockStyleSelect}
            />
          </div>
        </div>
      )}
    </div>
  );
}
