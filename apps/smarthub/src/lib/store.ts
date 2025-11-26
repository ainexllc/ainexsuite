import { create } from 'zustand';
import { SmartDevice, SmartHubState } from '@ainexsuite/types';
import { MOCK_DEVICES } from './mock-data';

interface SmartHubActions {
  setRoomFilter: (roomId: string | 'all') => void;
  toggleDevice: (deviceId: string) => void;
  updateDeviceTrait: (deviceId: string, trait: Partial<SmartDevice['traits']>) => void;
  loadDevices: () => Promise<void>;
}

export const useSmartHubStore = create<SmartHubState & SmartHubActions>((set) => ({
  devices: [],
  rooms: [],
  isLoading: true,
  selectedRoomId: 'all',

  setRoomFilter: (roomId) => set({ selectedRoomId: roomId }),

  toggleDevice: (deviceId) => {
    set((state) => ({
      devices: state.devices.map((d) =>
        d.id === deviceId
          ? {
              ...d,
              traits: { ...d.traits, onOff: !d.traits.onOff },
              lastUpdated: Date.now(),
            }
          : d
      ),
    }));
  },

  updateDeviceTrait: (deviceId, traitUpdates) => {
    set((state) => ({
      devices: state.devices.map((d) =>
        d.id === deviceId
          ? {
              ...d,
              traits: { ...d.traits, ...traitUpdates },
              lastUpdated: Date.now(),
            }
          : d
      ),
    }));
  },

  loadDevices: async () => {
    set({ isLoading: true });
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Extract unique rooms from mock data
    const uniqueRooms = Array.from(new Set(MOCK_DEVICES.map((d) => d.room)));
    const rooms = uniqueRooms.map((room) => ({
      id: room.toLowerCase().replace(/\s+/g, '-'),
      name: room,
      deviceIds: MOCK_DEVICES.filter((d) => d.room === room).map((d) => d.id),
    }));

    set({
      devices: MOCK_DEVICES,
      rooms,
      isLoading: false,
    });
  },
}));
