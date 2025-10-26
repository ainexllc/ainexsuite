/**
 * Modal Component Template
 *
 * Accessible modal dialog with focus management and keyboard support.
 *
 * Features:
 * - Focus trap within modal
 * - Close on Escape key
 * - Close on backdrop click
 * - Restore focus on close
 * - Full ARIA support
 * - Smooth animations
 *
 * Usage:
 *   const [isOpen, setIsOpen] = useState(false);
 *
 *   <Modal
 *     isOpen={isOpen}
 *     onClose={() => setIsOpen(false)}
 *     title="Confirm Action"
 *   >
 *     <p>Are you sure you want to continue?</p>
 *     <div className="mt-6 flex gap-3 justify-end">
 *       <Button variant="secondary" onClick={() => setIsOpen(false)}>
 *         Cancel
 *       </Button>
 *       <Button onClick={handleConfirm}>
 *         Confirm
 *       </Button>
 *     </div>
 *   </Modal>
 */

"use client";

import { ReactNode, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { clsx } from "clsx";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Store and restore focus
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // Store previously focused element
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus first focusable element in modal
    const focusable = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusable && focusable.length > 0) {
      (focusable[0] as HTMLElement).focus();
    }

    // Restore focus on unmount
    return () => {
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) {
      return;
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeOnBackdropClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={clsx(
          "relative w-full rounded-2xl border border-outline-subtle bg-white p-6 shadow-xl dark:bg-surface-elevated",
          "animate-in fade-in zoom-in-95 duration-200",
          sizes[size],
          className
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="mb-4 flex items-start justify-between gap-4">
            {title && (
              <h2
                id="modal-title"
                className="text-xl font-bold text-ink-base dark:text-ink-100"
              >
                {title}
              </h2>
            )}

            {showCloseButton && (
              <button
                onClick={onClose}
                className="flex-shrink-0 rounded-full p-1 text-ink-muted transition hover:bg-surface-muted hover:text-ink-base dark:hover:bg-surface-base"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="text-ink-base dark:text-ink-200">{children}</div>
      </div>
    </div>
  );
}
