'use client';

import { Medal, Users, Heart, Home, Settings, Trophy, Award, Star } from 'lucide-react';
import { MemberContribution } from '../../lib/analytics-utils';
import type { SpaceType } from '@/types/models';
import { cn } from '../../lib/utils';

interface TeamLeaderboardProps {
  data: MemberContribution[];
  spaceType?: SpaceType;
  onSettingsClick?: () => void;
  compact?: boolean;
}

const getLeaderboardTitle = (spaceType?: SpaceType): { title: string; icon: typeof Users } => {
  switch (spaceType) {
    case 'family':
      return { title: 'Family Progress', icon: Home };
    case 'couple':
      return { title: 'Partner Progress', icon: Heart };
    case 'squad':
      return { title: 'Squad Leaderboard', icon: Users };
    default:
      return { title: 'Progress', icon: Users };
  }
};

const getRankStyle = (index: number) => {
  switch (index) {
    case 0:
      return {
        badge: 'bg-gradient-to-br from-yellow-400 to-amber-500',
        text: 'text-yellow-400',
        icon: Trophy
      };
    case 1:
      return {
        badge: 'bg-gradient-to-br from-gray-300 to-gray-400',
        text: 'text-gray-300',
        icon: Award
      };
    case 2:
      return {
        badge: 'bg-gradient-to-br from-amber-600 to-amber-700',
        text: 'text-amber-500',
        icon: Medal
      };
    default:
      return {
        badge: 'bg-white/10',
        text: 'text-white/40',
        icon: Star
      };
  }
};

export function TeamLeaderboard({ data, spaceType, onSettingsClick, compact = false }: TeamLeaderboardProps) {
  const { title, icon: Icon } = getLeaderboardTitle(spaceType);

  if (compact) {
    return (
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden">
        {/* Compact header with always-visible settings */}
        <div className="p-2.5 border-b border-white/10 bg-white/5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-indigo-500/20">
              <Icon className="h-3.5 w-3.5 text-indigo-400" />
            </div>
            <h3 className="text-xs font-bold text-white">{title}</h3>
            <span className="text-[10px] text-white/40 px-1.5 py-0.5 rounded-full bg-white/5">This Week</span>
          </div>
          {onSettingsClick && (
            <button
              onClick={onSettingsClick}
              className="p-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 hover:text-indigo-300 transition-colors"
              title="Family Settings"
            >
              <Settings className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Compact horizontal layout for mobile */}
        <div className="p-2 flex flex-wrap gap-2">
          {data.slice(0, 4).map((member, index) => {
            const rankStyle = getRankStyle(index);
            const RankIcon = rankStyle.icon;

            return (
              <div
                key={member.uid}
                className={cn(
                  "flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 min-w-[120px] flex-1",
                  index === 0 && "bg-yellow-500/10 border border-yellow-500/20"
                )}
              >
                {/* Rank */}
                <div className={cn(
                  "w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold",
                  rankStyle.badge
                )}>
                  {index < 3 ? (
                    <RankIcon className="h-3 w-3 text-black/80" />
                  ) : (
                    <span className="text-white/60">{index + 1}</span>
                  )}
                </div>

                {/* Avatar */}
                <div className={cn(
                  "h-6 w-6 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-[9px] font-bold text-white ring-1",
                  index === 0 ? "ring-yellow-500/50" : "ring-transparent"
                )}>
                  {member.displayName.slice(0, 2).toUpperCase()}
                </div>

                {/* Name & Count */}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-white truncate">{member.displayName}</p>
                </div>
                <span className={cn(
                  "text-xs font-bold tabular-nums",
                  index === 0 ? "text-yellow-400" : "text-indigo-400"
                )}>
                  {member.weeklyCompletions}
                </span>
              </div>
            );
          })}
        </div>

        {data.length === 0 && (
          <div className="flex items-center justify-center gap-2 py-4 px-3">
            <Trophy className="h-4 w-4 text-amber-400/50" />
            <p className="text-xs text-white/40">Complete habits to see progress</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden">
      <div className="p-3 border-b border-white/10 bg-white/5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20">
            <Icon className="h-4 w-4 text-indigo-400" />
          </div>
          <h3 className="text-sm font-bold text-white">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40 px-2 py-0.5 rounded-full bg-white/5">This Week</span>
          {onSettingsClick && (
            <button
              onClick={onSettingsClick}
              className="p-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 hover:text-indigo-300 transition-colors"
              title="Family Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="divide-y divide-white/5">
        {data.map((member, index) => {
          const rankStyle = getRankStyle(index);
          const RankIcon = rankStyle.icon;

          return (
            <div
              key={member.uid}
              className={cn(
                "p-2.5 flex items-center gap-2.5 hover:bg-white/5 transition-colors",
                index === 0 && "bg-yellow-500/5"
              )}
            >
              {/* Rank Badge */}
              <div className={cn(
                "w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shadow-lg",
                rankStyle.badge
              )}>
                {index < 3 ? (
                  <RankIcon className="h-3 w-3 text-black/80" />
                ) : (
                  <span className="text-white/60">{index + 1}</span>
                )}
              </div>

              {/* Avatar */}
              <div className={cn(
                "h-8 w-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-[10px] font-bold text-white ring-2",
                index === 0 ? "ring-yellow-500/50" : index === 1 ? "ring-gray-400/30" : index === 2 ? "ring-amber-600/30" : "ring-transparent"
              )}>
                {member.displayName.slice(0, 2).toUpperCase()}
              </div>

              {/* Name & Stats */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{member.displayName}</p>
                <p className="text-[10px] text-white/40">{member.totalCompletions} all-time</p>
              </div>

              {/* Weekly Count */}
              <div className={cn(
                "px-2 py-1 rounded-lg text-sm font-bold",
                index === 0 ? "bg-yellow-500/20 text-yellow-400" : "bg-indigo-500/20 text-indigo-400"
              )}>
                {member.weeklyCompletions}
              </div>
            </div>
          );
        })}

        {data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 px-4">
            <div className="relative mb-3">
              <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl" />
              <div className="relative p-3 rounded-full bg-white/5 border border-white/10">
                <Trophy className="h-5 w-5 text-amber-400" />
              </div>
            </div>
            <p className="text-sm font-medium text-white/80 mb-0.5">No activity yet</p>
            <p className="text-xs text-white/40 text-center">
              Complete habits to climb the leaderboard
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
