'use client';

import { useEffect, useState, useRef } from 'react';
import { Clock, Maximize2, Minimize2, Plus } from 'lucide-react';
import { TileTray } from './tiles/tile-tray';
import { CalendarTile } from './tiles/calendar-tile';
import { FocusTile } from './tiles/focus-tile';
import { SparkTile } from './tiles/spark-tile';
import { WeatherTile } from './tiles/weather-tile';
import { MarketTile } from './tiles/market-tile';

type SlotPosition = 'bottom-left' | 'bottom-center' | 'bottom-right';

interface ClockState {
  tiles: Record<SlotPosition, string | null>;
  backgroundImage: string | null;
}

const DEFAULT_TILES = {
  'bottom-left': null,
  'bottom-center': null,
  'bottom-right': null,
};

export function DigitalClock() {
  const [time, setTime] = useState<Date | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isTrayOpen, setIsTrayOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Lazy initialization for persistent state
  const [tiles, setTiles] = useState<Record<SlotPosition, string | null>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pulse-clock-state');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return parsed.tiles || DEFAULT_TILES;
        } catch (e) {
          console.error('Error parsing saved tiles:', e);
        }
      }
    }
    return DEFAULT_TILES;
  });

  const [backgroundImage, setBackgroundImage] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pulse-clock-state');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return parsed.backgroundImage || null;
        } catch (e) {
          console.error('Error parsing saved background:', e);
        }
      }
    }
    return null;
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Mark as loaded after mount to ensure client-side hydration matches
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Save state to localStorage whenever it changes, but ONLY after initial load
  useEffect(() => {
    if (isLoaded) {
      const state: ClockState = {
        tiles,
        backgroundImage
      };
      localStorage.setItem('pulse-clock-state', JSON.stringify(state));
    }
  }, [tiles, backgroundImage, isLoaded]);

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

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  const toggleFullScreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
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
    setTiles(newTiles);
    // Don't close tray automatically
  };

  const removeTile = (slot: SlotPosition) => {
    setTiles(prev => ({ ...prev, [slot]: null }));
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
              onSelectBackground={setBackgroundImage}
            />
          </div>
        </div>
        
        {/* Clock Content */}
        <div className={`flex flex-col items-center justify-center mt-12 mb-12 ${isFullScreen ? 'scale-150' : ''} transition-transform duration-300`}>
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm uppercase tracking-wider font-medium shadow-sm">Current Time</span>
          </div>
          <div className="text-6xl font-mono font-bold tracking-tight drop-shadow-lg">
            {time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="text-gray-400 mt-2 font-medium drop-shadow-md">
            {time.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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
