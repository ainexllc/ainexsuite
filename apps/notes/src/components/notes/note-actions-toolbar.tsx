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
  ImagePlus,
  Tag,
  Printer,
} from "lucide-react";
import { clsx } from "clsx";
import type { Note, NoteColor, NotePriority, NoteSpace } from "@/lib/types/note";
import { LIGHT_COLORS, DARK_COLORS, DEFAULT_COLOR } from "@/lib/constants/note-colors";

// ============ Types ============

export type NoteActionsToolbarVariant = "card" | "editor";

export interface NoteActionsToolbarProps {
  note: Note;
  variant: NoteActionsToolbarVariant;

  // Styling context
  forceDarkText?: boolean;
  forceLightText?: boolean;
  backgroundBrightness?: "light" | "dark";
  hasCover?: boolean;

  // Space management
  spaces: NoteSpace[];
  currentSpace?: NoteSpace;
  onMoveToSpace: (spaceId: string) => void;

  // Core actions (both variants)
  onColorChange: (color: NoteColor) => void;
  onPriorityChange: (priority: NotePriority) => void;
  onDuplicate: () => void;
  onArchive?: () => void;
  onDelete: () => void;

  // Current state
  color: NoteColor;
  priority: NotePriority;

  // Editor-only props
  showBackgroundPicker?: boolean;
  onBackgroundPickerToggle?: () => void;
  hasBackgroundImage?: boolean;
  showLabelPicker?: boolean;
  onLabelPickerToggle?: () => void;
  hasLabels?: boolean;
  onSave?: () => void;
  onPrint?: () => void;

  // Editor-only: content manipulation (render before shared buttons)
  editorExtraButtons?: React.ReactNode;

  // Visibility control (for card hover behavior)
  visible?: boolean;

  // Permission
  canDelete?: boolean;
}

// ============ Internal Components ============

interface IconButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  onClick: (e: React.MouseEvent) => void;
  active?: boolean;
  variant?: "default" | "danger";
  tooltip?: string;
  className?: string;
  forceDarkText?: boolean;
  forceLightText?: boolean;
  backgroundBrightness?: "light" | "dark";
  hasCover?: boolean;
}

