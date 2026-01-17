"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "../../lib/utils";
import {
  Palette,
  Flame,
  Copy,
  Archive,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  LIGHT_COLORS,
  DARK_COLORS,
  DEFAULT_COLOR,
  type EntryColor,
} from "../../constants/entry-colors";
import type { PriorityLevel } from "../pickers/priority-picker";

// ============ Types ============

export type EntryToolbarVariant = "card" | "editor";

/**
 * Action button configuration
 */
export interface ToolbarAction {
  id: string;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  active?: boolean;
  variant?: "default" | "danger";
  /** Show only in specific toolbar variant */
  showIn?: EntryToolbarVariant | "both";
}

/**
 * Action group for organizing buttons with dividers
 */
export interface ToolbarActionGroup {
  id: string;
  actions: ToolbarAction[];
  /** Show only in specific toolbar variant */
  showIn?: EntryToolbarVariant | "both";
}

export interface EntryActionsToolbarProps {
  /** Toolbar display variant */
  variant: EntryToolbarVariant;

  // Styling context
  /** Force dark text (light background) */
  forceDarkText?: boolean;
  /** Force light text (dark background) */
  forceLightText?: boolean;
  /** Background brightness hint */
  backgroundBrightness?: "light" | "dark";
  /** Has cover image */
  hasCover?: boolean;

  // Color picker
  /** Show color picker button */
  showColorPicker?: boolean;
  /** Current color */
  color?: EntryColor;
  /** Color change handler */
  onColorChange?: (color: EntryColor) => void;

  // Priority picker
  /** Show priority picker button */
  showPriorityPicker?: boolean;
  /** Current priority */
  priority?: PriorityLevel;
  /** Priority change handler */
  onPriorityChange?: (priority: PriorityLevel) => void;

  // Common actions
  /** Duplicate handler */
  onDuplicate?: () => void;
  /** Archive handler (shows archive button if provided) */
  onArchive?: () => void;
  /** Delete handler */
  onDelete?: () => void;
  /** Can delete (permission check) */
  canDelete?: boolean;

  // Custom action groups (rendered after built-in actions)
  /** Additional action groups */
  actionGroups?: ToolbarActionGroup[];

  // Visibility control (for card hover behavior)
  /** Is toolbar visible */
  visible?: boolean;

  /** Additional className */
  className?: string;
}

// ============ Internal Components ============

interface IconButtonProps {
  icon: LucideIcon;
  onClick: (e: React.MouseEvent) => void;
  active?: boolean;
  variant?: "default" | "danger";
  tooltip?: string;
  className?: string;
  onDarkBackground?: boolean;
}

function IconButton({
  icon: Icon,
  onClick,
  active,
  variant = "default",
  tooltip,
  className,
  onDarkBackground,
}: IconButtonProps) {
  const isDanger = variant === "danger";

  const buttonClasses = cn(
    "h-7 w-7 rounded-full flex items-center justify-center transition",
    isDanger
      ? onDarkBackground
        ? "text-red-400 hover:bg-red-500/25 hover:text-red-300"
        : "text-red-500 dark:text-red-400 hover:bg-red-500/15 dark:hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-300"
      : active
        ? "bg-[var(--color-primary)] text-white"
        : onDarkBackground
          ? "hover:bg-white/20"
          : "hover:bg-black/10 dark:hover:bg-white/20",
    className
  );

  const iconClasses = cn(
    "h-4 w-4",
    isDanger
      ? ""
      : active
        ? ""
        : onDarkBackground
          ? "text-white/75"
          : "text-zinc-600 dark:text-zinc-300"
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className={buttonClasses}
      aria-label={tooltip}
      title={tooltip}
    >
      <Icon className={iconClasses} />
    </button>
  );
}

function Divider({ onDarkBackground }: { onDarkBackground?: boolean }) {
  return (
    <div
      className={cn(
        "h-4 w-px mx-0.5",
        onDarkBackground
          ? "bg-white/25 dark:bg-white/30"
          : "bg-zinc-400/40 dark:bg-zinc-500/50"
      )}
    />
  );
}

// ============ Main Component ============

/**
 * EntryActionsToolbar - Generic entry/card actions toolbar
 *
 * Features:
 * - Color picker with light/dark columns
 * - Priority picker
 * - Common actions (duplicate, archive, delete)
 * - Custom action groups
 * - Adaptive styling for different backgrounds
 * - Card and editor variants
 *
 * @example
 * ```tsx
 * <EntryActionsToolbar
 *   variant="card"
 *   color={entry.color}
 *   onColorChange={handleColorChange}
 *   priority={entry.priority}
 *   onPriorityChange={handlePriorityChange}
 *   onDuplicate={handleDuplicate}
 *   onDelete={handleDelete}
 *   showColorPicker
 *   showPriorityPicker
 * />
 * ```
 */
