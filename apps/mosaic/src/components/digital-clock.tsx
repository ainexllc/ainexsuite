'use client';

import { useEffect, useState, useRef } from 'react';
import { Maximize2, Minimize2, Plus, Settings2 } from 'lucide-react';
import { useAuth } from '@ainexsuite/auth';
import { TileTray } from './tiles/tile-tray';
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
import { ClockService, ClockStyle, type ClockSettings, type WidgetPosition, migrateWidgetPositions, CURRENT_GRID_VERSION } from '@/lib/clock-settings';
import { LAYOUTS, DEFAULT_LAYOUT, SlotSize, WIDGET_CONSTRAINTS } from '@/lib/layouts';
import { Preset } from '@/lib/presets';
import { BackgroundEffects, EffectType } from './background-effects';
import { usePulseStore } from '@/lib/store';
import { FreeFormGrid } from './free-form-grid';

type TimeFormat = '12h' | '24h';

const DEFAULT_TILES: Record<string, string | null> = {
  'slot-1': null,
  'slot-2': null,
  'slot-3': null,
};

interface FullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void>;
  mozRequestFullScreen?: () => Promise<void>;
}

interface FullscreenDocument extends Document {
  webkitFullscreenElement?: Element;
  mozFullScreenElement?: Element;
  webkitExitFullscreen?: () => Promise<void>;
  mozCancelFullScreen?: () => Promise<void>;
}

// Detect system clock format preference
const getSystemTimeFormat = (): TimeFormat => {
  // Check if browser has Intl API support
  if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
    const formatter = new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: 'numeric',
    });
    const formatted = formatter.format(new Date());
    // If format includes 'AM' or 'PM', system uses 12h format
    return formatted.includes('AM') || formatted.includes('PM') ? '12h' : '24h';
  }
  // Default to 12h if we can't detect
  return '12h';
};

