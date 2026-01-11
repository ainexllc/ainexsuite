"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import type { JournalEntry } from '@ainexsuite/types';
import { deleteJournalEntry, toggleEntryPin, updateJournalEntry } from '@/lib/firebase/firestore';
import { deleteAllEntryFiles } from '@/lib/firebase/storage';
import { useToast, ConfirmationDialog, getEntryColorConfig } from '@ainexsuite/ui';
import { useRouter } from 'next/navigation';
import {
  Paperclip,
  Trash2,
  Link as LinkIcon,
  Heart,
  Loader2,
} from 'lucide-react';
import { usePrivacy, BlurredContent, PasscodeModal } from '@ainexsuite/privacy';
import { JournalEntryEditor } from './journal-entry-editor';
import { useBackgrounds } from '@/hooks/use-backgrounds';
import { useCovers } from '@/hooks/use-covers';
import { useCoverSettings } from '@/contexts/cover-settings-context';
import { getBackgroundById, getOverlayClasses, getTextColorClasses, FALLBACK_BACKGROUNDS } from '@/lib/backgrounds';

interface JournalCardProps {
  entry: JournalEntry;
  onUpdate: () => void;
}

export function JournalCard({ entry, onUpdate }: JournalCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'view' | 'edit' | null>(null);
  const { isUnlocked, hasPasscode, verifyPasscode, setupPasscode } = usePrivacy();

  // Private entries logic - blur content when private, regardless of passcode setup
  const isLocked = entry.isPrivate && !isUnlocked;

  // Get color configuration for this entry
  const colorConfig = getEntryColorConfig(entry.color || 'default');

  // Fetch backgrounds from Firestore
  const { backgrounds: firestoreBackgrounds } = useBackgrounds();

  // Fetch covers from Firestore
  const { covers } = useCovers();

  // Cover settings (AI summary toggle)
  const { showAiSummary } = useCoverSettings();

  // Merge Firestore backgrounds with fallbacks
  const availableBackgrounds = useMemo(() => {
    if (firestoreBackgrounds.length > 0) {
      return firestoreBackgrounds;
    }
    return FALLBACK_BACKGROUNDS;
  }, [firestoreBackgrounds]);

  // Get current background object
  const currentBackground = useMemo(() => {
    if (!entry.backgroundImage) return null;
    return getBackgroundById(entry.backgroundImage, availableBackgrounds) || null;
  }, [entry.backgroundImage, availableBackgrounds]);

  // Determine if we're using a background image
  const hasBackground = currentBackground !== null;

  // Get current cover object
  const currentCover = useMemo(() => {
    if (!entry.coverImage) return null;
    return covers.find((c) => c.id === entry.coverImage) || null;
  }, [entry.coverImage, covers]);

  // Determine if we're using a cover image
  const hasCover = currentCover !== null;

  // Summary generation state
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  // Track which entry ID we've attempted to generate for (to prevent duplicate attempts)
  const attemptedEntryRef = useRef<string | null>(null);

  // Auto-generate summary when cover exists but summary is missing (and AI summary is enabled)
  useEffect(() => {
    // Reset if entry now has a summary or entry changed
    if (entry.coverSummary || attemptedEntryRef.current !== entry.id) {
      if (entry.coverSummary) {
        attemptedEntryRef.current = null; // Reset so we can regenerate if summary is cleared later
      }
    }

    // Only generate if: AI summary enabled, has cover, no summary, has content, not already generating, not already attempted for this entry
    const alreadyAttempted = attemptedEntryRef.current === entry.id;
    if (showAiSummary && hasCover && !entry.coverSummary && entry.content && !isGeneratingSummary && !alreadyAttempted) {
      attemptedEntryRef.current = entry.id;
      setIsGeneratingSummary(true);

      const generateSummary = async () => {
        try {
          const response = await fetch('/api/generate-summary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: entry.content,
              title: entry.title || '',
            }),
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.summary) {
              // Update the entry with the generated summary
              await updateJournalEntry(entry.id, { coverSummary: result.summary });
              onUpdate(); // Trigger refresh to show the new summary
            }
          }
        } catch (error) {
          console.error('Failed to generate cover summary:', error);
        } finally {
          setIsGeneratingSummary(false);
        }
      };

      generateSummary();
    }
  }, [showAiSummary, hasCover, entry.coverSummary, entry.content, entry.title, entry.id, isGeneratingSummary, onUpdate]);

  // Leather cover check - special handling for leather card style
  const isLeatherCover = entry.color === 'entry-leather';
  const leatherCoverUrl = '/images/leather-cover.png';

  const handleDeleteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      if (entry.attachments && entry.attachments.length > 0) {
        await deleteAllEntryFiles(entry.ownerId, entry.id);
      }
      await deleteJournalEntry(entry.id);
      setShowDeleteConfirm(false);
      toast({
        title: 'Entry deleted',
        description: 'Your journal entry has been moved to trash.',
        variant: 'success',
      });
      onUpdate();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete entry',
        variant: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    if (isDeleting) return;
    setShowDeleteConfirm(false);
  };

  const handlePin = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    await toggleEntryPin(entry.id, !entry.pinned);
    onUpdate();
  };

  const handleCardClick = () => {
    if (isLocked) {
      setPendingAction('edit');
      setShowPasscodeModal(true);
    } else {
      setIsEditing(true);
    }
  };

  const handleView = () => {
    if (isLocked) {
      setPendingAction('view');
      setShowPasscodeModal(true);
    } else {
      router.push(`/workspace/${entry.id}/view`);
    }
  };

  const handlePasscodeSubmit = async (passcode: string) => {
    let success = false;
    try {
      if (hasPasscode) {
        success = await verifyPasscode(passcode);
      } else {
        success = await setupPasscode(passcode);
        if (success) {
          success = await verifyPasscode(passcode);
        }
      }
      if (success) {
        setShowPasscodeModal(false);
        setTimeout(() => {
          if (pendingAction === 'edit') {
            setIsEditing(true);
          } else if (pendingAction === 'view') {
            router.push(`/workspace/${entry.id}/view`);
          }
          setPendingAction(null);
        }, 100);
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to process passcode. Please try again.',
        variant: 'error',
      });
    }
    return success;
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    const processedContent = content
      .replace(/<\/li>/gi, '</li> ')
      .replace(/<\/p>/gi, '</p> ')
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<\/div>/gi, '</div> ')
      .replace(/<\/h[1-6]>/gi, ' ')
      .replace(/<li>/gi, ' • ');

    const textContent = processedContent
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&mdash;/g, '—')
      .replace(/&ndash;/g, '–')
      .replace(/\s+/g, ' ')
      .trim();

    if (textContent.length <= maxLength) return textContent;
    return textContent.substring(0, maxLength).trim() + '...';
  };

  return (
    <>
      <article
        className={clsx(
          !hasBackground && !isLeatherCover && !hasCover && colorConfig.cardClass,
          'border border-zinc-200 dark:border-zinc-800',
          'group relative cursor-pointer overflow-hidden rounded-2xl',
          'transition-[border-color,box-shadow] duration-200',
          'hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md',
          'break-inside-avoid px-4 py-4 h-[220px] flex flex-col',
        )}
        onClick={handleCardClick}
      >
        {/* Cover image layer - highest priority, shows selected cover texture */}
        {hasCover && currentCover && (
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentCover.thumbnail}
              alt=""
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover z-0"
            />
            {/* Apply overlay styles from user selection */}
            <div className={clsx(
              getOverlayClasses(
                { id: 'cover', name: 'cover', thumbnail: '', fullImage: '', brightness: 'dark' },
                entry.backgroundOverlay || 'auto'
              ),
              'z-10'
            )} />
          </div>
        )}

        {/* Background image layer - second priority */}
        {!hasCover && hasBackground && currentBackground && (
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentBackground.thumbnail}
              alt=""
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover z-0"
            />
            <div className={clsx(getOverlayClasses(currentBackground, entry.backgroundOverlay || 'auto'), 'z-10')} />
          </div>
        )}

        {/* Leather cover layer - shows leather texture as card cover */}
        {isLeatherCover && !hasCover && !hasBackground && (
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={leatherCoverUrl}
              alt=""
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover z-0"
            />
            {/* Subtle overlay for text readability */}
            <div className="absolute inset-0 bg-black/20 z-10" />
          </div>
        )}


        {/* Corner Heart Badge - clickable to toggle favorites */}
        <button
          type="button"
          onClick={handlePin}
          className="absolute -top-0 -right-0 w-10 h-10 overflow-hidden rounded-tr-lg z-20 group/pin"
          aria-label={entry.pinned ? "Remove from favorites" : "Add to favorites"}
        >
          {entry.pinned ? (
            <>
              <div className="absolute top-0 right-0 bg-[var(--color-primary)] group-hover/pin:brightness-90 w-14 h-14 rotate-45 translate-x-7 -translate-y-7 transition-all" />
              <Heart className="absolute top-1.5 right-1.5 h-3 w-3 text-white fill-white" />
            </>
          ) : (
            <>
              <div className={clsx(
                "absolute top-0 right-0 w-14 h-14 rotate-45 translate-x-7 -translate-y-7 transition-all",
                "opacity-0 group-hover:opacity-100",
                hasCover || (hasBackground && currentBackground?.brightness === 'dark') || isLeatherCover
                  ? "bg-white/10"
                  : hasBackground && currentBackground?.brightness === 'light'
                    ? "bg-black/10"
                    : "bg-zinc-200/50 dark:bg-zinc-700/50"
              )} />
              <Heart className={clsx(
                "absolute top-1.5 right-1.5 h-3 w-3 transition-all",
                "opacity-0 group-hover:opacity-100",
                hasCover || (hasBackground && currentBackground?.brightness === 'dark') || isLeatherCover
                  ? "text-[var(--color-primary)]/80"
                  : hasBackground && currentBackground?.brightness === 'light'
                    ? "text-[var(--color-primary)]"
                    : "text-[var(--color-primary)]"
              )} />
            </>
          )}
        </button>

        {/* Header section with title and badges - outside overflow wrapper */}
        {(entry.title || entry.isDraft) && (
          <div className={clsx(
            "relative z-10 -mx-4 -mt-4 px-4 py-2.5 rounded-t-2xl border-b mb-2",
            hasCover
              ? "bg-black/30 backdrop-blur-sm border-white/10"
              : hasBackground
                ? currentBackground?.brightness === 'light'
                  ? "bg-white/30 backdrop-blur-sm border-black/10"
                  : "bg-black/30 backdrop-blur-sm border-white/10"
                : isLeatherCover
                  ? "bg-black/30 backdrop-blur-sm border-amber-200/20"
                  : "bg-black/5 dark:bg-white/5 border-transparent"
          )}>
            {/* Draft badge */}
            {entry.isDraft && (
              <span className={clsx(
                "inline-block mb-1 rounded-full border border-dashed px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
                hasCover || (hasBackground && currentBackground?.brightness === 'dark') || isLeatherCover
                  ? "border-white/40 text-white/90"
                  : "border-border text-primary"
              )}>
                Draft
              </span>
            )}

            {/* Title */}
            {entry.title && (
              <h3 className={clsx(
                "pr-8 text-[14px] font-semibold tracking-[-0.02em] line-clamp-1",
                hasCover
                  ? "text-white"
                  : hasBackground
                    ? getTextColorClasses(currentBackground, 'title')
                    : isLeatherCover
                      ? "text-amber-100"
                      : "text-zinc-900 dark:text-zinc-50"
              )}>
                {entry.title}
              </h3>
            )}

          </div>
        )}

        <div className="relative z-10 w-full flex-1 flex flex-col overflow-hidden">
          <div className="overflow-y-auto pr-1 flex-1">

            {/* Content - show AI summary when cover exists and AI summary enabled, otherwise truncated content */}
            <BlurredContent isLocked={isLocked} onClick={handleView}>
              {showAiSummary && hasCover && isGeneratingSummary ? (
                <div className="flex items-center gap-2 py-2">
                  <Loader2 className={clsx(
                    "h-4 w-4 animate-spin",
                    hasCover || (hasBackground && currentBackground?.brightness === 'dark') || isLeatherCover
                      ? "text-white/70"
                      : "text-zinc-400"
                  )} />
                  <span className={clsx(
                    "text-sm italic",
                    hasCover || (hasBackground && currentBackground?.brightness === 'dark') || isLeatherCover
                      ? "text-white/70"
                      : hasBackground && currentBackground?.brightness === 'light'
                        ? "text-zinc-600"
                        : "text-zinc-400 dark:text-zinc-500"
                  )}>
                    Generating summary...
                  </span>
                </div>
              ) : (
                <p className={clsx(
                  "whitespace-pre-wrap text-[13px] leading-5 tracking-[-0.01em] line-clamp-4",
                  hasCover || (hasBackground && currentBackground?.brightness === 'dark') || isLeatherCover
                    ? "text-white/90"
                    : hasBackground && currentBackground?.brightness === 'light'
                      ? getTextColorClasses(currentBackground, 'body')
                      : "text-zinc-600 dark:text-zinc-400"
                )}>
                  {showAiSummary && hasCover && entry.coverSummary
                    ? entry.coverSummary
                    : truncateContent(entry.content, 200)}
                </p>
              )}
            </BlurredContent>

            {/* Tags */}
            {entry.tags && entry.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-1">
                {entry.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className={clsx(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium",
                      hasCover || (hasBackground && currentBackground?.brightness === 'dark') || isLeatherCover
                        ? "bg-white/10 text-white/90"
                        : hasBackground && currentBackground?.brightness === 'light'
                          ? "bg-black/5 text-zinc-800"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                    )}
                  >
                    {tag}
                  </span>
                ))}

                {entry.tags.length > 2 && (
                  <span className={clsx(
                    "text-[10px]",
                    hasCover || (hasBackground && currentBackground?.brightness === 'dark') || isLeatherCover
                      ? "text-white/70"
                      : hasBackground && currentBackground?.brightness === 'light'
                        ? "text-zinc-600"
                        : "text-zinc-400 dark:text-zinc-500"
                  )}>
                    +{entry.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer with actions - outside overflow wrapper for full-width bg */}
        <footer className={clsx(
          "relative z-10 mt-auto flex items-center justify-between pt-2 -mx-4 -mb-4 px-4 pb-3 rounded-b-2xl border-t",
          hasCover
            ? "bg-black/30 backdrop-blur-sm border-white/10"
            : hasBackground
              ? currentBackground?.brightness === 'light'
                ? "bg-white/30 backdrop-blur-sm border-black/10"
                : "bg-black/30 backdrop-blur-sm border-white/10"
              : isLeatherCover
                ? "bg-black/30 backdrop-blur-sm border-amber-200/20"
                : "bg-black/5 dark:bg-white/5 border-transparent"
        )}>
          {/* Glass pill for date and indicators */}
          <div className={clsx(
            "flex items-center gap-1 px-2 py-0.5 rounded-full backdrop-blur-xl border",
            hasCover || (hasBackground && currentBackground?.brightness === 'dark') || isLeatherCover
              ? "bg-white/10 border-white/20"
              : hasBackground && currentBackground?.brightness === 'light'
                ? "bg-black/5 border-black/10"
                : "bg-zinc-100/80 dark:bg-zinc-800/80 border-zinc-200/50 dark:border-zinc-700/50"
          )}>
            {/* Attachments indicator */}
            {entry.attachments && entry.attachments.length > 0 && (
              <span className={clsx(
                "h-5 flex items-center gap-1 px-1.5 rounded-full text-[10px] font-medium",
                hasCover || (hasBackground && currentBackground?.brightness === 'dark') || isLeatherCover
                  ? "text-white/70"
                  : hasBackground && currentBackground?.brightness === 'light'
                    ? "text-zinc-700"
                    : "text-zinc-500 dark:text-zinc-400"
              )}>
                <Paperclip className="h-3 w-3" />
                {entry.attachments.length}
              </span>
            )}
            {/* Links indicator */}
            {entry.links && entry.links.length > 0 && (
              <span className={clsx(
                "h-5 flex items-center gap-1 px-1.5 rounded-full text-[10px] font-medium",
                hasCover || (hasBackground && currentBackground?.brightness === 'dark') || isLeatherCover
                  ? "text-white/70"
                  : hasBackground && currentBackground?.brightness === 'light'
                    ? "text-zinc-700"
                    : "text-zinc-500 dark:text-zinc-400"
              )}>
                <LinkIcon className="h-3 w-3" />
                {entry.links.length}
              </span>
            )}
            {/* Date */}
            <span className={clsx(
              "h-5 flex items-center px-1.5 rounded-full text-[10px] font-medium",
              hasCover || (hasBackground && currentBackground?.brightness === 'dark') || isLeatherCover
                ? "text-white/70"
                : hasBackground && currentBackground?.brightness === 'light'
                  ? "text-zinc-700"
                  : "text-zinc-500 dark:text-zinc-400"
            )}>
              {(entry.updatedAt && entry.updatedAt !== entry.createdAt ? new Date(entry.updatedAt) : new Date(entry.createdAt)).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
              {entry.updatedAt && entry.updatedAt !== entry.createdAt ? ' · Edited' : ''}
            </span>
          </div>

          {/* Glass pill for action buttons */}
          <div className={clsx(
            "flex items-center gap-1 px-1.5 py-0.5 rounded-full backdrop-blur-xl border",
            hasCover || (hasBackground && currentBackground?.brightness === 'dark') || isLeatherCover
              ? "bg-white/10 border-white/20"
              : hasBackground && currentBackground?.brightness === 'light'
                ? "bg-black/5 border-black/10"
                : "bg-zinc-100/80 dark:bg-zinc-800/80 border-zinc-200/50 dark:border-zinc-700/50"
          )}>
            <button
              type="button"
              onClick={handleDeleteClick}
              className={clsx(
                "h-5 w-5 rounded-full flex items-center justify-center transition",
                hasCover || (hasBackground && currentBackground?.brightness === 'dark') || isLeatherCover
                  ? "text-red-300 hover:bg-red-500/30 hover:text-red-200"
                  : hasBackground && currentBackground?.brightness === 'light'
                    ? "text-red-600 hover:bg-red-500/20 hover:text-red-700"
                    : "text-red-400 hover:bg-red-500/20 hover:text-red-500"
              )}
              aria-label="Delete entry"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </footer>
      </article>

      {/* Modals */}
      {isEditing && (
        <JournalEntryEditor
          entry={entry}
          onClose={() => setIsEditing(false)}
          onSaved={onUpdate}
        />
      )}

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete this entry?"
        description="This will permanently delete your journal entry. This action cannot be undone."
        confirmText="Delete entry"
        cancelText="Keep entry"
        variant="danger"
      />

      <PasscodeModal
        isOpen={showPasscodeModal}
        onClose={() => {
          setShowPasscodeModal(false);
          setPendingAction(null);
        }}
        onSubmit={handlePasscodeSubmit}
        mode={hasPasscode ? 'verify' : 'setup'}
        title={hasPasscode ? 'Unlock Private Entries' : 'Set Privacy Passcode'}
      />
    </>
  );
}
