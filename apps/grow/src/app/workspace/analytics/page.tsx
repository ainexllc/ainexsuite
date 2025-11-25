'use client';

import { useAuth, SuiteGuard } from '@ainexsuite/auth';
import { WorkspaceLayout } from '@ainexsuite/ui/components';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, BarChart3, Calendar, Flame, TrendingUp } from 'lucide-react';
import Link from 'next/link';

// Components
import { FirestoreSync } from '@/components/FirestoreSync';
import { HeatmapCalendar } from '@/components/analytics/HeatmapCalendar';
import { StreakStats } from '@/components/analytics/StreakStats';
import { ConsistencyChart } from '@/components/analytics/ConsistencyChart';
import { TeamLeaderboard } from '@/components/analytics/TeamLeaderboard';

// Store & Utils
import { useGrowStore } from '@/lib/store';
import {
  calculateWeeklyConsistency,
  getTeamContribution,
} from '@/lib/analytics-utils';
import { calculateStreak } from '@/lib/date-utils';

function AnalyticsContent() {
  const { user, loading: authLoading, bootstrapStatus } = useAuth();
  const router = useRouter();

  const { getCurrentSpace, getSpaceHabits, completions } = useGrowStore();

  const currentSpace = getCurrentSpace();
  const habits = currentSpace ? getSpaceHabits(currentSpace.id) : [];
  const weeklyStats = calculateWeeklyConsistency(habits, completions);
  const teamStats = currentSpace
    ? getTeamContribution(currentSpace.members, completions)
    : [];

  // Calculate habit-specific stats
  const habitStats = habits.map((habit) => ({
    habit,
    currentStreak: calculateStreak(habit, completions),
    completionCount: completions.filter((c) => c.habitId === habit.id).length,
  }));

  const handleSignOut = async () => {
    try {
      const { auth } = await import('@ainexsuite/firebase');
      const firebaseAuth = await import('firebase/auth');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (firebaseAuth as any).signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  if (authLoading || bootstrapStatus === 'running') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <WorkspaceLayout
      user={user}
      onSignOut={handleSignOut}
      searchPlaceholder="Search analytics..."
      appName="Grow"
    >
      <FirestoreSync />

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/workspace"
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-indigo-400" />
            Analytics
          </h1>
          <p className="text-sm text-white/50">
            {currentSpace?.name || 'My Growth'} - Detailed insights
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Heatmap */}
          <HeatmapCalendar completions={completions} weeks={16} />

          {/* Weekly Chart */}
          <ConsistencyChart data={weeklyStats} />

          {/* Per-Habit Breakdown */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              Habit Performance
            </h3>

            {habitStats.length === 0 ? (
              <p className="text-sm text-white/40 text-center py-8">
                No habits yet. Create your first habit to see analytics.
              </p>
            ) : (
              <div className="space-y-3">
                {habitStats
                  .sort((a, b) => b.currentStreak - a.currentStreak)
                  .map(({ habit, currentStreak, completionCount }) => (
                    <div
                      key={habit.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {habit.title}
                        </p>
                        <p className="text-xs text-white/40">
                          {completionCount} total completions
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        {/* Streak */}
                        <div className="flex items-center gap-1.5 text-xs">
                          <Flame
                            className={`h-4 w-4 ${
                              currentStreak > 0
                                ? 'text-orange-400'
                                : 'text-white/20'
                            }`}
                          />
                          <span
                            className={
                              currentStreak > 0
                                ? 'text-orange-400 font-medium'
                                : 'text-white/30'
                            }
                          >
                            {currentStreak}
                          </span>
                        </div>
                        {/* Best */}
                        <div className="text-xs text-white/30">
                          Best: {habit.bestStreak}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          {/* Streak Stats */}
          <StreakStats habits={habits} completions={completions} />

          {/* Team Leaderboard (if applicable) */}
          {currentSpace?.type !== 'personal' && teamStats.length > 0 && (
            <TeamLeaderboard data={teamStats} />
          )}

          {/* Quick Tips */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-400" />
              Tips for Better Streaks
            </h3>
            <ul className="space-y-2 text-xs text-white/60">
              <li className="flex items-start gap-2">
                <span className="text-indigo-400">1.</span>
                <span>Start with just 2-3 habits to build momentum</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400">2.</span>
                <span>Stack new habits with existing routines</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400">3.</span>
                <span>Use the freeze feature when you need a break</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400">4.</span>
                <span>Celebrate small wins - every day counts!</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}

export default function AnalyticsPage() {
  return (
    <SuiteGuard appName="grow">
      <AnalyticsContent />
    </SuiteGuard>
  );
}
