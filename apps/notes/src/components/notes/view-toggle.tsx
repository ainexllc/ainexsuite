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
    <div className="inline-flex items-center gap-1 rounded-full bg-black/40 backdrop-blur-sm p-1 shadow-sm border border-white/10">
      <button
        type="button"
        onClick={() => onViewModeChange("masonry")}
        className={clsx(
          "inline-flex h-8 w-8 items-center justify-center rounded-full transition-all",
          viewMode === "masonry"
            ? "bg-[var(--color-primary)] text-white shadow-md"
            : "text-white/60 hover:bg-white/10 hover:text-white",
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
          "inline-flex h-8 w-8 items-center justify-center rounded-full transition-all",
          viewMode === "list"
            ? "bg-[var(--color-primary)] text-white shadow-md"
            : "text-white/60 hover:bg-white/10 hover:text-white",
        )}
        aria-label="List view"
        title="List view"
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  );
}
