'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

export interface PanelState {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface UsePanelDragResizeOptions {
  /** Initial panel state (position and size) */
  initialState: PanelState;
  /** Minimum width in pixels */
  minWidth?: number;
  /** Minimum height in pixels */
  minHeight?: number;
  /** Maximum width in pixels */
  maxWidth?: number;
  /** Maximum height in pixels (can be 'vh' value like 0.9 for 90vh) */
  maxHeight?: number;
  /** LocalStorage key for persistence */
  storageKey?: string;
  /** Callback when state changes */
  onStateChange?: (state: PanelState) => void;
}

export interface DragHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  style: { cursor: string };
}

export interface ResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  style: { cursor: string };
}

type ResizeEdge = 'right' | 'bottom' | 'corner';

/**
 * Custom hook for drag and resize functionality on a floating panel.
 *
 * Features:
 * - Draggable via header
 * - Resizable via corner and edges
 * - Viewport bounds constraint
 * - LocalStorage persistence
 * - Touch support
 */
export function usePanelDragResize(options: UsePanelDragResizeOptions) {
  const {
    initialState,
    minWidth = 320,
    minHeight = 400,
    maxWidth = 600,
    maxHeight = typeof window !== 'undefined' ? window.innerHeight * 0.9 : 800,
    storageKey,
    onStateChange,
  } = options;

  // Load initial state from localStorage or use provided initial state
  const [state, setState] = useState<PanelState>(() => {
    if (typeof window !== 'undefined' && storageKey) {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as PanelState;
          // Validate stored values are reasonable
          if (
            parsed.x >= 0 &&
            parsed.y >= 0 &&
            parsed.width >= minWidth &&
            parsed.height >= minHeight
          ) {
            return parsed;
          }
        } catch {
          // Invalid JSON, use default
        }
      }
    }
    return initialState;
  });

  // Refs for tracking drag/resize state
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const resizeEdge = useRef<ResizeEdge | null>(null);
  const startPos = useRef({ x: 0, y: 0 });
  const startState = useRef(state);

  // Save state to localStorage when it changes
  useEffect(() => {
    if (storageKey && typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(state));
    }
    onStateChange?.(state);
  }, [state, storageKey, onStateChange]);

  // Constrain panel to viewport
  const constrainToViewport = useCallback((newState: PanelState): PanelState => {
    if (typeof window === 'undefined') return newState;

    const { innerWidth, innerHeight } = window;
    const padding = 20; // Keep at least 20px visible

    return {
      x: Math.max(0, Math.min(newState.x, innerWidth - padding)),
      y: Math.max(0, Math.min(newState.y, innerHeight - padding)),
      width: Math.max(minWidth, Math.min(newState.width, maxWidth)),
      height: Math.max(minHeight, Math.min(newState.height, maxHeight)),
    };
  }, [minWidth, minHeight, maxWidth, maxHeight]);

  // Handle mouse/touch move during drag
  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging.current) return;

    const deltaX = clientX - startPos.current.x;
    const deltaY = clientY - startPos.current.y;

    const newState = constrainToViewport({
      ...startState.current,
      x: startState.current.x + deltaX,
      y: startState.current.y + deltaY,
    });

    setState(newState);
  }, [constrainToViewport]);

  // Handle mouse/touch move during resize
  const handleResizeMove = useCallback((clientX: number, clientY: number) => {
    if (!isResizing.current || !resizeEdge.current) return;

    const deltaX = clientX - startPos.current.x;
    const deltaY = clientY - startPos.current.y;

    const newState = { ...startState.current };

    switch (resizeEdge.current) {
      case 'right':
        newState.width = startState.current.width + deltaX;
        break;
      case 'bottom':
        newState.height = startState.current.height + deltaY;
        break;
      case 'corner':
        newState.width = startState.current.width + deltaX;
        newState.height = startState.current.height + deltaY;
        break;
    }

    setState(constrainToViewport(newState));
  }, [constrainToViewport]);

  // Global mouse/touch event handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        handleDragMove(e.clientX, e.clientY);
      } else if (isResizing.current) {
        handleResizeMove(e.clientX, e.clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (isDragging.current) {
        handleDragMove(touch.clientX, touch.clientY);
      } else if (isResizing.current) {
        handleResizeMove(touch.clientX, touch.clientY);
      }
    };

    const handleEnd = () => {
      isDragging.current = false;
      isResizing.current = false;
      resizeEdge.current = null;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchend', handleEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [handleDragMove, handleResizeMove]);

  // Start dragging
  const startDrag = useCallback((clientX: number, clientY: number) => {
    isDragging.current = true;
    startPos.current = { x: clientX, y: clientY };
    startState.current = state;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';
  }, [state]);

  // Start resizing
  const startResize = useCallback((edge: ResizeEdge, clientX: number, clientY: number) => {
    isResizing.current = true;
    resizeEdge.current = edge;
    startPos.current = { x: clientX, y: clientY };
    startState.current = state;
    document.body.style.userSelect = 'none';

    const cursors: Record<ResizeEdge, string> = {
      right: 'ew-resize',
      bottom: 'ns-resize',
      corner: 'nwse-resize',
    };
    document.body.style.cursor = cursors[edge];
  }, [state]);

  // Props for drag handle
  const dragHandleProps: DragHandleProps = {
    onMouseDown: (e) => {
      e.preventDefault();
      startDrag(e.clientX, e.clientY);
    },
    onTouchStart: (e) => {
      const touch = e.touches[0];
      startDrag(touch.clientX, touch.clientY);
    },
    style: { cursor: isDragging.current ? 'grabbing' : 'grab' },
  };

  // Props factory for resize handles
  const getResizeHandleProps = useCallback((edge: ResizeEdge): ResizeHandleProps => {
    const cursors: Record<ResizeEdge, string> = {
      right: 'ew-resize',
      bottom: 'ns-resize',
      corner: 'nwse-resize',
    };

    return {
      onMouseDown: (e) => {
        e.preventDefault();
        e.stopPropagation();
        startResize(edge, e.clientX, e.clientY);
      },
      onTouchStart: (e) => {
        e.stopPropagation();
        const touch = e.touches[0];
        startResize(edge, touch.clientX, touch.clientY);
      },
      style: { cursor: cursors[edge] },
    };
  }, [startResize]);

  // Reset to initial position
  const resetPosition = useCallback(() => {
    setState(initialState);
  }, [initialState]);

  // Update state directly (for responsive changes)
  const updateState = useCallback((newState: Partial<PanelState>) => {
    setState(prev => constrainToViewport({ ...prev, ...newState }));
  }, [constrainToViewport]);

  return {
    state,
    dragHandleProps,
    getResizeHandleProps,
    resetPosition,
    updateState,
    isDragging: isDragging.current,
    isResizing: isResizing.current,
  };
}
