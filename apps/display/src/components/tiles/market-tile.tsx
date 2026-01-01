'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { TileBase } from './tile-base';

interface MarketTileProps {
  id?: string;
  onRemove?: () => void;
  isDraggable?: boolean;
}

export function MarketTile({ id = 'market', onRemove, isDraggable = true }: MarketTileProps) {
  return (
    <TileBase
      id={id}
      title="Market"
      onRemove={onRemove}
      isDraggable={isDraggable}
      className="min-w-[120px]"
    >
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] font-bold">BTC</span>
          <div className="flex items-center text-success text-[10px] gap-0.5">
            <TrendingUp className="w-2.5 h-2.5" />
            <span>+2.4%</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] font-bold">ETH</span>
          <div className="flex items-center text-destructive text-[10px] gap-0.5">
            <TrendingDown className="w-2.5 h-2.5" />
            <span>-0.8%</span>
          </div>
        </div>
      </div>
    </TileBase>
  );
}

