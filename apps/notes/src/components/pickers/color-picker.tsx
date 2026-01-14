"use client";

import { clsx } from "clsx";
import type { NoteColor } from "@/lib/types/note";
import { NOTE_COLORS } from "@/lib/constants/note-colors";

export interface ColorPickerProps {
  /**
   * Currently selected color
   */
  value: NoteColor;

  /**
   * Callback when color is selected
   */
  onChange: (color: NoteColor) => void;

  /**
   * Whether to auto-close after selection (calls onClose)
   */
  autoClose?: boolean;

  /**
   * Callback when picker should close
   */
  onClose?: () => void;

  /**
   * Optional background brightness for styling adaptation
   */
  backgroundBrightness?: "dark" | "light";

  /**
   * Display as popup (absolute positioning) or inline
   */
  variant?: "popup" | "inline";
}

/**
 * Shared color picker for selecting note colors
 *
 * Used by both NoteComposer (as popup) and NoteEditor (inline).
 */
export function ColorPicker({
  value,
  onChange,
  autoClose = true,
  onClose,
  backgroundBrightness,
  variant = "popup",
}: ColorPickerProps) {
  const handleSelect = (colorId: NoteColor) => {
    onChange(colorId);
    if (autoClose && onClose) {
      onClose();
    }
  };

  // Popup variant (used in composer)
  if (variant === "popup") {
    return (
      <div className="absolute bottom-12 left-1/2 z-30 flex -translate-x-1/2 gap-2 rounded-2xl bg-surface-elevated/95 p-3 shadow-floating backdrop-blur-xl">
        {NOTE_COLORS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => handleSelect(option.id)}
            className={clsx(
              "h-8 w-8 rounded-full border border-transparent transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500",
              option.swatchClass,
              option.id === value && "ring-2 ring-accent-600"
            )}
            aria-label={`Set color ${option.label}`}
          />
        ))}
      </div>
    );
  }

  // Inline variant (used in editor)
  return (
    <div
      className={clsx(
        "flex items-center justify-center gap-2 pb-3 mb-3 border-b",
        backgroundBrightness === "dark" && "border-white/10",
        backgroundBrightness === "light" && "border-black/10",
        !backgroundBrightness && "border-zinc-200 dark:border-zinc-700"
      )}
    >
      {NOTE_COLORS.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => handleSelect(option.id)}
          className={clsx(
            "inline-flex shrink-0 h-7 w-7 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--color-primary)]",
            option.swatchClass,
            option.id === value && "ring-2 ring-[var(--color-primary)]"
          )}
          aria-label={`Set color ${option.label}`}
        />
      ))}
    </div>
  );
}
