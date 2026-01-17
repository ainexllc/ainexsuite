"use client";

import { motion } from "framer-motion";
import { Circle, CheckCircle2 } from "lucide-react";
import { cn } from "../../lib/utils";

export interface AnimatedCheckboxProps {
  /** Whether the checkbox is checked */
  checked: boolean;
  /** Callback when checkbox state changes */
  onChange: (checked: boolean) => void;
  /** Optional click handler (useful for bulk operations with Shift+Click) */
  onClick?: (event: React.MouseEvent) => void;
  /** Disable the checkbox */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

/**
 * AnimatedCheckbox - A smooth animated checkbox component
 *
 * Features:
 * - Smooth scale animation on check/uncheck
 * - App color integration via CSS variable
 * - Accessible with proper ARIA attributes
 * - Supports onClick handler for bulk operations (Shift+Click)
 *
 * @example
 * ```tsx
 * <AnimatedCheckbox
 *   checked={item.completed}
 *   onChange={(checked) => toggleItem(item.id, checked)}
 *   onClick={(e) => {
 *     if (e.shiftKey) {
 *       e.preventDefault();
 *       handleBulkToggle(item.id);
 *     }
 *   }}
 * />
 * ```
 */
export function AnimatedCheckbox({
  checked,
  onChange,
  onClick,
  disabled = false,
  className,
  size = "md",
}: AnimatedCheckboxProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick(e);
      // If onClick handled the event (e.g., bulk toggle), don't proceed
      if (e.defaultPrevented) return;
    }
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <motion.button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        "relative flex flex-shrink-0 cursor-pointer items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 rounded-full",
        sizeClasses[size],
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      whileTap={{ scale: 0.85 }}
      animate={{ scale: checked ? [1, 1.2, 1] : 1 }}
      transition={{ duration: 0.2 }}
    >
      {checked ? (
        <CheckCircle2
          className={cn(sizeClasses[size], "text-[var(--color-primary)]")}
          fill="var(--color-primary)"
          strokeWidth={0}
        />
      ) : (
        <Circle
          className={cn(
            sizeClasses[size],
            "text-zinc-400 hover:text-zinc-500 dark:text-zinc-500 dark:hover:text-zinc-400 transition-colors"
          )}
          strokeWidth={2}
        />
      )}
    </motion.button>
  );
}

export default AnimatedCheckbox;
