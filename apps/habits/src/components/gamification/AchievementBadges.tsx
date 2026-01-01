'use client';

import { useState } from 'react';
import { Trophy, ChevronRight, Lock } from 'lucide-react';
import { Habit, Completion, ComputedAchievement } from '@/types/models';
import { computeAchievements, getAchievementStats, getNextAchievements } from '@/lib/achievements';
import { cn } from '@/lib/utils';

interface AchievementBadgesProps {
  habits: Habit[];
  completions: Completion[];
  variant?: 'compact' | 'full' | 'mini';
}

export function AchievementBadges({
  habits,
  completions,
  variant = 'compact',
}: AchievementBadgesProps) {
  const [, setShowAll] = useState(false);

  const achievements = computeAchievements(habits, completions);
  const stats = getAchievementStats(habits, completions);
  const nextAchievements = getNextAchievements(habits, completions);
  const unlockedAchievements = achievements.filter(a => a.unlocked);

  // Mini variant - ultra compact for mobile
  if (variant === 'mini') {
    return (
      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
        <div className="p-2.5 flex items-center justify-between gap-3">
          {/* Left: Icon and title */}
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-amber-500/20">
              <Trophy className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <span className="text-xs font-bold text-white">Achievements</span>
          </div>

          {/* Center: Progress bar */}
          <div className="flex-1 max-w-[120px]">
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
          </div>

          {/* Right: Stats and badges */}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1">
              {unlockedAchievements.slice(0, 3).map((achievement) => (
                <div
                  key={achievement.milestone.id}
                  className="h-6 w-6 rounded-full bg-gradient-to-br from-yellow-500/20 to-amber-500/20 flex items-center justify-center ring-1 ring-black"
                >
                  <span className="text-xs">{achievement.milestone.icon}</span>
                </div>
              ))}
            </div>
            <span className="text-xs font-medium text-amber-400 tabular-nums">
              {stats.unlocked}/{stats.total}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="p-3 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20">
              <Trophy className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">Achievements</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-white/80">{stats.unlocked}</span>
            <span className="text-sm text-white/40">/{stats.total}</span>
          </div>
        </div>

        <div className="p-3 space-y-3">
          {/* Progress bar with percentage */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-white/50">Progress</span>
              <span className="text-[10px] font-medium text-amber-400">{stats.percentage}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full transition-all duration-500 relative"
                style={{ width: `${stats.percentage}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Unlocked badges - horizontal scroll on mobile */}
          {unlockedAchievements.length > 0 ? (
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {unlockedAchievements.slice(0, 8).map((achievement) => (
                <AchievementBadge key={achievement.milestone.id} achievement={achievement} size="sm" />
              ))}
              {unlockedAchievements.length > 8 && (
                <button
                  onClick={() => setShowAll(true)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] text-white/50 bg-white/5 hover:bg-white/10 hover:text-white transition-colors flex-shrink-0"
                >
                  +{unlockedAchievements.length - 8}
                  <ChevronRight className="h-2.5 w-2.5" />
                </button>
              )}
            </div>
          ) : (
            <p className="text-xs text-white/40">
              Complete habits to unlock!
            </p>
          )}

          {/* Next achievement preview - single row */}
          {nextAchievements.length > 0 && (
            <div className="pt-2 border-t border-white/10">
              <p className="text-[10px] text-white/40 uppercase tracking-wide mb-2">Next up:</p>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {nextAchievements.slice(0, 2).map((achievement) => (
                  <NextAchievementCard key={achievement.milestone.id} achievement={achievement} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full variant - shows all achievements
  return (
    <div className="space-y-6">
      {/* Stats header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
            <Trophy className="h-6 w-6 text-yellow-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Achievements</h2>
            <p className="text-sm text-muted-foreground">
              {stats.unlocked} of {stats.total} unlocked ({stats.percentage}%)
            </p>
          </div>
        </div>
      </div>

      {/* All achievements grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {achievements.map((achievement) => (
          <AchievementBadge
            key={achievement.milestone.id}
            achievement={achievement}
            size="lg"
            showProgress
          />
        ))}
      </div>
    </div>
  );
}

interface AchievementBadgeProps {
  achievement: ComputedAchievement;
  size?: 'sm' | 'lg';
  showProgress?: boolean;
}

function AchievementBadge({ achievement, size = 'sm', showProgress }: AchievementBadgeProps) {
  const { milestone, progress, unlocked } = achievement;

  if (size === 'sm') {
    return (
      <div
        className={cn(
          'group relative flex items-center justify-center h-8 w-8 rounded-full transition-all flex-shrink-0',
          unlocked
            ? 'bg-gradient-to-br from-yellow-500/20 to-amber-500/20 hover:scale-110'
            : 'bg-foreground/5 opacity-40'
        )}
        title={`${milestone.title}: ${milestone.description}`}
      >
        <span className="text-sm">{milestone.icon}</span>
        {unlocked && (
          <div
            className="absolute inset-0 rounded-full"
            style={{ boxShadow: `0 0 0 1.5px ${milestone.color}` }}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative flex flex-col items-center p-4 rounded-xl border transition-all',
        unlocked
          ? 'bg-foreground/5 border-border hover:border-yellow-500/30'
          : 'bg-foreground/[0.02] border-border/50 opacity-60'
      )}
    >
      {/* Badge icon */}
      <div
        className={cn(
          'h-14 w-14 rounded-full flex items-center justify-center mb-3 transition-all',
          unlocked ? 'bg-gradient-to-br from-yellow-500/20 to-amber-500/20' : 'bg-foreground/5'
        )}
        style={unlocked ? { boxShadow: `0 0 20px ${milestone.color}33` } : undefined}
      >
        {unlocked ? (
          <span className="text-2xl">{milestone.icon}</span>
        ) : (
          <Lock className="h-5 w-5 text-muted-foreground" />
        )}
      </div>

      {/* Title & description */}
      <h4 className="text-sm font-medium text-center text-foreground mb-1">{milestone.title}</h4>
      <p className="text-xs text-muted-foreground text-center">{milestone.description}</p>

      {/* Progress */}
      {showProgress && !unlocked && (
        <div className="w-full mt-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{progress}</span>
            <span>{milestone.threshold}</span>
          </div>
          <div className="h-1.5 bg-foreground/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, (progress / milestone.threshold) * 100)}%`,
                backgroundColor: milestone.color,
              }}
            />
          </div>
        </div>
      )}

      {/* Tier badge */}
      {unlocked && (
        <div
          className="absolute top-2 right-2 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded"
          style={{ backgroundColor: `${milestone.color}20`, color: milestone.color }}
        >
          {milestone.tier}
        </div>
      )}
    </div>
  );
}

interface NextAchievementCardProps {
  achievement: ComputedAchievement;
}

function NextAchievementCard({ achievement }: NextAchievementCardProps) {
  const { milestone, progress } = achievement;
  const progressPercent = Math.min(100, (progress / milestone.threshold) * 100);
  const isNearComplete = progressPercent >= 75;

  return (
    <div className={cn(
      "flex items-center gap-2 p-2 rounded-lg border transition-all min-w-[160px] flex-shrink-0",
      isNearComplete
        ? "bg-amber-500/5 border-amber-500/20"
        : "bg-white/5 border-white/10"
    )}>
      <div
        className={cn(
          "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0",
          isNearComplete && "ring-1 ring-amber-500/30"
        )}
        style={{ backgroundColor: `${milestone.color}20` }}
      >
        <span className="text-sm">{milestone.icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium text-white truncate mb-1">{milestone.title}</p>
        <div className="flex items-center gap-1.5">
          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%`, backgroundColor: milestone.color }}
            />
          </div>
          <span className="text-[9px] text-white/50 tabular-nums flex-shrink-0">
            {progress}/{milestone.threshold}
          </span>
        </div>
      </div>
    </div>
  );
}
