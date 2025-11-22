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
  }
};

export const DEFAULT_LAYOUT = LAYOUTS.classic;
