"use client";

import { useState, useRef, useEffect } from "react";
import { X, CheckSquare, Square, type LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import { ENTRY_COLOR_SWATCHES, type EntryColor } from "../../constants/entry-colors";

/**
 * Action configuration for bulk action bar
 */
export interface BulkAction {
  id: string;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  /** Icon color on hover */
  hoverColor?: string;
  /** Whether this is a danger action (e.g., delete) */
  variant?: "default" | "danger";
  /** Custom popover content for the action */
  popover?: React.ReactNode;
}

/**
 * Label item for label picker
 */
export interface BulkActionLabel {
  id: string;
  name: string;
}

export interface BulkActionBarProps {
  /** Number of currently selected items */
  selectedCount: number;
  /** Total number of items available */
  totalCount: number;
  /** Callback to select all items */
  onSelectAll: () => void;
  /** Callback to deselect all items */
  onDeselectAll: () => void;
  /** Primary actions to show in the main action group */
  actions?: BulkAction[];
  /** Whether to show the built-in color picker */
  showColorPicker?: boolean;
  /** Callback when color is changed */
  onColorChange?: (color: EntryColor) => void;
  /** Whether to show the label picker */
  showLabelPicker?: boolean;
  /** Available labels for the label picker */
  labels?: BulkActionLabel[];
  /** Callback when a label is added */
  onLabelAdd?: (labelId: string) => void;
  /** Label picker icon */
  labelPickerIcon?: LucideIcon;
  /** Delete action handler (renders in danger style) */
  onDelete?: () => void;
  /** Whether delete is enabled (e.g., user owns all selected) */
  canDelete?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * BulkActionBar - Floating action bar for bulk operations on selected items
 *
 * Appears at the bottom of the screen when items are selected,
 * providing quick actions for batch operations.
 *
 * @example
 * ```tsx
 * <BulkActionBar
 *   selectedCount={selectedNotes.length}
 *   totalCount={notes.length}
 *   onSelectAll={() => setSelectedNotes(notes.map(n => n.id))}
 *   onDeselectAll={() => setSelectedNotes([])}
 *   actions={[
 *     { id: 'pin', icon: Pin, label: 'Pin', onClick: handlePin },
 *     { id: 'archive', icon: Archive, label: 'Archive', onClick: handleArchive },
 *   ]}
 *   showColorPicker
 *   onColorChange={handleColorChange}
 *   onDelete={handleDelete}
 * />
 * ```
 */
export function BulkActionBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  actions = [],
  showColorPicker = false,
  onColorChange,
  showLabelPicker = false,
  labels = [],
  onLabelAdd,
  labelPickerIcon: LabelIcon,
  onDelete,
  canDelete = true,
  className,
}: BulkActionBarProps) {
  const [activePopover, setActivePopover] = useState<string | null>(null);
  const popoverRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Close popovers when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      let clickedInside = false;

      popoverRefs.current.forEach((ref) => {
        if (ref && ref.contains(target)) {
          clickedInside = true;
        }
      });

      if (!clickedInside) {
        setActivePopover(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (selectedCount === 0) return null;

  const allSelected = selectedCount === totalCount;

  const togglePopover = (id: string) => {
    setActivePopover(activePopover === id ? null : id);
  };

  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-200",
        className
      )}
    >
      <div className="flex items-center gap-3 px-2 py-2 rounded-full bg-zinc-900/95 dark:bg-zinc-800/95 border border-zinc-700/50 shadow-2xl backdrop-blur-xl">
        {/* Selection count pill */}
        <div className="flex items-center gap-2 pl-2 pr-3">
          <button
            onClick={allSelected ? onDeselectAll : onSelectAll}
            className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
            title={allSelected ? "Deselect all" : "Select all"}
          >
            {allSelected ? (
              <CheckSquare className="h-4 w-4 text-primary" />
            ) : (
              <Square className="h-4 w-4 text-zinc-400" />
            )}
          </button>
          <span className="text-sm font-semibold text-white tabular-nums">
            {selectedCount}
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-zinc-600/50" />

        {/* Action buttons in glass pill */}
        <div className="flex items-center gap-0.5 px-1 py-1 rounded-full bg-white/5 border border-white/10">
          {/* Custom actions */}
          {actions.map((action) => (
            <div
              key={action.id}
              className="relative"
              ref={(el) => {
                if (el) popoverRefs.current.set(action.id, el);
              }}
            >
              <button
                onClick={
                  action.popover
                    ? () => togglePopover(action.id)
                    : action.onClick
                }
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors group"
                title={action.label}
              >
                <action.icon
                  className={cn(
                    "h-4 w-4 text-zinc-400 transition-colors",
                    action.hoverColor
                      ? `group-hover:${action.hoverColor}`
                      : "group-hover:text-zinc-200"
                  )}
                  style={
                    action.hoverColor?.startsWith("#")
                      ? ({ "--hover-color": action.hoverColor } as React.CSSProperties)
                      : undefined
                  }
                />
              </button>

              {/* Custom popover */}
              {action.popover && activePopover === action.id && (
                <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 p-3 rounded-2xl bg-zinc-900/95 border border-zinc-700/50 shadow-2xl backdrop-blur-xl">
                  {action.popover}
                </div>
              )}
            </div>
          ))}

          {/* Built-in color picker */}
          {showColorPicker && onColorChange && (
            <div
              className="relative"
              ref={(el) => {
                if (el) popoverRefs.current.set("color-picker", el);
              }}
            >
              <button
                onClick={() => togglePopover("color-picker")}
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors group"
                title="Change color"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-zinc-400 group-hover:text-zinc-200 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="13.5" cy="6.5" r="2.5" />
                  <circle cx="17.5" cy="10.5" r="2.5" />
                  <circle cx="8.5" cy="7.5" r="2.5" />
                  <circle cx="6.5" cy="12.5" r="2.5" />
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z" />
                </svg>
              </button>

              {activePopover === "color-picker" && (
                <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 p-3 rounded-2xl bg-zinc-900/95 border border-zinc-700/50 shadow-2xl backdrop-blur-xl">
                  <div className="grid grid-cols-4 gap-2">
                    {ENTRY_COLOR_SWATCHES.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => {
                          onColorChange(color.value);
                          setActivePopover(null);
                        }}
                        title={color.label}
                        className={cn(
                          "w-8 h-8 rounded-full transition-all hover:scale-110 hover:ring-2 hover:ring-white/30",
                          color.className
                        )}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Built-in label picker */}
          {showLabelPicker && labels.length > 0 && onLabelAdd && LabelIcon && (
            <div
              className="relative"
              ref={(el) => {
                if (el) popoverRefs.current.set("label-picker", el);
              }}
            >
              <button
                onClick={() => togglePopover("label-picker")}
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors group"
                title="Add label"
              >
                <LabelIcon className="h-4 w-4 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
              </button>

              {activePopover === "label-picker" && (
                <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 p-2 rounded-2xl bg-zinc-900/95 border border-zinc-700/50 shadow-2xl backdrop-blur-xl min-w-[180px] max-h-[240px] overflow-y-auto">
                  <div className="space-y-0.5">
                    {labels.map((label) => (
                      <button
                        key={label.id}
                        onClick={() => {
                          onLabelAdd(label.id);
                          setActivePopover(null);
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-sm text-zinc-200"
                      >
                        {label.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Delete button - separate for emphasis */}
        {onDelete && canDelete && (
          <button
            onClick={onDelete}
            className="h-8 w-8 rounded-full flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 transition-colors group"
            title="Delete selected"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 text-red-400 group-hover:text-red-300 transition-colors"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              <line x1="10" x2="10" y1="11" y2="17" />
              <line x1="14" x2="14" y1="11" y2="17" />
            </svg>
          </button>
        )}

        {/* Close button */}
        <button
          onClick={onDeselectAll}
          className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
          title="Clear selection"
        >
          <X className="h-4 w-4 text-zinc-400" />
        </button>
      </div>
    </div>
  );
}

export default BulkActionBar;
