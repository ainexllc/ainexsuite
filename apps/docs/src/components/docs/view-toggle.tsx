"use client";

import { LayoutGrid, Calendar } from "lucide-react";
import { clsx } from "clsx";
import type { ViewMode } from "@/lib/types/settings";

type ViewToggleProps = {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
};

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-zinc-100/80 dark:bg-zinc-800/80 backdrop-blur-xl px-2 py-1 border border-zinc-200/50 dark:border-zinc-700/50">
      <button
        type="button"
        onClick={() => onViewModeChange("masonry")}
        className={clsx(
          "flex h-7 w-7 items-center justify-center rounded-full transition",
          viewMode === "masonry"
            ? "bg-[var(--color-primary)] text-white"
            : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/80 dark:hover:bg-zinc-700/80 hover:text-zinc-700 dark:hover:text-zinc-200",
        )}
        aria-label="Masonry view"
        title="Masonry view"
      >
        <LayoutGrid className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => onViewModeChange("calendar")}
        className={clsx(
          "flex h-7 w-7 items-center justify-center rounded-full transition",
          viewMode === "calendar"
            ? "bg-[var(--color-primary)] text-white"
            : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/80 dark:hover:bg-zinc-700/80 hover:text-zinc-700 dark:hover:text-zinc-200",
        )}
        aria-label="Calendar view"
        title="Calendar view"
      >
        <Calendar className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
