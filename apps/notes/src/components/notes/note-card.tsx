"use client";

/* eslint-disable @next/next/no-img-element */

import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import {
  Trash2,
  Users,
  Flame,
  X,
} from "lucide-react";
import { FocusIcon } from "@/components/icons/focus-icon";
import { clsx } from "clsx";
import { ConfirmationDialog, FocusGlow } from "@ainexsuite/ui";
import type { Note, NotePriority } from "@/lib/types/note";
import { useNotes } from "@/components/providers/notes-provider";
import { NOTE_COLORS } from "@/lib/constants/note-colors";
import { NoteEditor } from "@/components/notes/note-editor";
import { useLabels } from "@/components/providers/labels-provider";
import { getBackgroundById, getTextColorClasses, getOverlayClasses, FALLBACK_BACKGROUNDS } from "@/lib/backgrounds";
import { useBackgrounds } from "@/components/providers/backgrounds-provider";
import { useCovers } from "@/components/providers/covers-provider";
import { ImageModal } from "@/components/ui/image-modal";
import { useAuth } from "@ainexsuite/auth";

type NoteCardProps = {
  note: Note;
};

export function NoteCard({ note }: NoteCardProps) {
  const { togglePin, deleteNote, updateNote } = useNotes();
  const { labels } = useLabels();
  const { backgrounds: firestoreBackgrounds } = useBackgrounds();
  const { covers } = useCovers();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const priorityPickerRef = useRef<HTMLDivElement>(null);

  // Close priority picker when clicking outside
  useEffect(() => {
    if (!showPriorityPicker) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (priorityPickerRef.current && !priorityPickerRef.current.contains(event.target as Node)) {
        setShowPriorityPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPriorityPicker]);

  // Only show delete button if current user is the note owner
  // Also allow if ownerId is not set (backwards compatibility with older notes)
  const canDelete = !note.ownerId || user?.uid === note.ownerId;

  const labelMap = useMemo(() => {
    return new Map(labels.map((label) => [label.id, label]));
  }, [labels]);

  const noteLabels = useMemo(() => {
    return note.labelIds
      .map((labelId) => labelMap.get(labelId))
      .filter((label): label is NonNullable<typeof label> => Boolean(label));
  }, [note.labelIds, labelMap]);

  // Combine Firestore backgrounds with fallback
  const availableBackgrounds = useMemo(() => {
    return firestoreBackgrounds.length > 0 ? firestoreBackgrounds : FALLBACK_BACKGROUNDS;
  }, [firestoreBackgrounds]);

  const noteColorConfig = NOTE_COLORS.find((c) => c.id === note.color);
  const cardClass = noteColorConfig?.cardClass || "bg-zinc-50 dark:bg-zinc-900";
  const backgroundImage = note.backgroundImage ? getBackgroundById(note.backgroundImage, availableBackgrounds) ?? null : null;

  // Get current cover object
  const currentCover = useMemo(() => {
    if (!note.coverImage) return null;
    return covers.find((c) => c.id === note.coverImage) || null;
  }, [note.coverImage, covers]);

  // Determine if we're using a cover image
  const hasCover = currentCover !== null;

  const handleDeleteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (isDeleting) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteNote(note.id);
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    if (isDeleting) {
      return;
    }
    setShowDeleteConfirm(false);
  };

  const handlePin = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    await togglePin(note.id, !note.pinned);
  };

  // Toggle priority picker
  const handlePriorityClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setShowPriorityPicker((prev) => !prev);
  }, []);

  // Set specific priority
  const handleSetPriority = useCallback(async (priority: NotePriority | null, event: React.MouseEvent) => {
    event.stopPropagation();
    await updateNote(note.id, { priority });
    setShowPriorityPicker(false);
  }, [note.id, updateNote]);

  return (
    <>
      <article
        className={clsx(
          // Use theme lab color system for light/dark mode
          !backgroundImage && !hasCover && cardClass,
          "border border-zinc-200 dark:border-zinc-800",
          "group relative cursor-pointer overflow-hidden rounded-2xl",
          // Only transition on hover, not on initial render (prevents blinking)
          "hover:transition-[border-color,box-shadow,transform] hover:duration-200",
          "hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md",
          "break-inside-avoid px-4 py-4 h-[220px] flex flex-col",
        )}
        onClick={() => setIsEditing(true)}
      >
        {/* Animated glow effect for pinned cards */}
        {note.pinned && <FocusGlow />}

        {/* Cover Image Layer */}
        {hasCover && !backgroundImage && currentCover && (
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <img
              src={currentCover.thumbnail}
              alt=""
              className="absolute inset-0 w-full h-full object-cover z-0"
            />
            {/* Subtle overlay for text readability */}
            <div className="absolute inset-0 bg-black/30 z-10" />
          </div>
        )}

        {/* Background Image Layer */}
        {backgroundImage && (
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `url(${backgroundImage.fullImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Overlay for text readability */}
            <div className={clsx(getOverlayClasses(backgroundImage, note.backgroundOverlay ?? 'auto'), 'z-10')} />
          </div>
        )}

        {/* Corner Focus Badge - clickable to toggle focus */}
        <button
          type="button"
          onClick={handlePin}
          className="absolute -top-0 -right-0 w-10 h-10 overflow-hidden rounded-tr-lg z-20 group/pin"
          aria-label={note.pinned ? "Remove from Focus" : "Add to Focus"}
        >
          {note.pinned ? (
            <>
              <div className="absolute top-0 right-0 bg-[var(--color-primary)] group-hover/pin:brightness-90 w-14 h-14 rotate-45 translate-x-7 -translate-y-7 transition-all" />
              <FocusIcon focused className="absolute top-1.5 right-1.5 h-3 w-3 text-white" />
            </>
          ) : (
            <>
              <div className={clsx(
                "absolute top-0 right-0 w-14 h-14 rotate-45 translate-x-7 -translate-y-7 transition-all",
                "opacity-0 group-hover:opacity-100",
                backgroundImage?.brightness === 'light'
                  ? "bg-black/10"
                  : backgroundImage || hasCover
                    ? "bg-white/10"
                    : "bg-zinc-200/50 dark:bg-zinc-700/50"
              )} />
              <FocusIcon className={clsx(
                "absolute top-1.5 right-1.5 h-3 w-3 transition-all",
                "opacity-0 group-hover:opacity-100",
                backgroundImage?.brightness === 'light'
                  ? "text-[var(--color-primary)]"
                  : backgroundImage || hasCover
                    ? "text-[var(--color-primary)]/80"
                    : "text-[var(--color-primary)]"
              )} />
            </>
          )}
        </button>

        {/* Header with title */}
        {note.title && (
          <div className={clsx(
            "relative z-10 -mx-4 -mt-4 px-4 py-2.5 rounded-t-2xl border-b mb-2",
            backgroundImage?.brightness === 'light'
              ? "bg-white/30 backdrop-blur-sm border-black/10"
              : backgroundImage
                ? "bg-black/30 backdrop-blur-sm border-white/10"
                : hasCover
                  ? "bg-black/30 backdrop-blur-sm border-white/10"
                  : "border-transparent"
          )}>
            <h3 className={clsx(
              "pr-8 text-[14px] font-semibold tracking-[-0.02em] line-clamp-1",
              hasCover && !backgroundImage
                ? "text-white"
                : getTextColorClasses(backgroundImage, 'title')
            )}>
              {note.title}
            </h3>
          </div>
        )}

        <div className="relative z-10 w-full flex-1 flex flex-col overflow-hidden">
          <div
            className="overflow-y-auto pr-1 flex-1"
          >

            {note.type === "checklist" ? (
              <>
              <ul className="space-y-1">
                {note.checklist.slice(0, 5).map((item) => {
                  const indentLevel = item.indent ?? 0;
                  return (
                    <li
                      key={item.id}
                      className={clsx(
                        "flex items-start gap-2 text-[12px]",
                        item.completed
                          ? clsx(
                              hasCover && !backgroundImage
                                ? "text-white/50"
                                : getTextColorClasses(backgroundImage, 'checklist-completed'),
                              "line-through"
                            )
                          : hasCover && !backgroundImage
                            ? "text-white/90"
                            : getTextColorClasses(backgroundImage, 'checklist'),
                      )}
                      style={{ paddingLeft: `${indentLevel * 12}px` }}
                    >
                      <span className={clsx(
                        "mt-1 h-1.5 w-1.5 rounded-full flex-shrink-0",
                        item.completed
                          ? hasCover && !backgroundImage
                            ? "bg-white/30"
                            : backgroundImage?.brightness === 'light' ? "bg-black/20" : backgroundImage ? "bg-white/30" : "bg-zinc-300 dark:bg-zinc-700"
                          : "bg-yellow-500"
                      )} />
                      <span className="line-clamp-1">{item.text}</span>
                    </li>
                  );
                })}
                {note.checklist.length > 5 ? (
                  <li className={clsx(
                    "text-[10px]",
                    hasCover && !backgroundImage
                      ? "text-white/70"
                      : getTextColorClasses(backgroundImage, 'muted')
                  )}>
                    +{note.checklist.length - 5} more
                  </li>
                ) : null}
              </ul>
              {/* Progress indicator */}
              {note.checklist.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className={clsx(
                    "flex-1 h-1 rounded-full overflow-hidden",
                    hasCover && !backgroundImage
                      ? "bg-white/20"
                      : backgroundImage?.brightness === 'light'
                        ? "bg-black/10"
                        : backgroundImage
                          ? "bg-white/20"
                          : "bg-zinc-200 dark:bg-zinc-700"
                  )}>
                    <div
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{
                        width: `${(note.checklist.filter(i => i.completed).length / note.checklist.length) * 100}%`
                      }}
                    />
                  </div>
                  <span className={clsx(
                    "text-[10px] font-medium tabular-nums",
                    hasCover && !backgroundImage
                      ? "text-white/70"
                      : getTextColorClasses(backgroundImage, 'muted')
                  )}>
                    {note.checklist.filter(i => i.completed).length}/{note.checklist.length}
                  </span>
                </div>
              )}
              </>
            ) : note.body ? (
              <p className={clsx(
                "whitespace-pre-wrap text-[13px] leading-5 tracking-[-0.01em] line-clamp-4",
                hasCover && !backgroundImage
                  ? "text-white/90"
                  : getTextColorClasses(backgroundImage, 'body')
              )}>
                {note.body}
              </p>
            ) : null}

            {note.attachments.length ? (
              <div className="mt-2 grid gap-1.5 grid-cols-2">
                {note.attachments.slice(0, 2).map((attachment) => (
                  <figure
                    key={attachment.id}
                    className="overflow-hidden rounded-lg bg-foreground/10 shadow-sm border border-border cursor-zoom-in hover:brightness-95 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewImage(attachment.downloadURL);
                    }}
                  >
                    <img
                      src={attachment.downloadURL}
                      alt={attachment.name}
                      className="h-16 w-full object-cover"
                    />
                  </figure>
                ))}
                {note.attachments.length > 2 ? (
                  <div className="grid place-items-center rounded-lg bg-foreground/10 p-2 text-[10px] font-medium text-muted-foreground">
                    +{note.attachments.length - 2} more
                  </div>
                ) : null}
              </div>
            ) : null}

            {noteLabels.length ? (
              <div className="mt-2 flex flex-wrap items-center gap-1">
                {noteLabels.slice(0, 2).map((label) => (
                  <span
                    key={label.id}
                    className={clsx(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium",
                      hasCover && !backgroundImage
                        ? "bg-white/10 text-white/90"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                    )}
                  >
                    <span
                      className={clsx(
                        "h-1.5 w-1.5 rounded-full",
                        label.color === "default"
                          ? "bg-zinc-400"
                          : `bg-${label.color}-500`,
                      )}
                    />
                    <span>{label.name}</span>
                  </span>
                ))}
                {noteLabels.length > 2 && (
                  <span className="text-[10px] text-zinc-400">+{noteLabels.length - 2}</span>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer - outside overflow wrapper so it extends to card edges */}
        <footer className={clsx(
          "relative z-10 mt-auto flex items-center justify-between pt-1.5 -mx-4 -mb-4 px-4 pb-2 rounded-b-2xl border-t",
          backgroundImage?.brightness === 'light'
            ? "bg-white/30 backdrop-blur-sm border-black/10"
            : backgroundImage
              ? "bg-black/30 backdrop-blur-sm border-white/10"
              : hasCover
                ? "bg-black/30 backdrop-blur-sm border-white/10"
                : "bg-black/5 dark:bg-white/5 border-transparent"
        )}>
          {/* Glass pill for date/shared info */}
          <div className={clsx(
            "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full backdrop-blur-xl border",
            backgroundImage
              ? backgroundImage.brightness === 'dark'
                ? "bg-white/10 border-white/20"
                : "bg-black/5 border-black/10"
              : hasCover
                ? "bg-white/10 border-white/20"
                : "bg-zinc-100/80 dark:bg-zinc-800/80 border-zinc-200/50 dark:border-zinc-700/50"
          )}>
            {note.sharedWithUserIds?.length ? (
              <span className={clsx(
                "h-5 flex items-center gap-1 rounded-full px-1.5 text-[10px] font-medium",
                hasCover && !backgroundImage
                  ? "text-white/70"
                  : getTextColorClasses(backgroundImage, 'muted')
              )}>
                <Users className="h-3 w-3" />
                {note.sharedWithUserIds.length}
              </span>
            ) : null}
            <span className={clsx(
              "h-5 flex items-center px-1.5 rounded-full text-[10px] font-medium",
              hasCover && !backgroundImage
                ? "text-white/70"
                : getTextColorClasses(backgroundImage, 'muted')
            )}>
              {(note.updatedAt.getTime() !== note.createdAt.getTime() ? note.updatedAt : note.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
              {' · '}
              {note.updatedAt.getTime() !== note.createdAt.getTime() ? 'Edited' : 'Created'}
            </span>
          </div>
          {/* Glass pill for actions */}
          <div className={clsx(
            "flex items-center gap-0.5 px-1 py-0.5 rounded-full backdrop-blur-xl border",
            backgroundImage
              ? backgroundImage.brightness === 'dark'
                ? "bg-white/10 border-white/20"
                : "bg-black/5 border-black/10"
              : hasCover
                ? "bg-white/10 border-white/20"
                : "bg-zinc-100/80 dark:bg-zinc-800/80 border-zinc-200/50 dark:border-zinc-700/50"
          )}>
            {/* Priority Indicator - clickable by any space member */}
            <div className="relative" ref={priorityPickerRef}>
              <button
                type="button"
                onClick={handlePriorityClick}
                className={clsx(
                  "h-5 w-5 rounded-full flex items-center justify-center transition-all",
                  backgroundImage?.brightness === 'light'
                    ? "hover:bg-black/10"
                    : backgroundImage || hasCover
                      ? "hover:bg-white/20"
                      : "hover:bg-zinc-200 dark:hover:bg-zinc-700"
                )}
                title={note.priority
                  ? `${note.priority.charAt(0).toUpperCase() + note.priority.slice(1)} priority (click to change)`
                  : "Set priority"
                }
              >
                <Flame className={clsx(
                  "h-3.5 w-3.5",
                  note.priority === "high"
                    ? "text-red-500"
                    : note.priority === "medium"
                      ? "text-amber-500"
                      : note.priority === "low"
                        ? "text-blue-500"
                        : backgroundImage?.brightness === 'light'
                          ? "text-zinc-500"
                          : backgroundImage || hasCover
                            ? "text-white/60"
                            : "text-zinc-400 dark:text-zinc-500"
                )} />
              </button>
              {showPriorityPicker && (
                <div
                  className="absolute bottom-7 right-0 z-50 flex flex-col gap-0.5 rounded-2xl bg-zinc-900 border border-zinc-700 p-1.5 shadow-2xl min-w-[100px] animate-in fade-in slide-in-from-bottom-2 duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={(e) => handleSetPriority("high", e)}
                    className={clsx(
                      "flex items-center gap-1.5 px-2 py-1 rounded-xl text-xs font-medium transition",
                      note.priority === "high"
                        ? "bg-red-500/20 text-red-400"
                        : "text-zinc-300 hover:bg-zinc-800"
                    )}
                  >
                    <Flame className="h-3 w-3 text-red-500" />
                    High
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleSetPriority("medium", e)}
                    className={clsx(
                      "flex items-center gap-1.5 px-2 py-1 rounded-xl text-xs font-medium transition",
                      note.priority === "medium"
                        ? "bg-amber-500/20 text-amber-400"
                        : "text-zinc-300 hover:bg-zinc-800"
                    )}
                  >
                    <Flame className="h-3 w-3 text-amber-500" />
                    Medium
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleSetPriority("low", e)}
                    className={clsx(
                      "flex items-center gap-1.5 px-2 py-1 rounded-xl text-xs font-medium transition",
                      note.priority === "low"
                        ? "bg-blue-500/20 text-blue-400"
                        : "text-zinc-300 hover:bg-zinc-800"
                    )}
                  >
                    <Flame className="h-3 w-3 text-blue-500" />
                    Low
                  </button>
                  {note.priority && (
                    <>
                      <div className="h-px bg-zinc-700 my-0.5" />
                      <button
                        type="button"
                        onClick={(e) => handleSetPriority(null, e)}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-xl text-xs font-medium text-zinc-400 hover:bg-zinc-800 transition"
                      >
                        <X className="h-3 w-3" />
                        Clear
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
            {/* Only show delete button to the note owner */}
            {canDelete && (
              <button
                type="button"
                onClick={handleDeleteClick}
                className={clsx(
                  "h-5 w-5 rounded-full flex items-center justify-center transition",
                  backgroundImage?.brightness === 'light'
                    ? "text-red-600 hover:bg-red-500/20 hover:text-red-700"
                    : backgroundImage
                      ? "text-red-300 hover:bg-red-500/30 hover:text-red-200"
                      : hasCover
                        ? "text-red-300 hover:bg-red-500/30 hover:text-red-200"
                        : "text-red-400 hover:bg-red-500/20 hover:text-red-500"
                )}
                aria-label="Delete note"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        </footer>
      </article>

      {isEditing ? (
        <NoteEditor note={note} onClose={() => setIsEditing(false)} />
      ) : null}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete this note?"
        description="This will move the note to the Trash. You can restore it from there within the next 30 days."
        confirmText="Delete note"
        cancelText="Keep note"
        variant="danger"
      />
      <ImageModal
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        src={previewImage || ""}
      />
    </>
  );
}
