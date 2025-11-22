'use client';

import { useEffect, useState } from 'react';
import { TileBase } from './tile-base';
import { getWeather, type WeatherData } from '@/lib/weather';

interface WeatherTileProps {
  id?: string;
  onRemove?: () => void;
  isDraggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
}

export function WeatherTile({ id = 'weather', onRemove, isDraggable = true, onDragStart }: WeatherTileProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getWeather();
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
  }, []);

  return (
    <TileBase
      id={id}
      title="Weather"
      onRemove={onRemove}
      isDraggable={isDraggable}
      onDragStart={onDragStart}
      className="min-w-[200px]"
    >
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-lg bg-blue-500/20">
          <span className="text-3xl">{weather?.icon || '🌡️'}</span>
        </div>
        <div>
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
      </div>
    </TileBase>
  );
}

