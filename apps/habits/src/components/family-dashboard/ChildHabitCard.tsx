'use client';

import { useState, useCallback } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { Habit, CHILD_ACHIEVEMENTS, STICKER_COLLECTION } from '@/types/models';
import { cn } from '@/lib/utils';

interface ChildHabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  onComplete: () => void;
  onUndoComplete: () => void;
  /** Total completions for this member (for achievement tracking) */
  totalCompletions?: number;
  /** Callback when celebration should show */
  onCelebrate?: (achievement?: { name: string; icon: string }) => void;
}

// Get a random sticker based on probability weights
function getRandomSticker() {
  const weights = { common: 60, rare: 25, epic: 12, legendary: 3 };
  const roll = Math.random() * 100;

  let rarity: 'common' | 'rare' | 'epic' | 'legendary';
  if (roll < weights.legendary) rarity = 'legendary';
  else if (roll < weights.legendary + weights.epic) rarity = 'epic';
  else if (roll < weights.legendary + weights.epic + weights.rare) rarity = 'rare';
  else rarity = 'common';

  const stickersOfRarity = STICKER_COLLECTION.filter((s) => s.rarity === rarity);
  return stickersOfRarity[Math.floor(Math.random() * stickersOfRarity.length)];
}

export function ChildHabitCard({
  habit,
  isCompleted,
  onComplete,
  onUndoComplete,
  totalCompletions = 0,
  onCelebrate,
}: ChildHabitCardProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [earnedSticker, setEarnedSticker] = useState<{ emoji: string; name: string } | null>(null);

  const handleTap = useCallback(() => {
    if (isCompleted) {
      onUndoComplete();
      return;
    }

    // Trigger animations
    setIsAnimating(true);
    setShowConfetti(true);
    onComplete();

    // Check for achievements (next completion)
    const nextTotal = totalCompletions + 1;
    const achievement = CHILD_ACHIEVEMENTS.find((a) => a.threshold === nextTotal);

    if (achievement) {
      // Major achievement - trigger celebration
      onCelebrate?.({ name: achievement.name, icon: achievement.icon });
    } else if (Math.random() < 0.3) {
      // 30% chance to earn a sticker on regular completion
      const sticker = getRandomSticker();
      setEarnedSticker({ emoji: sticker.emoji, name: sticker.name });
      setTimeout(() => setEarnedSticker(null), 2000);
    }

    // Reset animations
    setTimeout(() => setIsAnimating(false), 800);
    setTimeout(() => setShowConfetti(false), 1200);
  }, [isCompleted, onComplete, onUndoComplete, totalCompletions, onCelebrate]);

  // Extract emoji from habit title if present
  const emojiMatch = habit.title.match(/^(\p{Emoji})/u);
  const habitEmoji = emojiMatch ? emojiMatch[1] : '✨';
  const habitTitle = habit.title.replace(/^(\p{Emoji}\s*)/u, '');

  return (
    <button
      onClick={handleTap}
      className={cn(
        // Base styles - EXTRA large touch targets for kids (100px+)
        'w-full min-h-[100px] lg:min-h-[110px] p-4 rounded-3xl border-3 transition-all duration-300',
        // Touch feedback - more pronounced for kids
        'active:scale-[0.95] select-none',
        // States with more vibrant colors
        isCompleted
          ? 'bg-gradient-to-br from-emerald-400/30 to-green-500/30 border-emerald-400/60'
          : 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-white/20 hover:from-indigo-500/20 hover:to-purple-500/20 hover:border-white/30',
        // Animation states
        isAnimating && 'animate-bounce-once scale-105',
        showConfetti && 'ring-4 ring-yellow-400/50'
      )}
      style={{
        boxShadow: isCompleted
          ? '0 4px 20px rgba(16, 185, 129, 0.3)'
          : '0 4px 15px rgba(99, 102, 241, 0.15)',
      }}
    >
      <div className="flex items-center gap-4 relative">
        {/* Large Animated Checkbox/Emoji */}
        <div
          className={cn(
            'h-16 w-16 lg:h-18 lg:w-18 rounded-2xl flex-shrink-0 flex items-center justify-center transition-all duration-500 text-3xl lg:text-4xl',
            isCompleted
              ? 'bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-lg shadow-emerald-500/30'
              : 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-2 border-dashed border-white/30',
            isAnimating && 'animate-spin-once'
          )}
        >
          {isCompleted ? (
            <Check className="h-9 w-9 lg:h-10 lg:w-10" strokeWidth={3.5} />
          ) : (
            <span className="select-none">{habitEmoji}</span>
          )}
        </div>

        {/* Habit Title - Large and readable for kids */}
        <div className="flex-1 text-left">
          <p
            className={cn(
              'text-xl lg:text-2xl font-bold tracking-tight',
              isCompleted
                ? 'text-emerald-300 line-through decoration-2'
                : 'text-foreground'
            )}
          >
            {habitTitle}
          </p>
          {habit.targetValue && habit.targetUnit && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-sm lg:text-base text-muted-foreground">
                {habit.targetValue} {habit.targetUnit}
              </span>
            </div>
          )}
        </div>

        {/* Completion sparkle effect */}
        {isCompleted && (
          <div className="absolute -top-1 -right-1 animate-pulse">
            <Sparkles className="h-6 w-6 text-yellow-400" />
          </div>
        )}

        {/* Confetti particles */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <span
                key={i}
                className="absolute animate-confetti-particle"
                style={{
                  left: `${50 + (Math.random() - 0.5) * 60}%`,
                  top: '50%',
                  fontSize: '1.5rem',
                  animationDelay: `${i * 50}ms`,
                }}
              >
                {['🌟', '⭐', '✨', '🎉', '🎊', '💫', '🔥', '💪'][i]}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Earned sticker popup */}
      {earnedSticker && (
        <div className="absolute -top-2 -right-2 animate-sticker-pop bg-white dark:bg-zinc-800 rounded-full p-2 shadow-xl border-2 border-yellow-400">
          <div className="flex items-center gap-1">
            <span className="text-2xl">{earnedSticker.emoji}</span>
            <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400 pr-1">
              +1!
            </span>
          </div>
        </div>
      )}
    </button>
  );
}
