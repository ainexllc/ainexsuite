export type DeviceType = 'light' | 'thermostat' | 'camera' | 'lock' | 'outlet' | 'sensor';
export type DeviceProvider = 'google' | 'alexa' | 'hue' | 'mock';
export type DeviceStatus = 'online' | 'offline' | 'updating' | 'error';

export interface SmartDeviceTrait {
  onOff?: boolean;
  brightness?: number; // 0-100
  color?: {
    spectrumRgb?: number;
    temperatureK?: number;
  };
  thermostat?: {
    ambientTemperature: number;
    targetTemperature: number;
    mode: 'heat' | 'cool' | 'heatcool' | 'off' | 'eco';
    humidity?: number;
  };
  lock?: {
    isLocked: boolean;
    isJammed?: boolean;
  };
  camera?: {
    streamUrl?: string;
    lastEvent?: {
      type: 'person' | 'motion' | 'sound';
      timestamp: number;
      imageUrl?: string;
    };
  };
  batteryLevel?: number;
}

export interface SmartDevice {
  id: string;
  name: string;
  type: DeviceType;
  provider: DeviceProvider;
  room: string;
  status: DeviceStatus;
  traits: SmartDeviceTrait;
  lastUpdated: number;
}

export interface SmartRoom {
  id: string;
  name: string;
  deviceIds: string[];
}

export interface SmartHubState {
  devices: SmartDevice[];
  rooms: SmartRoom[];
  isLoading: boolean;
  selectedRoomId: string | 'all';
}
