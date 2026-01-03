'use client';

import { Scale, Droplets, Eye } from 'lucide-react';

interface FitAppPreferences {
  defaultView?: 'dashboard' | 'workouts' | 'nutrition' | 'recipes' | 'supplements';
  showPersonalRecords?: boolean;
  defaultUnit?: 'kg' | 'lbs';
  waterGoal?: number;
}

interface SettingsPanelProps {
  preferences: FitAppPreferences;
  isLoading: boolean;
  onUpdate: (updates: Partial<FitAppPreferences>) => Promise<void>;
  onClose: () => void;
}

/**
 * Settings panel for Fit app preferences.
 */
export function SettingsPanel({ preferences, isLoading, onUpdate }: SettingsPanelProps) {
  return (
    <div className="space-y-6">
      {/* Weight Unit */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
          <Scale className="h-4 w-4 text-muted-foreground" />
          Weight Unit
        </label>
        <select
          value={preferences.defaultUnit || 'lbs'}
          onChange={(e) => onUpdate({ defaultUnit: e.target.value as 'kg' | 'lbs' })}
          disabled={isLoading}
          className="w-full px-3 py-2 rounded-lg bg-foreground/5 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--app-primary))]/50"
        >
          <option value="lbs">Pounds (lbs)</option>
          <option value="kg">Kilograms (kg)</option>
        </select>
      </div>

      {/* Water Goal */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
          <Droplets className="h-4 w-4 text-muted-foreground" />
          Daily Water Goal
        </label>
        <select
          value={preferences.waterGoal || 8}
          onChange={(e) => onUpdate({ waterGoal: parseInt(e.target.value) })}
          disabled={isLoading}
          className="w-full px-3 py-2 rounded-lg bg-foreground/5 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--app-primary))]/50"
        >
          {[4, 6, 8, 10, 12].map((n) => (
            <option key={n} value={n}>
              {n} glasses
            </option>
          ))}
        </select>
      </div>

      {/* Show Personal Records */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Eye className="h-4 w-4 text-muted-foreground" />
          Show Personal Records
        </label>
        <button
          onClick={() => onUpdate({ showPersonalRecords: !preferences.showPersonalRecords })}
          disabled={isLoading}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            preferences.showPersonalRecords ? 'bg-[hsl(var(--app-primary))]' : 'bg-foreground/20'
          }`}
        >
          <span
            className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
              preferences.showPersonalRecords ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
}
