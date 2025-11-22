'use client';

import { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import { useAuth } from '@ainexsuite/auth';
import { TileBase } from './tile-base';
import { ClockService } from '@/lib/clock-settings';
import { getWeather, type WeatherData } from '@/lib/weather';

interface WeatherTileProps {
  id?: string;
  onRemove?: () => void;
  isDraggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  weatherZipcode?: string;
  onZipcodeChange?: (zipcode: string) => void;
}

export function WeatherTile({ id = 'weather', onRemove, isDraggable = true, onDragStart, weatherZipcode, onZipcodeChange }: WeatherTileProps) {
  const { user } = useAuth();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [inputZipcode, setInputZipcode] = useState(weatherZipcode || '66221');

  // Keep input zipcode in sync with prop
  useEffect(() => {
    setInputZipcode(weatherZipcode || '66221');
  }, [weatherZipcode]);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getWeather(weatherZipcode);
        setWeather(data);
      } catch (err) {
        setError('Unable to load weather');
        console.error('Weather fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();

    // Refresh weather every 10 minutes
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [weatherZipcode]);

  const handleSaveZipcode = async () => {
    if (!user || inputZipcode.trim() === weatherZipcode) {
      setShowSettings(false);
      return;
    }

    try {
      onZipcodeChange?.(inputZipcode);
      await ClockService.saveSettings(user.uid, { weatherZipcode: inputZipcode });
      setShowSettings(false);
    } catch (err) {
      console.error('Failed to save zipcode:', err);
      setError('Failed to save zipcode');
    }
  };

  return (
    <TileBase
      id={id}
      title="Weather"
      onRemove={onRemove}
      isDraggable={isDraggable}
      onDragStart={onDragStart}
      className="min-w-[200px]"
    >
      <div className="flex flex-col gap-4">
        {/* Weather Display */}
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <span className="text-3xl">{weather?.icon || '🌡️'}</span>
          </div>
          <div className="flex-1">
            {loading ? (
              <div className="text-sm text-white/50">Loading...</div>
            ) : error ? (
              <div className="text-sm text-red-400">{error}</div>
            ) : weather ? (
              <>
                <div className="text-2xl font-bold">{weather.temperature}°</div>
                <div className="text-xs text-white/50">{weather.location} • {weather.condition}</div>
                {weather.humidity !== undefined && (
                  <div className="text-xs text-white/40 mt-1">💧 {weather.humidity}% humidity</div>
                )}
              </>
            ) : null}
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="border-t border-white/10 pt-3 space-y-2">
            <div className="text-xs text-white/50 font-medium">Zipcode</div>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputZipcode}
                onChange={(e) => setInputZipcode(e.target.value)}
                placeholder="Enter zipcode"
                className="flex-1 px-2 py-1 text-sm bg-white/10 border border-white/20 rounded text-white placeholder-white/30 focus:outline-none focus:border-white/40"
              />
              <button
                onClick={handleSaveZipcode}
                className="px-2 py-1 text-xs bg-blue-500/30 hover:bg-blue-500/50 border border-blue-500/50 rounded text-white transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </TileBase>
  );
}

