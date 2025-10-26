"use client";

import { LayoutGrid, List } from "lucide-react";
import { clsx } from "clsx";
import type { ViewMode } from "@/lib/types/settings";

type ViewToggleProps = {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
};

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-surface-muted/80 p-1 shadow-sm">
      <button
        type="button"
        onClick={() => onViewModeChange("masonry")}
        className={clsx(
          "inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors",
          viewMode === "masonry"
            ? "bg-accent-500 text-white shadow-sm"
            : "text-ink-600 hover:bg-surface-muted hover:text-ink-800",
        )}
        aria-label="Masonry view"
        title="Masonry view"
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onViewModeChange("list")}
        className={clsx(
          "inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors",
          viewMode === "list"
            ? "bg-accent-500 text-white shadow-sm"
            : "text-ink-600 hover:bg-surface-muted hover:text-ink-800",
        )}
        aria-label="List view"
        title="List view"
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  );
}
