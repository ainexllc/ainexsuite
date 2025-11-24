"use client";

/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react";
import {
  Archive,
  LayoutGrid,
  Palette,
  Pin,
  PinOff,
  Trash2,
  Users,
} from "lucide-react";
import { clsx } from "clsx";
import type { Note, NotePattern } from "@/lib/types/note";
import type { ViewMode } from "@/lib/types/settings";
import { useNotes } from "@/components/providers/notes-provider";
import { NOTE_COLORS } from "@/lib/constants/note-colors";
import { NOTE_PATTERNS } from "@/lib/constants/note-patterns";
import { NoteEditor } from "@/components/notes/note-editor";
import { useLabels } from "@/components/providers/labels-provider";
import { ConfirmModal } from "@/components/ui/confirm-modal";

type NoteCardProps = {
  note: Note;
  viewMode?: ViewMode;
};

export function NoteCard({ note, viewMode = "masonry" }: NoteCardProps) {
  const { togglePin, toggleArchive, deleteNote, updateNote } = useNotes();
  const { labels } = useLabels();
  const [isEditing, setIsEditing] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [showPatternPicker, setShowPatternPicker] = useState(false);
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

  const patternClass = note.pattern && note.pattern !== "none"
    ? NOTE_PATTERNS.find((p) => p.id === note.pattern)?.patternClass || ""
    : "";

  // Determine orb colors based on note color
  const isDefault = note.color === "default";
  const orbColor = isDefault ? "bg-orange-500" : `bg-${note.color}`;
  // For variety, we could use a secondary color, but using the same one keeps it cohesive
  const orb2Color = isDefault ? "bg-blue-500" : `bg-${note.color}`;

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
    setShowPatternPicker(false);
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

  const handleOpenPatternPicker = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setShowPalette(false);
    setShowPatternPicker((prev) => !prev);
  };

  const handlePatternSelect = async (
    event: React.MouseEvent<HTMLButtonElement>,
    pattern: NotePattern,
  ) => {
    event.stopPropagation();
    if (pattern === note.pattern) {
      setShowPatternPicker(false);
      return;
    }
    await updateNote(note.id, { pattern });
    setShowPatternPicker(false);
  };

  return (
    <>
      <article
        className={clsx(
          "group relative cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-[#1a1a1a]/40 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:shadow-2xl",
          viewMode === "list"
            ? "flex items-start gap-4 px-5 py-3"
            : "break-inside-avoid px-6 py-6",
        )}
        onClick={() => {
          setIsEditing(true);
        }}
      >
        {/* Atmospheric Orbs */}
        <div className={clsx("absolute -top-32 -right-32 h-64 w-64 rounded-full blur-[80px] pointer-events-none opacity-20 transition-colors duration-500", orbColor)} />
        <div className={clsx("absolute -bottom-32 -left-32 h-64 w-64 rounded-full blur-[80px] pointer-events-none opacity-15 transition-colors duration-500", orb2Color)} />
        
        {/* Pattern Overlay */}
        {patternClass && (
            <div className={clsx("absolute inset-0 pointer-events-none opacity-5 mix-blend-overlay", patternClass)} />
        )}

        <div className="relative z-10 w-full">
          <button
            type="button"
            onClick={handlePin}
            className={clsx(
              "absolute right-0 top-0 hidden rounded-full bg-white/10 p-2 text-white shadow-sm transition hover:bg-white/20 group-hover:flex",
              note.pinned && "text-accent-400 flex",
            )}
            aria-label={note.pinned ? "Unpin note" : "Pin note"}
          >
            {note.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
          </button>

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
              <h3 className="pr-8 text-base font-semibold text-white">
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
                      item.completed ? "text-white/40 line-through" : "text-white/80",
                    )}
                  >
                    <span className={clsx("mt-1 h-2 w-2 rounded-full", item.completed ? "bg-white/20" : "bg-accent-500")} />
                    <span>{item.text}</span>
                  </li>
                ))}
                {note.checklist.length > 6 ? (
                  <li className="text-xs text-white/40">
                    +{note.checklist.length - 6} more
                  </li>
                ) : null}
              </ul>
            ) : note.body ? (
              <p className="mt-3 whitespace-pre-wrap text-sm text-white/70 leading-relaxed">
                {note.body}
              </p>
            ) : null}

            {note.attachments.length ? (
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {note.attachments.slice(0, 4).map((attachment) => (
                  <figure
                    key={attachment.id}
                    className="overflow-hidden rounded-2xl bg-white/10 shadow-sm border border-white/5"
                  >
                    <img
                      src={attachment.downloadURL}
                      alt={attachment.name}
                      className="h-24 w-full object-cover"
                    />
                  </figure>
                ))}
                {note.attachments.length > 4 ? (
                  <div className="grid place-items-center rounded-2xl bg-white/10 p-4 text-xs font-medium text-white/60">
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
                    className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 border border-white/5"
                  >
                    <span
                      className={clsx(
                        "h-2 w-2 rounded-full",
                        label.color === "default"
                          ? "bg-white/40"
                          : `bg-${label.color}`,
                      )}
                    />
                    <span>{label.name}</span>
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <footer className="mt-4 flex items-center justify-between pt-2 border-t border-white/5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-white/40">
              {note.sharedWithUserIds?.length ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/80">
                  <Users className="h-3 w-3" />
                  {note.sharedWithUserIds.length}
                </span>
              ) : null}
              <span>{note.updatedAt.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleArchive}
                className="icon-button h-8 w-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-full"
                aria-label={note.archived ? "Unarchive note" : "Archive note"}
              >
                <Archive className="h-4 w-4" />
              </button>
              <div className="relative flex items-center">
                <button
                  type="button"
                  onClick={handleOpenPalette}
                  className={clsx(
                    "icon-button h-8 w-8 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10",
                    showPalette && "bg-white/20 text-white",
                  )}
                  aria-label="Change color"
                >
                  <Palette className="h-4 w-4" />
                </button>
                {showPalette ? (
                  <div
                    className="absolute bottom-10 right-0 z-30 flex gap-2 rounded-2xl bg-[#1a1a1a]/95 p-3 shadow-2xl backdrop-blur-xl border border-white/10"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {NOTE_COLORS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className={clsx(
                          "h-6 w-6 rounded-full border border-transparent transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500",
                          option.swatchClass,
                          option.id === note.color && "ring-2 ring-white",
                        )}
                        onClick={(event) => handleColorSelect(event, option.id)}
                        aria-label={`Set color ${option.label}`}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="relative flex items-center">
                <button
                  type="button"
                  onClick={handleOpenPatternPicker}
                  className={clsx(
                    "icon-button h-8 w-8 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10",
                    showPatternPicker && "bg-white/20 text-white",
                  )}
                  aria-label="Change pattern"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                {showPatternPicker ? (
                  <div
                    className="absolute bottom-10 right-0 z-30 flex flex-row flex-nowrap items-center gap-2 rounded-2xl bg-[#1a1a1a]/95 p-3 shadow-2xl backdrop-blur-xl border border-white/10"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {NOTE_PATTERNS.map((pattern) => (
                      <button
                        key={pattern.id}
                        type="button"
                        className={clsx(
                          "inline-flex shrink-0 h-6 w-6 rounded-full border-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500 shadow-sm border-white/20",
                          pattern.previewClass,
                          pattern.id === (note.pattern || "none") && "ring-2 ring-white",
                        )}
                        onClick={(event) => handlePatternSelect(event, pattern.id)}
                        aria-label={`Set pattern ${pattern.label}`}
                        title={pattern.description}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={handleDeleteClick}
                className="icon-button h-8 w-8 flex items-center justify-center text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-full"
                aria-label="Delete note"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </footer>
        </div>
      </article>

      {isEditing ? (
        <NoteEditor note={note} onClose={() => setIsEditing(false)} />
      ) : null}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete this note?"
        message="This will move the note to the Trash. You can restore it from there within the next 30 days."
        confirmLabel="Delete note"
        cancelLabel="Keep note"
        isProcessing={isDeleting}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
