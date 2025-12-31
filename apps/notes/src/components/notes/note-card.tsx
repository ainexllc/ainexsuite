"use client";

/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react";
import {
  Trash2,
  Users,
  Flame,
  Check,
} from "lucide-react";
import { FocusIcon } from "@/components/icons/focus-icon";
import { clsx } from "clsx";
import { ConfirmationDialog } from "@ainexsuite/ui";
import type { Note } from "@/lib/types/note";
import { useNotes } from "@/components/providers/notes-provider";
import { NOTE_COLORS } from "@/lib/constants/note-colors";
import { NoteEditor } from "@/components/notes/note-editor";
import { useLabels } from "@/components/providers/labels-provider";
import { getBackgroundById, getTextColorClasses, getOverlayClasses, FALLBACK_BACKGROUNDS } from "@/lib/backgrounds";
import { useBackgrounds } from "@/components/providers/backgrounds-provider";
import { useCovers } from "@/components/providers/covers-provider";
import { ImageModal } from "@/components/ui/image-modal";

type NoteCardProps = {
  note: Note;
  isSelectMode?: boolean;
  isSelected?: boolean;
  onSelect?: (noteId: string, event: React.MouseEvent) => void;
};

export function NoteCard({ note, isSelectMode = false, isSelected = false, onSelect }: NoteCardProps) {
  const { togglePin, deleteNote } = useNotes();
  const { labels } = useLabels();
  const { backgrounds: firestoreBackgrounds } = useBackgrounds();
  const { covers } = useCovers();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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

  return (
    <>
      <article
        className={clsx(
          // Use theme lab color system for light/dark mode
          !backgroundImage && !hasCover && cardClass,
          "border border-zinc-200 dark:border-zinc-800",
          "group relative cursor-pointer overflow-hidden rounded-2xl",
          "transition-[border-color,box-shadow,transform] duration-200",
          "hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md",
          "break-inside-avoid px-6 py-6",
          // Selection styles - glow effect and scale
          isSelected && "border-primary dark:border-primary ring-4 ring-primary/20 scale-[0.98]",
        )}
        onClick={(event) => {
          if (isSelectMode && onSelect) {
            event.preventDefault();
            event.stopPropagation();
            onSelect(note.id, event);
          } else {
            setIsEditing(true);
          }
        }}
      >
        {/* Selection Checkbox - shows on hover or in select mode */}
        {onSelect && (
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onSelect(note.id, event);
            }}
            className={clsx(
              "absolute z-30 h-5 w-5 rounded-full transition-all duration-200",
              "flex items-center justify-center",
              "backdrop-blur-xl border shadow-sm",
              // Position in title row, right side but left of pin corner
              "top-4 right-[42px]",
              isSelected
                ? "bg-primary border-primary scale-110"
                : clsx(
                    "border-white/30 dark:border-zinc-600/50",
                    backgroundImage || hasCover
                      ? "bg-black/20"
                      : "bg-white/80 dark:bg-zinc-800/80"
                  ),
              isSelectMode
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100 hover:scale-110",
            )}
            aria-label={isSelected ? "Deselect note" : "Select note"}
          >
            {isSelected ? (
              <Check className="h-3 w-3 text-white" />
            ) : (
              <div className={clsx(
                "h-2 w-2 rounded-full border-[1.5px]",
                backgroundImage || hasCover
                  ? "border-white/50"
                  : "border-zinc-400 dark:border-zinc-500"
              )} />
            )}
          </button>
        )}

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

        {/* Corner Focus Badge - clickable to remove from focus */}
        {note.pinned && (
          <button
            type="button"
            onClick={handlePin}
            className="absolute -top-0 -right-0 w-10 h-10 overflow-hidden rounded-tr-lg z-20 group/pin"
            aria-label="Remove from Focus"
          >
            <div className="absolute top-0 right-0 bg-[var(--color-primary)] group-hover/pin:brightness-90 w-14 h-14 rotate-45 translate-x-7 -translate-y-7 transition-all" />
            <FocusIcon focused className="absolute top-1.5 right-1.5 h-3 w-3 text-white" />
          </button>
        )}

        {/* Header with title */}
        {note.title && (
          <div className={clsx(
            "relative z-10 -mx-6 -mt-6 px-6 py-4 rounded-t-2xl border-b mb-4",
            backgroundImage?.brightness === 'light'
              ? "bg-white/30 backdrop-blur-sm border-black/10"
              : backgroundImage
                ? "bg-black/30 backdrop-blur-sm border-white/10"
                : hasCover
                  ? "bg-black/30 backdrop-blur-sm border-white/10"
                  : "bg-zinc-50/80 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-700/50"
          )}>
            <h3 className={clsx(
              "pr-8 text-[17px] font-semibold tracking-[-0.02em]",
              hasCover && !backgroundImage
                ? "text-white"
                : getTextColorClasses(backgroundImage, 'title')
            )}>
              {note.title}
            </h3>
          </div>
        )}

        <div className="relative z-10 w-full">
          <div
            className="overflow-y-auto pr-1 max-h-[480px]"
          >

            {note.type === "checklist" ? (
              <ul className="mt-3 space-y-2">
                {note.checklist.slice(0, 6).map((item) => (
                  <li
                    key={item.id}
                    className={clsx(
                      "flex items-start gap-2 text-sm",
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
                  >
                    <span className={clsx(
                      "mt-1.5 h-2 w-2 rounded-full flex-shrink-0",
                      item.completed
                        ? hasCover && !backgroundImage
                          ? "bg-white/30"
                          : backgroundImage?.brightness === 'light' ? "bg-black/20" : backgroundImage ? "bg-white/30" : "bg-zinc-300 dark:bg-zinc-700"
                        : "bg-yellow-500"
                    )} />
                    <span>{item.text}</span>
                  </li>
                ))}
                {note.checklist.length > 6 ? (
                  <li className={clsx(
                    "text-xs",
                    hasCover && !backgroundImage
                      ? "text-white/70"
                      : getTextColorClasses(backgroundImage, 'muted')
                  )}>
                    +{note.checklist.length - 6} more
                  </li>
                ) : null}
              </ul>
            ) : note.body ? (
              <p className={clsx(
                "mt-3 whitespace-pre-wrap text-[15px] leading-7 tracking-[-0.01em] line-clamp-6",
                hasCover && !backgroundImage
                  ? "text-white/90"
                  : getTextColorClasses(backgroundImage, 'body')
              )}>
                {note.body}
              </p>
            ) : null}

            {note.attachments.length ? (
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {note.attachments.slice(0, 4).map((attachment) => (
                  <figure
                    key={attachment.id}
                    className="overflow-hidden rounded-2xl bg-foreground/10 shadow-sm border border-border cursor-zoom-in hover:brightness-95 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewImage(attachment.downloadURL);
                    }}
                  >
                    <img
                      src={attachment.downloadURL}
                      alt={attachment.name}
                      className="h-24 w-full object-cover"
                    />
                  </figure>
                ))}
                {note.attachments.length > 4 ? (
                  <div className="grid place-items-center rounded-2xl bg-foreground/10 p-4 text-xs font-medium text-muted-foreground">
                    +{note.attachments.length - 4} more
                  </div>
                ) : null}
              </div>
            ) : null}

            {noteLabels.length ? (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {noteLabels.map((label) => (
                  <span
                    key={label.id}
                    className={clsx(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                      hasCover && !backgroundImage
                        ? "bg-white/10 text-white/90"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                    )}
                  >
                    <span
                      className={clsx(
                        "h-2 w-2 rounded-full",
                        label.color === "default"
                          ? "bg-zinc-400"
                          : `bg-${label.color}-500`,
                      )}
                    />
                    <span>{label.name}</span>
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <footer className={clsx(
            "mt-4 flex items-center justify-between pt-3 -mx-6 -mb-6 px-6 pb-4 rounded-b-2xl border-t",
            backgroundImage?.brightness === 'light'
              ? "bg-white/30 backdrop-blur-sm border-black/10"
              : backgroundImage
                ? "bg-black/30 backdrop-blur-sm border-white/10"
                : hasCover
                  ? "bg-black/30 backdrop-blur-sm border-white/10"
                  : "bg-zinc-50/80 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-700/50"
          )}>
            {/* Glass pill for date/shared info */}
            <div className={clsx(
              "flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-xl border",
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
                  "h-7 flex items-center gap-1.5 rounded-full px-2.5 text-xs font-medium",
                  hasCover && !backgroundImage
                    ? "text-white/70"
                    : getTextColorClasses(backgroundImage, 'muted')
                )}>
                  <Users className="h-3.5 w-3.5" />
                  {note.sharedWithUserIds.length}
                </span>
              ) : null}
              <span className={clsx(
                "h-7 flex items-center px-2.5 rounded-full text-xs font-medium",
                hasCover && !backgroundImage
                  ? "text-white/70"
                  : getTextColorClasses(backgroundImage, 'muted')
              )}>
                {(note.updatedAt.getTime() !== note.createdAt.getTime() ? note.updatedAt : note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                {' · '}
                {note.updatedAt.getTime() !== note.createdAt.getTime() ? 'Edited' : 'Created'}
              </span>
            </div>
            {/* Glass pill for actions */}
            <div className={clsx(
              "flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-xl border",
              backgroundImage
                ? backgroundImage.brightness === 'dark'
                  ? "bg-white/10 border-white/20"
                  : "bg-black/5 border-black/10"
                : hasCover
                  ? "bg-white/10 border-white/20"
                  : "bg-zinc-100/80 dark:bg-zinc-800/80 border-zinc-200/50 dark:border-zinc-700/50"
            )}>
              {/* Priority Indicator */}
              {note.priority && (
                <div
                  className={clsx(
                    "h-7 w-7 rounded-full flex items-center justify-center",
                    note.priority === "high" && "text-red-500",
                    note.priority === "medium" && "text-amber-500",
                    note.priority === "low" && "text-blue-500",
                  )}
                  title={`${note.priority.charAt(0).toUpperCase() + note.priority.slice(1)} priority`}
                >
                  <Flame className="h-3.5 w-3.5" />
                </div>
              )}
              {/* Focus button - only shows on non-focused notes */}
              {!note.pinned && (
                <button
                  type="button"
                  onClick={handlePin}
                  className={clsx(
                    "h-7 w-7 rounded-full flex items-center justify-center transition",
                    backgroundImage?.brightness === 'light'
                      ? "text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20"
                      : backgroundImage
                        ? "text-[var(--color-primary)]/70 hover:bg-[var(--color-primary)]/30"
                        : hasCover
                          ? "text-[var(--color-primary)]/70 hover:bg-[var(--color-primary)]/30"
                          : "text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20"
                  )}
                  aria-label="Add to Focus"
                >
                  <FocusIcon className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={handleDeleteClick}
                className={clsx(
                  "h-7 w-7 rounded-full flex items-center justify-center transition",
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
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </footer>
        </div>
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
