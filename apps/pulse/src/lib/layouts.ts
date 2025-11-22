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
  focus: {
    id: 'focus',
    name: 'Focus',
    description: 'One main task area with supporting tools.',
    icon: 'Maximize',
    gridClassName: 'grid-cols-1 md:grid-cols-3 gap-6 grid-rows-[200px_auto] md:grid-rows-[auto]', // Added specific row handling
    slots: [
      { id: 'main-slot', className: 'col-span-1 md:col-span-2 row-span-2 h-full min-h-[300px]', size: 'large' },
      { id: 'side-1', className: 'col-span-1 h-full', size: 'medium' },
      { id: 'side-2', className: 'col-span-1 h-full', size: 'medium' },
    ]
  },
  sidecar: {
    id: 'sidecar',
    name: 'Sidecar',
    description: 'Right-aligned utility belt.',
    icon: 'Columns',
    gridClassName: 'grid-cols-1 md:grid-cols-4 gap-6',
    slots: [
        // We want the clock to be on the left (2/4 cols) and tiles on the right (2/4 cols)
        // Since the clock is rendered *outside* this grid in the current implementation,
        // we have to be clever. 
        // Actually, to truly support "Sidecar" where the clock moves, we'd need to change DigitalClock.tsx
        // to render the clock INSIDE the grid or change the parent layout.
        // For now, let's make "Sidecar" just a 4-column grid where we encourage putting things on the right?
        // No, let's make it a 2x2 grid that naturally sits below, but maybe we can style it to look like a sidecar
        // if we had the clock in the grid.
        
        // REVISED STRATEGY for Sidecar within current constraints:
        // We can't easily move the clock *into* the grid without bigger refactor.
        // But we can make the grid itself interesting.
        // Let's make it a 4-column row where the left 2 are empty (spacer) and right 2 have tiles?
        // That would simulate it if the clock was above. 
        
        // Better: Just a 4-column layout for now, user requested "unique views".
        // Let's try a 2-column layout where the left column is wide and right is narrow stack.
      { id: 'slot-1', className: 'col-span-1 md:col-span-3', size: 'wide' },
      { id: 'slot-2', className: 'col-span-1', size: 'small' },
      { id: 'slot-3', className: 'col-span-1 md:col-span-3', size: 'wide' },
      { id: 'slot-4', className: 'col-span-1', size: 'small' },
    ]
  }
};

export const DEFAULT_LAYOUT = LAYOUTS.classic;
