'use client';

import { useMemo } from 'react';
import { Check, Baby, User, PartyPopper } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Member, Habit, Completion } from '@/types/models';
import { getTodayDateString } from '@/lib/date-utils';

interface FamilyHabitsGridProps {
  members: Member[];
  habits: Habit[];
  completions: Completion[];
  onComplete: (habitId: string, memberId: string) => void;
  onUndoComplete: (habitId: string, memberId: string) => void;
  currentUserId: string;
  onHabitClick?: (habitId: string, memberId: string) => void;
}

export function FamilyHabitsGrid({
  members,
  habits,
  completions,
  onComplete,
  onUndoComplete,
  currentUserId: _currentUserId,
  onHabitClick,
}: FamilyHabitsGridProps) {
  const today = getTodayDateString();

  // Check if a habit is completed for a specific member today
  const isCompleted = (habitId: string, memberId: string): boolean => {
    return completions.some(
      (c) => c.habitId === habitId && c.userId === memberId && c.date === today
    );
  };

  // Check if a habit is assigned to a member
  const isAssigned = (habit: Habit, memberId: string): boolean => {
    return habit.assigneeIds.includes(memberId);
  };

  // Get completion stats for each member
  const memberStats = useMemo(() => {
    // Inline check to avoid dependency warnings
    const checkCompleted = (habitId: string, memberId: string) =>
      completions.some(
        (c) => c.habitId === habitId && c.userId === memberId && c.date === today
      );

    return members.map((member) => {
      const assignedHabits = habits.filter((h) => isAssigned(h, member.uid));
      const completedCount = assignedHabits.filter((h) =>
        checkCompleted(h.id, member.uid)
      ).length;
      const allDone = assignedHabits.length > 0 && completedCount === assignedHabits.length;
      return {
        member,
        assignedCount: assignedHabits.length,
        completedCount,
        allDone,
      };
    });
  }, [members, habits, completions, today]);

  // Handle toggle completion
  const handleToggle = (habitId: string, memberId: string) => {
    if (isCompleted(habitId, memberId)) {
      onUndoComplete(habitId, memberId);
    } else {
      onComplete(habitId, memberId);
    }
  };

  // Get member initials
  const getInitials = (name: string) => name.slice(0, 2).toUpperCase();

  if (members.length === 0) {
    return (
      <div className="text-center py-8 text-white/40">
        No family members in this space
      </div>
    );
  }

  if (habits.length === 0) {
    return (
      <div className="text-center py-8 text-white/40">
        No habits created yet
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <div
        className="grid gap-3 min-w-fit"
        style={{
          gridTemplateColumns: `repeat(${members.length}, minmax(140px, 1fr))`,
        }}
      >
        {/* Member columns */}
        {memberStats.map(({ member, assignedCount, completedCount, allDone }) => {
          const isChild = member.ageGroup === 'child';
          const assignedHabits = habits.filter((h) => isAssigned(h, member.uid));

          return (
            <div
              key={member.uid}
              className={cn(
                'flex flex-col rounded-2xl border overflow-hidden',
                allDone
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-white/5 border-white/10'
              )}
            >
              {/* Member Header with Banner Background */}
              <div
                className={cn(
                  'relative text-center border-b overflow-hidden',
                  member.photoURL ? 'py-6 px-3' : 'p-3',
                  allDone ? 'border-emerald-500/20' : 'border-white/10'
                )}
              >
                {/* Banner Background Image */}
                {member.photoURL && (
                  <>
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${member.photoURL})` }}
                    />
                    {/* Dark gradient overlay for text readability */}
                    <div className={cn(
                      'absolute inset-0',
                      allDone
                        ? 'bg-gradient-to-b from-emerald-900/70 via-emerald-900/80 to-emerald-900/90'
                        : 'bg-gradient-to-b from-black/50 via-black/60 to-black/70'
                    )} />
                  </>
                )}

                {/* Content (positioned above background) */}
                <div className="relative z-10">
                  {/* Avatar - only show if no banner image */}
                  {!member.photoURL && (
                    <div
                      className={cn(
                        'h-12 w-12 rounded-full mx-auto flex items-center justify-center text-lg font-bold shadow-lg',
                        allDone
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white'
                          : 'bg-gradient-to-br from-gray-700 to-gray-600 text-white'
                      )}
                    >
                      {getInitials(member.displayName)}
                    </div>
                  )}

                  {/* Name */}
                  <h3 className={cn(
                    'text-sm font-semibold flex items-center justify-center gap-1',
                    member.photoURL ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]' : 'text-white mt-2'
                  )}>
                    {member.displayName}
                    {isChild ? (
                      <Baby className="h-3 w-3 text-pink-400 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
                    ) : (
                      <User className="h-3 w-3 text-white/60 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
                    )}
                  </h3>

                  {/* Progress */}
                  <p
                    className={cn(
                      'text-xs mt-0.5',
                      allDone
                        ? 'text-emerald-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
                        : member.photoURL
                          ? 'text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
                          : 'text-white/50'
                    )}
                  >
                    {allDone ? (
                      <span className="flex items-center justify-center gap-1">
                        <PartyPopper className="h-3 w-3" />
                        All done!
                      </span>
                    ) : (
                      `${completedCount}/${assignedCount}`
                    )}
                  </p>
                </div>
              </div>

              {/* Habits List */}
              <div className="flex-1 p-2 space-y-1.5">
                {assignedHabits.length === 0 ? (
                  <div className="text-center py-4 text-white/30 text-xs">
                    No habits assigned
                  </div>
                ) : (
                  assignedHabits.map((habit) => {
                    const completed = isCompleted(habit.id, member.uid);
                    return (
                      <div
                        key={habit.id}
                        onClick={() => onHabitClick?.(habit.id, member.uid)}
                        className={cn(
                          'w-full flex items-center gap-2 p-2.5 rounded-xl text-left transition-all cursor-pointer',
                          completed
                            ? 'bg-emerald-500/20 border border-emerald-500/30'
                            : 'bg-white/5 border border-white/10 hover:bg-white/10'
                        )}
                      >
                        {/* Checkbox - tap to toggle completion */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggle(habit.id, member.uid);
                          }}
                          className={cn(
                            'h-5 w-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all',
                            completed
                              ? 'bg-emerald-500 text-white'
                              : 'border-2 border-white/30 hover:border-white/50'
                          )}
                        >
                          {completed && <Check className="h-3 w-3" />}
                        </button>

                        {/* Habit title - tap to open details */}
                        <span
                          className={cn(
                            'text-xs font-medium truncate flex-1',
                            completed ? 'text-emerald-300 line-through' : 'text-white'
                          )}
                        >
                          {habit.title}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
