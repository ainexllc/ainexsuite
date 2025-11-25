'use client';

import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface DashboardHeaderProps {
  spaceName: string;
  progress: {
    completed: number;
    total: number;
  };
}

export function DashboardHeader({ spaceName, progress }: DashboardHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  };

  const progressPercent = progress.total > 0
    ? Math.round((progress.completed / progress.total) * 100)
    : 0;

  const allDone = progress.total > 0 && progress.completed >= progress.total;

  return (
    <div className="flex items-center justify-between bg-white/5 rounded-2xl p-4 lg:p-6 border border-white/10">
      {/* Time & Date */}
      <div>
        <p className="text-3xl lg:text-4xl font-bold text-white tabular-nums">
          {formatTime(currentTime)}
        </p>
        <p className="text-sm lg:text-base text-white/50">
          {formatDate(currentTime)}
        </p>
      </div>

      {/* Space Name */}
      <div className="text-center">
        <h1 className="text-xl lg:text-2xl font-bold text-white">{spaceName}</h1>
        <p className="text-sm text-white/50">Family Habits</p>
      </div>

      {/* Progress */}
      <div className="text-right">
        <div className="flex items-center gap-3">
          {allDone && (
            <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
          )}
          <div>
            <p className="text-3xl lg:text-4xl font-bold text-white">
              {progress.completed}/{progress.total}
            </p>
            <p className="text-sm text-white/50">
              {allDone ? 'All done!' : `${progressPercent}% complete`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
