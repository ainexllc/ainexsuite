"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Palette,
  Flame,
  Copy,
  Archive,
  Trash2,
  FolderOpen,
  MoreVertical,
  Check,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../../lib/utils";
import {
  LIGHT_ENTRY_COLORS,
  DARK_ENTRY_COLORS,
  DEFAULT_ENTRY_COLOR,
  type EntryColor,
} from "../../constants/entry-colors";

// ============ Types ============

export type EntryFooterVariant = "card" | "editor";

export type PriorityLevel = "high" | "medium" | "low" | null;

/**
 * Space item for the space selector
 */
export interface FooterSpace {
  id: string;
  name: string;
}

/**
 * Custom action for the toolbar
 */
export interface FooterAction {
  id: string;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  active?: boolean;
  variant?: "default" | "danger";
}

/**
 * Props for the EntryFooterToolbar component
 */
export interface EntryFooterToolbarProps {
  /** Entry ID for tracking */
  entryId?: string;

  /** Toolbar variant */
  variant: EntryFooterVariant;

  // ===== Styling Context =====
  /** Force dark text (for light backgrounds) */
  forceDarkText?: boolean;
  /** Force light text (for dark backgrounds) */
  forceLightText?: boolean;
  /** Background brightness hint */
  backgroundBrightness?: "light" | "dark";
  /** Has cover image */
  hasCover?: boolean;

  // ===== Space Management =====
  /** Available spaces */
  spaces?: FooterSpace[];
  /** Current space ID */
  currentSpaceId?: string;
  /** Callback when space changes */
  onMoveToSpace?: (spaceId: string) => void;

  // ===== Color Picker =====
  /** Show color picker */
  showColorPicker?: boolean;
  /** Current color */
  color?: EntryColor;
  /** Callback when color changes */
  onColorChange?: (color: EntryColor) => void;

  // ===== Priority Picker =====
  /** Show priority picker */
  showPriorityPicker?: boolean;
  /** Current priority */
  priority?: PriorityLevel;
  /** Callback when priority changes */
  onPriorityChange?: (priority: PriorityLevel) => void;

  // ===== Core Actions =====
  /** Duplicate callback */
  onDuplicate?: () => void;
  /** Archive callback */
  onArchive?: () => void;
  /** Delete callback */
  onDelete?: () => void;
  /** Save callback (editor only) */
  onSave?: () => void;

  // ===== Custom Actions =====
  /** Additional actions to show before core actions */
  leadingActions?: FooterAction[];
  /** Additional actions to show in the more menu */
  moreMenuActions?: FooterAction[];

  // ===== Visibility =====
  /** Whether the toolbar is visible (for card hover behavior) */
  visible?: boolean;
  /** Whether delete is allowed */
  canDelete?: boolean;

  /** Additional className */
  className?: string;

  /** Compact mode: removes pill background and reduces padding */
  compact?: boolean;
}

// ============ Internal Components ============

interface IconButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  onClick: (e: React.MouseEvent) => void;
  active?: boolean;
  variant?: "default" | "danger";
  tooltip?: string;
  className?: string;
  onDarkNote?: boolean;
  compact?: boolean;
}

