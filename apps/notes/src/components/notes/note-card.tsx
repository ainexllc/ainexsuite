"use client";

/* eslint-disable @next/next/no-img-element */

import { useMemo, useState, useEffect } from "react";
import DOMPurify from "isomorphic-dompurify";

// Smart-sized min-height tiers based on content (allows natural growth)
type ContentSize = "tiny" | "small" | "medium" | "large";

// Text notes - minimum heights (cards grow with content)
const HEIGHT_MAP: Record<ContentSize, string> = {
  tiny: "min-h-[72px]",
  small: "min-h-[100px]",
  medium: "min-h-[140px]",
  large: "min-h-[190px]",
};

// Favorites text notes (+10px bonus)
const FAVORITE_HEIGHT_MAP: Record<ContentSize, string> = {
  tiny: "min-h-[80px]",
  small: "min-h-[110px]",
  medium: "min-h-[150px]",
  large: "min-h-[200px]",
};

// Checklists need more height (~24px per item + header/footer)
const CHECKLIST_HEIGHT_MAP: Record<ContentSize, string> = {
  tiny: "min-h-[100px]",   // 1-2 items
  small: "min-h-[140px]",  // 3-4 items
  medium: "min-h-[200px]", // 5-6 items
  large: "min-h-[260px]",  // 7+ items
};

const CHECKLIST_FAVORITE_HEIGHT_MAP: Record<ContentSize, string> = {
  tiny: "min-h-[110px]",
  small: "min-h-[150px]",
  medium: "min-h-[220px]",
  large: "min-h-[280px]",
};

// Calculate content size tier
function getContentSize(note: {
  type: string;
  title?: string;
  body?: string;
  checklist?: { id: string }[];
  attachments?: { id: string }[];
}): ContentSize {
  // Notes with images get extra height for the header
  if (note.attachments && note.attachments.length > 0) return "large";

  if (note.type === "checklist") {
    const count = note.checklist?.length || 0;
    if (count <= 2) return "tiny";
    if (count <= 4) return "small";
    if (count <= 6) return "medium";
    return "large"; // 7+ items
  }

  // Regular notes - based on combined text length (title + body)
  const textLength = (note.title?.length || 0) + (note.body?.length || 0);
  if (textLength < 40) return "tiny";
  if (textLength < 120) return "small";
  if (textLength < 400) return "medium";
  return "large";
}
import {
  Trash2,
  Circle,
  CheckCircle2,
  Check,
} from "lucide-react";
import { FocusIcon } from "@/components/icons/focus-icon";
import { clsx } from "clsx";
import { ConfirmationDialog } from "@ainexsuite/ui";
import type { Note, NoteColor } from "@/lib/types/note";
import { useNotes } from "@/components/providers/notes-provider";
import { NOTE_COLORS } from "@/lib/constants/note-colors";
import { NoteEditor } from "@/components/notes/note-editor";
import { NoteActionsToolbar } from "@/components/notes/note-actions-toolbar";
import { useLabels } from "@/components/providers/labels-provider";
import { getBackgroundById, getTextColorClasses, getOverlayClasses, FALLBACK_BACKGROUNDS } from "@/lib/backgrounds";
import { useBackgrounds } from "@/components/providers/backgrounds-provider";
import { useCovers } from "@/components/providers/covers-provider";
import { ImageModal } from "@/components/ui/image-modal";
import { useAuth } from "@ainexsuite/auth";
import { useSpaces } from "@/components/providers/spaces-provider";

type NoteCardProps = {
  note: Note;
};

