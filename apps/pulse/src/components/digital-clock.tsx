'use client';

import { useEffect, useState, useRef } from 'react';
import { Clock, Maximize2, Minimize2, Plus, Settings } from 'lucide-react';
import { useAuth } from '@ainexsuite/auth';
import { TileTray } from './tiles/tile-tray';
import { CalendarTile } from './tiles/calendar-tile';
import { FocusTile } from './tiles/focus-tile';
import { SparkTile } from './tiles/spark-tile';
import { WeatherTile } from './tiles/weather-tile';
import { MarketTile } from './tiles/market-tile';
import { ClockService } from '@/lib/clock-settings';

type SlotPosition = 'bottom-left' | 'bottom-center' | 'bottom-right';
type TimeFormat = '12h' | '24h';

const DEFAULT_TILES = {
  'bottom-left': null,
  'bottom-center': null,
  'bottom-right': null,
};

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
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isTrayOpen, setIsTrayOpen] = useState(false);
  const [showFormatMenu, setShowFormatMenu] = useState(false);

  // Initialize state with defaults
  const [tiles, setTiles] = useState<Record<SlotPosition, string | null>>(DEFAULT_TILES);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [timeFormat, setTimeFormat] = useState<TimeFormat>(getSystemTimeFormat());
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync with Firestore on load and changes
  useEffect(() => {
    if (!user) return;

    // Subscribe to real-time updates
    const unsubscribe = ClockService.subscribeToSettings(user.uid, (settings) => {
      if (settings) {
        // Cast the generic string record to our specific SlotPosition type safely
        // In a real app we'd validate this runtime data with zod/io-ts
        setTiles(settings.tiles as Record<SlotPosition, string | null>);
        setBackgroundImage(settings.backgroundImage);
        if (settings.timeFormat) {
          setTimeFormat(settings.timeFormat);
        }
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Save state to Firestore whenever it changes (debounced could be better, but direct for now)
  // We only save if the change was initiated LOCALLY, not from a remote update.
  // Ideally, we separate "optimistic update" from "remote sync", but for this simple case:
  // We will trigger the save explicitly in the handlers (drop/select) instead of a useEffect to avoid loops.

  const updateSettings = async (newTiles: Record<SlotPosition, string | null>, newBg: string | null, newFormat?: TimeFormat) => {
    if (!user) return;

    // Optimistic update
    setTiles(newTiles);
    setBackgroundImage(newBg);
    if (newFormat) {
      setTimeFormat(newFormat);
    }

    // Persist
    try {
      await ClockService.saveSettings(user.uid, {
        tiles: newTiles,
        backgroundImage: newBg,
        timeFormat: newFormat || timeFormat
      });
    } catch (error) {
      console.error('Failed to save clock settings:', error);
      // Optionally revert state here
    }
  };

  const handleTimeFormatChange = (format: TimeFormat) => {
    updateSettings(tiles, backgroundImage, format);
    setShowFormatMenu(false);
  };

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    // Handle both standard and webkit-prefixed fullscreen events
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullScreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
    };
  }, []);

  const toggleFullScreen = async () => {
    try {
      const isCurrentlyFullscreen =
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement;

      if (!isCurrentlyFullscreen && containerRef.current) {
        // Try standard API first
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        }
        // Fallback to webkit for iOS/older browsers
        else if ((containerRef.current as any).webkitRequestFullscreen) {
          (containerRef.current as any).webkitRequestFullscreen();
        }
        // Try webkit on document for broader compatibility
        else if ((document as any).documentElement?.webkitRequestFullscreen) {
          (document as any).documentElement.webkitRequestFullscreen();
        }
      } else if (isCurrentlyFullscreen) {
        // Try standard API first
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
        // Fallback to webkit
        else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.error('Error toggling full screen:', err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, slot: SlotPosition) => {
    e.preventDefault();
    const tileId = e.dataTransfer.getData('text/plain');
    
    // Clear tile from other slots if it exists there
    const newTiles = { ...tiles };
    Object.keys(newTiles).forEach(key => {
      if (newTiles[key as SlotPosition] === tileId) {
        newTiles[key as SlotPosition] = null;
      }
    });
    
    newTiles[slot] = tileId;
    updateSettings(newTiles, backgroundImage);
    // Don't close tray automatically
  };

  const removeTile = (slot: SlotPosition) => {
    const newTiles = { ...tiles, [slot]: null };
    updateSettings(newTiles, backgroundImage);
  };

  const handleBackgroundSelect = (url: string | null) => {
    updateSettings(tiles, url);
  };

  const renderTile = (tileId: string | null, slot: SlotPosition) => {
    if (!tileId) return null;
    
    const props = {
      id: tileId,
      onRemove: () => removeTile(slot),
      isDraggable: true,
      onDragStart: (e: React.DragEvent) => {
         e.dataTransfer.setData('text/plain', tileId);
      }
    };

    if (tileId.includes('calendar')) return <CalendarTile {...props} />;
    if (tileId.includes('focus')) return <FocusTile {...props} />;
    if (tileId.includes('spark')) return <SparkTile {...props} />;
    if (tileId.includes('weather')) return <WeatherTile {...props} />;
    if (tileId.includes('market')) return <MarketTile {...props} />;
    return null;
  };

  if (!time) {
    return null; // Avoid hydration mismatch
  }

  return (
    <div 
      ref={containerRef}
      className={`w-full bg-black text-white border border-outline-subtle shadow-sm flex flex-col items-center relative group transition-all duration-300 bg-cover bg-center bg-no-repeat ${
        isFullScreen 
          ? 'fixed inset-0 z-50 h-screen w-screen rounded-none border-none justify-center' 
          : 'p-8 rounded-2xl mb-8 justify-start min-h-[400px]'
      }`}
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined
      }}
    >
      {/* Background Overlay for Readability */}
      {backgroundImage && (
        <div className="absolute inset-0 bg-black/50 z-0 transition-opacity" />
      )}

      {/* Content Container (z-10 to sit above overlay) */}
      <div className="z-10 w-full h-full flex flex-col items-center">
        {/* Controls */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-20 opacity-20 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsTrayOpen(!isTrayOpen)}
            className={`p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10 ${isTrayOpen ? 'bg-white/10 text-white' : ''}`}
            aria-label="Customize"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={toggleFullScreen}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
            aria-label={isFullScreen ? "Exit full screen" : "Enter full screen"}
          >
            {isFullScreen ? (
              <Minimize2 className="w-5 h-5" />
            ) : (
              <Maximize2 className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Tile Tray */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-30">
          <div className="pointer-events-auto inline-block">
            <TileTray 
              isOpen={isTrayOpen} 
              onClose={() => setIsTrayOpen(false)} 
              currentBackground={backgroundImage}
              onSelectBackground={handleBackgroundSelect}
            />
          </div>
        </div>
        
        {/* Clock Content */}
        <div className={`flex flex-col items-center justify-center mt-12 mb-12 ${isFullScreen ? 'scale-150' : ''} transition-transform duration-300 relative`}>
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm uppercase tracking-wider font-medium shadow-sm">Current Time</span>
          </div>
          <div className="text-6xl font-mono font-bold tracking-tight drop-shadow-lg">
            {time.toLocaleTimeString([], { hour12: timeFormat === '12h', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="text-gray-400 mt-2 font-medium drop-shadow-md">
            {time.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>

          {/* Time Format Menu */}
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
        </div>

        {/* Tile Slots */}
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 mt-auto px-4 pb-4">
          {(['bottom-left', 'bottom-center', 'bottom-right'] as SlotPosition[]).map((slot) => (
            <div
              key={slot}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, slot)}
              className={`min-h-[120px] rounded-xl border-2 border-dashed transition-colors flex items-center justify-center relative ${
                tiles[slot] 
                  ? 'border-transparent' 
                  : 'border-white/5 hover:border-white/20 bg-white/5'
              } ${isTrayOpen ? 'animate-pulse border-white/20' : ''}`}
            >
              {tiles[slot] ? (
                <div className="w-full h-full">
                  {renderTile(tiles[slot], slot)}
                </div>
              ) : (
                <div className="text-white/20 text-sm font-medium opacity-0 hover:opacity-100 transition-opacity select-none pointer-events-none">
                  Drop Tile Here
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
