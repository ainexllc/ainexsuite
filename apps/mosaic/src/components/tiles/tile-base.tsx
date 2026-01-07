'use client';

import { GripVertical, X } from 'lucide-react';
import { ReactNode } from 'react';
import { SlotSize } from '@/lib/layouts';

export interface TileProps {
  id: string;
  title: string;
  children: ReactNode;
  onRemove?: () => void;
  isDraggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  className?: string;
  variant?: SlotSize;
}

export function TileBase({
  id,
  title,
  children,
  onRemove,
  isDraggable = true,
  onDragStart,
  className = ''
}: TileProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'copyMove';
    if (onDragStart) onDragStart(e);
  };

  // Touch support for mobile DnD
  const handleTouchStart = (_e: React.TouchEvent) => {
    if (!isDraggable) return;
    // We can't use dataTransfer with touch events easily without a polyfill or custom logic
    // For now, we'll rely on the pointer events or assume a library might be needed for full mobile DnD
    // But let's try to start a "drag" operation manually if we were building a custom system.
    // Since we are using HTML5 DnD, mobile support is notoriously poor without polyfills (like mobile-drag-drop).
    // However, we can try to make it at least somewhat interactive or prevent default to avoid scrolling.
  };

  return (
    <div
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onTouchStart={handleTouchStart}
      className={`group relative bg-background/85 hover:bg-background/95 border border-border/30 rounded-lg p-2 transition-all duration-300 backdrop-blur-md shadow-lg select-none touch-none flex flex-col h-full hover:shadow-xl hover:scale-[1.01] ${isDraggable ? 'cursor-grab active:cursor-grabbing active:scale-[0.99]' : ''} ${className}`}
    >
      <div className="flex items-center justify-between mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex items-center gap-1">
          {isDraggable && <GripVertical className="w-2 h-2 text-foreground/40" />}
          <span className="text-[9px] font-medium uppercase tracking-wider text-foreground/50">{title}</span>
        </div>
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="text-muted-foreground/50 hover:text-red-400 transition-colors p-0.5 rounded hover:bg-red-500/10"
          >
            <X className="w-2 h-2" />
          </button>
        )}
      </div>
      <div className="text-xs text-foreground/90 flex-1 overflow-visible">
        {children}
      </div>
    </div>
  );
}
