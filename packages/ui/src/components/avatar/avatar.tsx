"use client";

import { useState, type ImgHTMLAttributes } from "react";
import Image from "next/image";
import { clsx } from "clsx";
import { avatarVariants } from "../../config/component-variants";
import type { AvatarVariantProps } from "../../config/component-variants";

export interface AvatarProps extends Omit<AvatarVariantProps, "size"> {
  /** Image source URL */
  src?: string | null;
  /** Alt text for image */
  alt?: string;
  /** User's display name (used for initials fallback) */
  name?: string | null;
  /** Size of the avatar */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  /** Shape of the avatar */
  shape?: "circle" | "square" | "rounded";
  /** Custom fallback content (overrides initials) */
  fallback?: React.ReactNode;
  /** Status indicator */
  status?: "online" | "offline" | "busy" | "away";
  /** Additional CSS classes */
  className?: string;
  /** Whether to show border */
  border?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Image loading priority (for Next.js Image) */
  priority?: boolean;
}

/**
 * Avatar - User avatar display with smart fallbacks
 *
 * Features:
 * - Image with fallback to initials
 * - Initials calculated from name (first + last initial)
 * - Status indicator dot
 * - Loading state
 * - Multiple sizes and shapes
 * - Accessible with proper alt text
 *
 * @example
 * ```tsx
 * // With image
 * <Avatar src={user.photoURL} name={user.displayName} size="md" />
 *
 * // With initials fallback
 * <Avatar name="John Doe" size="lg" status="online" />
 *
 * // Custom fallback
 * <Avatar fallback={<User className="h-4 w-4" />} size="sm" />
 * ```
 */
export function Avatar({
  src,
  alt,
  name,
  size = "md",
  shape = "circle",
  fallback,
  status,
  className,
  border = false,
  loading = false,
  priority = false,
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  // Calculate initials from name
  const getInitials = (): string => {
    if (!name) return "?";

    const parts = name.trim().split(" ");
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    // Take first letter of first word and first letter of last word
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  };

  // Size mappings for image dimensions
  const sizeMap = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
    "2xl": 80,
  };

  // Status dot size mappings
  const statusSizeMap = {
    xs: "h-1.5 w-1.5",
    sm: "h-2 w-2",
    md: "h-2.5 w-2.5",
    lg: "h-3 w-3",
    xl: "h-4 w-4",
    "2xl": "h-5 w-5",
  };

  // Status colors
  const statusColors = {
    online: "bg-green-500",
    offline: "bg-gray-400",
    busy: "bg-red-500",
    away: "bg-yellow-500",
  };

  // Shape class
  const shapeClass = {
    circle: "rounded-full",
    square: "rounded-none",
    rounded: "rounded-xl",
  };

  const hasImage = src && !imageError;
  const showFallback = !hasImage;

  return (
    <div className={clsx("relative inline-flex shrink-0", className)}>
      <div
        className={clsx(
          avatarVariants({ size, border }),
          shapeClass[shape],
          "select-none overflow-hidden",
          loading && "animate-pulse"
        )}
        role="img"
        aria-label={alt || name || "Avatar"}
      >
        {hasImage ? (
          <Image
            src={src}
            alt={alt || name || "User avatar"}
            width={sizeMap[size]}
            height={sizeMap[size]}
            className={clsx(
              "h-full w-full object-cover transition-opacity duration-200",
              loading && "opacity-0"
            )}
            onError={() => setImageError(true)}
            priority={priority}
            unoptimized={src.startsWith("http")} // For external images
          />
        ) : (
          <div
            className={clsx(
              "flex h-full w-full items-center justify-center font-semibold text-foreground",
              // Glassmorphism fallback background
              !fallback && "bg-gradient-to-br from-[rgb(var(--color-accent-500))] to-[rgb(var(--color-accent-600))]"
            )}
          >
            {fallback || getInitials()}
          </div>
        )}
      </div>

      {/* Status indicator */}
      {status && (
        <span
          className={clsx(
            "absolute bottom-0 right-0 rounded-full border-2 border-[rgb(var(--color-surface-card))]",
            statusSizeMap[size],
            statusColors[status]
          )}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
}
