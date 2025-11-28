"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { GlassModal, GlassModalHeader, GlassModalContent, GlassModalFooter } from "../glass-modal";

/**
 * FormModal Props
 */
export interface FormModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Modal title */
  title: string;
  /** Description text shown below title */
  description?: string;
  /** Callback when Save button is clicked */
  onSave: () => void | Promise<void>;
  /** Callback when Cancel button is clicked (defaults to onClose) */
  onCancel?: () => void;
  /** Whether the form is being saved/submitted */
  isLoading?: boolean;
  /** Disable the save button */
  disableSave?: boolean;
  /** Text for the save button */
  saveLabel?: string;
  /** Text for the cancel button */
  cancelLabel?: string;
  /** Form content */
  children: React.ReactNode;
  /** Accent color from theme (e.g., #f97316 for Journey) */
  accentColor?: string;
  /** Modal size */
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** Additional class names */
  className?: string;
}

/**
 * FormModal - A modal component for create/edit forms
 *
 * Features:
 * - Save and Cancel action buttons
 * - Loading state with spinner
 * - Glassmorphism styling
 * - Theme-aware accent colors
 * - Async save handler support
 *
 * @example
 * ```tsx
 * <FormModal
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   title="Create Entry"
 *   description="Fill in the details below"
 *   onSave={async () => await saveEntry()}
 *   isLoading={isSaving}
 *   saveLabel="Create"
 *   accentColor="#f97316"
 * >
 *   <form>
 *     <Input label="Title" />
 *     <Textarea label="Content" />
 *   </form>
 * </FormModal>
 * ```
 */
export function FormModal({
  isOpen,
  onClose,
  title,
  description,
  onSave,
  onCancel,
  isLoading = false,
  disableSave = false,
  saveLabel = "Save",
  cancelLabel = "Cancel",
  children,
  accentColor = "#6366f1", // Default to indigo
  size = "md",
  className,
}: FormModalProps) {
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave();
      // Don't close automatically - let the parent handle success
    } catch (error) {
      // Error handling should be done by parent
      console.error("Form save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  const loading = isLoading || isSaving;

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      variant="frosted"
      closeOnBackdropClick={!loading}
      closeOnEscape={!loading}
      className={className}
    >
      {/* Header */}
      <GlassModalHeader onClose={onClose} showCloseButton={!loading}>
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">
              {description}
            </p>
          )}
        </div>
      </GlassModalHeader>

      {/* Content */}
      <GlassModalContent className="max-h-[60vh] overflow-y-auto">
        {children}
      </GlassModalContent>

      {/* Footer with Actions */}
      <GlassModalFooter className="justify-end">
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="px-6 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={loading || disableSave}
          className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: accentColor,
            boxShadow: `0 4px 14px -2px ${accentColor}40`,
          }}
          onMouseEnter={(e) => {
            if (!loading && !disableSave) {
              e.currentTarget.style.filter = "brightness(0.9)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.filter = "brightness(1)";
          }}
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{loading ? `${saveLabel}...` : saveLabel}</span>
        </button>
      </GlassModalFooter>
    </GlassModal>
  );
}
