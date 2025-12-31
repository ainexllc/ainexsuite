'use client';

import { useMemo } from 'react';
import { Flame, AlertTriangle, Trophy, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import type { Member, Habit, Completion } from '@/types/models';
import { cn } from '@/lib/utils';

interface MemberStreak {
  member: Member;
  currentStreak: number;
  longestStreak: number;
  completedToday: boolean;
  isAtRisk: boolean; // Hasn't completed today and has an active streak
}

interface FamilyStreakTrackerProps {
  members: Member[];
  habits: Habit[];
  completions: Completion[];
  /** Show as compact view (single row) */
  compact?: boolean;
}

export function FamilyStreakTracker({
  members,
  habits,
  completions,
  compact = false,
}: FamilyStreakTrackerProps) {
  const todayStr = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  const memberStreaks: MemberStreak[] = useMemo(() => {
    return members.map((member) => {
      // Get habits assigned to this member
      const memberHabits = habits.filter((h) =>
        h.assigneeIds.includes(member.uid)
      );

      // Calculate best streak across all their habits
      const longestStreak = memberHabits.reduce(
        (max, h) => Math.max(max, h.bestStreak),
        0
      );

      // Calculate current combined streak (avg of habit streaks)
      const activeStreaks = memberHabits.filter((h) => h.currentStreak > 0);
      const currentStreak =
        activeStreaks.length > 0
          ? Math.round(
              activeStreaks.reduce((sum, h) => sum + h.currentStreak, 0) /
                activeStreaks.length
            )
          : 0;

      // Check if completed today
      const todayCompletions = completions.filter(
        (c) => c.userId === member.uid && c.date === todayStr
      );
      const assignedTodayHabits = memberHabits.filter((h) => {
        // Check if habit is scheduled for today based on schedule type
        if (h.schedule.type === 'daily') return true;
        if (h.schedule.type === 'specific_days' && h.schedule.daysOfWeek) {
          const today = new Date().getDay();
          return h.schedule.daysOfWeek.includes(today);
        }
        return false;
      });

      const completedToday =
        assignedTodayHabits.length > 0 &&
        todayCompletions.length >= assignedTodayHabits.length;

      const isAtRisk = currentStreak > 0 && !completedToday;

      return {
        member,
        currentStreak,
        longestStreak,
        completedToday,
        isAtRisk,
      };
    });
  }, [members, habits, completions, todayStr]);

  // Sort by streak (highest first), then by at-risk status
  const sortedStreaks = useMemo(() => {
    return [...memberStreaks].sort((a, b) => {
      // At-risk members first (need attention)
      if (a.isAtRisk && !b.isAtRisk) return -1;
      if (!a.isAtRisk && b.isAtRisk) return 1;
      // Then by current streak
      return b.currentStreak - a.currentStreak;
    });
  }, [memberStreaks]);

  // Family combined streak (average)
  const familyStreak = useMemo(() => {
    const total = memberStreaks.reduce((sum, m) => sum + m.currentStreak, 0);
    return Math.round(total / Math.max(members.length, 1));
  }, [memberStreaks, members.length]);

  const atRiskCount = memberStreaks.filter((m) => m.isAtRisk).length;

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
            <Flame className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">
              {familyStreak} day family streak
            </p>
            <p className="text-xs text-muted-foreground">
              {atRiskCount > 0
                ? `${atRiskCount} member${atRiskCount > 1 ? 's' : ''} at risk`
                : 'Everyone on track!'}
            </p>
          </div>
        </div>

        {/* Member avatars with streak indicators */}
        <div className="flex -space-x-1 ml-auto">
          {sortedStreaks.slice(0, 5).map(({ member, isAtRisk, completedToday }) => (
            <div
              key={member.uid}
              className={cn(
                'relative w-8 h-8 rounded-full border-2 border-background',
                isAtRisk && 'ring-2 ring-orange-500/50'
              )}
            >
              {member.photoURL ? (
                <Image
                  src={member.photoURL}
                  alt={member.displayName}
                  fill
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                  {member.displayName?.[0] || '?'}
                </div>
              )}
              {completedToday && (
                <span className="absolute -bottom-1 -right-1 text-xs">✅</span>
              )}
              {isAtRisk && (
                <span className="absolute -top-1 -right-1 text-xs">⚠️</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-orange-500/10 to-amber-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-lg">Family Streaks</h3>
              <p className="text-sm text-muted-foreground">
                {familyStreak} day combined streak
              </p>
            </div>
          </div>

          {atRiskCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/20 text-orange-400 text-sm font-medium">
              <AlertTriangle className="h-4 w-4" />
              {atRiskCount} at risk
            </div>
          )}
        </div>
      </div>

      {/* Member list */}
      <div className="divide-y divide-border">
        {sortedStreaks.map(
          ({ member, currentStreak, longestStreak, completedToday, isAtRisk }) => (
            <div
              key={member.uid}
              className={cn(
                'flex items-center gap-3 p-4 transition-colors',
                isAtRisk && 'bg-orange-500/5'
              )}
            >
              {/* Avatar */}
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
                {completedToday && (
                  <span className="absolute -bottom-1 -right-1 text-lg">✅</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground truncate">
                    {member.displayName}
                  </p>
                  {member.ageGroup === 'child' && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      Kid
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-sm">
                    <Flame className="h-3.5 w-3.5 text-orange-500" />
                    <span
                      className={cn(
                        'font-bold',
                        currentStreak > 0 ? 'text-orange-500' : 'text-muted-foreground'
                      )}
                    >
                      {currentStreak}
                    </span>
                    <span className="text-muted-foreground">current</span>
                  </span>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Trophy className="h-3.5 w-3.5" />
                    <span className="font-medium">{longestStreak}</span>
                    <span>best</span>
                  </span>
                </div>
              </div>

              {/* Status */}
              <div className="flex-shrink-0">
                {isAtRisk ? (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-500/20 text-orange-400 text-xs font-medium">
                    <AlertTriangle className="h-3 w-3" />
                    At risk
                  </div>
                ) : completedToday ? (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                    <TrendingUp className="h-3 w-3" />
                    On track
                  </div>
                ) : (
                  <div className="px-2 py-1 rounded-lg bg-muted text-muted-foreground text-xs">
                    Pending
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </div>

      {/* Chain visualization */}
      <div className="p-4 border-t border-border bg-muted/30">
        <p className="text-xs text-muted-foreground mb-2">Last 7 days</p>
        <div className="flex gap-1.5">
          {Array.from({ length: 7 }).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            const dateStr = date.toISOString().split('T')[0];
            const dayCompletions = completions.filter((c) => c.date === dateStr);
            const coverage =
              members.length > 0 ? dayCompletions.length / members.length : 0;

            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div
                  className={cn(
                    'w-full aspect-square rounded-lg transition-colors',
                    coverage >= 1
                      ? 'bg-emerald-500'
                      : coverage >= 0.5
                      ? 'bg-amber-500'
                      : coverage > 0
                      ? 'bg-orange-500/50'
                      : 'bg-muted'
                  )}
                />
                <span className="text-[10px] text-muted-foreground">
                  {date.toLocaleDateString('en', { weekday: 'narrow' })}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
