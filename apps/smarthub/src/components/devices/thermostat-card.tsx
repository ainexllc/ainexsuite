'use client';

import { SmartDevice } from '@ainexsuite/types';
import { Thermometer, Droplets, Fan, Flame } from 'lucide-react';
import { useSmartHubStore } from '../../lib/store';

interface ThermostatCardProps {
  device: SmartDevice;
}

export function ThermostatCard({ device }: ThermostatCardProps) {
  const { updateDeviceTrait } = useSmartHubStore();
  const { ambientTemperature, targetTemperature, mode, humidity } = device.traits.thermostat || {
    ambientTemperature: 72,
    targetTemperature: 70,
    mode: 'off',
    humidity: 45
  };

  const isHeating = mode === 'heat' || (mode === 'heatcool' && ambientTemperature < targetTemperature);
  const isCooling = mode === 'cool' || (mode === 'heatcool' && ambientTemperature > targetTemperature);

  const modeColor = isHeating ? 'text-orange-500' : isCooling ? 'text-blue-500' : 'text-white/40';
  const bgGradient = isHeating 
    ? 'from-orange-500/10 to-transparent' 
    : isCooling 
      ? 'from-blue-500/10 to-transparent' 
      : 'from-white/5 to-transparent';

  return (
    <div className={`relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br ${bgGradient} border border-white/10`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-col">
          <span className="text-xs text-white/60 uppercase tracking-wider">{device.room}</span>
          <h3 className="font-medium text-white">{device.name}</h3>
        </div>
        <div className={`p-2 rounded-full bg-white/5 ${modeColor}`}>
          {isHeating ? <Flame className="h-5 w-5" /> : isCooling ? <Fan className="h-5 w-5" /> : <Thermometer className="h-5 w-5" />}
        </div>
      </div>

      <div className="flex items-center justify-center py-2 relative">
        {/* Circular Dial Placeholder */}
        <div className="w-24 h-24 rounded-full border-4 border-white/10 flex items-center justify-center relative">
          <div className="text-center">
            <span className="text-3xl font-bold text-white">{ambientTemperature}°</span>
            <span className="block text-xs text-white/40">Target {targetTemperature}°</span>
          </div>
          
          {/* Active Arc Indicator (Visual only for now) */}
          <div className={`absolute inset-0 rounded-full border-4 border-transparent border-t-${isHeating ? 'orange' : 'blue'}-500 opacity-50`} />
        </div>
      </div>

      <div className="flex justify-between items-center mt-2 px-2">
        <div className="flex items-center gap-1 text-xs text-white/40">
          <Droplets className="h-3 w-3" />
          {humidity}%
        </div>
        
        <div className="flex gap-1">
          <button 
            onClick={() => updateDeviceTrait(device.id, { thermostat: { ...device.traits.thermostat!, targetTemperature: targetTemperature - 1 } })}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white"
          >-</button>
          <button 
            onClick={() => updateDeviceTrait(device.id, { thermostat: { ...device.traits.thermostat!, targetTemperature: targetTemperature + 1 } })}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white"
          >+</button>
        </div>
      </div>
    </div>
  );
}
