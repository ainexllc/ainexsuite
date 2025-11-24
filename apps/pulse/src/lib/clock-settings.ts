import { db } from '@ainexsuite/firebase';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

const SETTINGS_COLLECTION = 'user_settings';
const CLOCK_SETTINGS_DOC = 'pulse_clock';

export type ClockStyle = 'digital' | 'neon' | 'flip' | 'analog' | 'retro-digital' | 'christmas-analog';

export interface ClockSettings {
  tiles: Record<string, string | null>;
  backgroundImage: string | null;
  timeFormat?: '12h' | '24h'; // Time format preference
  weatherZipcode?: string; // User's preferred zipcode for weather tile
  layoutId?: string; // ID of the selected layout configuration
  backgroundEffect?: string; // Selected background effect
  backgroundDim?: number; // Dim level for background (0-100)
  clockStyle?: ClockStyle; // Clock style preference
  showClock?: boolean; // Whether to show/hide the clock
  showTiles?: boolean; // Whether to show/hide the tiles
}

export const ClockService = {
  async saveSettings(userId: string, settings: Partial<ClockSettings>) {
    const docRef = doc(db, 'users', userId, SETTINGS_COLLECTION, CLOCK_SETTINGS_DOC);
    await setDoc(docRef, settings, { merge: true });
  },

  async getSettings(userId: string): Promise<ClockSettings | null> {
    const docRef = doc(db, 'users', userId, SETTINGS_COLLECTION, CLOCK_SETTINGS_DOC);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? (snapshot.data() as ClockSettings) : null;
  },

  subscribeToSettings(userId: string, callback: (settings: ClockSettings | null) => void) {
    const docRef = doc(db, 'users', userId, SETTINGS_COLLECTION, CLOCK_SETTINGS_DOC);
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as ClockSettings);
      } else {
        callback(null);
      }
    });
  }
};
