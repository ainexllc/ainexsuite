'use client';

import type { SmartDevice, SmartRoom } from '@ainexsuite/types';
import { useSmartHubStore } from '../../lib/store';
import { LightCard } from './light-card';
import { ThermostatCard } from './thermostat-card';
import { LockCard } from './lock-card';
import { Loader2 } from 'lucide-react';

export function DeviceGrid() {
  const { devices, rooms, selectedRoomId, isLoading } = useSmartHubStore();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  const filteredDevices = selectedRoomId === 'all'
    ? devices
    : devices.filter((d: SmartDevice) => d.room.toLowerCase().replace(/\s+/g, '-') === selectedRoomId);

  // Group by room if 'all' is selected, otherwise just show grid
  const displayGroups = selectedRoomId === 'all'
    ? rooms.filter((r: SmartRoom) => filteredDevices.some((d: SmartDevice) => d.room === r.name))
    : [{ id: selectedRoomId, name: rooms.find((r: SmartRoom) => r.id === selectedRoomId)?.name || 'Room' }];

  return (
    <div className="space-y-8">
      {displayGroups.map((room: { id: string; name: string }) => {
        const roomDevices = filteredDevices.filter((d: SmartDevice) =>
          selectedRoomId === 'all' ? d.room === room.name : true
        );

        if (roomDevices.length === 0) return null;

        return (
          <div key={room.id}>
            {selectedRoomId === 'all' && (
              <h2 className="text-lg font-semibold text-white/80 mb-4 ml-1">{room.name}</h2>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {roomDevices.map((device: SmartDevice) => {
                switch (device.type) {
                  case 'light':
                  case 'outlet':
                    return <LightCard key={device.id} device={device} />;
                  case 'thermostat':
                    return <ThermostatCard key={device.id} device={device} />;
                  case 'lock':
                    return <LockCard key={device.id} device={device} />;
                  default:
                    // Fallback generic card
                    return (
                      <div key={device.id} className="bg-white/5 rounded-2xl p-4 border border-white/10">
                        <span className="text-xs text-white/40">{device.type}</span>
                        <h3 className="font-medium text-white">{device.name}</h3>
                      </div>
                    );
                }
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
