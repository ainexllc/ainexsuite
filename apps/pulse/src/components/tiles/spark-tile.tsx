'use client';

import { Lightbulb } from 'lucide-react';
import { TileBase } from './tile-base';

interface SparkTileProps {
  id?: string;
  onRemove?: () => void;
  isDraggable?: boolean;
}

export function SparkTile({ id = 'spark', onRemove, isDraggable = true }: SparkTileProps) {
  return (
    <TileBase 
      id={id} 
      title="Spark" 
      onRemove={onRemove} 
      isDraggable={isDraggable}
      className="min-w-[200px]"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400 shrink-0">
          <Lightbulb className="w-4 h-4" />
        </div>
        <div className="text-sm italic text-white/80 leading-snug">
          "What is one thing you learned today?"
        </div>
      </div>
    </TileBase>
  );
}