function IconButton({
  icon: Icon,
  onClick,
  active,
  variant = "default",
  tooltip,
  className,
  forceDarkText: _forceDarkText,
  forceLightText,
  backgroundBrightness,
  hasCover,
}: IconButtonProps) {
  const isDanger = variant === "danger";

  // Determine if we're on a dark note (needs light icons)
  const onDarkNote = forceLightText || backgroundBrightness === "dark" || hasCover;

  // Adaptive button hover based on note brightness
  const buttonClasses = clsx(
    "h-7 w-7 rounded-full flex items-center justify-center transition",
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

  // Adaptive icon color based on note brightness
  const iconClasses = clsx(
    "h-4 w-4",
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
  forceLightText?: boolean;
  backgroundBrightness?: "light" | "dark";
  hasCover?: boolean;
}

function Divider({ forceLightText, backgroundBrightness, hasCover }: DividerProps) {
  const onDarkNote = forceLightText || backgroundBrightness === "dark" || hasCover;
  return (
    <div
      className={clsx(
        "h-4 w-px mx-0.5",
        onDarkNote ? "bg-white/25 dark:bg-white/30" : "bg-zinc-400/40 dark:bg-zinc-500/50"
      )}
    />
  );
}

// ============ Main Component ============

export function NoteActionsToolbar({
  note,
  variant,
  forceDarkText,
  forceLightText,
  backgroundBrightness,
  hasCover,
  spaces,
  currentSpace,
  onMoveToSpace,
  onColorChange,
  onPriorityChange,
  onDuplicate,
  onArchive,
  onDelete,
  color,
  priority,
  showBackgroundPicker,
  onBackgroundPickerToggle,
  hasBackgroundImage,
  showLabelPicker,
  onLabelPickerToggle,
  hasLabels,
  onSave,
  onPrint,
  editorExtraButtons,
  visible = true,
  canDelete = true,
}: NoteActionsToolbarProps) {
  const [showSpacePicker, setShowSpacePicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [colorPickerPos, setColorPickerPos] = useState({ x: 0, y: 0 });
  const [priorityPickerPos, setPriorityPickerPos] = useState({ x: 0, y: 0 });
  const footerExpanded = false; // Controlled by parent in future

  const spacePickerRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const colorPickerDropdownRef = useRef<HTMLDivElement>(null);
  const priorityPickerRef = useRef<HTMLDivElement>(null);
  const priorityPickerDropdownRef = useRef<HTMLDivElement>(null);

  // Styling props to pass down
  const styleProps = { forceDarkText, forceLightText, backgroundBrightness, hasCover };

  // Unified click-outside handler for all pickers
  useEffect(() => {
    const anyPickerOpen = showSpacePicker || showColorPicker || showPriorityPicker;
    if (!anyPickerOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Space picker - only check the container ref
      if (showSpacePicker && spacePickerRef.current && !spacePickerRef.current.contains(target)) {
        setShowSpacePicker(false);
      }

      // Color picker - check both button ref and portal dropdown ref
      if (showColorPicker) {
        const clickedColorButton = colorPickerRef.current?.contains(target);
        const clickedColorDropdown = colorPickerDropdownRef.current?.contains(target);
        if (!clickedColorButton && !clickedColorDropdown) {
          setShowColorPicker(false);
        }
      }

      // Priority picker - check both button ref and portal dropdown ref
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
      onMoveToSpace(spaceId);
      setShowSpacePicker(false);
    },
    [onMoveToSpace]
  );

  const handleColorSelect = useCallback(
    (newColor: NoteColor, e: React.MouseEvent) => {
      e.stopPropagation();
      onColorChange(newColor);
      // Keep picker open for preview
    },
    [onColorChange]
  );

  const handlePrioritySelect = useCallback(
    (newPriority: NotePriority, e: React.MouseEvent) => {
      e.stopPropagation();
      onPriorityChange(newPriority);
      setShowPriorityPicker(false);
    },
    [onPriorityChange]
  );

  const handleDuplicate = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDuplicate();
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
      onDelete();
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

  const handlePrint = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onPrint?.();
      setShowMoreMenu(false);
    },
    [onPrint]
  );

  const handleBackgroundToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onBackgroundPickerToggle?.();
    },
    [onBackgroundPickerToggle]
  );

  const handleLabelToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onLabelPickerToggle?.();
    },
    [onLabelPickerToggle]
  );

  // Determine if we're on a dark note (needs light text/icons)
  const onDarkNote = forceLightText || backgroundBrightness === "dark" || hasCover;

  // Container classes - adaptive glass effect based on note brightness
  const containerClasses = clsx(
    "flex items-center gap-1 px-1.5 py-1 rounded-full border transition-opacity backdrop-blur-sm",
    variant === "card" && !visible && "opacity-0 group-hover:opacity-100",
    variant === "card" && visible && "opacity-100",
    footerExpanded && "!opacity-100",
    // Adaptive glass background
    onDarkNote
      ? "bg-black/40 dark:bg-black/50 border-white/15 dark:border-white/20"
      : "bg-white/60 dark:bg-zinc-900/70 border-black/10 dark:border-white/10"
  );

  // Divider props for consistent styling
  const dividerProps = { forceLightText, backgroundBrightness, hasCover };

  return (
    <div className={containerClasses}>
      {/* Space Selector */}
      {spaces.length > 1 && (
        <div className="relative" ref={spacePickerRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowSpacePicker((prev) => !prev);
              setShowColorPicker(false);
              setShowPriorityPicker(false);
            }}
            className={clsx(
              "h-7 flex items-center gap-1.5 rounded-full px-2.5 text-[11px] font-medium transition",
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
            <span className="max-w-[70px] truncate">
              {currentSpace?.name || "My Notes"}
            </span>
          </button>
          {showSpacePicker && (
            <div
              className={clsx(
                "absolute bottom-9 left-1/2 -translate-x-1/2 z-50 min-w-[140px] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200",
                forceDarkText
                  ? "bg-white border border-zinc-200"
                  : forceLightText
                    ? "bg-zinc-900 border border-zinc-700"
                    : backgroundBrightness === "light"
                      ? "bg-white border border-zinc-200"
                      : backgroundBrightness === "dark" || hasCover
                        ? "bg-zinc-900 border border-zinc-700"
                        : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={clsx(
                  "px-3 py-2 border-b",
                  forceDarkText
                    ? "border-zinc-200"
                    : forceLightText
                      ? "border-zinc-700"
                      : backgroundBrightness === "light"
                        ? "border-zinc-200"
                        : backgroundBrightness === "dark" || hasCover
                          ? "border-zinc-700"
                          : "border-zinc-200 dark:border-zinc-700"
                )}
              >
                <p
                  className={clsx(
                    "text-xs font-semibold",
                    forceDarkText
                      ? "text-zinc-900"
                      : forceLightText
                        ? "text-white"
                        : backgroundBrightness === "light"
                          ? "text-zinc-900"
                          : backgroundBrightness === "dark" || hasCover
                            ? "text-white"
                            : "text-zinc-900 dark:text-white"
                  )}
                >
                  Move to Space
                </p>
              </div>
              <div className="p-1.5 max-h-36 overflow-y-auto scrollbar-styled">
                {spaces.map((space) => (
                  <button
                    key={space.id}
                    type="button"
                    onClick={(e) => handleSpaceSelect(space.id, e)}
                    className={clsx(
                      "w-full text-left px-2.5 py-1.5 rounded-xl text-xs transition-colors flex items-center gap-2",
                      space.id === note.spaceId
                        ? "bg-[var(--color-primary)] text-white"
                        : forceDarkText
                          ? "text-zinc-600 hover:bg-zinc-100"
                          : forceLightText
                            ? "text-zinc-300 hover:bg-zinc-800"
                            : backgroundBrightness === "light"
                              ? "text-zinc-600 hover:bg-zinc-100"
                              : backgroundBrightness === "dark" || hasCover
                                ? "text-zinc-300 hover:bg-zinc-800"
                                : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
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
      )}

      {/* Divider after space selector */}
      {spaces.length > 1 && <Divider {...dividerProps} />}

      {/* Editor-only: Background & Labels */}
      {variant === "editor" && (
        <>
          <IconButton
            icon={ImagePlus}
            onClick={handleBackgroundToggle}
            active={showBackgroundPicker || hasBackgroundImage}
            tooltip="Change background"
            {...styleProps}
          />
          <IconButton
            icon={Tag}
            onClick={handleLabelToggle}
            active={showLabelPicker || hasLabels}
            tooltip="Labels"
            {...styleProps}
          />
          <Divider {...dividerProps} />
        </>
      )}

      {/* Editor-only: Extra buttons (AI Enhance, Convert to checklist, etc.) */}
      {variant === "editor" && editorExtraButtons}

      {/* Color Picker */}
      <div className="relative" ref={colorPickerRef}>
        <IconButton
          icon={Palette}
          onClick={(e) => {
            e.stopPropagation();
            setShowSpacePicker(false);
            setShowPriorityPicker(false);
            // Calculate position for portal
            if (colorPickerRef.current) {
              const rect = colorPickerRef.current.getBoundingClientRect();
              setColorPickerPos({
                x: rect.left + rect.width / 2,
                y: rect.top - 8, // 8px gap above button
              });
            }
            setShowColorPicker((prev) => !prev);
          }}
          active={showColorPicker}
          tooltip="Change color"
          {...styleProps}
        />
        {showColorPicker && typeof document !== 'undefined' && createPortal(
          <div
            ref={colorPickerDropdownRef}
            className="fixed z-[9999] flex flex-col rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-2 shadow-2xl min-w-[280px] animate-in fade-in slide-in-from-bottom-2 duration-200"
            style={{
              left: colorPickerPos.x,
              top: colorPickerPos.y,
              transform: 'translate(-50%, -100%)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Default - full width at top */}
            <button
              type="button"
              onClick={(e) => handleColorSelect(DEFAULT_COLOR.id, e)}
              className={clsx(
                "flex items-center gap-2 px-2 py-1.5 rounded-xl text-xs font-medium transition w-full mb-2",
                color === DEFAULT_COLOR.id
                  ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white"
                  : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              )}
            >
              <span className={clsx("h-4 w-4 rounded-full flex-shrink-0", DEFAULT_COLOR.swatchClass)} />
              {DEFAULT_COLOR.label}
            </button>

            {/* Light and Dark columns */}
            <div className="flex gap-2">
              {/* Light Colors Column */}
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
                      className={clsx(
                        "flex items-center gap-2 px-2 py-1 rounded-xl text-xs font-medium transition w-full",
                        color === c.id
                          ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white"
                          : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      )}
                    >
                      <span className={clsx("h-3.5 w-3.5 rounded-full flex-shrink-0", c.swatchClass)} />
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Dark Colors Column */}
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
                      className={clsx(
                        "flex items-center gap-2 px-2 py-1 rounded-xl text-xs font-medium transition w-full",
                        color === c.id
                          ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white"
                          : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      )}
                    >
                      <span className={clsx("h-3.5 w-3.5 rounded-full flex-shrink-0", c.swatchClass)} />
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

      <Divider {...dividerProps} />

      {/* Priority Picker */}
      <div className="relative" ref={priorityPickerRef}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            // Calculate position for portal
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
          className={clsx(
            "h-7 w-7 rounded-full flex items-center justify-center transition",
            onDarkNote ? "hover:bg-white/20" : "hover:bg-black/10 dark:hover:bg-white/20"
          )}
          title={
            priority
              ? `${priority.charAt(0).toUpperCase() + priority.slice(1)} priority (click to change)`
              : "Set priority"
          }
        >
          <Flame
            className={clsx(
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
        {showPriorityPicker && typeof document !== 'undefined' && createPortal(
          <div
            ref={priorityPickerDropdownRef}
            className="fixed z-[9999] flex flex-col gap-0.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-1.5 shadow-2xl min-w-[100px] animate-in fade-in slide-in-from-bottom-2 duration-200"
            style={{
              left: priorityPickerPos.x,
              top: priorityPickerPos.y,
              transform: 'translate(-50%, -100%)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={(e) => handlePrioritySelect("high", e)}
              className={clsx(
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
              className={clsx(
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
              className={clsx(
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

      <Divider {...dividerProps} />

      {/* Duplicate button */}
      <IconButton
        icon={Copy}
        onClick={handleDuplicate}
        tooltip="Duplicate note"
        {...styleProps}
      />

      {/* Archive button */}
      {onArchive && (
        <IconButton
          icon={Archive}
          onClick={handleArchive}
          tooltip="Archive note"
          {...styleProps}
        />
      )}

      {/* Delete button */}
      {canDelete && (
        <>
          <Divider {...dividerProps} />
          <IconButton
            icon={Trash2}
            onClick={handleDelete}
            variant="danger"
            tooltip="Delete note"
            {...styleProps}
          />
        </>
      )}

      {/* Editor-only: More menu & Save */}
      {variant === "editor" && (
        <>
          <Divider {...dividerProps} />

          {/* More actions menu */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowMoreMenu((prev) => !prev);
              }}
              className={clsx(
                "h-7 w-7 rounded-full flex items-center justify-center transition",
                onDarkNote ? "hover:bg-white/20" : "hover:bg-black/10 dark:hover:bg-white/20"
              )}
              aria-label="More actions"
              title="More actions"
            >
              <MoreVertical
                className={clsx(
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
                  <button
                    type="button"
                    onClick={handleDuplicate}
                    className="flex items-center justify-end gap-2 px-3 py-1.5 rounded-xl text-[11px] font-medium text-zinc-300 hover:bg-zinc-800 transition w-full"
                  >
                    Duplicate
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="flex items-center justify-end gap-2 px-3 py-1.5 rounded-xl text-[11px] font-medium text-zinc-300 hover:bg-zinc-800 transition w-full"
                  >
                    Print
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="h-px bg-zinc-700 my-1 w-full" />
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex items-center justify-end gap-2 px-3 py-1.5 rounded-xl text-[11px] font-medium text-red-400 hover:bg-red-500/20 transition w-full"
                  >
                    Delete
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </>
            )}
          </div>

          <Divider {...dividerProps} />

          {/* Save button */}
          <button
            type="button"
            onClick={handleSave}
            className={clsx(
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
    </div>
  );
}
