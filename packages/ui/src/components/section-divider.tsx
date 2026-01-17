"use client";

import { cn } from "../lib/utils";

export interface SectionDividerProps {
  /** The text label to display in the center */
  label: string;
  /** Additional className for the container */
  className?: string;
  /** Additional className for the label */
  labelClassName?: string;
  /** Line color variant */
  variant?: "default" | "subtle" | "prominent";
}

/**
 * SectionDivider - Horizontal divider with centered label
 *
 * A styled horizontal rule with a centered text label, commonly used
 * to separate sections in a list or grid view.
 *
 * @example
 * ```tsx
 * // In Notes app
 * <SectionDivider label="All Notes" />
 *
 * // In Todo app
 * <SectionDivider label="All Tasks" />
 *
 * // With custom styling
 * <SectionDivider
 *   label="Completed"
 *   variant="subtle"
 *   className="my-8"
 * />
 * ```
 */
export function SectionDivider({
  label,
  className,
  labelClassName,
  variant = "default",
}: SectionDividerProps) {
  const lineClass = cn(
    "w-full border-t",
    variant === "default" && "border-zinc-300 dark:border-zinc-700",
    variant === "subtle" && "border-zinc-200 dark:border-zinc-800",
    variant === "prominent" && "border-zinc-400 dark:border-zinc-600"
  );

  const labelBaseClass = cn(
    "px-4 py-1 text-xs font-semibold uppercase tracking-widest",
    "bg-zinc-100 dark:bg-zinc-950",
    variant === "default" && "text-zinc-500 dark:text-zinc-400",
    variant === "subtle" && "text-zinc-400 dark:text-zinc-500",
    variant === "prominent" && "text-zinc-600 dark:text-zinc-300"
  );

  return (
    <div className={cn("relative", className)}>
      <div className="absolute inset-0 flex items-center">
        <div className={lineClass} />
      </div>
      <div className="relative flex justify-center">
        <span className={cn(labelBaseClass, labelClassName)}>{label}</span>
      </div>
    </div>
  );
}

export default SectionDivider;
