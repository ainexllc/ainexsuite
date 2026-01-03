'use client';

import { useState, useMemo } from 'react';
import {
  Flame,
  Trophy,
  Calendar,
  Edit3,
  Trash2,
  Snowflake,
  Sun,
  CheckCircle2,
  XCircle,
  MoreVertical,
} from 'lucide-react';
import { GlassModal, GlassModalContent, GlassModalFooter, ConfirmationDialog } from '@ainexsuite/ui';
import { Habit, Completion, Member } from '@/types/models';
import { cn } from '@/lib/utils';
import { getHabitStatus, getDateString } from '@/lib/date-utils';

interface HabitDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: Habit | null;
  completions: Completion[];
  member?: Member | null; // For family view - show member-specific stats
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => Promise<void>;
  onToggleFreeze: (habitId: string, currentStatus: boolean) => Promise<void>;
}

const FREQUENCY_LABELS: Record<string, string> = {
  daily: 'Every day',
  specific_days: 'Specific days',
  weekly: 'Weekly goal',
  interval: 'Every X days',
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function HabitDetailModal({
  isOpen,
  onClose,
  habit,
  completions,
  member,
  onEdit,
  onDelete,
  onToggleFreeze,
}: HabitDetailModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isFreezing, setIsFreezing] = useState(false);

  // Filter completions by habit and optionally by member
  const habitCompletions = useMemo(() => {
    if (!habit) return [];
    let filtered = completions.filter((c) => c.habitId === habit.id);
    // If viewing for a specific member, filter by their userId
    if (member) {
      filtered = filtered.filter((c) => c.userId === member.uid);
    }
    return filtered;
  }, [habit, completions, member]);

  const status = useMemo(() => {
    if (!habit) return null;
    return getHabitStatus(habit, habitCompletions);
  }, [habit, habitCompletions]);

  // Can be used for recent completion list if needed
  // const recentCompletions = useMemo(() => {
  //   return habitCompletions
  //     .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  //     .slice(0, 7);
  // }, [habitCompletions]);

  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = getDateString(date);
      days.push({
        date: dateStr,
        dayName: DAY_NAMES[date.getDay()],
        completed: habitCompletions.some((c) => c.date === dateStr),
      });
    }
    return days;
  }, [habitCompletions]);

  // Calculate member-specific streaks from their completions
  const memberStats = useMemo(() => {
    if (!member || habitCompletions.length === 0) {
      return null;
    }

    // Sort completions by date descending
    const sortedDates = [...new Set(habitCompletions.map(c => c.date))].sort().reverse();

    // Calculate current streak (consecutive days ending today or yesterday)
    let currentStreak = 0;
    const today = getDateString(new Date());
    const yesterday = getDateString(new Date(Date.now() - 86400000));

    if (sortedDates.length > 0) {
      const lastDate = sortedDates[0];
      // Only count streak if last completion is today or yesterday
      if (lastDate === today || lastDate === yesterday) {
        currentStreak = 1;
        const checkDate = new Date(lastDate);

        for (let i = 1; i < sortedDates.length; i++) {
          checkDate.setDate(checkDate.getDate() - 1);
          const expectedDate = getDateString(checkDate);
          if (sortedDates[i] === expectedDate) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    // Calculate best streak
    let bestStreak = 0;
    let tempStreak = 1;
    const ascDates = [...sortedDates].reverse();

    for (let i = 1; i < ascDates.length; i++) {
      const prevDate = new Date(ascDates[i - 1]);
      const currDate = new Date(ascDates[i]);
      const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / 86400000);

      if (diffDays === 1) {
        tempStreak++;
      } else {
        bestStreak = Math.max(bestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    bestStreak = Math.max(bestStreak, tempStreak);

    return { currentStreak, bestStreak };
  }, [member, habitCompletions]);

  if (!habit) return null;

  const handleDelete = async () => {
    await onDelete(habit.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleToggleFreeze = async () => {
    setIsFreezing(true);
    try {
      await onToggleFreeze(habit.id, habit.isFrozen);
      setShowMenu(false);
    } finally {
      setIsFreezing(false);
    }
  };

  const handleEdit = () => {
    setShowMenu(false);
    onEdit(habit);
  };

  const getScheduleDescription = () => {
    switch (habit.schedule.type) {
      case 'daily':
        return 'Every day';
      case 'specific_days':
        return habit.schedule.daysOfWeek
          ?.map((d) => DAY_NAMES[d])
          .join(', ');
      case 'weekly':
        return `${habit.schedule.timesPerWeek}x per week`;
      case 'interval':
        return `Every ${habit.schedule.intervalDays} days`;
      default:
        return FREQUENCY_LABELS[habit.schedule.type];
    }
  };

  return (
    <>
      <GlassModal isOpen={isOpen} onClose={onClose} size="md" variant="frosted">
        <GlassModalContent>
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {habit.isFrozen && (
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium flex items-center gap-1">
                  <Snowflake className="h-3 w-3" />
                  Frozen
                </span>
              )}
              {status === 'completed' && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                  Done today
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-foreground">{habit.title}</h2>
            {member && (
              <p className="text-sm text-primary font-medium mt-0.5">
                {member.displayName}&apos;s Progress
              </p>
            )}
            {habit.description && (
              <p className="text-sm text-muted-foreground mt-1">{habit.description}</p>
            )}
          </div>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg hover:bg-foreground/5 text-foreground/40 hover:text-muted-foreground transition-colors"
            >
              <MoreVertical className="h-5 w-5" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-20 w-48 bg-foreground border border-border rounded-xl shadow-xl overflow-hidden">
                  <button
                    onClick={handleEdit}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:bg-foreground/5 hover:text-foreground transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit Habit
                  </button>
                  <button
                    onClick={handleToggleFreeze}
                    disabled={isFreezing}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:bg-foreground/5 hover:text-foreground transition-colors disabled:opacity-50"
                  >
                    {habit.isFrozen ? (
                      <>
                        <Sun className="h-4 w-4" />
                        Unfreeze Streak
                      </>
                    ) : (
                      <>
                        <Snowflake className="h-4 w-4" />
                        Freeze Streak
                      </>
                    )}
                  </button>
                  <div className="border-t border-border" />
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowDeleteConfirm(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Habit
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats - use member-specific stats when viewing for a member */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-foreground/5 rounded-xl p-4 text-center">
            <Flame className="h-5 w-5 text-orange-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">
              {memberStats?.currentStreak ?? habit.currentStreak}
            </p>
            <p className="text-xs text-foreground/40">Current Streak</p>
          </div>
          <div className="bg-foreground/5 rounded-xl p-4 text-center">
            <Trophy className="h-5 w-5 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">
              {memberStats?.bestStreak ?? habit.bestStreak}
            </p>
            <p className="text-xs text-foreground/40">Best Streak</p>
          </div>
          <div className="bg-foreground/5 rounded-xl p-4 text-center">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{habitCompletions.length}</p>
            <p className="text-xs text-foreground/40">Total Done</p>
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-foreground/5 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-indigo-400" />
            <span className="text-sm font-medium text-foreground">Schedule</span>
          </div>
          <p className="text-sm text-muted-foreground">{getScheduleDescription()}</p>
        </div>

        {/* Last 7 Days */}
        <div className="mb-6">
          <p className="text-xs font-medium text-foreground/40 uppercase tracking-wider mb-3">
            Last 7 Days
          </p>
          <div className="flex gap-2">
            {last7Days.map((day) => (
              <div key={day.date} className="flex-1 text-center">
                <div
                  className={cn(
                    'h-10 w-full rounded-lg flex items-center justify-center mb-1',
                    day.completed
                      ? 'bg-emerald-500/20'
                      : 'bg-foreground/5'
                  )}
                >
                  {day.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-foreground/20" />
                  )}
                </div>
                <p className="text-[10px] text-foreground/40">{day.dayName}</p>
              </div>
            ))}
          </div>
        </div>
        </GlassModalContent>

        {/* Actions */}
        <GlassModalFooter className="justify-between">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-2 text-sm font-medium text-ink-700 dark:text-white bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleEdit}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-2 text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors shadow-lg"
          >
            <Edit3 className="h-4 w-4" />
            Edit
          </button>
        </GlassModalFooter>
      </GlassModal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Habit?"
        description={`"${habit.title}" and all its completion history will be permanently deleted. This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </>
  );
}
