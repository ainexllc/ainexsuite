"use client";

import * as React from "react";
import { clsx } from "clsx";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

export interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  variant?: "default" | "elevated" | "frosted";
  className?: string;
  overlayClassName?: string;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
}

/**
 * GlassModal - A glassmorphism-styled modal component with backdrop blur
 *
 * Provides a modern glass-like appearance with:
 * - Backdrop blur for depth
 * - Semi-transparent backgrounds
 * - Smooth animations
 * - Multiple variants (default, elevated, frosted)
 *
 * @example
 * ```tsx
 * <GlassModal isOpen={isOpen} onClose={handleClose} variant="frosted">
 *   <GlassModalHeader onClose={handleClose}>
 *     <GlassModalTitle>Title</GlassModalTitle>
 *   </GlassModalHeader>
 *   <GlassModalContent>
 *     Content here
 *   </GlassModalContent>
 * </GlassModal>
 * ```
 */
export function GlassModal({
  isOpen,
  onClose,
  children,
  size = "md",
  variant = "default",
  className,
  overlayClassName,
  showCloseButton = false,
  closeOnBackdropClick = true,
  closeOnEscape = true,
}: GlassModalProps) {
  React.useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
    full: "max-w-7xl",
  };

  const variantClasses = {
    default: "bg-popover/95 backdrop-blur-xl border border-border text-popover-foreground",
    elevated: "bg-popover/90 backdrop-blur-2xl border border-border shadow-2xl shadow-black/20 text-popover-foreground",
    frosted: "bg-popover/80 backdrop-blur-3xl border border-border shadow-xl text-popover-foreground",
  };

  const content = (
    <div
      className={clsx(
        "fixed inset-0 z-[100] flex items-center justify-center p-4",
        overlayClassName
      )}
    >
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-background/40 dark:bg-background/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={closeOnBackdropClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        className={clsx(
          "relative z-[101] w-full rounded-3xl animate-in zoom-in-95 fade-in duration-300",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        {/* Optional close button in top-right */}
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {children}
      </div>
    </div>
  );

  // Use portal to render at document.body level
  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
}

export const GlassModalHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { onClose?: () => void; showCloseButton?: boolean }
>(({ className, children, onClose, showCloseButton = true, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx(
      "relative flex items-start justify-between gap-4 px-6 py-5 border-b border-border",
      className
    )}
    {...props}
  >
    <div className="flex-1">{children}</div>
    {onClose && showCloseButton && (
      <button
        type="button"
        onClick={onClose}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Close modal"
      >
        <X className="h-4 w-4" />
      </button>
    )}
  </div>
));
GlassModalHeader.displayName = "GlassModalHeader";

export const GlassModalTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={clsx(
      "text-xl font-semibold text-foreground leading-tight",
      className
    )}
    {...props}
  />
));
GlassModalTitle.displayName = "GlassModalTitle";

export const GlassModalDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={clsx(
      "text-sm text-muted-foreground mt-1",
      className
    )}
    {...props}
  />
));
GlassModalDescription.displayName = "GlassModalDescription";

export const GlassModalContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx("px-6 py-5", className)}
    {...props}
  />
));
GlassModalContent.displayName = "GlassModalContent";

export const GlassModalFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx(
      "flex items-center justify-end gap-3 border-t border-border px-6 py-4",
      className
    )}
    {...props}
  />
));
GlassModalFooter.displayName = "GlassModalFooter";
