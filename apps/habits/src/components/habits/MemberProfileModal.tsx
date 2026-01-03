'use client';

import { useMemo } from 'react';
import {
  Trophy,
  Target,
  Flame,
  CheckCircle2,
  Calendar,
  Crown,
  User,
  Baby,
  Medal,
  Award,
  Star,
} from 'lucide-react';
import { GlassModal, GlassModalContent, GlassModalFooter } from '@ainexsuite/ui';
import { Member, Habit, Completion } from '@/types/models';
import { cn } from '@/lib/utils';
import { getTodayDateString, calculateStreak } from '@/lib/date-utils';
import { getTeamContribution } from '@/lib/analytics-utils';

interface MemberProfileModalProps {
  member: Member;
  isOpen: boolean;
  onClose: () => void;
  habits: Habit[];
  completions: Completion[];
  allMembers: Member[];
}

export function MemberProfileModal({
  member,
  isOpen,
  onClose,
  habits,
  completions,
  allMembers,
}: MemberProfileModalProps) {
  const today = getTodayDateString();

  // Get team contributions for leaderboard position
  const contributions = useMemo(() => {
    return getTeamContribution(allMembers, completions);
  }, [allMembers, completions]);

  const memberContribution = useMemo(() => {
    return contributions.find((c) => c.uid === member.uid);
  }, [contributions, member.uid]);

  const leaderboardPosition = useMemo(() => {
    return contributions.findIndex((c) => c.uid === member.uid) + 1;
  }, [contributions, member.uid]);

  // Get habits assigned to this member
  const memberHabits = useMemo(() => {
    return habits.filter((h) => h.assigneeIds.includes(member.uid));
  }, [habits, member.uid]);

  // Calculate habit stats with streaks
  const habitStats = useMemo(() => {
    return memberHabits.map((habit) => {
      const habitCompletions = completions.filter(
        (c) => c.habitId === habit.id && c.userId === member.uid
      );
      const isCompletedToday = habitCompletions.some((c) => c.date === today);
      const streak = calculateStreak(habit, habitCompletions);

      return {
        habit,
        streak,
        isCompletedToday,
        totalCompletions: habitCompletions.length,
      };
    });
  }, [memberHabits, completions, member.uid, today]);

  // Today's completion count
  const todayCompletions = useMemo(() => {
    return habitStats.filter((h) => h.isCompletedToday).length;
  }, [habitStats]);

  // Best streak among all habits
  const bestStreak = useMemo(() => {
    return Math.max(0, ...habitStats.map((h) => h.streak));
  }, [habitStats]);

  // Format join date
  const joinDate = useMemo(() => {
    if (!member.joinedAt) return 'Unknown';
    const date = new Date(member.joinedAt);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  }, [member.joinedAt]);

  // Get leaderboard rank icon
  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-amber-400" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-300" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <Star className="h-5 w-5 text-indigo-400" />;
    }
  };

  // Get initials
  const getInitials = (name: string) => name.slice(0, 2).toUpperCase();

  const isChild = member.ageGroup === 'child';
  const isAdmin = member.role === 'admin';

  return (
    <GlassModal isOpen={isOpen} onClose={onClose} size="md" variant="frosted">
      <GlassModalContent>
        {/* Header with Avatar/Banner */}
        <div className="relative -mx-6 -mt-6 mb-6 overflow-hidden">
          {/* Banner Background */}
          {member.photoURL ? (
            <div className="relative h-40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={member.photoURL}
                alt={member.displayName}
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              {/* Member info overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                    {member.displayName}
                  </h2>
                  {isChild ? (
                    <Baby className="h-5 w-5 text-pink-400" />
                  ) : (
                    <User className="h-5 w-5 text-white/70" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-medium">
                      <Crown className="h-3 w-3" />
                      Admin
                    </span>
                  )}
                  <span className="text-white/60 text-xs">
                    Member since {joinDate}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-32 bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full mx-auto bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-bold text-white mb-2">
                  {getInitials(member.displayName)}
                </div>
                <h2 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                  {member.displayName}
                  {isChild ? (
                    <Baby className="h-4 w-4 text-pink-300" />
                  ) : (
                    <User className="h-4 w-4 text-white/70" />
                  )}
                </h2>
                <div className="flex items-center justify-center gap-2 mt-1">
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-medium">
                      <Crown className="h-3 w-3" />
                      Admin
                    </span>
                  )}
                  <span className="text-white/60 text-xs">
                    Since {joinDate}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          <div className="bg-foreground/5 rounded-xl p-3 text-center">
            {getRankIcon(leaderboardPosition)}
            <p className="text-xl font-bold text-foreground mt-1">
              #{leaderboardPosition}
            </p>
            <p className="text-[10px] text-foreground/40">Rank</p>
          </div>
          <div className="bg-foreground/5 rounded-xl p-3 text-center">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 mx-auto" />
            <p className="text-xl font-bold text-foreground mt-1">
              {memberContribution?.totalCompletions ?? 0}
            </p>
            <p className="text-[10px] text-foreground/40">Total</p>
          </div>
          <div className="bg-foreground/5 rounded-xl p-3 text-center">
            <Calendar className="h-5 w-5 text-blue-400 mx-auto" />
            <p className="text-xl font-bold text-foreground mt-1">
              {memberContribution?.weeklyCompletions ?? 0}
            </p>
            <p className="text-[10px] text-foreground/40">This Week</p>
          </div>
          <div className="bg-foreground/5 rounded-xl p-3 text-center">
            <Flame className="h-5 w-5 text-orange-400 mx-auto" />
            <p className="text-xl font-bold text-foreground mt-1">
              {bestStreak}
            </p>
            <p className="text-[10px] text-foreground/40">Best Streak</p>
          </div>
        </div>

        {/* Today's Progress */}
        <div className="bg-foreground/5 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-indigo-400" />
              <span className="text-sm font-medium text-foreground">Today&apos;s Progress</span>
            </div>
            <span className="text-sm font-bold text-foreground">
              {todayCompletions}/{memberHabits.length}
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                todayCompletions === memberHabits.length && memberHabits.length > 0
                  ? 'bg-emerald-500'
                  : 'bg-indigo-500'
              )}
              style={{
                width: memberHabits.length > 0
                  ? `${(todayCompletions / memberHabits.length) * 100}%`
                  : '0%',
              }}
            />
          </div>
        </div>

        {/* Assigned Habits */}
        <div>
          <p className="text-xs font-medium text-foreground/40 uppercase tracking-wider mb-3">
            Assigned Habits ({memberHabits.length})
          </p>

          {memberHabits.length === 0 ? (
            <div className="text-center py-6 text-foreground/40 text-sm">
              No habits assigned to {member.displayName}
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {habitStats.map(({ habit, streak, isCompletedToday, totalCompletions }) => (
                <div
                  key={habit.id}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-xl',
                    isCompletedToday
                      ? 'bg-emerald-500/10 border border-emerald-500/20'
                      : 'bg-foreground/5'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        'h-6 w-6 rounded-md flex items-center justify-center flex-shrink-0',
                        isCompletedToday
                          ? 'bg-emerald-500 text-white'
                          : 'bg-foreground/10'
                      )}
                    >
                      {isCompletedToday && <CheckCircle2 className="h-4 w-4" />}
                    </div>
                    <span
                      className={cn(
                        'text-sm font-medium truncate',
                        isCompletedToday ? 'text-emerald-300' : 'text-foreground'
                      )}
                    >
                      {habit.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-foreground/50 flex-shrink-0">
                    {streak > 0 && (
                      <span className="flex items-center gap-1 text-orange-400">
                        <Flame className="h-3 w-3" />
                        {streak}
                      </span>
                    )}
                    <span>{totalCompletions} done</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </GlassModalContent>

      <GlassModalFooter>
        <button
          type="button"
          onClick={onClose}
          className="w-full px-6 py-2.5 text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors"
        >
          Close
        </button>
      </GlassModalFooter>
    </GlassModal>
  );
}
