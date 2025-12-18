'use client';

import { Member, Habit } from '@/types/models';
import { TouchHabitCard } from './TouchHabitCard';
import { Baby, User, PartyPopper } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FamilyMemberColumnProps {
  member: Member;
  habits: Habit[];
  isCompleted: (habitId: string) => boolean;
  onComplete: (habitId: string) => void;
  onUndoComplete: (habitId: string) => void;
}

export function FamilyMemberColumn({
  member,
  habits,
  isCompleted,
  onComplete,
  onUndoComplete,
}: FamilyMemberColumnProps) {
  const completedCount = habits.filter((h) => isCompleted(h.id)).length;
  const allDone = habits.length > 0 && completedCount === habits.length;
  const isChild = member.ageGroup === 'child';

  return (
    <div className="flex flex-col h-full bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
      {/* Member Header */}
      <div className={cn(
        'p-4 lg:p-5 text-center border-b',
        allDone ? 'bg-emerald-500/10 border-emerald-500/20' : 'border-white/10'
      )}>
        {/* Avatar */}
        <div className={cn(
          'h-16 w-16 lg:h-20 lg:w-20 rounded-full mx-auto flex items-center justify-center text-2xl lg:text-3xl font-bold',
          allDone
            ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white'
            : 'bg-gradient-to-br from-gray-700 to-gray-600 text-white'
        )}>
          {member.displayName.slice(0, 2).toUpperCase()}
        </div>

        {/* Name */}
        <h2 className="text-lg lg:text-xl font-bold text-white mt-3 flex items-center justify-center gap-2">
          {member.displayName}
          {isChild ? (
            <Baby className="h-4 w-4 text-pink-400" />
          ) : (
            <User className="h-4 w-4 text-white/40" />
          )}
        </h2>

        {/* Progress */}
        <p className={cn(
          'text-sm mt-1',
          allDone ? 'text-emerald-400' : 'text-white/50'
        )}>
          {allDone ? (
            <span className="flex items-center justify-center gap-1">
              <PartyPopper className="h-4 w-4" />
              All done!
            </span>
          ) : (
            `${completedCount}/${habits.length} done`
          )}
        </p>
      </div>

      {/* Habits List */}
      <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-3">
        {habits.length === 0 ? (
          <div className="h-full flex items-center justify-center text-white/30 text-center p-4">
            <p>No habits assigned</p>
          </div>
        ) : (
          habits.map((habit) => (
            <TouchHabitCard
              key={habit.id}
              habit={habit}
              isCompleted={isCompleted(habit.id)}
              onComplete={() => onComplete(habit.id)}
              onUndoComplete={() => onUndoComplete(habit.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
