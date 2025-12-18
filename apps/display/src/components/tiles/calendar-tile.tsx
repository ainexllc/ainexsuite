'use client';

import { Calendar } from 'lucide-react';
import { TileBase } from './tile-base';

interface CalendarTileProps {
  id?: string;
  onRemove?: () => void;
  isDraggable?: boolean;
}

export function CalendarTile({ id = 'calendar', onRemove, isDraggable = true }: CalendarTileProps) {
  return (
    <TileBase 
      id={id} 
      title="Next Up" 
      onRemove={onRemove} 
      isDraggable={isDraggable}
      className="min-w-[200px]"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-accent-500/20 text-accent-400">
          <Calendar className="w-4 h-4" />
        </div>
        <div>
          <div className="font-medium">Team Sync</div>
          <div className="text-xs text-white/50 mt-0.5">In 15 mins • Zoom</div>
        </div>
      </div>
    </TileBase>
  );
}

