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
      className="min-w-[200px]"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm font-bold">BTC</span>
          <div className="flex items-center text-green-400 text-xs gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+2.4%</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm font-bold">ETH</span>
          <div className="flex items-center text-red-400 text-xs gap-1">
            <TrendingDown className="w-3 h-3" />
            <span>-0.8%</span>
          </div>
        </div>
      </div>
    </TileBase>
  );
}

