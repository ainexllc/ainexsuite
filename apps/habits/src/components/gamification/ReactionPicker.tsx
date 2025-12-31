'use client';

import { useState, useRef, useEffect } from 'react';
import { Smile } from 'lucide-react';
import { REACTION_EMOJIS, ReactionEmoji, Reaction } from '@/types/models';
import { cn } from '@/lib/utils';

interface ReactionPickerProps {
  reactions?: Reaction[];
  currentUserId: string;
  onReact: (emoji: ReactionEmoji) => void;
  onRemoveReaction: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export function ReactionPicker({
  reactions = [],
  currentUserId,
  onReact,
  onRemoveReaction,
  disabled = false,
  size = 'sm'
}: ReactionPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get current user's reaction
  const userReaction = reactions.find(r => r.userId === currentUserId);

  // Group reactions by emoji
  const reactionCounts = reactions.reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {} as Record<ReactionEmoji, number>);

  const handleEmojiClick = (emoji: ReactionEmoji) => {
    if (userReaction?.emoji === emoji) {
      // Toggle off if clicking same emoji
      onRemoveReaction();
    } else {
      onReact(emoji);
    }
    setIsOpen(false);
  };

  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  const buttonPadding = size === 'sm' ? 'px-1.5 py-0.5' : 'px-2 py-1';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <div className="relative" ref={pickerRef}>
      {/* Reaction display */}
      <div className="flex items-center gap-1">
        {/* Show existing reactions */}
        {Object.entries(reactionCounts).map(([emoji, count]) => (
          <button
            key={emoji}
            onClick={() => handleEmojiClick(emoji as ReactionEmoji)}
            disabled={disabled}
            className={cn(
              'flex items-center gap-0.5 rounded-full transition-all',
              buttonPadding,
              textSize,
              userReaction?.emoji === emoji
                ? 'bg-indigo-500/30 text-indigo-300 ring-1 ring-indigo-500/50'
                : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            title={reactions.filter(r => r.emoji === emoji).map(r => r.userName).join(', ')}
          >
            <span>{emoji}</span>
            {count > 1 && <span className="font-medium">{count}</span>}
          </button>
        ))}

        {/* Add reaction button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            'flex items-center justify-center rounded-full transition-all',
            buttonPadding,
            'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          title="Add reaction"
        >
          <Smile className={iconSize} />
        </button>
      </div>

      {/* Emoji picker dropdown */}
      {isOpen && !disabled && (
        <div className="absolute bottom-full left-0 mb-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center gap-1 p-1.5 bg-background border border-border rounded-xl shadow-lg">
            {REACTION_EMOJIS.map(({ emoji, label }) => (
              <button
                key={emoji}
                onClick={() => handleEmojiClick(emoji)}
                className={cn(
                  'p-1.5 rounded-lg transition-all hover:scale-110',
                  userReaction?.emoji === emoji
                    ? 'bg-indigo-500/30'
                    : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'
                )}
                title={label}
              >
                <span className="text-lg">{emoji}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
