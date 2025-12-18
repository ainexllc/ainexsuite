"use client";

import { useState, useMemo } from 'react';
import { clsx } from 'clsx';
import type { JournalEntry, EntryColor } from '@ainexsuite/types';
import { getMoodIcon, getMoodLabel } from '@/lib/utils/mood';
import { deleteJournalEntry, toggleEntryPin, toggleEntryArchive, updateEntryColor } from '@/lib/firebase/firestore';
import { deleteAllEntryFiles } from '@/lib/firebase/storage';
import { useToast, ConfirmationDialog, ENTRY_COLORS } from '@ainexsuite/ui';
import { useRouter } from 'next/navigation';
import {
  Paperclip,
  Trash2,
  Link as LinkIcon,
  Lock,
  Unlock,
  Pin,
  Archive,
  Palette,
  ImageIcon,
} from 'lucide-react';
import { usePrivacy, BlurredContent, PasscodeModal } from '@ainexsuite/privacy';
import { JournalEntryEditor } from './journal-entry-editor';
import { useBackgrounds } from '@/hooks/use-backgrounds';
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

  // Private entries logic
  const isLocked = entry.isPrivate && hasPasscode && !isUnlocked;

  // Get color configuration
  const entryColorConfig = ENTRY_COLORS.find((c) => c.id === (entry.color || 'default'));
  const cardClass = entryColorConfig?.cardClass || 'bg-zinc-50 dark:bg-zinc-900';

  // Fetch backgrounds from Firestore
  const { backgrounds: firestoreBackgrounds } = useBackgrounds();

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
          !hasBackground && cardClass,
          'border border-zinc-200 dark:border-zinc-800',
          'group relative cursor-pointer overflow-hidden rounded-2xl transition-all duration-200',
          'hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md',
          'break-inside-avoid px-6 py-6',
        )}
        onClick={handleCardClick}
      >
        {/* Background image layer */}
        {hasBackground && currentBackground && (
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <img
              src={currentBackground.thumbnail}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className={getOverlayClasses(currentBackground, entry.backgroundOverlay || 'auto')} />
          </div>
        )}

        {/* Background indicator badge */}
        {hasBackground && (
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

        <div className="relative z-10 w-full">
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
            className="overflow-y-auto pr-1 max-h-[480px]"
            onScroll={() => {
              if (showPalette) {
                setShowPalette(false);
              }
            }}
          >
            {/* Header with badges */}
            <div className="mb-3 flex items-center gap-2 flex-wrap pr-8">
              {entry.isPrivate && (
                <div
                  className="flex items-center"
                  title={
                    !hasPasscode
                      ? 'Private entry (no passcode set)'
                      : isLocked
                        ? 'Private entry (locked)'
                        : 'Private entry (unlocked)'
                  }
                >
                  {!hasPasscode ? (
                    <Lock className="h-4 w-4 text-amber-500" />
                  ) : isLocked ? (
                    <Lock className="h-4 w-4 text-red-500" />
                  ) : (
                    <Unlock className="h-4 w-4 text-green-500" />
                  )}
                </div>
              )}
              {entry.isDraft && (
                <span className="rounded-full border border-dashed border-border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
                  Draft
                </span>
              )}
            </div>

            {/* Title */}
            {entry.title && (
              <h3 className={clsx(
                "pr-8 text-[17px] font-semibold tracking-[-0.02em]",
                hasBackground
                  ? getTextColorClasses(currentBackground, 'title')
                  : "text-zinc-900 dark:text-zinc-50"
              )}>
                {entry.title}
              </h3>
            )}

            {/* Content */}
            <BlurredContent isLocked={isLocked} onClick={handleView} className="mt-3">
              <p className={clsx(
                "whitespace-pre-wrap text-[15px] leading-7 tracking-[-0.01em] line-clamp-4",
                hasBackground
                  ? getTextColorClasses(currentBackground, 'body')
                  : "text-zinc-600 dark:text-zinc-400"
              )}>
                {truncateContent(entry.content, 200)}
              </p>
            </BlurredContent>

            {/* Mood and Tags */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {entry.mood && (() => {
                const Icon = getMoodIcon(entry.mood);
                return (
                  <span className={clsx(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                    hasBackground
                      ? currentBackground?.brightness === 'dark'
                        ? "bg-white/10 text-white/90"
                        : "bg-black/5 text-zinc-800"
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
                    hasBackground
                      ? currentBackground?.brightness === 'dark'
                        ? "bg-white/10 text-white/90"
                        : "bg-black/5 text-zinc-800"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                  )}
                >
                  {tag}
                </span>
              ))}

              {entry.tags && entry.tags.length > 3 && (
                <span className={clsx(
                  "text-xs",
                  hasBackground
                    ? getTextColorClasses(currentBackground, 'muted')
                    : "text-zinc-400 dark:text-zinc-500"
                )}>
                  +{entry.tags.length - 3} more
                </span>
              )}
            </div>
          </div>

          {/* Footer with actions */}
          <footer className="mt-4 flex items-center justify-between pt-3 -mx-6 -mb-6 px-6 pb-4 rounded-b-2xl">
            <div className={clsx(
              "flex items-center gap-2 text-[11px] uppercase tracking-wide",
              hasBackground
                ? getTextColorClasses(currentBackground, 'muted')
                : "text-zinc-500 dark:text-zinc-400"
            )}>
              {/* Attachments indicator */}
              {entry.attachments && entry.attachments.length > 0 && (
                <span className={clsx(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                  hasBackground
                    ? currentBackground?.brightness === 'dark'
                      ? "bg-white/10 text-white/80"
                      : "bg-black/5 text-zinc-700"
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
                  hasBackground
                    ? currentBackground?.brightness === 'dark'
                      ? "bg-white/10 text-white/80"
                      : "bg-black/5 text-zinc-700"
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
                  hasBackground
                    ? currentBackground?.brightness === 'dark'
                      ? "text-white/70 hover:bg-white/20 hover:text-white"
                      : "text-zinc-600 hover:bg-black/10 hover:text-zinc-900"
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
                    hasBackground
                      ? currentBackground?.brightness === 'dark'
                        ? clsx(
                            "text-white/70 hover:bg-white/20 hover:text-white",
                            showPalette && "bg-white/20 text-white"
                          )
                        : clsx(
                            "text-zinc-600 hover:bg-black/10 hover:text-zinc-900",
                            showPalette && "bg-black/10 text-zinc-900"
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
