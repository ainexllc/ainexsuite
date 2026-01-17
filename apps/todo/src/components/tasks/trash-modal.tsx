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
import { useTodoStore } from "@/lib/store";
import { useSpaces } from "@/components/providers/spaces-provider";
import {
  formatRelativeTime,
  getDaysRemainingLabel,
  getUrgencyLevel,
} from "@/lib/utils/datetime";

interface TrashModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TrashModal({ isOpen, onClose }: TrashModalProps) {
  const { tasks, restoreTask, permanentlyDeleteTask, emptyTrash } = useTodoStore();
  const { currentSpaceId } = useSpaces();

  const [pendingRestoreId, setPendingRestoreId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmEmptyAll, setConfirmEmptyAll] = useState(false);
  const [emptying, setEmptying] = useState(false);

  // Get trashed tasks for current space
  const trashedTasks = useMemo(() => {
    return tasks.filter((t) => t.deletedAt && t.spaceId === currentSpaceId);
  }, [tasks, currentSpaceId]);

  const hasItems = trashedTasks.length > 0;

  const grouped = useMemo(() => {
    return trashedTasks.map((task) => {
      const deletedDate = task.deletedAt ? new Date(task.deletedAt) : new Date();
      return {
        ...task,
        deletedLabel: formatRelativeTime(deletedDate),
        daysRemainingLabel: getDaysRemainingLabel(deletedDate),
        urgency: getUrgencyLevel(deletedDate),
      };
    });
  }, [trashedTasks]);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalHeader onClose={onClose}>
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-muted-foreground" />
            <ModalTitle>Trash</ModalTitle>
            {hasItems && (
              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {trashedTasks.length}
              </span>
            )}
          </div>
        </ModalHeader>

        <ModalContent className="max-h-[60vh] overflow-y-auto p-0">
          {hasItems ? (
            <div className="divide-y divide-border">
              <div className="px-4 py-2 text-xs text-muted-foreground bg-muted/30">
                Tasks stay here for 30 days before they&apos;re permanently deleted.
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-[1fr_100px_120px_140px] gap-3 px-4 py-2 text-xs font-medium text-muted-foreground bg-muted/20">
                <span>Task</span>
                <span>Deleted</span>
                <span>Expires</span>
                <span className="text-right">Actions</span>
              </div>

              {/* Table Rows */}
              {grouped.map((task) => {
                const isRestoring = pendingRestoreId === task.id;
                const isDeleting = pendingDeleteId === task.id;

                return (
                  <div
                    key={task.id}
                    className={clsx(
                      "grid grid-cols-[1fr_100px_120px_140px] gap-3 px-4 py-3 items-center transition-colors hover:bg-muted/20",
                      task.urgency === "critical" && "bg-red-500/5",
                      task.urgency === "warning" && "bg-amber-500/5"
                    )}
                  >
                    {/* Task Title */}
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-foreground">
                        {task.title || "Untitled task"}
                      </div>
                      {task.description && (
                        <div className="truncate text-xs text-muted-foreground">
                          {task.description.slice(0, 60)}
                        </div>
                      )}
                    </div>

                    {/* Deleted Date */}
                    <div className="text-xs text-muted-foreground">
                      {task.deletedLabel}
                    </div>

                    {/* Days Remaining */}
                    <div
                      className={clsx(
                        "flex items-center gap-1 text-xs font-medium",
                        task.urgency === "critical"
                          ? "text-red-500"
                          : task.urgency === "warning"
                            ? "text-amber-500"
                            : "text-muted-foreground"
                      )}
                    >
                      <Clock className="h-3 w-3" />
                      <span className="truncate">{task.daysRemainingLabel}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={async () => {
                          setPendingRestoreId(task.id);
                          try {
                            await restoreTask(task.id);
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
                        onClick={() => setConfirmDeleteId(task.id)}
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
                Deleted tasks will appear here for 30 days
              </p>
            </div>
          )}
        </ModalContent>

        {hasItems && (
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
            await permanentlyDeleteTask(confirmDeleteId);
            setConfirmDeleteId(null);
          } finally {
            setPendingDeleteId(null);
          }
        }}
        title="Delete permanently?"
        description="This action cannot be undone. The task will be permanently removed."
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
            await emptyTrash(currentSpaceId);
            setConfirmEmptyAll(false);
          } finally {
            setEmptying(false);
          }
        }}
        title="Empty trash?"
        description="This will permanently delete all tasks in the trash. This action cannot be undone."
        confirmText="Empty trash"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
}
