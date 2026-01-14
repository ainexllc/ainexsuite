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
    <div className="fixed inset-0 z-[200] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/60 dark:bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container - align to start on mobile, center on larger screens */}
      <div className="flex min-h-full items-start sm:items-center justify-center px-4 py-12 sm:p-6">
        {/* Modal */}
        <div
          className={clsx(
            "relative z-10 w-full rounded-2xl bg-popover text-popover-foreground shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-200 flex flex-col",
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
      "flex items-center justify-between border-b border-border px-6 py-4 flex-shrink-0",
      className,
    )}
    {...props}
  >
    <div className="flex-1">{children}</div>
    {onClose && (
      <button
        type="button"
        onClick={onClose}
        className="icon-button h-8 w-8 rounded-full bg-muted hover:bg-muted/80 ml-4 text-foreground"
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
    className={clsx("text-xl font-semibold text-foreground", className)}
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
    className={clsx("text-sm text-muted-foreground mt-1", className)}
    {...props}
  />
));
ModalDescription.displayName = "ModalDescription";

export const ModalContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={clsx("p-6 flex-1 overflow-y-auto max-h-[60vh] sm:max-h-[70vh]", className)} {...props} />
));
ModalContent.displayName = "ModalContent";

export const ModalFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx(
      "flex items-center justify-end gap-3 border-t border-border px-6 py-4 flex-shrink-0",
      className,
    )}
    {...props}
  />
));
ModalFooter.displayName = "ModalFooter";
