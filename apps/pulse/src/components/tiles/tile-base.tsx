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
      className={`group relative bg-foreground/5 hover:bg-foreground/10 border border-border rounded-xl p-4 transition-all duration-200 backdrop-blur-sm select-none touch-none flex flex-col h-full ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''} ${className}`}
    >
      <div className="flex items-center justify-between mb-2 opacity-50 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2">
          {isDraggable && <GripVertical className="w-3 h-3" />}
          <span className="text-xs font-medium uppercase tracking-wider text-foreground/70">{title}</span>
        </div>
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="text-muted-foreground hover:text-red-400 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
      <div className="text-sm text-foreground/90 flex-1 overflow-visible">
        {children}
      </div>
    </div>
  );
}
