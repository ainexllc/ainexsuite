"use client";

import { useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";
import { Flame, X, type LucideIcon } from "lucide-react";

/**
 * Generic priority level type (nullable for optional priority)
 */
export type PriorityLevel = "high" | "medium" | "low" | null;

/**
 * Priority option configuration
 */
export interface PriorityOption {
  id: PriorityLevel;
  label: string;
  color: string;
  bgColor: string;
  icon?: LucideIcon;
}

/**
 * Default priority options
 */
export const DEFAULT_PRIORITY_OPTIONS: PriorityOption[] = [
  {
    id: "high",
    label: "High",
    color: "text-red-500",
    bgColor: "bg-red-500/20",
  },
  {
    id: "medium",
    label: "Medium",
    color: "text-amber-500",
    bgColor: "bg-amber-500/20",
  },
  {
    id: "low",
    label: "Low",
    color: "text-blue-500",
    bgColor: "bg-blue-500/20",
  },
];

export interface PriorityPickerProps {
  /** Current priority value */
  value: PriorityLevel;
  /** Callback when priority changes */
  onChange: (priority: PriorityLevel) => void;
  /** Callback when picker should close */
  onClose?: () => void;
  /** Auto-close after selection */
  autoClose?: boolean;
  /** Custom priority options */
  options?: PriorityOption[];
  /** Show clear option when priority is set */
  showClear?: boolean;
  /** Display variant */
  variant?: "dropdown" | "inline" | "popup";
  /** Position for popup variant (required when variant="popup") */
  position?: { x: number; y: number };
  /** Ref to forward for click-outside detection */
  dropdownRef?: React.RefObject<HTMLDivElement | null>;
  /** Additional className */
  className?: string;
}

/**
 * PriorityPicker - Shared priority picker dropdown
 *
 * Features:
 * - Dropdown, inline, or popup (portal) variants
 * - Customizable priority options
 * - Clear option
 * - Auto-close behavior
 * - Portal support for proper z-index and positioning
 *
 * @example
 * ```tsx
 * // Dropdown (relative to parent)
 * <PriorityPicker
 *   value={priority}
 *   onChange={setPriority}
 *   onClose={() => setShowPicker(false)}
 *   autoClose
 * />
 *
 * // Popup (portal with position)
 * <PriorityPicker
 *   value={priority}
 *   onChange={setPriority}
 *   onClose={() => setShowPicker(false)}
 *   variant="popup"
 *   position={{ x: buttonRect.left, y: buttonRect.top - 8 }}
 *   dropdownRef={dropdownRef}
 * />
 * ```
 */
export function PriorityPicker({
  value,
  onChange,
  onClose,
  autoClose = true,
  options = DEFAULT_PRIORITY_OPTIONS,
  showClear = true,
  variant = "dropdown",
  position,
  dropdownRef,
  className,
}: PriorityPickerProps) {
  const internalRef = useRef<HTMLDivElement>(null);
  const ref = dropdownRef || internalRef;

  const handleSelect = (priority: PriorityLevel, e?: React.MouseEvent) => {
    e?.stopPropagation();
    onChange(priority);
    if (autoClose && onClose) {
      onClose();
    }
  };

  const handleClear = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onChange(null);
    if (autoClose && onClose) {
      onClose();
    }
  };

  // Inline variant - horizontal button row
  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {options.map((option) => {
          const Icon = option.icon || Flame;
          return (
            <button
              key={option.id}
              type="button"
              onClick={(e) => handleSelect(option.id, e)}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition",
                value === option.id
                  ? `${option.bgColor} ${option.color}`
                  : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              )}
            >
              <Icon className={cn("h-3.5 w-3.5", option.color)} />
              {option.label}
            </button>
          );
        })}
        {showClear && value && (
          <button
            type="button"
            onClick={(e) => handleClear(e)}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  }

  // Shared dropdown content
  const dropdownContent = (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cn(
        "flex flex-col gap-0.5 rounded-2xl p-1.5 shadow-2xl min-w-[100px]",
        "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700",
        "animate-in fade-in slide-in-from-bottom-2 duration-200",
        variant === "dropdown" && "absolute top-12 right-0 z-30",
        variant === "popup" && "fixed z-[9999]",
        className
      )}
      style={
        variant === "popup" && position
          ? {
              left: position.x,
              top: position.y,
              transform: "translate(-50%, -100%)",
            }
          : undefined
      }
      onClick={(e) => e.stopPropagation()}
    >
      {options.map((option) => {
        const Icon = option.icon || Flame;
        return (
          <button
            key={option.id}
            type="button"
            onClick={(e) => handleSelect(option.id, e)}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-xl text-xs font-medium transition",
              value === option.id
                ? `${option.bgColor} ${option.color}`
                : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            )}
          >
            <Icon className={cn("h-3 w-3", option.color)} />
            {option.label}
          </button>
        );
      })}

      {/* Clear option - only show if priority is set */}
      {showClear && value && (
        <>
          <div className="h-px bg-zinc-200 dark:bg-zinc-700 my-0.5" />
          <button
            type="button"
            onClick={(e) => handleClear(e)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-xl text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        </>
      )}
    </div>
  );

  // Popup variant uses portal
  if (variant === "popup") {
    if (typeof document === "undefined") return null;
    return createPortal(dropdownContent, document.body);
  }

  // Dropdown variant (default) - relative positioning
  return dropdownContent;
}

/**
 * Helper to get the button styles based on current priority
 */
export function getPriorityButtonStyles(priority: PriorityLevel): string {
  switch (priority) {
    case "high":
      return "text-red-500 bg-red-500/10";
    case "medium":
      return "text-amber-500 bg-amber-500/10";
    case "low":
      return "text-blue-500 bg-blue-500/10";
    default:
      return "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800";
  }
}

/**
 * Helper to get priority color class
 */
export function getPriorityColor(priority: PriorityLevel): string {
  switch (priority) {
    case "high":
      return "text-red-500";
    case "medium":
      return "text-amber-500";
    case "low":
      return "text-blue-500";
    default:
      return "text-zinc-400";
  }
}

export default PriorityPicker;
