'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { Check, MessageCircle, Flame } from 'lucide-react';
import { Completion, Habit, Member } from '@/types/models';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  type: 'completion' | 'reaction' | 'streak_milestone';
  userId: string;
  userName: string;
  userPhoto?: string;
  habitTitle: string;
  habitId: string;
  message: string;
  emoji?: string;
  timestamp: string;
}

interface ActivityFeedProps {
  completions: Completion[];
  habits: Habit[];
  members: Member[];
  currentUserId: string;
  limit?: number;
}

export function ActivityFeed({
  completions,
  habits,
  members,
  currentUserId,
  limit = 10
}: ActivityFeedProps) {
  // Generate activity items from completions
  const activityItems = useMemo(() => {
    const items: ActivityItem[] = [];

    // Helper to get member info
    const getMember = (userId: string) => members.find(m => m.uid === userId);
    const getHabit = (habitId: string) => habits.find(h => h.id === habitId);

    // Get recent completions (last 7 days)
    const recentCompletions = completions
      .filter(c => {
        const completedAt = new Date(c.completedAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return completedAt >= weekAgo;
      })
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

    // Add completion activities
    for (const completion of recentCompletions) {
      const member = getMember(completion.userId);
      const habit = getHabit(completion.habitId);
      if (!member || !habit) continue;

      // Add the completion itself
      items.push({
        id: `completion-${completion.id}`,
        type: 'completion',
        userId: completion.userId,
        userName: member.displayName,
        userPhoto: member.photoURL,
        habitTitle: habit.title,
        habitId: habit.id,
        message: completion.userId === currentUserId
          ? `You completed ${habit.title}`
          : `${member.displayName} completed ${habit.title}`,
        timestamp: completion.completedAt
      });

      // Add reactions as separate items
      if (completion.reactions && completion.reactions.length > 0) {
        for (const reaction of completion.reactions) {
          const reactorMember = getMember(reaction.userId);
          if (!reactorMember) continue;

          items.push({
            id: `reaction-${completion.id}-${reaction.userId}`,
            type: 'reaction',
            userId: reaction.userId,
            userName: reactorMember.displayName,
            userPhoto: reactorMember.photoURL,
            habitTitle: habit.title,
            habitId: habit.id,
            message: reaction.userId === currentUserId
              ? `You reacted to ${member.displayName}'s completion`
              : `${reactorMember.displayName} reacted to ${member.displayName === reactorMember.displayName ? 'their own' : member.displayName + "'s"} completion`,
            emoji: reaction.emoji,
            timestamp: reaction.createdAt
          });
        }
      }

      // Check for streak milestones (7, 14, 30, etc.)
      const streak = habit.currentStreak;
      if (streak > 0 && [7, 14, 30, 60, 100].includes(streak)) {
        items.push({
          id: `streak-${completion.id}-${streak}`,
          type: 'streak_milestone',
          userId: completion.userId,
          userName: member.displayName,
          userPhoto: member.photoURL,
          habitTitle: habit.title,
          habitId: habit.id,
          message: completion.userId === currentUserId
            ? `You hit a ${streak}-day streak on ${habit.title}!`
            : `${member.displayName} hit a ${streak}-day streak on ${habit.title}!`,
          emoji: streak >= 30 ? '🏆' : streak >= 14 ? '⚡' : '🔥',
          timestamp: completion.completedAt
        });
      }
    }

    // Sort by timestamp and limit
    return items
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }, [completions, habits, members, currentUserId, limit]);

  // Format relative time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Get icon for activity type
  const getIcon = (item: ActivityItem) => {
    switch (item.type) {
      case 'completion':
        return <Check className="h-3.5 w-3.5 text-emerald-400" />;
      case 'reaction':
        return <span className="text-sm">{item.emoji}</span>;
      case 'streak_milestone':
        return <Flame className="h-3.5 w-3.5 text-orange-400" />;
      default:
        return <MessageCircle className="h-3.5 w-3.5 text-blue-400" />;
    }
  };

  if (activityItems.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-zinc-500 dark:text-zinc-400">
        No recent activity. Complete a habit to get started!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {activityItems.map((item) => (
        <div
          key={item.id}
          className={cn(
            'flex items-start gap-3 p-3 rounded-lg transition-colors',
            'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700'
          )}
        >
          {/* Avatar or icon */}
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center overflow-hidden">
            {item.userPhoto ? (
              <Image
                src={item.userPhoto}
                alt={item.userName}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                {item.userName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-tight">
              {item.message}
              {item.type === 'reaction' && item.emoji && (
                <span className="ml-1">{item.emoji}</span>
              )}
              {item.type === 'streak_milestone' && item.emoji && (
                <span className="ml-1">{item.emoji}</span>
              )}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {formatTime(item.timestamp)}
            </p>
          </div>

          {/* Activity type icon */}
          <div className="flex-shrink-0">
            {getIcon(item)}
          </div>
        </div>
      ))}
    </div>
  );
}
