"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import type { JournalEntry, EntryColor } from '@ainexsuite/types';
import { getMoodIcon, getMoodLabel } from '@/lib/utils/mood';
import { deleteJournalEntry, toggleEntryPin, toggleEntryArchive, updateEntryColor, updateJournalEntry } from '@/lib/firebase/firestore';
import { deleteAllEntryFiles } from '@/lib/firebase/storage';
import { useToast, ConfirmationDialog, ENTRY_COLORS } from '@ainexsuite/ui';
import { useRouter } from 'next/navigation';
import {
  Paperclip,
  Trash2,
  Link as LinkIcon,
  Pin,
  Archive,
  Palette,
  ImageIcon,
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
  const [showPalette, setShowPalette] = useState(false);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'view' | 'edit' | null>(null);
  const { isUnlocked, hasPasscode, verifyPasscode, setupPasscode } = usePrivacy();

  // Private entries logic - blur content when private, regardless of passcode setup
  const isLocked = entry.isPrivate && !isUnlocked;

  // Get color configuration
  const entryColorConfig = ENTRY_COLORS.find((c) => c.id === (entry.color || 'default'));
  const cardClass = entryColorConfig?.cardClass || 'bg-zinc-50 dark:bg-zinc-900';

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

  const handleArchive = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    await toggleEntryArchive(entry.id, !entry.archived);
    onUpdate();
  };

  const handleOpenPalette = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setShowPalette((prev) => !prev);
  };

  const handleColorSelect = async (
    event: React.MouseEvent<HTMLButtonElement>,
    color: EntryColor,
  ) => {
    event.stopPropagation();
    if (color === entry.color) {
      setShowPalette(false);
      return;
    }
    await updateEntryColor(entry.id, color);
    setShowPalette(false);
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
          !hasBackground && !isLeatherCover && !hasCover && cardClass,
          'border border-zinc-200 dark:border-zinc-800',
          'group relative cursor-pointer overflow-hidden rounded-2xl transition-all duration-200',
          'hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md',
          'break-inside-avoid px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6',
          // Responsive heights: taller on mobile (single column), shorter with more columns
          'h-[240px] sm:h-[260px] lg:h-[280px]',
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

        {/* Cover indicator badge - show when cover is set */}
        {hasCover && (
          <div className="absolute top-2 left-2 z-20 h-6 w-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center" title="Has cover image">
            <ImageIcon className="h-3 w-3 text-white/80" />
          </div>
        )}

        {/* Background indicator badge - only show if no cover */}
        {!hasCover && hasBackground && (
          <div className="absolute top-2 left-2 z-20 h-6 w-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center" title="Has background image">
            <ImageIcon className="h-3 w-3 text-white/80" />
          </div>
        )}

        {/* Corner Pin Badge - clickable to unpin */}
        {entry.pinned && (
          <button
            type="button"
            onClick={handlePin}
            className="absolute -top-0 -right-0 w-10 h-10 overflow-hidden rounded-tr-lg z-20 group/pin"
            aria-label="Unpin entry"
          >
            <div className="absolute top-0 right-0 bg-amber-500 group-hover/pin:bg-amber-600 w-14 h-14 rotate-45 translate-x-7 -translate-y-7 transition-colors" />
            <Pin className="absolute top-1.5 right-1.5 h-3 w-3 text-white" />
          </button>
        )}

        <div className="relative z-10 w-full h-full flex flex-col">
          {/* Pin button - only shows on unpinned entries */}
          {!entry.pinned && (
            <button
              type="button"
              onClick={handlePin}
              className="absolute right-2 top-2 z-20 hidden rounded-full p-2 transition group-hover:flex bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-700 dark:hover:text-zinc-200"
              aria-label="Pin entry"
            >
              <Pin className="h-4 w-4" />
            </button>
          )}

          <div
            className="overflow-hidden pr-1 flex-1"
            onScroll={() => {
              if (showPalette) {
                setShowPalette(false);
              }
            }}
          >
            {/* Header with badges */}
            <div className="mb-3 flex items-center gap-2 flex-wrap pr-8">
              {entry.isDraft && (
                <span className="rounded-full border border-dashed border-border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
                  Draft
                </span>
              )}
            </div>

            {/* Title */}
            {entry.title && (
              <h3 className={clsx(
                "pr-8 text-base sm:text-[17px] font-semibold tracking-[-0.02em] line-clamp-2",
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

            {/* Content - compact in list view with covers, show AI summary when cover exists and AI summary enabled, otherwise truncated content */}
            <BlurredContent isLocked={isLocked} onClick={handleView} className="mt-3">
              {showAiSummary && hasCover && isGeneratingSummary ? (
                <div className="flex items-center gap-2 py-2">
                  <Loader2 className={clsx(
                    "h-4 w-4 animate-spin",
                    hasCover ? "text-white/70" : "text-zinc-400"
                  )} />
                  <span className={clsx(
                    "text-sm italic",
                    hasCover
                      ? "text-white/70"
                      : hasBackground
                        ? getTextColorClasses(currentBackground, 'muted')
                        : isLeatherCover
                          ? "text-amber-200/70"
                          : "text-zinc-400 dark:text-zinc-500"
                  )}>
                    Generating summary...
                  </span>
                </div>
              ) : (
                <p className={clsx(
                  "whitespace-pre-wrap text-sm sm:text-[15px] leading-6 sm:leading-7 tracking-[-0.01em]",
                  "line-clamp-2 sm:line-clamp-3 lg:line-clamp-4",
                  hasCover
                    ? "text-white/90"
                    : hasBackground
                      ? getTextColorClasses(currentBackground, 'body')
                      : isLeatherCover
                        ? "text-amber-100/90"
                        : "text-zinc-600 dark:text-zinc-400"
                )}>
                  {showAiSummary && hasCover && entry.coverSummary
                    ? entry.coverSummary
                    : truncateContent(entry.content, 150)}
                </p>
              )}
            </BlurredContent>

            {/* Mood and Tags */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {entry.mood && (() => {
                const Icon = getMoodIcon(entry.mood);
                return (
                  <span className={clsx(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                    hasCover
                      ? "bg-white/10 text-white/90"
                      : hasBackground
                        ? currentBackground?.brightness === 'dark'
                          ? "bg-white/10 text-white/90"
                          : "bg-black/5 text-zinc-800"
                        : isLeatherCover
                          ? "bg-amber-950/50 text-amber-100/90"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                  )}>
                    <Icon className="h-3.5 w-3.5" />
                    <span>{getMoodLabel(entry.mood)}</span>
                  </span>
                );
              })()}

              {entry.tags?.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className={clsx(
                    "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                    hasCover
                      ? "bg-white/10 text-white/90"
                      : hasBackground
                        ? currentBackground?.brightness === 'dark'
                          ? "bg-white/10 text-white/90"
                          : "bg-black/5 text-zinc-800"
                        : isLeatherCover
                          ? "bg-amber-950/50 text-amber-100/90"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                  )}
                >
                  {tag}
                </span>
              ))}

              {entry.tags && entry.tags.length > 3 && (
                <span className={clsx(
                  "text-xs",
                  hasCover
                    ? "text-white/70"
                    : hasBackground
                      ? getTextColorClasses(currentBackground, 'muted')
                      : isLeatherCover
                        ? "text-amber-200/70"
                        : "text-zinc-400 dark:text-zinc-500"
                )}>
                  +{entry.tags.length - 3} more
                </span>
              )}
            </div>
          </div>

          {/* Footer with actions */}
          <footer className="mt-auto flex items-center justify-between pt-3">
            <div className={clsx(
              "flex items-center gap-2 text-[11px] uppercase tracking-wide",
              hasCover
                ? "text-white/70"
                : hasBackground
                  ? getTextColorClasses(currentBackground, 'muted')
                  : isLeatherCover
                    ? "text-amber-200/70"
                    : "text-zinc-500 dark:text-zinc-400"
            )}>
              {/* Attachments indicator */}
              {entry.attachments && entry.attachments.length > 0 && (
                <span className={clsx(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                  hasCover
                    ? "bg-white/10 text-white/80"
                    : hasBackground
                      ? currentBackground?.brightness === 'dark'
                        ? "bg-white/10 text-white/80"
                        : "bg-black/5 text-zinc-700"
                      : isLeatherCover
                        ? "bg-amber-950/50 text-amber-100/80"
                        : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                )}>
                  <Paperclip className="h-3 w-3" />
                  {entry.attachments.length}
                </span>
              )}
              {/* Links indicator */}
              {entry.links && entry.links.length > 0 && (
                <span className={clsx(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                  hasCover
                    ? "bg-white/10 text-white/80"
                    : hasBackground
                      ? currentBackground?.brightness === 'dark'
                        ? "bg-white/10 text-white/80"
                        : "bg-black/5 text-zinc-700"
                      : isLeatherCover
                        ? "bg-amber-950/50 text-amber-100/80"
                        : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                )}>
                  <LinkIcon className="h-3 w-3" />
                  {entry.links.length}
                </span>
              )}
              <span>
                {(entry.updatedAt && entry.updatedAt !== entry.createdAt ? new Date(entry.updatedAt) : new Date(entry.createdAt)).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleArchive}
                className={clsx(
                  "h-7 w-7 rounded-full flex items-center justify-center transition",
                  hasCover
                    ? "text-white/70 hover:bg-white/20 hover:text-white"
                    : hasBackground
                      ? currentBackground?.brightness === 'dark'
                        ? "text-white/70 hover:bg-white/20 hover:text-white"
                        : "text-zinc-600 hover:bg-black/10 hover:text-zinc-900"
                      : isLeatherCover
                        ? "text-amber-200/70 hover:bg-amber-950/50 hover:text-amber-100"
                        : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-700 dark:hover:text-zinc-200"
                )}
                aria-label={entry.archived ? 'Unarchive entry' : 'Archive entry'}
              >
                <Archive className="h-3.5 w-3.5" />
              </button>

              {/* Color picker */}
              <div className="relative flex items-center">
                <button
                  type="button"
                  onClick={handleOpenPalette}
                  className={clsx(
                    'h-7 w-7 rounded-full flex items-center justify-center transition',
                    hasCover
                      ? clsx(
                          "text-white/70 hover:bg-white/20 hover:text-white",
                          showPalette && "bg-white/20 text-white"
                        )
                      : hasBackground
                        ? currentBackground?.brightness === 'dark'
                          ? clsx(
                              "text-white/70 hover:bg-white/20 hover:text-white",
                              showPalette && "bg-white/20 text-white"
                            )
                          : clsx(
                              "text-zinc-600 hover:bg-black/10 hover:text-zinc-900",
                              showPalette && "bg-black/10 text-zinc-900"
                            )
                        : isLeatherCover
                          ? clsx(
                              "text-amber-200/70 hover:bg-amber-950/50 hover:text-amber-100",
                              showPalette && "bg-amber-950/50 text-amber-100"
                            )
                          : clsx(
                              'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-700 dark:hover:text-zinc-200',
                              showPalette && 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200'
                            ),
                  )}
                  aria-label="Change color"
                >
                  <Palette className="h-3.5 w-3.5" />
                </button>
                {showPalette && (
                  <div
                    className="absolute bottom-10 right-0 z-30 flex gap-2 rounded-2xl bg-background/95 p-3 shadow-2xl backdrop-blur-xl border border-border"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {ENTRY_COLORS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className={clsx(
                          'h-6 w-6 rounded-full border border-transparent transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500',
                          option.swatchClass,
                          option.id === (entry.color || 'default') && 'ring-2 ring-foreground',
                        )}
                        onClick={(event) => handleColorSelect(event, option.id)}
                        aria-label={`Set color ${option.label}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleDeleteClick}
                className="h-7 w-7 rounded-full flex items-center justify-center transition text-red-400 hover:bg-red-500/20 hover:text-red-500"
                aria-label="Delete entry"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </footer>
        </div>
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
