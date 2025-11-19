'use client';

import { Clock, Dumbbell, User } from 'lucide-react';
import { useFitStore } from '../../lib/store';
import { formatDistanceToNow } from 'date-fns';

export function SharedWorkoutFeed() {
  const { workouts, getCurrentSpace } = useFitStore();
  const currentSpace = getCurrentSpace();

  if (!currentSpace) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider">
        Recent Activity
      </h3>
      
      <div className="space-y-3">
        {workouts.map((workout) => {
          const user = currentSpace.members.find(m => m.uid === workout.userId);
          
          return (
            <div key={workout.id} className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white">
                    {user?.displayName.slice(0, 2).toUpperCase() || <User className="h-3 w-3" />}
                  </div>
                  <span className="text-xs text-white/60">
                    {user?.displayName || 'Unknown'} • {formatDistanceToNow(new Date(workout.date), { addSuffix: true })}
                  </span>
                </div>
              </div>

              <h4 className="text-base font-bold text-white mb-1">{workout.title}</h4>
              
              <div className="flex gap-4 text-xs text-white/40 mb-3">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {workout.duration} min
                </div>
                <div className="flex items-center gap-1">
                  <Dumbbell className="h-3 w-3" />
                  {workout.exercises.length} exercises
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {workout.exercises.slice(0, 3).map((ex, i) => (
                  <span key={i} className="px-2 py-1 rounded-md bg-white/5 text-[10px] text-white/60">
                    {ex.name}
                  </span>
                ))}
                {workout.exercises.length > 3 && (
                  <span className="px-2 py-1 rounded-md bg-white/5 text-[10px] text-white/40">
                    +{workout.exercises.length - 3} more
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {workouts.length === 0 && (
          <div className="text-center py-8 text-white/30 text-xs">
            No workouts logged yet. Be the first!
          </div>
        )}
      </div>
    </div>
  );
}
