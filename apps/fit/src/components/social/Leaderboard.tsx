'use client';

import { Trophy, Medal } from 'lucide-react';
import { useFitStore } from '../../lib/store';
import { Member, Workout } from '../../types/models';
import { SectionHeader } from '@ainexsuite/ui';

export function Leaderboard() {
  const { workouts, getCurrentSpace } = useFitStore();
  const currentSpace = getCurrentSpace();

  if (!currentSpace || currentSpace.type === 'personal') return null;

  // Aggregate stats by user
  const stats = currentSpace.members.map((member: Member) => {
    const userWorkouts = workouts.filter((w: Workout) => w.userId === member.uid);
    const totalWorkouts = userWorkouts.length;
    const totalDuration = userWorkouts.reduce((acc: number, w: Workout) => acc + w.duration, 0);
    
    return {
      ...member,
      totalWorkouts,
      totalDuration
    };
  }).sort((a: { totalWorkouts: number }, b: { totalWorkouts: number }) => b.totalWorkouts - a.totalWorkouts);

  return (
    <div className="bg-background/60 border border-border rounded-xl p-4 space-y-4">
      <SectionHeader
        title="Leaderboard"
        icon={<Trophy className="h-4 w-4" />}
        variant="small"
      />

      <div className="space-y-3">
        {stats.map((stat: Member & { totalWorkouts: number; totalDuration: number }, index: number) => (
          <div key={stat.uid} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-8 w-8 rounded-full bg-foreground/10 flex items-center justify-center text-xs text-foreground font-bold">
                  {stat.displayName.slice(0, 2).toUpperCase()}
                </div>
                {index === 0 && (
                  <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-0.5">
                    <Medal className="h-2 w-2 text-black" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{stat.displayName}</p>
                <p className="text-[10px] text-muted-foreground">{stat.totalDuration} mins total</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm font-bold text-foreground">
              {stat.totalWorkouts}
              <span className="text-xs font-normal text-muted-foreground">workouts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
