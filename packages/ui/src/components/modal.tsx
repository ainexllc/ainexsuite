"use client";

import * as React from "react";
import { clsx } from "clsx";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  children,
  size = "md",
  className,
}: ModalProps) {
  React.useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-overlay/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={clsx(
          "relative z-50 w-full rounded-2xl bg-surface-elevated shadow-2xl border border-outline-subtle/60 animate-in fade-in zoom-in-95 duration-200",
          size === "sm" && "max-w-sm",
          size === "md" && "max-w-md",
          size === "lg" && "max-w-lg",
          size === "xl" && "max-w-2xl",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

export const ModalHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { onClose?: () => void }
>(({ className, children, onClose, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx(
      "flex items-center justify-between border-b border-outline-subtle/40 px-6 py-4",
      className,
    )}
    {...props}
  >
    <div className="flex-1">{children}</div>
    {onClose && (
      <button
        type="button"
        onClick={onClose}
        className="icon-button h-8 w-8 rounded-full bg-surface-muted hover:bg-ink-200 ml-4"
        aria-label="Close modal"
      >
        <X className="h-4 w-4" />
      </button>
    )}
  </div>
));
ModalHeader.displayName = "ModalHeader";

export const ModalTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={clsx("text-xl font-semibold text-ink-900", className)}
    {...props}
  />
));
ModalTitle.displayName = "ModalTitle";

export const ModalDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={clsx("text-sm text-muted mt-1", className)}
    {...props}
  />
));
ModalDescription.displayName = "ModalDescription";

export const ModalContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={clsx("p-6", className)} {...props} />
));
ModalContent.displayName = "ModalContent";

export const ModalFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx(
      "flex items-center justify-end gap-3 border-t border-outline-subtle/40 px-6 py-4",
      className,
    )}
    {...props}
  />
));
ModalFooter.displayName = "ModalFooter";
