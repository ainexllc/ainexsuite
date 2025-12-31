'use client';

import { useState } from 'react';
import { Trophy, ChevronRight, Lock } from 'lucide-react';
import { Habit, Completion, ComputedAchievement } from '@/types/models';
import { computeAchievements, getAchievementStats, getNextAchievements } from '@/lib/achievements';
import { cn } from '@/lib/utils';

interface AchievementBadgesProps {
  habits: Habit[];
  completions: Completion[];
  variant?: 'compact' | 'full';
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

  if (variant === 'compact') {
    return (
      <div className="bg-foreground/5 border border-border rounded-xl p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            <h3 className="font-semibold text-foreground">Achievements</h3>
          </div>
          <span className="text-sm text-muted-foreground">
            {stats.unlocked}/{stats.total}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-foreground/10 rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full transition-all duration-500"
            style={{ width: `${stats.percentage}%` }}
          />
        </div>

        {/* Unlocked badges */}
        {unlockedAchievements.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-3">
            {unlockedAchievements.slice(0, 6).map((achievement) => (
              <AchievementBadge key={achievement.milestone.id} achievement={achievement} size="sm" />
            ))}
            {unlockedAchievements.length > 6 && (
              <button
                onClick={() => setShowAll(true)}
                className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                +{unlockedAchievements.length - 6} more
                <ChevronRight className="h-3 w-3" />
              </button>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mb-3">
            Complete habits to unlock achievements!
          </p>
        )}

        {/* Next achievement preview */}
        {nextAchievements.length > 0 && (
          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Next up:</p>
            <div className="flex gap-2">
              {nextAchievements.slice(0, 2).map((achievement) => (
                <NextAchievementCard key={achievement.milestone.id} achievement={achievement} />
              ))}
            </div>
          </div>
        )}
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
          'group relative flex items-center justify-center h-10 w-10 rounded-full transition-all',
          unlocked
            ? 'bg-gradient-to-br from-yellow-500/20 to-amber-500/20 hover:scale-110'
            : 'bg-foreground/5 opacity-40'
        )}
        title={`${milestone.title}: ${milestone.description}`}
      >
        <span className="text-lg">{milestone.icon}</span>
        {unlocked && (
          <div
            className="absolute inset-0 rounded-full"
            style={{ boxShadow: `0 0 0 2px ${milestone.color}` }}
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

  return (
    <div className="flex-1 flex items-center gap-3 p-2 rounded-lg bg-foreground/5">
      <div
        className="h-8 w-8 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${milestone.color}20` }}
      >
        <span className="text-sm">{milestone.icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground truncate">{milestone.title}</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 bg-foreground/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${progressPercent}%`, backgroundColor: milestone.color }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground">
            {progress}/{milestone.threshold}
          </span>
        </div>
      </div>
    </div>
  );
}
