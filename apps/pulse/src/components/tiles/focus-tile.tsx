'use client';

import { CheckCircle2 } from 'lucide-react';
import { TileBase } from './tile-base';

interface FocusTileProps {
  id?: string;
  onRemove?: () => void;
  isDraggable?: boolean;
}

export function FocusTile({ id = 'focus', onRemove, isDraggable = true }: FocusTileProps) {
  return (
    <TileBase 
      id={id} 
      title="Focus" 
      onRemove={onRemove} 
      isDraggable={isDraggable}
      className="min-w-[200px]"
    >
      <div className="flex items-center gap-3">
        <button className="shrink-0 text-white/20 hover:text-green-400 transition-colors">
          <CheckCircle2 className="w-5 h-5" />
        </button>
        <div>
          <div className="font-medium line-clamp-1">Review Q3 Goals</div>
          <div className="text-xs text-white/50 mt-0.5">High Priority</div>
        </div>
      </div>
    </TileBase>
  );
}

