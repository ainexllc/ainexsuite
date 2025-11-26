'use client';

import { SmartDevice } from '@ainexsuite/types';
import { Lock, Unlock, Battery } from 'lucide-react';
import { useSmartHubStore } from '../../lib/store';

interface LockCardProps {
  device: SmartDevice;
}

export function LockCard({ device }: LockCardProps) {
  const { updateDeviceTrait } = useSmartHubStore();
  const isLocked = device.traits.lock?.isLocked;
  const battery = device.traits.batteryLevel;

  const toggleLock = () => {
    updateDeviceTrait(device.id, { lock: { ...device.traits.lock!, isLocked: !isLocked } });
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl p-4 transition-all duration-300 ${
      isLocked ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'
    } border`}>
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col">
          <span className="text-xs text-white/60 uppercase tracking-wider">{device.room}</span>
          <h3 className="font-medium text-white">{device.name}</h3>
        </div>
        {battery !== undefined && (
          <div className="flex items-center gap-1 text-xs text-white/40">
            <Battery className="h-3 w-3" />
            {battery}%
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <button
          onClick={toggleLock}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
            isLocked ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]'
          }`}
        >
          {isLocked ? <Lock className="h-8 w-8" /> : <Unlock className="h-8 w-8" />}
        </button>
      </div>
      
      <p className="text-center text-xs text-white/40 mt-4">
        {isLocked ? 'Secured' : 'Unlocked'}
      </p>
    </div>
  );
}
