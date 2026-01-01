'use client';

import { useEffect, useState } from 'react';
import {
  Droplets,
  Moon,
  Dumbbell,
  Target,
  Flame,
  TrendingUp,
} from 'lucide-react';
import { getWellnessScore, getTodayHealthSummary } from '@/lib/wellness-hub';
import { getWeeklyWorkoutStats } from '@/lib/fit-integration';
import { getTodayHabitProgress } from '@/lib/habits-integration';
import type { WellnessScore, WorkoutWeeklyStats, HabitProgressSummary } from '@ainexsuite/types';

interface QuickStat {
  label: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export function WellnessQuickStats() {
  const [wellnessScore, setWellnessScore] = useState<WellnessScore | null>(null);
  const [workoutStats, setWorkoutStats] = useState<WorkoutWeeklyStats | null>(null);
  const [habitProgress, setHabitProgress] = useState<HabitProgressSummary | null>(null);
  const [todayHealth, setTodayHealth] = useState<{
    sleep?: number;
    water?: number;
    energy?: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const [score, workouts, habits, health] = await Promise.all([
          getWellnessScore(),
          getWeeklyWorkoutStats(),
          getTodayHabitProgress(),
          getTodayHealthSummary(),
        ]);

        setWellnessScore(score);
        setWorkoutStats(workouts);
        setHabitProgress(habits);
        if (health?.hasData) {
          setTodayHealth({
            sleep: health.sleep,
            water: health.water,
            energy: health.energy,
          });
        }
      } catch (err) {
        console.error('Failed to load wellness stats:', err);
      } finally {
        setLoading(false);
      }
    }

    void loadStats();
  }, []);

  if (loading) {
    return (
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3 min-w-[480px] sm:min-w-0">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-surface-elevated rounded-lg border border-outline-subtle p-3 animate-pulse"
            >
              <div className="h-6 w-6 rounded-md bg-ink-200 mb-1.5" />
              <div className="h-5 w-12 bg-ink-200 rounded mb-1" />
              <div className="h-3 w-16 bg-ink-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const stats: QuickStat[] = [
    // Wellness Score
    {
      label: 'Wellness Score',
      value: wellnessScore?.overall ?? '--',
      subValue: wellnessScore?.trend === 'improving' ? 'Improving' : wellnessScore?.trend === 'declining' ? 'Declining' : 'Stable',
      icon: <TrendingUp className="h-4 w-4" />,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    // Sleep
    {
      label: 'Sleep',
      value: todayHealth?.sleep ? `${todayHealth.sleep}h` : '--',
      subValue: 'Last night',
      icon: <Moon className="h-4 w-4" />,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
    },
    // Water
    {
      label: 'Water',
      value: todayHealth?.water ?? '--',
      subValue: 'Glasses today',
      icon: <Droplets className="h-4 w-4" />,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
    },
    // Workouts (Weekly)
    {
      label: 'Workouts',
      value: workoutStats?.totalWorkouts ?? 0,
      subValue: `${workoutStats?.totalDuration ?? 0} min this week`,
      icon: <Dumbbell className="h-4 w-4" />,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    // Habits Progress
    {
      label: 'Habits',
      value: habitProgress ? `${habitProgress.completedHabits}/${habitProgress.totalHabits}` : '--',
      subValue: habitProgress ? `${Math.round(habitProgress.completionRate * 100)}% today` : 'No habits',
      icon: <Target className="h-4 w-4" />,
      color: 'text-teal-500',
      bgColor: 'bg-teal-500/10',
    },
    // Active Streaks
    {
      label: 'Top Streak',
      value: habitProgress?.topStreaks?.[0]?.currentStreak ?? 0,
      subValue: habitProgress?.topStreaks?.[0]?.habitTitle ?? 'No active streaks',
      icon: <Flame className="h-4 w-4" />,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  return (
    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3 min-w-[480px] sm:min-w-0">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-surface-elevated rounded-lg border border-outline-subtle p-3 hover:border-outline transition-colors"
          >
            <div className={`h-6 w-6 rounded-md ${stat.bgColor} flex items-center justify-center ${stat.color} mb-1.5`}>
              {stat.icon}
            </div>
            <p className="text-lg font-bold text-ink-900">{stat.value}</p>
            <p className="text-[10px] text-ink-500 truncate leading-tight">{stat.subValue}</p>
            <p className="text-[10px] font-medium text-ink-600 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