export function NoteCard({ note }: NoteCardProps) {
  const { togglePin, deleteNote, updateNote, duplicateNote } = useNotes();
  const { labels } = useLabels();
  const { backgrounds: firestoreBackgrounds } = useBackgrounds();
  const { covers } = useCovers();
  const { user } = useAuth();
  const { spaces } = useSpaces();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [localColor, setLocalColor] = useState<NoteColor>(note.color);
  const [localBackgroundImage, setLocalBackgroundImage] = useState<string | null | undefined>(note.backgroundImage);
  const [localCoverImage, setLocalCoverImage] = useState<string | null | undefined>(note.coverImage);

  // Sync local state with note props when they change from external sources
  // Include note.updatedAt to ensure effect fires when note updates in Firestore
  useEffect(() => {
    setLocalColor(note.color);
    setLocalBackgroundImage(note.backgroundImage);
    setLocalCoverImage(note.coverImage);
  }, [note.color, note.backgroundImage, note.coverImage, note.updatedAt]);

  // Get current space name
  const currentSpace = useMemo(() => {
    return spaces.find((s) => s.id === note.spaceId);
  }, [spaces, note.spaceId]);

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

  const noteColorConfig = NOTE_COLORS.find((c) => c.id === localColor);
  const backgroundImage = localBackgroundImage ? getBackgroundById(localBackgroundImage, availableBackgrounds) ?? null : null;

  // Get current cover object
  const currentCover = useMemo(() => {
    if (!localCoverImage) return null;
    return covers.find((c) => c.id === localCoverImage) || null;
  }, [localCoverImage, covers]);

  // Determine if we're using a cover image
  const hasCover = currentCover !== null;

  // Check if checklist is 100% complete
  const isChecklistComplete = note.type === "checklist" &&
    note.checklist.length > 0 &&
    note.checklist.every(item => item.completed);

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

  // Determine text color based on the color's textMode (light or dark)
  // textMode: 'light' means light text on dark background
  // textMode: 'dark' means dark text on light background
  const hasColor = noteColorConfig && noteColorConfig.id !== 'default';
  const forceLightText = !backgroundImage && !hasCover && hasColor && noteColorConfig?.textMode === 'light';
  const forceDarkText = !backgroundImage && !hasCover && hasColor && noteColorConfig?.textMode === 'dark';

  // Get the card background class (single class, no theme switching)
  const cardBgClass = !backgroundImage && !hasCover && noteColorConfig
    ? noteColorConfig.cardClass
    : undefined;

  // Get color-matched border class
  const colorBorderClass = noteColorConfig
    ? noteColorConfig.borderClass
    : "border-zinc-200 dark:border-zinc-700";

  // Smart-sized height based on content
  const contentSize = getContentSize(note);
  // Use checklist-specific heights for checklists, text heights for regular notes
  const heightClass = note.type === "checklist"
    ? (note.pinned ? CHECKLIST_FAVORITE_HEIGHT_MAP[contentSize] : CHECKLIST_HEIGHT_MAP[contentSize])
    : (note.pinned ? FAVORITE_HEIGHT_MAP[contentSize] : HEIGHT_MAP[contentSize]);

  // Max height for text notes to prevent overly tall cards (checklists already capped by item limit)
  const maxHeightClass = note.type !== "checklist" ? "max-h-[320px] sm:max-h-[360px] md:max-h-[400px] lg:max-h-[450px]" : undefined;

  return (
    <>
      <article
        className={clsx(
          "border",
          "group relative cursor-pointer rounded-2xl overflow-hidden",
          // Only transition on hover, not on initial render (prevents blinking)
          "hover:transition-[border-color,box-shadow,transform] hover:duration-200",
          // Subtle shadow for depth, elevates on hover
          "shadow-sm hover:shadow-md",
          "break-inside-avoid px-4 py-4 flex flex-col",
          // Smart-sized height with max cap for text notes
          heightClass,
          maxHeightClass,
          // Background: use color class if set, otherwise default (respects color mode preference)
          cardBgClass || "bg-white dark:bg-zinc-800",
          // Border styling - favorites get enhanced shadow, all use color-matched borders
          note.pinned
            ? clsx(
                colorBorderClass,
                "shadow-lg shadow-[var(--color-primary)]/10 hover:shadow-xl hover:shadow-[var(--color-primary)]/15"
              )
            : colorBorderClass,
        )}
        onClick={() => setIsEditing(true)}
      >
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

        {/* Image Header - Pinterest style (always shown when note has image attachments) */}
        {note.attachments.length > 0 && (
          <div
            className="relative z-10 -mx-4 -mt-4 mb-3 h-28 overflow-hidden rounded-t-2xl cursor-zoom-in"
            onClick={(e) => {
              e.stopPropagation();
              setPreviewImage(note.attachments[0].downloadURL);
            }}
          >
            <img
              src={note.attachments[0].downloadURL}
              alt={note.attachments[0].name}
              className="w-full h-full object-cover"
            />
            {/* Show count badge if more than 1 image */}
            {note.attachments.length > 1 && (
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-medium backdrop-blur-sm">
                +{note.attachments.length - 1}
              </div>
            )}
          </div>
        )}

        {/* Corner Favorites Badge - clickable to toggle */}
        <button
          type="button"
          onClick={handlePin}
          className="absolute -top-0 -right-0 w-10 h-10 overflow-hidden rounded-tr-lg z-20 group/pin"
          aria-label={note.pinned ? "Remove from Favorites" : "Add to Favorites"}
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

        {/* Completion Overlay - shown when all checklist items are complete */}
        {isChecklistComplete && (
          <div className="absolute inset-0 z-30 flex items-center justify-center rounded-2xl bg-zinc-100/60 dark:bg-zinc-900/60 backdrop-blur-[2px]">
            <div className="flex flex-col items-center gap-3">
              <Check className="h-12 w-12 text-zinc-300/60 dark:text-zinc-600/40" strokeWidth={2} />
              {canDelete && (
                <button
                  onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
                  className="p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:text-red-400 transition-all hover:scale-105"
                  aria-label="Delete note"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Header with title */}
        {note.title && (
          <div className="relative z-10 -mx-4 -mt-4 px-4 py-2 rounded-t-2xl mb-1">
            <h3 className={clsx(
              "pr-8 text-[16px] font-semibold tracking-[-0.02em] line-clamp-1",
              hasCover && !backgroundImage
                ? "text-white"
                : forceDarkText
                  ? "text-zinc-800"  // Force dark text on bright backgrounds
                  : forceLightText
                    ? "text-zinc-100"  // Force light text on dark backgrounds
                    : getTextColorClasses(backgroundImage, 'title')
            )}>
              {note.title}
            </h3>
          </div>
        )}

        <div className="relative z-10 w-full flex-1 flex flex-col overflow-hidden [mask-image:linear-gradient(to_bottom,black_85%,transparent_100%)]">
          <div
            className="overflow-hidden pr-1 flex-1"
          >

            {note.type === "checklist" ? (
              <div className="flex flex-col gap-1">
                {/* Compact Progress Bar at TOP */}
                {note.checklist.length > 0 && (
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className={clsx(
                      "flex-1 h-1 rounded-full overflow-hidden",
                      hasCover && !backgroundImage
                        ? "bg-white/20"
                        : forceDarkText
                          ? "bg-zinc-300"  // Solid light bg for bright mode
                          : forceLightText
                            ? "bg-white/20"  // Transparent light for dark mode
                            : backgroundImage?.brightness === 'light'
                              ? "bg-black/10"
                              : backgroundImage
                                ? "bg-white/20"
                                : "bg-zinc-200 dark:bg-zinc-700"
                    )}>
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-300"
                        style={{
                          width: `${(note.checklist.filter(i => i.completed).length / note.checklist.length) * 100}%`
                        }}
                      />
                    </div>
                    <span className={clsx(
                      "text-[9px] font-medium tabular-nums flex-shrink-0",
                      hasCover && !backgroundImage
                        ? "text-white/60"
                        : forceDarkText
                          ? "text-zinc-500"
                          : forceLightText
                            ? "text-white/60"
                            : getTextColorClasses(backgroundImage, 'muted')
                    )}>
                      {note.checklist.filter(i => i.completed).length}/{note.checklist.length}
                    </span>
                  </div>
                )}
                {/* Checklist items */}
                <ul className="space-y-1">
                {note.checklist.slice(0, 12).map((item) => {
                  const indentLevel = item.indent ?? 0;
                  return (
                    <li
                      key={item.id}
                      className={clsx(
                        "relative flex items-center gap-1.5 text-sm leading-relaxed",
                        item.completed
                          ? clsx(
                              hasCover && !backgroundImage
                                ? "text-white/50"
                                : forceDarkText
                                  ? "text-zinc-400"  // Muted dark text for completed
                                  : forceLightText
                                    ? "text-white/50"  // Muted light text for completed
                                    : getTextColorClasses(backgroundImage, 'checklist-completed'),
                              "line-through"
                            )
                          : hasCover && !backgroundImage
                            ? "text-white/90"
                            : forceDarkText
                              ? "text-zinc-700"  // Dark text for uncompleted
                              : forceLightText
                                ? "text-white/90"  // Light text for uncompleted
                                : getTextColorClasses(backgroundImage, 'checklist'),
                      )}
                      style={{ paddingLeft: `${indentLevel * 16}px` }}
                    >
                      {/* Thin indent line for nested items */}
                      {indentLevel > 0 && (
                        <span
                          className={clsx(
                            "absolute top-0 bottom-0 w-px",
                            hasCover && !backgroundImage
                              ? "bg-white/20"
                              : forceDarkText
                                ? "bg-zinc-400"
                                : forceLightText
                                  ? "bg-white/20"
                                  : backgroundImage?.brightness === 'light'
                                    ? "bg-black/15"
                                    : backgroundImage
                                      ? "bg-white/20"
                                      : "bg-zinc-300 dark:bg-zinc-600"
                          )}
                          style={{ left: `${(indentLevel - 1) * 16 + 4}px` }}
                        />
                      )}
                      {/* Checkbox icon matching edit view */}
                      {item.completed ? (
                        <CheckCircle2
                          className={clsx(
                            "h-3.5 w-3.5 flex-shrink-0",
                            hasCover && !backgroundImage
                              ? "text-white/50"
                              : forceDarkText
                                ? "text-[var(--color-primary)]/50"
                                : forceLightText
                                  ? "text-white/50"
                                  : backgroundImage?.brightness === 'light'
                                    ? "text-black/30"
                                    : backgroundImage
                                      ? "text-white/50"
                                      : "text-[var(--color-primary)]/50"
                          )}
                          fill="currentColor"
                          strokeWidth={0}
                        />
                      ) : (
                        <Circle
                          className={clsx(
                            "h-3.5 w-3.5 flex-shrink-0",
                            hasCover && !backgroundImage
                              ? "text-white/60"
                              : forceDarkText
                                ? "text-zinc-500"
                                : forceLightText
                                  ? "text-white/60"
                                  : backgroundImage?.brightness === 'light'
                                    ? "text-black/40"
                                    : backgroundImage
                                      ? "text-white/60"
                                      : "text-zinc-400 dark:text-zinc-500"
                          )}
                          strokeWidth={2}
                        />
                      )}
                      <span className="line-clamp-1">{item.text}</span>
                    </li>
                  );
                })}
                {note.checklist.length > 12 ? (
                  <li className={clsx(
                    "text-[11px]",
                    hasCover && !backgroundImage
                      ? "text-white/80"
                      : forceDarkText
                        ? "text-zinc-500"
                        : forceLightText
                          ? "text-white/80"  // Improved from 70% to 80% opacity
                          : getTextColorClasses(backgroundImage, 'muted')
                  )}>
                    +{note.checklist.length - 12} more
                  </li>
                ) : null}
                </ul>
              </div>
            ) : note.body ? (
              <div
                className={clsx(
                  "text-sm leading-relaxed tracking-[-0.01em] line-clamp-8 [&>p]:mb-2 [&>p:last-child]:mb-0",
                  hasCover && !backgroundImage
                    ? "text-white/90"
                    : forceDarkText
                      ? "text-zinc-700"  // Dark text on bright backgrounds
                      : forceLightText
                        ? "text-white/90"  // Improved contrast: white/90 instead of zinc-200
                        : getTextColorClasses(backgroundImage, 'body')
                )}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(note.body) }}
              />
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
                        : forceDarkText
                          ? "bg-black/10 text-zinc-700"
                          : forceLightText
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
                  <span className={clsx(
                    "text-[10px]",
                    forceDarkText ? "text-zinc-500" : forceLightText ? "text-white/60" : "text-zinc-400"
                  )}>+{noteLabels.length - 2}</span>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer with shared toolbar */}
        <footer className="relative z-10 mt-auto pt-1.5 -mx-4 -mb-4 px-4 pb-3 rounded-b-2xl">
          <div className="flex items-center justify-end">
            <NoteActionsToolbar
              note={note}
              variant="card"
              forceDarkText={forceDarkText}
              forceLightText={forceLightText}
              backgroundBrightness={backgroundImage?.brightness}
              hasCover={hasCover}
              spaces={spaces}
              currentSpace={currentSpace}
              onMoveToSpace={(spaceId) => updateNote(note.id, { spaceId })}
              onColorChange={(color) => {
                setLocalColor(color);
                setLocalBackgroundImage(null);
                setLocalCoverImage(null);
                updateNote(note.id, { color, backgroundImage: null, coverImage: null });
              }}
              onPriorityChange={(priority) => updateNote(note.id, { priority })}
              onDuplicate={() => duplicateNote(note.id)}
              onDelete={() => setShowDeleteConfirm(true)}
              color={localColor}
              priority={note.priority ?? null}
              canDelete={canDelete}
              visible={!isChecklistComplete}
            />
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
