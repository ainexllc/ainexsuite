'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ResizeHandlesProps {
  initialWidth: number;
  containerWidth: number;
  aspectRatio: number;
  minWidth?: number;
  onResize: (width: number) => void;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
  selected?: boolean;
  children: React.ReactNode;
}

type HandlePosition = 'nw' | 'ne' | 'sw' | 'se';

export function ImageResizeHandles({
  initialWidth,
  containerWidth,
  aspectRatio: _aspectRatio, // Reserved for future aspect ratio lock feature
  minWidth = 100,
  onResize,
  onResizeStart,
  onResizeEnd,
  selected = false,
  children,
}: ResizeHandlesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [activeHandle, setActiveHandle] = useState<HandlePosition | null>(null);
  const [currentWidth, setCurrentWidth] = useState(initialWidth);

  // Update current width when initialWidth changes (e.g., from preset)
  useEffect(() => {
    setCurrentWidth(initialWidth);
  }, [initialWidth]);

  const handleMouseDown = useCallback((e: React.MouseEvent, handle: HandlePosition) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setActiveHandle(handle);
    onResizeStart?.();

    const startX = e.clientX;
    const startWidth = currentWidth;
    const maxWidth = containerWidth || 1200;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      // Calculate delta based on handle position
      const deltaX = moveEvent.clientX - startX;
      // West handles resize in opposite direction
      const multiplier = handle.includes('w') ? -2 : 2;
      const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidth + deltaX * multiplier));

      setCurrentWidth(newWidth);
      onResize(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setActiveHandle(null);
      onResizeEnd?.();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [currentWidth, containerWidth, minWidth, onResize, onResizeStart, onResizeEnd]);

  // Touch support for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent, handle: HandlePosition) => {
    e.stopPropagation();
    setIsResizing(true);
    setActiveHandle(handle);
    onResizeStart?.();

    const touch = e.touches[0];
    const startX = touch.clientX;
    const startWidth = currentWidth;
    const maxWidth = containerWidth || 1200;

    const handleTouchMove = (moveEvent: TouchEvent) => {
      const moveTouch = moveEvent.touches[0];
      const deltaX = moveTouch.clientX - startX;
      const multiplier = handle.includes('w') ? -2 : 2;
      const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidth + deltaX * multiplier));

      setCurrentWidth(newWidth);
      onResize(newWidth);
    };

    const handleTouchEnd = () => {
      setIsResizing(false);
      setActiveHandle(null);
      onResizeEnd?.();
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  }, [currentWidth, containerWidth, minWidth, onResize, onResizeStart, onResizeEnd]);

  const handlePositions: HandlePosition[] = ['nw', 'ne', 'sw', 'se'];

  const getHandleStyles = (pos: HandlePosition): React.CSSProperties => {
    const base = { position: 'absolute' as const };
    switch (pos) {
      case 'nw': return { ...base, top: -6, left: -6, cursor: 'nwse-resize' };
      case 'ne': return { ...base, top: -6, right: -6, cursor: 'nesw-resize' };
      case 'sw': return { ...base, bottom: -6, left: -6, cursor: 'nesw-resize' };
      case 'se': return { ...base, bottom: -6, right: -6, cursor: 'nwse-resize' };
    }
  };

  if (!selected) {
    return <div ref={containerRef}>{children}</div>;
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative inline-block',
        isResizing && 'select-none'
      )}
    >
      {children}

      {/* Corner handles */}
      {handlePositions.map((pos) => (
        <div
          key={pos}
          className={cn(
            'w-3 h-3 rounded-full border-2 border-white shadow-lg z-20',
            'transition-transform hover:scale-125',
            'bg-orange-500',
            isResizing && activeHandle === pos && 'scale-125 bg-orange-600'
          )}
          style={getHandleStyles(pos)}
          onMouseDown={(e) => handleMouseDown(e, pos)}
          onTouchStart={(e) => handleTouchStart(e, pos)}
        />
      ))}

      {/* Width indicator during resize */}
      {isResizing && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-black/80 text-white text-xs whitespace-nowrap">
          {Math.round(currentWidth)}px
        </div>
      )}
    </div>
  );
}
