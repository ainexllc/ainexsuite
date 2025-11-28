"use client";

import { clsx } from "clsx";
import { Avatar, type AvatarProps } from "./avatar";

export interface UserDisplayProps {
  /** User information */
  user: {
    name?: string | null;
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
    avatarUrl?: string | null;
  };
  /** Size of the avatar and text */
  size?: "sm" | "md" | "lg";
  /** Whether to show email */
  showEmail?: boolean;
  /** Custom subtitle (overrides email) */
  subtitle?: string;
  /** Avatar shape */
  shape?: AvatarProps["shape"];
  /** Status indicator */
  status?: AvatarProps["status"];
  /** Additional CSS classes */
  className?: string;
  /** Text alignment */
  align?: "left" | "center";
  /** Click handler */
  onClick?: () => void;
  /** Whether component is interactive */
  interactive?: boolean;
}

/**
 * UserDisplay - Avatar + name/info combo
 *
 * Features:
 * - Combines avatar with text info
 * - Flexible user object format
 * - Good for lists, dropdowns, headers
 * - Optional click handler
 *
 * @example
 * ```tsx
 * // Basic usage
 * <UserDisplay
 *   user={{ name: "John Doe", email: "john@example.com" }}
 *   showEmail
 * />
 *
 * // With custom subtitle
 * <UserDisplay
 *   user={user}
 *   subtitle="Admin"
 *   size="lg"
 * />
 *
 * // Interactive
 * <UserDisplay
 *   user={user}
 *   interactive
 *   onClick={() => console.log("Clicked")}
 * />
 * ```
 */
export function UserDisplay({
  user,
  size = "md",
  showEmail = false,
  subtitle,
  shape = "circle",
  status,
  className,
  align = "left",
  onClick,
  interactive = false,
}: UserDisplayProps) {
  // Extract user properties with fallbacks
  const name = user.displayName || user.name;
  const email = user.email;
  const avatarUrl = user.photoURL || user.avatarUrl;

  // Size-based styling
  const sizeConfig = {
    sm: {
      avatar: "xs" as const,
      name: "text-sm",
      subtitle: "text-xs",
      gap: "gap-2",
    },
    md: {
      avatar: "md" as const,
      name: "text-sm",
      subtitle: "text-xs",
      gap: "gap-3",
    },
    lg: {
      avatar: "lg" as const,
      name: "text-base",
      subtitle: "text-sm",
      gap: "gap-3",
    },
  };

  const config = sizeConfig[size];

  return (
    <div
      className={clsx(
        "flex items-center",
        config.gap,
        align === "center" && "justify-center",
        (interactive || onClick) &&
          "cursor-pointer rounded-xl p-2 -m-2 hover:bg-[rgb(var(--color-surface-muted))] transition-colors",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <Avatar
        src={avatarUrl}
        name={name}
        alt={name || email || "User"}
        size={config.avatar}
        shape={shape}
        status={status}
      />

      <div
        className={clsx(
          "flex flex-col min-w-0",
          align === "center" && "items-center"
        )}
      >
        {name && (
          <p
            className={clsx(
              "font-semibold text-[rgb(var(--color-ink-900))] truncate",
              config.name
            )}
          >
            {name}
          </p>
        )}

        {(subtitle || (showEmail && email)) && (
          <p
            className={clsx(
              "text-[rgb(var(--color-ink-600))] truncate",
              config.subtitle
            )}
          >
            {subtitle || email}
          </p>
        )}
      </div>
    </div>
  );
}