// Flip Digit Component
const FlipDigit = ({ digit }: { digit: string }) => {
  const [current, setCurrent] = useState(digit);
  const [prev, setPrev] = useState(digit);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (digit !== current) {
      setPrev(current);
      setCurrent(digit);
      setFlipping(true);
      
      const timer = setTimeout(() => {
        setFlipping(false);
        setPrev(digit);
      }, 600);
      
      return () => clearTimeout(timer);
    }
  }, [digit, current]);

  if (digit === ':' || digit === ' ') {
    return <div className="text-3xl md:text-5xl font-mono font-bold text-foreground/50 mx-0.5">{digit}</div>;
  }

  return (
    <div className="relative w-10 h-14 md:w-16 md:h-24 bg-[#222] rounded-lg shadow-xl mx-0.5 perspective-1000">
      {/* Static Top (Next) */}
      <div className="absolute inset-0 h-1/2 overflow-hidden rounded-t-lg bg-[#333] border-b border-background/20 z-0">
        <div className="absolute top-0 left-0 right-0 h-[200%] flex items-center justify-center text-3xl md:text-6xl font-bold text-foreground">
          {current}
        </div>
      </div>

      {/* Static Bottom (Prev) */}
      <div className="absolute top-1/2 left-0 right-0 bottom-0 overflow-hidden rounded-b-lg bg-[#282828] z-0">
        <div className="absolute -top-[100%] left-0 right-0 h-[200%] flex items-center justify-center text-3xl md:text-6xl font-bold text-foreground">
          {prev}
        </div>
      </div>

      {/* Animated Flipping Layers */}
      {flipping && (
        <>
          {/* Flipping Top (Prev -> moves down) */}
          <div
            className="absolute inset-0 h-1/2 overflow-hidden rounded-t-lg bg-[#333] border-b border-background/20 z-20 origin-bottom animate-flip-top"
            style={{ animationDuration: '0.6s', animationFillMode: 'forwards', transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
          >
            <div className="absolute top-0 left-0 right-0 h-[200%] flex items-center justify-center text-3xl md:text-6xl font-bold text-foreground">
              {prev}
            </div>
          </div>

          {/* Flipping Bottom (Next -> moves up) */}
          <div
            className="absolute top-1/2 left-0 right-0 bottom-0 overflow-hidden rounded-b-lg bg-[#282828] z-20 origin-top animate-flip-bottom"
            style={{ animationDuration: '0.6s', animationFillMode: 'forwards', transformStyle: 'preserve-3d', backfaceVisibility: 'hidden', transform: 'rotateX(180deg)' }}
          >
            <div className="absolute -top-[100%] left-0 right-0 h-[200%] flex items-center justify-center text-3xl md:text-6xl font-bold text-foreground">
              {current}
            </div>
          </div>
        </>
      )}

      {/* Middle Line */}
      <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-background/40 z-30 transform -translate-y-1/2 shadow-sm" />
    </div>
  );
};

export function DigitalClock() {
  const { user } = useAuth();
  const { currentSpaceId } = usePulseStore();
  const [time, setTime] = useState<Date | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isTrayOpen, setIsTrayOpen] = useState(false);
  const [isGridInteracting, setIsGridInteracting] = useState(false);
  const isDraggingTile = useRef(false);

  // Initialize state with defaults
  const [tiles, setTiles] = useState<Record<string, string | null>>(DEFAULT_TILES);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [backgroundEffect, setBackgroundEffect] = useState<EffectType>('none');
  const [backgroundDim, setBackgroundDim] = useState<number>(50); // Default 50% for image readability
  const [clockStyle, setClockStyle] = useState<ClockStyle>('digital');
  const [timeFormat, setTimeFormat] = useState<TimeFormat>(getSystemTimeFormat());
  const [weatherZipcode, setWeatherZipcode] = useState<string>('66221');
  const [activeLayoutId, setActiveLayoutId] = useState<string>(DEFAULT_LAYOUT.id);
  const [showClock, setShowClock] = useState<boolean>(true);
  const [showTiles, setShowTiles] = useState<boolean>(true);
  const [freeformWidgets, setFreeformWidgets] = useState<WidgetPosition[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const trayContainerRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  const activeLayout = LAYOUTS[activeLayoutId] || DEFAULT_LAYOUT;

  // Click outside listener for tray
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isTrayOpen || isDraggingTile.current) return;

      // Check if click is inside tray or toggle button
      if (
        trayContainerRef.current &&
        !trayContainerRef.current.contains(event.target as Node) &&
        toggleButtonRef.current &&
        !toggleButtonRef.current.contains(event.target as Node)
      ) {
        setIsTrayOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isTrayOpen]);

  // Listen for fullscreen changes (e.g., user presses Escape)
  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as FullscreenDocument;
      const isCurrentlyFullscreen = !!(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement
      );
      setIsMaximized(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Sync with Firestore on load and changes - keyed by space
  // Enhanced for wall displays with visibility change handling and periodic refresh
  useEffect(() => {
    if (!user) return;

    let unsubscribe: (() => void) | null = null;
    let refreshInterval: NodeJS.Timeout | null = null;

    // Reset to defaults when space changes (before loading new settings)
    const resetToDefaults = () => {
      setTiles(DEFAULT_TILES);
      setBackgroundImage(null);
      setBackgroundEffect('none');
      setBackgroundDim(50);
      setClockStyle('digital');
      setTimeFormat(getSystemTimeFormat());
      setActiveLayoutId(DEFAULT_LAYOUT.id);
      setShowClock(true);
      setShowTiles(true);
      setFreeformWidgets([]);
    };

    // Apply settings from Firestore snapshot
    const applySettings = (settings: ClockSettings | null) => {
      if (settings) {
        setTiles(settings.tiles || DEFAULT_TILES);
        setBackgroundImage(settings.backgroundImage);
        if (settings.timeFormat) {
          setTimeFormat(settings.timeFormat as TimeFormat);
        }
        if (settings.weatherZipcode) {
          setWeatherZipcode(settings.weatherZipcode);
        }
        if (settings.layoutId && LAYOUTS[settings.layoutId]) {
          setActiveLayoutId(settings.layoutId);
        }
        if (settings.backgroundEffect) {
          setBackgroundEffect(settings.backgroundEffect as EffectType);
        }
        if (typeof settings.backgroundDim === 'number') {
          setBackgroundDim(settings.backgroundDim);
        }
        if (settings.clockStyle) {
          setClockStyle(settings.clockStyle as ClockStyle);
        }
        if (typeof settings.showClock === 'boolean') {
          setShowClock(settings.showClock);
        }
        if (typeof settings.showTiles === 'boolean') {
          setShowTiles(settings.showTiles);
        }
        if (settings.freeformWidgets) {
          // Sanitize: filter out preview tile IDs and deduplicate by ID
          const seen = new Set<string>();
          let sanitized = settings.freeformWidgets.filter((w: WidgetPosition) => {
            // Skip preview tile IDs (from tray)
            if (w.i.endsWith('-tray')) return false;
            // Skip duplicates
            if (seen.has(w.i)) return false;
            seen.add(w.i);
            return true;
          });

          // Migrate widget positions if needed (v1 12-col -> v2 24-col)
          const currentVersion = settings.gridVersion || 1;
          if (currentVersion < CURRENT_GRID_VERSION) {
            sanitized = migrateWidgetPositions(sanitized, currentVersion);
            // Save migrated positions back to Firestore
            ClockService.saveSettings(user.uid, {
              freeformWidgets: sanitized,
              gridVersion: CURRENT_GRID_VERSION
            }, currentSpaceId || undefined);
          }

          setFreeformWidgets(sanitized);
        }
      }
    };

    // Setup real-time subscription
    const setupSubscription = () => {
      // Unsubscribe from previous if exists
      if (unsubscribe) {
        unsubscribe();
      }
      // Subscribe to real-time updates for current space
      unsubscribe = ClockService.subscribeToSettings(user.uid, currentSpaceId || undefined, applySettings);
    };

    // Handle visibility change - re-establish subscription when page becomes visible
    // This is critical for wall displays that may sleep/wake
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Re-fetch settings immediately when page becomes visible
        // This ensures we catch any changes that occurred while hidden
        ClockService.getSettings(user.uid, currentSpaceId || undefined).then(applySettings);
      }
    };

    // Initial setup
    resetToDefaults();
    setupSubscription();

    // Listen for visibility changes (crucial for wall displays)
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Periodic refresh every 30 seconds as a fallback for wall displays
    // This catches any missed updates due to WebSocket disconnections
    refreshInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        ClockService.getSettings(user.uid, currentSpaceId || undefined).then(applySettings);
      }
    }, 30000);

    return () => {
      if (unsubscribe) unsubscribe();
      if (refreshInterval) clearInterval(refreshInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, currentSpaceId]);

  const updateSettings = async (
    newTiles: Record<string, string | null>,
    newBg: string | null,
    newFormat?: TimeFormat,
    newLayoutId?: string,
    newEffect?: EffectType,
    newDim?: number,
    newClockStyle?: ClockStyle,
    newShowClock?: boolean,
    newShowTiles?: boolean,
    newFreeformWidgets?: WidgetPosition[]
  ) => {
    if (!user) return;

    // Optimistic update
    setTiles(newTiles);
    setBackgroundImage(newBg);
    if (newFormat) {
      setTimeFormat(newFormat);
    }
    if (newLayoutId) {
        setActiveLayoutId(newLayoutId);
    }
    if (newEffect) {
        setBackgroundEffect(newEffect);
    }
    if (typeof newDim === 'number') {
        setBackgroundDim(newDim);
    }
    if (newClockStyle) {
        setClockStyle(newClockStyle);
    }
    if (typeof newShowClock === 'boolean') {
        setShowClock(newShowClock);
    }
    if (typeof newShowTiles === 'boolean') {
        setShowTiles(newShowTiles);
    }
    if (newFreeformWidgets !== undefined) {
        setFreeformWidgets(newFreeformWidgets);
    }

    // Persist
    try {
      await ClockService.saveSettings(user.uid, {
        tiles: newTiles,
        backgroundImage: newBg,
        timeFormat: newFormat || timeFormat,
        weatherZipcode: weatherZipcode,
        layoutId: newLayoutId || activeLayoutId,
        backgroundEffect: newEffect || backgroundEffect,
        backgroundDim: typeof newDim === 'number' ? newDim : backgroundDim,
        clockStyle: newClockStyle || clockStyle,
        showClock: typeof newShowClock === 'boolean' ? newShowClock : showClock,
        showTiles: typeof newShowTiles === 'boolean' ? newShowTiles : showTiles,
        freeformWidgets: newFreeformWidgets !== undefined ? newFreeformWidgets : freeformWidgets,
        gridVersion: CURRENT_GRID_VERSION
      }, currentSpaceId || undefined);
    } catch (error) {
      console.error('Failed to save clock settings:', error);
    }
  };

  const handleZipcodeChange = (zip: string) => {
    setWeatherZipcode(zip);
    if (user) {
      ClockService.saveSettings(user.uid, {
        tiles,
        backgroundImage,
        timeFormat,
        weatherZipcode: zip,
        layoutId: activeLayoutId,
        backgroundEffect,
        backgroundDim,
        clockStyle,
        showClock,
        showTiles,
        freeformWidgets,
        gridVersion: CURRENT_GRID_VERSION
      }, currentSpaceId || undefined).catch(e => console.error(e));
    }
  };

  // Handler for freeform widget layout changes
  const handleFreeformLayoutChange = (widgets: WidgetPosition[]) => {
    updateSettings(tiles, backgroundImage, undefined, undefined, undefined, undefined, undefined, undefined, undefined, widgets);
  };

  // Handler for adding a widget in freeform mode
  const handleAddFreeformWidget = (type: string) => {
    const constraints = WIDGET_CONSTRAINTS[type] || { minW: 2, minH: 2, defaultW: 3, defaultH: 2 };
    const newWidget: WidgetPosition = {
      i: `${type}-${Date.now()}`,
      x: 0,
      y: Infinity, // Place at the bottom
      w: constraints.defaultW,
      h: constraints.defaultH,
      type,
      minW: constraints.minW,
      minH: constraints.minH,
    };
    const updatedWidgets = [...freeformWidgets, newWidget];
    updateSettings(tiles, backgroundImage, undefined, undefined, undefined, undefined, undefined, undefined, undefined, updatedWidgets);
  };

  // Handler for removing a widget in freeform mode
  const handleRemoveFreeformWidget = (widgetId: string) => {
    const updatedWidgets = freeformWidgets.filter(w => w.i !== widgetId);
    updateSettings(tiles, backgroundImage, undefined, undefined, undefined, undefined, undefined, undefined, undefined, updatedWidgets);
  };

  const handleTimeFormatChange = (format: TimeFormat) => {
    updateSettings(tiles, backgroundImage, format);
  };

  const handleLayoutSelect = (layoutId: string) => {
      if (layoutId === activeLayoutId) return;

      const targetLayout = LAYOUTS[layoutId];
      if (!targetLayout) return;

      // Handle switching to freeform layout
      if (targetLayout.isFreeform) {
        // Migrate existing slot-based tiles to freeform widgets
        const activeTileIds = Object.values(tiles).filter(Boolean) as string[];
        const migratedWidgets: WidgetPosition[] = activeTileIds.map((tileId, index) => {
          const tileType = tileId.split('-')[0]; // Extract type from ID
          const constraints = WIDGET_CONSTRAINTS[tileType] || { minW: 2, minH: 2, defaultW: 3, defaultH: 2 };
          return {
            i: tileId,
            x: (index % 4) * 3, // Spread across 4 columns
            y: Math.floor(index / 4) * 3, // Stack rows
            w: constraints.defaultW,
            h: constraints.defaultH,
            type: tileType,
            minW: constraints.minW,
            minH: constraints.minH,
          };
        });

        // Keep existing freeform widgets if any, or use migrated ones
        const newFreeformWidgets = freeformWidgets.length > 0 ? freeformWidgets : migratedWidgets;
        updateSettings(tiles, backgroundImage, undefined, layoutId, undefined, undefined, undefined, undefined, undefined, newFreeformWidgets);
        return;
      }

      // Handle switching from freeform to a slot-based layout
      if (LAYOUTS[activeLayoutId]?.isFreeform) {
        // Migrate freeform widgets to slot-based tiles
        const widgetTileIds = freeformWidgets.map(w => w.i);
        const nextTiles: Record<string, string | null> = {};
        const targetSlots = targetLayout.slots.map(s => s.id);

        targetSlots.forEach((slotId, index) => {
          if (index < widgetTileIds.length) {
            nextTiles[slotId] = widgetTileIds[index];
          } else {
            nextTiles[slotId] = null;
          }
        });

        updateSettings(nextTiles, backgroundImage, undefined, layoutId);
        return;
      }

      // Standard layout-to-layout migration
      // 1. Collect all current tile IDs that are placed
      const activeTileIds = Object.values(tiles).filter(Boolean) as string[];

      // 2. Map existing tiles to new slots sequentially
      //    (This preserves as many as possible, dropping extras if new layout is smaller)
      const nextTiles: Record<string, string | null> = {};
      const targetSlots = targetLayout.slots.map(s => s.id);

      // Fill target slots with available tiles
      targetSlots.forEach((slotId, index) => {
          if (index < activeTileIds.length) {
              nextTiles[slotId] = activeTileIds[index];
          } else {
              nextTiles[slotId] = null;
          }
      });

      updateSettings(nextTiles, backgroundImage, undefined, layoutId);
  };

  const handleEffectSelect = (effect: EffectType) => {
      updateSettings(tiles, backgroundImage, undefined, undefined, effect);
  };

  const handleDimSelect = (dim: number) => {
      updateSettings(tiles, backgroundImage, undefined, undefined, undefined, dim);
  };

  const handleClockStyleSelect = (style: ClockStyle) => {
      updateSettings(tiles, backgroundImage, undefined, undefined, undefined, undefined, style);
  };

  const handleToggleShowClock = (show: boolean) => {
      updateSettings(tiles, backgroundImage, undefined, undefined, undefined, undefined, undefined, show);
  };

  const handleToggleShowTiles = (show: boolean) => {
      updateSettings(tiles, backgroundImage, undefined, undefined, undefined, undefined, undefined, undefined, show);
  };

  // Format time string for display
  const getFormattedTime = (): string => {
    if (!time) return '';

    const baseFormat = { hour12: timeFormat === '12h', hour: '2-digit' as const, minute: '2-digit' as const, second: '2-digit' as const };
    let timeStr = time.toLocaleTimeString([], baseFormat);

    // For 12h format, remove leading 0 from single-digit hours (e.g., "09:30 AM" -> "9:30 AM")
    if (timeFormat === '12h') {
      timeStr = timeStr.replace(/^0(\d)/, '$1');
    }

    return timeStr;
  };

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const toggleMaximize = async () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    try {
      if (!isMaximized) {
        // Try Fullscreen API first (works on most devices except iOS Chrome)
        const elem = containerRef.current as FullscreenElement;

        if (elem?.requestFullscreen) {
          await elem.requestFullscreen();
        } else if (elem?.webkitRequestFullscreen) {
          // Safari (limited support on iOS)
          await elem.webkitRequestFullscreen();
        } else if (elem?.mozRequestFullScreen) {
          // Firefox
          await elem.mozRequestFullScreen();
        }

        // For iOS, hide browser UI by scrolling (helps with Chrome and Safari)
        if (isIOS) {
          window.scrollTo(0, 1);
          // Trigger viewport-height fix for iOS Safari address bar
          setTimeout(() => {
            window.scrollTo(0, 0);
          }, 100);
        }

        setIsMaximized(true);
      } else {
        // Exit fullscreen
        const doc = document as FullscreenDocument;
        if (doc.fullscreenElement) {
          await document.exitFullscreen();
        } else if (doc.webkitFullscreenElement && doc.webkitExitFullscreen) {
          // Safari
          await doc.webkitExitFullscreen();
        } else if (doc.mozFullScreenElement && doc.mozCancelFullScreen) {
          // Firefox
          await doc.mozCancelFullScreen();
        }

        setIsMaximized(false);
      }
    } catch (error) {
      console.error('Fullscreen toggle failed:', error);
      // Fallback to CSS-based fullscreen
      setIsMaximized(!isMaximized);
    }
  };

  const handleDragStart = (_e: React.DragEvent) => {
    isDraggingTile.current = true;
  };

  const handleDragEnd = (_e: React.DragEvent) => {
    isDraggingTile.current = false;
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetSlot: string) => {
    e.preventDefault();
    isDraggingTile.current = false;
    const droppedTileId = e.dataTransfer.getData('text/plain');
    
    if (!droppedTileId) return;

    const newTiles = { ...tiles };
    
    // Find if the dropped tile was already in a slot (dragged from one slot to another)
    const sourceEntry = Object.entries(tiles).find(([_, value]) => value === droppedTileId);
    const sourceSlot = sourceEntry ? sourceEntry[0] : null;

    if (sourceSlot === targetSlot) return;

    // Check if there's an existing tile in the target slot
    const existingTileInTarget = newTiles[targetSlot];

    if (existingTileInTarget) {
      // SWAP LOGIC
      if (sourceSlot) {
        // If dragging from another slot, swap them
        newTiles[sourceSlot] = existingTileInTarget;
        newTiles[targetSlot] = droppedTileId;
      } else {
        // If dragging from tray, replace the existing one
        newTiles[targetSlot] = droppedTileId;
      }
    } else {
      // MOVE LOGIC (Target is empty)
      if (sourceSlot) {
        newTiles[sourceSlot] = null; // Clear source
      }
      newTiles[targetSlot] = droppedTileId;
    }
    
    updateSettings(newTiles, backgroundImage);
  };

  const handleAddTile = (type: string) => {
    // If in freeform mode, use the freeform handler
    if (activeLayout.isFreeform) {
      handleAddFreeformWidget(type);
      return;
    }

    // Generate unique ID
    const uniqueId = `${type}-${Date.now()}`;

    // Find first empty slot
    const emptySlot = activeLayout.slots.find(slot => !tiles[slot.id]);

    if (emptySlot) {
      const newTiles = { ...tiles, [emptySlot.id]: uniqueId };
      updateSettings(newTiles, backgroundImage);
    }
  };

  const removeTile = (slot: string) => {
    const newTiles = { ...tiles, [slot]: null };
    updateSettings(newTiles, backgroundImage);
  };

  const handleBackgroundSelect = (url: string | null) => {
    updateSettings(tiles, url);
  };

  const handleApplyPreset = (preset: Preset) => {
    const targetLayout = LAYOUTS[preset.layoutId];
    if (!targetLayout) return;

    // Create new tiles mapping from preset
    const newTiles: Record<string, string | null> = {};
    const targetSlots = targetLayout.slots.map(s => s.id);

    // Fill slots with preset tiles
    preset.tiles.forEach((tileType, index) => {
      if (index < targetSlots.length) {
        // Generate unique ID for each tile
        newTiles[targetSlots[index]] = `${tileType}-${Date.now()}-${index}`;
      }
    });

    // Fill remaining slots with null
    targetSlots.forEach(slotId => {
      if (!(slotId in newTiles)) {
        newTiles[slotId] = null;
      }
    });

    // Apply preset settings
    updateSettings(newTiles, backgroundImage, undefined, preset.layoutId);
  };

  const renderTile = (tileId: string | null, slot: string, size: SlotSize) => {
    if (!tileId) return null;
    
    const props = {
      id: tileId,
      onRemove: () => removeTile(slot),
      isDraggable: true,
      onDragStart: (e: React.DragEvent) => {
         isDraggingTile.current = true;
         e.dataTransfer.setData('text/plain', tileId);
      },
      onDragEnd: () => {
        isDraggingTile.current = false;
      },
      variant: size
    };

    if (tileId.includes('alarm-clock')) return <AlarmClockTile {...props} />;
    if (tileId.includes('calendar')) return <CalendarTile {...props} />;
    if (tileId.includes('focus')) return <FocusTile {...props} />;
    if (tileId.includes('spark')) return <SparkTile {...props} />;
    if (tileId.includes('weather')) return <WeatherTile {...props} weatherZipcode={weatherZipcode} onZipcodeChange={handleZipcodeChange} />;
    if (tileId.includes('market')) return <MarketTile {...props} />;
    if (tileId.includes('habits')) return <HabitsTile {...props} />;
    if (tileId.includes('health')) return <HealthTile {...props} />;
    if (tileId.includes('tasks')) return <TasksTile {...props} />;
    if (tileId.includes('journal')) return <JournalTile {...props} />;
    if (tileId.includes('timer')) {
        return (
            <TimerTile
                {...props}
                defaultDuration={1500}
            />
        );
    }
    return null;
  };

  const renderEmptySlot = () => (
    <button
        onClick={() => setIsTrayOpen(true)}
        className="w-full h-full flex items-center justify-center group cursor-pointer outline-none"
        aria-label="Add widget"
    >
        <div className="text-foreground/10 group-hover:text-foreground/40 transition-all duration-300 transform group-hover:scale-110 group-active:scale-95 p-4 rounded-full group-hover:bg-foreground/5">
             <Plus className="w-8 h-8" />
        </div>
    </button>
  );

  const renderClockContent = () => {
    if (!time) return null;

    // Neon Style
    if (clockStyle === 'neon') {
        return (
            <div className="relative">
                <div 
                    className="text-7xl font-bold tracking-wider relative z-10"
                    style={{ 
                        color: '#fff',
                        textShadow: `
                            0 0 5px #fff,
                            0 0 10px #fff,
                            0 0 20px #0ff,
                            0 0 30px #0ff,
                            0 0 40px #0ff
                        `
                    }}
                >
                    {getFormattedTime()}
                </div>
                {/* Reflection/Glow under */}
                <div 
                    className="absolute top-full left-0 right-0 text-7xl font-bold tracking-wider opacity-20 transform scale-y-[-0.5] origin-top blur-sm"
                    style={{ 
                        color: '#0ff',
                    }}
                >
                    {getFormattedTime()}
                </div>
            </div>
        );
    }

    // Retro Flip
    if (clockStyle === 'flip') {
        return (
            <div className="flex items-center justify-center">
                <style jsx global>{`
                  @keyframes flip-top {
                    100% { transform: rotateX(-90deg); }
                  }
                  @keyframes flip-bottom {
                    100% { transform: rotateX(0deg); }
                  }
                  .animate-flip-top { animation: flip-top 0.6s ease-in forwards; }
                  .animate-flip-bottom { animation: flip-bottom 0.6s ease-out forwards; }
                  .perspective-1000 { perspective: 1000px; }
                `}</style>
                {getFormattedTime().split('').map((char, i) => (
                    <FlipDigit key={i} digit={char} />
                ))}
            </div>
        );
    }

    // Analog
    if (clockStyle === 'analog') {
        const seconds = time.getSeconds();
        const minutes = time.getMinutes();
        const hours = time.getHours();

        const secondDeg = (seconds / 60) * 360;
        const minuteDeg = ((minutes * 60 + seconds) / 3600) * 360;
        const hourDeg = ((hours % 12 * 3600 + minutes * 60 + seconds) / 43200) * 360;

        return (
            <div className="relative w-48 h-48 rounded-full border-4 border-border bg-background/40 backdrop-blur-sm shadow-2xl flex items-center justify-center">
                {/* Markers */}
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className={`absolute w-full h-full flex justify-center pt-2`}
                        style={{
                            transform: `rotate(${i * 30}deg)`,
                        }}
                    >
                        <div className={`w-1 bg-foreground/50 ${i % 3 === 0 ? 'h-4' : 'h-2'}`} />
                    </div>
                ))}

                {/* Hour Hand */}
                <div
                    className="absolute w-1.5 bg-foreground h-12 rounded-full origin-bottom bottom-1/2 left-[calc(50%-3px)]"
                    style={{ transform: `rotate(${hourDeg}deg)` }}
                />

                {/* Minute Hand */}
                <div
                    className="absolute w-1 bg-foreground/80 h-16 rounded-full origin-bottom bottom-1/2 left-[calc(50%-2px)]"
                    style={{ transform: `rotate(${minuteDeg}deg)` }}
                />

                {/* Second Hand */}
                <div
                    className="absolute w-0.5 bg-red-500 h-20 rounded-full origin-bottom bottom-1/2 left-[calc(50%-1px)]"
                    style={{ transform: `rotate(${secondDeg}deg)` }}
                />

                {/* Center Dot */}
                <div className="absolute w-3 h-3 bg-foreground rounded-full shadow-md z-10" />
            </div>
        );
    }

    // Retro Digital (Old School)
    if (clockStyle === 'retro-digital') {
        return (
            <div className="relative p-4 bg-[#333] border-4 border-[#555] rounded-lg shadow-2xl">
                <div className="font-vt323 text-7xl text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.8)] leading-none tracking-wider">
                    {getFormattedTime()}
                </div>
                <div className="absolute inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzhhYWGMYAEYB8RmROaABADeOQ8CXl/xfgAAAABJRU5ErkJggg==')] opacity-20" />
            </div>
        );
    }

    // Minimal Style
    if (clockStyle === 'minimal') {
        const hours = time.getHours();
        const minutes = time.getMinutes();
        const displayHours = timeFormat === '12h' ? (hours % 12 || 12) : hours;
        const period = timeFormat === '12h' ? (hours >= 12 ? 'PM' : 'AM') : '';

        return (
            <div className="flex flex-col items-center">
                <div className="text-8xl font-extralight tracking-widest text-foreground/90">
                    {String(displayHours).padStart(2, '0')}
                    <span className="animate-pulse">:</span>
                    {String(minutes).padStart(2, '0')}
                </div>
                {period && (
                    <div className="text-lg font-light tracking-[0.5em] text-foreground/50 mt-2">
                        {period}
                    </div>
                )}
            </div>
        );
    }

    // Binary Clock Style
    if (clockStyle === 'binary') {
        const hours = time.getHours();
        const minutes = time.getMinutes();
        const seconds = time.getSeconds();

        const toBinaryArray = (num: number, bits: number): boolean[] => {
            return Array.from({ length: bits }, (_, i) => Boolean((num >> (bits - 1 - i)) & 1));
        };

        const hourBits = toBinaryArray(hours, 5);
        const minuteBits = toBinaryArray(minutes, 6);
        const secondBits = toBinaryArray(seconds, 6);

        const renderBinaryRow = (bits: boolean[], label: string) => (
            <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-foreground/50 w-8">{label}</span>
                <div className="flex gap-1.5">
                    {bits.map((bit, i) => (
                        <div
                            key={i}
                            className={`w-4 h-4 rounded-full transition-all duration-300 ${
                                bit
                                    ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]'
                                    : 'bg-foreground/20'
                            }`}
                        />
                    ))}
                </div>
            </div>
        );

        return (
            <div className="flex flex-col gap-3 p-6 bg-black/40 backdrop-blur-sm rounded-xl border border-foreground/10">
                {renderBinaryRow(hourBits, 'HRS')}
                {renderBinaryRow(minuteBits, 'MIN')}
                {renderBinaryRow(secondBits, 'SEC')}
                <div className="text-xs font-mono text-foreground/40 text-center mt-2 tracking-wider">
                    {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </div>
            </div>
        );
    }

    // Default Digital
    return (
        <div className="text-6xl font-mono font-bold tracking-tight drop-shadow-lg text-foreground">
            {getFormattedTime()}
        </div>
    );
  };

  const renderClock = () => (
      <div className={`flex flex-col items-center justify-center transition-transform duration-300 relative ${activeLayoutId.includes('studio') ? 'h-full' : 'mt-12 mb-12'}`}>
          {renderClockContent()}

          {clockStyle !== 'analog' && (
            <div className="text-gray-400 mt-4 font-medium drop-shadow-md">
                {time && time.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          )}
      </div>
  );

  // Render Logic for Studio Layouts (Left/Right)
  const renderStudioLayout = (isRight: boolean) => {
    // isRight = true means Studio Right (Clock Left, Grid Right)
    // isRight = false means Studio Left (Grid Left, Clock Right)

    const clockColumn = (
        <div className="flex flex-col gap-6 h-full justify-center">
            {showClock && (
                <div className="flex-1 flex items-center justify-center">
                    {renderClock()}
                </div>
            )}
            {showTiles && (
                <div
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, isRight ? 'left-1' : 'right-1')}
                    className={`
                        min-h-[120px] rounded-xl border-2 border-dashed transition-colors flex items-center justify-center relative
                        ${tiles[isRight ? 'left-1' : 'right-1'] ? 'border-transparent' : 'border-border hover:border-border-hover bg-foreground/5'}
                        ${isTrayOpen ? 'animate-pulse border-border-hover' : ''}
                    `}
                >
                     {tiles[isRight ? 'left-1' : 'right-1'] ? (
                        <div className="w-full h-full">
                            {renderTile(tiles[isRight ? 'left-1' : 'right-1'], isRight ? 'left-1' : 'right-1', 'medium')}
                        </div>
                    ) : (
                        renderEmptySlot()
                    )}
                </div>
            )}
        </div>
    );

    const gridColumn = showTiles ? (
        <div className="grid grid-cols-2 gap-6 auto-rows-fr">
            {['1', '2', '3', '4'].map((num) => {
                const slotId = isRight ? `right-${num}` : `left-${num}`;
                return (
                    <div
                    key={slotId}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, slotId)}
                    className={`
                        min-h-[120px] rounded-xl border-2 border-dashed transition-colors flex items-center justify-center relative
                        ${tiles[slotId] ? 'border-transparent' : 'border-border hover:border-border-hover bg-foreground/5'}
                        ${isTrayOpen ? 'animate-pulse border-border-hover' : ''}
                    `}
                >
                    {tiles[slotId] ? (
                        <div className="w-full h-full">
                            {renderTile(tiles[slotId], slotId, 'small')}
                        </div>
                    ) : (
                        renderEmptySlot()
                    )}
                </div>
                );
            })}
        </div>
    ) : null;

    return (
        <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            {isRight ? (
                <>
                    {clockColumn}
                    {gridColumn}
                </>
            ) : (
                <>
                    {gridColumn}
                    {clockColumn}
                </>
            )}
        </div>
    );
  };

  if (!time) {
    return null; // Avoid hydration mismatch
  }

  return (
    <div 
      ref={containerRef}
      className={`w-full bg-black text-white border border-outline-subtle shadow-sm flex flex-col items-center relative group transition-all duration-300 bg-cover bg-center bg-no-repeat pointer-events-none ${
        isMaximized
          ? 'fixed inset-0 z-50 rounded-none border-none justify-center overflow-hidden'
          : 'p-8 rounded-2xl mb-8 justify-start min-h-[400px] aspect-video'
      }`}
      style={{
        backgroundImage: backgroundImage && backgroundImage.startsWith('http') ? `url(${backgroundImage})` : undefined,
        backgroundColor: backgroundImage && !backgroundImage.startsWith('http') ? backgroundImage : '#000000',
        ...(isMaximized && {
          height: '100dvh',
          width: '100vw',
        })
      }}
      // Catch drag events bubbling up from tiles
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Background Overlay for Readability */}
      {/* We apply the dimming level as opacity. 0 dim = 0 opacity, 100 dim = 1 opacity (blackout) */}
      <div 
        className="absolute inset-0 bg-black z-0 transition-opacity duration-300" 
        style={{ opacity: backgroundDim / 100 }}
      />

      {/* Render Atmospheric Effects - Behind content but above dimmer */}
      <div className="absolute inset-0 z-5 pointer-events-none">
        <BackgroundEffects effect={backgroundEffect} />
      </div>

      {/* Controls - Moved to root to ignore padding and ensure z-index */}
      <div className="absolute top-0 right-0 m-2 flex items-center gap-2 z-50 opacity-20 group-hover:opacity-100 transition-opacity pointer-events-auto">
          <button
            onClick={toggleMaximize}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
            aria-label={isMaximized ? "Exit maximize" : "Maximize"}
          >
            {isMaximized ? (
              <Minimize2 className="w-5 h-5" />
            ) : (
              <Maximize2 className="w-5 h-5" />
            )}
          </button>
          <button
            ref={toggleButtonRef}
            onClick={() => setIsTrayOpen(!isTrayOpen)}
            className={`p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10 ${isTrayOpen ? 'bg-white/10 text-white' : ''}`}
            aria-label="Customize"
          >
            <Settings2 className="w-5 h-5" />
          </button>
      </div>

      {/* Content Container (z-10 to sit above overlay) */}
      <div className="relative z-10 w-full h-full flex flex-col items-center pointer-events-auto">

        {/* Grid overlay for freeform layout - always subtle, prominent during drag/resize */}
        {activeLayout.isFreeform && showTiles && (
          <div
            className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-300"
            style={{
              zIndex: 5,
              opacity: isGridInteracting ? 1 : 0.15,
              backgroundImage: `
                linear-gradient(to right, hsl(var(--primary) / 0.5) 1px, transparent 1px),
                linear-gradient(to bottom, hsl(var(--primary) / 0.5) 1px, transparent 1px)
              `,
              backgroundSize: '24px 24px',
              // Offset by 16px (px-4 padding) to align with FreeFormGrid snap positions
              backgroundPosition: '16px 16px',
            }}
          />
        )}

        {/* Dynamic Layout Rendering */}
        {activeLayout.isFreeform ? (
            /* Freeform Layout - Full workspace coverage */
            <div className="absolute inset-0 px-4 pt-4 pb-4">
                {/* FreeFormGrid covers entire workspace - clock is now a widget */}
                {showTiles && (
                    <FreeFormGrid
                        widgets={freeformWidgets}
                        onLayoutChange={handleFreeformLayoutChange}
                        onRemoveWidget={handleRemoveFreeformWidget}
                        onOpenTray={() => setIsTrayOpen(true)}
                        weatherZipcode={weatherZipcode}
                        onZipcodeChange={handleZipcodeChange}
                        onInteractionChange={setIsGridInteracting}
                        clockStyle={clockStyle}
                        timeFormat={timeFormat}
                    />
                )}
            </div>
        ) : activeLayoutId === 'studio-right' ? (
            renderStudioLayout(true)
        ) : activeLayoutId === 'studio-left' ? (
            renderStudioLayout(false)
        ) : (
            /* Standard Layouts (Classic, Dashboard, Focus) */
            <>
                {showClock && renderClock()}
                {showTiles && (
                    <div className={`w-full max-w-6xl grid ${activeLayout.gridClassName} mt-auto px-4 pb-4 transition-all duration-300`}>
                    {activeLayout.slots.map((slot) => (
                        <div
                        key={slot.id}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, slot.id)}
                        className={`
                            min-h-[120px] rounded-xl border-2 border-dashed transition-colors flex items-center justify-center relative
                            ${slot.className}
                            ${tiles[slot.id] ? 'border-transparent' : 'border-border hover:border-border-hover bg-foreground/5'}
                            ${isTrayOpen ? 'animate-pulse border-border-hover' : ''}
                        `}
                        >
                        {tiles[slot.id] ? (
                            <div className="w-full h-full">
                            {renderTile(tiles[slot.id], slot.id, slot.size)}
                            </div>
                        ) : (
                            renderEmptySlot()
                        )}
                        </div>
                    ))}
                    </div>
                )}
            </>
        )}
      </div>

      {/* Tile Tray - Moved to root level for proper z-index stacking over effects */}
      {isTrayOpen && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-50">
          <div className="pointer-events-auto inline-block" ref={trayContainerRef}>
            <TileTray
              isOpen={isTrayOpen}
              onClose={() => setIsTrayOpen(false)}
              currentBackground={backgroundImage}
              onSelectBackground={handleBackgroundSelect}
              activeLayoutId={activeLayoutId}
              onSelectLayout={handleLayoutSelect}
              activeEffect={backgroundEffect}
              onSelectEffect={handleEffectSelect}
              backgroundDim={backgroundDim}
              onSelectDim={handleDimSelect}
              clockStyle={clockStyle}
              onSelectClockStyle={handleClockStyleSelect}
              timeFormat={timeFormat}
              onSelectTimeFormat={handleTimeFormatChange}
              onAddTile={handleAddTile}
              showClock={showClock}
              onToggleShowClock={handleToggleShowClock}
              showTiles={showTiles}
              onToggleShowTiles={handleToggleShowTiles}
              onApplyPreset={handleApplyPreset}
            />
          </div>
        </div>
      )}
    </div>
  );
}
