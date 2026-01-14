"use client";

/* eslint-disable @next/next/no-img-element */

import { useMemo, useState, useCallback, useEffect, useRef } from "react";

// Helper to strip HTML tags for preview display
function stripHtml(html: string): string {
  // Quick check - if no HTML tags, return as-is
  if (!html.includes('<')) return html;

  // Use DOMParser if available (browser environment)
  if (typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  }

  // Fallback: regex-based stripping for SSR
  return html
    .replace(/<[^>]*>/g, ' ')  // Replace tags with space
    .replace(/\s+/g, ' ')       // Collapse multiple spaces
    .trim();
}

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
  Flame,
  X,
  Copy,
  FolderOpen,
  Palette,
  MoreHorizontal,
  Circle,
  CheckCircle2,
  Check,
} from "lucide-react";
import { FocusIcon } from "@/components/icons/focus-icon";
import { clsx } from "clsx";
import { ConfirmationDialog } from "@ainexsuite/ui";
import type { Note, NoteColor, NotePriority } from "@/lib/types/note";
import { useNotes } from "@/components/providers/notes-provider";
import { NOTE_COLORS, LIGHT_COLORS, DARK_COLORS, DEFAULT_COLOR } from "@/lib/constants/note-colors";
import { NoteEditor } from "@/components/notes/note-editor";
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
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [showSpacePicker, setShowSpacePicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [footerExpanded, setFooterExpanded] = useState(false);
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
  const priorityPickerRef = useRef<HTMLDivElement>(null);
  const spacePickerRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const colorSwatchRowRef = useRef<HTMLDivElement>(null);

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

  // Close space picker when clicking outside
  useEffect(() => {
    if (!showSpacePicker) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (spacePickerRef.current && !spacePickerRef.current.contains(event.target as Node)) {
        setShowSpacePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSpacePicker]);

  // Handle moving note to a different space
  const handleMoveToSpace = useCallback(async (spaceId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    await updateNote(note.id, { spaceId });
    setShowSpacePicker(false);
  }, [note.id, updateNote]);

  // Handle duplicate
  const handleDuplicate = useCallback(async (event: React.MouseEvent) => {
    event.stopPropagation();
    await duplicateNote(note.id);
  }, [note.id, duplicateNote]);

  // Close color picker when clicking outside
  // Must check both the palette button ref AND the color swatch row ref
  useEffect(() => {
    if (!showColorPicker) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsidePaletteButton = colorPickerRef.current?.contains(target);
      const isInsideSwatchRow = colorSwatchRowRef.current?.contains(target);

      if (!isInsidePaletteButton && !isInsideSwatchRow) {
        setShowColorPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showColorPicker]);

  // Handle color change - optimistic update for instant feedback
  // Also clears background image and cover so the color is visible
  // Picker stays open so user can preview multiple colors - closes on click outside
  const handleColorChange = useCallback((color: NoteColor, event: React.MouseEvent) => {
    event.stopPropagation();
    // Instant local updates
    setLocalColor(color);
    setLocalBackgroundImage(null);
    setLocalCoverImage(null);
    // Clear background and cover so color takes effect
    updateNote(note.id, { color, backgroundImage: null, coverImage: null });
  }, [note.id, updateNote]);

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

  // Determine text color based on the color's textMode (light or dark)
  // textMode: 'light' means light text on dark background
  // textMode: 'dark' means dark text on light background
  const hasColor = noteColorConfig && noteColorConfig.id !== 'default';
  const forceLightText = !backgroundImage && !hasCover && hasColor && noteColorConfig?.textMode === 'light';
  const forceDarkText = !backgroundImage && !hasCover && hasColor && noteColorConfig?.textMode === 'dark';

  // Get the card background class (single class, no theme switching)
  const cardBgClass = !backgroundImage && !hasCover && noteColorConfig
    ? noteColorConfig.bgClass
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
  const maxHeightClass = note.type !== "checklist" ? "max-h-[280px]" : undefined;

  return (
    <>
      <article
        className={clsx(
          "border",
          "group relative cursor-pointer rounded-2xl",
          showColorPicker ? "overflow-visible" : "overflow-hidden",
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
          // Border styling - favorites get accent left border, all use color-matched borders
          note.pinned
            ? clsx(
                "border-l-[3px] border-l-[var(--color-primary)]",
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:text-red-400 text-xs font-medium transition-all hover:scale-105"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
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

        <div className="relative z-10 w-full flex-1 flex flex-col overflow-hidden">
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
                {note.checklist.slice(0, 8).map((item) => {
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
                {note.checklist.length > 8 ? (
                  <li className={clsx(
                    "text-[11px]",
                    hasCover && !backgroundImage
                      ? "text-white/70"
                      : forceDarkText
                        ? "text-zinc-500"
                        : forceLightText
                          ? "text-white/70"
                          : getTextColorClasses(backgroundImage, 'muted')
                  )}>
                    +{note.checklist.length - 8} more
                  </li>
                ) : null}
                </ul>
              </div>
            ) : note.body ? (
              <p className={clsx(
                "whitespace-pre-wrap text-sm leading-relaxed tracking-[-0.01em] line-clamp-8",
                hasCover && !backgroundImage
                  ? "text-white/90"
                  : forceDarkText
                    ? "text-zinc-700"  // Dark text on bright backgrounds
                    : forceLightText
                      ? "text-zinc-200"  // Light text on dark backgrounds
                      : getTextColorClasses(backgroundImage, 'body')
              )}>
                {stripHtml(note.body)}
              </p>
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

        {/* Footer - outside overflow wrapper so it extends to card edges */}
        <footer className="relative z-10 mt-auto flex flex-col pt-1.5 -mx-4 -mb-4 px-4 pb-3 rounded-b-2xl">
          {/* Footer actions row */}
          <div className="flex items-center justify-end">
            {/* Glass pill for actions - matching editor style */}
            <div className={clsx(
              "flex items-center gap-0.5 px-1 py-0.5 rounded-full backdrop-blur-xl border transition-opacity",
              // Hidden by default, visible on hover (desktop) or when expanded (touch)
              // Don't show on hover when completion overlay is visible
              isChecklistComplete ? "opacity-0" : "opacity-0 group-hover:opacity-100",
              footerExpanded && !isChecklistComplete && "!opacity-100",
              backgroundImage
                ? backgroundImage.brightness === 'dark'
                  ? "bg-white/20 border-white/30"
                  : "bg-black/5 border-black/10"
                : hasCover
                  ? "bg-white/20 border-white/30"
                  : forceDarkText
                    ? "bg-black/5 border-black/10"  // Light pill on bright backgrounds
                    : forceLightText
                      ? "bg-white/20 border-white/30"  // Dark pill on dark backgrounds
                      : "bg-zinc-100/80 dark:bg-zinc-800/80 border-zinc-200/50 dark:border-zinc-700/50"
            )}>
              {/* Space Selector - only show if user has more than one space */}
              {spaces.length > 1 && (
                <div className="relative" ref={spacePickerRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSpacePicker((prev) => !prev);
                    setShowPriorityPicker(false);
                  }}
                  className={clsx(
                    "h-6 flex items-center gap-1 rounded-full px-2 text-[10px] font-medium transition",
                    showSpacePicker
                      ? "bg-[var(--color-primary)] text-white"
                      : forceDarkText
                        ? "text-zinc-500 hover:bg-black/10"
                        : forceLightText
                          ? "text-white/80 hover:bg-white/30"
                          : backgroundImage?.brightness === 'light'
                            ? "text-zinc-500 hover:bg-black/10"
                            : backgroundImage || hasCover
                              ? "text-white/80 hover:bg-white/30"
                              : "text-zinc-400 dark:text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  )}
                  aria-label="Move to space"
                  title="Move to a different space"
                >
                  <FolderOpen className="h-3.5 w-3.5" />
                  <span className="max-w-[60px] truncate">
                    {currentSpace?.name || "My Notes"}
                  </span>
                </button>
                {showSpacePicker && (
                  <div
                    className={clsx(
                      "absolute bottom-7 right-0 z-50 min-w-[140px] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200",
                      forceDarkText
                        ? "bg-white border border-zinc-200"
                        : forceLightText
                          ? "bg-zinc-900 border border-zinc-700"
                          : backgroundImage?.brightness === 'light'
                            ? "bg-white border border-zinc-200"
                            : backgroundImage || hasCover
                              ? "bg-zinc-900 border border-zinc-700"
                              : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700"
                    )}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className={clsx(
                      "px-3 py-2 border-b",
                      forceDarkText
                        ? "border-zinc-200"
                        : forceLightText
                          ? "border-zinc-700"
                          : backgroundImage?.brightness === 'light'
                            ? "border-zinc-200"
                            : backgroundImage || hasCover
                              ? "border-zinc-700"
                              : "border-zinc-200 dark:border-zinc-700"
                    )}>
                      <p className={clsx(
                        "text-xs font-semibold",
                        forceDarkText
                          ? "text-zinc-900"
                          : forceLightText
                            ? "text-white"
                            : backgroundImage?.brightness === 'light'
                              ? "text-zinc-900"
                              : backgroundImage || hasCover
                                ? "text-white"
                                : "text-zinc-900 dark:text-white"
                      )}>Move to Space</p>
                    </div>
                    <div className="p-1.5 max-h-36 overflow-y-auto scrollbar-styled">
                      {spaces.map((space) => (
                        <button
                          key={space.id}
                          type="button"
                          onClick={(e) => handleMoveToSpace(space.id, e)}
                          className={clsx(
                            "w-full text-left px-2.5 py-1.5 rounded-xl text-xs transition-colors flex items-center gap-2",
                            space.id === note.spaceId
                              ? "bg-[var(--color-primary)] text-white"
                              : forceDarkText
                                ? "text-zinc-600 hover:bg-zinc-100"
                                : forceLightText
                                  ? "text-zinc-300 hover:bg-zinc-800"
                                  : backgroundImage?.brightness === 'light'
                                    ? "text-zinc-600 hover:bg-zinc-100"
                                    : backgroundImage || hasCover
                                      ? "text-zinc-300 hover:bg-zinc-800"
                                      : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          )}
                        >
                          <FolderOpen className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{space.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* Vertical divider after space selector */}
            {spaces.length > 1 && (
              <div className={clsx(
                "h-3 w-px mx-0.5",
                forceDarkText
                  ? "bg-black/20"
                  : forceLightText
                    ? "bg-white/20"
                    : backgroundImage?.brightness === 'light'
                      ? "bg-black/20"
                      : backgroundImage || hasCover
                        ? "bg-white/20"
                        : "bg-zinc-300 dark:bg-zinc-600"
              )} />
            )}
            {/* More button - only visible on touch devices, hidden on desktop */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFooterExpanded((prev) => !prev);
              }}
              className={clsx(
                "h-6 w-6 rounded-full flex items-center justify-center transition",
                // Hidden on desktop (hover-capable devices), visible on touch only
                "hidden [@media(hover:none)]:flex",
                footerExpanded && "!hidden",
                forceDarkText
                  ? "text-zinc-500 hover:bg-black/10"
                  : forceLightText
                    ? "text-white/60 hover:bg-white/20"
                    : backgroundImage?.brightness === 'light'
                      ? "text-zinc-500 hover:bg-black/10"
                      : backgroundImage || hasCover
                        ? "text-white/60 hover:bg-white/20"
                        : "text-zinc-400 dark:text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              )}
              aria-label="More actions"
              title="More actions"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
            {/* Expandable actions - visible on hover (desktop) or when expanded (touch) */}
            <div className={clsx(
              "flex items-center gap-0.5 transition-all duration-200",
              // Desktop: show on group hover
              "opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-[250px]",
              // Only use overflow-hidden when collapsed (pickers need to overflow)
              !showPriorityPicker && !showColorPicker && "overflow-hidden",
              // Touch/expanded: show when footerExpanded
              footerExpanded && "!opacity-100 !max-w-[250px]"
            )}>
            {/* Color Picker */}
            <div className="relative" ref={colorPickerRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowColorPicker((prev) => !prev);
                  setShowPriorityPicker(false);
                  setShowSpacePicker(false);
                }}
                className={clsx(
                  "h-6 w-6 rounded-full flex items-center justify-center transition",
                  forceDarkText
                    ? "hover:bg-black/10"
                    : forceLightText
                      ? "hover:bg-white/30"
                      : backgroundImage?.brightness === 'light'
                        ? "hover:bg-black/10"
                        : backgroundImage || hasCover
                          ? "hover:bg-white/30"
                          : "hover:bg-zinc-200 dark:hover:bg-zinc-700"
                )}
                aria-label="Change color"
                title="Change color"
              >
                <Palette className={clsx(
                  "h-3.5 w-3.5",
                  forceDarkText
                    ? "text-zinc-500"
                    : forceLightText
                      ? "text-white/80"
                      : backgroundImage?.brightness === 'light'
                        ? "text-zinc-500"
                        : backgroundImage || hasCover
                          ? "text-white/80"
                          : "text-zinc-400 dark:text-zinc-500"
                )} />
              </button>
            </div>
            {/* Vertical divider */}
            <div className={clsx(
              "h-3 w-px mx-0.5",
              forceDarkText
                ? "bg-black/20"
                : forceLightText
                  ? "bg-white/30"
                  : backgroundImage?.brightness === 'light'
                    ? "bg-black/20"
                    : backgroundImage || hasCover
                      ? "bg-white/30"
                      : "bg-zinc-300 dark:bg-zinc-600"
            )} />
            {/* Priority Indicator - clickable by any space member */}
            <div className="relative" ref={priorityPickerRef}>
              <button
                type="button"
                onClick={handlePriorityClick}
                className={clsx(
                  "h-6 w-6 rounded-full flex items-center justify-center transition",
                  forceDarkText
                    ? "hover:bg-black/10"
                    : forceLightText
                      ? "hover:bg-white/30"
                      : backgroundImage?.brightness === 'light'
                        ? "hover:bg-black/10"
                        : backgroundImage || hasCover
                          ? "hover:bg-white/30"
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
                        : forceDarkText
                          ? "text-zinc-500"
                          : forceLightText
                            ? "text-white/80"
                            : backgroundImage?.brightness === 'light'
                              ? "text-zinc-500"
                              : backgroundImage || hasCover
                                ? "text-white/80"
                                : "text-zinc-400 dark:text-zinc-500"
                )} />
              </button>
              {showPriorityPicker && (
                <div
                  className="absolute bottom-7 right-0 z-[200] flex flex-col gap-0.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-1.5 shadow-2xl min-w-[100px] animate-in fade-in slide-in-from-bottom-2 duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={(e) => handleSetPriority("high", e)}
                    className={clsx(
                      "flex items-center gap-1.5 px-2 py-1 rounded-xl text-xs font-medium transition",
                      note.priority === "high"
                        ? "bg-red-500/20 text-red-500 dark:text-red-400"
                        : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
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
                        ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                        : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
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
                        ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                        : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    )}
                  >
                    <Flame className="h-3 w-3 text-blue-500" />
                    Low
                  </button>
                  {note.priority && (
                    <>
                      <div className="h-px bg-zinc-200 dark:bg-zinc-700 my-0.5" />
                      <button
                        type="button"
                        onClick={(e) => handleSetPriority(null, e)}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-xl text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                      >
                        <X className="h-3 w-3" />
                        Clear
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
            {/* Vertical divider */}
            <div className={clsx(
              "h-3 w-px mx-0.5",
              forceDarkText
                ? "bg-black/20"
                : forceLightText
                  ? "bg-white/30"
                  : backgroundImage?.brightness === 'light'
                    ? "bg-black/20"
                    : backgroundImage || hasCover
                      ? "bg-white/30"
                      : "bg-zinc-300 dark:bg-zinc-600"
            )} />
            {/* Duplicate button */}
            <button
              type="button"
              onClick={handleDuplicate}
              className={clsx(
                "h-6 w-6 rounded-full flex items-center justify-center transition",
                forceDarkText
                  ? "hover:bg-black/10"
                  : forceLightText
                    ? "hover:bg-white/30"
                    : backgroundImage?.brightness === 'light'
                      ? "hover:bg-black/10"
                      : backgroundImage || hasCover
                        ? "hover:bg-white/30"
                        : "hover:bg-zinc-200 dark:hover:bg-zinc-700"
              )}
              aria-label="Duplicate note"
              title="Duplicate note"
            >
              <Copy className={clsx(
                "h-3.5 w-3.5",
                forceDarkText
                  ? "text-zinc-500"
                  : forceLightText
                    ? "text-white/80"
                    : backgroundImage?.brightness === 'light'
                      ? "text-zinc-500"
                      : backgroundImage || hasCover
                        ? "text-white/80"
                        : "text-zinc-400 dark:text-zinc-500"
              )} />
            </button>
            {/* Vertical divider */}
            {canDelete && (
              <div className={clsx(
                "h-3 w-px mx-0.5",
                forceDarkText
                  ? "bg-black/20"
                  : forceLightText
                    ? "bg-white/30"
                    : backgroundImage?.brightness === 'light'
                      ? "bg-black/20"
                      : backgroundImage || hasCover
                        ? "bg-white/30"
                        : "bg-zinc-300 dark:bg-zinc-600"
              )} />
            )}
            {/* Delete button - only for owner */}
            {canDelete && (
              <button
                type="button"
                onClick={handleDeleteClick}
                className={clsx(
                  "h-6 w-6 rounded-full flex items-center justify-center transition",
                  forceDarkText
                    ? "text-red-600 hover:bg-red-500/20 hover:text-red-700"
                    : forceLightText
                      ? "text-red-300 hover:bg-red-500/30 hover:text-red-200"
                      : backgroundImage?.brightness === 'light'
                        ? "text-red-600 hover:bg-red-500/20 hover:text-red-700"
                        : backgroundImage || hasCover
                          ? "text-red-300 hover:bg-red-500/30 hover:text-red-200"
                          : "text-red-400 hover:bg-red-500/20 hover:text-red-500"
                )}
                aria-label="Delete note"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
            </div>
          </div>
          </div>
          {/* Color picker popup with Default at top, then Light/Dark columns */}
          {showColorPicker && (
            <div
              ref={colorSwatchRowRef}
              className="absolute right-0 bottom-10 z-[200] flex flex-col rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-2 shadow-2xl min-w-[280px] animate-in fade-in slide-in-from-bottom-2 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Default - full width at top */}
              <button
                type="button"
                onClick={(e) => handleColorChange(DEFAULT_COLOR.id, e)}
                className={clsx(
                  "flex items-center gap-2 px-2 py-1.5 rounded-xl text-xs font-medium transition w-full mb-2",
                  localColor === DEFAULT_COLOR.id
                    ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white"
                    : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                )}
              >
                <span
                  className={clsx(
                    "h-4 w-4 rounded-full flex-shrink-0",
                    DEFAULT_COLOR.swatchClass
                  )}
                />
                {DEFAULT_COLOR.label}
              </button>

              {/* Light/Dark columns */}
              <div className="flex gap-2 border-t border-zinc-200 dark:border-zinc-700 pt-2">
                {/* Light colors column */}
                <div className="flex-1">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-2 py-1 mb-1">
                    Light
                  </div>
                  {LIGHT_COLORS.map((colorOption) => (
                    <button
                      key={colorOption.id}
                      type="button"
                      onClick={(e) => handleColorChange(colorOption.id, e)}
                      className={clsx(
                        "flex items-center gap-2 px-2 py-1.5 rounded-xl text-xs font-medium transition w-full",
                        localColor === colorOption.id
                          ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white"
                          : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      )}
                    >
                      <span
                        className={clsx(
                          "h-4 w-4 rounded-full flex-shrink-0",
                          colorOption.swatchClass
                        )}
                      />
                      {colorOption.label}
                    </button>
                  ))}
                </div>
                {/* Dark colors column */}
                <div className="flex-1">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-2 py-1 mb-1">
                    Dark
                  </div>
                  {DARK_COLORS.map((colorOption) => (
                    <button
                      key={colorOption.id}
                      type="button"
                      onClick={(e) => handleColorChange(colorOption.id, e)}
                      className={clsx(
                        "flex items-center gap-2 px-2 py-1.5 rounded-xl text-xs font-medium transition w-full",
                        localColor === colorOption.id
                          ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white"
                          : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      )}
                    >
                      <span
                        className={clsx(
                          "h-4 w-4 rounded-full flex-shrink-0",
                          colorOption.swatchClass
                        )}
                      />
                      {colorOption.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
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
