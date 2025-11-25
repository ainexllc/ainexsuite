'use client';

import type { HealthMetric } from '@ainexsuite/types';
import {
  Scale,
  Moon,
  Droplets,
  Activity,
  Heart,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { calculateTrend } from '@/lib/health-metrics';

interface HealthStatsProps {
  metrics: HealthMetric[];
}

interface StatCardProps {
  icon: React.ElementType;
  iconColor: string;
  label: string;
  value: string | number | null;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
}

function StatCard({
  icon: Icon,
  iconColor,
  label,
  value,
  unit,
  trend,
  trendValue,
}: StatCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : 'text-ink-400';

  return (
    <div className="bg-surface-elevated rounded-2xl p-4 border border-outline-subtle">
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-xl ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && trendValue !== undefined && (
          <div className={`flex items-center gap-1 text-xs ${trendColor}`}>
            <TrendIcon className="h-3 w-3" />
            <span>{Math.abs(trendValue).toFixed(1)}%</span>
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-sm text-ink-500">{label}</p>
        <p className="text-2xl font-bold text-ink-900">
          {value ?? '--'}
          {unit && value !== null && (
            <span className="text-sm font-normal text-ink-500 ml-1">{unit}</span>
          )}
        </p>
      </div>
    </div>
  );
}

export function HealthStats({ metrics }: HealthStatsProps) {
  // Calculate latest values and trends
  const latestMetric = metrics[0];

  const weightTrend = calculateTrend(metrics, 'weight');
  const sleepTrend = calculateTrend(metrics, 'sleep');
  const waterTrend = calculateTrend(metrics, 'water');
  const energyTrend = calculateTrend(metrics, 'energy');
  const heartRateTrend = calculateTrend(metrics, 'heartRate');

  // Calculate streaks
  const checkInStreak = calculateCheckInStreak(metrics);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-ink-900">Health Overview</h3>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={Scale}
          iconColor="bg-emerald-500/10 text-emerald-500"
          label="Weight"
          value={latestMetric?.weight}
          unit="lbs"
          trend={weightTrend.trend}
          trendValue={weightTrend.change}
        />
        <StatCard
          icon={Moon}
          iconColor="bg-indigo-500/10 text-indigo-500"
          label="Sleep"
          value={latestMetric?.sleep}
          unit="hrs"
          trend={sleepTrend.trend}
          trendValue={sleepTrend.change}
        />
        <StatCard
          icon={Droplets}
          iconColor="bg-blue-500/10 text-blue-500"
          label="Hydration"
          value={latestMetric?.water}
          unit="glasses"
          trend={waterTrend.trend}
          trendValue={waterTrend.change}
        />
        <StatCard
          icon={Activity}
          iconColor="bg-amber-500/10 text-amber-500"
          label="Energy"
          value={latestMetric?.energy}
          unit="/10"
          trend={energyTrend.trend}
          trendValue={energyTrend.change}
        />
        <StatCard
          icon={Heart}
          iconColor="bg-red-500/10 text-red-500"
          label="Heart Rate"
          value={latestMetric?.heartRate}
          unit="bpm"
          trend={heartRateTrend.trend}
          trendValue={heartRateTrend.change}
        />
        <StatCard
          icon={TrendingUp}
          iconColor="bg-emerald-500/10 text-emerald-500"
          label="Check-in Streak"
          value={checkInStreak}
          unit="days"
        />
      </div>

      {/* 7-Day Averages */}
      <div className="bg-surface-elevated rounded-2xl p-4 border border-outline-subtle">
        <h4 className="text-sm font-medium text-ink-700 mb-3">7-Day Averages</h4>
        <div className="space-y-2">
          <AverageRow
            label="Sleep"
            value={sleepTrend.average}
            unit="hrs"
            target={8}
          />
          <AverageRow
            label="Water"
            value={waterTrend.average}
            unit="glasses"
            target={8}
          />
          <AverageRow
            label="Energy"
            value={energyTrend.average}
            unit="/10"
            target={7}
          />
        </div>
      </div>
    </div>
  );
}

function AverageRow({
  label,
  value,
  unit,
  target,
}: {
  label: string;
  value: number;
  unit: string;
  target: number;
}) {
  const percentage = Math.min((value / target) * 100, 100);
  const isOnTrack = value >= target * 0.8;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-ink-600">{label}</span>
        <span className={isOnTrack ? 'text-emerald-500' : 'text-amber-500'}>
          {value.toFixed(1)} {unit}
        </span>
      </div>
      <div className="h-2 bg-surface-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isOnTrack ? 'bg-emerald-500' : 'bg-amber-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function calculateCheckInStreak(metrics: HealthMetric[]): number {
  if (metrics.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sortedDates = metrics
    .map((m) => m.date)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  for (let i = 0; i < sortedDates.length; i++) {
    const checkDate = new Date(sortedDates[i]);
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);

    if (
      checkDate.getFullYear() === expectedDate.getFullYear() &&
      checkDate.getMonth() === expectedDate.getMonth() &&
      checkDate.getDate() === expectedDate.getDate()
    ) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
