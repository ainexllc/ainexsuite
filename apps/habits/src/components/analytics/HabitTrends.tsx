'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, Calendar, Clock, Star } from 'lucide-react';
import { subDays, startOfWeek, getDay, parseISO } from 'date-fns';
import { Habit, Completion } from '@/types/models';
import { cn } from '@/lib/utils';

interface HabitTrendsProps {
  habits: Habit[];
  completions: Completion[];
}

interface TrendData {
  habitId: string;
  habitTitle: string;
  trend: 'up' | 'down' | 'stable';
  thisWeekCount: number;
  lastWeekCount: number;
  percentChange: number;
}

interface DayInsight {
  day: string;
  dayName: string;
  avgCompletions: number;
  isTop: boolean;
}

export function HabitTrends({ habits, completions }: HabitTrendsProps) {
  // Calculate habit trends (this week vs last week)
  const habitTrends = useMemo(() => {
    const today = new Date();
    const thisWeekStart = startOfWeek(today, { weekStartsOn: 0 });
    const lastWeekStart = subDays(thisWeekStart, 7);

    const trends: TrendData[] = [];

    for (const habit of habits) {
      if (habit.isFrozen) continue;

      const habitCompletions = completions.filter(c => c.habitId === habit.id);

      const thisWeekCount = habitCompletions.filter(c => {
        const date = parseISO(c.date);
        return date >= thisWeekStart && date <= today;
      }).length;

      const lastWeekCount = habitCompletions.filter(c => {
        const date = parseISO(c.date);
        return date >= lastWeekStart && date < thisWeekStart;
      }).length;

      let trend: 'up' | 'down' | 'stable' = 'stable';
      let percentChange = 0;

      if (lastWeekCount > 0) {
        percentChange = ((thisWeekCount - lastWeekCount) / lastWeekCount) * 100;
        if (percentChange > 10) trend = 'up';
        else if (percentChange < -10) trend = 'down';
      } else if (thisWeekCount > 0) {
        trend = 'up';
        percentChange = 100;
      }

      trends.push({
        habitId: habit.id,
        habitTitle: habit.title,
        trend,
        thisWeekCount,
        lastWeekCount,
        percentChange
      });
    }

    // Sort by trend (improving first, then stable, then declining)
    return trends.sort((a, b) => {
      const order = { up: 0, stable: 1, down: 2 };
      return order[a.trend] - order[b.trend];
    });
  }, [habits, completions]);

  // Calculate best/worst days
  const dayInsights = useMemo(() => {
    const dayCounts: number[] = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
    const dayTotals: number[] = [0, 0, 0, 0, 0, 0, 0];

    // Get last 30 days of data
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 30);

    const recentCompletions = completions.filter(c => {
      const date = parseISO(c.date);
      return date >= thirtyDaysAgo && date <= today;
    });

    // Count completions per day of week
    recentCompletions.forEach(c => {
      const day = getDay(parseISO(c.date));
      dayCounts[day]++;
    });

    // Calculate number of each day in last 30 days
    for (let i = 0; i <= 30; i++) {
      const day = getDay(subDays(today, i));
      dayTotals[day]++;
    }

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const insights: DayInsight[] = dayNames.map((name, i) => ({
      day: name.slice(0, 3),
      dayName: name,
      avgCompletions: dayTotals[i] > 0 ? dayCounts[i] / dayTotals[i] : 0,
      isTop: false
    }));

    // Mark top 2 days
    const sorted = [...insights].sort((a, b) => b.avgCompletions - a.avgCompletions);
    if (sorted.length >= 2) {
      insights.find(d => d.day === sorted[0].day)!.isTop = true;
      insights.find(d => d.day === sorted[1].day)!.isTop = true;
    }

    return insights;
  }, [completions]);

  // Calculate overall stats
  const overallStats = useMemo(() => {
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 30);
    const sixtyDaysAgo = subDays(today, 60);

    const last30Days = completions.filter(c => {
      const date = parseISO(c.date);
      return date >= thirtyDaysAgo && date <= today;
    }).length;

    const prev30Days = completions.filter(c => {
      const date = parseISO(c.date);
      return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    }).length;

    const percentChange = prev30Days > 0
      ? ((last30Days - prev30Days) / prev30Days) * 100
      : (last30Days > 0 ? 100 : 0);

    return {
      last30Days,
      prev30Days,
      percentChange,
      trend: percentChange > 5 ? 'up' : percentChange < -5 ? 'down' : 'stable'
    };
  }, [completions]);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-emerald-400" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-400" />;
      default:
        return <Minus className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-emerald-400';
      case 'down':
        return 'text-red-400';
      default:
        return 'text-zinc-500 dark:text-zinc-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Monthly Comparison */}
      <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-indigo-400" />
            Monthly Overview
          </h3>
          <div className="flex items-center gap-2">
            {getTrendIcon(overallStats.trend as 'up' | 'down' | 'stable')}
            <span className={cn('text-xs font-medium', getTrendColor(overallStats.trend as 'up' | 'down' | 'stable'))}>
              {overallStats.percentChange > 0 ? '+' : ''}{Math.round(overallStats.percentChange)}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800">
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{overallStats.last30Days}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Last 30 days</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800">
            <p className="text-2xl font-bold text-zinc-500 dark:text-zinc-400">{overallStats.prev30Days}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Previous 30 days</p>
          </div>
        </div>
      </div>

      {/* Best Days of Week */}
      <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-amber-400" />
          Your Best Days
        </h3>

        <div className="flex justify-between gap-1">
          {dayInsights.map((day) => (
            <div
              key={day.day}
              className={cn(
                'flex-1 text-center p-2 rounded-lg transition-colors',
                day.isTop ? 'bg-amber-500/20' : 'bg-zinc-100 dark:bg-zinc-800'
              )}
            >
              <p className={cn(
                'text-xs font-medium',
                day.isTop ? 'text-amber-400' : 'text-zinc-500 dark:text-zinc-400'
              )}>
                {day.day}
              </p>
              <div className={cn(
                'mt-1 h-1 rounded-full',
                day.isTop ? 'bg-amber-400' : 'bg-zinc-300 dark:bg-zinc-600'
              )} style={{
                width: `${Math.min(100, (day.avgCompletions / Math.max(...dayInsights.map(d => d.avgCompletions))) * 100)}%`,
                marginLeft: 'auto',
                marginRight: 'auto'
              }} />
              {day.isTop && (
                <Star className="h-3 w-3 text-amber-400 mx-auto mt-1" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Individual Habit Trends */}
      {habitTrends.length > 0 && (
        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            Habit Trends (This Week vs Last)
          </h3>

          <div className="space-y-2">
            {habitTrends.slice(0, 5).map((trend) => (
              <div
                key={trend.habitId}
                className="flex items-center justify-between p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {getTrendIcon(trend.trend)}
                  <span className="text-sm text-zinc-700 dark:text-zinc-300 truncate">
                    {trend.habitTitle}
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {trend.lastWeekCount} → {trend.thisWeekCount}
                  </span>
                  {trend.trend !== 'stable' && (
                    <span className={cn(
                      'text-xs font-medium',
                      getTrendColor(trend.trend)
                    )}>
                      {trend.percentChange > 0 ? '+' : ''}{Math.round(trend.percentChange)}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
