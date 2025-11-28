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
    <div className="inline-flex items-center gap-1 rounded-full bg-background/40 backdrop-blur-sm p-1 shadow-sm border border-border">
      <button
        type="button"
        onClick={() => onViewModeChange("masonry")}
        className={clsx(
          "inline-flex h-8 w-8 items-center justify-center rounded-full transition-all",
          viewMode === "masonry"
            ? "bg-[var(--color-primary)] text-foreground shadow-md"
            : "text-muted-foreground hover:bg-foreground/10 hover:text-foreground",
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
            ? "bg-[var(--color-primary)] text-foreground shadow-md"
            : "text-muted-foreground hover:bg-foreground/10 hover:text-foreground",
        )}
        aria-label="List view"
        title="List view"
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  );
}
