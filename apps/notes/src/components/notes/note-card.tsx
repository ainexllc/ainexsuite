"use client";

/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react";
import {
  Archive,
  Palette,
  Pin,
  Trash2,
  Users,
} from "lucide-react";
import { clsx } from "clsx";
import { ConfirmationDialog } from "@ainexsuite/ui";
import type { Note } from "@/lib/types/note";
import type { ViewMode } from "@/lib/types/settings";
import { useNotes } from "@/components/providers/notes-provider";
import { NOTE_COLORS } from "@/lib/constants/note-colors";
import { NoteEditor } from "@/components/notes/note-editor";
import { useLabels } from "@/components/providers/labels-provider";
import { getBackgroundById, getTextColorClasses, getOverlayClasses, getActionColorClasses, FALLBACK_BACKGROUNDS } from "@/lib/backgrounds";
import { useBackgrounds } from "@/hooks/use-backgrounds";

type NoteCardProps = {
  note: Note;
  viewMode?: ViewMode;
};

export function NoteCard({ note, viewMode = "masonry" }: NoteCardProps) {
  const { togglePin, toggleArchive, deleteNote, updateNote } = useNotes();
  const { labels } = useLabels();
  const { backgrounds: firestoreBackgrounds } = useBackgrounds();
  const [isEditing, setIsEditing] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const handleArchive = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    await toggleArchive(note.id, !note.archived);
  };

  const handlePin = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    await togglePin(note.id, !note.pinned);
  };

  const handleOpenPalette = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setShowPalette((prev) => !prev);
  };

  const handleColorSelect = async (
    event: React.MouseEvent<HTMLButtonElement>,
    color: Note["color"],
  ) => {
    event.stopPropagation();
    if (color === note.color) {
      setShowPalette(false);
      return;
    }
    await updateNote(note.id, { color });
    setShowPalette(false);
  };

  return (
    <>
      <article
        className={clsx(
          // Use theme lab color system for light/dark mode
          !backgroundImage && cardClass,
          "border border-zinc-200 dark:border-zinc-800",
          "group relative cursor-pointer overflow-hidden rounded-2xl transition-all duration-200",
          "hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md",
          viewMode === "list"
            ? "flex items-start gap-4 px-5 py-3"
            : "break-inside-avoid px-6 py-6",
        )}
        onClick={() => {
          setIsEditing(true);
        }}
      >
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
            <div className={getOverlayClasses(backgroundImage, note.backgroundOverlay ?? 'auto')} />
          </div>
        )}

        {/* Corner Pin Badge - clickable to unpin */}
        {note.pinned && (
          <button
            type="button"
            onClick={handlePin}
            className="absolute -top-0 -right-0 w-10 h-10 overflow-hidden rounded-tr-lg z-20 group/pin"
            aria-label="Unpin note"
          >
            <div className="absolute top-0 right-0 bg-amber-500 group-hover/pin:bg-amber-600 w-14 h-14 rotate-45 translate-x-7 -translate-y-7 transition-colors" />
            <Pin className="absolute top-1.5 right-1.5 h-3 w-3 text-white" />
          </button>
        )}

        <div className="relative z-10 w-full">
          {/* Pin button - only shows on unpinned notes */}
          {!note.pinned && (
            <button
              type="button"
              onClick={handlePin}
              className="absolute right-2 top-2 z-20 hidden rounded-full p-2 transition group-hover:flex bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-700 dark:hover:text-zinc-200"
              aria-label="Pin note"
            >
              <Pin className="h-4 w-4" />
            </button>
          )}

          <div
            className={clsx(
              "overflow-y-auto pr-1",
              viewMode === "list" ? "flex-1 max-h-24" : "max-h-[480px]",
            )}
            onScroll={() => {
              if (showPalette) {
                setShowPalette(false);
              }
            }}
          >
            {note.title ? (
              <h3 className={clsx(
                "pr-8 text-[17px] font-semibold tracking-[-0.02em]",
                getTextColorClasses(backgroundImage, 'title')
              )}>
                {note.title}
              </h3>
            ) : null}

            {note.type === "checklist" ? (
              <ul className="mt-3 space-y-2">
                {note.checklist.slice(0, 6).map((item) => (
                  <li
                    key={item.id}
                    className={clsx(
                      "flex items-start gap-2 text-sm",
                      item.completed
                        ? clsx(getTextColorClasses(backgroundImage, 'checklist-completed'), "line-through")
                        : getTextColorClasses(backgroundImage, 'checklist'),
                    )}
                  >
                    <span className={clsx(
                      "mt-1.5 h-2 w-2 rounded-full flex-shrink-0",
                      item.completed
                        ? backgroundImage?.brightness === 'light' ? "bg-black/20" : backgroundImage ? "bg-white/30" : "bg-zinc-300 dark:bg-zinc-700"
                        : "bg-yellow-500"
                    )} />
                    <span>{item.text}</span>
                  </li>
                ))}
                {note.checklist.length > 6 ? (
                  <li className={clsx(
                    "text-xs",
                    getTextColorClasses(backgroundImage, 'muted')
                  )}>
                    +{note.checklist.length - 6} more
                  </li>
                ) : null}
              </ul>
            ) : note.body ? (
              <p className={clsx(
                "mt-3 whitespace-pre-wrap text-[15px] leading-7 tracking-[-0.01em]",
                getTextColorClasses(backgroundImage, 'body')
              )}>
                {note.body}
              </p>
            ) : null}

            {note.attachments.length ? (
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {note.attachments.slice(0, 4).map((attachment) => (
                  <figure
                    key={attachment.id}
                    className="overflow-hidden rounded-2xl bg-foreground/10 shadow-sm border border-border"
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
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
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

          <footer className={clsx("mt-4 flex items-center justify-between pt-3 -mx-6 -mb-6 px-6 pb-4 rounded-b-2xl border-t-0")}>
            <div className={clsx(
              "flex items-center gap-2 text-[11px] uppercase tracking-wide",
              getTextColorClasses(backgroundImage, 'muted')
            )}>
              {note.sharedWithUserIds?.length ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-zinc-200 dark:bg-zinc-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">
                  <Users className="h-3 w-3" />
                  {note.sharedWithUserIds.length}
                </span>
              ) : null}
              <span>
                {(note.updatedAt.getTime() !== note.createdAt.getTime() ? note.updatedAt : note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleArchive}
                className={clsx(
                  "h-7 w-7 rounded-full flex items-center justify-center transition",
                  getActionColorClasses(backgroundImage)
                )}
                aria-label={note.archived ? "Unarchive note" : "Archive note"}
              >
                <Archive className="h-3.5 w-3.5" />
              </button>
              <div className="relative flex items-center">
                <button
                  type="button"
                  onClick={handleOpenPalette}
                  className={clsx(
                    "h-7 w-7 rounded-full flex items-center justify-center transition",
                    getActionColorClasses(backgroundImage, showPalette),
                  )}
                  aria-label="Change color"
                >
                  <Palette className="h-3.5 w-3.5" />
                </button>
                {showPalette ? (
                  <div
                    className="absolute bottom-10 right-0 z-30 flex gap-2 rounded-2xl bg-background/95 p-3 shadow-2xl backdrop-blur-xl border border-border"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {NOTE_COLORS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className={clsx(
                          "h-6 w-6 rounded-full border border-transparent transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500",
                          option.swatchClass,
                          option.id === note.color && "ring-2 ring-foreground",
                        )}
                        onClick={(event) => handleColorSelect(event, option.id)}
                        aria-label={`Set color ${option.label}`}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={handleDeleteClick}
                className={clsx(
                  "h-7 w-7 rounded-full flex items-center justify-center transition",
                  backgroundImage?.brightness === 'light'
                    ? "text-red-600 hover:bg-red-500/20 hover:text-red-700"
                    : backgroundImage
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
    </>
  );
}
