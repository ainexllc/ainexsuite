'use client';

import { SmartDevice } from '@ainexsuite/types';
import { Lightbulb, Power, Zap } from 'lucide-react';
import { useSmartHubStore } from '../../lib/store';

interface LightCardProps {
  device: SmartDevice;
}

export function LightCard({ device }: LightCardProps) {
  const { toggleDevice, updateDeviceTrait } = useSmartHubStore();
  const isOn = device.traits.onOff;
  const brightness = device.traits.brightness || 100;

  return (
    <div className={`relative overflow-hidden rounded-2xl p-4 transition-all duration-300 ${
      isOn ? 'bg-white text-black shadow-lg' : 'bg-white/5 text-white/60 hover:bg-white/10'
    }`}>
      {/* Background Glow for Color Lights */}
      {isOn && device.traits.color?.spectrumRgb && (
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ backgroundColor: `#${device.traits.color.spectrumRgb.toString(16)}` }} 
        />
      )}

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-2 rounded-full ${isOn ? 'bg-yellow-100 text-yellow-600' : 'bg-white/10 text-white/40'}`}>
          {device.type === 'outlet' ? <Zap className="h-5 w-5" /> : <Lightbulb className="h-5 w-5" />}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleDevice(device.id);
          }}
          className={`p-2 rounded-full transition-colors ${
            isOn ? 'bg-black/5 hover:bg-black/10 text-black' : 'bg-white/10 hover:bg-white/20 text-white'
          }`}
        >
          <Power className="h-4 w-4" />
        </button>
      </div>

      <div className="relative z-10">
        <h3 className="font-medium text-sm truncate">{device.name}</h3>
        <p className="text-xs opacity-60">{isOn ? `${brightness}% Brightness` : 'Off'}</p>
      </div>

      {/* Simple Brightness Slider (visible on hover or if on) */}
      {isOn && (
        <input
          type="range"
          min="0"
          max="100"
          value={brightness}
          onChange={(e) => updateDeviceTrait(device.id, { brightness: parseInt(e.target.value) })}
          className="w-full mt-3 h-1 bg-black/10 rounded-lg appearance-none cursor-pointer accent-black"
          onClick={(e) => e.stopPropagation()}
        />
      )}
    </div>
  );
}
