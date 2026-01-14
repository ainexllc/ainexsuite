"use client";

import { motion } from "framer-motion";
import { Circle, CheckCircle2 } from "lucide-react";

interface AnimatedCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  onClick?: (event: React.MouseEvent) => void;
  disabled?: boolean;
  className?: string;
}

export function AnimatedCheckbox({
  checked,
  onChange,
  onClick,
  disabled = false,
  className = "",
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
      className={`relative flex h-4 w-4 flex-shrink-0 cursor-pointer items-center justify-center focus:outline-none ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      } ${className}`}
      whileTap={{ scale: 0.85 }}
      animate={{ scale: checked ? [1, 1.2, 1] : 1 }}
      transition={{ duration: 0.2 }}
    >
      {checked ? (
        <CheckCircle2
          className="h-4 w-4 text-[var(--color-primary)]"
          fill="var(--color-primary)"
          strokeWidth={0}
        />
      ) : (
        <Circle
          className="h-4 w-4 text-zinc-400 hover:text-zinc-500 dark:text-zinc-500 dark:hover:text-zinc-400 transition-colors"
          strokeWidth={2}
        />
      )}
    </motion.button>
  );
}
