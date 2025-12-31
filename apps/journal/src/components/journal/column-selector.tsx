"use client";

import { clsx } from "clsx";
import { usePreferences } from "@/components/providers/preferences-provider";
import type { MasonryColumns } from "@/lib/types/settings";

const COLUMN_OPTIONS: MasonryColumns[] = [1, 2, 3, 4];

type ColumnSelectorProps = {
  section: "pinned" | "allEntries";
};

export function ColumnSelector({ section }: ColumnSelectorProps) {
  const { preferences, updatePreferences } = usePreferences();

  const currentColumns = section === "pinned"
    ? preferences.pinnedColumns
    : preferences.allEntriesColumns;

  const handleColumnChange = (cols: MasonryColumns) => {
    if (section === "pinned") {
      updatePreferences({ pinnedColumns: cols });
    } else {
      updatePreferences({ allEntriesColumns: cols });
    }
  };

  return (
    <div className="inline-flex items-center gap-0.5 rounded-full bg-zinc-100/80 dark:bg-zinc-800/80 backdrop-blur-xl px-1 py-1 border border-zinc-200/50 dark:border-zinc-700/50">
      {COLUMN_OPTIONS.map((cols) => (
        <button
          key={cols}
          type="button"
          onClick={() => handleColumnChange(cols)}
          className={clsx(
            "h-6 w-6 flex items-center justify-center rounded-full text-xs font-medium transition",
            currentColumns === cols
              ? "bg-orange-500 text-white"
              : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/80 dark:hover:bg-zinc-700/80"
          )}
          title={`${cols} column${cols > 1 ? "s" : ""}`}
        >
          {cols}
        </button>
      ))}
    </div>
  );
}
