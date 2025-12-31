'use client';

import { TileBase, TileProps } from './tile-base';
import { useAuth } from '@ainexsuite/auth';
import { useHealthData, MoodType } from '@/hooks/use-health-data';
import { Moon, Droplets, Zap, Heart, Loader2 } from 'lucide-react';

// Mood emoji mapping
const MOOD_EMOJI: Record<MoodType, { emoji: string; color: string; label: string }> = {
  great: { emoji: '😄', color: 'text-emerald-400', label: 'Great' },
  good: { emoji: '🙂', color: 'text-green-400', label: 'Good' },
  okay: { emoji: '😐', color: 'text-yellow-400', label: 'Okay' },
  low: { emoji: '😔', color: 'text-orange-400', label: 'Low' },
  bad: { emoji: '😢', color: 'text-red-400', label: 'Bad' },
};

// Energy level visualization
function EnergyBar({ value }: { value: number | null }) {
  const level = value || 0;
  const percentage = (level / 10) * 100;

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-foreground/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            level >= 7 ? 'bg-emerald-500' :
            level >= 4 ? 'bg-yellow-500' :
            'bg-red-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs font-medium text-foreground/70 w-6 text-right">
        {level}/10
      </span>
    </div>
  );
}

// Water progress
function WaterProgress({ current, target = 8 }: { current: number | null; target?: number }) {
  const glasses = current || 0;

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[...Array(target)].map((_, i) => (
          <div
            key={i}
            className={`w-2 h-4 rounded-sm transition-all ${
              i < glasses ? 'bg-blue-400' : 'bg-foreground/10'
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-foreground/70">
        {glasses}/{target}
      </span>
    </div>
  );
}

// Metric card
function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  color = 'text-foreground',
  compact = false
}: {
  icon: React.ElementType;
  label: string;
  value: string | number | null;
  unit?: string;
  color?: string;
  compact?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 ${compact ? 'p-1.5' : 'p-2'} bg-foreground/5 rounded-lg`}>
      <Icon className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} ${color}`} />
      <div className="flex-1 min-w-0">
        <p className={`${compact ? 'text-[10px]' : 'text-xs'} text-muted-foreground truncate`}>{label}</p>
        <p className={`${compact ? 'text-xs' : 'text-sm'} font-semibold text-foreground`}>
          {value ?? '—'}{unit && value !== null && <span className="text-muted-foreground font-normal ml-0.5">{unit}</span>}
        </p>
      </div>
    </div>
  );
}

export function HealthTile(props: Omit<TileProps, 'title' | 'children'>) {
  const { user } = useAuth();
  const { todayMetrics, isLoading } = useHealthData(user?.uid);

  const isCompact = props.variant === 'small';

  // Determine overall wellness indicator
  const getWellnessStatus = () => {
    if (!todayMetrics) return { label: 'No data yet', color: 'text-muted-foreground' };

    let score = 0;
    let count = 0;

    if (todayMetrics.sleep !== null) {
      score += todayMetrics.sleep >= 7 ? 1 : todayMetrics.sleep >= 5 ? 0.5 : 0;
      count++;
    }
    if (todayMetrics.energy !== null) {
      score += todayMetrics.energy >= 7 ? 1 : todayMetrics.energy >= 4 ? 0.5 : 0;
      count++;
    }
    if (todayMetrics.water !== null) {
      score += todayMetrics.water >= 6 ? 1 : todayMetrics.water >= 3 ? 0.5 : 0;
      count++;
    }

    if (count === 0) return { label: 'No data yet', color: 'text-muted-foreground' };

    const avg = score / count;
    if (avg >= 0.75) return { label: 'Doing great!', color: 'text-emerald-400' };
    if (avg >= 0.5) return { label: 'Okay today', color: 'text-yellow-400' };
    return { label: 'Take it easy', color: 'text-orange-400' };
  };

  const wellness = getWellnessStatus();

  return (
    <TileBase {...props} title="Health">
      {isLoading ? (
        <div className="flex items-center justify-center h-24">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : !todayMetrics ? (
        <div className="flex flex-col items-center justify-center h-24 text-center">
          <div className="p-3 rounded-full bg-teal-500/10 mb-2">
            <Heart className="w-5 h-5 text-teal-400" />
          </div>
          <p className="text-sm font-medium text-foreground/80">Ready to check in</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Track your wellness today
          </p>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          {/* Mood & Status Header */}
          <div className="flex items-center justify-between mb-3">
            {todayMetrics.mood && (
              <div className="flex items-center gap-2">
                <span className="text-2xl">{MOOD_EMOJI[todayMetrics.mood].emoji}</span>
                <span className={`text-sm font-medium ${MOOD_EMOJI[todayMetrics.mood].color}`}>
                  {MOOD_EMOJI[todayMetrics.mood].label}
                </span>
              </div>
            )}
            <span className={`text-xs ${wellness.color}`}>{wellness.label}</span>
          </div>

          {/* Energy Level */}
          {todayMetrics.energy !== null && (
            <div className="mb-3">
              <div className="flex items-center gap-1 mb-1">
                <Zap className="w-3 h-3 text-yellow-400" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Energy</span>
              </div>
              <EnergyBar value={todayMetrics.energy} />
            </div>
          )}

          {/* Water Progress */}
          {todayMetrics.water !== null && (
            <div className="mb-3">
              <div className="flex items-center gap-1 mb-1">
                <Droplets className="w-3 h-3 text-blue-400" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Hydration</span>
              </div>
              <WaterProgress current={todayMetrics.water} />
            </div>
          )}

          {/* Quick Stats Grid */}
          <div className={`grid ${isCompact ? 'grid-cols-2' : 'grid-cols-2'} gap-2 mt-auto`}>
            {todayMetrics.sleep !== null && (
              <MetricCard
                icon={Moon}
                label="Sleep"
                value={todayMetrics.sleep}
                unit="hrs"
                color="text-indigo-400"
                compact={isCompact}
              />
            )}
            {todayMetrics.heartRate !== null && (
              <MetricCard
                icon={Heart}
                label="Heart Rate"
                value={todayMetrics.heartRate}
                unit="bpm"
                color="text-red-400"
                compact={isCompact}
              />
            )}
          </div>
        </div>
      )}
    </TileBase>
  );
}
