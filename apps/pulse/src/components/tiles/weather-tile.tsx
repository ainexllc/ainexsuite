'use client';

import { CloudRain } from 'lucide-react';
import { TileBase } from './tile-base';

interface WeatherTileProps {
  id?: string;
  onRemove?: () => void;
  isDraggable?: boolean;
}

export function WeatherTile({ id = 'weather', onRemove, isDraggable = true }: WeatherTileProps) {
  return (
    <TileBase 
      id={id} 
      title="Weather" 
      onRemove={onRemove} 
      isDraggable={isDraggable}
      className="min-w-[200px]"
    >
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
          <CloudRain className="w-6 h-6" />
        </div>
        <div>
          <div className="text-2xl font-bold">62°</div>
          <div className="text-xs text-white/50">Seattle • Light Rain</div>
        </div>
      </div>
    </TileBase>
  );
}

