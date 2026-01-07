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
      className="min-w-[150px]"
    >
      <div className="flex items-center gap-2">
        <button className="shrink-0 text-muted-foreground hover:text-success transition-colors">
          <CheckCircle2 className="w-3.5 h-3.5" />
        </button>
        <div>
          <div className="text-[11px] font-medium line-clamp-1">Review Q3 Goals</div>
          <div className="text-[9px] text-muted-foreground">High Priority</div>
        </div>
      </div>
    </TileBase>
  );
}

