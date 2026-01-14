"use client";

import { useMemo, useState } from "react";
import { Loader2, Trash2, Undo, AlertTriangle, Clock } from "lucide-react";
import { clsx } from "clsx";
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalContent,
  ModalFooter,
  ConfirmationDialog,
} from "@ainexsuite/ui";
import { useNotes } from "@/components/providers/notes-provider";
import {
  formatRelativeTime,
  getDaysRemainingLabel,
  getUrgencyLevel,
} from "@/lib/utils/datetime";
import type { Note } from "@/lib/types/note";

interface TrashModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Helper to strip HTML tags for preview display
function stripHtml(html: string): string {
  if (!html.includes("<")) return html;
  if (typeof DOMParser !== "undefined") {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  }
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function getPreview(note: Note): string {
  if (note.body?.trim()) {
    return stripHtml(note.body).slice(0, 60);
  }
  if (note.checklist?.length) {
    const first = note.checklist.find((item) => item.text.trim());
    return first ? first.text.trim().slice(0, 60) : "";
  }
  return "";
}

export function TrashModal({ isOpen, onClose }: TrashModalProps) {
  const { trashed, loading, restoreNote, destroyNote, destroyAllNotes } =
    useNotes();
  const [pendingRestoreId, setPendingRestoreId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmEmptyAll, setConfirmEmptyAll] = useState(false);
  const [emptying, setEmptying] = useState(false);

  const hasNotes = trashed.length > 0;

  const grouped = useMemo(() => {
    return trashed.map((note) => ({
      ...note,
      deletedLabel: note.deletedAt
        ? formatRelativeTime(note.deletedAt)
        : formatRelativeTime(note.updatedAt ?? note.createdAt),
      preview: getPreview(note),
      daysRemainingLabel: note.deletedAt
        ? getDaysRemainingLabel(note.deletedAt)
        : "30 days remaining",
      urgency: note.deletedAt ? getUrgencyLevel(note.deletedAt) : "normal",
    }));
  }, [trashed]);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalHeader onClose={onClose}>
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-muted-foreground" />
            <ModalTitle>Trash</ModalTitle>
            {hasNotes && (
              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {trashed.length}
              </span>
            )}
          </div>
        </ModalHeader>

        <ModalContent className="max-h-[60vh] overflow-y-auto p-0">
          {loading ? (
            <div className="space-y-1 p-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse h-12 rounded bg-muted/50"
                />
              ))}
            </div>
          ) : hasNotes ? (
            <div className="divide-y divide-border">
              <div className="px-4 py-2 text-xs text-muted-foreground bg-muted/30">
                Notes stay here for 30 days before they&apos;re permanently deleted.
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-[1fr_100px_100px_140px] gap-3 px-4 py-2 text-xs font-medium text-muted-foreground bg-muted/20">
                <span>Note</span>
                <span>Deleted</span>
                <span>Expires</span>
                <span className="text-right">Actions</span>
              </div>

              {/* Table Rows */}
              {grouped.map((note) => {
                const isRestoring = pendingRestoreId === note.id;
                const isDeleting = pendingDeleteId === note.id;

                return (
                  <div
                    key={note.id}
                    className={clsx(
                      "grid grid-cols-[1fr_100px_100px_140px] gap-3 px-4 py-3 items-center transition-colors hover:bg-muted/20",
                      note.urgency === "critical" && "bg-red-500/5",
                      note.urgency === "warning" && "bg-amber-500/5"
                    )}
                  >
                    {/* Note Title & Preview */}
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-foreground">
                        {note.title?.trim() || "Untitled note"}
                      </div>
                      {note.preview && (
                        <div className="truncate text-xs text-muted-foreground">
                          {note.preview}
                        </div>
                      )}
                    </div>

                    {/* Deleted Date */}
                    <div className="text-xs text-muted-foreground">
                      {note.deletedLabel}
                    </div>

                    {/* Days Remaining */}
                    <div
                      className={clsx(
                        "flex items-center gap-1 text-xs font-medium",
                        note.urgency === "critical"
                          ? "text-red-500"
                          : note.urgency === "warning"
                            ? "text-amber-500"
                            : "text-muted-foreground"
                      )}
                    >
                      <Clock className="h-3 w-3" />
                      <span className="truncate">{note.daysRemainingLabel}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={async () => {
                          setPendingRestoreId(note.id);
                          try {
                            await restoreNote(note.id);
                          } finally {
                            setPendingRestoreId(null);
                          }
                        }}
                        disabled={isRestoring || isDeleting}
                        className="inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isRestoring ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Undo className="h-3 w-3" />
                        )}
                        Restore
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(note.id)}
                        disabled={isRestoring || isDeleting}
                        className="inline-flex items-center justify-center rounded-md border border-destructive/50 p-1 text-destructive transition hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label="Delete permanently"
                      >
                        {isDeleting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <Trash2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-medium text-foreground">
                Trash is empty
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Deleted notes will appear here for 30 days
              </p>
            </div>
          )}
        </ModalContent>

        {hasNotes && (
          <ModalFooter>
            <button
              type="button"
              onClick={() => setConfirmEmptyAll(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-destructive/50 px-4 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/10"
            >
              <AlertTriangle className="h-4 w-4" />
              Empty Trash
            </button>
          </ModalFooter>
        )}
      </Modal>

      {/* Confirmation for single delete */}
      <ConfirmationDialog
        isOpen={Boolean(confirmDeleteId)}
        onClose={() => {
          if (!pendingDeleteId) {
            setConfirmDeleteId(null);
          }
        }}
        onConfirm={async () => {
          if (!confirmDeleteId) return;
          setPendingDeleteId(confirmDeleteId);
          try {
            await destroyNote(confirmDeleteId);
            setConfirmDeleteId(null);
          } finally {
            setPendingDeleteId(null);
          }
        }}
        title="Delete permanently?"
        description="This action cannot be undone. Attachments will be removed from storage."
        confirmText="Delete forever"
        cancelText="Keep in trash"
        variant="danger"
      />

      {/* Confirmation for empty all */}
      <ConfirmationDialog
        isOpen={confirmEmptyAll}
        onClose={() => {
          if (!emptying) {
            setConfirmEmptyAll(false);
          }
        }}
        onConfirm={async () => {
          setEmptying(true);
          try {
            await destroyAllNotes();
            setConfirmEmptyAll(false);
          } finally {
            setEmptying(false);
          }
        }}
        title="Empty trash?"
        description="This will permanently delete all notes in the trash. This action cannot be undone."
        confirmText="Empty trash"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
}
