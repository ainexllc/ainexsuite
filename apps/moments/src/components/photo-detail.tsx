'use client';

import { useState, useEffect } from 'react';
import type { Moment, Comment } from '@ainexsuite/types';
import Image from 'next/image';
import { format } from 'date-fns';
import { X, MapPin, Calendar, Edit, Smile, MessageCircle, Send } from 'lucide-react';
import { useAuth } from '@ainexsuite/auth';
import { useAppColors } from '@ainexsuite/theme';
import { toggleReaction, addComment, deleteComment } from '@/lib/moments';
import { cn } from '@/lib/utils';

interface PhotoDetailProps {
  moment: Moment;
  onClose: () => void;
  onEdit?: () => void;
}

const EMOJIS = [
  { icon: '❤️', label: 'Love' },
  { icon: '😂', label: 'Haha' },
  { icon: '😲', label: 'Wow' },
  { icon: '😢', label: 'Sad' },
];

export function PhotoDetail({ moment: initialMoment, onClose, onEdit }: PhotoDetailProps) {
  const { user } = useAuth();
  const { primary: primaryColor, secondary: secondaryColor } = useAppColors();
  const [moment, setMoment] = useState<Moment>(initialMoment);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset internal state when prop changes
  useEffect(() => {
    setMoment(initialMoment);
  }, [initialMoment]);

  const handleReaction = async (emoji: string) => {
    if (!user) return;
    
    // Optimistic update
    const existingReactionIndex = moment.reactions?.findIndex(
      r => r.uid === user.uid && r.type === emoji
    ) ?? -1;

    const newReactions = [...(moment.reactions || [])];
    if (existingReactionIndex >= 0) {
      newReactions.splice(existingReactionIndex, 1);
    } else {
      newReactions.push({
        uid: user.uid,
        type: emoji,
        timestamp: Date.now()
      });
    }

    setMoment({ ...moment, reactions: newReactions });

    try {
      await toggleReaction(moment.id, user.uid, emoji);
    } catch (error) {
      console.error('Failed to toggle reaction:', error);
      // Revert on error would go here
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !commentText.trim()) return;

    setIsSubmitting(true);
    const text = commentText.trim();
    const tempId = `temp_${Date.now()}`;

    // Optimistic update
    const newComment: Comment = {
      id: tempId,
      uid: user.uid,
      text: text,
      timestamp: Date.now()
    };

    setMoment({
      ...moment,
      comments: [...(moment.comments || []), newComment]
    });
    setCommentText('');

    try {
      await addComment(moment.id, user.uid, text);
    } catch (error) {
      console.error('Failed to add comment:', error);
      // Revert
      setMoment({
        ...moment,
        comments: moment.comments?.filter(c => c.id !== tempId)
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (comment: Comment) => {
    if (!user || comment.uid !== user.uid) return;

    if (!confirm('Delete this comment?')) return;

    // Optimistic update
    setMoment({
      ...moment,
      comments: moment.comments?.filter(c => c.id !== comment.id)
    });

    try {
      await deleteComment(moment.id, comment);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/95 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <button
        onClick={onClose}
        className="fixed top-4 right-4 p-2 bg-foreground/10 hover:bg-foreground/20 rounded-lg transition-colors z-50"
      >
        <X className="h-6 w-6 text-foreground" />
      </button>

      {onEdit && (
        <button
          onClick={onEdit}
          className="fixed top-4 right-20 p-2 bg-foreground/10 hover:bg-foreground/20 rounded-lg transition-colors z-50"
        >
          <Edit className="h-6 w-6 text-foreground" />
        </button>
      )}

      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[80vh]">
        {/* Photo Section */}
        <div className="lg:col-span-2 flex items-center justify-center bg-black/20 rounded-2xl">
          <div className="relative w-full h-full min-h-[50vh] lg:min-h-[80vh]">
            <Image
              src={moment.photoUrl}
              alt={moment.caption || 'Moment'}
              fill
              sizes="(min-width: 1024px) 66vw, 100vw"
              className="object-contain"
              priority
              unoptimized
            />
          </div>
        </div>

        {/* Details & Interaction Panel */}
        <div className="bg-surface-card rounded-2xl flex flex-col h-full max-h-[80vh] overflow-hidden shadow-2xl border border-outline-subtle">
          {/* Metadata Header */}
          <div className="p-6 border-b border-outline-subtle flex-shrink-0">
            <h2 className="text-xl font-bold mb-2 line-clamp-2">
              {moment.title || moment.caption || 'Untitled Moment'}
            </h2>
            
            <div className="flex flex-wrap gap-4 text-sm text-ink-600 mb-4">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(moment.date), 'MMM d, yyyy')}</span>
              </div>
              {moment.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate max-w-[150px]">{moment.location}</span>
                </div>
              )}
            </div>

            {moment.caption && (
              <p className="text-ink-700 text-sm leading-relaxed mb-4">
                {moment.caption}
              </p>
            )}

            {/* Reactions Bar */}
            <div className="flex items-center gap-2 pt-2">
              {EMOJIS.map((emoji) => {
                const count = moment.reactions?.filter(r => r.type === emoji.icon).length || 0;
                const hasReacted = moment.reactions?.some(r => r.uid === user?.uid && r.type === emoji.icon);
                
                return (
                  <button
                    key={emoji.icon}
                    onClick={() => handleReaction(emoji.icon)}
                    disabled={!user}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all hover:scale-105 active:scale-95",
                      hasReacted
                        ? "border"
                        : "bg-surface-elevated hover:bg-surface-hover border border-transparent"
                    )}
                    style={hasReacted ? {
                      backgroundColor: `${primaryColor}33`,
                      color: primaryColor,
                      borderColor: `${primaryColor}4d`
                    } : undefined}
                    title={emoji.label}
                  >
                    <span>{emoji.icon}</span>
                    {count > 0 && <span className="font-medium text-xs">{count}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <h3 className="text-sm font-semibold text-ink-500 uppercase tracking-wider flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Comments ({moment.comments?.length || 0})
            </h3>
            
            {moment.comments && moment.comments.length > 0 ? (
              <div className="space-y-4">
                {moment.comments.sort((a, b) => a.timestamp - b.timestamp).map((comment) => (
                  <div key={comment.id} className="flex gap-3 group">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-foreground text-xs font-bold flex-shrink-0"
                      style={{
                        background: `linear-gradient(to bottom right, ${secondaryColor}, ${primaryColor})`
                      }}
                    >
                      {/* Placeholder avatar until we have user profiles linked */}
                      U
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="bg-surface-elevated px-4 py-2 rounded-2xl rounded-tl-none">
                        <p className="text-sm text-ink-900">{comment.text}</p>
                      </div>
                      <div className="flex items-center gap-2 px-1">
                        <span className="text-[10px] text-ink-400">
                          {format(new Date(comment.timestamp), 'MMM d, h:mm a')}
                        </span>
                        {user && comment.uid === user.uid && (
                          <button
                            onClick={() => handleDeleteComment(comment)}
                            className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ color: '#ef4444' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#dc2626'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#ef4444'}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-ink-400 space-y-2 opacity-50">
                <MessageCircle className="h-8 w-8" />
                <p className="text-sm">No comments yet. Be the first!</p>
              </div>
            )}
          </div>

          {/* Comment Input */}
          <div className="p-4 border-t border-outline-subtle bg-surface-base flex-shrink-0">
            <form onSubmit={handleAddComment} className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={user ? "Write a comment..." : "Sign in to comment"}
                  disabled={!user || isSubmitting}
                  className="w-full bg-surface-elevated border border-outline-subtle rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none resize-none min-h-[44px] max-h-32"
                  style={{ '--tw-border-opacity': '1', borderColor: primaryColor } as React.CSSProperties}
                  onFocus={(e) => e.target.style.borderColor = primaryColor}
                  onBlur={(e) => e.target.style.borderColor = ''}
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment(e);
                    }
                  }}
                />
                <Smile
                  className="absolute right-3 bottom-3 h-5 w-5 text-ink-400 cursor-pointer transition-colors"
                  style={{ color: primaryColor }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                />
              </div>
              <button
                type="submit"
                disabled={!user || !commentText.trim() || isSubmitting}
                className="p-3 disabled:opacity-50 text-foreground rounded-xl transition-all shadow-lg"
                style={{
                  backgroundColor: primaryColor,
                  boxShadow: `0 10px 15px -3px ${primaryColor}33`
                }}
                onMouseEnter={(e) => !user || !commentText.trim() || isSubmitting ? null : e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                {isSubmitting ? (
                  <div className="h-5 w-5 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
