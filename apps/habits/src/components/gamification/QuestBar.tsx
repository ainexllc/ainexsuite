'use client';

import { Crown, Gift, Star } from 'lucide-react';
import { Quest } from '../../types/models';
import { cn } from '../../lib/utils';
import { Hint, HINTS } from '../hints';

interface QuestBarProps {
  quest: Quest;
  compact?: boolean;
  /** Show hint for first-time users */
  showHint?: boolean;
}

export function QuestBar({ quest, compact = false, showHint = false }: QuestBarProps) {
  const progress = Math.min((quest.currentCompletions / quest.targetTotalCompletions) * 100, 100);
  const isNearComplete = progress >= 75;
  const isComplete = progress >= 100;

  if (compact) {
    return (
      <Hint hint={HINTS.QUESTS} showWhen={showHint}>
        <div className={cn(
        "relative flex items-center gap-3 p-2.5 rounded-2xl bg-[#1a1a1a] border transition-all",
        isComplete ? "border-yellow-500/50" : isNearComplete ? "border-yellow-500/30" : "border-white/10"
      )}>
        {/* Icon */}
        <div className={cn(
          "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0",
          isComplete ? "bg-yellow-500/30 text-yellow-300" : "bg-yellow-500/20 text-yellow-400"
        )}>
          <Crown className="h-4 w-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
              {quest.title}
              {isComplete && (
                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />
              )}
            </h3>
            <span className={cn(
              "text-xs font-bold tabular-nums flex-shrink-0",
              isComplete ? "text-yellow-300" : "text-yellow-400/80"
            )}>
              {Math.round(progress)}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-500",
                isComplete
                  ? "bg-gradient-to-r from-yellow-500 to-yellow-300"
                  : "bg-gradient-to-r from-yellow-600 to-yellow-400"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Reward badge (hidden on very small screens) */}
        {quest.reward && (
          <div className={cn(
            "hidden sm:flex items-center gap-1 px-2 py-1 rounded-full text-[10px] flex-shrink-0",
            isComplete ? "bg-yellow-500/20 text-yellow-200" : "bg-white/5 text-yellow-200/80"
          )}>
            <Gift className="h-3 w-3" />
            <span className="max-w-[60px] truncate">{quest.reward}</span>
          </div>
        )}
        </div>
      </Hint>
    );
  }

  return (
    <Hint hint={HINTS.QUESTS} showWhen={showHint}>
      <div className={cn(
      "relative overflow-hidden rounded-2xl bg-[#1a1a1a] border transition-all",
      isComplete ? "border-yellow-500/50 shadow-yellow-500/20" : isNearComplete ? "border-yellow-500/30" : "border-white/10"
    )}>
      {/* Glow effect when near complete */}
      {isNearComplete && !isComplete && (
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/5 to-yellow-500/0 animate-pulse" />
      )}

      <div className="relative z-10 p-3">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={cn(
              "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-inner transition-all",
              isComplete ? "bg-yellow-500/30 text-yellow-300 ring-2 ring-yellow-500/50" : "bg-yellow-500/20 text-yellow-400"
            )}>
              <Crown className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="truncate">{quest.title}</span>
                {isComplete && (
                  <span className="flex items-center gap-0.5 text-[9px] bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded-full flex-shrink-0">
                    <Star className="h-2.5 w-2.5 fill-current" />
                    Done!
                  </span>
                )}
              </h3>
              <p className="text-[10px] text-white/50 truncate">{quest.description}</p>
            </div>
          </div>
          {quest.reward && (
            <div className={cn(
              "hidden xs:flex items-center gap-1 px-2 py-1 rounded-full text-[10px] flex-shrink-0",
              isComplete ? "bg-yellow-500/20 border border-yellow-500/30 text-yellow-200" : "bg-white/5 border border-white/5 text-yellow-200/80"
            )}>
              <Gift className="h-3 w-3" />
              <span className="max-w-[80px] truncate">{quest.reward}</span>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="relative h-2.5 bg-black/40 rounded-full overflow-hidden">
          <div
            className={cn(
              "absolute top-0 left-0 h-full transition-all duration-1000 ease-out",
              isComplete
                ? "bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-300 shadow-[0_0_15px_rgba(234,179,8,0.5)]"
                : "bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-200"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between items-center mt-1.5">
          <span className="text-[10px] text-white/40 tabular-nums">{quest.currentCompletions} / {quest.targetTotalCompletions}</span>
          <span className={cn(
            "text-xs font-bold tabular-nums",
            isComplete ? "text-yellow-300" : isNearComplete ? "text-yellow-400" : "text-yellow-400/80"
          )}>
            {Math.round(progress)}%
          </span>
        </div>
        </div>
      </div>
    </Hint>
  );
}
