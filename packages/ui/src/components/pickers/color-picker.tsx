"use client";

import { cn } from "../../lib/utils";
import {
  ENTRY_COLORS,
  type EntryColor,
  type EntryColorConfig,
} from "../../constants/entry-colors";

export interface ColorPickerProps {
  /** Currently selected color */
  value: EntryColor;
  /** Callback when color is selected */
  onChange: (color: EntryColor) => void;
  /** Whether to auto-close after selection (calls onClose) */
  autoClose?: boolean;
  /** Callback when picker should close */
  onClose?: () => void;
  /** Optional background brightness for styling adaptation */
  backgroundBrightness?: "dark" | "light";
  /** Display as popup (absolute positioning) or inline */
  variant?: "popup" | "inline";
  /** Custom colors array (defaults to ENTRY_COLORS) */
  colors?: EntryColorConfig[];
  /** Size of color swatches */
  size?: "sm" | "md" | "lg";
  /** Additional className for the container */
  className?: string;
}

/**
 * ColorPicker - Shared color picker for selecting entry/note colors
 *
 * Features:
 * - Popup or inline variants
 * - Adaptive styling for different backgrounds
 * - Customizable colors array
 * - Auto-close behavior
 *
 * @example
 * ```tsx
 * // Popup variant (for composer)
 * <ColorPicker
 *   value={selectedColor}
 *   onChange={setSelectedColor}
 *   variant="popup"
 *   autoClose
 *   onClose={() => setShowPicker(false)}
 * />
 *
 * // Inline variant (for editor)
 * <ColorPicker
 *   value={selectedColor}
 *   onChange={setSelectedColor}
 *   variant="inline"
 *   backgroundBrightness="dark"
 * />
 * ```
 */
export function ColorPicker({
  value,
  onChange,
  autoClose = true,
  onClose,
  backgroundBrightness,
  variant = "popup",
  colors = ENTRY_COLORS,
  size = "md",
  className,
}: ColorPickerProps) {
  const handleSelect = (colorId: EntryColor) => {
    onChange(colorId);
    if (autoClose && onClose) {
      onClose();
    }
  };

  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const swatchSize = sizeClasses[size];

  // Popup variant (used in composer)
  if (variant === "popup") {
    return (
      <div
        className={cn(
          "absolute bottom-12 left-1/2 z-30 flex -translate-x-1/2 gap-2 rounded-2xl bg-surface-elevated/95 p-3 shadow-floating backdrop-blur-xl",
          className
        )}
      >
        {colors.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => handleSelect(option.id)}
            className={cn(
              "rounded-full border border-transparent transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500",
              swatchSize,
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
      className={cn(
        "flex items-center justify-center gap-2 pb-3 mb-3 border-b",
        backgroundBrightness === "dark" && "border-white/10",
        backgroundBrightness === "light" && "border-black/10",
        !backgroundBrightness && "border-zinc-200 dark:border-zinc-700",
        className
      )}
    >
      {colors.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => handleSelect(option.id)}
          className={cn(
            "inline-flex shrink-0 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--color-primary)]",
            size === "sm" ? "h-5 w-5" : size === "lg" ? "h-9 w-9" : "h-7 w-7",
            option.swatchClass,
            option.id === value && "ring-2 ring-[var(--color-primary)]"
          )}
          aria-label={`Set color ${option.label}`}
        />
      ))}
    </div>
  );
}

export default ColorPicker;
