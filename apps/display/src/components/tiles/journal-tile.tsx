'use client';

import { BookOpen, Flame, Calendar, Loader2 } from 'lucide-react';
import { TileBase, TileProps } from './tile-base';
import { useAuth } from '@ainexsuite/auth';
import { useJournalData, MOOD_CONFIG } from '@/hooks/use-journal-data';

// Format relative date
function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const entryDate = new Date(date);
  entryDate.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Truncate content for preview
function truncateContent(content: string, maxLength: number = 100): string {
  // Strip markdown and HTML
  const plainText = content
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*|__/g, '')
    .replace(/\*|_/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .trim();

  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength).trim() + '...';
}

export function JournalTile(props: Omit<TileProps, 'title' | 'children'>) {
  const { user } = useAuth();
  const { latestEntry, currentMood, writingStreak, onThisDay, isLoading } = useJournalData(user?.uid);

  const isCompact = props.variant === 'small';
  const moodConfig = currentMood ? MOOD_CONFIG[currentMood] : null;

  return (
    <TileBase {...props} title="Journal">
      {isLoading ? (
        <div className="flex items-center justify-center h-24">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : !latestEntry ? (
        <div className="flex flex-col items-center justify-center h-24 text-center">
          <div className="p-3 rounded-full bg-amber-500/10 mb-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-sm font-medium text-foreground/80">Your story awaits</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Capture today&apos;s moments
          </p>
        </div>
      ) : (
        <div className="flex flex-col h-full gap-3">
          {/* Current Mood & Streak Row */}
          <div className="flex items-center justify-between">
            {/* Mood Badge */}
            {moodConfig ? (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${moodConfig.bg}`}>
                <span className="text-sm">{moodConfig.emoji}</span>
                <span className={`text-[11px] font-medium ${moodConfig.color}`}>
                  {moodConfig.label}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-foreground/5">
                <span className="text-sm">📝</span>
                <span className="text-[11px] text-muted-foreground/70">No mood</span>
              </div>
            )}

            {/* Writing Streak */}
            {writingStreak > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-orange-500/20 rounded-lg">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-xs font-medium text-orange-400">
                  {writingStreak} day{writingStreak > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          {/* Latest Entry Preview */}
          <div className="flex-1 bg-foreground/5 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-foreground truncate flex-1">
                {latestEntry.title || 'Untitled Entry'}
              </h4>
              <span className="text-[10px] text-muted-foreground ml-2">
                {formatRelativeDate(latestEntry.date)}
              </span>
            </div>

            {!isCompact && latestEntry.content && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {truncateContent(latestEntry.content, 120)}
              </p>
            )}

            {/* Tags */}
            {!isCompact && latestEntry.tags && latestEntry.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {latestEntry.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-1.5 py-0.5 text-[9px] bg-foreground/10 text-muted-foreground rounded"
                  >
                    #{tag}
                  </span>
                ))}
                {latestEntry.tags.length > 3 && (
                  <span className="text-[9px] text-muted-foreground">
                    +{latestEntry.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* On This Day Memory */}
          {!isCompact && onThisDay && (
            <div className="bg-purple-500/10 rounded-lg p-2.5 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-3 h-3 text-purple-400" />
                <span className="text-[10px] font-medium text-purple-400">
                  On this day {new Date(onThisDay.date).getFullYear()}
                </span>
              </div>
              <p className="text-xs text-foreground/80 truncate">
                {onThisDay.title || truncateContent(onThisDay.content, 50)}
              </p>
            </div>
          )}
        </div>
      )}
    </TileBase>
  );
}
