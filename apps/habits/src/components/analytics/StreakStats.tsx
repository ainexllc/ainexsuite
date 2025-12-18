'use client';

import { useMemo } from 'react';
import { Flame, Trophy, Target, TrendingUp, Calendar } from 'lucide-react';
import { Habit, Completion } from '@/types/models';
import { calculateStreak } from '@/lib/date-utils';
import { cn } from '@/lib/utils';

interface StreakStatsProps {
  habits: Habit[];
  completions: Completion[];
}

interface StatCard {
  label: string;
  value: string | number;
  icon: typeof Flame;
  color: string;
  subtext?: string;
}

export function StreakStats({ habits, completions }: StreakStatsProps) {
  const stats = useMemo(() => {
    if (habits.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        activeHabits: 0,
        totalCompletions: completions.length,
        bestHabit: null as Habit | null,
      };
    }

    // Calculate current streaks for all habits
    const habitStreaks = habits.map((h) => ({
      habit: h,
      streak: calculateStreak(h, completions),
    }));

    // Best current streak
    const currentStreak = Math.max(...habitStreaks.map((hs) => hs.streak), 0);

    // Longest ever streak
    const longestStreak = Math.max(...habits.map((h) => h.bestStreak), 0);

    // Active habits (not frozen)
    const activeHabits = habits.filter((h) => !h.isFrozen).length;

    // Best performing habit (highest current streak)
    const sortedByStreak = [...habitStreaks].sort((a, b) => b.streak - a.streak);
    const bestHabit = sortedByStreak[0]?.habit || null;

    return {
      currentStreak,
      longestStreak,
      activeHabits,
      totalCompletions: completions.length,
      bestHabit,
    };
  }, [habits, completions]);

  const cards: StatCard[] = [
    {
      label: 'Current Best',
      value: stats.currentStreak,
      icon: Flame,
      color: 'text-orange-400 bg-orange-500/10',
      subtext: 'day streak',
    },
    {
      label: 'All-Time Best',
      value: stats.longestStreak,
      icon: Trophy,
      color: 'text-yellow-400 bg-yellow-500/10',
      subtext: 'day streak',
    },
    {
      label: 'Active Habits',
      value: stats.activeHabits,
      icon: Target,
      color: 'text-emerald-400 bg-emerald-500/10',
      subtext: `of ${habits.length}`,
    },
    {
      label: 'Total Done',
      value: stats.totalCompletions,
      icon: Calendar,
      color: 'text-indigo-400 bg-indigo-500/10',
      subtext: 'completions',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={cn('p-1.5 rounded-lg', card.color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-xs text-white/50">{card.label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">{card.value}</span>
                {card.subtext && (
                  <span className="text-xs text-white/30">{card.subtext}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Best Habit Highlight */}
      {stats.bestHabit && stats.currentStreak > 0 && (
        <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Top Performer</p>
              <p className="text-xs text-white/60">
                <span className="text-orange-300">{stats.bestHabit.title}</span>
                {' '}- {stats.currentStreak} day streak
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
