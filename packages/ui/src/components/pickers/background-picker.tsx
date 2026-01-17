/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Ban, Check, X, ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";
import type { BackgroundOption, BackgroundOverlay } from "@ainexsuite/types";

// ============ Types ============

export interface BackgroundPickerProps {
  /** Currently selected background ID (null for no background) */
  value: string | null;
  /** Available backgrounds to choose from */
  backgrounds: BackgroundOption[];
  /** Callback when background is selected */
  onChange: (backgroundId: string | null) => void;
  /** Current overlay setting */
  overlay?: BackgroundOverlay;
  /** Callback when overlay changes */
  onOverlayChange?: (overlay: BackgroundOverlay) => void;
  /** Callback when picker should close */
  onClose?: () => void;
  /** Display variant */
  variant?: "popup" | "inline" | "modal";
  /** Show overlay options */
  showOverlayOptions?: boolean;
  /** Number of columns in grid */
  columns?: 4 | 5 | 6;
  /** Additional className */
  className?: string;
}

// ============ Overlay Options ============

export const OVERLAY_OPTIONS: { id: BackgroundOverlay; label: string; description: string }[] = [
  { id: "none", label: "None", description: "No overlay" },
  { id: "auto", label: "Auto", description: "Adaptive based on image" },
  { id: "dim", label: "Dim", description: "Light dark overlay" },
  { id: "dimmer", label: "Dimmer", description: "Medium dark overlay" },
  { id: "dimmest", label: "Dimmest", description: "Heavy dark overlay" },
  { id: "glass", label: "Glass", description: "Light frosted glass" },
  { id: "frost", label: "Frost", description: "Heavy frosted glass" },
  { id: "gradient", label: "Gradient", description: "Dark gradient from bottom" },
];

// ============ Main Component ============

/**
 * BackgroundPicker - Shared background image picker component
 *
 * Allows users to select background images and overlay styles.
 * Can be used as a popup, inline, or in a modal.
 *
 * @example
 * ```tsx
 * <BackgroundPicker
 *   value={backgroundId}
 *   backgrounds={availableBackgrounds}
 *   onChange={handleBackgroundChange}
 *   overlay={overlayStyle}
 *   onOverlayChange={handleOverlayChange}
 *   showOverlayOptions
 * />
 * ```
 */
export function BackgroundPicker({
  value,
  backgrounds,
  onChange,
  overlay = "auto",
  onOverlayChange,
  onClose,
  variant = "popup",
  showOverlayOptions = true,
  columns = 6,
  className,
}: BackgroundPickerProps) {
  const [showAllOverlays, setShowAllOverlays] = useState(false);

  const handleSelect = (backgroundId: string | null) => {
    onChange(backgroundId);
  };

  const gridColsClass = columns === 4
    ? "grid-cols-4"
    : columns === 5
      ? "grid-cols-5"
      : "grid-cols-6";

  // Inline variant (embedded in a form/editor)
  if (variant === "inline") {
    return (
      <div className={cn("space-y-3", className)}>
        <div className={cn("grid gap-2", gridColsClass)}>
          {/* No background option */}
          <button
            type="button"
            onClick={() => handleSelect(null)}
            className={cn(
              "relative aspect-video rounded-lg overflow-hidden border-2 transition-all",
              value === null
                ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20"
                : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
            )}
          >
            <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <Ban className="h-4 w-4 text-zinc-400" />
            </div>
            {value === null && (
              <div className="absolute top-1 right-1 h-4 w-4 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                <Check className="h-2.5 w-2.5 text-white" />
              </div>
            )}
          </button>

          {/* Background options */}
          {backgrounds.map((bg) => (
            <button
              key={bg.id}
              type="button"
              onClick={() => handleSelect(bg.id)}
              className={cn(
                "relative aspect-video rounded-lg overflow-hidden border-2 transition-all",
                value === bg.id
                  ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20"
                  : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
              )}
            >
              <img
                src={bg.thumbnail}
                alt={bg.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {value === bg.id && (
                <div className="absolute top-1 right-1 h-4 w-4 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Overlay options */}
        {showOverlayOptions && value && onOverlayChange && (
          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-700">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
              Overlay Style
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {(showAllOverlays ? OVERLAY_OPTIONS : OVERLAY_OPTIONS.slice(0, 4)).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onOverlayChange(option.id)}
                  className={cn(
                    "px-2 py-1.5 rounded-lg text-xs font-medium transition-all",
                    overlay === option.id
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  )}
                  title={option.description}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {OVERLAY_OPTIONS.length > 4 && (
              <button
                type="button"
                onClick={() => setShowAllOverlays(!showAllOverlays)}
                className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 flex items-center gap-1"
              >
                {showAllOverlays ? "Show less" : "More options"}
                <ChevronDown className={cn("h-3 w-3 transition-transform", showAllOverlays && "rotate-180")} />
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Popup variant (fixed position modal-like)
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-20"
        onClick={(e) => {
          e.stopPropagation();
          onClose?.();
        }}
      />

      {/* Picker panel */}
      <div
        className={cn(
          "fixed bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:w-[400px] md:w-[480px] z-30",
          "rounded-2xl p-3 shadow-2xl backdrop-blur-xl",
          "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700",
          "animate-in fade-in slide-in-from-bottom-4 duration-200",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Background Image
          </p>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Grid */}
        <div className={cn("grid gap-2", gridColsClass)}>
          {/* No background option */}
          <button
            type="button"
            onClick={() => handleSelect(null)}
            className={cn(
              "relative aspect-video rounded-lg overflow-hidden border-2 transition-all",
              value === null
                ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20"
                : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
            )}
          >
            <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <Ban className="h-4 w-4 text-zinc-400" />
            </div>
            {value === null && (
              <div className="absolute top-1 right-1 h-4 w-4 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                <Check className="h-2.5 w-2.5 text-white" />
              </div>
            )}
          </button>

          {/* Background options */}
          {backgrounds.map((bg) => (
            <button
              key={bg.id}
              type="button"
              onClick={() => handleSelect(bg.id)}
              className={cn(
                "relative aspect-video rounded-lg overflow-hidden border-2 transition-all",
                value === bg.id
                  ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20"
                  : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
              )}
            >
              <img
                src={bg.thumbnail}
                alt={bg.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {value === bg.id && (
                <div className="absolute top-1 right-1 h-4 w-4 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Empty state */}
        {backgrounds.length === 0 && (
          <p className="text-xs text-zinc-400 text-center py-2">
            No backgrounds available
          </p>
        )}

        {/* Overlay options */}
        {showOverlayOptions && value && onOverlayChange && (
          <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
              Overlay Style
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {OVERLAY_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onOverlayChange(option.id)}
                  className={cn(
                    "px-2 py-1.5 rounded-lg text-xs font-medium transition-all",
                    overlay === option.id
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  )}
                  title={option.description}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default BackgroundPicker;
