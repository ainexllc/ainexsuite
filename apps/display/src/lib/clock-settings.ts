import { db } from '@ainexsuite/firebase';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

const SETTINGS_COLLECTION = 'user_settings';

export type ClockStyle = 'digital' | 'neon' | 'flip' | 'analog' | 'retro-digital' | 'christmas-analog' | 'minimal' | 'binary';

// Widget position for freeform layout
export interface WidgetPosition {
  i: string;      // Unique widget ID
  x: number;      // Grid column position
  y: number;      // Grid row position
  w: number;      // Width in grid units
  h: number;      // Height in grid units
  type: string;   // Widget type (weather, calendar, etc.)
  minW?: number;  // Minimum width
  minH?: number;  // Minimum height
}

export interface ClockSettings {
  tiles: Record<string, string | null>;
  backgroundImage: string | null;
  timeFormat?: '12h' | '24h'; // Time format preference
  weatherZipcode?: string; // User's preferred zipcode for weather tile
  layoutId?: string; // ID of the selected layout configuration ('freeform' for new mode)
  backgroundEffect?: string; // Selected background effect
  backgroundDim?: number; // Dim level for background (0-100)
  clockStyle?: ClockStyle; // Clock style preference
  showClock?: boolean; // Whether to show/hide the clock
  showTiles?: boolean; // Whether to show/hide the tiles
  freeformWidgets?: WidgetPosition[]; // Widget positions when in freeform mode
  gridVersion?: number; // Grid version for migration (1 = 12-col, 2 = 24-col)
}

// Current grid version - bump this when grid configuration changes
// v1-3: Percentage-based column grids (deprecated)
// v4: Fixed 20px pixel-based grid (current)
export const CURRENT_GRID_VERSION = 4;

// Migrate widget positions between grid versions
export function migrateWidgetPositions(widgets: WidgetPosition[], fromVersion: number): WidgetPosition[] {
  if (fromVersion >= CURRENT_GRID_VERSION) {
    return widgets; // Already up to date
  }

  // v4 is a fundamentally different grid (pixel-based vs percentage-based)
  // Reset all widgets to default positions with new grid sizing
  // Each widget gets placed in a row, with default size from WIDGET_CONSTRAINTS
  return widgets.map((w, index) => ({
    ...w,
    x: 0,
    y: index * 10, // Stack vertically with 200px (10 units) spacing
    w: 8,  // Default 160px width
    h: 6,  // Default 120px height
    minW: 4,
    minH: 4,
  }));
}

// Generate doc ID based on space (or default if no space)
const getDocId = (spaceId?: string) => spaceId ? `pulse_clock_${spaceId}` : 'pulse_clock';

export const ClockService = {
  async saveSettings(userId: string, settings: Partial<ClockSettings>, spaceId?: string) {
    const docRef = doc(db, 'users', userId, SETTINGS_COLLECTION, getDocId(spaceId));
    await setDoc(docRef, settings, { merge: true });
  },

  async getSettings(userId: string, spaceId?: string): Promise<ClockSettings | null> {
    const docRef = doc(db, 'users', userId, SETTINGS_COLLECTION, getDocId(spaceId));
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? (snapshot.data() as ClockSettings) : null;
  },

  subscribeToSettings(userId: string, spaceId: string | undefined, callback: (settings: ClockSettings | null) => void) {
    const docRef = doc(db, 'users', userId, SETTINGS_COLLECTION, getDocId(spaceId));
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as ClockSettings);
      } else {
        callback(null);
      }
    });
  }
};
