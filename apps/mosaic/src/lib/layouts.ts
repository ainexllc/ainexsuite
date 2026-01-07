export type SlotSize = 'small' | 'medium' | 'large' | 'wide';

export interface LayoutSlot {
  id: string;
  className: string; // Grid span classes (e.g. col-span-1 row-span-1)
  size: SlotSize; // Hint for the tile to render appropriate content
}

export interface LayoutConfig {
  id: string;
  name: string;
  description: string;
  icon: string; // Name of lucide icon to use or just string ID
  gridClassName: string; // Container grid definition (e.g. grid-cols-3)
  slots: LayoutSlot[];
  clockClassName?: string; // Optional override for clock positioning if needed
  isFreeform?: boolean; // Whether this layout uses freeform positioning
}

export const LAYOUTS: Record<string, LayoutConfig> = {
  classic: {
    id: 'classic',
    name: 'Classic',
    description: 'Clean and simple. Clock on top, 3 essentials below.',
    icon: 'Layout',
    gridClassName: 'grid-cols-1 md:grid-cols-3 gap-6',
    slots: [
      { id: 'slot-1', className: 'col-span-1', size: 'medium' },
      { id: 'slot-2', className: 'col-span-1', size: 'medium' },
      { id: 'slot-3', className: 'col-span-1', size: 'medium' },
    ]
  },
  dashboard: {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Maximum information density. 6 slots for power users.',
    icon: 'Grid',
    gridClassName: 'grid-cols-2 md:grid-cols-3 gap-4',
    slots: [
      { id: 'slot-1', className: 'col-span-1', size: 'small' },
      { id: 'slot-2', className: 'col-span-1', size: 'small' },
      { id: 'slot-3', className: 'col-span-1', size: 'small' },
      { id: 'slot-4', className: 'col-span-1', size: 'small' },
      { id: 'slot-5', className: 'col-span-1', size: 'small' },
      { id: 'slot-6', className: 'col-span-1', size: 'small' },
    ]
  },
  desktop: {
    id: 'desktop',
    name: 'Desktop',
    description: 'Optimized for large screens. Expanded workspace.',
    icon: 'Monitor',
    gridClassName: 'grid-cols-2 md:grid-cols-4 gap-4',
    slots: [
      { id: 'slot-1', className: 'col-span-2', size: 'wide' },
      { id: 'slot-2', className: 'col-span-2', size: 'wide' },
      { id: 'slot-3', className: 'col-span-1', size: 'small' },
      { id: 'slot-4', className: 'col-span-1', size: 'small' },
      { id: 'slot-5', className: 'col-span-1', size: 'small' },
      { id: 'slot-6', className: 'col-span-1', size: 'small' },
      { id: 'slot-7', className: 'col-span-2', size: 'wide' },
      { id: 'slot-8', className: 'col-span-2', size: 'wide' },
    ]
  },
  'studio-right': {
    id: 'studio-right',
    name: 'Studio Right',
    description: 'Clock & main widget on left, 2x2 grid on right.',
    icon: 'PanelRight',
    gridClassName: 'grid-cols-1 md:grid-cols-2 gap-6', 
    slots: [
      { id: 'left-1', className: 'col-span-1', size: 'medium' }, // Under clock (Left)
      { id: 'right-1', className: 'col-span-1', size: 'small' }, // Grid (Right)
      { id: 'right-2', className: 'col-span-1', size: 'small' },
      { id: 'right-3', className: 'col-span-1', size: 'small' },
      { id: 'right-4', className: 'col-span-1', size: 'small' },
    ]
  },
  'studio-left': {
    id: 'studio-left',
    name: 'Studio Left',
    description: '2x2 grid on left, Clock & main widget on right.',
    icon: 'PanelLeft',
    gridClassName: 'grid-cols-1 md:grid-cols-2 gap-6',
    slots: [
      { id: 'left-1', className: 'col-span-1', size: 'small' }, // Grid (Left)
      { id: 'left-2', className: 'col-span-1', size: 'small' },
      { id: 'left-3', className: 'col-span-1', size: 'small' },
      { id: 'left-4', className: 'col-span-1', size: 'small' },
      { id: 'right-1', className: 'col-span-1', size: 'medium' }, // Under clock (Right)
    ]
  },
  freeform: {
    id: 'freeform',
    name: 'Freeform',
    description: 'Drag and resize widgets anywhere on the screen.',
    icon: 'Move',
    gridClassName: '', // Not used in freeform mode
    slots: [], // Slots are dynamic in freeform mode
    isFreeform: true
  }
};

export const DEFAULT_LAYOUT = LAYOUTS.classic;

// Widget size constraints for freeform layout (20px per grid unit)
// 1 unit = 20px, so w:5 = 100px, w:8 = 160px, etc.
// Min: 4×4 = 80×80px | Default: 8×6 = 160×120px
export const WIDGET_CONSTRAINTS: Record<string, { minW: number; minH: number; defaultW: number; defaultH: number }> = {
  weather: { minW: 4, minH: 4, defaultW: 8, defaultH: 6 },
  calendar: { minW: 4, minH: 4, defaultW: 10, defaultH: 10 },
  tasks: { minW: 4, minH: 4, defaultW: 8, defaultH: 8 },
  habits: { minW: 4, minH: 4, defaultW: 8, defaultH: 8 },
  journal: { minW: 4, minH: 4, defaultW: 8, defaultH: 8 },
  health: { minW: 4, minH: 4, defaultW: 8, defaultH: 8 },
  timer: { minW: 4, minH: 4, defaultW: 6, defaultH: 6 },
  market: { minW: 4, minH: 4, defaultW: 6, defaultH: 6 },
  focus: { minW: 4, minH: 3, defaultW: 8, defaultH: 4 },
  spark: { minW: 4, minH: 3, defaultW: 8, defaultH: 4 },
  notes: { minW: 4, minH: 4, defaultW: 8, defaultH: 8 },
  'alarm-clock': { minW: 4, minH: 4, defaultW: 6, defaultH: 8 },
};