export function EntryActionsToolbar({
  variant,
  forceDarkText: _forceDarkText,
  forceLightText,
  backgroundBrightness,
  hasCover,
  showColorPicker = true,
  color = "default",
  onColorChange,
  showPriorityPicker = true,
  priority,
  onPriorityChange,
  onDuplicate,
  onArchive,
  onDelete,
  canDelete = true,
  actionGroups = [],
  visible = true,
  className,
}: EntryActionsToolbarProps) {
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  const colorPickerRef = useRef<HTMLDivElement>(null);
  const priorityPickerRef = useRef<HTMLDivElement>(null);

  // Determine if we're on a dark background
  const onDarkBackground =
    forceLightText || backgroundBrightness === "dark" || hasCover;

  // Close dropdowns when clicking outside
  useEffect(() => {
    if (!showColorDropdown) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target as Node)
      ) {
        setShowColorDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showColorDropdown]);

  useEffect(() => {
    if (!showPriorityDropdown) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        priorityPickerRef.current &&
        !priorityPickerRef.current.contains(event.target as Node)
      ) {
        setShowPriorityDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPriorityDropdown]);

  // Handlers
  const handleColorSelect = useCallback(
    (newColor: EntryColor, e: React.MouseEvent) => {
      e.stopPropagation();
      onColorChange?.(newColor);
    },
    [onColorChange]
  );

  const handlePrioritySelect = useCallback(
    (newPriority: PriorityLevel, e: React.MouseEvent) => {
      e.stopPropagation();
      onPriorityChange?.(newPriority);
      setShowPriorityDropdown(false);
    },
    [onPriorityChange]
  );

  const handleDuplicate = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDuplicate?.();
    },
    [onDuplicate]
  );

  const handleArchive = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onArchive?.();
    },
    [onArchive]
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete?.();
    },
    [onDelete]
  );

  // Container classes
  const containerClasses = cn(
    "flex items-center gap-1 px-1.5 py-1 rounded-full border transition-opacity backdrop-blur-sm",
    variant === "card" && !visible && "opacity-0 group-hover:opacity-100",
    variant === "card" && visible && "opacity-100",
    onDarkBackground
      ? "bg-black/40 dark:bg-black/50 border-white/15 dark:border-white/20"
      : "bg-white/60 dark:bg-zinc-900/70 border-black/10 dark:border-white/10",
    className
  );

  // Filter action groups by variant
  const filteredGroups = actionGroups.filter(
    (group) => !group.showIn || group.showIn === "both" || group.showIn === variant
  );

  return (
    <div className={containerClasses}>
      {/* Color Picker */}
      {showColorPicker && (
        <>
          <div className="relative" ref={colorPickerRef}>
            <IconButton
              icon={Palette}
              onClick={(e) => {
                e.stopPropagation();
                setShowPriorityDropdown(false);
                setShowColorDropdown((prev) => !prev);
              }}
              active={showColorDropdown}
              tooltip="Change color"
              onDarkBackground={onDarkBackground}
            />
            {showColorDropdown && (
              <div
                className="absolute bottom-9 left-1/2 -translate-x-1/2 z-50 flex flex-col rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-2 shadow-2xl min-w-[280px] animate-in fade-in slide-in-from-bottom-2 duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Default - full width at top */}
                <button
                  type="button"
                  onClick={(e) => handleColorSelect(DEFAULT_COLOR.id, e)}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-xl text-xs font-medium transition w-full mb-2",
                    color === DEFAULT_COLOR.id
                      ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white"
                      : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  )}
                >
                  <span
                    className={cn(
                      "h-4 w-4 rounded-full flex-shrink-0",
                      DEFAULT_COLOR.swatchClass
                    )}
                  />
                  {DEFAULT_COLOR.label}
                </button>

                {/* Light and Dark columns */}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <p className="text-[9px] uppercase font-bold text-zinc-400 dark:text-zinc-500 mb-1 px-1">
                      Light
                    </p>
                    <div className="space-y-0.5">
                      {LIGHT_COLORS.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={(e) => handleColorSelect(c.id, e)}
                          className={cn(
                            "flex items-center gap-2 px-2 py-1 rounded-xl text-xs font-medium transition w-full",
                            color === c.id
                              ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white"
                              : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          )}
                        >
                          <span
                            className={cn(
                              "h-3.5 w-3.5 rounded-full flex-shrink-0",
                              c.swatchClass
                            )}
                          />
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-[9px] uppercase font-bold text-zinc-400 dark:text-zinc-500 mb-1 px-1">
                      Dark
                    </p>
                    <div className="space-y-0.5">
                      {DARK_COLORS.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={(e) => handleColorSelect(c.id, e)}
                          className={cn(
                            "flex items-center gap-2 px-2 py-1 rounded-xl text-xs font-medium transition w-full",
                            color === c.id
                              ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white"
                              : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          )}
                        >
                          <span
                            className={cn(
                              "h-3.5 w-3.5 rounded-full flex-shrink-0",
                              c.swatchClass
                            )}
                          />
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <Divider onDarkBackground={onDarkBackground} />
        </>
      )}

      {/* Priority Picker */}
      {showPriorityPicker && (
        <>
          <div className="relative" ref={priorityPickerRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowColorDropdown(false);
                setShowPriorityDropdown((prev) => !prev);
              }}
              className={cn(
                "h-7 w-7 rounded-full flex items-center justify-center transition",
                onDarkBackground
                  ? "hover:bg-white/20"
                  : "hover:bg-black/10 dark:hover:bg-white/20"
              )}
              title={
                priority
                  ? `${priority.charAt(0).toUpperCase() + priority.slice(1)} priority`
                  : "Set priority"
              }
            >
              <Flame
                className={cn(
                  "h-4 w-4",
                  priority === "high"
                    ? "text-red-400"
                    : priority === "medium"
                      ? "text-amber-400"
                      : priority === "low"
                        ? "text-blue-400"
                        : onDarkBackground
                          ? "text-white/75"
                          : "text-zinc-600 dark:text-zinc-300"
                )}
              />
            </button>
            {showPriorityDropdown && (
              <div
                className="absolute bottom-9 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-0.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-1.5 shadow-2xl min-w-[100px] animate-in fade-in slide-in-from-bottom-2 duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={(e) => handlePrioritySelect("high", e)}
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-1 rounded-xl text-xs font-medium transition",
                    priority === "high"
                      ? "bg-red-500/20 text-red-500 dark:text-red-400"
                      : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  )}
                >
                  <Flame className="h-3 w-3 text-red-500" />
                  High
                </button>
                <button
                  type="button"
                  onClick={(e) => handlePrioritySelect("medium", e)}
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-1 rounded-xl text-xs font-medium transition",
                    priority === "medium"
                      ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                      : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  )}
                >
                  <Flame className="h-3 w-3 text-amber-500" />
                  Medium
                </button>
                <button
                  type="button"
                  onClick={(e) => handlePrioritySelect("low", e)}
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-1 rounded-xl text-xs font-medium transition",
                    priority === "low"
                      ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                      : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  )}
                >
                  <Flame className="h-3 w-3 text-blue-500" />
                  Low
                </button>
                {priority && (
                  <>
                    <div className="h-px bg-zinc-200 dark:bg-zinc-700 my-0.5" />
                    <button
                      type="button"
                      onClick={(e) => handlePrioritySelect(null, e)}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-xl text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                    >
                      <X className="h-3 w-3" />
                      Clear
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          <Divider onDarkBackground={onDarkBackground} />
        </>
      )}

      {/* Duplicate button */}
      {onDuplicate && (
        <IconButton
          icon={Copy}
          onClick={handleDuplicate}
          tooltip="Duplicate"
          onDarkBackground={onDarkBackground}
        />
      )}

      {/* Archive button */}
      {onArchive && (
        <IconButton
          icon={Archive}
          onClick={handleArchive}
          tooltip="Archive"
          onDarkBackground={onDarkBackground}
        />
      )}

      {/* Delete button */}
      {canDelete && onDelete && (
        <>
          <Divider onDarkBackground={onDarkBackground} />
          <IconButton
            icon={Trash2}
            onClick={handleDelete}
            variant="danger"
            tooltip="Delete"
            onDarkBackground={onDarkBackground}
          />
        </>
      )}

      {/* Custom action groups */}
      {filteredGroups.map((group) => (
        <div key={group.id} className="contents">
          <Divider onDarkBackground={onDarkBackground} />
          {group.actions
            .filter(
              (action) =>
                !action.showIn || action.showIn === "both" || action.showIn === variant
            )
            .map((action) => (
              <IconButton
                key={action.id}
                icon={action.icon}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick();
                }}
                active={action.active}
                variant={action.variant}
                tooltip={action.label}
                onDarkBackground={onDarkBackground}
              />
            ))}
        </div>
      ))}
    </div>
  );
}

export default EntryActionsToolbar;
