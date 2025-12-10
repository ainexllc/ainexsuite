"use client";

import * as React from "react";
import { X, Tag, Palette, Calendar, FileText, Bookmark } from "lucide-react";
import { cn } from "../../lib/utils";

export type FilterChipType = "label" | "color" | "date" | "noteType" | "dateField" | "preset";

export interface FilterChip {
  id: string;
  label: string;
  type: FilterChipType;
  colorValue?: string;
}

interface ActiveFilterChipsProps {
  chips: FilterChip[];
  onRemove: (chipId: string, chipType: FilterChipType) => void;
  onClearAll?: () => void;
  className?: string;
}

const chipTypeIcons: Record<FilterChipType, React.ComponentType<{ className?: string }>> = {
  label: Tag,
  color: Palette,
  date: Calendar,
  noteType: FileText,
  dateField: Calendar,
  preset: Bookmark,
};

const chipTypeColors: Record<FilterChipType, string> = {
  label: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  date: "bg-green-500/20 text-green-400 border-green-500/30",
  noteType: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  dateField: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  preset: "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

export function ActiveFilterChips({
  chips,
  onRemove,
  onClearAll,
  className,
}: ActiveFilterChipsProps) {
  if (chips.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-surface-elevated scrollbar-track-transparent",
        className
      )}
    >
      {chips.map((chip) => {
        const Icon = chipTypeIcons[chip.type];
        return (
          <button
            key={`${chip.type}-${chip.id}`}
            type="button"
            onClick={() => onRemove(chip.id, chip.type)}
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
              "hover:opacity-80 active:scale-95",
              "whitespace-nowrap flex-shrink-0",
              chipTypeColors[chip.type]
            )}
          >
            {chip.type === "color" && chip.colorValue ? (
              <span
                className="w-3 h-3 rounded-full border border-white/20"
                style={{ backgroundColor: chip.colorValue }}
              />
            ) : (
              <Icon className="w-3 h-3" />
            )}
            <span>{chip.label}</span>
            <X className="w-3 h-3 ml-0.5 opacity-60 hover:opacity-100" />
          </button>
        );
      })}

      {chips.length > 1 && onClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          className={cn(
            "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium",
            "bg-surface-elevated text-text-secondary border border-border",
            "hover:bg-surface-hover hover:text-text-primary transition-all",
            "whitespace-nowrap flex-shrink-0"
          )}
        >
          Clear all
        </button>
      )}
    </div>
  );
}
