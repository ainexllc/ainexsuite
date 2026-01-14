"use client";

import { clsx } from "clsx";
import { Flame, X } from "lucide-react";
import type { NotePriority } from "@/lib/types/note";

export interface PriorityPickerProps {
  /**
   * Current priority value
   */
  value: NotePriority;

  /**
   * Callback when priority changes
   */
  onChange: (priority: NotePriority) => void;

  /**
   * Callback when picker should close
   */
  onClose?: () => void;

  /**
   * Auto-close after selection
   */
  autoClose?: boolean;
}

const PRIORITY_OPTIONS: Array<{
  id: NotePriority;
  label: string;
  color: string;
  bgColor: string;
}> = [
  { id: "high", label: "High", color: "text-red-500", bgColor: "bg-red-500/20" },
  { id: "medium", label: "Medium", color: "text-amber-500", bgColor: "bg-amber-500/20" },
  { id: "low", label: "Low", color: "text-blue-500", bgColor: "bg-blue-500/20" },
];

/**
 * Shared priority picker dropdown for notes
 *
 * Used by both NoteComposer and NoteEditor.
 */
export function PriorityPicker({
  value,
  onChange,
  onClose,
  autoClose = true,
}: PriorityPickerProps) {
  const handleSelect = (priority: NotePriority) => {
    onChange(priority);
    if (autoClose && onClose) {
      onClose();
    }
  };

  const handleClear = () => {
    onChange(null);
    if (autoClose && onClose) {
      onClose();
    }
  };

  return (
    <div className="absolute top-12 right-0 z-30 flex flex-col gap-1 rounded-xl bg-surface-elevated/95 p-2 shadow-floating backdrop-blur-xl min-w-[140px]">
      {PRIORITY_OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => handleSelect(option.id)}
          className={clsx(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition",
            value === option.id
              ? `${option.bgColor} ${option.color}`
              : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          )}
        >
          <Flame className={clsx("h-4 w-4", option.color)} />
          {option.label}
        </button>
      ))}

      {/* Clear option - only show if priority is set */}
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700 mt-1 pt-2"
        >
          <X className="h-4 w-4" />
          Clear
        </button>
      )}
    </div>
  );
}

/**
 * Helper to get the button styles based on current priority
 */
export function getPriorityButtonStyles(priority: NotePriority): string {
  switch (priority) {
    case "high":
      return "text-red-500 bg-red-500/10";
    case "medium":
      return "text-amber-500 bg-amber-500/10";
    case "low":
      return "text-blue-500 bg-blue-500/10";
    default:
      return "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800";
  }
}
