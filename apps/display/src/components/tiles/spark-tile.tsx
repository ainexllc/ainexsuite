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
      className="min-w-[120px]"
    >
      <div className="flex items-start gap-2">
        <div className="p-1.5 rounded bg-primary/20 text-primary shrink-0">
          <Lightbulb className="w-3 h-3" />
        </div>
        <div className="text-[10px] italic text-foreground/80 leading-snug">
          &ldquo;What is one thing you learned today?&rdquo;
        </div>
      </div>
    </TileBase>
  );
}

