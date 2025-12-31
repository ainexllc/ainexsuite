'use client';

import { useMemo } from 'react';
import { Trophy, Users, Flame, Clock, Check, Star } from 'lucide-react';
import Image from 'next/image';
import type { FamilyChallenge, Member } from '@/types/models';
import { cn } from '@/lib/utils';

interface FamilyChallengeCardProps {
  challenge: FamilyChallenge;
  members: Member[];
  onComplete?: () => void;
}

export function FamilyChallengeCard({
  challenge,
  members,
  onComplete,
}: FamilyChallengeCardProps) {
  const progressPercentage = useMemo(() => {
    return Math.min(
      100,
      Math.round((challenge.currentProgress / challenge.targetCompletions) * 100)
    );
  }, [challenge.currentProgress, challenge.targetCompletions]);

  const daysRemaining = useMemo(() => {
    if (!challenge.endDate) return null;
    const end = new Date(challenge.endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [challenge.endDate]);

  const isCompleted = challenge.status === 'completed';
  const isActive = challenge.status === 'active';

  // Get top contributors
  const topContributors = useMemo(() => {
    return Object.entries(challenge.participantProgress)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([memberId, completions]) => {
        const member = members.find((m) => m.uid === memberId);
        return { member, completions };
      });
  }, [challenge.participantProgress, members]);

  const ChallengeIcon =
    challenge.challengeType === 'streak'
      ? Flame
      : challenge.challengeType === 'participation'
      ? Users
      : Trophy;

  return (
    <div
      className={cn(
        'relative rounded-2xl border overflow-hidden transition-all duration-300',
        isCompleted
          ? 'bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border-amber-500/40'
          : isActive
          ? 'bg-card border-border hover:border-primary/40 hover:shadow-md'
          : 'bg-muted/50 border-border/50 opacity-75'
      )}
    >
      {/* Progress bar background */}
      {isActive && (
        <div
          className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
      )}

      <div className="relative p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'h-12 w-12 rounded-xl flex items-center justify-center text-2xl',
                isCompleted
                  ? 'bg-amber-500/30'
                  : isActive
                  ? 'bg-primary/20'
                  : 'bg-muted'
              )}
            >
              {challenge.emoji}
            </div>
            <div>
              <h3 className="font-bold text-foreground flex items-center gap-2">
                {challenge.title}
                {isCompleted && (
                  <span className="text-amber-500">
                    <Star className="h-4 w-4 fill-current" />
                  </span>
                )}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {challenge.description}
              </p>
            </div>
          </div>

          {/* Status badge */}
          <div
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
              isCompleted
                ? 'bg-amber-500/20 text-amber-400'
                : isActive
                ? 'bg-primary/20 text-primary'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {isCompleted ? (
              <>
                <Check className="h-3 w-3" />
                Complete
              </>
            ) : (
              <>
                <ChallengeIcon className="h-3 w-3" />
                {challenge.challengeType}
              </>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-bold text-foreground">
              {challenge.currentProgress} / {challenge.targetCompletions}
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                isCompleted
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-400'
                  : 'bg-gradient-to-r from-primary to-primary/80'
              )}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between">
          {/* Contributors */}
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {topContributors.map(({ member, completions }, i) => (
                <div
                  key={member?.uid || i}
                  className="relative"
                  title={`${member?.displayName || 'Member'}: ${completions} completions`}
                >
                  {member?.photoURL ? (
                    <Image
                      src={member.photoURL}
                      alt={member.displayName}
                      width={28}
                      height={28}
                      className="rounded-full border-2 border-background object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium">
                      {member?.displayName?.[0] || '?'}
                    </div>
                  )}
                  {i === 0 && topContributors.length > 1 && (
                    <span className="absolute -top-1 -right-1 text-[10px]">👑</span>
                  )}
                </div>
              ))}
            </div>
            {topContributors.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                {topContributors.length === 1
                  ? topContributors[0].member?.displayName
                  : `${topContributors.length} contributors`}
              </span>
            )}
          </div>

          {/* Time remaining or reward */}
          <div className="flex items-center gap-2">
            {daysRemaining !== null && isActive && (
              <span
                className={cn(
                  'flex items-center gap-1 text-xs',
                  daysRemaining <= 1 ? 'text-red-400' : 'text-muted-foreground'
                )}
              >
                <Clock className="h-3 w-3" />
                {daysRemaining === 0
                  ? 'Ends today!'
                  : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left`}
              </span>
            )}
            {challenge.reward && (
              <span className="flex items-center gap-1 text-xs bg-amber-500/10 text-amber-500 px-2 py-1 rounded-full">
                🎁 {challenge.reward}
              </span>
            )}
          </div>
        </div>

        {/* Completion action */}
        {isCompleted && onComplete && (
          <button
            onClick={onComplete}
            className="mt-3 w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Trophy className="h-4 w-4" />
            Claim Reward
          </button>
        )}
      </div>
    </div>
  );
}
