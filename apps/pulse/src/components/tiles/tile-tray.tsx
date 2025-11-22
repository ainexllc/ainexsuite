'use client';

import { X } from 'lucide-react';
import { CalendarTile } from './calendar-tile';
import { FocusTile } from './focus-tile';
import { SparkTile } from './spark-tile';
import { WeatherTile } from './weather-tile';
import { MarketTile } from './market-tile';

interface TileTrayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TileTray({ isOpen, onClose }: TileTrayProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-4 p-4 bg-surface-elevated border border-outline-subtle rounded-2xl shadow-xl z-20 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white/80">Available Tiles</h3>
        <button 
          onClick={onClose}
          className="p-1 text-white/40 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
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
      </div>
      
      <p className="text-xs text-white/30 text-center mt-4">
        Drag tiles to the slots around the clock
      </p>
    </div>
  );
}

