'use client';

import { TrendingUp, Calendar, CheckCircle, Flame } from 'lucide-react';

export interface ActivityStat {
  label: string;
  value: number | string;
  icon?: 'trending' | 'calendar' | 'check' | 'flame';
  color?: string;
}

export interface ActivityStatsProps {
  stats: ActivityStat[];
  weeklyData?: number[]; // Array of 7 numbers for mini chart
}

export function ActivityStats({ stats, weeklyData }: ActivityStatsProps) {
  const iconMap = {
    trending: TrendingUp,
    calendar: Calendar,
    check: CheckCircle,
    flame: Flame,
  };

  // Calculate max for chart scaling
  const maxValue = weeklyData ? Math.max(...weeklyData, 1) : 1;

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider">
        Your Activity
      </h3>

      {/* Mini Weekly Chart */}
      {weeklyData && weeklyData.length === 7 && (
        <div className="rounded-lg bg-white/5 border border-white/10 p-4">
          <p className="text-xs text-white/60 mb-3">Last 7 days</p>
          <div className="flex items-end gap-1.5 h-16">
            {weeklyData.map((value, index) => {
              const height = (value / maxValue) * 100;
              const isToday = index === 6;

              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  {/* Bar */}
                  <div className="w-full flex items-end justify-center flex-1">
                    <div
                      className={`w-full rounded-t transition-all ${
                        isToday
                          ? 'bg-blue-500'
                          : value > 0
                          ? 'bg-white/30'
                          : 'bg-white/10'
                      }`}
                      style={{ height: value > 0 ? `${height}%` : '4px' }}
                    />
                  </div>

                  {/* Day Label */}
                  <span className={`text-[10px] ${
                    isToday ? 'text-blue-400 font-medium' : 'text-white/40'
                  }`}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'][index]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon ? iconMap[stat.icon] : TrendingUp;
          const color = stat.color || '#8b5cf6';

          return (
            <div
              key={index}
              className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10"
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0"
                style={{
                  backgroundColor: `${color}20`,
                  color: color,
                }}
              >
                <IconComponent className="h-4 w-4" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold text-white leading-none">
                  {typeof stat.value === 'number'
                    ? stat.value.toLocaleString()
                    : stat.value}
                </p>
                <p className="text-[10px] text-white/50 truncate mt-0.5">
                  {stat.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
