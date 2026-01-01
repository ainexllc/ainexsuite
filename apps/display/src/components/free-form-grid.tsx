'use client';

import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Plus, MoreVertical } from 'lucide-react';
import { WidgetPosition } from '@/lib/clock-settings';
import { WidgetContextMenu } from './widget-context-menu';

// Layout item type for react-grid-layout
interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  static?: boolean;
  isDraggable?: boolean;
  isResizable?: boolean;
}

// Dynamic import react-grid-layout with SSR disabled
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReactGridLayout = dynamic(() => import('react-grid-layout'), { ssr: false }) as any;

import { CalendarTile } from './tiles/calendar-tile';
import { FocusTile } from './tiles/focus-tile';
import { SparkTile } from './tiles/spark-tile';
import { WeatherTile } from './tiles/weather-tile';
import { MarketTile } from './tiles/market-tile';
import { TimerTile } from './tiles/timer-tile';
import { AlarmClockTile } from './tiles/alarm-clock-tile';
import { HabitsTile } from './tiles/habits-tile';
import { HealthTile } from './tiles/health-tile';
import { TasksTile } from './tiles/tasks-tile';
import { JournalTile } from './tiles/journal-tile';
import { ClockTile } from './tiles/clock-tile';
import { ClockStyle } from '@/lib/clock-settings';

interface FreeFormGridProps {
  widgets: WidgetPosition[];
  onLayoutChange: (widgets: WidgetPosition[]) => void;
  onRemoveWidget: (widgetId: string) => void;
  onOpenTray: () => void;
  weatherZipcode?: string;
  onZipcodeChange?: (zip: string) => void;
  onInteractionChange?: (isInteracting: boolean) => void;
  clockStyle?: ClockStyle;
  timeFormat?: '12h' | '24h';
}

// Grid configuration - FIXED pixel size per unit
// Each grid unit is exactly 20x20 pixels on ALL screen sizes
const PIXELS_PER_UNIT = 20;
const ROW_HEIGHT = 20;
const MARGIN: [number, number] = [4, 4];

