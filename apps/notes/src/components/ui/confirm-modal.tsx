"use client";

import { createPortal } from "react-dom";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { clsx } from "clsx";

type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isProcessing?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isProcessing = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) {
    return null;
  }

  const content = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/60 px-3 py-6">
      <div
        className="relative w-full max-w-md rounded-3xl border border-outline-subtle bg-surface-elevated shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-500 transition hover:bg-surface-muted hover:text-ink-700 disabled:opacity-50"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col gap-4 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-danger/10 text-danger">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1 pt-1">
              <h2
                id="confirm-modal-title"
                className="text-lg font-semibold text-ink-800"
              >
                {title}
              </h2>
              <p className="mt-1 text-sm text-ink-600">{message}</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className="rounded-full px-4 py-2 text-sm font-medium text-ink-600 transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isProcessing}
              className={clsx(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-danger disabled:opacity-50",
                "bg-danger hover:bg-danger/90",
              )}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {confirmLabel}...
                </>
              ) : (
                confirmLabel
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
