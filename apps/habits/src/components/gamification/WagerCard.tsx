'use client';

import { Flame } from 'lucide-react';
import { Habit } from '../../types/models';

interface WagerCardProps {
  habit: Habit;
}

export function WagerCard({ habit }: WagerCardProps) {
  if (!habit.wager || !habit.wager.isActive) return null;

  const { description, targetStreak } = habit.wager;
  const progress = Math.min((habit.currentStreak / targetStreak) * 100, 100);

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-900/40 to-red-900/40 border border-orange-500/30 p-4">
      {/* Background Glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/20 blur-3xl rounded-full pointer-events-none" />

      <div className="flex items-start justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400">
            <Flame className="h-4 w-4 animate-pulse" />
          </div>
          <span className="text-xs font-bold text-orange-200 uppercase tracking-wider">Active Wager</span>
        </div>
        <div className="text-xs text-orange-300/60 bg-black/20 px-2 py-1 rounded-full">
          Target: {targetStreak} days
        </div>
      </div>

      <h4 className="text-lg font-bold text-white mb-1 relative z-10">&quot;{description}&quot;</h4>
      
      {/* Progress Bar */}
      <div className="mt-4 relative z-10">
        <div className="flex justify-between text-xs text-orange-200/60 mb-1">
          <span>Progress</span>
          <span>{habit.currentStreak} / {targetStreak}</span>
        </div>
        <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
