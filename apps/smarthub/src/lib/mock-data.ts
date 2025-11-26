import { SmartDevice } from '@ainexsuite/types';

export const MOCK_DEVICES: SmartDevice[] = [
  {
    id: 'dev_1',
    name: 'Living Room Main',
    type: 'light',
    provider: 'hue',
    room: 'Living Room',
    status: 'online',
    traits: {
      onOff: true,
      brightness: 80,
      color: { temperatureK: 4000 }
    },
    lastUpdated: Date.now()
  },
  {
    id: 'dev_2',
    name: 'Living Room Accent',
    type: 'light',
    provider: 'hue',
    room: 'Living Room',
    status: 'online',
    traits: {
      onOff: false,
      brightness: 50,
      color: { spectrumRgb: 16711680 } // Red
    },
    lastUpdated: Date.now()
  },
  {
    id: 'dev_3',
    name: 'Nest Thermostat',
    type: 'thermostat',
    provider: 'google',
    room: 'Hallway',
    status: 'online',
    traits: {
      thermostat: {
        ambientTemperature: 72,
        targetTemperature: 70,
        mode: 'cool',
        humidity: 45
      }
    },
    lastUpdated: Date.now()
  },
  {
    id: 'dev_4',
    name: 'Front Door Lock',
    type: 'lock',
    provider: 'google',
    room: 'Entrance',
    status: 'online',
    traits: {
      lock: {
        isLocked: true
      },
      batteryLevel: 85
    },
    lastUpdated: Date.now()
  },
  {
    id: 'dev_5',
    name: 'Kitchen Overhead',
    type: 'light',
    provider: 'hue',
    room: 'Kitchen',
    status: 'online',
    traits: {
      onOff: true,
      brightness: 100
    },
    lastUpdated: Date.now()
  },
  {
    id: 'dev_6',
    name: 'Coffee Maker Plug',
    type: 'outlet',
    provider: 'mock',
    room: 'Kitchen',
    status: 'offline',
    traits: {
      onOff: false
    },
    lastUpdated: Date.now() - 86400000
  },
  {
    id: 'dev_7',
    name: 'Backyard Cam',
    type: 'camera',
    provider: 'google',
    room: 'Backyard',
    status: 'online',
    traits: {
      camera: {
        lastEvent: {
          type: 'motion',
          timestamp: Date.now() - 3600000,
          imageUrl: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?auto=format&fit=crop&q=80&w=1000'
        }
      }
    },
    lastUpdated: Date.now()
  }
];
