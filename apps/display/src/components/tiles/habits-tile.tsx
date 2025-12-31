'use client';

import { TileBase, TileProps } from './tile-base';
import { useAuth } from '@ainexsuite/auth';
import { useHabitsData, HabitWithStatus } from '@/hooks/use-habits-data';
import { Check, Flame, Loader2, Target } from 'lucide-react';
import { useState, useEffect } from 'react';

// Progress ring component
function ProgressRing({
  progress,
  size = 64,
  strokeWidth = 6
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-foreground/10"
      />
      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className={`transition-all duration-500 ease-out ${
          progress === 100 ? 'text-emerald-500' : 'text-teal-500'
        }`}
        style={{
          filter: progress === 100 ? 'drop-shadow(0 0 8px rgb(16 185 129 / 0.6))' : undefined,
        }}
      />
    </svg>
  );
}

// Confetti burst animation
function ConfettiBurst({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full animate-confetti"
          style={{
            left: '50%',
            top: '50%',
            backgroundColor: ['#10b981', '#14b8a6', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899'][i % 6],
            animationDelay: `${i * 50}ms`,
            '--angle': `${i * 30}deg`,
            '--distance': `${40 + (i % 3) * 20}px`,
          } as React.CSSProperties}
        />
      ))}
      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translate(-50%, -50%) rotate(0deg) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(
              calc(-50% + cos(var(--angle)) * var(--distance)),
              calc(-50% + sin(var(--angle)) * var(--distance))
            ) rotate(360deg) scale(0);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

// Habit item component
function HabitItem({
  habit,
  onToggle,
  compact = false
}: {
  habit: HabitWithStatus;
  onToggle: () => void;
  compact?: boolean;
}) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    if (isToggling) return;

    setIsToggling(true);
    if (!habit.isCompletedToday) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 800);
    }

    try {
      await onToggle();
    } finally {
      setIsToggling(false);
    }
  };

  if (compact) {
    return (
      <button
        onClick={handleToggle}
        disabled={isToggling}
        className={`relative flex items-center gap-2 w-full p-2 rounded-lg transition-all ${
          habit.isCompletedToday
            ? 'bg-emerald-500/20 border border-emerald-500/30'
            : 'bg-foreground/5 border border-transparent hover:bg-foreground/10'
        }`}
      >
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
          habit.isCompletedToday
            ? 'bg-emerald-500 border-emerald-500'
            : 'border-foreground/30'
        }`}>
          {habit.isCompletedToday && <Check className="w-3 h-3 text-white" />}
        </div>
        <span className={`text-xs flex-1 text-left truncate ${
          habit.isCompletedToday ? 'text-foreground/70 line-through' : 'text-foreground'
        }`}>
          {habit.title}
        </span>
        {habit.currentStreak > 0 && (
          <span className="text-[10px] text-orange-400 flex items-center gap-0.5">
            <Flame className="w-3 h-3" />
            {habit.currentStreak}
          </span>
        )}
        <ConfettiBurst show={showConfetti} />
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isToggling}
      className={`relative flex items-center gap-3 w-full p-3 rounded-xl transition-all ${
        habit.isCompletedToday
          ? 'bg-emerald-500/20 border border-emerald-500/30'
          : 'bg-foreground/5 border border-transparent hover:bg-foreground/10 active:scale-[0.98]'
      }`}
    >
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
        habit.isCompletedToday
          ? 'bg-emerald-500 border-emerald-500 scale-110'
          : 'border-foreground/30 hover:border-foreground/50'
      }`}>
        {isToggling ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : habit.isCompletedToday ? (
          <Check className="w-4 h-4 text-white" />
        ) : null}
      </div>
      <div className="flex-1 text-left">
        <span className={`text-sm ${
          habit.isCompletedToday ? 'text-foreground/70 line-through' : 'text-foreground'
        }`}>
          {habit.title}
        </span>
      </div>
      {habit.currentStreak > 0 && (
        <div className="flex items-center gap-1 text-orange-400">
          <Flame className="w-4 h-4" />
          <span className="text-xs font-medium">{habit.currentStreak}</span>
        </div>
      )}
      <ConfettiBurst show={showConfetti} />
    </button>
  );
}

export function HabitsTile(props: Omit<TileProps, 'title' | 'children'>) {
  const { user } = useAuth();
  const { habits, completedCount, totalCount, bestStreak, isLoading, toggleHabit } = useHabitsData(user?.uid);

  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isComplete = completedCount === totalCount && totalCount > 0;
  const [celebrateComplete, setCelebrateComplete] = useState(false);

  // Celebrate when all habits are completed
  useEffect(() => {
    if (isComplete) {
      setCelebrateComplete(true);
      const timer = setTimeout(() => setCelebrateComplete(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isComplete]);

  const isCompact = props.variant === 'small';

  return (
    <TileBase {...props} title="Habits">
      {isLoading ? (
        <div className="flex items-center justify-center h-24">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : totalCount === 0 ? (
        <div className="flex flex-col items-center justify-center h-24 text-center">
          <div className="p-3 rounded-full bg-teal-500/10 mb-2">
            <Target className="w-5 h-5 text-teal-400" />
          </div>
          <p className="text-sm font-medium text-foreground/80">No habits today</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Enjoy your free time!
          </p>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          {/* Progress header */}
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <ProgressRing progress={progress} size={isCompact ? 48 : 56} strokeWidth={isCompact ? 4 : 5} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`font-bold ${isCompact ? 'text-sm' : 'text-base'} ${
                  isComplete ? 'text-emerald-500' : 'text-foreground'
                }`}>
                  {completedCount}/{totalCount}
                </span>
              </div>
              {celebrateComplete && (
                <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
              )}
            </div>
            <div className="flex-1">
              <p className={`font-semibold ${isCompact ? 'text-xs' : 'text-sm'} ${
                isComplete ? 'text-emerald-500' : 'text-foreground'
              }`}>
                {isComplete ? 'All Done!' : `${progress}% Complete`}
              </p>
              {bestStreak > 0 && (
                <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Flame className="w-3 h-3 text-orange-400" />
                  Best streak: {bestStreak} days
                </p>
              )}
            </div>
          </div>

          {/* Habit list */}
          <div className={`flex-1 overflow-y-auto space-y-1.5 ${isCompact ? 'max-h-24' : 'max-h-36'}`}>
            {habits.slice(0, isCompact ? 3 : 5).map(habit => (
              <HabitItem
                key={habit.id}
                habit={habit}
                onToggle={() => toggleHabit(habit)}
                compact={isCompact}
              />
            ))}
            {habits.length > (isCompact ? 3 : 5) && (
              <p className="text-[10px] text-muted-foreground text-center pt-1">
                +{habits.length - (isCompact ? 3 : 5)} more habits
              </p>
            )}
          </div>
        </div>
      )}
    </TileBase>
  );
}
