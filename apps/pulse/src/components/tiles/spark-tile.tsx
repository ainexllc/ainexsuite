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
        <div className="p-2 rounded-lg bg-primary/20 text-primary shrink-0">
          <Lightbulb className="w-4 h-4" />
        </div>
        <div className="text-sm italic text-foreground/80 leading-snug">
          &ldquo;What is one thing you learned today?&rdquo;
        </div>
      </div>
    </TileBase>
  );
}