export function FreeFormGrid({
  widgets,
  onLayoutChange,
  onRemoveWidget,
  onOpenTray,
  weatherZipcode = '66221',
  onZipcodeChange,
  onInteractionChange,
  clockStyle = 'flip',
  timeFormat = '12h',
}: FreeFormGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1200);
  const [mounted, setMounted] = useState(false);
  const [, setIsInteracting] = useState(false);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    widgetId: string;
    widgetType: string;
    currentW: number;
    currentH: number;
    position: { x: number; y: number };
  } | null>(null);

  // Measure container width and track mount state
  useEffect(() => {
    setMounted(true);
    const updateWidth = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Calculate columns dynamically - each column is exactly PIXELS_PER_UNIT wide
  // This ensures widget sizes are in real pixels, not percentages
  const cols = useMemo(() => {
    return Math.max(1, Math.floor(width / (PIXELS_PER_UNIT + MARGIN[0])));
  }, [width]);

  // Convert WidgetPosition[] to react-grid-layout Layout format
  const layout = useMemo(() => {
    return widgets.map((widget) => {
      return {
        i: widget.i,
        x: widget.x,
        y: widget.y,
        w: widget.w,
        h: widget.h,
        minW: 1,  // Minimum 20px width
        minH: 1,  // Minimum 20px height
      };
    });
  }, [widgets]);

  // Track if we're currently updating to prevent loops
  const isUpdatingRef = useRef(false);

  // Handle layout changes from react-grid-layout
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleLayoutChange = useCallback((newLayout: any) => {
    // Prevent infinite loops
    if (isUpdatingRef.current) return;

    // newLayout is a readonly array from react-grid-layout
    const layoutArray = newLayout as LayoutItem[];

    // Map layout items to WidgetPosition, preserving type from existing widgets
    const updatedWidgets: WidgetPosition[] = layoutArray
      .reduce<WidgetPosition[]>((acc, item) => {
        const existingWidget = widgets.find((w) => w.i === item.i);
        // Skip items we don't know about (shouldn't happen, but safety check)
        if (!existingWidget) return acc;
        acc.push({
          i: item.i,
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h,
          type: existingWidget.type,
          minW: item.minW,
          minH: item.minH,
        });
        return acc;
      }, []);

    // Check if layout actually changed (position or size)
    const hasChanged = updatedWidgets.some((updated) => {
      const original = widgets.find((w) => w.i === updated.i);
      if (!original) return true;
      return (
        original.x !== updated.x ||
        original.y !== updated.y ||
        original.w !== updated.w ||
        original.h !== updated.h
      );
    });

    // Only propagate if there's an actual change
    if (hasChanged && updatedWidgets.length > 0) {
      isUpdatingRef.current = true;
      onLayoutChange(updatedWidgets);
      // Reset flag after a tick to allow future updates
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 100);
    }
  }, [widgets, onLayoutChange]);

  // Handle context menu open (right-click or button click)
  const handleContextMenu = useCallback((
    e: React.MouseEvent,
    widget: WidgetPosition
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      widgetId: widget.i,
      widgetType: widget.type,
      currentW: widget.w,
      currentH: widget.h,
      position: { x: e.clientX, y: e.clientY },
    });
  }, []);

  // Handle resize from context menu
  const handleResizeWidget = useCallback((widgetId: string, newW: number, newH: number) => {
    const updatedWidgets = widgets.map((w) => {
      if (w.i === widgetId) {
        return { ...w, w: newW, h: newH };
      }
      return w;
    });
    onLayoutChange(updatedWidgets);
  }, [widgets, onLayoutChange]);

  // Interaction handlers to show/hide grid
  const handleDragStart = useCallback(() => {
    setIsInteracting(true);
    onInteractionChange?.(true);
  }, [onInteractionChange]);
  const handleDragStop = useCallback(() => {
    setIsInteracting(false);
    onInteractionChange?.(false);
  }, [onInteractionChange]);
  const handleResizeStart = useCallback(() => {
    setIsInteracting(true);
    onInteractionChange?.(true);
  }, [onInteractionChange]);
  const handleResizeStop = useCallback(() => {
    setIsInteracting(false);
    onInteractionChange?.(false);
  }, [onInteractionChange]);

  // Render a widget tile based on its type
  const renderWidget = (widget: WidgetPosition) => {
    const props = {
      id: widget.i,
      onRemove: () => onRemoveWidget(widget.i),
      isDraggable: false, // Handled by react-grid-layout
    };

    if (widget.type === 'alarm-clock') return <AlarmClockTile {...props} />;
    if (widget.type === 'calendar') return <CalendarTile {...props} />;
    if (widget.type === 'focus') return <FocusTile {...props} />;
    if (widget.type === 'spark') return <SparkTile {...props} />;
    if (widget.type === 'weather') return <WeatherTile {...props} weatherZipcode={weatherZipcode} onZipcodeChange={onZipcodeChange} />;
    if (widget.type === 'market') return <MarketTile {...props} />;
    if (widget.type === 'habits') return <HabitsTile {...props} />;
    if (widget.type === 'health') return <HealthTile {...props} />;
    if (widget.type === 'tasks') return <TasksTile {...props} />;
    if (widget.type === 'journal') return <JournalTile {...props} />;
    if (widget.type === 'timer') return <TimerTile {...props} defaultDuration={1500} />;
    if (widget.type === 'clock') return <ClockTile {...props} clockStyle={clockStyle} timeFormat={timeFormat} />;

    return null;
  };

  // Don't render grid until mounted (avoids SSR issues)
  if (!mounted) {
    return (
      <div ref={containerRef} className="w-full h-full relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-muted-foreground text-sm">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden">
      {widgets.length === 0 ? (
        // Empty state
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={onOpenTray}
            className="flex flex-col items-center gap-3 p-8 rounded-2xl border-2 border-dashed border-foreground/20 hover:border-foreground/40 bg-foreground/5 hover:bg-foreground/10 transition-all group"
          >
            <Plus className="w-12 h-12 text-foreground/30 group-hover:text-foreground/50 transition-colors" />
            <span className="text-sm text-foreground/50 group-hover:text-foreground/70 transition-colors">
              Add widgets
            </span>
          </button>
        </div>
      ) : (
        <>
          <ReactGridLayout
            className="layout"
            layout={layout}
            cols={cols}
            rowHeight={ROW_HEIGHT}
            width={width}
            margin={MARGIN}
            onLayoutChange={handleLayoutChange}
            onDragStart={handleDragStart}
            onDragStop={handleDragStop}
            onResizeStart={handleResizeStart}
            onResizeStop={handleResizeStop}
            draggableHandle=".drag-handle"
            isResizable={true}
            isDraggable={true}
            useCSSTransforms={true}
            compactType={null}
            preventCollision={true}
            isBounded={true}
            resizeHandles={['se', 's', 'e', 'sw', 'w', 'nw', 'n', 'ne']}
            transformScale={1}
          >
          {widgets.map((widget) => (
            <div
              key={widget.i}
              className="relative group w-full h-full"
              onContextMenu={(e) => handleContextMenu(e, widget)}
            >
              {/* Drag handle bar at top - visible on hover */}
              <div
                className="drag-handle absolute top-0 left-0 right-0 h-6 cursor-grab active:cursor-grabbing z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)' }}
              >
                <div className="flex gap-0.5">
                  <div className="w-1 h-1 rounded-full bg-white/50" />
                  <div className="w-1 h-1 rounded-full bg-white/50" />
                  <div className="w-1 h-1 rounded-full bg-white/50" />
                </div>
              </div>
              {/* Widget menu button - appears on hover */}
              <button
                onClick={(e) => handleContextMenu(e, widget)}
                className="absolute top-1 right-1 p-1 rounded-md bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity z-30"
                title="Widget options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {/* Widget content - inset to leave room for resize handles on all sides */}
              <div className="absolute overflow-hidden" style={{ top: 8, left: 8, right: 8, bottom: 8 }}>
                {renderWidget(widget)}
              </div>
            </div>
          ))}
        </ReactGridLayout>
        </>
      )}

      {/* Add widget button (floating) */}
      {widgets.length > 0 && (
        <button
          onClick={onOpenTray}
          className="absolute bottom-4 right-4 p-3 rounded-full bg-primary/90 hover:bg-primary text-foreground shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95 z-50"
          title="Add widget"
        >
          <Plus className="w-5 h-5" />
        </button>
      )}

      {/* Context menu for widget size presets */}
      {contextMenu && (
        <WidgetContextMenu
          widgetId={contextMenu.widgetId}
          widgetType={contextMenu.widgetType}
          currentW={contextMenu.currentW}
          currentH={contextMenu.currentH}
          position={contextMenu.position}
          onResize={handleResizeWidget}
          onRemove={onRemoveWidget}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
