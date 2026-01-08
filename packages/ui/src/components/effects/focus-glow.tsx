"use client";

import { cn } from "../../lib/utils";

interface FocusGlowProps {
  /** Custom glow color. Defaults to --color-primary CSS variable */
  color?: string;
  /** Additional CSS classes */
  className?: string;
  /** Disable the glow effect */
  disabled?: boolean;
}

/**
 * FocusGlow - Glowing border effect for pinned/focused cards.
 *
 * Usage:
 * ```tsx
 * <article className="relative">
 *   {item.pinned && <FocusGlow />}
 * </article>
 * ```
 */
export function FocusGlow({
  color,
  className,
  disabled = false,
}: FocusGlowProps) {
  if (disabled) return null;

  const glowColor = color || "var(--color-primary, #f97316)";

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-10 rounded-[inherit]",
        className
      )}
      style={{
        border: `1.5px solid ${glowColor}`,
        boxShadow: `0 0 4px ${glowColor}, 0 0 8px ${glowColor}40`,
      }}
      aria-hidden="true"
    />
  );
}

export default FocusGlow;
