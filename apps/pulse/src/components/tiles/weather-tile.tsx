'use client';

import { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import { useAuth } from '@ainexsuite/auth';
import { TileBase } from './tile-base';
import { ClockService } from '@/lib/clock-settings';
import { getWeather, getLocationSuggestions, type WeatherData } from '@/lib/weather';

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
  const [suggestions, setSuggestions] = useState<Array<{ name: string; latitude: number; longitude: number }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

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

  const handleInputChange = async (value: string) => {
    setInputZipcode(value);
    setSuggestions([]);

    if (value.length < 2) {
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const results = await getLocationSuggestions(value);
      setSuggestions(results);
      setShowSuggestions(true);
    } catch (err) {
      console.error('Failed to get suggestions:', err);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion: { name: string }) => {
    setInputZipcode(suggestion.name);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleSaveZipcode = async () => {
    if (!user || inputZipcode.trim() === weatherZipcode) {
      setShowSettings(false);
      return;
    }

    try {
      onZipcodeChange?.(inputZipcode);
      await ClockService.saveSettings(user.uid, { weatherZipcode: inputZipcode });
      setShowSettings(false);
      setSuggestions([]);
      setShowSuggestions(false);
    } catch (err) {
      console.error('Failed to save location:', err);
      setError('Failed to save location');
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
            <div className="text-xs text-white/50 font-medium">Location (Zipcode or City)</div>
            <div className="flex gap-2 relative">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputZipcode}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="Enter zipcode or city, state"
                  className="w-full px-2 py-1 text-sm bg-white/10 border border-white/20 rounded text-white placeholder-white/30 focus:outline-none focus:border-white/40"
                  autoComplete="off"
                />
                {/* Autocomplete Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-black/90 border border-white/20 rounded max-h-40 overflow-y-auto z-50">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className="w-full text-left px-2 py-1 text-xs text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        {suggestion.name}
                      </button>
                    ))}
                  </div>
                )}
                {isLoadingSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-black/90 border border-white/20 rounded px-2 py-1 text-xs text-white/50">
                    Searching...
                  </div>
                )}
              </div>
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

