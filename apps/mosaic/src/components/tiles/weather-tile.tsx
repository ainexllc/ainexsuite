'use client';

import { useEffect, useState, useRef } from 'react';
import { Settings, RefreshCw, MapPin, Loader2 } from 'lucide-react';
import { useAuth } from '@ainexsuite/auth';
import { TileBase } from './tile-base';
import { ClockService } from '@/lib/clock-settings';
import { getWeather, getLocationSuggestions, getLocationFromSearch, getWeatherByCoords, reverseGeocode, type WeatherData } from '@/lib/weather';

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
  const [isLocating, setIsLocating] = useState(false);
  const [geolocationError, setGeolocationError] = useState<string | null>(null);
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
      setIsLoadingSuggestions(true);
      try {
        const results = await getLocationSuggestions(value);
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

  const handleUseMyLocation = async () => {
    if (!navigator.geolocation) {
      setGeolocationError('Geolocation not supported');
      return;
    }

    setIsLocating(true);
    setGeolocationError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes cache
        });
      });

      const { latitude, longitude } = position.coords;

      // Get weather for this location
      const data = await getWeatherByCoords(latitude, longitude);
      setWeather(data);

      // Get location name and save it
      const locationName = await reverseGeocode(latitude, longitude);
      onZipcodeChange?.(locationName);

      if (user) {
        await ClockService.saveSettings(user.uid, { weatherZipcode: locationName });
      }

      setShowSettings(false);
      setError(null);
    } catch (err) {
      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setGeolocationError('Location access denied');
            break;
          case err.POSITION_UNAVAILABLE:
            setGeolocationError('Location unavailable');
            break;
          case err.TIMEOUT:
            setGeolocationError('Location request timed out');
            break;
          default:
            setGeolocationError('Unable to get location');
        }
      } else {
        setGeolocationError('Failed to get weather');
        console.error('Geolocation error:', err);
      }
    } finally {
      setIsLocating(false);
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
      <div className="flex flex-col gap-2">
        {/* Weather Display */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-primary/20">
            {loading ? (
              <div className="text-xl animate-pulse">🌡️</div>
            ) : (
              <span className="text-xl">{weather?.icon || '🌡️'}</span>
            )}
          </div>
          <div className="flex-1">
            {loading ? (
              <div className="space-y-1">
                <div className="h-4 bg-white/10 rounded animate-pulse w-16"></div>
                <div className="h-3 bg-white/10 rounded animate-pulse w-24"></div>
              </div>
            ) : error ? (
              <div className="text-[10px] text-destructive">{error}</div>
            ) : weather ? (
              <>
                <div className="text-lg font-bold">{weather.temperature}°</div>
                <div className="text-[10px] text-muted-foreground">{weather.location} • {weather.condition}</div>
                {weather.humidity !== undefined && (
                  <div className="text-[9px] text-muted-foreground/80">💧 {weather.humidity}%</div>
                )}
              </>
            ) : null}
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || loading}
            className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors disabled:opacity-50"
            aria-label="Refresh"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 text-muted-foreground hover:text-foreground hover:bg-foreground/10 rounded transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-3 h-3" />
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="border-t border-border pt-2 space-y-2 animate-in fade-in duration-200">
            <div className="space-y-1">
              <label className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider block">
                📍 Location
              </label>
              <p className="text-[9px] text-muted-foreground/80">
                Search by city or zip
              </p>
            </div>

            {/* Use My Location Button */}
            <button
              onClick={handleUseMyLocation}
              disabled={isLocating}
              className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-[10px] font-medium bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded text-foreground transition-all duration-200 disabled:opacity-50"
            >
              {isLocating ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Locating...
                </>
              ) : (
                <>
                  <MapPin className="w-3 h-3" />
                  Use my location
                </>
              )}
            </button>

            {geolocationError && (
              <p className="text-[9px] text-destructive text-center">{geolocationError}</p>
            )}

            <div className="flex items-center gap-2 text-muted-foreground/50">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[9px] uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="flex gap-1.5 relative">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputZipcode}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="San Diego, CA"
                  className="w-full px-2 py-1.5 text-[10px] bg-foreground/5 border border-border rounded text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-foreground/10 focus:ring-1 focus:ring-primary/30 transition-all duration-200"
                  autoComplete="off"
                />
                {inputZipcode && (
                  <button
                    onClick={() => {
                      setInputZipcode('');
                      setSuggestions([]);
                      setShowSuggestions(false);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground/60 transition-colors text-[10px]"
                    aria-label="Clear input"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button
                onClick={handleSaveZipcode}
                disabled={!inputZipcode.trim()}
                className="px-2 py-1.5 text-[9px] font-semibold bg-primary/30 hover:bg-primary/50 disabled:bg-foreground/10 disabled:text-muted-foreground border border-primary/50 disabled:border-border rounded text-foreground transition-all duration-200 disabled:cursor-not-allowed"
              >
                Save
              </button>

              {/* Suggestions Modal/Popover - Responsive */}
              {(showSuggestions || isLoadingSuggestions) && (
                <>
                  {/* Mobile: Full-screen overlay modal */}
                  <div
                    className="fixed inset-0 md:hidden bg-background/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
                    onClick={() => setShowSuggestions(false)}
                  />

                  {/* Suggestions Container */}
                  <div className="absolute top-full left-0 right-0 mt-1 bg-gradient-to-b from-background/80 to-background border border-border rounded max-h-36 overflow-y-auto z-[9999] shadow-2xl backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Mobile Header */}
                    <div className="sticky top-0 bg-background/90 border-b border-border px-2 py-1.5 md:hidden backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-foreground/70 font-semibold uppercase tracking-wider">
                          🔍 Results
                        </span>
                        <button
                          onClick={() => setShowSuggestions(false)}
                          className="text-muted-foreground hover:text-foreground/80 transition-colors text-[10px]"
                          aria-label="Close suggestions"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {isLoadingSuggestions ? (
                      <div className="px-2 py-3 text-center">
                        <div className="inline-block">
                          <div className="w-3 h-3 border border-border border-t-primary rounded-full animate-spin" />
                        </div>
                        <p className="text-[9px] text-muted-foreground mt-1">Searching...</p>
                      </div>
                    ) : suggestions.length > 0 ? (
                      <div className="divide-y divide-border">
                        {suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSelectSuggestion(suggestion)}
                            className="w-full text-left px-2 py-1.5 text-[10px] text-foreground/80 hover:text-foreground hover:bg-foreground/10 active:bg-foreground/20 transition-all duration-150 group flex items-center justify-between"
                          >
                            <span className="flex items-center gap-1">
                              <span className="text-muted-foreground group-hover:text-foreground/60">📍</span>
                              <span className="truncate">{suggestion.name}</span>
                            </span>
                            <span className="text-foreground/20 group-hover:text-foreground/40 transition-colors">→</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-2 py-3 text-center">
                        <p className="text-[9px] text-muted-foreground">No locations found</p>
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
