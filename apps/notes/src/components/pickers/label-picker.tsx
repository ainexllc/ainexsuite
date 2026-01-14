"use client";

import { useCallback, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { Plus, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { useLabels } from "@/components/providers/labels-provider";

export interface LabelPickerProps {
  /**
   * Currently selected label IDs
   */
  selectedIds: string[];

  /**
   * Callback when selection changes
   */
  onChange: (ids: string[]) => void;

  /**
   * Optional background brightness for styling (from note background)
   * When provided, styles adapt to look good over the background
   */
  backgroundBrightness?: "dark" | "light";

  /**
   * Whether the picker has a background behind it (glass effect)
   */
  hasBackground?: boolean;

  /**
   * Compact mode for composer (less padding, simpler styling)
   */
  compact?: boolean;
}

/**
 * Shared label picker for selecting and creating note labels/tags
 *
 * Used by both NoteComposer and NoteEditor with different styling contexts.
 */
export function LabelPicker({
  selectedIds,
  onChange,
  backgroundBrightness,
  hasBackground = false,
  compact = false,
}: LabelPickerProps) {
  const { labels, createLabel } = useLabels();
  const [newLabelName, setNewLabelName] = useState("");
  const [isCreatingLabel, setIsCreatingLabel] = useState(false);
  const newLabelInputRef = useRef<HTMLInputElement>(null);

  // Filter labels by search query
  const filteredLabels = newLabelName.trim()
    ? labels.filter((label) =>
        label.name.toLowerCase().includes(newLabelName.trim().toLowerCase())
      )
    : labels;

  const toggleLabelSelection = useCallback(
    (labelId: string) => {
      if (selectedIds.includes(labelId)) {
        onChange(selectedIds.filter((id) => id !== labelId));
      } else {
        onChange([...selectedIds, labelId]);
      }
    },
    [selectedIds, onChange]
  );

  const handleCreateNewLabel = useCallback(async () => {
    const name = newLabelName.trim();
    if (!name || isCreatingLabel) {
      return;
    }

    // Check if a label with this name already exists (case-insensitive)
    const existingLabel = labels.find(
      (label) => label.name.toLowerCase() === name.toLowerCase()
    );
    if (existingLabel) {
      // If it exists, just select it and clear the input
      if (!selectedIds.includes(existingLabel.id)) {
        onChange([...selectedIds, existingLabel.id]);
      }
      setNewLabelName("");
      return;
    }

    try {
      setIsCreatingLabel(true);
      const newLabelId = await createLabel({ name });
      if (newLabelId) {
        onChange([...selectedIds, newLabelId]);
      }
      setNewLabelName("");
    } catch (error) {
      console.error("[LabelPicker] Failed to create label:", error);
    } finally {
      setIsCreatingLabel(false);
    }
  }, [newLabelName, isCreatingLabel, labels, selectedIds, onChange, createLabel]);

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void handleCreateNewLabel();
    } else if (e.key === "Escape") {
      setNewLabelName("");
      newLabelInputRef.current?.blur();
    }
  };

  // Check if the current search term already exists as a label
  const searchTermExistsAsLabel = labels.some(
    (l) => l.name.toLowerCase() === newLabelName.trim().toLowerCase()
  );

  // Determine styles based on context
  const getInputStyles = () => {
    if (hasBackground && backgroundBrightness) {
      return backgroundBrightness === "dark"
        ? "bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-white/40"
        : "bg-black/5 border-black/10 text-zinc-900 placeholder-zinc-500 focus:border-black/20";
    }
    if (compact) {
      return "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-zinc-300 dark:focus:border-zinc-600";
    }
    return "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-zinc-300 dark:focus:border-zinc-600";
  };

  const getLoaderStyles = () => {
    if (hasBackground && backgroundBrightness) {
      return backgroundBrightness === "dark" ? "text-white/50" : "text-zinc-500";
    }
    return "text-zinc-400 dark:text-zinc-500";
  };

  const getLabelButtonStyles = (isSelected: boolean) => {
    if (isSelected) {
      if (hasBackground && backgroundBrightness) {
        return "bg-[var(--color-primary)] text-white";
      }
      return compact
        ? "border-zinc-400 dark:border-zinc-500 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
        : "bg-[var(--color-primary)] text-white";
    }

    if (hasBackground && backgroundBrightness) {
      return backgroundBrightness === "dark"
        ? "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
        : "bg-black/5 text-zinc-600 hover:bg-black/10 hover:text-zinc-900";
    }

    if (compact) {
      return "border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600 hover:text-zinc-800 dark:hover:text-zinc-200";
    }

    return "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200";
  };

  const getDotStyles = (labelColor: string, isSelected: boolean) => {
    if (labelColor === "default") {
      if (isSelected && hasBackground && backgroundBrightness) {
        return "bg-white/50";
      }
      if (hasBackground && backgroundBrightness) {
        return backgroundBrightness === "dark" ? "bg-white/50" : "bg-zinc-400";
      }
      return "bg-zinc-400 dark:bg-zinc-500";
    }
    return `bg-${labelColor}-500`;
  };

  const getEmptyTextStyles = () => {
    if (hasBackground && backgroundBrightness) {
      return backgroundBrightness === "dark" ? "text-white/50" : "text-zinc-500";
    }
    return "text-zinc-400 dark:text-zinc-500";
  };

  return (
    <div className={clsx("space-y-3", !compact && "pt-3 mt-3")}>
      {/* Glass container when has background */}
      <div
        className={clsx(
          hasBackground && "rounded-2xl p-3 backdrop-blur-xl border",
          hasBackground && backgroundBrightness === "dark" && "bg-white/10 border-white/20",
          hasBackground && backgroundBrightness === "light" && "bg-black/5 border-black/10",
          hasBackground && !backgroundBrightness && "bg-zinc-100/80 dark:bg-zinc-800/80 border-zinc-200/50 dark:border-zinc-700/50"
        )}
      >
        {/* Search/Create input */}
        <div className={clsx("flex items-center gap-2", hasBackground && "mb-3")}>
          <div className="relative flex-1">
            <input
              ref={newLabelInputRef}
              type="text"
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search or create a tag..."
              className={clsx(
                "w-full rounded-full border px-4 py-2 text-sm focus:outline-none transition",
                getInputStyles()
              )}
              disabled={isCreatingLabel}
            />
            {isCreatingLabel && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className={clsx("h-4 w-4 animate-spin", getLoaderStyles())} />
              </div>
            )}
          </div>

          {/* Create button (shown when search term doesn't exist) */}
          {newLabelName.trim() && !searchTermExistsAsLabel && (
            <button
              type="button"
              onClick={() => void handleCreateNewLabel()}
              disabled={isCreatingLabel}
              className={clsx(
                "flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition disabled:opacity-50",
                compact
                  ? "bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  : "bg-[var(--color-primary)] text-white hover:brightness-110"
              )}
            >
              <Plus className="h-3.5 w-3.5" />
              Create
            </button>
          )}
        </div>

        {/* Label list */}
        <div className="flex flex-wrap gap-2">
          {filteredLabels.length ? (
            filteredLabels.map((label) => {
              const isSelected = selectedIds.includes(label.id);
              return (
                <button
                  key={label.id}
                  type="button"
                  onClick={() => toggleLabelSelection(label.id)}
                  className={clsx(
                    "flex items-center gap-2 rounded-full px-3 text-xs font-medium transition",
                    compact ? "py-1 border" : "py-1.5",
                    getLabelButtonStyles(isSelected)
                  )}
                >
                  <span
                    className={clsx("h-2 w-2 rounded-full", getDotStyles(label.color, isSelected))}
                  />
                  {label.name}
                </button>
              );
            })
          ) : newLabelName.trim() ? (
            <p className={clsx("text-xs", getEmptyTextStyles())}>
              No matching tags. Press Enter or click Create to add &quot;{newLabelName.trim()}&quot;.
            </p>
          ) : (
            <p className={clsx("text-xs", getEmptyTextStyles())}>
              No tags yet. Type above to create your first tag.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
