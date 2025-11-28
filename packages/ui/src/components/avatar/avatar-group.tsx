"use client";

import { clsx } from "clsx";
import { Avatar, type AvatarProps } from "./avatar";

export interface AvatarGroupProps {
  /** Array of avatar configurations */
  avatars: Array<Omit<AvatarProps, "size" | "className">>;
  /** Maximum number of avatars to show */
  max?: number;
  /** Size for all avatars */
  size?: AvatarProps["size"];
  /** Spacing between avatars (negative margin) */
  spacing?: "tight" | "normal" | "loose";
  /** Additional CSS classes */
  className?: string;
  /** Shape of avatars */
  shape?: AvatarProps["shape"];
  /** Whether to show border on avatars */
  border?: boolean;
  /** Click handler for overflow indicator */
  onOverflowClick?: () => void;
}

/**
 * AvatarGroup - Stack of overlapping avatars
 *
 * Features:
 * - Overlapping style with configurable spacing
 * - Shows +N indicator for overflow
 * - Supports all Avatar props
 * - Responsive sizing
 *
 * @example
 * ```tsx
 * <AvatarGroup
 *   avatars={[
 *     { src: user1.photoURL, name: user1.displayName },
 *     { src: user2.photoURL, name: user2.displayName },
 *     { src: user3.photoURL, name: user3.displayName },
 *   ]}
 *   max={3}
 *   size="sm"
 * />
 * ```
 */
export function AvatarGroup({
  avatars,
  max = 5,
  size = "md",
  spacing = "normal",
  className,
  shape = "circle",
  border = true,
  onOverflowClick,
}: AvatarGroupProps) {
  const displayAvatars = avatars.slice(0, max);
  const overflowCount = avatars.length - max;
  const hasOverflow = overflowCount > 0;

  // Spacing classes (negative margin to create overlap)
  const spacingClass = {
    tight: "-space-x-3",
    normal: "-space-x-2",
    loose: "-space-x-1",
  };

  // Size to font size mapping for overflow indicator
  const overflowFontSize = {
    xs: "text-[10px]",
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
    "2xl": "text-xl",
  };

  return (
    <div className={clsx("flex items-center", spacingClass[spacing], className)}>
      {/* Avatars */}
      {displayAvatars.map((avatar, index) => (
        <div
          key={index}
          className="relative"
          style={{ zIndex: displayAvatars.length - index }}
        >
          <Avatar
            {...avatar}
            size={size}
            shape={shape}
            border={border}
            className="ring-2 ring-[rgb(var(--color-surface-card))]"
          />
        </div>
      ))}

      {/* Overflow indicator */}
      {hasOverflow && (
        <div
          className={clsx(
            "relative flex items-center justify-center font-semibold",
            shape === "circle" && "rounded-full",
            shape === "square" && "rounded-none",
            shape === "rounded" && "rounded-xl",
            border && "ring-2 ring-[rgb(var(--color-surface-card))]",
            "bg-[rgb(var(--color-surface-muted))] text-[rgb(var(--color-ink-700))] border border-[rgb(var(--color-outline-subtle))]",
            overflowFontSize[size],
            onOverflowClick && "cursor-pointer hover:bg-[rgb(var(--color-surface-elevated))] transition-colors",
            // Match avatar size
            size === "xs" && "h-6 w-6",
            size === "sm" && "h-8 w-8",
            size === "md" && "h-10 w-10",
            size === "lg" && "h-12 w-12",
            size === "xl" && "h-16 w-16",
            size === "2xl" && "h-20 w-20"
          )}
          style={{ zIndex: 0 }}
          onClick={onOverflowClick}
          role={onOverflowClick ? "button" : undefined}
          tabIndex={onOverflowClick ? 0 : undefined}
          onKeyDown={
            onOverflowClick
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onOverflowClick();
                  }
                }
              : undefined
          }
        >
          +{overflowCount}
        </div>
      )}
    </div>
  );
}
