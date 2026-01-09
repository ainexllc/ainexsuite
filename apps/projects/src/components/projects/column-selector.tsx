"use client";

import { clsx } from "clsx";
import { usePreferences } from "@/components/providers/preferences-provider";

const COLUMN_OPTIONS = [1, 2, 3, 4] as const;
type ColumnCount = (typeof COLUMN_OPTIONS)[number];

type ColumnSelectorProps = {
  section: "focus" | "library";
};

export function ColumnSelector({ section }: ColumnSelectorProps) {
  const { preferences, setFocusColumns, setLibraryColumns } = usePreferences();

  const currentColumns =
    section === "focus" ? preferences.focusColumns : preferences.libraryColumns;

  const handleColumnChange = (cols: ColumnCount) => {
    if (section === "focus") {
      setFocusColumns(cols);
    } else {
      setLibraryColumns(cols);
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
              ? "bg-[var(--color-primary)] text-white"
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