function IconButton({
  icon: Icon,
  onClick,
  active,
  variant = "default",
  tooltip,
  className,
  onDarkNote,
  compact = false,
}: IconButtonProps) {
  const isDanger = variant === "danger";

  const buttonClasses = cn(
    compact ? "h-6 w-6 rounded-md" : "h-7 w-7 rounded-full",
    "flex items-center justify-center transition",
    isDanger
      ? onDarkNote
        ? "text-red-400 hover:bg-red-500/25 hover:text-red-300"
        : "text-red-500 dark:text-red-400 hover:bg-red-500/15 dark:hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-300"
      : active
        ? "bg-[var(--color-primary)] text-white"
        : onDarkNote
          ? "hover:bg-white/20"
          : "hover:bg-black/10 dark:hover:bg-white/20",
    className
  );

  const iconClasses = cn(
    compact ? "h-3.5 w-3.5" : "h-4 w-4",
    isDanger
      ? "" // Color set on button
      : active
        ? "" // White on primary bg
        : onDarkNote
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

interface DividerProps {
  onDarkNote?: boolean;
}

function Divider({ onDarkNote }: DividerProps) {
  return (
    <div
      className={cn(
        "h-4 w-px mx-0.5",
        onDarkNote ? "bg-white/25 dark:bg-white/30" : "bg-zinc-400/40 dark:bg-zinc-500/50"
      )}
    />
  );
}

// ============ Main Component ============

/**
 * EntryFooterToolbar - Shared footer toolbar pill for entry cards and editors
 *
 * A glassmorphic pill toolbar with adaptive styling for different backgrounds.
 * Supports space selection, color picker, priority picker, and custom actions.
 *
 * @example
 * ```tsx
 * <EntryFooterToolbar
 *   variant="card"
 *   spaces={spaces}
 *   currentSpaceId={note.spaceId}
 *   onMoveToSpace={handleMoveToSpace}
 *   showColorPicker
 *   color={note.color}
 *   onColorChange={handleColorChange}
 *   showPriorityPicker
 *   priority={note.priority}
 *   onPriorityChange={handlePriorityChange}
 *   onDuplicate={handleDuplicate}
 *   onDelete={handleDelete}
 *   visible={isHovered}
 * />
 * ```
 */
export function EntryFooterToolbar({
  entryId: _entryId,
  variant,
  forceDarkText,
  forceLightText,
  backgroundBrightness,
  hasCover,
  spaces = [],
  currentSpaceId,
  onMoveToSpace,
  showColorPicker: enableColorPicker = true,
  color = "default",
  onColorChange,
  showPriorityPicker: enablePriorityPicker = true,
  priority,
  onPriorityChange,
  onDuplicate,
  onArchive,
  onDelete,
  onSave,
  leadingActions = [],
  moreMenuActions = [],
  visible = true,
  canDelete = true,
  className,
  compact = false,
}: EntryFooterToolbarProps) {
  const [showSpacePicker, setShowSpacePicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [colorPickerPos, setColorPickerPos] = useState({ x: 0, y: 0 });
  const [priorityPickerPos, setPriorityPickerPos] = useState({ x: 0, y: 0 });

  const spacePickerRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const colorPickerDropdownRef = useRef<HTMLDivElement>(null);
  const priorityPickerRef = useRef<HTMLDivElement>(null);
  const priorityPickerDropdownRef = useRef<HTMLDivElement>(null);

  // Determine if we're on a dark note (needs light icons)
  const onDarkNote = forceLightText || backgroundBrightness === "dark" || hasCover;

  // Get current space name
  const currentSpace = spaces.find((s) => s.id === currentSpaceId);

  // Unified click-outside handler
  useEffect(() => {
    const anyPickerOpen = showSpacePicker || showColorPicker || showPriorityPicker;
    if (!anyPickerOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (showSpacePicker && spacePickerRef.current && !spacePickerRef.current.contains(target)) {
        setShowSpacePicker(false);
      }

      if (showColorPicker) {
        const clickedColorButton = colorPickerRef.current?.contains(target);
        const clickedColorDropdown = colorPickerDropdownRef.current?.contains(target);
        if (!clickedColorButton && !clickedColorDropdown) {
          setShowColorPicker(false);
        }
      }

      if (showPriorityPicker) {
        const clickedPriorityButton = priorityPickerRef.current?.contains(target);
        const clickedPriorityDropdown = priorityPickerDropdownRef.current?.contains(target);
        if (!clickedPriorityButton && !clickedPriorityDropdown) {
          setShowPriorityPicker(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSpacePicker, showColorPicker, showPriorityPicker]);

  // Handlers
  const handleSpaceSelect = useCallback(
    (spaceId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      onMoveToSpace?.(spaceId);
      setShowSpacePicker(false);
    },
    [onMoveToSpace]
  );

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
      setShowPriorityPicker(false);
    },
    [onPriorityChange]
  );

  const handleDuplicate = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDuplicate?.();
      setShowMoreMenu(false);
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
      setShowMoreMenu(false);
    },
    [onDelete]
  );

  const handleSave = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSave?.();
    },
    [onSave]
  );

  // Container classes
  const containerClasses = cn(
    "flex items-center transition-opacity",
    compact
      ? "gap-0.5 px-0 py-0"
      : "gap-1 px-1.5 py-1 rounded-full border backdrop-blur-sm",
    variant === "card" && !visible && "opacity-0 group-hover:opacity-100",
    variant === "card" && visible && "opacity-100",
    !compact && (
      onDarkNote
        ? "bg-black/40 dark:bg-black/50 border-white/15 dark:border-white/20"
        : "bg-white/60 dark:bg-zinc-900/70 border-black/10 dark:border-white/10"
    ),
    className
  );

  // Dropdown styling based on background
  const dropdownClasses = cn(
    "rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200",
    forceDarkText
      ? "bg-white border border-zinc-200"
      : forceLightText || backgroundBrightness === "dark" || hasCover
        ? "bg-zinc-900 border border-zinc-700"
        : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700"
  );

  const dropdownTextClasses = cn(
    forceDarkText
      ? "text-zinc-900"
      : forceLightText || backgroundBrightness === "dark" || hasCover
        ? "text-white"
        : "text-zinc-900 dark:text-white"
  );

  const dropdownMutedTextClasses = cn(
    forceDarkText
      ? "text-zinc-600"
      : forceLightText || backgroundBrightness === "dark" || hasCover
        ? "text-zinc-300"
        : "text-zinc-600 dark:text-zinc-300"
  );

  const dropdownBorderClasses = cn(
    forceDarkText
      ? "border-zinc-200"
      : forceLightText || backgroundBrightness === "dark" || hasCover
        ? "border-zinc-700"
        : "border-zinc-200 dark:border-zinc-700"
  );

  return (
    <div className={containerClasses}>
      {/* Space Selector - Always show current space, dropdown only if multiple spaces */}
      {spaces.length > 0 && (
        <>
          <div className="relative" ref={spacePickerRef}>
            {spaces.length > 1 && onMoveToSpace ? (
              // Multiple spaces: show clickable button with dropdown
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSpacePicker((prev) => !prev);
                  setShowColorPicker(false);
                  setShowPriorityPicker(false);
                }}
                className={cn(
                  compact ? "h-6 rounded-md px-1.5 gap-1 text-[10px]" : "h-7 rounded-full px-2.5 gap-1.5 text-[11px]",
                  "flex items-center font-medium transition",
                  showSpacePicker
                    ? "bg-[var(--color-primary)] text-white"
                    : onDarkNote
                      ? "text-white/75 hover:text-white hover:bg-white/20"
                      : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/20"
                )}
                aria-label="Move to space"
                title="Move to a different space"
              >
                <FolderOpen className="h-4 w-4" />
                <span className="max-w-[80px] truncate">
                  {currentSpace?.name || "Personal"}
                </span>
              </button>
            ) : (
              // Single space: show as non-interactive label
              <div
                className={cn(
                  compact ? "h-6 rounded-md px-1.5 gap-1 text-[10px]" : "h-7 rounded-full px-2.5 gap-1.5 text-[11px]",
                  "flex items-center font-medium",
                  onDarkNote
                    ? "text-white/60"
                    : "text-zinc-500 dark:text-zinc-400"
                )}
                title={currentSpace?.name || "Personal"}
              >
                <FolderOpen className="h-4 w-4" />
                <span className="max-w-[80px] truncate">
                  {currentSpace?.name || "Personal"}
                </span>
              </div>
            )}
            {showSpacePicker && spaces.length > 1 && (
              <div
                className={cn("absolute bottom-9 left-1/2 -translate-x-1/2 z-50 min-w-[140px]", dropdownClasses)}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={cn("px-3 py-2 border-b", dropdownBorderClasses)}>
                  <p className={cn("text-xs font-semibold", dropdownTextClasses)}>
                    Move to Space
                  </p>
                </div>
                <div className="p-1.5 max-h-36 overflow-y-auto scrollbar-styled">
                  {spaces.map((space) => (
                    <button
                      key={space.id}
                      type="button"
                      onClick={(e) => handleSpaceSelect(space.id, e)}
                      className={cn(
                        "w-full text-left px-2.5 py-1.5 rounded-xl text-xs transition-colors flex items-center gap-2",
                        space.id === currentSpaceId
                          ? "bg-[var(--color-primary)] text-white"
                          : cn(dropdownMutedTextClasses, "hover:bg-zinc-100 dark:hover:bg-zinc-800")
                      )}
                    >
                      <FolderOpen className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{space.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Divider onDarkNote={onDarkNote} />
        </>
      )}

      {/* Leading Actions */}
      {leadingActions.map((action) => (
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
          onDarkNote={onDarkNote}
          compact={compact}
        />
      ))}
      {leadingActions.length > 0 && <Divider onDarkNote={onDarkNote} />}

      {/* Color Picker */}
      {enableColorPicker && onColorChange && (
        <>
          <div className="relative" ref={colorPickerRef}>
            <IconButton
              icon={Palette}
              onClick={(e) => {
                e.stopPropagation();
                setShowSpacePicker(false);
                setShowPriorityPicker(false);
                if (colorPickerRef.current) {
                  const rect = colorPickerRef.current.getBoundingClientRect();
                  setColorPickerPos({
                    x: rect.left + rect.width / 2,
                    y: rect.top - 8,
                  });
                }
                setShowColorPicker((prev) => !prev);
              }}
              active={showColorPicker}
              tooltip="Change color"
              onDarkNote={onDarkNote}
              compact={compact}
            />
            {showColorPicker && typeof document !== "undefined" && createPortal(
              <div
                ref={colorPickerDropdownRef}
                className="fixed z-[9999] flex flex-col rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-2 shadow-2xl min-w-[280px] animate-in fade-in slide-in-from-bottom-2 duration-200"
                style={{
                  left: colorPickerPos.x,
                  top: colorPickerPos.y,
                  transform: "translate(-50%, -100%)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Default */}
                <button
                  type="button"
                  onClick={(e) => handleColorSelect(DEFAULT_ENTRY_COLOR.id, e)}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-xl text-xs font-medium transition w-full mb-2",
                    color === DEFAULT_ENTRY_COLOR.id
                      ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white"
                      : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  )}
                >
                  <span className={cn("h-4 w-4 rounded-full flex-shrink-0", DEFAULT_ENTRY_COLOR.swatchClass)} />
                  {DEFAULT_ENTRY_COLOR.label}
                </button>

                {/* Light and Dark columns */}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <p className="text-[9px] uppercase font-bold text-zinc-400 dark:text-zinc-500 mb-1 px-1">
                      Light
                    </p>
                    <div className="space-y-0.5">
                      {LIGHT_ENTRY_COLORS.filter((c) => c.id !== "default").map((c) => (
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
                          <span className={cn("h-3.5 w-3.5 rounded-full flex-shrink-0", c.swatchClass)} />
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
                      {DARK_ENTRY_COLORS.map((c) => (
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
                          <span className={cn("h-3.5 w-3.5 rounded-full flex-shrink-0", c.swatchClass)} />
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>,
              document.body
            )}
          </div>
          <Divider onDarkNote={onDarkNote} />
        </>
      )}

      {/* Priority Picker */}
      {enablePriorityPicker && onPriorityChange && (
        <>
          <div className="relative" ref={priorityPickerRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (priorityPickerRef.current) {
                  const rect = priorityPickerRef.current.getBoundingClientRect();
                  setPriorityPickerPos({
                    x: rect.left + rect.width / 2,
                    y: rect.top - 8,
                  });
                }
                setShowPriorityPicker((prev) => !prev);
                setShowColorPicker(false);
                setShowSpacePicker(false);
              }}
              className={cn(
                "h-7 w-7 rounded-full flex items-center justify-center transition",
                onDarkNote ? "hover:bg-white/20" : "hover:bg-black/10 dark:hover:bg-white/20"
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
                        : onDarkNote
                          ? "text-white/75"
                          : "text-zinc-600 dark:text-zinc-300"
                )}
              />
            </button>
            {showPriorityPicker && typeof document !== "undefined" && createPortal(
              <div
                ref={priorityPickerDropdownRef}
                className="fixed z-[9999] flex flex-col gap-0.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-1.5 shadow-2xl min-w-[100px] animate-in fade-in slide-in-from-bottom-2 duration-200"
                style={{
                  left: priorityPickerPos.x,
                  top: priorityPickerPos.y,
                  transform: "translate(-50%, -100%)",
                }}
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
              </div>,
              document.body
            )}
          </div>
          <Divider onDarkNote={onDarkNote} />
        </>
      )}

      {/* Duplicate */}
      {onDuplicate && (
        <IconButton
          icon={Copy}
          onClick={handleDuplicate}
          tooltip="Duplicate"
          onDarkNote={onDarkNote}
          compact={compact}
        />
      )}

      {/* Archive */}
      {onArchive && (
        <IconButton
          icon={Archive}
          onClick={handleArchive}
          tooltip="Archive"
          onDarkNote={onDarkNote}
          compact={compact}
        />
      )}

      {/* Delete */}
      {canDelete && onDelete && (
        <>
          <Divider onDarkNote={onDarkNote} />
          <IconButton
            icon={Trash2}
            onClick={handleDelete}
            variant="danger"
            tooltip="Delete"
            onDarkNote={onDarkNote}
            compact={compact}
          />
        </>
      )}

      {/* Editor-only: More menu & Save */}
      {variant === "editor" && (
        <>
          {moreMenuActions.length > 0 && (
            <>
              <Divider onDarkNote={onDarkNote} />
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMoreMenu((prev) => !prev);
                  }}
                  className={cn(
                    "h-7 w-7 rounded-full flex items-center justify-center transition",
                    onDarkNote ? "hover:bg-white/20" : "hover:bg-black/10 dark:hover:bg-white/20"
                  )}
                  aria-label="More actions"
                  title="More actions"
                >
                  <MoreVertical
                    className={cn(
                      "h-4 w-4",
                      onDarkNote ? "text-white/75" : "text-zinc-600 dark:text-zinc-300"
                    )}
                  />
                </button>
                {showMoreMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-[59]"
                      onClick={() => setShowMoreMenu(false)}
                    />
                    <div
                      className="absolute bottom-full mb-2 right-0 z-[60] flex flex-col items-end gap-0.5 rounded-2xl bg-zinc-900 border border-zinc-700 p-1.5 shadow-2xl min-w-[130px] animate-in fade-in slide-in-from-bottom-2 duration-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {moreMenuActions.map((action) => (
                        <button
                          key={action.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            action.onClick();
                            setShowMoreMenu(false);
                          }}
                          className={cn(
                            "flex items-center justify-end gap-2 px-3 py-1.5 rounded-xl text-[11px] font-medium transition w-full",
                            action.variant === "danger"
                              ? "text-red-400 hover:bg-red-500/20"
                              : "text-zinc-300 hover:bg-zinc-800"
                          )}
                        >
                          {action.label}
                          <action.icon className="h-4 w-4" />
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {onSave && (
            <>
              <Divider onDarkNote={onDarkNote} />
              <button
                type="button"
                onClick={handleSave}
                className={cn(
                  "h-7 px-3 rounded-full flex items-center justify-center gap-1.5 transition text-[11px] font-medium",
                  onDarkNote
                    ? "text-white/75 hover:text-white hover:bg-white/20"
                    : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/20"
                )}
                aria-label="Save and close"
              >
                <Check className="h-4 w-4" />
                <span>Save</span>
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default EntryFooterToolbar;
