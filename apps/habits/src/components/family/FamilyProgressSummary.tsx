'use client';

import { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Trophy,
  Target,
  Flame,
  Calendar,
  Users,
  Star,
} from 'lucide-react';
import Image from 'next/image';
import type { Member, Habit, Completion } from '@/types/models';
import { cn } from '@/lib/utils';

interface FamilyProgressSummaryProps {
  members: Member[];
  habits: Habit[];
  completions: Completion[];
  /** Period to summarize: 'daily' | 'weekly' | 'monthly' */
  period?: 'daily' | 'weekly' | 'monthly';
}

interface MemberProgress {
  member: Member;
  completed: number;
  total: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  streakDays: number;
}

export function FamilyProgressSummary({
  members,
  habits,
  completions,
  period = 'daily',
}: FamilyProgressSummaryProps) {
  const today = useMemo(() => new Date(), []);

  // Calculate date range based on period
  const dateRange = useMemo(() => {
    const end = new Date(today);
    const start = new Date(today);

    if (period === 'daily') {
      // Just today
    } else if (period === 'weekly') {
      start.setDate(start.getDate() - 6);
    } else {
      start.setDate(start.getDate() - 29);
    }

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  }, [period, today]);

  // Previous period for trend comparison
  const previousRange = useMemo(() => {
    const days = period === 'daily' ? 1 : period === 'weekly' ? 7 : 30;
    const end = new Date(dateRange.start);
    end.setDate(end.getDate() - 1);
    const start = new Date(end);
    start.setDate(start.getDate() - days + 1);

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  }, [dateRange, period]);

  // Calculate member progress
  const memberProgress: MemberProgress[] = useMemo(() => {
    return members.map((member) => {
      // Get habits assigned to this member
      const memberHabits = habits.filter((h) =>
        h.assigneeIds.includes(member.uid)
      );

      // Current period completions
      const periodCompletions = completions.filter(
        (c) =>
          c.userId === member.uid &&
          c.date >= dateRange.start &&
          c.date <= dateRange.end
      );

      // Previous period completions (for trend)
      const prevCompletions = completions.filter(
        (c) =>
          c.userId === member.uid &&
          c.date >= previousRange.start &&
          c.date <= previousRange.end
      );

      // Calculate expected completions (simplified: daily habits * days)
      const days = period === 'daily' ? 1 : period === 'weekly' ? 7 : 30;
      const dailyHabits = memberHabits.filter(
        (h) => h.schedule.type === 'daily'
      ).length;
      const total = dailyHabits * days;

      const completed = periodCompletions.length;
      const prevCompleted = prevCompletions.length;

      // Calculate percentage
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      // Determine trend
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (completed > prevCompleted) trend = 'up';
      else if (completed < prevCompleted) trend = 'down';

      // Get current streak (from habit data)
      const streakDays = memberHabits.reduce(
        (max, h) => Math.max(max, h.currentStreak),
        0
      );

      return {
        member,
        completed,
        total,
        percentage: Math.min(100, percentage),
        trend,
        streakDays,
      };
    });
  }, [members, habits, completions, dateRange, previousRange, period]);

  // Family-wide stats
  const familyStats = useMemo(() => {
    const totalCompleted = memberProgress.reduce((sum, m) => sum + m.completed, 0);
    const totalExpected = memberProgress.reduce((sum, m) => sum + m.total, 0);
    const avgPercentage =
      memberProgress.length > 0
        ? Math.round(
            memberProgress.reduce((sum, m) => sum + m.percentage, 0) /
              memberProgress.length
          )
        : 0;
    const topStreak = memberProgress.reduce(
      (max, m) => Math.max(max, m.streakDays),
      0
    );

    return {
      totalCompleted,
      totalExpected,
      avgPercentage,
      topStreak,
    };
  }, [memberProgress]);

  // Sort by percentage (highest first)
  const sortedProgress = [...memberProgress].sort(
    (a, b) => b.percentage - a.percentage
  );

  const periodLabel =
    period === 'daily' ? 'Today' : period === 'weekly' ? 'This Week' : 'This Month';

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Header with family stats */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-lg">
                Family Progress
              </h3>
              <p className="text-sm text-muted-foreground">{periodLabel}</p>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-background/50">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Target className="h-3.5 w-3.5" />
              Completion
            </div>
            <p className="text-xl font-bold text-foreground">
              {familyStats.avgPercentage}%
            </p>
          </div>
          <div className="p-3 rounded-xl bg-background/50">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Trophy className="h-3.5 w-3.5" />
              Completed
            </div>
            <p className="text-xl font-bold text-foreground">
              {familyStats.totalCompleted}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-background/50">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Flame className="h-3.5 w-3.5" />
              Top Streak
            </div>
            <p className="text-xl font-bold text-orange-500">
              {familyStats.topStreak}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-background/50">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Users className="h-3.5 w-3.5" />
              Members
            </div>
            <p className="text-xl font-bold text-foreground">{members.length}</p>
          </div>
        </div>
      </div>

      {/* Member breakdown */}
      <div className="divide-y divide-border">
        {sortedProgress.map(
          ({ member, completed, total, percentage, trend, streakDays }, index) => {
            const TrendIcon =
              trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
            const isTopPerformer = index === 0 && percentage > 0;

            return (
              <div
                key={member.uid}
                className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
              >
                {/* Rank/Avatar */}
                <div className="relative">
                  {member.photoURL ? (
                    <Image
                      src={member.photoURL}
                      alt={member.displayName}
                      width={48}
                      height={48}
                      className="rounded-full object-cover border-2 border-background"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-medium border-2 border-background">
                      {member.displayName?.[0] || '?'}
                    </div>
                  )}
                  {isTopPerformer && (
                    <span className="absolute -top-1 -right-1 text-lg">🏆</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-foreground truncate">
                      {member.displayName}
                    </p>
                    {member.ageGroup === 'child' && (
                      <Star className="h-3.5 w-3.5 text-yellow-500" />
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          percentage >= 80
                            ? 'bg-emerald-500'
                            : percentage >= 50
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        )}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground w-12 text-right">
                      {percentage}%
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {completed}/{total}
                    </p>
                    <p className="text-xs text-muted-foreground">habits</p>
                  </div>

                  <div
                    className={cn(
                      'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium',
                      trend === 'up'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : trend === 'down'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <TrendIcon className="h-3 w-3" />
                    {trend === 'up' ? 'Up' : trend === 'down' ? 'Down' : 'Same'}
                  </div>

                  {streakDays > 0 && (
                    <div className="flex items-center gap-1 text-orange-500">
                      <Flame className="h-4 w-4" />
                      <span className="text-sm font-bold">{streakDays}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          }
        )}
      </div>

      {/* Empty state */}
      {memberProgress.length === 0 && (
        <div className="p-8 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            No family members to track yet
          </p>
        </div>
      )}
    </div>
  );
}
