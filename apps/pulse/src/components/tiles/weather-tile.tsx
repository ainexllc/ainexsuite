'use client';

import { useEffect, useState, useRef } from 'react';
import { Settings, RefreshCw } from 'lucide-react';
import { useAuth } from '@ainexsuite/auth';
import { TileBase } from './tile-base';
import { ClockService } from '@/lib/clock-settings';
import { getWeather, getLocationSuggestions, getLocationFromSearch, type WeatherData } from '@/lib/weather';

interface WeatherTileProps {
  id?: string;
  onRemove?: () => void;
  isDraggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  weatherZipcode?: string;
  onZipcodeChange?: (zip: string) => void;
}

export function WeatherTile({
  id = 'weather',
  onRemove,
  isDraggable = true,
  onDragStart,
  weatherZipcode = '66221',
  onZipcodeChange
}: WeatherTileProps) {
  const { user } = useAuth();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [inputZipcode, setInputZipcode] = useState(weatherZipcode || '66221');
  const [suggestions, setSuggestions] = useState<Array<{ name: string; latitude: number; longitude: number }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep input zipcode in sync with prop
  useEffect(() => {
    setInputZipcode(weatherZipcode || '66221');
  }, [weatherZipcode]);

  // Clear input field when settings panel opens
  useEffect(() => {
    if (showSettings) {
      setInputZipcode('');
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [showSettings]);

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

  // Debounce timer ref for typeahead
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = (value: string) => {
    console.log('Weather input changed:', value);
    setInputZipcode(value);

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Debounce API calls - only search after user stops typing for 300ms
    debounceTimerRef.current = setTimeout(async () => {
      console.log('Fetching suggestions for:', value);
      setIsLoadingSuggestions(true);
      try {
        const results = await getLocationSuggestions(value);
        console.log('Got suggestions:', results);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch (err) {
        console.error('Failed to get suggestions:', err);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300);
  };

  const handleSelectSuggestion = (suggestion: { name: string }) => {
    setInputZipcode(suggestion.name);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleSaveZipcode = async () => {
    if (!user || !inputZipcode.trim()) {
      setShowSettings(false);
      return;
    }

    try {
      // First, verify the location exists by searching for it
      const locationData = await getLocationFromSearch(inputZipcode);
      if (!locationData) {
        setError('Location not found. Please try a different city or zipcode.');
        return;
      }

      onZipcodeChange?.(inputZipcode);
      await ClockService.saveSettings(user.uid, { weatherZipcode: inputZipcode });
      setShowSettings(false);
      setSuggestions([]);
      setShowSuggestions(false);
      setError(null);
    } catch (err) {
      console.error('Failed to save location:', err);
      setError('Failed to save location');
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      const data = await getWeather(weatherZipcode);
      setWeather(data);
      setError(null);
    } catch (err) {
      setError('Unable to refresh weather');
      console.error('Weather refresh error:', err);
    } finally {
      setIsRefreshing(false);
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
            {loading ? (
              <div className="text-3xl animate-pulse">🌡️</div>
            ) : (
              <span className="text-3xl">{weather?.icon || '🌡️'}</span>
            )}
          </div>
          <div className="flex-1">
            {loading ? (
              <div className="space-y-2">
                <div className="h-6 bg-white/10 rounded animate-pulse w-20"></div>
                <div className="h-4 bg-white/10 rounded animate-pulse w-32"></div>
              </div>
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
            onClick={handleRefresh}
            disabled={isRefreshing || loading}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors disabled:opacity-50"
            aria-label="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
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
          <div className="border-t border-white/10 pt-4 space-y-3 animate-in fade-in duration-200">
            <div className="space-y-2">
              <label className="text-xs text-white/60 font-semibold uppercase tracking-wider block">
                📍 Location
              </label>
              <p className="text-xs text-white/40">
                Search by city, state, or zipcode
              </p>
            </div>

            <div className="flex gap-2 relative">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputZipcode}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="e.g., San Diego, CA"
                  className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-blue-400/50 focus:bg-white/10 focus:ring-1 focus:ring-blue-400/30 transition-all duration-200"
                  autoComplete="off"
                />
                {inputZipcode && (
                  <button
                    onClick={() => {
                      setInputZipcode('');
                      setSuggestions([]);
                      setShowSuggestions(false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                    aria-label="Clear input"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button
                onClick={handleSaveZipcode}
                disabled={!inputZipcode.trim()}
                className="px-4 py-2.5 text-xs font-semibold bg-blue-500/30 hover:bg-blue-500/50 disabled:bg-white/10 disabled:text-white/30 border border-blue-500/50 disabled:border-white/20 rounded-lg text-white transition-all duration-200 disabled:cursor-not-allowed"
              >
                Save
              </button>

              {/* Suggestions Modal/Popover - Responsive */}
              {(showSuggestions || isLoadingSuggestions) && (
                <>
                  {/* Mobile: Full-screen overlay modal */}
                  <div
                    className="fixed inset-0 md:hidden bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
                    onClick={() => setShowSuggestions(false)}
                  />

                  {/* Suggestions Container */}
                  <div className="absolute top-full left-0 right-0 mt-2 bg-gradient-to-b from-black/80 to-black border border-white/20 rounded-xl max-h-56 overflow-y-auto z-[9999] shadow-2xl backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Mobile Header */}
                    <div className="sticky top-0 bg-black/90 border-b border-white/10 px-4 py-3 md:hidden backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/70 font-semibold uppercase tracking-wider">
                          🔍 Results
                        </span>
                        <button
                          onClick={() => setShowSuggestions(false)}
                          className="text-white/50 hover:text-white/80 transition-colors"
                          aria-label="Close suggestions"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {isLoadingSuggestions ? (
                      <div className="px-4 py-6 text-center">
                        <div className="inline-block">
                          <div className="w-5 h-5 border-2 border-white/20 border-t-blue-400 rounded-full animate-spin" />
                        </div>
                        <p className="text-xs text-white/50 mt-2">Searching locations...</p>
                      </div>
                    ) : suggestions.length > 0 ? (
                      <div className="divide-y divide-white/10">
                        {suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSelectSuggestion(suggestion)}
                            className="w-full text-left px-4 py-3 md:py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 active:bg-white/20 transition-all duration-150 group flex items-center justify-between"
                          >
                            <span className="flex items-center gap-2">
                              <span className="text-white/40 group-hover:text-white/60">📍</span>
                              <span>{suggestion.name}</span>
                            </span>
                            <span className="text-white/20 group-hover:text-white/40 transition-colors">→</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-6 text-center">
                        <p className="text-xs text-white/50">No locations found</p>
                        <p className="text-xs text-white/30 mt-1">Try a different search</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </TileBase>
  );
}
