'use client';

import { Trophy, Medal, TrendingUp } from 'lucide-react';
import { useFitStore } from '../../lib/store';

export function Leaderboard() {
  const { workouts, getCurrentSpace } = useFitStore();
  const currentSpace = getCurrentSpace();

  if (!currentSpace || currentSpace.type === 'personal') return null;

  // Aggregate stats by user
  const stats = currentSpace.members.map(member => {
    const userWorkouts = workouts.filter(w => w.userId === member.uid);
    const totalWorkouts = userWorkouts.length;
    const totalDuration = userWorkouts.reduce((acc, w) => acc + w.duration, 0);
    
    return {
      ...member,
      totalWorkouts,
      totalDuration
    };
  }).sort((a, b) => b.totalWorkouts - a.totalWorkouts);

  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2 text-orange-400 font-bold uppercase text-xs tracking-wider">
        <Trophy className="h-4 w-4" />
        Leaderboard
      </div>

      <div className="space-y-3">
        {stats.map((stat, index) => (
          <div key={stat.uid} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-white font-bold">
                  {stat.displayName.slice(0, 2).toUpperCase()}
                </div>
                {index === 0 && (
                  <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-0.5">
                    <Medal className="h-2 w-2 text-black" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{stat.displayName}</p>
                <p className="text-[10px] text-white/40">{stat.totalDuration} mins total</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm font-bold text-white">
              {stat.totalWorkouts}
              <span className="text-xs font-normal text-white/40">workouts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
