"use client";

import { useMemo, useState } from "react";
import { Loader2, Trash2, Undo, AlertTriangle } from "lucide-react";
import { EmptyState, ConfirmationDialog } from "@ainexsuite/ui";
import { useDocs } from "@/components/providers/docs-provider";
import { Container } from "@/components/layout/container";
import { formatRelativeTime } from "@/lib/utils/datetime";
import type { Doc } from "@/lib/types/doc";

function Skeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="rounded-3xl border border-outline-subtle/60 bg-surface-muted/50 px-6 py-6 shadow-inner animate-pulse"
        >
          <div className="h-5 w-2/5 rounded-full bg-surface-muted" />
          <div className="mt-3 h-4 w-3/5 rounded-full bg-surface-muted/70" />
        </div>
      ))}
    </div>
  );
}

function getPreview(doc: Doc): string {
  if (doc.body?.trim()) {
    return doc.body.trim().slice(0, 160);
  }
  if (doc.checklist?.length) {
    const first = doc.checklist.find((item) => item.text.trim());
    return first ? first.text.trim().slice(0, 160) : "";
  }
  return "";
}

export function TrashBoard() {
  const { trashed, loading, restoreDoc, destroyDoc, destroyAllDocs } = useDocs();
  const [pendingRestoreId, setPendingRestoreId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmEmptyAll, setConfirmEmptyAll] = useState(false);
  const [emptying, setEmptying] = useState(false);

  const hasNotes = trashed.length > 0;

  const grouped = useMemo(() => {
    return trashed.map(doc => ({
      ...doc,
      deletedLabel: doc.deletedAt
        ? formatRelativeTime(doc.deletedAt)
        : formatRelativeTime(doc.updatedAt ?? doc.createdAt),
      preview: getPreview(doc),
    }));
  }, [trashed]);

  return (
    <Container className="space-y-8 lg:px-0" variant="narrow">
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-ink-100 px-3 py-1 text-xs font-semibold text-ink-700 dark:bg-surface-muted">
          <Trash2 className="h-3.5 w-3.5" /> Trash
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-ink-800">Review deleted docs</h1>
            <p className="text-sm text-muted">
              Notes stay here for 30 days before they&apos;re permanently deleted. Restore mistakes or remove them forever.
            </p>
          </div>
          {hasNotes ? (
            <button
              type="button"
              onClick={() => setConfirmEmptyAll(true)}
              className="inline-flex items-center gap-2 rounded-full border border-outline-subtle/70 px-4 py-2 text-sm font-semibold text-danger transition hover:border-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-danger"
            >
              <AlertTriangle className="h-4 w-4" /> Empty trash
            </button>
          ) : null}
        </div>
      </header>

      {loading ? (
        <Skeleton />
      ) : hasNotes ? (
        <div className="space-y-4">
          {grouped.map(doc => {
            const isRestoring = pendingRestoreId === doc.id;
            const isDeleting = pendingDeleteId === doc.id;

            return (
              <article
                key={doc.id}
                className="flex flex-col gap-4 rounded-3xl border border-outline-subtle/60 bg-surface-muted/40 px-6 py-5 shadow-inner sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink-800">
                    {doc.title?.trim() ? doc.title : "Untitled doc"}
                    <span className="text-xs font-medium uppercase tracking-wide text-ink-400">
                      Deleted {doc.deletedLabel}
                    </span>
                  </div>
                  {doc.preview ? (
                    <p className="text-sm text-muted">{doc.preview}</p>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      setPendingRestoreId(doc.id);
                      try {
                        await restoreDoc(doc.id);
                      } finally {
                        setPendingRestoreId(null);
                      }
                    }}
                    disabled={isRestoring || isDeleting}
                    className="inline-flex items-center gap-2 rounded-full bg-accent-500 px-4 py-2 text-sm font-semibold text-ink-50 shadow-sm transition hover:bg-accent-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isRestoring ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Restoring…
                      </>
                    ) : (
                      <>
                        <Undo className="h-4 w-4" /> Restore
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(doc.id)}
                    disabled={isRestoring || isDeleting}
                    className="inline-flex items-center gap-2 rounded-full border border-outline-subtle/70 px-4 py-2 text-sm font-semibold text-danger transition hover:border-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-danger disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Deleting…
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4" /> Delete forever
                      </>
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="Trash is empty"
          description="Delete docs from your workspace and they'll collect here for 30 days before being permanently removed."
          icon={Trash2}
          variant="default"
        />
      )}

      <ConfirmationDialog
        isOpen={Boolean(confirmDeleteId)}
        onClose={() => {
          if (!pendingDeleteId) {
            setConfirmDeleteId(null);
          }
        }}
        onConfirm={async () => {
          if (!confirmDeleteId) {
            return;
          }
          setPendingDeleteId(confirmDeleteId);
          try {
            await destroyDoc(confirmDeleteId);
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
            await destroyAllDocs();
            setConfirmEmptyAll(false);
          } finally {
            setEmptying(false);
          }
        }}
        title="Empty trash?"
        description="This will permanently delete all docs in the trash, including their attachments. This action cannot be undone."
        confirmText="Empty trash"
        cancelText="Cancel"
        variant="danger"
      />
    </Container>
  );
}
